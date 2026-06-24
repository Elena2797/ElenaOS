-- LIFE OS — Base de datos
-- Pega este SQL en el editor de Supabase y ejecútalo

-- Contexto de vida (estado actual)
CREATE TABLE IF NOT EXISTS life_context (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  mode text DEFAULT 'OFF',
  energy_level text DEFAULT 'medium',
  main_constraint text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

INSERT INTO life_context (mode, energy_level, main_constraint)
VALUES ('OFF', 'medium', 'Último día de OFF antes de entrar en ON');

-- Áreas
CREATE TABLE IF NOT EXISTS areas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  color text DEFAULT '#888',
  sort_order int DEFAULT 0,
  status text DEFAULT 'active'
);

INSERT INTO areas (name, color, sort_order) VALUES
  ('VistaJet',      '#854F0B', 1),
  ('JETMI',         '#534AB7', 2),
  ('Finanzas',      '#185FA5', 3),
  ('Salud',         '#0F6E56', 4),
  ('Gym',           '#3B6D11', 5),
  ('Marca Personal','#993556', 6),
  ('Vida Personal', '#993C1D', 7);

-- Tareas
CREATE TABLE IF NOT EXISTS tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  area_id uuid REFERENCES areas(id) ON DELETE SET NULL,
  status text DEFAULT 'pending',
  priority text DEFAULT 'medium',
  energy_required text DEFAULT 'medium',
  suitable_modes text[] DEFAULT ARRAY['ON','OFF'],
  due_date date,
  horizon text DEFAULT 'this_week',
  source text DEFAULT 'human',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Waiting For
CREATE TABLE IF NOT EXISTS waiting_for (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  area_id uuid REFERENCES areas(id) ON DELETE SET NULL,
  waiting_on text NOT NULL,
  since_date date DEFAULT CURRENT_DATE,
  follow_up_date date,
  urgency text DEFAULT 'medium',
  status text DEFAULT 'active',
  context text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Decisiones
CREATE TABLE IF NOT EXISTS decisions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  area_id uuid REFERENCES areas(id) ON DELETE SET NULL,
  stakes text DEFAULT 'medium',
  status text DEFAULT 'open',
  context text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Desactivar RLS (app personal, una sola usuaria)
ALTER TABLE life_context DISABLE ROW LEVEL SECURITY;
ALTER TABLE areas DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE waiting_for DISABLE ROW LEVEL SECURITY;
ALTER TABLE decisions DISABLE ROW LEVEL SECURITY;

-- Datos iniciales de Estefanía
INSERT INTO tasks (title, status, priority, horizon, suitable_modes) VALUES
  ('Declaración de la renta en ogasun.eus', 'avoiding', 'critical', 'today', ARRAY['ON','OFF']),
  ('Recoger pasaporte (día 25 de junio)', 'pending', 'critical', 'today', ARRAY['ON','OFF']),
  ('Physical Felgueiras — confirmar baja por WhatsApp', 'pending', 'medium', 'today', ARRAY['ON','OFF']),
  ('E-learnings VistaJet — vencidos', 'avoiding', 'high', 'this_week', ARRAY['ON','OFF']);

INSERT INTO waiting_for (title, waiting_on, urgency, context) VALUES
  ('Respuesta HR VistaJet sobre proceso Chubb Insurance', 'HR VistaJet', 'medium', 'Facturas devueltas por Chubb. Preguntar si hay proceso interno o se gestiona directamente.');

INSERT INTO decisions (title, stakes, context) VALUES
  ('¿Gestionar Chubb directamente o a través de HR de VistaJet?', 'low', 'Las facturas han sido devueltas. HR podría tener un proceso interno o saber cómo hacerlo.'),
  ('¿Reescribir home de JETMI sola o con un diseñador?', 'medium', 'El problema: el usuario no entiende en 10 segundos qué es JETMI. La home falla en eso.');
