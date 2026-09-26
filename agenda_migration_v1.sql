-- ═══════════════════════════════════════════════════════════════════════════
-- Agenda de vuelos (2026-09-26). Lo que Isabel lee de las fotos de su horario
-- (lista "Select Flight" y calendario) vive aquí, por avión, y se ve en LIFEOS.
--
-- ADITIVA: tabla nueva, no toca nada existente.
-- kind 'flight' = un vuelo; kind 'rot' = día de rotación sin vuelos definidos aún.
-- Las horas se guardan en UTC; la hora LOCAL se calcula con dep_tz/arr_tz (IANA).
-- Un mismo vuelo leído de las dos fotos se une por (avión, origen, destino, salida UTC).
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS vj_flights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tail_number text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('flight','rot')),
  day date NOT NULL,                 -- día de la salida en hora local (o el día ROT)
  dep_icao text,
  arr_icao text,
  dep_utc timestamptz,
  arr_utc timestamptz,
  dep_tz text,                       -- p. ej. Europe/Rome
  arr_tz text,
  pax integer,
  tags text[] NOT NULL DEFAULT '{}', -- OPEN, FERRY, UPDATED, NEW FLIGHT…
  flight_ref text,                   -- nº de vuelo de la lista (14259191)
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (kind <> 'flight' OR (dep_icao IS NOT NULL AND arr_icao IS NOT NULL AND dep_utc IS NOT NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS vj_flights_flight_uq
  ON vj_flights (tail_number, dep_icao, arr_icao, dep_utc) WHERE kind = 'flight';
CREATE UNIQUE INDEX IF NOT EXISTS vj_flights_rot_uq
  ON vj_flights (tail_number, day) WHERE kind = 'rot';
CREATE INDEX IF NOT EXISTS vj_flights_day_idx ON vj_flights (day);
ALTER TABLE vj_flights ENABLE ROW LEVEL SECURITY;
-- Sin políticas: solo la clave de servicio (isabel-api) accede; la app lee por /v1/app/agenda (D62).
