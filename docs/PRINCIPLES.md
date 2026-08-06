Estado: conocimiento vigente (no es código, es criterio)
Última verificación: 2026-07-10
Verificado en: síntesis de PRODUCT_PRINCIPLES.md (raíz), EVOLUTION.md (raíz), y patrones observados en esta sesión
Fuente de verdad de datos: ninguna

# PRINCIPLES.md — Principios vigentes

Este documento no sustituye a `PRODUCT_PRINCIPLES.md` ni a `EVOLUTION.md` en la raíz del proyecto (documentos de filosofía extensa, ver ahí el razonamiento completo). Aquí viven **destilados a regla operativa**, los que cualquier chat nuevo debe aplicar sin tener que leer la filosofía completa.

## Principios de producto

1. **El PDF/Excel oficial es la salida, nunca el lugar de trabajo.** Tanto Inventario como HOTO siguen el mismo patrón: Supabase es la fuente de verdad viva; el documento oficial (Excel/PDF) es una exportación que se genera bajo demanda y nunca se edita a mano.

2. **Nunca inventar información ausente.** Si un dato no existe, se declara ausente explícitamente (campo vacío, "sin evidencia") — nunca se asume, nunca se rellena con un valor plausible. Aplica a exportadores, a Aircraft Readiness, y a esta misma documentación.

3. **Write-all en exportadores**: un exportador que solo escribe los campos con valor corre el riesgo de arrastrar datos viejos del documento base. La regla es escribir *todos* los campos modelados en cada export, con valor o con vacío explícito, para que el documento final sea función pura de los datos actuales.

4. **Cero pasos innecesarios en el flujo operativo real.** El diseño se juzga contra "¿qué haría la Cabin Hostess durante el día?", no contra "¿qué se ve bien en una demo?".

## Principios de ingeniería (surgidos en esta sesión, confirmados por el usuario)

5. **Migración, no reinicio.** Cambios de esquema son aditivos (`ADD COLUMN`, nunca `DROP`/`DELETE`/`TRUNCATE` sobre datos reales) salvo instrucción explícita y aprobada.

6. **Verificación empírica antes de afirmar.** Un mapeo, un cálculo o una integración no se dan por buenos por lectura de código — se ejecutan contra datos reales y se comparan resultados (ver el patrón usado en Cabin Care, Shopping y Daily Duties: marcadores únicos + render + inspección visual).

7. **Protocolo antes/después en cualquier cambio que toque datos de producción**: contar registros, exportar el documento, comparar campo a campo. Si algo difiere sin que fuera intencional, se revierte.

8. **Una sola fuente de verdad por dato.** Cuando dos módulos necesitan el mismo dato, uno es dueño y el otro lo consume (por lectura o por snapshot explícito) — nunca lo duplican de forma que puedan divergir sin que nadie se entere.

11. **Operational data is current iff it belongs to the current context key — todo lo demás es histórico, nunca se borra.** En VistaJet, el contexto es `vj_state.aircraft`: ningún HOTO/inventario/formulario/contador de un avión distinto puede presentarse como si perteneciera al avión actual, aunque sea "el más reciente" o el único que exista. No basta con corregir la query que trae el dato de Supabase — cualquier fallback (`localStorage`, caché en memoria, un valor que se calculó antes de que el contexto cambiara) tiene que respetar la misma regla, o el dato viejo se filtra igual aunque la query esté perfectamente corregida (D14 corrigió las queries; D15, horas después, tuvo que corregir tres rutas de UI que las rodeaban por completo — un fallback de `localStorage` sin ningún tag de contexto, y una señal de otro módulo que nunca se conectó al dato real). Este principio se aplica a cualquier dominio futuro que tenga un "actual" (la CH en curso de otra aerolínea, el mes fiscal activo en Finanzas, etc.) — identifica la clave de contexto, y audita *cada* ruta de presentación del dato, no solo la query.

## Principios de esta documentación

9. **Un chat nuevo no debe necesitar este chat.** Toda decisión con consecuencias futuras se registra en `DECISIONS.md`; toda grieta conocida en `KNOWN_PROBLEMS.md`; el estado real en `CURRENT_STATE.md`; el handoff exacto de la última sesión en `NEXT_SESSION.md`.

10. **Distinguir siempre implementado / parcial / diseñado / idea futura**, de forma visible (header de metadatos), no enterrado en el texto.
