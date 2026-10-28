-- ==============================================================================
-- Schema do Banco de Dados Supabase - Winback Engine (MVP Automação de Representação)
-- ==============================================================================
-- Este arquivo documenta e provisiona toda a estrutura necessária para o sistema:
-- 1. Tabelas fundamentais (clients, orders, reactivation_logs)
-- 2. Índices de performance
-- 3. Views analíticas consumidas pelo Dashboard Next.js (v_inactive_clients, v_winback_metrics)
-- 4. Políticas de RLS (Row Level Security)
-- ==============================================================================

-- 1. Extensões
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABELAS
-- ==============================================================================

-- 2.1 Tabela de Clientes
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    cnpj TEXT,
    city TEXT,
    state VARCHAR(2),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Para isolamento multi-tenant
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.clients IS 'Base de clientes cadastrados pelo representante comercial.';
COMMENT ON COLUMN public.clients.phone IS 'Telefone formatado com DDI (ex: 5511999999999) para envio no WhatsApp.';

-- 2.2 Tabela de Pedidos / Compras
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    order_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.orders IS 'Histórico de compras e pedidos dos clientes para cálculo de inatividade e conversão.';

-- 2.3 Tabela de Logs de Reativação
CREATE TABLE IF NOT EXISTS public.reactivation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    message_sent TEXT NOT NULL DEFAULT 'Disparo via painel Web',
    sent_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    status TEXT NOT NULL DEFAULT 'enviado', -- 'enviado', 'entregue', 'respondido', 'falha'
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.reactivation_logs IS 'Registro histórico de mensagens de WhatsApp disparadas para os clientes.';

-- ==============================================================================
-- 3. ÍNDICES DE PERFORMANCE
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_clients_phone ON public.clients (phone);
CREATE INDEX IF NOT EXISTS idx_clients_state ON public.clients (state);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON public.orders (client_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON public.orders (order_date DESC);
CREATE INDEX IF NOT EXISTS idx_reactivation_logs_client_id ON public.reactivation_logs (client_id);
CREATE INDEX IF NOT EXISTS idx_reactivation_logs_sent_at ON public.reactivation_logs (sent_at DESC);

-- ==============================================================================
-- 4. VIEWS ANALÍTICAS
-- ==============================================================================

-- 4.1 View: Clientes Inativos (Sem compras há mais de 30 dias ou sem compras registradas)
-- Consumida diretamente pelo Dashboard (tabela de inativos e contadores)
CREATE OR REPLACE VIEW public.v_inactive_clients AS
SELECT 
    c.id,
    c.name,
    c.phone,
    c.cnpj,
    c.city,
    c.state,
    c.user_id,
    MAX(o.order_date) AS last_visit
FROM public.clients c
LEFT JOIN public.orders o ON o.client_id = c.id
GROUP BY c.id, c.name, c.phone, c.cnpj, c.city, c.state, c.user_id
HAVING MAX(o.order_date) IS NULL 
    OR MAX(o.order_date) < (timezone('utc'::text, now()) - INTERVAL '30 days')
ORDER BY last_visit ASC NULLS FIRST;

COMMENT ON VIEW public.v_inactive_clients IS 'Lista de clientes cuja última compra foi há mais de 30 dias ou inexistente.';

-- 4.2 View: Métricas Globais de Reativação (Winback Metrics)
-- Consumida pelo card de inteligência comercial do Dashboard
CREATE OR REPLACE VIEW public.v_winback_metrics AS
WITH stats AS (
    SELECT 
        COUNT(r.id) AS total_disparos,
        COUNT(CASE WHEN r.status = 'respondido' THEN 1 END) AS total_respostas,
        -- Conversões: clientes que realizaram pedido com data após o envio da mensagem
        COUNT(DISTINCT CASE 
            WHEN o.order_date > r.sent_at AND o.total_amount > 0 THEN r.client_id 
        END) AS clientes_convertidos,
        -- Receita total de pedidos efetuados após a reativação
        COALESCE(SUM(CASE 
            WHEN o.order_date > r.sent_at THEN o.total_amount 
            ELSE 0 
        END), 0) AS receita_resgatada
    FROM public.reactivation_logs r
    LEFT JOIN public.orders o ON o.client_id = r.client_id
)
SELECT 
    s.total_disparos,
    CASE 
        WHEN s.total_disparos > 0 
        THEN ROUND((s.total_respostas::numeric / s.total_disparos::numeric) * 100, 1)
        ELSE 0 
    END AS taxa_resposta,
    CASE 
        WHEN s.total_disparos > 0 
        THEN ROUND((s.clientes_convertidos::numeric / s.total_disparos::numeric) * 100, 1)
        ELSE 0 
    END AS taxa_conversao,
    s.receita_resgatada
FROM stats s;

COMMENT ON VIEW public.v_winback_metrics IS 'Métricas agregadas de disparos, taxas de resposta/conversão e receita resgatada.';

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactivation_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para isolamento por usuário (Multi-Tenancy)
-- Leitura: usuário vê clientes da sua própria conta (ou legado sem dono)
CREATE POLICY "Permitir leitura de clientes da sua carteira" 
    ON public.clients FOR SELECT TO authenticated 
    USING (auth.uid() = user_id OR user_id IS NULL);

-- Inserção: usuário só pode cadastrar vinculando ao seu próprio auth.uid()
CREATE POLICY "Permitir cadastro de clientes vinculados ao usuario" 
    ON public.clients FOR INSERT TO authenticated 
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Atualização: usuário só pode editar clientes da sua conta
CREATE POLICY "Permitir atualizacao apenas dos proprios clientes" 
    ON public.clients FOR UPDATE TO authenticated 
    USING (auth.uid() = user_id OR user_id IS NULL);

-- Deleção: usuário só pode remover clientes da sua conta
CREATE POLICY "Permitir delecao apenas dos proprios clientes" 
    ON public.clients FOR DELETE TO authenticated 
    USING (auth.uid() = user_id OR user_id IS NULL);

-- Pedidos vinculados aos clientes do usuário
CREATE POLICY "Permitir operacoes em orders para clientes do usuario" 
    ON public.orders FOR ALL TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.clients c 
            WHERE c.id = orders.client_id 
              AND (c.user_id = auth.uid() OR c.user_id IS NULL)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.clients c 
            WHERE c.id = orders.client_id 
              AND (c.user_id = auth.uid() OR c.user_id IS NULL)
        )
    );

-- Logs de Reativação vinculados aos clientes do usuário
CREATE POLICY "Permitir operacoes em logs para clientes do usuario" 
    ON public.reactivation_logs FOR ALL TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.clients c 
            WHERE c.id = reactivation_logs.client_id 
              AND (c.user_id = auth.uid() OR c.user_id IS NULL)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.clients c 
            WHERE c.id = reactivation_logs.client_id 
              AND (c.user_id = auth.uid() OR c.user_id IS NULL)
        )
    );

