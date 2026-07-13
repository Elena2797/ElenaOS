Estado: fuente — investigación externa, no verdad de JETMI (ver research/README.md)
Última verificación: 2026-07-14
Verificado en: conversión fiel del PDF original a Markdown, sin editorializar
Fuente de verdad de datos: ninguna

# INVESTIGACIÓN 1.1 — Qué hace realmente un broker de aviación privada

**Fase 1 del Mapa Maestro de Investigación — JETMI dentro de LIFEOS**

**Tipo de artefacto:** investigación funcional primaria, corresponde al dominio 1.1 del Mapa Maestro (`mapa-maestro-investigacion.md`). Amplía y matiza el Manual Operativo Capítulo 1, y genera preguntas nuevas.

### Convención de etiquetado (idéntica a la usada en el Mapa Maestro)

`[HECHO VERIFICADO]` · `[PRÁCTICA HABITUAL]` · `[VARIACIÓN POR JURISDICCIÓN]` · `[PRÁCTICA DE ALGUNAS EMPRESAS]` · `[HIPÓTESIS]` · `[OPINIÓN/INTERPRETACIÓN]` · `[INFORMACIÓN NO VERIFICADA]` · `[PREGUNTA ABIERTA]`

**Advertencia metodológica honesta, del propio documento, antes de empezar:** la mayoría de las fuentes disponibles públicamente sobre "qué hace un broker" son contenido comercial (blogs de brokers explicando su propio valor) o descripciones de puesto de trabajo (que dicen qué se espera, no necesariamente qué ocurre realmente). Se priorizó, dentro de lo que el acceso a fuentes abiertas permite, ofertas de empleo reales (AirShare, Air Charter Service, Flygreen), prensa sectorial con testimonios directos de brokers en activo de varios países (Business Air News), y comunicados de asociaciones (EBAA, ACA) sobre fraude. **No se pudo acceder a SOPs internos, training materials propietarios, ni realizar entrevistas directas** — donde la evidencia es débil o inexistente, el documento lo dice explícitamente en vez de rellenar el hueco. Esto se traduce en una lista de preguntas abiertas real al final (sección H), no cosmética.

*(Nota de conversión — tablas: las tablas de las secciones E, F, G e I estaban divididas por saltos de página en el PDF original, con columnas cortadas por el layout (visible p. ej. en la columna "Consecuencia de una mala decisión" de la sección E, truncada como "Consecuenci" / "de una mala" / "decisión"). Se reconstruyeron fielmente en Markdown estándar a partir del contenido completo de cada celda — no son una transcripción byte a byte del layout original del PDF.)*

---

## A. RESUMEN EJECUTIVO

Qué hace realmente un broker no es "conectar clientes con aviones". Es sostener, en paralelo y de forma continua, **tres tipos de trabajo de naturaleza muy distinta**:

1. **Trabajo comercial** (captar, cualificar, proponer, negociar, cerrar, retener) — esto es lo único que casi toda la literatura pública describe.
2. **Trabajo de coordinación operativa** (verificar, normalizar información dispar, vigilar un vuelo en curso, reaccionar a incidencias, encontrar aeronaves de respaldo) — esto aparece mencionado, pero casi nunca desglosado en detalle en fuentes públicas.
3. **Trabajo invisible de mantenimiento** (perseguir respuestas, reconciliar información contradictoria entre canales, recordar compromisos, mantener relaciones que no producen venta inmediata) — esto **casi no aparece en ninguna fuente pública**, y sin embargo, según los propios testimonios de brokers recogidos en prensa sectorial, es donde se juega la reputación y la confianza a largo plazo.

La complejidad real no está en encontrar un avión — con Avinode, eso se ha simplificado mucho desde 2002 `[HECHO VERIFICADO — ver Manual, Cap. 1]`. La complejidad real está en: (a) **decidir en quién confiar** cuando la información de seguridad es voluntaria y de pago y las respuestas de operadores llegan en formatos no estandarizados; (b) **sostener varios "estados mentales" simultáneos** (varias solicitudes, varios vuelos en distintas fases, promesas hechas a distintos clientes) sin que ninguno se pierda; y (c) **estar disponible cuando algo sale mal**, que es precisamente cuando más presión hay y menos margen de error existe.

Un dato que cambia la lectura de todo lo demás: en las descripciones de trabajo reales encontradas (no en blogs, sino en ofertas de empleo publicadas), el "flight watching" (vigilancia de vuelos en curso) y estar disponible "virtualmente 24/7" a solicitudes urgentes aparecen como responsabilidades explícitas y ordinarias del broker `[HECHO VERIFICADO — ver fuentes de la sección C, funciones 31-32]`, no como una circunstancia excepcional. Esto tiene una implicación directa y temprana para el diseño de JETMI: **la disponibilidad continua no es una característica opcional de servicio premium, es parte estructural del puesto tal como existe hoy en el mercado.**

## B. MAPA FUNCIONAL COMPLETO

Funciones agrupadas en 11 clusters (algunas marcadas con \* fueron añadidas, no presentes en el listado original de la investigación). El orden aproxima el ciclo de vida de una operación, pero el cluster 11 es transversal y continuo, no ligado a un vuelo concreto.

| Cluster | Funciones incluidas |
|---|---|
| 1. Captación y pipeline comercial | Generación de leads · Recepción de leads entrantes · Cualificación del cliente |
| 2. Recepción y análisis de la solicitud | Recepción de la flight request · Aclaración de requisitos · Análisis inicial de viabilidad |
| 3. Sourcing | Selección de operadores a contactar · Búsqueda de aeronaves · Envío de RFQs · Seguimiento de RFQs · Interpretación y normalización de respuestas |
| 4. Evaluación y vetting | Evaluación de operador · Evaluación de aeronave · Safety vetting · Análisis de restricciones operativas |
| 5. Pricing y propuesta | Comparación de opciones · Pricing/markup/comisión · Preparación de la propuesta · Presentación al cliente · Seguimiento comercial |
| 6. Negociación y confirmación | Negociación con cliente · Negociación con operador · Gestión de cambios de solicitud · Colocación de option/hold · Confirmación y contrato |
| 7. Financiero | Cobro al cliente · Pago al operador |
| 8. Logística de pasajeros y trip support | Datos de pasajeros y manifiesto · Catering/transporte terrestre/mascotas/equipaje especial · Permisos y requisitos especiales |
| 9. Pre-vuelo y operación activa | Coordinación pre-flight · Seguimiento operativo ("flight watch" del broker) · Gestión de incidencias · Aircraft substitution/backup · Comunicación con cliente durante incidencias |
| 10. Post-vuelo | Cierre y facturación · Conciliación · Feedback y reclamaciones · Retención y seguimiento futuro |
| 11. Mantenimiento continuo\* | Relación con operadores · Conocimiento de mercado |

**Funciones fusionadas (y por qué):** "búsqueda de aeronaves" y "selección de operadores" se investigan casi siempre como un mismo movimiento (buscar significa, en la práctica, buscar en Avinode por tipo de aeronave y disponibilidad, lo que devuelve directamente operadores) — se documentan por separado en la sección C, pero comparten casi todos los campos. "Catering, transporte terrestre, mascotas, equipaje especial" se agrupan en una sola función porque, según la evidencia disponible, son variaciones del mismo movimiento (recoger un requisito especial del cliente y transmitirlo al operador/proveedor), no procesos distintos.

**Función añadida no presente en el listado original:** "Mantenimiento de conocimiento de mercado" y "Mantenimiento de relaciones con operadores" — elevadas a funciones propias en el mapa porque, a diferencia de las demás, no se activan por un vuelo concreto sino que son continuas y transversales — y varios testimonios de la prensa sectorial sugieren que ahí reside buena parte del valor diferencial de un broker experimentado.

## C. DESCOMPOSICIÓN DETALLADA DE FUNCIONES

*(Esquema por función: Trigger → Input → Acción → Interacciones → Canales → Herramientas → Decisión → Output → Siguiente paso → Excepciones → Riesgo de error → Frecuencia/urgencia → Conocimiento tácito)*

### Cluster 1 — Captación y pipeline comercial

**1. Generación de leads (prospección activa)**
Trigger: ausencia de solicitudes activas suficientes; objetivo comercial propio del broker. Input: base de contactos, redes profesionales, referidos. Acción: llamadas en frío, networking, visitas, presencia en redes (LinkedIn), participación en eventos del sector. Interacciones: clientes potenciales, otros brokers, operadores (como fuente de referidos). Canales: teléfono, email, LinkedIn, eventos presenciales. Herramientas: CRM, LinkedIn, bases de datos de prospección. Decisión: a quién dedicar tiempo de prospección, qué segmento priorizar. Output: contacto cualificado o no cualificado. Siguiente paso: cualificación del cliente (función 3). Excepciones: ninguna relevante — es trabajo discrecional del broker, no reactivo. Riesgo de error: bajo impacto inmediato, alto impacto acumulado (pipeline vacío en el futuro). Frecuencia/urgencia: continua, no urgente, **se posterga fácilmente frente a trabajo operativo activo** — patrón de riesgo que aparece implícito en descripciones de puesto reales (AirShare, ACS), que exigen explícitamente "mantener y hacer crecer" el pipeline como responsabilidad separada de la operación diaria `[HECHO VERIFICADO — fuente: oferta de empleo AirShare Charter Sales Director]`. Conocimiento tácito: `[PREGUNTA ABIERTA — requiere entrevista]` qué canales de prospección funcionan realmente mejor para distintos segmentos no está documentado en fuentes abiertas de forma fiable. Fuente/estado: `[PRÁCTICA HABITUAL]` (según ofertas de empleo AirShare, Air Charter Service, Flygreen).

**2. Recepción de leads entrantes**
Trigger: contacto inbound (web, teléfono, referido, marketplace). Input: datos básicos de contacto y necesidad expresada. Acción: primer contacto, registro en CRM. Canales: teléfono, email, formulario web, WhatsApp `[PRÁCTICA DE ALGUNAS EMPRESAS — el uso de WhatsApp varía mucho según mercado y cultura del cliente; el testimonio de Business Air News muestra explícitamente un caso de reserva completa gestionada por SMS]`. Decisión: prioridad de respuesta (¿es urgente? ¿es un cliente conocido?). Siguiente paso: cualificación. Excepciones: solicitudes fuera de horario — las ofertas de empleo de ACS y Flygreen indican explícitamente que las solicitudes "llegan virtualmente 24/7" y que el broker "debe permanecer disponible" `[HECHO VERIFICADO]`. Riesgo de error: responder tarde a un lead con urgencia real puede significar perder la venta frente a otro broker que sí respondió. Conocimiento tácito: distinguir a simple vista un lead con intención real de compra de uno que solo está "comparando precios" `[INFORMACIÓN NO VERIFICADA]`.

**3. Cualificación del cliente**
Trigger: lead recibido. Input: presupuesto aproximado, ruta, fechas, número de pasajeros, urgencia. Acción: preguntas dirigidas para entender la necesidad real y la seriedad del comprador. Canales: teléfono (preferido — "la negociación y la relación siempre jugarán un papel clave", Alison Wressell, Private Jet Charter), email. Decisión: ¿esta solicitud merece iniciar sourcing activo (que consume tiempo de red con operadores) o es prematura? Excepciones: clientes recurrentes ya "precualificados" por relación previa — el proceso se acorta drásticamente. Riesgo de error: cualificar mal desperdicia tiempo de red de operadores, un recurso limitado y valioso. Conocimiento tácito: `[OPINIÓN/INTERPRETACIÓN, no hecho verificado]` intuir el presupuesto real de un cliente que no lo declara explícitamente es, con toda probabilidad, una de las habilidades más valoradas y menos documentadas del oficio.

### Cluster 2 — Recepción y análisis de la solicitud

**4. Recepción de la flight request**
Trigger: cliente cualificado confirma intención de volar. Input: origen, destino, fecha(s), hora aproximada, número de pasajeros, tipo de misión, preferencias. Herramientas: CRM, a veces directamente Avinode. Decisión: qué información falta antes de poder buscar con seriedad. Siguiente paso: aclaración de requisitos si faltan datos; si no, análisis de viabilidad. Riesgo de error: buscar con datos incorrectos genera cotizaciones inútiles y pérdida de tiempo con operadores. Conocimiento tácito: `[HIPÓTESIS]` un broker experimentado probablemente sabe qué preguntas hacer primero según el tipo de misión — no encontrado desglosado en fuente pública.

**5. Aclaración de requisitos**
Trigger: información incompleta o ambigua en la solicitud. Decisión: si conviene empezar a sondear el mercado en paralelo con datos provisionales, o esperar a tener todo cerrado. Excepciones: cliente no localizable, cliente que cambia de idea a mitad del proceso. Frecuencia: más frecuente con clientes nuevos que con recurrentes (conecta con Cap. 7 del Manual, "Clientes"). Conocimiento tácito: `[PREGUNTA ABIERTA]`.

**6. Análisis inicial de viabilidad**
Trigger: solicitud completa. Acción: valorar mentalmente (antes de contactar operadores) si la misión es sencilla, compleja o inusual — restricciones de aeropuerto, permisos de sobrevuelo, distancia, tipo de aeronave necesaria. Interacciones: ninguna todavía (trabajo interno). Decisión: ¿esto puedo resolverlo yo directamente con mi red conocida, o necesito buscar más ampliamente (con potencial coste de reposicionamiento)? Riesgo de error: subestimar la complejidad de una misión lleva a perder tiempo contactando operadores que no pueden cumplirla. Conocimiento tácito: **una de las funciones donde más pesa la experiencia acumulada** — un broker novato probablemente no distingue de un vistazo qué misiones son "sencillas" y cuáles esconden complejidad. **No se encontró ninguna fuente pública que documente los criterios concretos** `[PREGUNTA ABIERTA — central para entender el "expertise" real del oficio]`.

### Cluster 3 — Sourcing

**7-8. Selección de operadores a contactar y búsqueda de aeronaves** *(tratadas juntas — ver nota en B)*
Acción: búsqueda en Avinode (filtro por tipo, posición, disponibilidad) y/o contacto directo con operadores de la red de confianza del broker. Herramientas: Avinode (dominante — más del 80% del mercado charter europeo según una fuente de 2011, y con red ampliada hoy `[INFORMACIÓN PARCIALMENTE ENVEJECIDA, ver Manual Cap. 1]`), agenda de contactos propia. Decisión: **a quién contactar y a quién no** — según el Manual (Cap. 1, cita de Icarus Jet), un buen broker no manda la solicitud a decenas de operadores esperando suerte, sino a los que están operacionalmente alineados con la misión. Excepciones: ningún operador con aeronave disponible en la zona → ampliar búsqueda con coste de reposicionamiento. Conocimiento tácito: **esta es la decisión de mayor valor del oficio, según el propio testimonio de varios brokers** ("brokers especially tend to prosper where the supply is complicated", Air Charter Journal) — pero el criterio concreto de "a quién sí y a quién no" combina datos objetivos (rating de seguridad, tipo de aeronave) con memoria personal de experiencias pasadas con cada operador que **no está sistematizada en ninguna herramienta pública encontrada** — es, con alta probabilidad, conocimiento que vive solo en la cabeza del broker `[HIPÓTESIS, consistente con testimonio de varios brokers en Business Air News: "it is who you know, what you know and how you apply your knowledge and contacts"]`.

**9. Envío de RFQs**
Canales: Avinode (mensajería estructurada), email. Decisión: cuántos operadores contactar en paralelo. Excepciones: operador no responde o declina directamente (Avinode permite "Send & Decline", "Silent Decline" o "Decline via Avinode" — ver Manual Cap. 1, documentación FL3XX). Riesgo de error: enviar a demasiados operadores puede dañar la reputación del broker (spam) y confundir la comparación posterior. Conocimiento tácito: `[PREGUNTA ABIERTA]` cuántas RFQs simultáneas es "razonable" enviar no está documentado con precisión.

**10. Seguimiento de RFQs**
Trigger: RFQ enviada sin respuesta tras un tiempo razonable. Decisión: cuándo insistir y cuándo dar por perdida esa opción y seguir con otra. Riesgo de error: no hacer seguimiento a tiempo puede dejar al broker sin opciones viables cuando el cliente ya espera una propuesta. **Este es, en esencia, trabajo invisible clásico** (sección A): "perseguir respuestas" no aparece descrito en ninguna fuente comercial revisada, lo que confirma la hipótesis de que es un trabajo sistemáticamente omitido en las descripciones públicas del oficio. Conocimiento tácito: saber qué operadores "tardan pero cumplen" frente a los que "no van a responder" `[HIPÓTESIS]`.

**11. Interpretación y normalización de respuestas**
Input: cotizaciones en formatos distintos (Avinode las estandariza parcialmente, pero detalles como catering incluido o tasas desglosadas varían). Herramientas: Avinode, hojas de cálculo propias `[PRÁCTICA DE ALGUNAS EMPRESAS]`. Riesgo de error: comparar mal lleva a presentar al cliente una comparación injusta, o a perder margen. Conocimiento tácito: reconocer de un vistazo si un precio "demasiado bueno" esconde algo no incluido — conecta con señales de fraude (sección G: precios 30-40% por debajo de mercado como señal de alerta).

### Cluster 4 — Evaluación y vetting

**12. Evaluación de operador**
Input: certificaciones, rating de seguridad (ARGUS/Wyvern/IS-BAO), historial propio del broker con ese operador. Herramientas: bases de datos de ARGUS/Wyvern (búsqueda pública por nombre o código ICAO), IS-BAO registry (IBAC). Decisión: ¿este operador pasa el umbral mínimo de seguridad que exige el broker (que puede ser más estricto que el mínimo legal)? Excepciones: operador sin rating de ninguna auditora — no significa automáticamente inseguro, pero obliga a verificación adicional propia. Riesgo de error: **el de mayor consecuencia potencial de todo el oficio** — puede terminar en un incidente de seguridad real. Conocimiento tácito: un punto muy relevante y **verificado** — según un análisis reciente sobre ratings de seguridad, **una aeronave puede estar auditada bajo un certificado y ser subarrendada ("wet-leased") a un operador no auditado sin que el cliente lo sepa**; un broker riguroso confirma que "el operador específico que vuela ese tramo concreto" tiene las certificaciones, no solo la empresa que aparece en el contrato `[HECHO VERIFICADO — fuente: Jetvice.net, sección de comparación ARGUS/Wyvern]`.

**13. Evaluación de aeronave**
Input: tipo, antigüedad, configuración de cabina, autonomía, mantenimiento. Herramientas: Avinode (ficha de aeronave), bases de datos de flota (JetNet). Decisión: ¿esta aeronave específica es adecuada, o solo la categoría lo es sobre el papel? Excepciones: aeronave con configuración distinta a la esperada. Conocimiento tácito: `[PREGUNTA ABIERTA]`.

**14. Safety vetting** *(complementaria y en parte solapada con la función 12 — se documenta aparte porque el original la distingue explícitamente)*
Acción: verificación adicional más allá del rating de pago — búsqueda de historial de incidentes, comprobación de vigencia del certificado de operador. Decisión: umbral propio de aceptación de riesgo del broker — que puede (y según varias fuentes, debería) ser más estricto que el mínimo legal. Excepciones: presión comercial para aceptar un operador barato pero con vetting incompleto — **casi con seguridad, uno de los puntos de tensión ética/comercial más relevantes del oficio**, aunque no se encontró fuente que lo documente con datos. Riesgo de error: **el más alto de todo el mapa funcional** — un fallo aquí pone en riesgo vidas, no solo dinero. Conocimiento tácito: `[PREGUNTA ABIERTA — de las más importantes de todo el documento]`. Ningún broker en las fuentes revisadas ha detallado públicamente su proceso interno de vetting más allá de "miramos ARGUS/Wyvern".

**15. Análisis de restricciones operativas**
Input: longitud de pista de origen/destino, restricciones de horario nocturno, tiempos de servicio de tripulación, permisos de sobrevuelo internacional. Interacciones: operador (quien realmente hace este análisis técnico; el broker lo traslada/confirma). Herramientas: bases de datos de aeropuertos (Avinode incluye "airport look-up"). Excepciones: aeropuertos con pista corta, restricciones de ruido nocturno en ciertos aeropuertos europeos `[VARIACIÓN POR JURISDICCIÓN]`. Conocimiento tácito: `[HIPÓTESIS]` un broker experimentado probablemente memoriza restricciones de los aeropuertos que más gestiona.

### Cluster 5 — Pricing y propuesta

**16. Comparación de opciones**
Herramientas: hojas de cálculo, plantillas propias, TripManager de Avinode (permite pasar de request a "quotes listas para enviar"). Decisión: qué opciones merece la pena presentar al cliente (no siempre se muestran todas las recibidas). Riesgo de error: presentar una opción en apariencia más barata pero que esconde peor seguridad o condiciones peores. Conocimiento tácito: `[OPINIÓN/INTERPRETACIÓN]` decidir cuántas opciones presentar probablemente varía mucho según el estilo del broker y el tipo de cliente.

**17. Pricing / markup / comisión**
Input: precio neto del operador, modelo de negocio del broker (comisión declarada vs. margen — ver Manual Cap. 1). Decisión: cuánto margen aplicar en esta operación concreta. Riesgo de error: un margen mal calculado (o no declarado cuando la normativa exige declaración, en jurisdicciones como EE.UU. bajo Part 295) tiene consecuencias tanto comerciales como legales. Conocimiento tácito: `[PREGUNTA ABIERTA]` los rangos reales de margen aplicado varían mucho según fuente (5-10% de comisión declarada es la cifra más citada, pero el margen real en modelo "principal" no está documentado con la misma claridad).

**18. Preparación de la propuesta**
Herramientas: plantillas propias, TripManager de Avinode, PDF. Riesgo de error: una propuesta poco clara o con errores de datos genera desconfianza inmediata. Conocimiento tácito: `[HIPÓTESIS]` cómo enmarcar el precio (ancla alta primero, recomendada al medio) probablemente sigue patrones de venta consultiva estándar, no específicos del sector.

**19. Presentación al cliente**
Acción: enviarla y, en la mayoría de los casos, **hablar con el cliente sobre ella, no solo enviarla** — "there are too many variables… negotiation and relationships will always play a key part" (Alison Wressell, Private Jet Charter, en Business Air News). Riesgo de error: presentar sin contexto (solo un PDF, sin conversación) reduce la tasa de conversión, según el consenso implícito de casi todos los testimonios revisados. Conocimiento tácito: la propia industria documenta que **las diferencias culturales importan mucho aquí** — ejemplo verificado: "clientes rusos… negocian duro el precio, siempre piden salas VIP, catering más complejo" frente a clientes americanos "más centrados en la seguridad… ARGUS y Wyvern son nombres muy conocidos" `[HECHO VERIFICADO — Business Air News, con la cautela de que es una única fuente de 2011 y puede no generalizar; también marcado como PRÁCTICA DE ALGUNAS EMPRESAS/observación anecdótica de un broker concreto, no regla universal]`.

**20. Seguimiento comercial de la propuesta**
Decisión: cuánto insistir sin resultar agresivo; cuándo asumir que la propuesta no prosperará. Excepciones: disponibilidad de la aeronave caduca antes de que el cliente decida — riesgo real y frecuente (ver sección G). Conocimiento tácito: `[PREGUNTA ABIERTA]`.

### Cluster 6 — Negociación y confirmación

**21. Negociación con el cliente**
Canales: teléfono (preferido, según casi todos los testimonios). Decisión: hasta dónde ceder sin perder margen o sin sentar un precedente problemático con ese cliente a futuro. Riesgo de error: ceder demasiado erosiona el margen; no ceder nada puede perder al cliente frente a otro broker con más flexibilidad. Conocimiento tácito: `[HIPÓTESIS]` decidir cuánto ceder probablemente depende del valor de vida estimado del cliente — inferencia razonable desde ventas consultivas en general, no verificada con fuente propia del sector aviación.

**22. Negociación con el operador**
Decisión: hasta qué punto presionar sin dañar la relación con un operador que se necesitará en el futuro. Conocimiento tácito: `[PREGUNTA ABIERTA]` — el testimonio de Wael Al Marjeh (Jetex Flight Support) apunta a que **"los brokers todavía consiguen buenos acuerdos, extienden condiciones de crédito favorables que los operadores no siempre ofrecen tan generosamente"** `[HECHO VERIFICADO, cita directa]` — sugiere que parte del valor de negociación de un broker está en las condiciones de pago/crédito, no solo en el precio.

**23. Gestión de cambios de solicitud**
Trigger: el cliente modifica fechas, número de pasajeros, ruta, después de haber recibido cotización o incluso tras confirmar. Riesgo de error: no propagar el cambio a todos los sistemas/personas relevantes genera errores el día del vuelo (conecta con sección F, fragmentación de información). Frecuencia: los propios testimonios de brokers indican que "a menudo las solicitudes involucran múltiples tramos y durante el programa de vuelo puede haber cambios en la hora de salida y también en el destino" (Julian Burrell, The Charter Company) `[HECHO VERIFICADO]`. Conocimiento tácito: `[HIPÓTESIS]` mantener una lista mental (o en CRM) de "qué ha cambiado y a quién hay que avisar" es, con alta probabilidad, una fuente frecuente de error humano.

**24. Colocación de option/hold**
Acción: solicitar al operador que "opcione" la aeronave — le dé al broker/cliente derecho de primer rechazo sobre esa aeronave sin haber hecho una reserva formal `[HECHO VERIFICADO — definición directa de The Charter Company: "Optioning an aircraft gives you first refusal on the aircraft without having made a formal booking"]`. Decisión: durante cuánto tiempo mantener la opción sin perder la confianza del operador. Excepciones: otro cliente/broker quiere la misma aeronave mientras está en opción. Conocimiento tácito: `[PREGUNTA ABIERTA]` cuánto tiempo es "razonable" mantener una opción no está estandarizado.

**25. Confirmación y contrato**
Herramientas: Avinode (TripManager permite pasar de cotización a contrato/factura), plantillas de contrato propias. Riesgo de error: un contrato con cláusulas poco claras sobre cancelación o sustitución de aeronave es fuente directa de disputas — conecta con el dominio 2.2 del Mapa Maestro (Contratos), pendiente de investigación legal específica. Frecuencia/urgencia: crítica — es el punto de no retorno de la operación. Conocimiento tácito: `[PREGUNTA ABIERTA — requiere validación legal, no solo entrevista a broker]`.

### Cluster 7 — Financiero

**26. Cobro al cliente**
Herramientas: Paynode (Avinode) u otra pasarela. Decisión: qué condiciones de pago aceptar (algunas fuentes describen que los brokers "retienen el pago del cliente" como intermediarios hasta que el vuelo efectivamente ocurre, liberándolo entonces al operador `[PRÁCTICA DE ALGUNAS EMPRESAS — no universal, con fuerte relación con la decisión 0.2 y 0.4 del Mapa Maestro sobre si JETMI tocará directamente el dinero del cliente]`). Excepciones: impago, fraude de pago — conecta con el dominio 2.5 del Mapa Maestro (fraude). Conocimiento tácito: `[VARIACIÓN POR JURISDICCIÓN]` las condiciones de pago aceptables probablemente varían según normativa local y práctica de cada empresa.

**27. Pago al operador**
Decisión: verificar que los datos bancarios son los correctos y no han sido alterados — **este es exactamente el vector del fraude de $220.000 documentado por Richard Zaher/Paramount Business Jets, donde un operador fraudulento hizo pasar por real una cuenta bancaria falsa** `[HECHO VERIFICADO — caso citado en fuente comercial, tratar con la cautela de una única fuente]`. Riesgo de error: **el de mayor consecuencia económica directa de todo el mapa**. Conocimiento tácito: verificar los datos bancarios de un operador nuevo por un canal distinto al que los proporcionó (llamada de confirmación, no solo email) — recomendación explícita de EBAA/ACA para evitar fraude `[PRÁCTICA HABITUAL RECOMENDADA, no necesariamente universal en su cumplimiento]`.

### Cluster 8 — Logística de pasajeros y trip support

**28. Recopilación de datos de pasajeros y manifiesto**
Input: nombres completos, datos de pasaporte/identificación, peso de equipaje. Riesgo de error: alto en vuelos internacionales — un dato incorrecto puede causar problemas de aduanas/inmigración. Conocimiento tácito: `[PREGUNTA ABIERTA]`.

**29. Coordinación de catering, transporte terrestre, mascotas, equipaje especial**
Herramientas: ninguna especializada identificada en fuentes abiertas — parece gestionarse por comunicación directa `[INFORMACIÓN NO VERIFICADA respecto a herramientas específicas]`. Riesgo de error: un requisito no transmitido correctamente puede causar un problema grave el día del vuelo (conecta con fragmentación de información, sección F). Conocimiento tácito: `[HIPÓTESIS]` un broker experimentado probablemente mantiene una ficha de preferencias por cliente — conecta con Cap. 7 del Manual ("Clientes") y con el dominio 4.3 del Mapa Maestro (modelo de datos).

**30. Gestión de permisos y requisitos especiales**
Interacciones: operador (que gestiona esto técnicamente en la mayoría de los casos). Herramientas: ninguna propia del broker identificada `[HIPÓTESIS razonable pero no verificada explícitamente]`. Riesgo de error: bajo para el broker directamente (recae sobre el operador), pero debe saber que existe el riesgo para fijar expectativas correctas con el cliente. Conocimiento tácito: `[PREGUNTA ABIERTA]`.

### Cluster 9 — Pre-vuelo y operación activa

**31. Coordinación pre-flight**
Trigger: 24-48 horas (aproximadamente, sin fuente que fije un plazo exacto) antes del vuelo. Excepciones: cambios de última hora en meteorología o disponibilidad de tripulación. Conocimiento tácito: `[PREGUNTA ABIERTA]`.

**32. Seguimiento operativo ("flight watch" del broker — distinto del flight watch técnico del operador)**

*Nota importante de precisión, señalada explícitamente:* el término "flight watch"/"flight following" en su sentido técnico y regulado (monitorización activa de posición, combustible, meteorología en ruta, con capacidad de intervención) **es una función del centro de operaciones del propio operador (OCC) o de ATC, no del broker** `[HECHO VERIFICADO — SKYbrary, Bytron Aviation Systems]`. Sin embargo, **las ofertas de empleo reales de brokers usan literalmente el término "flight watching/overseeing flight departures" como responsabilidad del broker** `[HECHO VERIFICADO — AirShare, Air Charter Service]`. Esto sugiere que el broker realiza una **versión más ligera y orientada al cliente** de esta función: no monitoriza técnicamente el vuelo (eso lo hace el operador), sino que se mantiene informado del estado del vuelo y hace de puente de comunicación con el cliente, y está listo para reaccionar si el operador le informa de un problema. Esta distinción no la hacía el Capítulo 1 del Manual, y es relevante no mezclarla en capítulos futuros.

Decisión: cuándo el estado del vuelo requiere informar proactivamente al cliente frente a esperar a que pregunte. Output: cliente informado, o silencio si todo va bien ("no news is good news", no verificado explícitamente pero consistente con el tono de las fuentes). Conocimiento tácito: un patrón muy revelador y **verificado con cita directa**: "un operador profesional informará al broker inmediatamente [de un posible fallo técnico], así que si hay que dar una mala noticia después, no llega como sorpresa y ya se pueden haber iniciado arreglos alternativos. Un operador poco profesional puede tener la actitud de 'a lo mejor se arregla' y 'no hace falta molestar al cliente todavía' — lo cual obviamente puede causar problemas mayores más adelante" (Adam Twidell, PrivateFly, en Business Air News) `[HECHO VERIFICADO, cita textual traducida y parafraseada]`. Esto confirma que **distinguir qué operadores comunican proactivamente los problemas y cuáles los ocultan** es, en sí mismo, conocimiento tácito de gran valor acumulado con la experiencia.

**33. Gestión de incidencias (mecánica, meteorología, cancelación de cliente u operador, retraso)**
Decisión: **la de mayor presión de todo el mapa funcional** — con información incompleta y bajo presión de tiempo, decidir si se puede salvar la operación tal como estaba planteada o hay que ofrecer una alternativa al cliente. Riesgo de error: **el segundo más alto de todo el mapa** (después del safety vetting). Frecuencia/urgencia: poco frecuente en términos relativos, pero de máxima urgencia cuando ocurre — y, según las descripciones de empleo revisadas, **puede ocurrir fuera de horario laboral habitual** (conecta con el dominio 3.2 del Mapa Maestro, customer service 24/7). Conocimiento tácito: `[PREGUNTA ABIERTA — de las más críticas para entrevistar a un broker en activo]` cómo se decide, en la práctica y bajo presión, entre distintas opciones de contingencia no está documentado con el detalle necesario en ninguna fuente pública revisada.

**34. Aircraft substitution / búsqueda de backup**
Decisión: aceptar una opción más cara o con condiciones peores con tal de no dejar al cliente sin vuelo, frente a mantener el estándar original. Riesgo de error: no encontrar backup a tiempo es, según Stratos Jets (Cap. 1 del Manual), la razón de negocio central por la que existe el compromiso contractual de un broker de proveer un avión de sustitución. Conocimiento tácito: `[HIPÓTESIS]` tener 2-3 "operadores de respaldo" mentalmente preidentificados para las rutas/tipos de misión más habituales sería una práctica lógica de mitigación de riesgo — no verificado con fuente directa.

**35. Comunicación con el cliente durante incidencias**
Decisión: qué decir, cuándo, y con qué nivel de detalle — sin comprometer opciones de contingencia que aún se están gestionando en paralelo. Riesgo de error: alto impacto reputacional — es, con alta probabilidad, el momento donde más se juega la relación a largo plazo con el cliente. Conocimiento tácito: `[PREGUNTA ABIERTA]`.

### Cluster 10 — Post-vuelo

**36. Cierre post-flight y facturación** — Decisión: verificar que todos los extras están correctamente facturados. Conocimiento tácito: `[PREGUNTA ABIERTA]`.

**37. Conciliación** — Es la función menos dependiente de juicio experto de todo el mapa. Riesgo de error: acumulación de pequeños errores no detectados a tiempo distorsiona la visión financiera real del negocio.

**38. Feedback y reclamaciones** — Decisión: cómo resolver una reclamación de forma que proteja la relación sin asumir un coste desproporcionado. Riesgo de error: gestionar mal una reclamación puede perder un cliente de alto valor de por vida. Conocimiento tácito: `[PREGUNTA ABIERTA]`.

**39. Retención y seguimiento futuro** — Trigger: ninguno inmediato, es proactivo. Riesgo de error: no hacer seguimiento pierde negocio recurrente. **Trabajo que "no genera una venta inmediata" y que por tanto es fácil de postergar frente al trabajo operativo activo.** Conocimiento tácito: `[PREGUNTA ABIERTA]`.

### Cluster 11 — Mantenimiento continuo (transversal)

**40. Mantenimiento de relaciones con operadores**
Decisión: con qué operadores invertir tiempo de relación (los que dan mejor servicio, no necesariamente los más baratos). Riesgo de error: descuidar esta función deja al broker dependiente exclusivamente de lo que Avinode muestra en el momento, sin la ventaja diferencial de la relación y el conocimiento acumulado. Conocimiento tácito: **este cluster es, en sí mismo, el contenedor de gran parte del conocimiento tácito de todo el oficio** — "es quién conoces, qué sabes y cómo aplicas tu conocimiento y tus contactos" (cita parafraseada de Business Air News) — y esto, casi por definición, no está sistematizado ni es fácilmente transferible a un sistema o a un tercero sin pérdida.

**41. Mantenimiento de conocimiento de mercado**
Acción: mantenerse informado (prensa sectorial, ferias, contacto con la red). Canales: prensa sectorial (Business Air News, Corporate Jet Investor), eventos (EBACE, NBAA-BACE). Conocimiento tácito: n/a — esta función es, por su propia naturaleza, la acumulación de conocimiento tácito de todas las demás, no una fuente nueva de él.

## D. ESCENARIOS DE JORNADA REAL

**Advertencia honesta del original:** no se encontró ninguna fuente pública que documente horarios exactos minuto a minuto de un broker real. Los escenarios reconstruyen la **secuencia y naturaleza** de la actividad a partir de la evidencia de la sección C, no horarios verificados. Cada uno se marca `[HIPÓTESIS ESTRUCTURADA A PARTIR DE EVIDENCIA PARCIAL]`.

**Escenario A — Día sin vuelos activos, centrado en ventas, relaciones y pipeline.** Secuencia: revisión de pipeline → prospección/seguimiento de leads → contacto con operadores para mantener relación → prensa sectorial → gestión administrativa acumulada. Cambios de prioridad: cualquier solicitud entrante con urgencia real desplaza el trabajo de pipeline, que por su naturaleza de baja urgencia individual es el primero en posponerse (coherente con el patrón de riesgo de la función 1). Cuello de botella: la disciplina para no descuidar el trabajo de bajo-urgencia-alto-impacto-futuro frente al día a día.

**Escenario B — Día con varias requests abiertas y cotizaciones simultáneas.** Secuencia: gestión simultánea de varias solicitudes en distintas fases → seguimientos de RFQ en paralelo → normalización de ofertas de varias operaciones al mismo tiempo → negociaciones puntuales. Tareas simultáneas: sourcing de una operación mientras se negocia el cierre de otra — **con alta probabilidad, el escenario de mayor carga cognitiva simultánea de todos**. Cuello de botella: la interpretación/normalización de ofertas en formatos dispares se vuelve más lenta y propensa a error cuantas más operaciones simultáneas hay abiertas.

**Escenario C — Día con uno o varios vuelos confirmados operando.** Secuencia: coordinación pre-flight → seguimiento operativo (función 32) → disponibilidad constante para reaccionar → en paralelo, gestión de solicitudes nuevas (el trabajo comercial no se detiene porque haya vuelos activos). Tareas simultáneas: atender el vuelo en curso y seguir gestionando el pipeline — según AirShare, "oversight of all ongoing trips on a day-to-day basis" es responsabilidad explícita junto con la prospección comercial, **no funciones alternativas sino simultáneas**. Cuello de botella: la atención dividida entre "lo urgente" (vuelos activos) y "lo importante no urgente" (pipeline, relaciones).

**Escenario D — Incidencia grave fuera del horario habitual.** Secuencia: notificación (normalmente por teléfono) → evaluación rápida con información incompleta → decisión de buscar backup o gestionar el problema tal como está → comunicación con el cliente → búsqueda acelerada de alternativa → seguimiento hasta resolución. Interrupciones: por definición, la interrupción máxima — ocurre fuera de horario y exige respuesta inmediata ("customer requests will come in at varying hours… must remain available on-demand", Flygreen; "24-7 flight watching and support", The Charter Company vía Business Air News). Tareas simultáneas: comunicación con el cliente y búsqueda de backup ocurren, con alta probabilidad, en paralelo. Cuello de botella: la disponibilidad de un segundo par de manos es, casi por definición, el cuello de botella crítico — **y es el escenario donde la restricción de "una sola persona" de JETMI es más exigente** `[OPINIÓN/INTERPRETACIÓN — este es precisamente el escenario que más debería pesar en el diseño de LIFEOS, aunque el diseño en sí no es objeto de esta investigación]`.

**Escenario E — Broker independiente o fundador trabajando solo.** No existe una secuencia separada respecto a A-D — la diferencia es la **ausencia de reparto**: todas las funciones de los 11 clusters recaen en la misma persona, incluidas las que en un brokerage mediano/grande estarían repartidas entre roles distintos (ventas, operaciones, back-office, flight watch). Interrupciones: máximas — no hay nadie que filtre o absorba una interrupción. Cambios de prioridad: el fundador solo no puede "escalar" una decisión ni pasar una tarea a un compañero. Cuello de botella: `[OPINIÓN/INTERPRETACIÓN]` este escenario no es tanto un "día distinto" como una **multiplicación de la carga simultánea de los escenarios A-D sin red de apoyo humano** — es, casi con certeza, **el escenario que más debería informar el diseño de JETMI, precisamente porque es el que JETMI va a vivir desde el primer día, no una excepción ocasional.**

## E. MAPA DE DECISIONES

| Decisión | Información utilizada | ¿Reglas explícitas? | Componente de experiencia/intuición | Consecuencia de una mala decisión |
|---|---|---|---|---|
| A qué operadores contactar (7-8) | Historial propio, rating de seguridad, tipo de aeronave | Parcial (criterios de seguridad sí; el resto es criterio propio) | Alto | Retrasos, pérdida de tiempo con operadores no alineados |
| Cuándo confiar o desconfiar de una cotización (11) | Precio comparado con mercado, reputación del operador | No, ninguna regla explícita encontrada | Alto | Presentar al cliente una opción poco fiable o fraudulenta |
| Cuánto margen aplicar (17) | Modelo de negocio, relación con cliente, urgencia | Parcial (normativa de disclosure en EE.UU.) | Medio-alto | Pérdida de margen o pérdida de la venta |
| Qué presentar al cliente (16, 18) | Comparación de opciones, conocimiento de preferencias del cliente | No | Alto | Cliente elige mal informado, o se siente abrumado por exceso de opciones |
| Cuándo insistir en un seguimiento (10, 20) | Urgencia de la operación, historial de respuesta del operador/cliente | No | Alto | Pérdida de la operación (si no se insiste) o desgaste de relación (si se insiste demasiado) |
| Cuándo escalar una incidencia a "buscar backup" (33-34) | Gravedad del problema, tiempo disponible | Parcial (compromiso contractual de proveer sustituto) | Muy alto | Consecuencia potencialmente grave: cliente sin vuelo, o aceptación de riesgo de seguridad por presión de tiempo |
| Cuándo asumir un coste para proteger la relación (38) | Valor del cliente, naturaleza de la reclamación | No | Alto | Pérdida de cliente de alto valor, o coste asumido innecesariamente |
| Aceptar o rechazar un operador por seguridad (12, 14) | Rating ARGUS/Wyvern/IS-BAO, verificación propia | Parcial (normativa de mínimos legales; el resto es criterio propio del broker) | Muy alto | La de mayor gravedad de todo el mapa: riesgo real para la seguridad de los pasajeros |
| Cuánto tiempo mantener una opción sin confirmar (24) | Relación con el operador, interés real del cliente | No | Medio | Desgaste de la relación con el operador si se abusa de esta práctica |
| Verificar identidad/datos bancarios antes de pagar (27) | Historial con el operador, señales de alerta de fraude | Sí, existen recomendaciones explícitas de asociaciones (EBAA/ACA) aunque no son de cumplimiento obligatorio | Medio | Pérdida económica directa, documentada en casos reales del sector |

**Nota honesta del original:** en casi todas las filas de esta tabla, la columna "reglas explícitas" está vacía o es parcial. Esto no es un artefacto de la búsqueda — es, con alta probabilidad, un reflejo fiel de la realidad: **la mayoría de las decisiones de mayor valor de este oficio no están reducidas a reglas escritas en ninguna fuente pública encontrada.** Esto tiene una implicación directa (pero que el documento no desarrolla, por instrucción explícita de no diseñar todavía) para cualquier intento de automatizar estas decisiones: no existe un procedimiento documentado que un sistema pueda simplemente "leer e implementar" — habría que construirlo desde cero, probablemente a partir de entrevistas directas con brokers en activo.

## F. MAPA DE INFORMACIÓN — dónde vive, se mueve, se duplica y se pierde

| Dónde vive la información | Qué tipo de información | Riesgos observados |
|---|---|---|
| Avinode | Disponibilidad de aeronaves, RFQs, cotizaciones, mensajería con operadores, estado de solicitudes | Es la fuente más estructurada, pero no todo el mercado está en ella (operadores muy pequeños o de nicho pueden no estarlo) |
| Email | Confirmaciones, contratos, datos de pasajeros, comunicación con operadores fuera de Avinode | Disperso entre hilos, difícil de buscar bajo presión de tiempo |
| WhatsApp/SMS | Comunicación rápida con clientes (fuerte variación cultural) | Información que no se traslada automáticamente a ningún sistema central — alto riesgo de pérdida de contexto |
| Teléfono | Negociación, gestión de incidencias, la mayoría de las decisiones de alto valor | La información de una llamada **no queda registrada en ningún sistema** salvo que el broker la transcriba manualmente después — con alta probabilidad, uno de los puntos de mayor pérdida de información de todo el ciclo |
| CRM propio | Historial de cliente, preferencias, pipeline | Su calidad depende enteramente de la disciplina del broker para registrar lo ocurrido en otros canales |
| Hojas de cálculo | Comparación de ofertas, cálculo de márgenes | `[PRÁCTICA DE ALGUNAS EMPRESAS]` — no universal, pero plausible en brokers pequeños sin herramienta dedicada |
| PDFs/contratos | Términos legales, cotizaciones formales | Estáticos — un cambio posterior (función 23) no se refleja automáticamente en el PDF original, lo que puede generar versiones desactualizadas circulando |
| Sistemas del operador (FL3XX, Leon, Schedaero, etc.) | Disponibilidad real de tripulación y aeronave, mantenimiento | El broker normalmente no tiene acceso directo — depende de lo que el operador le comunique, con el desfase que eso implica |
| Memoria personal del broker | Relación con cada operador (fiabilidad, tiempo de respuesta), preferencias no formalizadas de cada cliente, criterios de vetting no escritos | **Es, con alta probabilidad, el repositorio de información más valioso y al mismo tiempo el más frágil de todo el ciclo** — no está duplicado en ningún sistema, y desaparece si el broker deja la empresa o, en el caso de JETMI, es la única persona de la organización |

**Duplicaciones y pérdida de contexto identificadas:**
- Un mismo dato (p. ej., un cambio de horario) puede comunicarse por teléfono al operador y no quedar registrado en el CRM ni en Avinode `[HIPÓTESIS razonable a partir de la naturaleza de los canales descritos, no confirmada con un caso documentado específico]`.
- La negociación (función 21-22), que ocurre mayoritariamente por teléfono, es probablemente el punto de mayor pérdida de información estructurada de todo el ciclo — se llega a un acuerdo verbal que luego hay que trasladar manualmente a un contrato escrito.
- El conocimiento acumulado sobre operadores (función 40) vive, según toda la evidencia reunida, principalmente en la memoria del broker, no en un sistema — esto es **una fragilidad estructural del oficio tal como existe hoy**, no un defecto de herramientas concretas.

## G. CUELLOS DE BOTELLA — clasificados por frecuencia, impacto y evidencia disponible

| Cuello de botella | Frecuencia | Impacto | Evidencia |
|---|---|---|---|
| Perseguir respuestas de operadores que no contestan a tiempo | Alta | Medio | `[HECHO VERIFICADO]` — mencionado implícitamente en varias fuentes, y explícitamente pedido investigar como "trabajo invisible" |
| Normalizar ofertas en formatos no estandarizados | Alta | Medio | `[HECHO VERIFICADO]` — Avinode estandariza parcialmente, pero no elimina el problema |
| Información perdida entre teléfono/WhatsApp y sistemas centrales | Alta (estructural) | Alto | `[HIPÓTESIS fuerte, no confirmada con caso documentado propio del sector, pero coherente con la propia naturaleza de los canales descritos]` |
| Verificación de seguridad incompleta o dependiente de bases de pago | Media | Muy alto (el más grave posible) | `[HECHO VERIFICADO — ver Manual Cap. 1 y función 12/14]` |
| Búsqueda de aeronave de respaldo bajo presión de tiempo | Baja (poco frecuente) | Muy alto cuando ocurre | `[HECHO VERIFICADO — compromiso contractual documentado, Manual Cap. 1]` |
| Fraude de identidad de operador o de cliente | Baja pero en aumento, según fuentes sectoriales | Muy alto (pérdidas económicas documentadas de cientos de miles de dólares en casos concretos) | `[HECHO VERIFICADO — EBAA/ACA, Paramount Business Jets]` |
| Sobrecarga cognitiva por sostener múltiples "estados" simultáneos | Alta, estructural | Alto, especialmente en el modelo de una sola persona | `[HIPÓTESIS ESTRUCTURADA, coherente con toda la evidencia de la sección D, no medida directamente]` |
| Trabajo de bajo-valor-inmediato (prospección, mantenimiento de relaciones) sistemáticamente postergado frente al trabajo urgente | Alta, estructural | Alto a medio-largo plazo | `[OPINIÓN/INTERPRETACIÓN razonada, coherente con el diseño de las ofertas de empleo revisadas que separan explícitamente ambas responsabilidades como si necesitaran protección propia]` |
| Cambios de última hora en la solicitud del cliente no propagados a todos los proveedores relevantes | Media | Medio-alto | `[HECHO VERIFICADO parcialmente — cita directa de Julian Burrell sobre cambios frecuentes de horario/destino, Business Air News]` |

## H. PREGUNTAS TODAVÍA ABIERTAS (especialmente las que requerirían entrevistar a un broker en activo)

1. `[PREGUNTA ABIERTA — crítica]` ¿Qué criterios concretos, más allá del rating ARGUS/Wyvern/IS-BAO, usa un broker experimentado para decidir si confía en un operador nuevo? Es, con alta probabilidad, la decisión de mayor valor de todo el oficio, y no está documentada en ninguna fuente pública encontrada.
2. `[PREGUNTA ABIERTA]` ¿Cuántas RFQs simultáneas es razonable mantener abiertas por operación, y por broker en un día normal?
3. `[PREGUNTA ABIERTA]` ¿Cómo se decide, en la práctica y bajo presión de tiempo real (no en teoría), entre varias opciones de contingencia durante una incidencia grave?
4. `[PREGUNTA ABIERTA]` ¿Qué proporción real del tiempo de un broker en activo se dedica a cada uno de los 11 clusters identificados? No se encontró ninguna fuente con datos cuantitativos de reparto de tiempo.
5. `[PREGUNTA ABIERTA]` ¿Qué información sobre un cliente o un operador mantiene un broker experimentado que **no** estaría dispuesto a poner por escrito en un CRM compartido, y por qué? Relevante directamente para el diseño futuro del modelo de datos de LIFEOS.
6. `[PREGUNTA ABIERTA]` ¿Cómo gestiona en la práctica un broker independiente (sin equipo) los escenarios C y D simultáneos (vuelo activo + incidencia) sin apoyo humano adicional? Este es el escenario más directamente relevante para JETMI y el que menos evidencia pública se ha encontrado.
7. `[PREGUNTA ABIERTA]` ¿Existen SOPs o checklists internos reales (no de marketing) que las empresas de brokerage medianas/grandes usan para estandarizar el vetting de operadores o la gestión de incidencias? No se ha podido acceder a ninguno.
8. `[PREGUNTA ABIERTA]` ¿Cuál es, en la práctica, el tiempo de respuesta que los clientes consideran aceptable antes de irse con otro broker, y cómo varía según el tipo de cliente (privado vs. corporativo vs. family office)?
9. `[PREGUNTA ABIERTA]` ¿Qué parte de la "coordinación de logística especial" (función 29) realmente coordina el broker directamente frente a lo que delega por completo en el operador/FBO?

## I. IMPLICACIONES PRELIMINARES PARA EL MODELO "UNA PERSONA + IA" (solo observaciones, no diseño)

Tal como se pidió explícitamente en el encargo original, esto es una **clasificación de la naturaleza del trabajo, no una asignación a agentes concretos ni una propuesta de arquitectura**.

| Naturaleza del trabajo | Funciones que encajan aquí (clusters/números) |
|---|---|
| Repetitivo / determinista | Envío de RFQs (9), recopilación de datos de pasajeros (28), cierre y facturación (36), conciliación (37) |
| Preparación o análisis | Búsqueda de aeronaves/operadores (7-8), comparación de opciones (16), normalización de ofertas (11), análisis de restricciones operativas (15) |
| Juicio (no reducible a regla escrita, según la evidencia de la sección E) | A quién contactar (7-8), cuándo confiar en una cotización (11), cuánto margen aplicar (17), aceptar/rechazar un operador por seguridad (12, 14), decisión de backup bajo incidencia (33-34) |
| Relacional | Cualificación del cliente (3), negociación con cliente (21), negociación con operador (22), mantenimiento de relaciones con operadores (40), retención (39) |
| Alta responsabilidad / riesgo | Safety vetting (14), confirmación y contrato (25), pago al operador (27, por el riesgo de fraude documentado), gestión de incidencias graves (33) |
| Disponibilidad inmediata | Recepción de leads urgentes (2), seguimiento operativo (32), gestión de incidencias (33), comunicación con cliente durante incidencias (35) |

**Observación transversal del original, no una conclusión de diseño:** varias funciones aparecen en más de una categoría a la vez — por ejemplo, la función 33 (gestión de incidencias) es simultáneamente de "alta responsabilidad", "juicio no reducible a regla" y "disponibilidad inmediata". Esto sugiere, sin proponer ninguna solución, que **las funciones de mayor complejidad del oficio no se van a poder clasificar de forma limpia en una única categoría** — cualquier diseño futuro tendrá que lidiar con esa superposición, no asumirla fuera.

## J. CONTRADICCIONES O MATICES respecto al Manual Operativo (Cap. 1) y al Mapa Maestro

Tal como se pidió en el encargo original, se señala explícitamente lo encontrado, **sin resolverlo unilateralmente**:

1. **Matiz, no contradicción:** el Capítulo 1 del Manual no distinguía el "flight watch" técnico (función del operador/OCC, regulado) del "flight watch" tal como lo describen las ofertas de empleo de brokers (una vigilancia más ligera, orientada al cliente). Esta investigación introduce esa distinción (ver función 32). Se recomienda que, cuando se redacte el futuro Capítulo 3 del Manual (Ciclo completo de un vuelo) o el Capítulo 11 (Operación del vuelo), se mantenga esta distinción de forma explícita para no atribuir al broker una función técnica que en realidad corresponde al operador.
2. **Posible tensión, marcada como pregunta abierta, no como hecho:** el Mapa Maestro (dominio 2.5, fraude) asumía que la verificación de contrapartes es sobre todo una cuestión de diseño de proceso. La evidencia de esta investigación (sección G, fraude) sugiere que una parte importante de la detección de fraude depende de **conocimiento tácito y señales de alerta experienciales** (precios anormalmente bajos, presión de urgencia, cuentas bancarias que cambian) más que de un checklist cerrado — esto no contradice el Mapa Maestro, pero sí sugiere que el dominio 2.5 necesitará, más que la mayoría de los demás, entrevistas con brokers/asociaciones (EBAA/ACA) antes de poder considerarse "suficiente para decidir".
3. **Sin contradicciones factuales encontradas** entre esta investigación y el contenido ya escrito del Capítulo 1 del Manual — los datos sobre Avinode, ARGUS/Wyvern/IS-BAO y Part 295 utilizados aquí son consistentes con lo ya documentado allí.

## Fuentes consultadas para esta investigación

**Ofertas de empleo reales (fuente primaria de facto sobre funciones):** AirShare (Charter Sales Director, jobs.techstars.com), Air Charter Service (Entry-Level Sales Consultant, Jet Card Manager — builtin.com, jobs.recorder.com), Flygreen (Jet Charter Sales Executive, job-boards.greenhouse.io).

**Prensa sectorial con testimonios directos de brokers en activo:** Business Air News — "Online and on call: it's a typical day in the life of the charter broker" (con citas de Alison Wressell/Private Jet Charter, Pál László/Air Connect Hungary, Emre Islek/AFDAir, Claire Brugirard/Air Charter Dubai, Olga Sevcuka/Private Jet Charter, Adam Twidell/PrivateFly, Holger Rathje/FlightTime, Jens Dreyer/Aviation Broker, Carl de Verteuil/Ascent Jet, Wael Al Marjeh/Jetex, Catarina Martins/Blue Heaven Portugal, Dino Rasero/Top Jet, Richard Seeberg/Skybrokers, Thierry Huguenin/TSH aero, Julian Burrell/The Charter Company, Gokcehan Dace/Apron Aviation, Alex Berry/Chapman Freeborn, Mark Green/Oxygen Aviation, Rachel Kelly/Heli Riviera, Patrick Raftery/Imperial Jet); Air Charter Service — "Day in the Life" (Georgina Heron).

**Asociaciones y organismos sectoriales:** EBAA (Robert Baltus, COO, citado sobre fraude vía Robb Report y Corporate Jet Investor), ACA — Air Charter Association (Dave Edwards, CEO, citado vía Wing Aviation).

**Fuentes técnicas/normativas (reutilizadas del Capítulo 1 del Manual):** eCFR 14 CFR Part 295, NBAA, Avinode.com, documentación FL3XX, Jetvice.net (comparación ARGUS/Wyvern), The Charter Company (definición de "option").

**Fuentes comerciales usadas con cautela explícita, solo como apoyo y siempre identificadas como tales:** Paramount Business Jets (caso de fraude de $220.000), Stratos Jets, IABI (International Aircraft Brokers Institute — cursos de formación de brokers), Essex Aviation Group, Amalfi Jets, Schubach Aviation, Triumph Jets, Ventura Jet, BWI Aviation Insurance (wholesale vs. retail en seguros, usado solo como analogía de estructura, no como dato del sector chárter).
