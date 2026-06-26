# Sprint 1 â€” Checklist funcional

Ejecutar despuÃ©s de cada tarea. Ninguna tarea estÃ¡ terminada hasta que todos los Ã­tems que eran âœ“ siguen siendo âœ“.

## Estado del proyecto al inicio del Sprint

**Rama:** `sprint-1` (creada desde `main` limpio el 2026-06-26)  
**Commit base:** `d37763b` â€” Isabel: leer agent_url desde Supabase automÃ¡ticamente  
**Archivo principal:** `index.html` â€” 1641 lÃ­neas  
**Archivos adicionales:** `manifest.json`, `setup.sql`, `api/chat.js`, `api/gmail-auth.js`, `api/gmail-callback.js`

---

## Estructura actual (antes del Sprint)

```
life-os-app/
â”œâ”€â”€ index.html          â† 1641 lÃ­neas: HTML + CSS + JS + lÃ³gica de negocio todo junto
â”œâ”€â”€ manifest.json       â† configuraciÃ³n PWA
â”œâ”€â”€ setup.sql           â† schema de referencia (no se ejecuta automÃ¡ticamente)
â””â”€â”€ api/
    â”œâ”€â”€ chat.js         â† endpoint Vercel para chat (estado desconocido)
    â”œâ”€â”€ gmail-auth.js   â† integraciÃ³n Gmail (no implementada aÃºn)
    â””â”€â”€ gmail-callback.js
```

**40 llamadas `.from()` a Supabase** dispersas en `index.html`.  
**1 llamada `fetch()`** al bridge de Isabel (lÃ­nea ~1380).  
**Claves de API hardcodeadas** en `index.html` (lÃ­neas ~207â€“213).

---

## Checklist funcional

- âœ“ funciona correctamente  
- âœ— no funciona  
- âš  funciona con limitaciones conocidas o no verificado completamente  

---

### App general

| # | VerificaciÃ³n | Estado | Notas |
|---|-------------|--------|-------|
| 1 | La app abre desde Vercel (producciÃ³n) sin errores de consola | âœ“ | Verificado manualmente |
| 2 | La app abre en local sin errores de consola | âœ“ | Verificado manualmente |
| 3 | El PIN de acceso funciona | âœ“ | Verificado manualmente |
| 4 | La pantalla de inicio (home) carga y muestra datos de Supabase | âœ“ | Verificado manualmente |
| 5 | La navegaciÃ³n entre secciones funciona | âœ“ | Verificado manualmente |
| 6 | El modo ON/OFF cambia al pulsarlo | âœ“ | Verificado manualmente |
| 7 | El modo ON/OFF persiste al recargar la pÃ¡gina | âœ“ | Verificado manualmente |

---

### Supabase

| # | VerificaciÃ³n | Estado | Notas |
|---|-------------|--------|-------|
| 8 | La app conecta a Supabase correctamente | âœ“ | Sin errores de red |
| 9 | Las tareas se leen correctamente desde Supabase | âœ“ | Verificado manualmente |
| 10 | Crear una tarea nueva la guarda en Supabase | âœ“ | Verificado manualmente |
| 11 | Completar una tarea actualiza su estado en Supabase | âœ“ | Verificado manualmente |
| 12 | Los datos persisten entre sesiones | âš  | No verificado completamente en todos los tipos de dato |

---

### Check-in y Salud

| # | VerificaciÃ³n | Estado | Notas |
|---|-------------|--------|-------|
| 13 | El check-in matutino (sueÃ±o) se puede registrar | âœ“ | Verificado manualmente |
| 14 | El check-in de dolor se puede registrar | âœ“ | Verificado manualmente |
| 15 | El Ã¡rea de Salud carga datos correctamente | âœ“ | Verificado manualmente |
| 16 | El historial de gym / sesiones se muestra | âœ“ | Verificado manualmente |

---

### VistaJet

| # | VerificaciÃ³n | Estado | Notas |
|---|-------------|--------|-------|
| 17 | El Ã¡rea VistaJet carga el estado actual | âœ“ | Verificado manualmente |
| 18 | El estado VJ (libre/rotaciÃ³n/standby) se puede cambiar | âœ“ | Verificado manualmente |
| 19 | Las tareas VJ se muestran y se pueden completar | âœ“ | Verificado manualmente |
| 20 | La checklist de maleta funciona | âœ“ | Verificado manualmente |

---

### Finanzas

| # | VerificaciÃ³n | Estado | Notas |
|---|-------------|--------|-------|
| 21 | El Ã¡rea de Finanzas carga datos | âœ“ | Verificado manualmente |
| 22 | Los presupuestos por categorÃ­a se muestran | âœ“ | Verificado manualmente |

---

### JETMI

| # | VerificaciÃ³n | Estado | Notas |
|---|-------------|--------|-------|
| 23 | El Ã¡rea JETMI carga datos | âœ“ | Verificado manualmente |
| 24 | Las tareas de JETMI se muestran | âœ“ | Verificado manualmente |

---

### Isabel â€” App

| # | VerificaciÃ³n | Estado | Notas |
|---|-------------|--------|-------|
| 25 | El chat de Isabel abre en la app | âœ“ | Verificado manualmente |
| 26 | Isabel responde mensajes desde la app | âš  | Depende de que el bridge estÃ© corriendo localmente |
| 27 | Una acciÃ³n de Isabel (ej. crear tarea) aparece en la app | âš  | Depende de que el bridge estÃ© corriendo localmente |
| 28 | Si Isabel no estÃ¡ disponible, aparece el mensaje correcto | âœ“ | Muestra "Arrancar Isabel.bat" cuando no hay conexiÃ³n |

---

### Isabel â€” Telegram

| # | VerificaciÃ³n | Estado | Notas |
|---|-------------|--------|-------|
| 29 | Isabel responde mensajes desde Telegram | âœ— | Gateway OpenClaw (puerto 18789) no arranca automÃ¡ticamente. Deuda conocida â†’ Sprint 2 |
| 30 | Una acciÃ³n de Isabel desde Telegram aparece en la app | âœ— | Bloqueado por Ã­tem 29. Deuda conocida â†’ Sprint 2 |

---

### Infraestructura local

| # | VerificaciÃ³n | Estado | Notas |
|---|-------------|--------|-------|
| 31 | "Arrancar Isabel.bat" se ejecuta sin errores | âš  | Requiere arranque manual. No arranca automÃ¡ticamente con Windows |
| 32 | El bridge de Isabel arranca en puerto 3001 | âš  | Funciona si se ejecuta el .bat manualmente |
| 33 | Cloudflare tunnel se levanta y genera URL | âš  | Funciona si se ejecuta el .bat manualmente |
| 34 | La URL del tunnel se guarda en Supabase automÃ¡ticamente | âœ“ | Funciona correctamente cuando el .bat se ejecuta |
| 35 | La app lee la URL del tunnel desde Supabase | âœ“ | Funciona correctamente |

---

## Resultado por tarea

| Tarea | Ãtems que fallaron | Corregidos antes de continuar |
|-------|-------------------|------------------------------|
| T0 â€” Snapshot | 29, 30 (deuda conocida, no bloquean) | No aplica â€” deuda documentada para Sprint 2 |
| T1 â€” Build Vite | | |
| T2 â€” db.js | | |
| T3 â€” Config/env | | |
| T4 â€” isabel.js | | |
| T5 â€” Estructura | | |

---

## Deuda conocida al inicio del Sprint

Ãtems que no funcionan perfectamente hoy, antes de empezar. No son objetivo del Sprint 1 salvo donde se indica.

| Ãtem | DescripciÃ³n | Sprint previsto |
|------|-------------|-----------------|
| Telegram / OpenClaw gateway | El gateway no arranca automÃ¡ticamente. Telegram no responde. | Sprint 2 |
| Check-in sin historial | El check-in sobreescribe el valor anterior. No hay serie histÃ³rica consultable. | Sprint 2 |
| Claves en cÃ³digo fuente | La clave de Supabase estÃ¡ hardcodeada en index.html (lÃ­neas ~207â€“213). | Sprint 1 â€” Tarea 3 |
| 40 llamadas Supabase dispersas | `.from()` aparece 40 veces en el HTML sin capa de abstracciÃ³n. | Sprint 1 â€” Tarea 2 |
| HTML monolÃ­tico | 1641 lÃ­neas: HTML + CSS + JS + lÃ³gica de negocio sin separaciÃ³n. | Sprint 1 â€” Tarea 1 |

---

*Checklist creada: 2026-06-26. Estado verificado manualmente antes de iniciar Sprint 1.*

