'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { importClients, ImportClientData } from '@/app/actions/clients'
import { UploadCloud, FileSpreadsheet, Download, CheckCircle2, AlertCircle, Loader2, Users } from 'lucide-react'

interface ImportClientsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ImportClientsModal({ open, onOpenChange, onSuccess }: ImportClientsModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [parsedClients, setParsedClients] = useState<ImportClientData[]>([])
  const [fileName, setFileName] = useState<string | null>(null)

  const parseCSV = (content: string) => {
    const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0)
    if (lines.length <= 1) {
      setError('O arquivo CSV parece estar vazio ou não tem dados além do cabeçalho.')
      setParsedClients([])
      return
    }

    // Identifica separador (vírgula ou ponto-e-vírgula)
    const headerLine = lines[0]
    const separator = headerLine.includes(';') ? ';' : ','
    const headers = headerLine.split(separator).map((h) => h.trim().toLowerCase().replace(/["']/g, ''))

    const nameIdx = headers.findIndex((h) => h.includes('nome') || h.includes('name') || h.includes('cliente'))
    const phoneIdx = headers.findIndex((h) => h.includes('tel') || h.includes('fone') || h.includes('whatsapp') || h.includes('phone'))
    const cnpjIdx = headers.findIndex((h) => h.includes('cnpj') || h.includes('documento'))
    const cityIdx = headers.findIndex((h) => h.includes('cidade') || h.includes('city') || h.includes('municipio'))
    const stateIdx = headers.findIndex((h) => h.includes('uf') || h.includes('estado') || h.includes('state'))
    const visitIdx = headers.findIndex((h) => h.includes('compra') || h.includes('visita') || h.includes('data'))

    if (nameIdx === -1 || phoneIdx === -1) {
      setError('Cabeçalho inválido: as colunas "Nome" e "Telefone" são obrigatórias.')
      setParsedClients([])
      return
    }

    const items: ImportClientData[] = []

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(separator).map((p) => p.trim().replace(/^["']|["']$/g, ''))
      if (!parts[nameIdx] || !parts[phoneIdx]) continue

      items.push({
        name: parts[nameIdx],
        phone: parts[phoneIdx],
        cnpj: cnpjIdx !== -1 ? parts[cnpjIdx] : undefined,
        city: cityIdx !== -1 ? parts[cityIdx] : undefined,
        state: stateIdx !== -1 ? parts[stateIdx]?.slice(0, 2)?.toUpperCase() : undefined,
        lastVisit: visitIdx !== -1 && parts[visitIdx] ? parts[visitIdx] : undefined,
      })
    }

    if (items.length === 0) {
      setError('Nenhum registro válido com Nome e Telefone foi encontrado nas linhas do arquivo.')
      setParsedClients([])
    } else {
      setError(null)
      setParsedClients(items)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    setSuccess(null)
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (evt) => {
      const text = evt.target?.result as string
      if (text) {
        parseCSV(text)
      }
    }
    reader.readAsText(file)
  }

  const handleDownloadSample = () => {
    const csvContent =
      'nome;telefone;cnpj;cidade;estado;ultima_compra\n' +
      'Farmácia Central;11999887766;12345678000199;São Paulo;SP;2026-06-15\n' +
      'Mercado do Bairro;21988776655;98765432000188;Rio de Janeiro;RJ;2026-07-20\n' +
      'Drogaria Boa Saúde;31977665544;;Belo Horizonte;MG;2026-08-01\n'

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'modelo_importacao_clientes.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleConfirmImport = async () => {
    if (parsedClients.length === 0) return
    setLoading(true)
    setError(null)

    const res = await importClients(parsedClients)
    setLoading(false)

    if (res.error) {
      setError(res.error)
    } else {
      setSuccess(res.message || 'Importação realizada com sucesso!')
      setTimeout(() => {
        onOpenChange(false)
        setParsedClients([])
        setFileName(null)
        setSuccess(null)
        if (onSuccess) onSuccess()
      }, 1500)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] border-white/[0.1] bg-[#111215] text-foreground shadow-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              Importar Carteira de Clientes (CSV)
            </DialogTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadSample}
              className="text-xs border-white/10 bg-white/5 hover:bg-white/10 gap-1.5 cursor-pointer text-muted-foreground hover:text-white"
            >
              <Download className="w-3.5 h-3.5" />
              Baixar Modelo
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2 overflow-y-auto pr-1 flex-1">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Upload Area */}
          <label className="border-2 border-dashed border-white/15 hover:border-primary/50 transition-all rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-white/[0.02] group">
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
              disabled={loading || !!success}
            />
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-white">
              {fileName ? fileName : 'Clique para selecionar o arquivo .CSV da sua planilha'}
            </p>
            <p className="text-xs text-muted-foreground mt-1 text-center">
              Separadores aceitos: ponto-e-vírgula (;) ou vírgula (,). Colunas: Nome, Telefone, CNPJ, Cidade, UF, Data da Última Compra.
            </p>
          </label>

          {/* Preview Table */}
          {parsedClients.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-primary" />
                  {parsedClients.length} clientes prontos para importação
                </span>
                <span>(Mostrando primeiros 5 para conferência)</span>
              </div>

              <div className="border border-white/10 rounded-lg overflow-hidden bg-black/30">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-xs">Nome</TableHead>
                      <TableHead className="text-xs">Telefone</TableHead>
                      <TableHead className="text-xs">Cidade/UF</TableHead>
                      <TableHead className="text-xs">Última Compra</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedClients.slice(0, 5).map((c, i) => (
                      <TableRow key={i} className="border-white/5 text-xs">
                        <TableCell className="font-medium text-white">{c.name}</TableCell>
                        <TableCell className="font-mono text-muted-foreground">{c.phone}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {c.city ? `${c.city}${c.state ? ` - ${c.state}` : ''}` : '-'}
                        </TableCell>
                        <TableCell className="font-mono text-muted-foreground">{c.lastVisit || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 border-t border-white/5 gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="hover:bg-white/5"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirmImport}
            disabled={loading || parsedClients.length === 0 || !!success}
            className="bg-[#F4F4F5] hover:bg-white text-[#0C0D0F] font-medium cursor-pointer active:scale-[0.985] transition-all"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Importando clientes...</span>
              </div>
            ) : (
              `Confirmar Importação (${parsedClients.length})`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
