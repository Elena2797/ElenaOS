Estado: conocimiento vigente — mapa vivo, se actualiza al ingerir o avanzar un artefacto
Última verificación: 2026-07-14
Verificado en: ingestión de los tres primeros artefactos de investigación (Manual Cap. 1, Mapa Maestro, Investigación 1.1)
Fuente de verdad de datos: ninguna

# research/JETMI/LOG.md — Mapa de cobertura de investigación

Este documento responde cinco preguntas. No es una lista de archivos — es el mapa de qué se sabe, con qué certeza, y qué falta. Ver `research/README.md` para la definición de la escala de cobertura y del pipeline de ingestión.

**Importante:** la escala de cobertura mide **madurez de conocimiento**, nunca estado de implementación de código. Un área puede estar en SUFICIENTE PARA DECIDIR sin que exista una línea de producto, y JETMI puede tener módulos de código "implementados" (ver `modules/JETMI.md`) sobre datos que aquí siguen en NO INVESTIGADO — son dos ejes independientes.

## 1. Qué estamos investigando ahora mismo

Fase 1 del Mapa Maestro de Investigación (conocimiento de industria): completado el dominio 1.1 (qué hace un broker día a día). Pendientes dentro de la misma fase: 1.2 (supply — operadores y aeronaves), 1.3 (demanda — clientes), 1.4 (ciclo operativo end-to-end). La Fase 0 (fundamentos legales y de negocio, bloqueante) no se ha iniciado — sigue en NO INVESTIGADO completo.

## 2. Artefactos existentes

| Artefacto | Tipo | Ubicación | Fecha de incorporación | Relación con los demás |
|---|---|---|---|---|
| Manual Operativo del Broker de Aviación Privada — Cap. 1 (+ índice preliminar de 15 capítulos) | Investigación primaria de industria, capítulo a capítulo, con fuentes públicas del sector citadas | `sources/manual-operativo-broker.md` | 2026-07-14 | Es el punto de partida. El Mapa Maestro lo diagnostica y reestructura; la Investigación 1.1 lo amplía y matiza (ver `sources/investigacion-1-1-trabajo-real-broker.md` § J) |
| Mapa Maestro de Investigación — JETMI dentro de LIFEOS | Documento de **planificación** de investigación (no narrativo, no conocimiento de industria en sí mismo) | `sources/mapa-maestro-investigacion.md` | 2026-07-14 | Diagnostica el índice de 15 capítulos del Manual, lo reestructura en 24 dominios / 7 fases, y define el orden y las dependencias de investigación de aquí en adelante. No aporta hechos nuevos sobre el sector — aporta la hoja de ruta |
| Investigación 1.1 — Qué hace realmente un broker de aviación privada | Investigación funcional primaria (cumple el dominio 1.1 del Mapa Maestro, equivalente al Capítulo 2 del Manual, todavía no escrito como tal) | `sources/investigacion-1-1-trabajo-real-broker.md` | 2026-07-14 | Amplía y matiza el Manual Cap. 1 (introduce la distinción "flight watch" técnico vs. del broker) y señala una posible tensión con el dominio 2.5 del Mapa Maestro (fraude) — ver `HYPOTHESES.md` |

**No mezclar sus roles** (instrucción explícita de la usuaria): el Manual es conocimiento de industria; el Mapa Maestro es planificación de investigación, no conocimiento en sí mismo; la Investigación 1.1 es conocimiento funcional que amplía al Manual y genera preguntas nuevas.

## 3. Qué áreas cubre cada artefacto

| Artefacto | Sección/capítulo | Área temática | Cobertura de esa sección |
|---|---|---|---|
| Manual — Cap. 1 | 1.1–1.2 | Actores del ecosistema y relaciones contractuales entre ellos | INVESTIGADO |
| Manual — Cap. 1 | 1.2 (c) | Regulación del broker: Part 295 (EE.UU.) vs. ausencia de figura equivalente en UE/España | INVESTIGADO (el hecho normativo en sí está verificado con fuente primaria — eCFR, NBAA; su aplicación concreta a JETMI no) |
| Manual — Cap. 1 | 1.3 | Modelos de monetización (comisión, markup, fee management, mayorista/minorista, empty legs) | INVESTIGADO |
| Manual — Cap. 1 | 1.4–1.5 | Flujo de información y de decisiones en una operación | INVESTIGADO |
| Manual — Cap. 1 | 1.6–1.7 | Cuellos de botella estructurales de la industria y qué problema resuelve un broker | INVESTIGADO |
| Manual — Caps. 2-15 | índice preliminar | Todo lo demás (qué es un broker en detalle, ciclo de vuelo, modelo de negocio, operadores, aircraft, clientes, requests, quotes, negociación, operación, post-vuelo, herramientas, dolor de industria, oportunidades) | NO INVESTIGADO — solo títulos, sin contenido |
| Mapa Maestro | Parte 1 | Diagnóstico del índice original de 15 capítulos frente a 24 dominios necesarios | INVESTIGADO (es un análisis propio documentado, no una fuente externa verificable per se) |
| Mapa Maestro | Parte 2 | 7 preguntas estratégicas que condicionan el resto de la investigación (jurisdicción, agente vs. principal, tocar dinero del cliente, horizonte de tiempo, etc.) | NO INVESTIGADO — son preguntas sin responder, no un área de conocimiento |
| Mapa Maestro | Parte 3, Fase 0 | Constitución legal, modelo de negocio jurídico, regulación por jurisdicción aplicada a JETMI | NO INVESTIGADO — bloqueante, requiere fuente primaria (abogado) todavía no consultada |
| Mapa Maestro | Parte 3, Fases 2-6 | Contratos, pagos/fiscalidad, seguros, fraude, incidencias, customer service 24/7, sales/marketing, tecnología, datos, KPIs, organización AI-native, automatización, resiliencia, seguridad de la información | NO INVESTIGADO — son dominios definidos y priorizados, ninguno investigado todavía en profundidad |
| Investigación 1.1 | A–C | Qué hace un broker día a día: 41 funciones en 11 clusters, con trigger/input/decisión/riesgo/conocimiento tácito por función | INVESTIGADO (extracción de fuentes secundarias + ofertas de empleo reales; explícitamente sin entrevista directa a un broker en activo) |
| Investigación 1.1 | D | Escenarios de jornada real (A-E) | INVESTIGADO como hipótesis estructurada — el propio documento la marca `[HIPÓTESIS ESTRUCTURADA A PARTIR DE EVIDENCIA PARCIAL]`, no como hecho verificado |
| Investigación 1.1 | E | Mapa de decisiones (qué decisión, con qué información, cuánta regla explícita existe) | INVESTIGADO |
| Investigación 1.1 | F | Mapa de información (dónde vive, se duplica, se pierde) | INVESTIGADO |
| Investigación 1.1 | G | Cuellos de botella clasificados por frecuencia/impacto/evidencia | INVESTIGADO |
| Investigación 1.1 | I | Clasificación de la naturaleza del trabajo (repetitivo/juicio/relacional/etc.) | INVESTIGADO — explícitamente declarada como clasificación, no como diseño ni asignación a agentes |
| Investigación 1.1 | H | 9 preguntas abiertas, la mayoría requieren entrevista a un broker en activo | NO INVESTIGADO |

## 4. Nivel de madurez por área temática (vista agregada)

| Área temática | Cobertura actual | Artefactos que la tocan | Última actualización |
|---|---|---|---|
| Visión general de la industria (actores, relaciones contractuales, flujo de dinero e información) | **INVESTIGADO** | Manual Cap. 1 | 2026-07-14 |
| Qué hace un broker día a día (funciones, decisiones, cuellos de botella operativos) | **INVESTIGADO** | Investigación 1.1 | 2026-07-14 |
| Marco regulatorio del brokerage (EE.UU. Part 295 vs. UE/España sin figura equivalente) | **INVESTIGADO** a nivel de hecho general — **NO INVESTIGADO** aplicado específicamente a la jurisdicción real de JETMI | Manual Cap. 1, Mapa Maestro 0.3 | 2026-07-14 |
| Modelo de comisiones y economía del negocio (agente vs. principal, mayorista/minorista) | **INVESTIGADO** a nivel de industria — **NO INVESTIGADO** la decisión propia de JETMI (Mapa Maestro pregunta abierta #3) | Manual Cap. 1, Investigación 1.1 | 2026-07-14 |
| Relación broker↔operador (sourcing, RFQs, negociación, relación continua) | **INVESTIGADO** | Manual Cap. 1, Investigación 1.1 | 2026-07-14 |
| Verificación de seguridad y vetting de operadores | **INVESTIGADO**, con un hallazgo verificado de alto valor (wet-lease no auditado) | Manual Cap. 1, Investigación 1.1 función 12/14 | 2026-07-14 |
| Fraude y verificación de contrapartes | **INVESTIGADO** — casos documentados existen, pero Investigación 1.1 señala que gran parte de la detección depende de conocimiento tácito no sistematizable en un checklist, lo que el Mapa Maestro (2.5) no había anticipado | Investigación 1.1 § G, J | 2026-07-14 |
| Constitución legal, forma societaria y elegibilidad regulatoria de JETMI | **NO INVESTIGADO** — bloqueante, fuente requerida es abogado (fuente primaria no sustituible), todavía no consultado | Mapa Maestro 0.1 | 2026-07-14 |
| Modelo jurídico de JETMI (agente vs. principal) | **NO INVESTIGADO** como decisión propia (aunque el marco general sí está investigado) | Mapa Maestro 0.2, Pregunta abierta #3 | 2026-07-14 |
| Contratos, pagos/fiscalidad, seguros | **NO INVESTIGADO** | Mapa Maestro 2.2, 2.3, 2.4 | 2026-07-14 |
| Gestión de incidencias operativas y customer service 24/7 | **INVESTIGADO** a nivel de qué ocurre en la industria (Investigación 1.1 clusters 9-10) — **NO INVESTIGADO** cómo resolverlo con una sola persona + IA (eso es diseño, explícitamente fuera de alcance de la investigación hasta ahora) | Investigación 1.1, Mapa Maestro 3.1/3.2 | 2026-07-14 |
| Herramientas tecnológicas (industria + gestión empresarial) | **NO INVESTIGADO** en profundidad — solo mencionadas de pasada (Avinode, FL3XX, JetNet) dentro de otras secciones | Manual Cap. 1 (de pasada), Mapa Maestro 4.2 (pendiente) | 2026-07-14 |
| Organización "una sola persona + IA" y automatización real disponible | **NO INVESTIGADO** como diseño — existe una clasificación preliminar de la *naturaleza* del trabajo (Investigación 1.1 § I), explícitamente no una propuesta de arquitectura ni de asignación a agentes | Investigación 1.1 § I, Mapa Maestro 5.1/5.2 | 2026-07-14 |

## 5. Preguntas abiertas

Ver `HYPOTHESES.md` para el detalle completo, con estado y artefacto de origen de cada una. Resumen de los bloques de preguntas más relevantes:

- **7 preguntas estratégicas del Mapa Maestro (Parte 2)** — jurisdicción de constitución, mercado geográfico inicial, agente vs. principal, si JETMI tocará el dinero del cliente, horizonte de tiempo al primer vuelo, restricciones horarias del "trabajo en paralelo", relaciones previas en el sector. Ninguna respondida todavía en `/docs`.
- **9 preguntas abiertas de la Investigación 1.1 (sección H)** — la más crítica: qué criterios concretos (más allá del rating de auditoras) usa un broker experimentado para confiar en un operador nuevo. Todas requieren, según el propio documento, entrevista directa a un broker en activo — fuente primaria que todavía no existe en esta investigación.
- **Tensión señalada (no contradicción) entre el Mapa Maestro y la Investigación 1.1** sobre el dominio de fraude (2.5): el Mapa Maestro lo trataba como diseño de proceso; la evidencia sugiere que depende más de conocimiento tácito experiencial.
- **Nota pendiente heredada de JETMI-D1** (`DECISIONS.md`): la propia `JETMI_PRD_Semilla.md` usa lenguaje ("empresa de descubrimiento, comercialización y gestión de oportunidades") que antecede a la decisión de posicionamiento como broker — sigue sin resolverse, ver `HYPOTHESES.md` C1.

## 6. Próximo bloque de investigación

Según el orden recomendado por el propio Mapa Maestro (Parte 5): completar la Fase 1 (dominios 1.2 supply, 1.3 demanda, 1.4 ciclo operativo end-to-end) manteniendo el estilo ya usado en la Investigación 1.1, o alternativamente abrir la Fase 0 (fundamentos legales) si se decide priorizar lo bloqueante sobre lo de alta prioridad no bloqueante. Ninguna de las dos rutas se ha decidido todavía — es una decisión pendiente de Estefanía, no una inferencia que corresponda hacer aquí.
