Estado: fuente — investigación externa (documento de planificación, no conocimiento de industria en sí mismo), no verdad de JETMI
Última verificación: 2026-07-14
Verificado en: conversión fiel del PDF original a Markdown, sin editorializar
Fuente de verdad de datos: ninguna

# Mapa Maestro de Investigación — JETMI dentro de LIFEOS

**Tipo de artefacto:** documento de planificación de investigación (no narrativo, no conocimiento de industria en sí mismo). Precede a la investigación capítulo a capítulo del Manual Operativo. Define qué falta investigar, dependencias, criticidad y orden — no es evidencia sobre cómo funciona el sector, es el plan de cómo investigarlo.

**Naturaleza declarada por el propio documento:** "esto no es un capítulo del manual. Es el mapa de dependencias que determina qué hay que investigar, en qué orden, con qué nivel de rigor y con qué tipo de fuentes, antes de que tenga sentido seguir escribiendo capítulos narrativos."

### Convención de etiquetado usada en todo el documento

| Etiqueta | Significado |
|---|---|
| `[HECHO VERIFICADO]` | Confirmado con fuente primaria o normativa directa |
| `[PRÁCTICA HABITUAL]` | Estándar de facto en la industria, con independencia del país |
| `[VARIACIÓN POR JURISDICCIÓN]` | Cambia según el país/región — requiere verificación local |
| `[PRÁCTICA DE ALGUNAS EMPRESAS]` | No universal — depende del modelo de negocio o del tamaño |
| `[HIPÓTESIS]` | Supuesto de trabajo razonable, no confirmado todavía |
| `[OPINIÓN/INTERPRETACIÓN]` | Análisis o recomendación mía, no un hecho |
| `[INFORMACIÓN NO VERIFICADA]` | Dato que circula en fuentes secundarias pero no he podido confirmar |
| `[PREGUNTA ABIERTA]` | No se puede avanzar sin que tú (o una fuente primaria) la respondas |

*(Nota de conversión — tablas: varias tablas de este documento (tabla de cobertura 1.1, tabla resumen maestra Parte 4) estaban divididas por saltos de página en el PDF original, con columnas cortadas por el layout. Se reconstruyeron fielmente en Markdown estándar a partir del contenido de cada celda — no son una transcripción byte a byte del layout original.)*

---

## PARTE 1 — Diagnóstico crítico del índice actual (15 capítulos)

El índice original nació de una pregunta legítima pero distinta de la que ahora nos ocupa: *"¿cómo funciona la industria de la aviación privada?"*. La pregunta que ahora hay que resolver es más amplia: *"¿qué necesito saber para construir, operar, automatizar, controlar y escalar una empresa concreta —JETMI— dentro de una restricción muy específica: una sola persona, apoyada en sistemas y agentes de IA, en paralelo a otro trabajo?"*.

Esa segunda pregunta **no está contenida** en la primera. El índice original es, casi en su totalidad, conocimiento de **industria** (cómo se mueve el sector). Prácticamente no contiene conocimiento de **construcción de empresa** (cómo se monta, se protege legalmente, se cobra, se asegura, se defiende del fraude, se organiza, se mide y se automatiza). Los 24 dominios listados (ver más abajo) hacen explícito ese segundo bloque, que en el índice de 15 capítulos apenas aparecía.

### 1.1 Tabla de cobertura: capítulo original → dominio(s) de los 24 que cubre

| Cap. original | Cubre (de la lista de 24) | Veredicto |
|---|---|---|
| 1. Visión global de la industria | 8 (regulación, parcialmente), 15 (parcialmente) | Mantener — ya hecho, es la base de casi todo lo demás |
| 2. Qué es realmente un broker | 19 (parcialmente, define el rol antes de comprimirlo) | Mantener sin cambios |
| 3. Ciclo completo de un vuelo | 5 (completo) | Mantener como columna vertebral, pero tratarlo como sistema con retroalimentación, no como lista lineal |
| 4. Modelo de negocio | 2, 6 (parcialmente) | Dividir — ver 1.3 |
| 5. Operadores | 4, 15 (parcialmente) | Fusionar con el capítulo 6 |
| 6. Aircraft | 4 (parcialmente) | Fusionar con el capítulo 5 |
| 7. Clientes | 3 (parcialmente — falta captación) | Mantener, pero ampliar con marketing/ventas (que hoy no cubre) |
| 8. Requests | 5 (parcialmente) | Mantener como sub-fase del ciclo (cap. 3) |
| 9. Quotes | 5, 6 (parcialmente) | Mantener como sub-fase |
| 10. Negociación | 5, 6 (parcialmente) | Mantener como sub-fase |
| 11. Operación del vuelo | 5, 12 (parcialmente) | Mantener, pero separar explícitamente la gestión de incidencias como su propia investigación |
| 12. Después del vuelo | 5, 9 (parcialmente) | Mantener como sub-fase |
| 13. Herramientas utilizadas actualmente | 16 (parcialmente — solo herramientas de la industria, no de gestión empresarial) | Mantener, pero ampliar el alcance (ver 1.3) |
| 14. Dolor real de la industria | Transversal | Mantener, pero reposicionar casi al final — su valor se multiplica una vez conocidos todos los dominios, no solo la visión de industria |
| 15. Oportunidades | Transversal | Mantener como cierre, sin cambios de fondo |

**Dominios de la lista de 24 que el índice original NO cubre en absoluto:** 1 (creación de la empresa), 7 (contratos), 9 (pagos/tesorería/fiscalidad), 10 (seguros/riesgo), 11 (fraude/verificación de contrapartes), 12 (incidencias, como investigación propia y no solo como sub-paso), 13 (customer service 24/7), 14 (sales/marketing/partnerships), 17 (datos y conocimiento), 18 (KPIs/reporting), 19 (organización interna), 20 (escalabilidad internacional), 21 (business continuity), 22 (seguridad de la información), 23 (automatización e IA), 24 (diseño AI-native de una persona).

⚪ **[OPINIÓN/INTERPRETACIÓN]** Esto no es un fallo del índice original — es la consecuencia natural de haber empezado, con buen criterio, por entender el sector antes que la empresa. Pero si seguimos capítulo a capítulo por el orden original, llegaríamos al Capítulo 15 sabiendo mucho de aviación y prácticamente nada de cómo constituir, defender legalmente, asegurar, cobrar, o automatizar JETMI. Hay que intercalar los dos bloques, no terminar uno antes de empezar el otro.

### 1.2 Un principio de diseño que cambia todo lo demás

⚪ **[OPINIÓN/INTERPRETACIÓN]** El dominio 24 ("diseño de una organización AI-native operada por una sola persona") no es un capítulo más de la lista. Es **una restricción de diseño que debe aplicarse a cada uno de los demás dominios**, no un tema que se investiga al final y ya está. La pregunta correcta no es "¿cómo gestiona customer service un broker típico?" sino "¿cómo se gestiona customer service 24/7 cuando quien está detrás es una sola persona con apoyo de agentes de IA?". Esa pregunta cambia la respuesta en pricing, en gestión de incidencias, en verificación de contrapartes, en organización, en casi todo.

Por eso, en el mapa maestro de la Parte 3, cada área de investigación incluye un campo obligatorio: **"Implicación para el modelo de una sola persona + IA"**. No se investiga como capítulo aparte al final — se investiga en paralelo, como una lente que se aplica a cada dominio desde el principio. El dominio 23 (automatización e IA) sí merece, además, su propio bloque de investigación dedicado — porque hay preguntas técnicas (qué puede hacer hoy un agente de IA de forma fiable, qué APIs existen, qué no es automatizable todavía) que no se resuelven solo aplicando la lente a los demás capítulos.

### 1.3 Divisiones y fusiones concretas

- **Capítulo 4 original ("Modelo de negocio") se divide en dos investigaciones distintas**, porque mezclaba dos preguntas de naturaleza diferente:
  - Una pregunta **legal/estratégica** ("¿actuará JETMI como agente o como principal? ¿mayorista o minorista?") que **depende de la jurisdicción** y debe resolverse pronto, casi al principio (pasa a formar parte de la Fase 0).
  - Una pregunta **de mecánica de mercado** ("¿qué rangos de comisión son habituales, cómo se negocian los netos con operadores?") que sí puede investigarse con fuentes abiertas más adelante (Fase 2).
- **Capítulos 5 y 6 original ("Operadores" y "Aircraft") se fusionan** en una única investigación de "supply" — evaluar operadores sin entender la aeronave que hay detrás (autonomía, categoría, restricciones) es una evaluación incompleta, y viceversa.
- **Capítulos 3, 8, 9, 10, 11 y 12 original se mantienen desglosados** como sub-fases (porque cada una tiene información, sistemas y riesgos distintos, tal como el prompt original pedía), pero se investigan como **un único sistema con bucles de retroalimentación** (p. ej., un incidente en la fase de operación —Cap. 11— cambia lo que hay que decidir en pricing y en contratos, que están en otras investigaciones) y no como una secuencia que se cierra capítulo a capítulo sin mirar atrás.
- **Capítulo 13 ("Herramientas actuales") se mantiene pero se amplía de alcance:** la versión original solo pedía herramientas de la industria (Avinode, FL3XX, etc.). El diseño de JETMI necesita, además, herramientas de gestión empresarial (contabilidad, CRM, comunicaciones, automatización) — esto se investiga junto con el dominio 16 completo, no solo con la porción aeronáutica.

---

## PARTE 2 — Preguntas críticas que necesito que resuelvas antes de poder diseñar bien varias de las investigaciones

Estas preguntas no son un capricho metodológico: varias áreas de la Parte 3 literalmente no se pueden investigar con precisión sin una respuesta, aunque sea provisional.

1. **[PREGUNTA ABIERTA]** ¿Desde qué jurisdicción se constituirá legalmente JETMI (España, otra jurisdicción de la UE, EE.UU., o una estructura mixta)? Esto condiciona directamente los dominios 1, 7, 8, 9, 10, 22.
2. **[PREGUNTA ABIERTA]** ¿En qué mercado(s) geográfico(s) buscará clientes JETMI al principio (España, Europa, LATAM, global)? Condiciona el dominio 20 y el enfoque de 3 y 14.
3. **[PREGUNTA ABIERTA]** ¿Hay ya una inclinación sobre si JETMI actuará como **agente** (comisión declarada, sin margen oculto) o como **principal/indirect air carrier** (compra-reventa con margen propio)? Esto no es solo preferencia — tiene implicaciones legales y fiscales distintas.
4. **[PREGUNTA ABIERTA]** ¿JETMI llegará a tocar directamente el dinero del cliente (cobro y luego pago al operador), o se apoyará en una pasarela/cuenta de terceros (escrow, Paynode, etc.) desde el principio? Esto condiciona fuertemente los dominios 9, 10, 11 y 22.
5. **[PREGUNTA ABIERTA]** ¿Cuál es el horizonte de tiempo real hasta el primer vuelo vendido? Cambia qué se puede posponer sin poner en riesgo el MVP.
6. **[PREGUNTA ABIERTA]** ¿El "trabajo en paralelo" impone alguna restricción horaria dura (p. ej., no disponibilidad en ciertas franjas) que el diseño de disponibilidad 24/7 (dominio 13) deba resolver desde el minuto uno con automatización, y no "ya lo cubriré cuando crezca"?
7. **[PREGUNTA ABIERTA]** ¿Existe ya alguna relación previa con operadores, mentores del sector, abogados de aviación o aseguradoras — o partimos de cero en fuentes primarias?

⚪ **[OPINIÓN/INTERPRETACIÓN]** No hace falta responderlas todas ahora mismo con precisión total — pero al menos una hipótesis de trabajo en la 1, 3 y 4 es necesaria antes de investigar a fondo los dominios 7, 8, 9 y 10, porque ahí sí que no hay una única respuesta "de industria": depende de una decisión propia.

**Nota de procedencia (añadida en la ingestión, no parte del original):** ninguna de estas siete preguntas tiene todavía una respuesta registrada en `/docs`. `DECISIONS.md` JETMI-D1 responde parcialmente y de forma indirecta a la pregunta 3 en cuanto al posicionamiento general (broker operado, no plataforma de descubrimiento), pero no fija explícitamente agente vs. principal. Ver `HYPOTHESES.md` para el registro de estas preguntas como abiertas.

---

## PARTE 3 — El Mapa Maestro de Investigación

Estructurado en fases con dependencias explícitas. La Fase 5 (organización AI-native) no es secuencial — se investiga en paralelo desde la Fase 0, como se explica en 1.2.

### FASE 0 — Fundamentos legales y de negocio (BLOQUEANTE, antes de operar el primer vuelo)

**0.1 Constitución legal y elegibilidad regulatoria de JETMI**
- Objetivo: determinar la forma jurídica, el país de constitución, y si existe algún requisito de registro/licencia previo a operar como intermediario de chárter.
- Preguntas clave: ¿Qué forma societaria conviene (autónomo, SL, otra)? ¿Existe alguna obligación de registro específica para brokers en la jurisdicción elegida (a diferencia de EE.UU., donde sí existe registro DOT bajo la Part 295)? ¿Qué pasa si JETMI capta clientes en un país y trabaja con operadores en otro?
- Decisiones que dependen de esto: estructura societaria, dónde se factura, qué contratos son válidos, qué seguros son obligatorios.
- Criticidad: Bloqueante.
- Fuentes necesarias: abogado especializado en derecho aeronáutico/mercantil de la jurisdicción elegida (fuente primaria, no sustituible por búsqueda web).
- Dependencias: Pregunta abierta #1 de la Parte 2.
- Criterio de suficiencia: tener por escrito, de una fuente legal cualificada, la forma societaria recomendada y la lista de registros/autorizaciones necesarias antes de facturar el primer vuelo.

**0.2 Decisión de modelo de negocio y capacidad jurídica (agente vs. principal, mayorista vs. minorista)**
- Objetivo: decidir, con conocimiento de causa, bajo qué capacidad actuará JETMI frente al cliente y frente al operador.
- Preguntas clave: ¿Qué implicaciones fiscales y de responsabilidad tiene cada capacidad? ¿Qué modelo permite operar con menos estructura al principio?
- Decisiones que dependen de esto: redacción de contratos (2.2), tratamiento fiscal (2.3), tipo de seguro necesario (2.4), mensajes legales obligatorios de cara al cliente.
- Criticidad: Bloqueante.
- Fuentes necesarias: asesoría legal + fiscal combinada; en menor medida, benchmarking de cómo lo hacen brokers ya operativos 🟣 [PRÁCTICA DE ALGUNAS EMPRESAS — no asumir que todos eligen lo mismo].
- Dependencias: 0.1, Pregunta abierta #3.
- Criterio de suficiencia: una decisión documentada, justificada, y validada por quien lleve la parte legal/fiscal.

**0.3 Regulación y compliance por jurisdicción (ampliación del Capítulo 1)**
- Objetivo: mapear, jurisdicción por jurisdicción relevante para JETMI, qué obligaciones de transparencia, protección al consumidor, KYC/AML y protección de datos aplican.
- Preguntas clave: ¿Qué hay que divulgar al cliente y cuándo? ¿Aplica alguna normativa de protección al viajero equivalente a la de paquetes turísticos? ¿Qué obligaciones de KYC/AML aplican si JETMI gestiona pagos de clientes internacionales?
- Decisiones que dependen de esto: textos legales obligatorios en cotizaciones y contratos, proceso de alta de cliente, proceso de verificación de operadores.
- Criticidad: Bloqueante en lo básico (divulgación al cliente, protección de datos); diferible en detalle para jurisdicciones donde JETMI no operará en el primer año.
- Fuentes necesarias: normativa primaria (AESA, DOT/FAA si se opera con clientes de EE.UU., EASA), y validación legal para la interpretación aplicada al caso concreto.
- Dependencias: 0.1, 0.2.
- Criterio de suficiencia: checklist de obligaciones de disclosure y KYC/AML validado por un abogado, para cada jurisdicción donde JETMI facture en el primer año.

### FASE 1 — Conocimiento de industria (ya iniciada; reestructuración de los capítulos 1-2, 5-7 del índice original)

**1.1 Qué es y qué hace un broker, día a día** *(= Capítulo 2 original, sin cambios)*
- Objetivo: mapear responsabilidades, información necesaria, herramientas, errores frecuentes y criterios de éxito de un broker en ejercicio.
- Decisiones que dependen de esto: definición del rol antes de decidir qué partes se automatizan (alimenta directamente 5.1).
- Criticidad: Alta, no bloqueante para constituir la empresa pero sí para diseñar el día a día.
- Fuentes necesarias: fuentes secundarias de industria + idealmente una entrevista con un broker en activo [fuente primaria recomendada, no imprescindible].
- Dependencias: Capítulo 1 (ya hecho).
- Criterio de suficiencia: poder describir una jornada completa de un broker, tarea a tarea, sin lagunas.
- Implicación para una sola persona + IA: este capítulo debe terminar con una tabla explícita de qué tareas del día a día son candidatas a IA/automatización y cuáles requieren juicio humano no delegable.

*(Nota de procedencia: este dominio 1.1 es exactamente el que cubre `investigacion-1-1-trabajo-real-broker.md`, la tercera fuente ingerida junto con este mapa — ver `LOG.md`.)*

**1.2 Supply — operadores y aeronaves** *(fusión de Capítulos 5 y 6 originales)*
- Objetivo: entender qué información hay que mantener sobre cada operador y cada tipo de aeronave para poder evaluarlos, seleccionarlos y negociar con ellos.
- Preguntas clave: ¿Qué datos son imprescindibles para no cometer un error de seguridad o de idoneidad? ¿Cómo cambia esa información en el tiempo (renovaciones de rating, cambios de flota)?
- Decisiones que dependen de esto: diseño del sistema de "ficha de operador/aeronave" en LIFEOS, criterios de vetting mínimos de JETMI.
- Criticidad: Alta.
- Fuentes necesarias: documentación pública de ARGUS/Wyvern/IS-BAO + idealmente conversación con un operador o un broker sobre qué mira en la práctica.
- Dependencias: Capítulo 1.
- Criterio de suficiencia: una plantilla completa de qué campos de datos hay que mantener por operador y por aeronave, y con qué frecuencia se revisan.
- Implicación para una sola persona + IA: ¿qué parte de la verificación (vigencia de ratings, seguros, certificados) puede monitorizar un agente de IA de forma continua en vez de revisarla manualmente?

**1.3 Demanda — clientes y ciclo de vida** *(= Capítulo 7 original, ampliado)*
- Objetivo: mapear el ciclo de vida completo del cliente (CRM, preferencias, historial, facturación, incidencias) — el original ya cubre esto bien, solo falta conectar con captación (dominio 14).
- Criticidad: Alta.
- Fuentes necesarias: secundarias de industria + práctica de CRM en servicios de alto valor.
- Dependencias: ninguna estricta, puede investigarse en paralelo a 1.2.
- Criterio de suficiencia: un modelo de datos de cliente completo, sin huecos, listo para diseñar el CRM de LIFEOS.
- Implicación para una sola persona + IA: qué parte del seguimiento de cliente (recordatorios, seguimiento post-vuelo, detección de necesidades recurrentes) puede llevarla un agente sin intervención humana directa.

**1.4 Ciclo operativo completo end-to-end** *(= Capítulos 3, 8, 9, 10 —parte—, 11, 12 originales, tratados como un sistema)*
- Objetivo: desde "necesito un avión" hasta días después del vuelo, sin omitir ningún paso, marcando explícitamente en qué puntos el ciclo retroalimenta a otras investigaciones (pricing, contratos, incidencias, KPIs).
- Criticidad: Bloqueante para poder diseñar cualquier automatización — es el esqueleto de todo el producto.
- Fuentes necesarias: secundarias + validación con un broker en activo si es posible.
- Dependencias: 1.1, 1.2, 1.3.
- Criterio de suficiencia: un diagrama de flujo verificado, paso a paso, con la información de entrada/salida, documentos y sistemas de cada paso.
- Implicación para una sola persona + IA: este es el capítulo donde más rinde la lente AI-native — cada paso debe anotarse como "humano", "IA con supervisión" o "IA autónoma".

### FASE 2 — Dinero, contratos y riesgo (BLOQUEANTE parcial)

**2.1 Pricing, márgenes, comisiones y negociación** *(parte del Cap. 4 original + Cap. 10)*
- Criticidad: Alta — necesario antes de cotizar el primer vuelo, pero no bloquea la constitución de la empresa.
- Dependencias: 0.2 (modelo de negocio), 1.2 (supply).
- Criterio de suficiencia: una política de pricing propia de JETMI, documentada, no solo una descripción de "lo que hace el mercado".
- Implicación para una sola persona + IA: ¿puede un agente de IA generar una primera propuesta de precio dentro de una banda predefinida, dejando la negociación fina a la persona?

**2.2 Contratos y responsabilidades** *(nuevo)*
- Objetivo: definir qué contratos necesita JETMI (con el cliente, con el operador, con otros brokers) y qué cláusulas son estándar de protección frente a cancelaciones, sustituciones de aeronave, impagos.
- Criticidad: Bloqueante.
- Fuentes necesarias: abogado de aviación/mercantil (fuente primaria imprescindible, no sustituible por plantillas genéricas de internet).
- Dependencias: 0.1, 0.2, 0.3.
- Criterio de suficiencia: plantillas de contrato revisadas y aprobadas por un abogado, listas para el primer vuelo.
- Implicación para una sola persona + IA: un agente de IA puede pre-rellenar y hacer control de versiones de contratos, pero la validación legal de cláusulas nuevas no es delegable.

**2.3 Pagos, tesorería, fiscalidad y contabilidad** *(nuevo)*
- Preguntas clave: ¿JETMI cobra antes de pagar al operador o al revés? ¿Qué pasarela de pago usar? ¿Cómo se factura un servicio que cruza fronteras (IVA intracomunitario, retenciones)?
- Criticidad: Bloqueante.
- Fuentes necesarias: asesor fiscal/gestoría 🌐 [VARIACIÓN POR JURISDICCIÓN — depende enteramente del país de constitución], documentación de proveedores de pago (Paynode, Stripe, etc.).
- Dependencias: 0.1, 0.2, 0.3, Pregunta abierta #4.
- Criterio de suficiencia: un flujo de caja modelo (con cifras de ejemplo) validado por un asesor fiscal.
- Implicación para una sola persona + IA: conciliación bancaria y generación de facturas son candidatas casi perfectas a automatización total.

**2.4 Seguros y gestión del riesgo** *(nuevo)*
- Objetivo: determinar qué pólizas necesita JETMI (responsabilidad civil profesional, E&O — errors & omissions —, y qué cubre/no cubre el seguro del operador).
- Criticidad: Bloqueante (operar sin cobertura adecuada es un riesgo existencial para una empresa de una sola persona).
- Fuentes necesarias: corredor de seguros especializado en aviación (fuente primaria).
- Dependencias: 0.1, 0.2, 2.2.
- Criterio de suficiencia: al menos una póliza contratada o cotizada formalmente antes del primer vuelo.
- Implicación para una sola persona + IA: ninguna relevante — esto es inherentemente una decisión humana y contractual.

**2.5 Fraude y verificación de contrapartes** *(nuevo)*
- Objetivo: diseñar el proceso de verificación de identidad y solvencia de clientes nuevos, y de autenticidad de operadores nuevos (evitar suplantación de operador, pagos fraudulentos, "vuelos fantasma").
- Preguntas clave: ¿qué señales de alerta existen en el sector (operador que pide pago a cuenta personal, cliente que presiona con urgencia inusual)? ¿qué verificación mínima es razonable sin ralentizar la venta?
- Criticidad: Alta — especialmente crítico para una operación de una sola persona sin equipo de back-office que haga de segunda revisión.
- Fuentes necesarias: foros/documentación de la industria sobre fraude en chárter [en parte INFORMACIÓN NO VERIFICADA hasta contrastarla] + posible consulta con asociaciones sectoriales (NBAA/EBAA publican alertas).
- Dependencias: 1.2 (supply), 2.3 (pagos).
- Criterio de suficiencia: un checklist de verificación mínima, con puntos de corte claros de cuándo escalar a revisión manual.
- Implicación para una sola persona + IA: este es un candidato natural a un agente de verificación automática (cruces de datos, alertas), precisamente porque compensa la ausencia de un segundo par de ojos humano.

*(Nota de procedencia: `investigacion-1-1-trabajo-real-broker.md` sección J señala una posible tensión entre este dominio 2.5 tal como está planteado aquí y su propia evidencia — ver `HYPOTHESES.md`.)*

### FASE 3 — Operación y servicio continuos (ALTA prioridad)

**3.1 Gestión de incidencias operativas** *(desglose explícito, antes implícito en el Cap. 11)*
- Objetivo: catalogar los tipos de incidencia (mecánica, meteorología, cancelación de cliente, cancelación de operador, retraso) y el protocolo de respuesta para cada una.
- Criticidad: Alta.
- Dependencias: 1.4 (ciclo operativo).
- Criterio de suficiencia: un protocolo por tipo de incidencia con pasos concretos y umbrales de decisión.
- Implicación para una sola persona + IA: aquí es donde más se juega la viabilidad del modelo "una persona" — un agente de IA que monitorice vuelos y dispare alertas/acciones de contingencia de forma proactiva es casi un requisito, no un lujo.

**3.2 Customer service y disponibilidad 24/7** *(nuevo)*
- Objetivo: diseñar cómo se cubre la atención continua sin equipo, combinando IA conversacional, alertas y escalado a la persona solo cuando haga falta.
- Criticidad: Bloqueante para el modelo operativo (no para constituir la empresa, pero sí para poder venderle a un cliente la promesa de disponibilidad que exige el sector).
- Fuentes necesarias: benchmarking de cómo lo resuelven brokers pequeños hoy 🟣 [PRÁCTICA DE ALGUNAS EMPRESAS] + capacidades reales de las herramientas de IA conversacional disponibles.
- Dependencias: 1.4, 5.2 (automatización/IA).
- Criterio de suficiencia: un diseño de flujo de escalado (IA → persona) con tiempos de respuesta objetivo definidos.
- Implicación para una sola persona + IA: es, en sí mismo, el dominio donde la lente AI-native más se convierte en el contenido principal, no un añadido.

**3.3 Gestión continua de la relación con operadores y proveedores** *(ampliación del Cap. 5, distinta de 1.2)*
- Objetivo: a diferencia de 1.2 (qué información mantener), aquí se investiga cómo se mantiene y mejora la relación en el tiempo (renegociación, prioridad de respuesta, gestión de conflictos).
- Criticidad: Media — importante para escalar, no bloqueante para el primer vuelo.
- Dependencias: 1.2.
- Criterio de suficiencia: un playbook de gestión de relación con proveedores clave.
- Implicación para una sola persona + IA: seguimiento de KPIs de cada operador (tiempo de respuesta, tasa de cancelación) es automatizable; la negociación relacional en sí no lo es.

### FASE 4 — Crecimiento y sistema empresarial

**4.1 Sales, marketing, partnerships y retención** *(nuevo)*
- Objetivo: diseñar cómo capta JETMI a sus primeros clientes y cómo los retiene, y qué partnerships (otros brokers, concierges, family offices) tienen sentido al principio.
- Criticidad: Bloqueante en el sentido de que sin esto no hay negocio — pero investigable en paralelo, no requiere estar resuelto antes de la Fase 0.
- Dependencias: 1.3 (clientes).
- Criterio de suficiencia: un plan de captación con al menos un canal validado como viable para una sola persona.
- Implicación para una sola persona + IA: generación de contenido, prospección inicial y seguimiento de leads son altamente automatizables; la relación de confianza inicial con cada cliente, no tanto.

**4.2 Tecnología y herramientas existentes** *(= Cap. 13 original, alcance ampliado)*
- Objetivo: mapear no solo las herramientas de industria (Avinode, FL3XX, JetNet, Leon, Veryon, FlightBridge, MySky) sino también las de gestión empresarial (CRM, contabilidad, comunicación) que JETMI necesitará integrar en LIFEOS.
- Criticidad: Alta.
- Dependencias: 1.4.
- Criterio de suficiencia: matriz de herramientas con qué hace bien, qué hace mal, coste, y si tiene API (crítico para automatización).
- Implicación para una sola persona + IA: la disponibilidad de API en cada herramienta condiciona directamente qué se puede automatizar dentro de LIFEOS.

**4.3 Datos y conocimiento que la empresa debe conservar** *(nuevo)*
- Objetivo: definir el modelo de datos maestro de JETMI (qué se guarda de cada cliente, operador, aeronave, vuelo, incidencia) que servirá de columna vertebral a LIFEOS.
- Criticidad: Bloqueante para el diseño técnico de LIFEOS, aunque no para operar el primer vuelo de forma manual.
- Fuentes necesarias: síntesis de todo lo investigado en las fases 1 a 3 — este dominio no tiene fuente externa propia, se construye a partir de los demás.
- Dependencias: 1.2, 1.3, 1.4, 2.1-2.5, 3.1-3.3.
- Criterio de suficiencia: un esquema de datos completo, revisado contra cada capítulo anterior para verificar que no faltan campos.
- Implicación para una sola persona + IA: este es, de hecho, el entregable técnico que hace posible la automatización de todo lo demás — sin este modelo de datos, ningún agente de IA tiene con qué trabajar.

**4.4 KPIs, reporting y gestión empresarial** *(nuevo)*
- Objetivo: definir qué métricas indican que JETMI va bien o mal (margen medio, tasa de conversión de cotización a venta, tiempo de respuesta a RFQ, tasa de incidencias, NPS de cliente).
- Criticidad: Media.
- Dependencias: 4.3.
- Criterio de suficiencia: un cuadro de mando mínimo viable con menos de 10 métricas, todas calculables desde el modelo de datos de 4.3.
- Implicación para una sola persona + IA: generación automática de informes periódicos es de las automatizaciones más sencillas y rentables de todo el mapa.

### FASE 5 — Organización AI-native (TRANSVERSAL, se investiga desde el principio, no al final)

**5.1 Organización interna comprimida en una persona + IA**
- Objetivo: una vez mapeadas todas las tareas de las fases 1 a 4, decidir explícitamente qué hace la persona, qué hace un agente de IA con supervisión, y qué hace un agente de IA de forma autónoma.
- Criticidad: Bloqueante para el diseño de LIFEOS, aunque se puede empezar de forma provisional desde ya e ir refinando.
- Fuentes necesarias: síntesis interna (no hay fuente externa que resuelva esto — es una decisión de diseño).
- Criterio de suficiencia: un organigrama funcional (no de personas, de funciones) con cada función asignada a "humano", "IA supervisada" o "IA autónoma".
- Implicación para una sola persona + IA: es literalmente el objeto de este dominio, no aplica como "lente adicional".

**5.2 Automatización e inteligencia artificial — capacidades reales disponibles**
- Objetivo: a diferencia de 5.1 (qué debería automatizarse), aquí se investiga qué es técnicamente viable *hoy* con las herramientas de IA disponibles — para no diseñar sobre supuestos irreales.
- Criticidad: Alta.
- Fuentes necesarias: capacidades documentadas de las herramientas de IA/automatización concretas que se vayan a usar; esto envejece rápido y debe revisarse periódicamente, no darse por cerrado.
- Dependencias: 5.1, y en la práctica, de cada fase anterior a medida que se completa.
- Criterio de suficiencia: una lista de automatizaciones "listas para construir ya" separada de una lista de "esperar a que la tecnología/tooling madure".

### FASE 6 — Resiliencia y escala (mayormente diferible, con excepciones)

**6.1 Escalabilidad y expansión internacional** *(diferible)* — Diferible, no bloquea el MVP. Dependencias: 0.1, 0.3, 5.1.

**6.2 Business continuity y crisis management** *(parcialmente NO diferible)* — El caso base ("bus factor 1") no es diferible — es un riesgo estructural de la restricción "una sola persona" y debe resolverse, aunque sea de forma mínima, antes del primer vuelo. El resto (planes de crisis reputacional a gran escala, etc.) sí es diferible. Dependencias: 3.1, 5.1.

**6.3 Seguridad de la información y protección de datos** *(el baseline NO es diferible; la arquitectura avanzada sí)* — Bloqueante en lo básico (consentimiento, tratamiento de datos personales, custodia segura de documentos de pasajeros); diferible en controles avanzados. Fuentes: normativa RGPD/AEPD 🌐 [VARIACIÓN POR JURISDICCIÓN]. Dependencias: 0.1, 0.3.

### FASE 7 — Síntesis final (solo tiene sentido al terminar todo lo anterior)

**7.1 Dolor real de la industria** *(= Cap. 14 original, reposicionado)* — nutrido de todas las fases anteriores, no solo de la visión de industria del Capítulo 1.

**7.2 Oportunidades** *(= Cap. 15 original, cierre del manual)* — lista de oportunidades, cada una trazable a una o varias fases concretas de este mapa maestro.

---

## PARTE 4 — Tabla resumen maestra

| # | Área | Fase | Criticidad | ¿Bloqueante MVP? | Fuente principal |
|---|---|---|---|---|---|
| 0.1 | Constitución legal | 0 | Bloqueante | Sí | Abogado |
| 0.2 | Modelo de negocio (capacidad jurídica) | 0 | Bloqueante | Sí | Legal + fiscal |
| 0.3 | Regulación por jurisdicción | 0 | Bloqueante (básico) | Sí | Normativa + legal |
| 1.1 | Qué es un broker, día a día | 1 | Alta | No | Secundarias + entrevista |
| 1.2 | Supply (operadores + aeronaves) | 1 | Alta | No | Secundarias + ARGUS/Wyvern |
| 1.3 | Demanda (clientes) | 1 | Alta | No | Secundarias |
| 1.4 | Ciclo operativo end-to-end | 1 | Bloqueante | Sí (para diseño técnico) | Secundarias + entrevista |
| 2.1 | Pricing y comisiones | 2 | Alta | No | Secundarias + validación |
| 2.2 | Contratos | 2 | Bloqueante | Sí | Abogado |
| 2.3 | Pagos/tesorería/fiscal | 2 | Bloqueante | Sí | Asesor fiscal |
| 2.4 | Seguros y riesgo | 2 | Bloqueante | Sí | Corredor de seguros |
| 2.5 | Fraude y verificación | 2 | Alta | No, pero recomendable | Secundarias + sectorial |
| 3.1 | Gestión de incidencias | 3 | Alta | No | Secundarias + experiencia |
| 3.2 | Customer service 24/7 | 3 | Bloqueante (modelo operativo) | Sí | Benchmarking + tooling IA |
| 3.3 | Relación continua con proveedores | 3 | Media | No | Secundarias |
| 4.1 | Sales/marketing/partnerships | 4 | Bloqueante (para haber negocio) | Sí, en paralelo | Secundarias |
| 4.2 | Tecnología y herramientas | 4 | Alta | No | Documentación + pruebas |
| 4.3 | Datos y conocimiento | 4 | Bloqueante (diseño técnico) | Sí | Síntesis interna |
| 4.4 | KPIs y reporting | 4 | Media | No | Diseño propio |
| 5.1 | Organización AI-native | 5 | Bloqueante (diseño) | Sí | Síntesis interna |
| 5.2 | Capacidades reales de IA | 5 | Alta | No, iterativo | Tooling concreto |
| 6.1 | Escalabilidad internacional | 6 | Diferible | No | — |
| 6.2 | Business continuity | 6 | Bloqueante (caso base) | Sí (mínimo) | Diseño propio |
| 6.3 | Seguridad de la información | 6 | Bloqueante (básico) | Sí (mínimo) | Normativa RGPD |
| 7.1 | Dolor real de la industria | 7 | Transversal | No | Síntesis |
| 7.2 | Oportunidades | 7 | Transversal | No | Síntesis |

---

## PARTE 5 — Orden de investigación recomendado

⚪ **[OPINIÓN/INTERPRETACIÓN]** Se recomienda esta secuencia, no la del índice original, precisamente porque intercala fundamentos legales con conocimiento de industria en vez de posponer todo lo legal al final:

1. Responder (aunque sea de forma provisional) las preguntas abiertas de la Parte 2.
2. Fase 0 completa (0.1 → 0.2 → 0.3) — con apoyo legal real, no solo investigación documental.
3. Fase 1 completa (1.1 → 1.2 → 1.3 → 1.4) — aquí retomamos el estilo "capítulo narrativo" del manual original.
4. Fase 2 completa (2.1 → 2.2 → 2.3 → 2.4 → 2.5), en paralelo si es posible con la validación legal de la Fase 0.
5. Fase 3 completa (3.1 → 3.2 → 3.3).
6. Fase 4 completa (4.1 → 4.2 → 4.3 → 4.4).
7. Fase 5 (5.1 y 5.2) — cerrarla formalmente aquí, con todo el material ya disponible, aunque en realidad debería ir anotándose desde la Fase 1 en adelante.
8. Fase 6 en su versión mínima (6.2 y 6.3 baseline; 6.1 se pospone de verdad).
9. Fase 7 (7.1 → 7.2) como cierre del manual completo.

### Estado de este documento (según el original)

"Este mapa maestro está listo para tu revisión. No he escrito ningún capítulo narrativo nuevo — es la estructura de investigación que debería regir cómo completamos el manual a partir de aquí." Quedaba a la espera de: validación o corrección del mapa; al menos una hipótesis de trabajo sobre las preguntas abiertas de la Parte 2 (en particular 1, 3 y 4); confirmación de por dónde empezar (Fase 0 o continuar primero la Fase 1).

**Nota de procedencia (añadida en la ingestión, no parte del original):** a fecha de esta ingestión (2026-07-14), las siete preguntas abiertas de la Parte 2 siguen sin respuesta registrada en `/docs`, salvo lo que `DECISIONS.md` JETMI-D1 ya fija indirectamente sobre el posicionamiento general. La investigación 1.1 (siguiente fuente ingerida) siguió efectivamente el punto de partida "Fase 1" sugerido aquí, no la Fase 0.
