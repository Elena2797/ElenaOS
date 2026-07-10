Estado: parcial (real ≠ objetivo, ver ambas secciones)
Última verificación: 2026-07-10
Verificado en: lectura de código en isabel-api/src/index.js, life-os-app/src/main.js, ARQUITECTURA_FUSION.md (raíz)
Fuente de verdad de datos: DATA_MODEL.md

# ARCHITECTURE.md — Cómo está construido, y cómo debería estar

Este documento tiene dos secciones deliberadamente separadas. No las mezcles: la primera es lo que existe hoy, verificado; la segunda es la dirección declarada, no implementada en su mayoría.

Para la filosofía completa detrás de la arquitectura objetivo, ver `ISABEL_CORE.md` (raíz del proyecto, "la constitución") y `MASTER_PLAN.md` (raíz). Este documento no repite esa prosa — la traduce a estado verificable.

---

## 1. Arquitectura REAL (verificada)

```
Estefanía
   │
   ├── life-os-app (Vercel)          ← frontend, Vite + vanilla JS, 3446 líneas en main.js
   │      │
   │      ├── lee/escribe Supabase directamente (services/db.js, inventory.js, hoto.js, readiness.js)
   │      │      → NO pasa por ningún backend para el CRUD genérico ni para leer HOTO/Inventario
   │      │
   │      └── chat conversacional → bridge local (isabel.js) → agente Python en su PC
   │             (requiere "Arrancar Isabel.bat"; ver core/ISABEL_CHANNELS.md)
   │
   └── isabel-api (Railway)          ← backend Express, usado SOLO para:
          │                             - parseo de mensajes de inventario (/v1/message)
          │                             - exportación Excel de inventario (/v1/session/:id/export)
          │                             - exportación PDF de HOTO (/v1/hoto/:id/export)
          │
          └── lee/escribe Supabase con service_role key

Supabase (cllubptdwydifomlnxds) — única base de datos, RLS desactivado
```

**Puntos clave verificados:**
- El frontend **no tiene un backend intermedio para su CRUD genérico** (áreas, tareas, decisiones, finanzas). Habla directamente con Supabase usando la anon key.
- isabel-api es un **microservicio especializado**, no un backend general — solo entra en juego para inventario y HOTO, y específicamente para lo que requiere lógica de servidor (parseo de lenguaje natural, generación de Excel/PDF).
- El "cerebro conversacional" real (`openChat()`) no pasa por isabel-api en absoluto hoy — pasa por un bridge que apunta a un proceso que corre en el ordenador local de Estefanía.
- Hay código para una arquitectura de "Isabel Core como orquestador único" (`isabel-api/src/core/`), pero no está conectado (ver `core/ISABEL_CHANNELS.md`).

## 2. Arquitectura OBJETIVO (declarada, mayormente no implementada)

Fuente: `ARQUITECTURA_FUSION.md` (raíz, 2026-07-07), `ISABEL_CORE.md` (raíz, "constitución").

```
Usuario (lenguaje natural)
        ↓
LIFEOS UI (única superficie)
        ↓
🧠 Isabel Core — un solo Claude, memoria y contexto transversal
        ↓
Tool Router — detecta módulo destino
        ↓
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ VJ Inventory │ VJ HOTO      │ Finance      │ + futuros    │
│ (isabel-api) │ (isabel-api) │ (LIFEOS db)  │              │
└──────────────┴──────────────┴──────────────┴──────────────┘
        ↓
Supabase — única fuente de verdad, sin doble escritura
```

**Principios de esta arquitectura objetivo** (de `ISABEL_CORE.md`): Isabel Core coordina, no centraliza toda la inteligencia — la inteligencia de dominio pertenece a los especialistas (isabel-api para inventario/HOTO). Cada tabla tiene un único propietario que escribe en ella.

**Plan de fases documentado en `ARQUITECTURA_FUSION.md`** (ninguna fase posterior a la 0 está completa, según verificación de esta auditoría):
- Fase 0 (prerrequisitos): ✅ hecho — isabel-api en Railway, parser funcionando.
- Fase 1 (`/v1/tools/invoke` en isabel-api): código de core/ existe pero **no montado**, no verificable como completa.
- Fases 2-5: no hay evidencia de implementación.

## 3. Por qué existe la brecha

No es negligencia — es orden de prioridades. Cada sesión de desarrollo reciente se centró en que un módulo concreto (Inventario, luego HOTO) funcionara de punta a punta con datos reales para una entrega real, en vez de en la orquestación general. Es una decisión implícita razonable, pero significa que la arquitectura objetivo lleva desde 2026-07-07 sin avanzar en su plan de fases.

## 4. Qué NO está aquí
- Columnas y relaciones exactas → [DATA_MODEL.md](DATA_MODEL.md)
- Detalle de cada canal de Isabel → [core/ISABEL_CHANNELS.md](core/ISABEL_CHANNELS.md)
- Detalle de cada módulo → [modules/](modules/)
