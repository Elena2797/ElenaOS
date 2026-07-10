Estado: meta — no aplica taxonomía implementado/diseñado
Última verificación: 2026-07-10
Verificado en: —
Fuente de verdad de datos: ninguna

# /docs — Memoria persistente de LIFEOS

Este directorio existe para que un chat nuevo pueda continuar el desarrollo de LIFEOS **leyendo únicamente esta carpeta**, sin depender de conversaciones anteriores. Si estás empezando una sesión nueva: lee este documento entero, luego `NEXT_SESSION.md`, y solo después el módulo concreto que te ocupe.

## Regla de oro
Cada dato vive en **un solo documento**. Si ves el mismo dato repetido en dos sitios, algo está mal — corrígelo antes de seguir. Los detalles de tablas viven solo en `DATA_MODEL.md`; el historial solo en `CHANGELOG.md`; el porqué de las decisiones solo en `DECISIONS.md`.

## Qué leer según la tarea

| Tu tarea es... | Lee esto primero |
|---|---|
| Empezar una sesión nueva, sin más contexto | `CURRENT_STATE.md` (fotografía del proyecto) → `NEXT_SESSION.md` (handoff exacto) |
| Continuar donde se quedó la última sesión | `NEXT_SESSION.md` |
| Entender qué funciona y qué no, ahora mismo | `CURRENT_STATE.md` |
| Tocar código de un módulo concreto (HOTO, Inventario, etc.) | `modules/<MÓDULO>.md` correspondiente |
| Entender cómo está construido el sistema | `ARCHITECTURE.md` |
| Saber qué tablas existen y sus columnas | `DATA_MODEL.md` |
| Desplegar o verificar un servicio | `operations/` |
| Entender por qué algo se hizo así | `DECISIONS.md` |
| Saber si un problema ya es conocido | `KNOWN_PROBLEMS.md` |
| Trabajar con "el chat de Isabel" | `core/ISABEL_CHANNELS.md` **primero** — hay 4 sistemas distintos, solo uno activo |
| Entender qué principios no se deben romper | `PRINCIPLES.md` |

## Estructura

```
docs/
  README.md              ← estás aquí
  CURRENT_STATE.md        fotografía del proyecto, 1 página, 5 campos fijos
  ARCHITECTURE.md         cómo está construido, real vs objetivo
  DATA_MODEL.md           única fuente de las tablas de Supabase
  PRINCIPLES.md           principios vigentes, destilados
  KNOWN_PROBLEMS.md       deuda técnica y grietas conocidas
  DECISIONS.md            por qué se decidió cada cosa (ADR ligero)
  SECURITY.md             riesgos reales observados
  INFRASTRUCTURE.md       repos, entornos, variables, comandos
  CHANGELOG.md            historial relevante por fecha/commit
  NEXT_SESSION.md         qué hacer justo después — se reescribe cada sesión

  core/                   cómo funciona Isabel y el sistema transversal
  modules/                cada dominio: VistaJet (6 sub-módulos), Finanzas, JETMI, Salud/Gym, Marca Personal, Vida Personal
  operations/             cómo desplegar, verificar y recuperar el sistema
  archive/                decisiones y documentos ya no vigentes, preservados
```

## Convención de metadatos
Todo documento de `core/`, `modules/` y `ARCHITECTURE.md` empieza con:
```
Estado: implementado | parcial | diseñado | idea futura
Última verificación: <fecha>
Verificado en: <commit / archivo / prueba empírica>
Fuente de verdad de datos: <tabla en DATA_MODEL.md, o "ninguna">
```
Si el header dice "diseñado" o "idea futura", el resto del documento describe una intención, no algo que puedas asumir que funciona.

## Relación con los documentos de la raíz del proyecto
Fuera de `/docs`, en `LIFE OS/` (que no es un repositorio git), existen documentos de visión y filosofía profunda: `VISION.md`, `MODEL.md`, `ISABEL_CORE.md` ("la constitución"), `MASTER_PLAN.md`, `EVOLUTION.md`, `KNOWLEDGE.md`, `USER_FLOW.md`, `ARQUITECTURA_FUSION.md`, `JETMI_PRD_Semilla.md`, `ISABEL_INVENTORY_SPECIALIST_CONTRACT.md`, `PRODUCT_PRINCIPLES.md`. No se han movido ni duplicado. `/docs` los referencia cuando hace falta la visión completa detrás de una decisión — pero `/docs` es la verdad operativa del día a día; esos documentos son la capa de pensamiento largo que la originó.

## Comando oficial de cierre: "Cerrar sesión de desarrollo"

Es el único comando estándar para terminar una sesión de trabajo en LIFEOS. No depende de que se recuerde pedir "actualiza la documentación" — es el protocolo por defecto al cerrar. Ejecuta siempre, en este orden:

1. **Revisar todos los cambios realizados durante la sesión** (`git log`/`git diff` de los repos afectados + lo trabajado en la conversación).
2. **Actualizar únicamente los documentos afectados** — nunca reescribir `/docs` entero por rutina. Un cambio en HOTO no toca `modules/FINANCE.md`.
3. **Actualizar siempre, sin excepción**, estos tres:
   - `CHANGELOG.md` — se añade una entrada nueva, nunca se reescribe lo anterior.
   - `CURRENT_STATE.md` — se reescribe entero si algo del estado general cambió (deploy, bloqueo, objetivo).
   - `NEXT_SESSION.md` — se reescribe entero, siempre, sea cual sea el tamaño del cambio.
4. **Comprobar que no existan contradicciones entre documentos** (ej.: `CURRENT_STATE.md` dice "sin bloqueos" mientras `KNOWN_PROBLEMS.md` describe uno nuevo sin registrar).
5. **Confirmar explícitamente** que un chat completamente nuevo podría continuar el desarrollo leyendo únicamente: `README.md` → `CURRENT_STATE.md` → `NEXT_SESSION.md` → los documentos específicos de la tarea siguiente. Si algo necesario no está en esa ruta de lectura, añadirlo antes de dar la sesión por cerrada.
6. Decisiones que quedan obsoletas se mueven a `archive/`, nunca se borran.
7. Commit exclusivo de documentación, sin mezclar con cambios de código.

Este comando reemplaza cualquier frase anterior tipo "actualiza la documentación" — a partir de ahora, "Cerrar sesión de desarrollo" es la única forma estándar de invocarlo.

## Estado de esta documentación
Creada el 2026-07-10 a partir de una auditoría completa del código, migraciones y configuración de los tres repos (`life-os-app`, `isabel-api`, `lifeos-agent`). Todo lo marcado como "implementado" fue verificado directamente contra el código o contra Supabase — nada se documentó por asunción. Lo que no se pudo verificar con certeza está declarado explícitamente como tal en el documento correspondiente, nunca inventado.
