Estado: fuente — investigación externa, no verdad de JETMI (ver research/README.md)
Última verificación: 2026-07-14
Verificado en: conversión fiel del PDF original a Markdown, sin editorializar
Fuente de verdad de datos: ninguna

# Manual Operativo del Broker de Aviación Privada

**Documento vivo — fuente de verdad para el diseño de JETMI dentro de LIFEOS** *(nota de procedencia: esta frase es del título original del artefacto; dentro de la convención de `/docs/research/`, este archivo es evidencia externa, no una fuente de verdad de JETMI en sí misma — ver `research/README.md`)*.

**Tipo de artefacto:** investigación primaria de industria, elaborada capítulo a capítulo por Estefanía/su proceso de investigación, con fuentes públicas del sector citadas al final de cada capítulo.

**Metodología (tal como la declara el propio documento):** este documento se construye capítulo a capítulo. Cada capítulo se investiga, se contrasta con fuentes reales del sector, y se somete a aprobación antes de continuar. Se distingue siempre entre:

- 🔵 **Práctica habitual** — estándar de facto en la industria, con independencia del país.
- 🌐 **Varía según país / regulación** — la práctica cambia según jurisdicción.
- 🟣 **Práctica de algunos brokers** — no universal, depende del modelo de negocio o tamaño de la empresa.
- 🏢 **Específico de una empresa concreta** — ejemplo real de una compañía nombrada.
- ⚪ **Opinión / interpretación** — análisis propio, no un hecho verificable.

*(Nota de conversión: el documento original usa iconos gráficos para cada etiqueta; se preservan aquí como emoji descriptivos más el nombre completo de la etiqueta en negrita, para no perder la distinción semántica que es el propósito central del documento.)*

*(Nota de conversión — tablas: el PDF original divide varias tablas de este capítulo entre saltos de página, con columnas cortadas por el layout (p. ej. la tabla de actores del ecosistema en 1.1 partida entre las páginas 1-3). Las tablas de este archivo son una **reconstrucción fiel del contenido** a partir de ese texto fragmentado, recompuestas en formato Markdown estándar — no una transcripción byte a byte del layout original. El contenido de cada celda se preserva íntegro; solo cambia la representación tabular.)*

---

## CAPÍTULO 1 — Visión global de la industria

**Estado declarado en el original:** ✅ Completo — pendiente de tu aprobación para pasar al Capítulo 2 (Qué es realmente un broker).

### 1.1 Los actores del ecosistema

La aviación ejecutiva bajo demanda (charter) no es una industria de dos partes (cliente–avión). Es una cadena de al menos ocho tipos de actores, cada uno con incentivos distintos:

| Actor | Qué hace | Tiene certificado/licencia | Toca el dinero del cliente |
|---|---|---|---|
| **Propietario (Owner)** | Es dueño legal de la aeronave. Puede ser un individuo, una empresa, un family office o un programa de fraccional. Normalmente **no opera** el avión él mismo. | No | Indirectamente (recibe el remanente tras costes de gestión) |
| **Operador (Direct Air Carrier)** | Tiene el certificado que le permite volar pasajeros de pago (Part 135 en EE.UU.; AOC — Air Operator Certificate — en la UE/España bajo EASA/AESA). Contrata pilotos, gestiona mantenimiento, es responsable legal del vuelo. | Sí | A veces (venta directa) o no (si todo pasa por el broker) |
| **Empresa de gestión de aeronaves (Aircraft Management Company)** | Gestiona la aeronave en nombre del propietario: mantenimiento, tripulación, cumplimiento normativo, y la ofrece en charter cuando el dueño no la usa. En muchos casos es la misma entidad que el operador, pero no siempre. | Normalmente sí (si también opera) | A veces |
| **Broker / Charter Broker** | Intermediario entre el cliente y la red de operadores. No es dueño de aviones, no tiene certificado de operador. | No (ver 1.2 sobre regulación DOT Part 295 en EE.UU.) | Sí, casi siempre es quien cobra al cliente |
| **Marketplace B2B (Avinode es, con diferencia, el dominante)** | Plataforma tecnológica donde operadores publican disponibilidad y brokers buscan y cotizan. No es parte de la transacción. | No aplica | No (cobra suscripción a brokers/operadores, no comisión por transacción, salvo en Paynode) |
| **Auditores de seguridad independientes (ARGUS, Wyvern, IS-BAO/IBAC, ACSF)** | Certifican voluntariamente el nivel de seguridad de un operador. No son reguladores. | No aplica | No |
| **Reguladores** | FAA + DOT en EE.UU.; EASA + autoridad nacional (AESA en España) en la UE. Fijan el mínimo legal de seguridad y, en EE.UU., regulan también al broker como tal. | — | No |
| **FBOs, handlers, proveedores de combustible, MRO, aseguradoras, financieras** | Proveen los servicios que el operador necesita para ejecutar el vuelo. | Variable | No directamente con el cliente final |
| **Programas alternativos de distribución: fractional ownership (NetJets, Flexjet, PlaneSense), jet cards / membresías (VistaJet, XO, Wheels Up, Sentient Jet, NicholasAir)** | Modelos que compiten con el charter tradicional ofreciendo acceso prepagado o copropiedad, en vez de "un vuelo, una cotización". | Sí (son operadores certificados) | Sí, directamente |
| **Asociaciones sectoriales: NBAA (EE.UU.), EBAA (Europa), IBAC (internacional)** | No participan en la transacción, pero fijan buenas prácticas, hacen lobby regulatorio y publican guías (p. ej. las Q&A de NBAA sobre Part 295). | No aplica | No |

🔵 **Práctica habitual:** el propietario, el operador y el broker son casi siempre tres entidades legales distintas, aunque en la práctica un mismo grupo empresarial puede integrar dos de los tres roles (p. ej. una compañía que gestiona flotas de terceros y además vende charter directamente).

🟣 **Práctica de algunos operadores (modelo "fixed-fleet"):** compañías como Jet Linx o Clay Lacy Aviation son a la vez dueñas (o gestoras exclusivas) y operadoras de una flota fija, y también actúan como su propio canal de venta al cliente final — no dependen de brokers externos para todo su volumen.

🟣 **Práctica de algunos operadores (modelo "managed fleet"):** la mayoría del mercado, según fuentes del sector, funciona así — el propietario privado cede su avión a un operador/gestor, que lo mantiene disponible para charter cuando el dueño no vuela, compensando así los costes fijos de la propiedad.

### 1.2 Relaciones entre los actores: quién contrata con quién

Esto es el punto que más confusión genera fuera de la industria, así que conviene ser preciso:

**a) Propietario ↔ Operador/Gestor.** Contrato de gestión de aeronave (management agreement). El propietario paga (o compensa con ingresos de charter) al gestor por mantenimiento, tripulación, hangar, seguros; a cambio, el gestor puede monetizar las horas en que el dueño no vuela.

**b) Operador ↔ Broker.** No hay, por regla general, un contrato marco único: la relación se activa solicitud a solicitud. El broker manda una RFQ (request for quote); el operador responde si puede y a qué precio neto. La relación de confianza se construye con el tiempo (el broker aprende qué operadores responden rápido, cumplen, no cancelan) pero jurídicamente cada vuelo es, en la inmensa mayoría de los casos, un contrato independiente.

🟣 Algunos brokers de mayor volumen sí firman acuerdos de tarifa preferente o de bloque de horas con operadores concretos (modelo mayorista/consolidador — ver 1.3).

**c) Broker ↔ Cliente.** Aquí es donde entra la regulación de forma más directa en EE.UU. Bajo **14 CFR Part 295** (DOT, en vigor desde el 14 de febrero de 2019), el broker debe actuar en una de estas dos capacidades, y debe declararlo:

- **Indirect air carrier (principal):** el broker contrata por su cuenta con el operador y, por separado, contrata con el cliente. Puede fijar su propio precio de reventa (modelo *markup*).
- **Bona fide agent:** el broker actúa como agente del cliente o del operador, con autorización expresa del principal. En este caso normalmente cobra una comisión visible, no un margen oculto. *Cita del texto normativo referida por el Manual: "Un broker de aviación aérea, definido como transportista aéreo indirecto, transportista aéreo indirecto extranjero o agente de buena fe, presta transporte aéreo indirecto de pasajeros en chárteres de entidad única."*

🌐 **Esto es específico de EE.UU.** La Unión Europea no tiene un equivalente directo a la Part 295. En España, la aviación comercial se regula vía Reglamento (CE) 1008/2008 y la AESA, pero los servicios chárter se regulan conforme al Convenio de Chicago y los reglamentos de la UE, sin características especiales respecto a esos marcos — es decir, **no existe una figura jurídica de "broker de chárter" separada y regulada como tal en la normativa española/europea**, a diferencia de EE.UU. Esto es un punto que conviene verificar con un abogado aeronáutico local antes de construir cualquier flujo de cumplimiento normativo en JETMI, porque la ausencia de marco específico no equivale a ausencia de obligaciones (siguen aplicando protección al consumidor, IVA, KYC/AML si se gestionan pagos, etc.).

**d) Broker ↔ Broker (mayorista/minorista, sub-charter).** Un broker puede no tener acceso directo a un operador concreto, pero conocer a otro broker que sí. En ese caso el broker "minorista" opera de cara al cliente y subcontrata a un broker "mayorista" que tiene la relación con el operador. Esto añade una capa más de margen y, potencialmente, de opacidad sobre quién opera realmente el vuelo — que es precisamente lo que la Part 295 intenta forzar a transparentar (identidad real del operador).

**e) Broker/Operador ↔ Marketplace (Avinode).** Ninguno de los dos "contrata" a través de Avinode en sentido legal — Avinode es infraestructura, no parte del contrato de transporte. Avinode es un mercado en línea en el que los operadores de chárter colocan los detalles de sus aeronaves y del que los brokers obtienen la disponibilidad para sus clientes. Cobra una suscripción mensual a brokers y operadores (no una comisión por transacción, salvo cuando se usa su capa de pagos, Paynode).

**f) Operador ↔ Auditor de seguridad.** Relación voluntaria y de pago: el operador paga a ARGUS, Wyvern o IBAC (IS-BAO) para ser auditado. Estas organizaciones realizan valoraciones de seguridad útiles, pero es importante reconocer su modelo de negocio: solo las compañías que se apuntan (y pagan la tarifa) son revisadas. Esto es un matiz importante que casi ningún broker comunica al cliente: la ausencia de rating no implica inseguridad, solo ausencia de auditoría pagada.

⚪ **Opinión:** este es, para mí, uno de los puntos ciegos más interesantes de la industria desde el punto de vista de diseño de producto — el sistema de "confianza" del sector (ARGUS/Wyvern/IS-BAO) es un mercado privado y de pago, no un sistema regulatorio. Cualquier sistema que JETMI construya para "puntuar" operadores debería, como mínimo, dejar explícito qué partes de esa puntuación vienen de auditorías de pago y cuáles de datos objetivos (historial de accidentes, antigüedad de flota, etc.).

### 1.3 Cómo fluye el dinero

Hay que separar con cuidado varios modelos que **coexisten** en la industria y que a menudo se mezclan en la misma operación:

**a) Modelo de comisión (agente).** El broker cobra al cliente el precio del operador **más** una comisión declarada. La comisión suele estar entre el 5% y el 10% del coste total del chárter — es decir, en un vuelo de 20.000 $, el broker se llevaría entre 1.000 y 2.000 $. Es el modelo más transparente y el que casa mejor con la figura de "bona fide agent" de la Part 295.

**b) Modelo de markup (principal / indirect air carrier).** El broker recibe un precio neto del operador y fija su propio precio de venta al cliente, sin desglosar el margen. Es legal siempre que el broker declare que actúa como *indirect air carrier* — pero es también la fuente de la mayoría de las quejas de opacidad de precio en el sector, y el motivo por el que la Part 295 obliga a declarar la capacidad en la que actúa el broker.

**c) Fee management.** No es lo mismo que la comisión de charter: es la tarifa que una empresa de gestión de aeronaves cobra al **propietario** por gestionar su avión (mantenimiento, tripulación, cumplimiento, hangar). Este dinero no viene del cliente de charter, viene del dueño de la aeronave, y es un flujo económico completamente distinto que a veces se confunde con la "comisión del broker" porque, si la empresa de gestión también actúa como broker de su propia flota, ambos flujos conviven en la misma empresa.

**d) Modelo mayorista / minorista (wholesale vs retail).** 🌐 Los modelos de negocio minoristas ("retail") componen la mayor parte del sector de la aviación privada, pero los modelos mayoristas ("wholesale") son igualmente importantes: un mayorista contrata bloques de horas o tarifas preferentes con operadores y los revende a brokers minoristas, o directamente a clientes de alto volumen. Esto añade una capa de margen intermedia que el cliente final normalmente no ve.

**e) Empty legs (tramos vacíos).** Cuando un operador debe reposicionar una aeronave sin pasajeros — por ejemplo, tras dejar a un cliente en un destino de solo ida — vende ese tramo con descuentos del 25% al 75% sobre el precio de chárter estándar en vez de absorber el coste completo del vuelo vacío. 🔵 Hay dos submodelos de precio: **precio fijo** (todo el importe cubre el avión completo, independientemente de pasajeros) y **precio variable** (el precio publicado es un punto de partida sujeto a cambios según se acerca la fecha). El precio variable es el usado por la mayoría de brokers y plataformas, incluidas XO y el inventario de reposicionamiento de VistaJet. El broker puede intermediar en la venta del tramo vacío (cobrando su margen habitual) o el operador puede venderlo directamente, cortocircuitando al broker — de ahí han surgido plataformas como SkyAccess que compiten explícitamente ofreciendo "sin broker en medio".

**f) Rebates y acuerdos preferentes.** 🟣 Práctica de algunos brokers de mayor volumen: reciben condiciones especiales (mejor precio neto, prioridad de respuesta) de operadores con los que trabajan mucho. La Part 295 en EE.UU. obliga a que, si esta relación "tiene incidencia" en qué operador se selecciona para un cliente, se divulgue bajo petición. Si actúa como agente del cliente, el broker debe divulgar la existencia de cualquier relación con el transportista directo que pueda influir en la selección del operador.

**Ejemplo numérico simplificado (ilustrativo, no una cifra oficial del sector):** Cliente paga 20.000 $ → Broker retiene comisión/margen de, digamos, 2.000 $ (10%, modelo agente) → Operador recibe 18.000 $ → De esos 18.000 $, el operador paga combustible, tripulación, tasas de aeropuerto/handling, seguro prorrateado, mantenimiento prorrateado, y si el avión es de un tercero, un porcentaje va al propietario según su contrato de gestión.

### 1.4 Cómo fluye la información

El ciclo de información típico, en su forma más simple (se detallará vuelo a vuelo en el Capítulo 3):

1. **Cliente → Broker:** solicitud verbal o escrita (ruta, fecha, nº de pasajeros, preferencias).
2. **Broker → Mercado:** el broker traduce eso en una búsqueda en Avinode y/o mensajes directos a su red de operadores de confianza. Un buen broker no enviará la solicitud a decenas de operadores esperando una cotización; en cambio, la enviará a aquellos operacionalmente más alineados con esta misión.
3. **Operador → Broker:** respuesta de disponibilidad y precio neto. Los operadores determinarán si el vuelo es posible, considerando los tiempos de servicio de la tripulación, la disponibilidad de la aeronave, el mantenimiento y cuestiones regulatorias.
4. **Broker → Broker (filtro interno):** comparación de opciones, verificación cruzada de rating de seguridad (ARGUS/Wyvern/IS-BAO), cálculo de margen.
5. **Broker → Cliente:** presentación de la(s) opción(es) ya filtradas y con precio final.
6. **Cliente → Broker:** aceptación, datos de pasajeros, forma de pago.
7. **Broker → Operador:** confirmación de la reserva, transmisión de manifiesto de pasajeros y requisitos especiales (catering, mascotas, equipaje).
8. **Operador → (Handling/FBO/Tripulación):** activación operativa del vuelo.
9. **Durante el vuelo:** seguimiento de estado, gestión de imprevistos (clima, mantenimiento) — aquí es donde, si algo falla, el broker debe activar el "backup aircraft".
10. **Post-vuelo → Broker/Cliente:** factura, feedback, incidencias, cierre de comisión con el operador.

🔵 **Práctica habitual:** este ciclo completo se desarrollará vuelo a vuelo, con todos los documentos y sistemas que intervienen en cada paso, en el Capítulo 3 ("Ciclo completo de un vuelo") — aquí solo se traza el mapa general.

### 1.5 Quién toma las decisiones, y dónde

| Decisión | Quién la toma | Con qué información |
|---|---|---|
| Presupuesto, aeronave deseada, fecha | Cliente | Sus propias preferencias y presupuesto |
| A qué operadores contactar | Broker | Conocimiento de la red, historial de fiabilidad, tipo de misión |
| Si el vuelo es operacionalmente viable | Operador | Restricciones de tiempo de servicio de tripulación, restricciones de aeropuerto, prestaciones de la aeronave y requisitos regulatorios |
| Precio neto de venta | Operador (fija su tarifa) | Costes, demanda, posicionamiento de la flota |
| Margen/comisión final | Broker | Su modelo de negocio, relación con el cliente |
| Qué operador es "aceptable" en términos de seguridad | Broker (con apoyo de datos de auditores externos) | Rating ARGUS/Wyvern/IS-BAO, historial propio del broker con ese operador |
| Aceptar o rechazar el vuelo por seguridad/meteorología ya en curso | Piloto al mando / Operador | Normativa, condiciones reales |

### 1.6 Cuellos de botella estructurales de la industria

🔵 **Proceso todavía muy manual fuera de los marketplaces:** "nuestro negocio sigue siendo muy manual entre brokers y operadores; se necesita muchísima comunicación para asegurar que el cliente tenga un buen viaje", en palabras del propio director de Avinode. Incluso con la plataforma, buena parte de la negociación fina ocurre por teléfono o mensaje directo.

🔵 **Fragmentación extrema de la oferta:** se calcula que existen unos 2.000 operadores de aviación privada en el mundo con flotas de más de 5 aeronaves cada uno, sin contar los operadores más pequeños de una o dos aeronaves. Evaluar de forma independiente la reputación, precios y disponibilidad de un universo así es, para un cliente individual, prácticamente imposible.

🔵 **Regulación dispar por país:** en EE.UU. existe una figura regulatoria explícita ("air charter broker") con obligaciones de registro y divulgación desde 2019; en la UE, y en España en particular, no existe un marco equivalente específico para brokers — lo que significa que las obligaciones de transparencia que un broker debe cumplir dependen mucho de en qué jurisdicción esté constituido y opere, y de normativa general de protección al consumidor más que de una norma sectorial dedicada.

🔵 **Verificación de seguridad incompleta:** los tres grandes sistemas de rating (ARGUS, Wyvern, IS-BAO) son voluntarios y de pago. Si un operador no aparece en estas bases de datos no significa necesariamente que sea inseguro — puede que simplemente no haya pagado por el servicio. Esto obliga a los brokers serios a mantener su propio criterio adicional de vetting, no solo delegar en el sello externo.

🔵 **Riesgo de sustitución y cancelación:** mecánica, meteorología, o cambios del operador original pueden dejar sin aeronave a un cliente ya confirmado. Si se reserva a través de un broker de confianza, este está contractualmente obligado a encontrar una aeronave de sustitución — lo cual es una razón de negocio central para que exista el rol de broker, más allá de la mera búsqueda inicial.

🔵 **Riesgo de cancelación específico de empty legs:** las estimaciones sitúan la tasa de cancelación de tramos vacíos entre el 10% y el 15%, porque dependen enteramente de que el vuelo principal que los origina no cambie.

🔵 **Reposicionamiento como coste oculto:** si la aeronave ideal está ocupada o en otra ciudad, el operador puede rechazar la misión u ofrecer una aeronave con reposicionamiento, lo que incrementa el coste entre un 30% y un 60%.

⚪ **Opinión:** la combinación de estos cuellos de botella (fragmentación de oferta + verificación de seguridad manual y externa + comunicación por canales no estructurados) es, a mi juicio, la razón de fondo por la que este sector sigue teniendo tanto valor para un intermediario humano — y también la razón por la que cualquier capa de automatización/IA tiene que resolver primero el problema de **información fiable y estructurada**, no solo el de "generar una cotización más rápido". Volveremos a esto en el Capítulo 15 (Oportunidades), pero conviene dejarlo anotado ya.

### 1.7 Qué problemas resuelve realmente un broker

Sintetizando lo anterior, el broker de aviación privada existe porque resuelve, de forma simultánea:

1. **Agregación de una oferta radicalmente fragmentada** — ningún cliente puede evaluar 2.000+ operadores por sí mismo.
2. **Filtrado de seguridad especializado** — interpretar ratings ARGUS/Wyvern/IS-BAO, historiales e indicios que un cliente no sabría leer.
3. **Negociación** — acceso a precios netos y condiciones que un cliente individual no obtendría directamente.
4. **Absorción de riesgo operativo** — compromiso contractual de encontrar aeronave de sustitución ante imprevistos.
5. **Punto único de contacto y responsabilidad** — un único interlocutor para toda la logística, en vez de que el cliente tenga que tratar con el operador, el FBO, el catering, etc.
6. **Gestión del cumplimiento regulatorio y de disclosure** (sobre todo en EE.UU., bajo Part 295) — identidad real del operador, capacidad en la que actúa el broker, seguros.
7. **Disponibilidad 24/7 ante imprevistos** — meteorología, retrasos, cambios de última hora.

### Resumen de conceptos fundamentales — Capítulo 1

- La industria tiene **al menos ocho tipos de actores** distintos (propietario, operador, gestor de flota, broker, marketplace, auditor de seguridad, regulador, proveedores de servicio en tierra), y un mismo grupo empresarial puede combinar varios roles.
- El **broker no opera aviones ni tiene certificado**; su valor está en la agregación, el filtrado de seguridad, la negociación y la absorción de riesgo — no en el activo físico.
- Existen **varios modelos de monetización que coexisten**: comisión declarada (agente), margen no declarado (principal/indirect air carrier), fee de gestión de flota (no es lo mismo que la comisión de charter), modelo mayorista/minorista, y empty legs.
- **EE.UU. regula explícitamente al broker** desde 2019 (14 CFR Part 295); **la UE/España no tiene una figura equivalente específica** — esto es una diferencia estructural importante de cara al diseño de cualquier módulo de cumplimiento normativo en JETMI.
- Los sistemas de rating de seguridad (ARGUS, Wyvern, IS-BAO) son **privados, voluntarios y de pago** — no equivalen a certificación oficial ni su ausencia equivale a inseguridad.
- Los cuellos de botella estructurales (fragmentación de oferta, procesos manuales, verificación de seguridad incompleta, riesgo de cancelación/sustitución) son la causa raíz de por qué el rol de broker sigue teniendo valor — y son también el mapa de oportunidades que retomaremos en el Capítulo 15.

### Fuentes consultadas para este capítulo

- NBAA — 14 CFR Part 295, Air Charter Broker Questions and Answers (nbaa.org)
- eCFR — 14 CFR Part 295, Air Charter Brokers (ecfr.gov)
- Paramount Business Jets — Part 295: Private Jet Charter Broker Rules and Regulations
- Dunaway Law Group — Air Charter Broker Part 295
- NATA — Public Charter FAQs (Part 380 vs Part 295)
- ICLG — Aviation Laws and Regulations Report 2026, España
- Lexology — In review: aviation licensing in Spain
- Avinode.com (Broker, Operator, Join, Pricing) y Business Jet Traveler — Avinode Group
- Charter Broker (charterbroker.aero) — entrevista a Oliver King, MD de Avinode
- SkyAccess.com — comparativa Avinode vs SkyAccess
- Amalfi Jets, Icarus Jet, Stratos Jet Charters, JETVIP, NovaJet, Jettly — broker vs operador, modelos de negocio
- Schubach Aviation, TruNorth Jets, Jet Linx, FileFlo, Look Book & Fly, Jetvice, L33, Atmosphere Aviation, Solairus, PASA (Private Aviation Safety Alliance) — ARGUS/Wyvern/IS-BAO
- BLADE, Private Jets Connect, IONA JETS, WanderAbout, Fliteline, VOMOS, Empty Leg Guide — mecánica de empty legs

---

## Índice preliminar de capítulos futuros

*(Ninguno de estos capítulos tiene contenido todavía — solo título y estado, tal como figura en el documento original. No se ha investigado ni escrito nada de ellos.)*

| Capítulo | Título | Estado declarado |
|---|---|---|
| 2 | Qué es realmente un broker | ⏳ Pendiente de aprobación del Capítulo 1 |
| 3 | Ciclo completo de un vuelo | ⏳ Pendiente |
| 4 | Modelo de negocio | ⏳ Pendiente |
| 5 | Operadores | ⏳ Pendiente |
| 6 | Aircraft | ⏳ Pendiente |
| 7 | Clientes | ⏳ Pendiente |
| 8 | Requests | ⏳ Pendiente |
| 9 | Quotes | ⏳ Pendiente |
| 10 | Negociación | ⏳ Pendiente |
| 11 | Operación del vuelo | ⏳ Pendiente |
| 12 | Después del vuelo | ⏳ Pendiente |
| 13 | Herramientas utilizadas actualmente | ⏳ Pendiente |
| 14 | Dolor real de la industria | ⏳ Pendiente |
| 15 | Oportunidades | ⏳ Pendiente |

**Nota de procedencia (añadida en la ingestión a `/docs`, no parte del original):** el Mapa Maestro de Investigación (ver `mapa-maestro-investigacion.md` en esta misma carpeta) revisa críticamente este índice de 15 capítulos y propone una reestructuración en fases con dominios adicionales (legal, fiscal, seguros, fraude, organización AI-native, etc.) que el índice original no cubría. Ver `LOG.md` para cómo se relacionan ambos documentos.
