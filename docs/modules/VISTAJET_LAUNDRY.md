Estado: implementado mínimo
Última verificación: 2026-07-10
Verificado en: grep de vj_laundry_* en life-os-app/src/main.js
Fuente de verdad de datos: ninguna (localStorage, no Supabase)

# modules/VISTAJET_LAUNDRY.md

# Objetivo
Registrar la lavandería preparada para offload durante la rotación.

# Estado real
Checklist simple, sin backend. No cumple el patrón "Supabase = fuente de verdad" que sí siguen Inventario y HOTO.

# Qué funciona
Contador de piezas por tipo (`vjLaundryView()`), guardado en `localStorage` (`vj_laundry_items`, `vj_laundry_date`), con reset manual.

# Qué está parcialmente implementado
Nada — es binario: existe el contador local, no existe nada más.

# Qué no existe todavía
- Persistencia en Supabase.
- Cualquier conexión con HOTO (el campo "Laundry Offloaded" del checklist de Daily Duties es independiente de este módulo).
- Cualquier exportación o reporte.

# Modelo de datos
Ninguno en Supabase. Solo `localStorage`, claves `vj_laundry_items` (JSON) y `vj_laundry_date`.

# Flujos de usuario
Incrementar/decrementar contador por tipo de prenda; reset manual.

# Backend/endpoints
Ninguno.

# Frontend/vistas
`life-os-app/src/main.js`: `vjLaundryView()`.

# Archivos relevantes
`life-os-app/src/main.js` (funciones `updateLaundryItem`, `resetLaundry`).

# Verificaciones empíricas
Ninguna realizada — módulo trivial, sin lógica que verificar.

# Bugs conocidos
Al no persistir en Supabase, se pierde si se limpia el navegador o se cambia de dispositivo — mismo patrón de riesgo que tuvo el checklist de HOTO antes de conectarse (ver D5 en DECISIONS.md).

# Decisiones cerradas
Ninguna registrada específicamente para este módulo.

# Fuera de alcance actual
Todo lo que no sea el contador básico.

# Próximo hito
Ninguno decidido. Candidato natural a recibir el mismo tratamiento que el checklist de HOTO (persistencia en Supabase) si se vuelve prioritario.
