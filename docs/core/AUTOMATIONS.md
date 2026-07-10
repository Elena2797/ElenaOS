Estado: idea futura (nada verificado como automatización real corriendo sola)
Última verificación: 2026-07-10
Verificado en: búsqueda de cron/schedulers/triggers en ambos repos — sin resultados
Fuente de verdad de datos: ninguna

# core/AUTOMATIONS.md — Qué corre solo, y qué no

## Verificado: no hay ninguna automatización real corriendo hoy
No se encontró ningún cron job, scheduler, webhook programado, ni trigger de Supabase (más allá de los `DEFAULT now()` de columnas de timestamp) en ninguno de los tres repos. Todo lo que ocurre en el sistema ocurre porque la usuaria (o un chat de Claude) lo dispara manualmente.

## Lo más cercano a "automático" que existe
- **Aircraft Readiness**: se recalcula automáticamente al entrar en la vista de VistaJet o al volver del HOTO — pero es una evaluación bajo demanda al navegar, no un proceso en background.
- **Migración de checklist localStorage → Supabase**: corre automáticamente la primera vez que se abre el HOTO tras el deploy, pero es un evento disparado por la propia carga de la vista, no un scheduler.
- **El bot de Telegram** (`lifeos-agent`) podría considerarse el diseño más cercano a un "agente autónomo", pero responde a mensajes entrantes de Telegram — no actúa por iniciativa propia ni en background.

## Idea futura
Cualquier automatización real (recordatorios programados, alertas por tiempo transcurrido, tareas que se generan solas) no tiene diseño documentado en ningún sitio del proyecto a día de esta auditoría. Si se decide construir algo así, este es el documento donde debe registrarse el diseño antes de implementar.
