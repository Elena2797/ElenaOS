Estado: conocimiento vigente — se añade solo tras verificación deliberada, nunca por copia directa de sources/
Última verificación: 2026-07-14
Verificado en: creación inicial de research/JETMI/ — todavía sin contenido
Fuente de verdad de datos: ninguna

# research/JETMI/KNOWLEDGE.md — Conocimiento consolidado

Solo entra aquí lo que alcanzó el nivel **VERIFICADO** o **SUFICIENTE PARA DECIDIR** en `LOG.md`, siguiendo el pipeline de `research/README.md` (fuente → extracción → clasificación → verificación → conocimiento consolidado). Nada se copia aquí automáticamente al leer un artefacto de `sources/`.

Cada entrada cita explícitamente de dónde viene. Si la procedencia no puede reconstruirse hasta una fuente identificable, la entrada no entra aquí — se queda en `HYPOTHESES.md` marcada como pendiente de verificación.

## Nota sobre estructura futura

Este documento empieza como un único archivo, por simplicidad — no hay volumen todavía que justifique dividirlo. Cuando el contenido crezca lo suficiente como para que un único archivo deje de ser navegable (referencia orientativa: cuando cueste encontrar un dato conocido en menos de un vistazo, o cuando aparezcan áreas temáticas claramente independientes con volumen propio — p. ej. "marco legal" vs. "economía de comisiones" vs. "relación con operadores"), se divide en `KNOWLEDGE/<área>.md` siguiendo las áreas temáticas ya usadas en `LOG.md`. No se crea esa taxonomía por adelantado.

---

*(Sin entradas oficiales todavía. Se añaden aquí a medida que el contenido de `sources/` se extrae, clasifica y verifica — nunca por promoción automática desde una lectura de `sources/`, ver pipeline en `research/README.md`.)*

---

## ⚠️ Candidatos a consolidación futura — NO es conocimiento oficial (2026-07-14)

**Advertencia explícita para cualquier lector, humano o agente:** todo lo que sigue en esta sección es una **revisión de evidencia, no conocimiento consolidado de JETMI**. Ninguna fila de la tabla siguiente debe citarse, usarse como base de una decisión, o tratarse como hecho verificado de `/docs` — son candidatas que, según la evidencia reunida en `sources/`, tienen buen nivel de evidencia y **podrían** promocionarse a la sección de arriba tras una verificación deliberada (segunda fuente independiente, validación legal donde aplique, o confirmación explícita de Estefanía). Ninguna se promociona automáticamente. Si necesitas citar algo de aquí, cita la fuente original en `sources/`, no esta tabla.

| Candidato a conocimiento | Artefacto fuente | Nivel de evidencia | Qué falta para consolidarlo |
|---|---|---|---|
| El broker no opera aviones ni tiene certificado de operador; su valor está en agregación de oferta, filtrado de seguridad, negociación y absorción de riesgo operativo — no en el activo físico | Manual Cap. 1 (síntesis de múltiples fuentes del sector) | Alto — consistente entre decenas de fuentes citadas | Ninguna verificación adicional crítica; candidato fuerte para promoción directa |
| EE.UU. regula explícitamente al broker desde 2019 (14 CFR Part 295, obligación de declarar capacidad como *indirect air carrier* o *bona fide agent*); la UE/España no tiene una figura jurídica equivalente específica | Manual Cap. 1 | Alto — fuente normativa primaria (eCFR, NBAA) | Validación de un abogado aeronáutico sobre qué obligaciones sí aplican en la jurisdicción real donde se constituya JETMI (Mapa Maestro 0.1/0.3, todavía sin iniciar) |
| Los sistemas de rating de seguridad ARGUS, Wyvern e IS-BAO son privados, voluntarios y de pago — la ausencia de rating de un operador no equivale a inseguridad, solo a ausencia de auditoría pagada | Manual Cap. 1 | Alto — consistente en múltiples fuentes, incluida documentación propia de los auditores | Ninguna verificación adicional crítica; candidato fuerte para promoción directa |
| Una aeronave puede estar auditada bajo un certificado y ser subarrendada ("wet-leased") a un operador no auditado sin que el cliente lo sepa; un vetting riguroso debe confirmar las certificaciones del operador específico que vuela el tramo, no solo de la empresa que aparece en el contrato | Investigación 1.1, función 12 | Medio — una única fuente comercial (Jetvice.net), aunque técnicamente coherente | Segunda fuente independiente (otra auditora, o un broker en activo) antes de tratarlo como regla operativa de vetting |
| El "flight watch" regulado (monitorización activa de vuelo, con capacidad de intervención) es función del operador (OCC)/ATC, no del broker; el broker hace una versión ligera orientada al cliente (seguimiento de estado + puente de comunicación) | Investigación 1.1, función 32 | Alto — dos fuentes técnicas independientes (SKYbrary, Bytron Aviation Systems) más ofertas de empleo reales que usan el término de forma distinta | Ninguna verificación adicional crítica; candidato fuerte para promoción directa — importante para no diseñar en el futuro una función de "flight watch" de JETMI que se atribuya responsabilidad técnica del operador |
| Verificar los datos bancarios de un operador nuevo por un canal distinto al que los proporcionó (llamada de confirmación, no solo email) antes de pagar, para prevenir fraude de suplantación | Investigación 1.1, función 27 | Medio-alto — recomendación explícita de asociaciones sectoriales (EBAA/ACA), reforzada por un caso de fraude real documentado ($220.000, Paramount Business Jets) | Confirmar que la recomendación de EBAA/ACA es de cumplimiento no solo cuando existe, sino verificar directamente en sus publicaciones (no solo citada por fuente comercial secundaria) |
