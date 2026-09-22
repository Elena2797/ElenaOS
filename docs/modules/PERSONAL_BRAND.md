Estado: implementado para Isabel (estrategia + Instagram + su vida); sin vista propia en la app
Última verificación: 2026-09-21
Verificado en: isabel-api `01b40b3` (en producción con `993c98e`), llamada real a `brand_content_context` por `/mcp/http`
Fuente de verdad de datos: `areas.ia_context` (estrategia) · Instagram por la API oficial · `instagram_credentials` (token cifrado)

# modules/PERSONAL_BRAND.md

# Objetivo
Presencia pública (Instagram) sostenible según energía y modo. Lo que ella pidió el 2026-09-21: que Isabel mire sus métricas y lo que está viviendo, y le proponga qué contenido crear, siguiendo la idea de contenido que trabajó en ChatGPT.

# Estado real
- **Isabel:** la tool `brand_content_context` está en producción (D54). Junta tres fuentes y cada una falla por separado:
  1. **Estrategia:** `areas.ia_context` de la fila "Marca Personal". Vacía hasta que llegue el texto de ChatGPT destilado.
  2. **Instagram:** solo lectura por "Instagram API with Instagram Login". Lee perfil, últimas 12 publicaciones con alcance, visualizaciones, guardados, compartidos y tasas sobre el alcance, las mejores por guardados, compartidos y alcance, y la cuenta a 28 días. Devuelve `instagram_not_configured` hasta que exista `INSTAGRAM_ACCESS_TOKEN` en Railway.
  3. **Su vida:** VistaJet (estado y día de rotación, nunca la matrícula), rachas de leer, escribir y gym, agenda de los próximos 7 días y tareas abiertas de Marca Personal.
- **App:** sigue siendo el área genérica (`areaView()`), sin vista propia. La estrategia y las métricas todavía no se ven en LIFEOS.

# Cómo conectar o reconectar Instagram
Abrir `https://isabel-api-production.up.railway.app/oauth/instagram/start?api_key=<API key pública>` en el navegador donde tenga Instagram abierto y pulsar **Permitir**. La respuesta debe ser "Conectado ✅". **No usar "Generar identificador" del panel de Meta:** con la verificación en dos pasos entra en bucle pidiendo iniciar sesión.

Requisitos, todos hechos el 2026-09-21: cuenta profesional (es `MEDIA_CREATOR`); app de Meta "Isabel" (`4038517622945123`, app de Instagram "Isabel-IG" `28224686620523394`) con los permisos `instagram_business_basic` e `instagram_business_manage_insights`; @estefaniaolcese como tester de Instagram, aceptado; URL de redireccionamiento `…/oauth/instagram/callback` registrada; `INSTAGRAM_APP_SECRET` en Railway; `instagram_credentials` aplicada. El token dura 60 días y `isabel-api` lo renueva cada semana; si se pierde (contraseña cambiada, permiso quitado), basta con volver a abrir el enlace.

# Reglas de la tool (van en la respuesta, `how_to_suggest`)
- Tres ideas concretas con formato y gancho, cada una apoyada en un dato real.
- Guardados y compartidos por alcance pesan más que los likes.
- En rotación, contenido que pueda grabar con el móvil. Libre, lo que necesite más tiempo.
- Confidencialidad de VistaJet: nunca clientes, matrículas, interiores identificables ni ubicación en tiempo real.
- No inventar métricas. Terminar empujando con `tasks_create` o `reminders_create`.

# Archivos relevantes
`isabel-api/src/core/instagram.js`, `isabel-api/src/core/specialists/brand.js`, `isabel-api/src/mcp.js` (`brand_content_context`), `isabel-api/migrations/instagram_credentials.sql`, `isabel-api/src/__tests__/brand.test.js`.

# Pendiente
- Que ella revise la estrategia cargada (`LIFE OS/marca-personal/isabel-estrategia.md`, igual a `areas.ia_context`).
- Empujón semanal de contenido (cron del Gateway) cuando haya estrategia y métricas.
- Que Isabel pueda anotar cambios de estrategia que ella le cuente (hoy solo se escribe desde una sesión de desarrollo).
- Vista propia en la app.

# Fuera de alcance
Publicar, comentar o leer mensajes de Instagram. Ver cuentas ajenas o navegar por internet.
