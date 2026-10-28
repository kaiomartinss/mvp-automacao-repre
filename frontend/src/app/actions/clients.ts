'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addClient(formData: FormData) {
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const cnpj = (formData.get('cnpj') as string) || ''
  const city = (formData.get('city') as string) || ''
  const state = (formData.get('state') as string) || ''
  const lastVisit = (formData.get('lastVisit') as string) || new Date().toISOString().split('T')[0]

  if (!name || !phone) {
    return { error: 'Nome e Telefone são obrigatórios.' }
  }

  // Formata o telefone apenas com números e código do Brasil se necessário
  let cleanPhone = phone.replace(/\D/g, '')
  if (cleanPhone.length === 11 || cleanPhone.length === 10) {
    cleanPhone = '55' + cleanPhone
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Inserção na tabela clients com isolamento por usuário e fallback se coluna não existir
  const clientPayload: Record<string, any> = {
    name,
    phone: cleanPhone,
    cnpj,
    city,
    state: state.toUpperCase(),
  }
  if (user) {
    clientPayload.user_id = user.id
  }

  let { data: newClient, error: clientError } = await supabase
    .from('clients')
    .insert([clientPayload])
    .select('id')
    .single()

  // Se o schema do Supabase ainda não tiver a coluna user_id, insere sem ela
  if (clientError && clientError.message.includes('user_id')) {
    delete clientPayload.user_id
    const retry = await supabase
      .from('clients')
      .insert([clientPayload])
      .select('id')
      .single()
    newClient = retry.data
    clientError = retry.error
  }

  if (clientError) {
    return { error: `Erro ao cadastrar cliente: ${clientError.message}` }
  }

  // Registra pedido inicial para marcar a última compra / visita
  if (newClient?.id && lastVisit) {
    const { error: orderError } = await supabase.from('orders').insert([
      {
        client_id: newClient.id,
        total_amount: 0,
        order_date: new Date(lastVisit).toISOString(),
      },
    ])

    if (orderError) {
      console.warn('Erro ao inserir pedido inicial:', orderError)
    }
  }

  revalidatePath('/clientes')
  revalidatePath('/')
  return { success: true, message: 'Cliente cadastrado com sucesso!' }
}

export async function updateClient(formData: FormData) {
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const cnpj = (formData.get('cnpj') as string) || ''
  const city = (formData.get('city') as string) || ''
  const state = (formData.get('state') as string) || ''

  if (!id || !name || !phone) {
    return { error: 'ID, Nome e Telefone são obrigatórios.' }
  }

  let cleanPhone = phone.replace(/\D/g, '')
  if (cleanPhone.length === 11 || cleanPhone.length === 10) {
    cleanPhone = '55' + cleanPhone
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const updatePayload: Record<string, any> = {
    name,
    phone: cleanPhone,
    cnpj,
    city,
    state: state.toUpperCase(),
  }

  let updateQuery = supabase
    .from('clients')
    .update(updatePayload)
    .eq('id', id)

  if (user) {
    updateQuery = updateQuery.or(`user_id.eq.${user.id},user_id.is.null`)
  }

  let { error } = await updateQuery

  // Fallback se user_id não existir na tabela
  if (error && error.message.includes('user_id')) {
    const retry = await supabase
      .from('clients')
      .update(updatePayload)
      .eq('id', id)
    error = retry.error
  }

  if (error) {
    return { error: `Erro ao atualizar cliente: ${error.message}` }
  }

  revalidatePath('/clientes')
  revalidatePath('/')
  return { success: true, message: 'Cliente atualizado com sucesso!' }
}

export async function deleteClient(clientId: string) {
  if (!clientId) {
    return { error: 'ID do cliente inválido.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Deleta pedidos relacionados antes se não houver cascade
  await supabase.from('orders').delete().eq('client_id', clientId)

  let deleteQuery = supabase.from('clients').delete().eq('id', clientId)
  if (user) {
    deleteQuery = deleteQuery.or(`user_id.eq.${user.id},user_id.is.null`)
  }

  let { error } = await deleteQuery

  // Fallback se user_id não existir na tabela
  if (error && error.message.includes('user_id')) {
    const retry = await supabase.from('clients').delete().eq('id', clientId)
    error = retry.error
  }

  if (error) {
    return { error: `Erro ao excluir cliente: ${error.message}` }
  }

  revalidatePath('/clientes')
  revalidatePath('/')
  return { success: true, message: 'Cliente removido com sucesso!' }
}

export async function addOrder(formData: FormData) {
  const clientId = formData.get('clientId') as string
  const amountStr = formData.get('amount') as string
  const orderDateStr = (formData.get('orderDate') as string) || new Date().toISOString().split('T')[0]

  if (!clientId) {
    return { error: 'Cliente não especificado.' }
  }

  const amount = parseFloat(amountStr?.replace(',', '.') || '0')
  if (isNaN(amount) || amount < 0) {
    return { error: 'Por favor, informe um valor de venda válido.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.from('orders').insert([
    {
      client_id: clientId,
      total_amount: amount,
      order_date: new Date(orderDateStr).toISOString(),
    },
  ])

  if (error) {
    return { error: `Erro ao registrar pedido: ${error.message}` }
  }

  revalidatePath('/clientes')
  revalidatePath('/')
  return { success: true, message: `Venda de R$ ${amount.toFixed(2)} registrada! O cliente foi atualizado como ativo.` }
}

export interface ImportClientData {
  name: string
  phone: string
  cnpj?: string
  city?: string
  state?: string
  lastVisit?: string
}

export async function importClients(clientsToImport: ImportClientData[]) {
  if (!clientsToImport || clientsToImport.length === 0) {
    return { error: 'Nenhum cliente válido para importar.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let successCount = 0
  let errorCount = 0

  for (const item of clientsToImport) {
    if (!item.name || !item.phone) {
      errorCount++
      continue
    }

    let cleanPhone = item.phone.replace(/\D/g, '')
    if (cleanPhone.length === 11 || cleanPhone.length === 10) {
      cleanPhone = '55' + cleanPhone
    }

    const importPayload: Record<string, any> = {
      name: item.name.trim(),
      phone: cleanPhone,
      cnpj: item.cnpj?.trim() || null,
      city: item.city?.trim() || null,
      state: item.state?.trim()?.toUpperCase() || null,
    }
    if (user) {
      importPayload.user_id = user.id
    }

    let { data: newClient, error: clientErr } = await supabase
      .from('clients')
      .insert([importPayload])
      .select('id')
      .single()

    if (clientErr && clientErr.message.includes('user_id')) {
      delete importPayload.user_id
      const fallback = await supabase
        .from('clients')
        .insert([importPayload])
        .select('id')
        .single()
      newClient = fallback.data
      clientErr = fallback.error
    }

    if (clientErr || !newClient?.id) {
      errorCount++
      continue
    }

    successCount++

    if (item.lastVisit) {
      await supabase.from('orders').insert([
        {
          client_id: newClient.id,
          total_amount: 0,
          order_date: new Date(item.lastVisit).toISOString(),
        },
      ])
    }
  }

  revalidatePath('/clientes')
  revalidatePath('/')

  return {
    success: true,
    message: `${successCount} clientes importados com sucesso!${errorCount > 0 ? ` (${errorCount} registros ignorados por dados incompletos).` : ''}`,
    count: successCount,
  }
}

