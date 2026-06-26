# Sprint 1 — Checklist funcional

Ejecutar después de cada tarea. Ninguna tarea está terminada hasta que todos los ítems que eran ✓ siguen siendo ✓.

## Estado del proyecto al inicio del Sprint

**Rama:** `sprint-1` (creada desde `main` limpio el 2026-06-26)  
**Commit base:** `d37763b` — Isabel: leer agent_url desde Supabase automáticamente  
**Archivo principal:** `index.html` — 1641 líneas  
**Archivos adicionales:** `manifest.json`, `setup.sql`, `api/chat.js`, `api/gmail-auth.js`, `api/gmail-callback.js`

---

## Estructura actual (antes del Sprint)

```
life-os-app/
├── index.html          ← 1641 líneas: HTML + CSS + JS + lógica de negocio todo junto
├── manifest.json       ← configuración PWA
├── setup.sql           ← schema de referencia (no se ejecuta automáticamente)
└── api/
    ├── chat.js         ← endpoint Vercel para chat (estado desconocido)
    ├── gmail-auth.js   ← integración Gmail (no implementada aún)
    └── gmail-callback.js
```

**40 llamadas `.from()` a Supabase** dispersas en `index.html`.  
**1 llamada `fetch()`** al bridge de Isabel (línea ~1380).  
**Claves de API hardcodeadas** en `index.html` (líneas ~207–213).

---

## Checklist funcional

- ✓ funciona correctamente  
- ✗ no funciona  
- ⚠ funciona con limitaciones conocidas o no verificado completamente  

---

### App general

| # | Verificación | Estado | Notas |
|---|-------------|--------|-------|
| 1 | La app abre desde Vercel (producción) sin errores de consola | ✓ | Verificado manualmente |
| 2 | La app abre en local sin errores de consola | ✓ | Verificado manualmente |
| 3 | El PIN de acceso funciona | ✓ | Verificado manualmente |
| 4 | La pantalla de inicio (home) carga y muestra datos de Supabase | ✓ | Verificado manualmente |
| 5 | La navegación entre secciones funciona | ✓ | Verificado manualmente |
| 6 | El modo ON/OFF cambia al pulsarlo | ✓ | Verificado manualmente |
| 7 | El modo ON/OFF persiste al recargar la página | ✓ | Verificado manualmente |

---

### Supabase

| # | Verificación | Estado | Notas |
|---|-------------|--------|-------|
| 8 | La app conecta a Supabase correctamente | ✓ | Sin errores de red |
| 9 | Las tareas se leen correctamente desde Supabase | ✓ | Verificado manualmente |
| 10 | Crear una tarea nueva la guarda en Supabase | ✓ | Verificado manualmente |
| 11 | Completar una tarea actualiza su estado en Supabase | ✓ | Verificado manualmente |
| 12 | Los datos persisten entre sesiones | ⚠ | No verificado completamente en todos los tipos de dato |

---

### Check-in y Salud

| # | Verificación | Estado | Notas |
|---|-------------|--------|-------|
| 13 | El check-in matutino (sueño) se puede registrar | ✓ | Verificado manualmente |
| 14 | El check-in de dolor se puede registrar | ✓ | Verificado manualmente |
| 15 | El área de Salud carga datos correctamente | ✓ | Verificado manualmente |
| 16 | El historial de gym / sesiones se muestra | ✓ | Verificado manualmente |

---

### VistaJet

| # | Verificación | Estado | Notas |
|---|-------------|--------|-------|
| 17 | El área VistaJet carga el estado actual | ✓ | Verificado manualmente |
| 18 | El estado VJ (libre/rotación/standby) se puede cambiar | ✓ | Verificado manualmente |
| 19 | Las tareas VJ se muestran y se pueden completar | ✓ | Verificado manualmente |
| 20 | La checklist de maleta funciona | ✓ | Verificado manualmente |

---

### Finanzas

| # | Verificación | Estado | Notas |
|---|-------------|--------|-------|
| 21 | El área de Finanzas carga datos | ✓ | Verificado manualmente |
| 22 | Los presupuestos por categoría se muestran | ✓ | Verificado manualmente |

---

### JETMI

| # | Verificación | Estado | Notas |
|---|-------------|--------|-------|
| 23 | El área JETMI carga datos | ✓ | Verificado manualmente |
| 24 | Las tareas de JETMI se muestran | ✓ | Verificado manualmente |

---

### Isabel — App

| # | Verificación | Estado | Notas |
|---|-------------|--------|-------|
| 25 | El chat de Isabel abre en la app | ✓ | Verificado manualmente |
| 26 | Isabel responde mensajes desde la app | ⚠ | Depende de que el bridge esté corriendo localmente |
| 27 | Una acción de Isabel (ej. crear tarea) aparece en la app | ⚠ | Depende de que el bridge esté corriendo localmente |
| 28 | Si Isabel no está disponible, aparece el mensaje correcto | ✓ | Muestra "Arrancar Isabel.bat" cuando no hay conexión |

---

### Isabel — Telegram

| # | Verificación | Estado | Notas |
|---|-------------|--------|-------|
| 29 | Isabel responde mensajes desde Telegram | ✗ | Gateway OpenClaw (puerto 18789) no arranca automáticamente. Deuda conocida → Sprint 2 |
| 30 | Una acción de Isabel desde Telegram aparece en la app | ✗ | Bloqueado por ítem 29. Deuda conocida → Sprint 2 |

---

### Infraestructura local

| # | Verificación | Estado | Notas |
|---|-------------|--------|-------|
| 31 | "Arrancar Isabel.bat" se ejecuta sin errores | ⚠ | Requiere arranque manual. No arranca automáticamente con Windows |
| 32 | El bridge de Isabel arranca en puerto 3001 | ⚠ | Funciona si se ejecuta el .bat manualmente |
| 33 | Cloudflare tunnel se levanta y genera URL | ⚠ | Funciona si se ejecuta el .bat manualmente |
| 34 | La URL del tunnel se guarda en Supabase automáticamente | ✓ | Funciona correctamente cuando el .bat se ejecuta |
| 35 | La app lee la URL del tunnel desde Supabase | ✓ | Funciona correctamente |

---

## Resultado por tarea

| Tarea | Ítems que fallaron | Corregidos antes de continuar |
|-------|-------------------|------------------------------|
| T0 — Snapshot | 29, 30 (deuda conocida, no bloquean) | No aplica — deuda documentada para Sprint 2 |
| T1 — Build Vite | | |
| T2 — db.js | | |
| T3 — Config/env | | |
| T4 — isabel.js | | |
| T5 — Estructura | | |

---

## Deuda conocida al inicio del Sprint

Ítems que no funcionan perfectamente hoy, antes de empezar. No son objetivo del Sprint 1 salvo donde se indica.

| Ítem | Descripción | Sprint previsto |
|------|-------------|-----------------|
| Telegram / OpenClaw gateway | El gateway no arranca automáticamente. Telegram no responde. | Sprint 2 |
| Check-in sin historial | El check-in sobreescribe el valor anterior. No hay serie histórica consultable. | Sprint 2 |
| Claves en código fuente | La clave de Supabase está hardcodeada en index.html (líneas ~207–213). | Sprint 1 — Tarea 3 |
| 40 llamadas Supabase dispersas | `.from()` aparece 40 veces en el HTML sin capa de abstracción. | Sprint 1 — Tarea 2 |
| HTML monolítico | 1641 líneas: HTML + CSS + JS + lógica de negocio sin separación. | Sprint 1 — Tarea 1 |

---

*Checklist creada: 2026-06-26. Estado verificado manualmente antes de iniciar Sprint 1.*
