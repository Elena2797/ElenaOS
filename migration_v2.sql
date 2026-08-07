-- LIFEOS V2 migration — módulo Inventario VistaJet
-- Ejecutar en Supabase SQL editor
-- No modifica ninguna tabla existente

-- ─── Sesiones de inventario ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vj_inventory_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aircraft_registration TEXT NOT NULL,
  aircraft_type TEXT NOT NULL DEFAULT 'CL350',
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'open',
  source_filename TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- ─── Ítems de cada sesión ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vj_inventory_session_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES vj_inventory_sessions(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  std_qty NUMERIC DEFAULT 0,
  received_qty NUMERIC DEFAULT 0,
  current_qty NUMERIC DEFAULT 0,
  req_qty NUMERIC DEFAULT 0,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  discrepancy BOOLEAN NOT NULL DEFAULT FALSE,
  source TEXT NOT NULL DEFAULT 'excel',
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Chat de inventario por sesión ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vj_inventory_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES vj_inventory_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  intent TEXT,
  resolved_item_id UUID REFERENCES vj_inventory_session_items(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Desactivar RLS ───────────────────────────────────────────────────────────
ALTER TABLE vj_inventory_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE vj_inventory_session_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE vj_inventory_chat DISABLE ROW LEVEL SECURITY;

-- ─── Índices ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_inv_sessions_status ON vj_inventory_sessions(status);
CREATE INDEX IF NOT EXISTS idx_inv_items_session_id ON vj_inventory_session_items(session_id);
CREATE INDEX IF NOT EXISTS idx_inv_items_verified ON vj_inventory_session_items(session_id, verified);
CREATE INDEX IF NOT EXISTS idx_inv_chat_session_id ON vj_inventory_chat(session_id);
