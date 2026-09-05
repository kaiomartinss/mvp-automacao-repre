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

  // Inserção na tabela clients
  const { data: newClient, error: clientError } = await supabase
    .from('clients')
    .insert([
      {
        name,
        phone: cleanPhone,
        cnpj,
        city,
        state: state.toUpperCase(),
      },
    ])
    .select('id')
    .single()

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

  const { error } = await supabase
    .from('clients')
    .update({
      name,
      phone: cleanPhone,
      cnpj,
      city,
      state: state.toUpperCase(),
    })
    .eq('id', id)

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

  // Deleta pedidos relacionados antes se não houver cascade
  await supabase.from('orders').delete().eq('client_id', clientId)

  const { error } = await supabase.from('clients').delete().eq('id', clientId)

  if (error) {
    return { error: `Erro ao excluir cliente: ${error.message}` }
  }

  revalidatePath('/clientes')
  revalidatePath('/')
  return { success: true, message: 'Cliente removido com sucesso!' }
}
