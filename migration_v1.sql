-- LIFEOS V1 migration
-- Run in Supabase SQL editor

-- ─── Proyectos ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  area_id UUID REFERENCES areas(id) ON DELETE SET NULL,
  objetivo TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  next_action TEXT,
  ia_context TEXT,
  ia_last_session TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Eventos (contribuciones IA + audit log) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  area_id UUID REFERENCES areas(id) ON DELETE SET NULL,
  origen TEXT NOT NULL DEFAULT 'manual',
  texto TEXT NOT NULL,
  herramienta TEXT,
  resumen TEXT,
  resultado_ubicacion TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Alertas ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  texto TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'manual',
  urgencia TEXT NOT NULL DEFAULT 'media',
  area_id UUID REFERENCES areas(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Columnas nuevas en tablas existentes ─────────────────────────────────────
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
ALTER TABLE areas ADD COLUMN IF NOT EXISTS ia_context TEXT;

-- ─── Índices ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_projects_area_id ON projects(area_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_eventos_project_id ON eventos(project_id);
CREATE INDEX IF NOT EXISTS idx_alertas_area_id ON alertas(area_id);
CREATE INDEX IF NOT EXISTS idx_alertas_status ON alertas(status);
