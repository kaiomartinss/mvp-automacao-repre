'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { importClients, ImportClientData } from '@/app/actions/clients'
import {
  CloudArrowUp,
  FileCsv,
  DownloadSimple,
  CheckCircle,
  WarningCircle,
  CircleNotch,
  Users,
} from '@phosphor-icons/react'

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
      setSuccess(res.message || 'Importação realizada com sucesso.')
      setTimeout(() => {
        onOpenChange(false)
        setParsedClients([])
        setFileName(null)
        setSuccess(null)
        if (onSuccess) onSuccess()
      }, 1400)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8 gap-3">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <FileCsv className="w-4 h-4 text-zinc-300" weight="regular" />
                Importar carteira (CSV)
              </DialogTitle>
              <DialogDescription className="mt-1">
                Envie sua planilha com ponto-e-vírgula (;) ou vírgula (,).
              </DialogDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadSample}
              className="text-xs border-white/12 bg-white/[0.03] hover:bg-white/[0.07] gap-1.5 cursor-pointer text-zinc-300 hover:text-[#F4F4F5] shrink-0"
            >
              <DownloadSimple className="w-3.5 h-3.5" weight="regular" />
              Modelo CSV
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto pr-1 flex-1">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 text-xs">
              <WarningCircle className="w-4 h-4 shrink-0" weight="regular" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-medium">
              <CheckCircle className="w-4 h-4 shrink-0" weight="fill" />
              <span>{success}</span>
            </div>
          )}

          {/* Upload Area */}
          <label className="border border-dashed border-white/15 hover:border-white/35 transition-colors rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-[#0C0D0F] group">
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
              disabled={loading || !!success}
            />
            <div className="w-10 h-10 rounded-lg border border-white/10 bg-white/[0.04] flex items-center justify-center mb-3 transition-transform group-hover:-translate-y-0.5">
              <CloudArrowUp className="w-5 h-5 text-zinc-200" weight="regular" />
            </div>
            <p className="text-sm font-medium text-[#F4F4F5]">
              {fileName ? fileName : 'Selecionar arquivo .CSV'}
            </p>
            <p className="text-xs text-zinc-500 mt-1 text-center">
              Colunas suportadas: Nome, Telefone, CNPJ, Cidade, UF, Data da última compra.
            </p>
          </label>

          {/* Preview Table */}
          {parsedClients.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-medium text-[#F4F4F5] flex items-center gap-1.5 font-mono tabular-nums">
                  <Users className="w-3.5 h-3.5 text-zinc-400" weight="regular" />
                  {parsedClients.length} registros prontos
                </span>
                <span className="text-zinc-500">Prévia dos primeiros 5</span>
              </div>

              <div className="border border-white/[0.08] rounded-lg overflow-hidden bg-[#0C0D0F]">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Nome</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Cidade / UF</TableHead>
                      <TableHead>Última compra</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedClients.slice(0, 5).map((c, i) => (
                      <TableRow key={i} className="text-xs">
                        <TableCell className="font-medium text-[#F4F4F5]">{c.name}</TableCell>
                        <TableCell className="font-mono text-zinc-400 tabular-nums">{c.phone}</TableCell>
                        <TableCell className="text-zinc-400">
                          {c.city ? `${c.city}${c.state ? ` - ${c.state}` : ''}` : '-'}
                        </TableCell>
                        <TableCell className="font-mono text-zinc-400 tabular-nums">
                          {c.lastVisit || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="text-zinc-300 hover:bg-white/5 cursor-pointer"
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
              <span className="inline-flex items-center gap-2">
                <CircleNotch className="w-4 h-4 animate-spin" weight="bold" />
                Importando...
              </span>
            ) : (
              `Importar (${parsedClients.length})`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
