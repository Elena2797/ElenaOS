Última actualización: 2026-08-07 — handoff corto, no histórico acumulativo (para eso está CHANGELOG.md)

# NEXT_SESSION.md

## Qué se terminó en esta sesión
**Cuatro decisiones seguidas (D14-D17) sobre VistaJet, arrancadas por un bug real reportado por la usuaria y terminadas con una feature completa en uso real.** D14: `vj_state` había acumulado 3 filas en producción (causa de que Isabel/Telegram y el frontend divergieran sobre cuál era el avión actual) — reconciliado a una fila, índice único añadido y verificado. D15: la usuaria demostró que el fix de D14 no bastaba — dos rutas de UI (un fallback de `localStorage` sin avión en el resumen de HOTO, la señal de Laundry de Aircraft Readiness desconectada del módulo real) seguían filtrando datos del avión anterior; corregidas, y se formalizó el principio general en `PRINCIPLES.md` #11. D16: se construyó el flujo real de import de HOTO (subir el PDF oficial ya recibido → LIFEOS lo analiza, AcroForm real sin OCR → la usuaria elige explícitamente "Continuar este HOTO" o "Nuevo HOTO desde este", nunca inferido → mismo editor de siempre) — necesitó extender el modelo de `vj_hoto_records` con `columns` jsonb porque solo representaba una de las 6 columnas de handover del documento real. D17: probando el HOTO real de D-AFBS en el iPhone, la usuaria encontró tres defectos reales de export/UX — Tail Number/ICAO con texto duplicado (dos widgets solapados del PDF recibían el mismo valor), Magazines rota (auto-ajuste de fuente dependiente del visor + un bug de codificación real: el texto de Magazines de 9H-VCQ contiene tabs, que `WinAnsiEncoding` no sabe codificar y podía abortar la generación de apariencias de TODO el formulario, no solo Magazines), y una UX de exportación que no se sentía como "guardar" — rediseñada como "Guardar PDF" con nombre editable y Web Share API (mejor camino en iOS). Los tres corregidos y verificados contra datos reales (el HOTO real de 9H-VCQ, con sus tabs reales) y contra la API ya desplegada en producción. **El HOTO de D-AFBS ya está en Generación 2 en uso real** — se vio en vivo durante la verificación de D17 (Magazines con 5 revistas reales, defects, comments, cabin care 16/17). Todo commiteado y pusheado a `main` en ambos repos; 213/213 tests `isabel-api`, 4/4 `life-os-app`.

## Qué quedó pendiente
1. **Confirmación de la usuaria en su iPhone real** de que "Guardar PDF" → Web Share API → "Guardar en Archivos" conserva el nombre de archivo elegido. Esta sesión verificó todo lo accionable desde el entorno de desarrollo (peticiones HTTP reales contra la API desplegada, bytes del PDF generados sin excepción, estructura de la apariencia correcta) pero no puede accionar el Share Sheet nativo de iOS.
2. Resto sin cambios de sesiones anteriores: cron de sueño de las 08:00, rotación de `ANTHROPIC_API_KEY` (`SECURITY.md` riesgo #9), `SECURITY.md` riesgo #10, token de GitHub en texto plano en el remoto de `life-os-app`.

## Qué debe hacerse inmediatamente después
Sin instrucción explícita de la usuaria. Si no hay nada más urgente, preguntar cómo le fue el "Guardar PDF" en el iPhone real (punto 1 de pendientes) antes de dar D17 por completamente cerrado. Fuera de eso, la usuaria decide el siguiente dominio — no asumir Finanzas por defecto (instrucción recurrente en sesiones anteriores).

## Qué no debe romperse
- **El principio de D15 (`PRINCIPLES.md` #11):** corregir una query no basta — auditar también cada ruta de *presentación* del dato (fallbacks locales, señales desconectadas del módulo real).
- **El principio de D17, más general todavía:** un bug que parece de "renderizado" o "visual" puede tener una causa mucho más profunda (aquí, una excepción de codificación silenciada por un try/catch global) — verificar contra el DATO REAL de producción, no solo contra fixtures sintéticos, antes de dar un fix por completo.
- El modelo de `vj_hoto_records` es el mismo desde D13 — nunca se creó "HOTO v2". `columns` jsonb (D16) guarda columnas ya cerradas; los campos planos (`ch_code`, `received_date`, `days_on_aircraft`, `daily_duties`) siguen siendo "la columna de trabajo actual" — el editor vivo no cambió.
- Ningún HOTO histórico se borra nunca. `tail_number` de un HOTO histórico nunca se reasigna.
- `vj_state` debe seguir teniendo exactamente 1 fila — el índice único ya está aplicado, un segundo `INSERT` falla solo.
- No inventar fechas reales (`delivered_at` y similares) cuando falten — preguntar.
- `setText()` en `pdfExport.js` ahora sanea caracteres de control automáticamente — no quitar ese saneado ni añadir un `setText` nuevo que lo esquive.
- Los secretos solo entran como variables de entorno en Railway — nunca en literales de config versionada.
- No crear una segunda implementación paralela de Isabel.

## Qué documentos debe leer el siguiente chat
`README.md` → este documento → `CURRENT_STATE.md` → `DECISIONS.md` D14-D17 (la investigación completa, en cuatro pasadas) → `PRINCIPLES.md` #11 → `modules/VISTAJET_HOTO.md` (estado real del módulo, import + export corregidos) → `KNOWN_PROBLEMS.md`. `core/AUTOMATIONS.md` y `isabel-gateway/README.md` solo si hace falta tocar Telegram/cron, sin cambios en estas sesiones.
