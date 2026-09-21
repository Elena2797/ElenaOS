Estado: parcial — la tool de Isabel está desplegada; faltan la estrategia y el token de Instagram
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

# Cómo conectar Instagram (lo hace ella; es su cuenta)
1. Instagram en profesional: Configuración → Tipo de cuenta y herramientas → Cambiar a cuenta profesional → Creador. Las cuentas personales no tienen API desde diciembre de 2024.
2. developers.facebook.com → Crear app → caso de uso de Instagram (API con inicio de sesión de Instagram). No hace falta página de Facebook.
3. En la app: Instagram → configuración de la API con inicio de sesión empresarial de Instagram → Generar tokens de acceso → Añadir cuenta. Si pide rol de tester, aceptarlo en la configuración web de Instagram.
4. Railway → `isabel-api` → Variables → `INSTAGRAM_ACCESS_TOKEN` → **Deploy**. Sin pulsar Deploy, la variable se queda en espera.
5. Aplicar `isabel-api/migrations/instagram_credentials.sql` en el SQL Editor de Supabase para que el token se renueve solo. Sin la tabla caduca a los 60 días.

Permisos que hacen falta: `instagram_business_basic` para el perfil y las publicaciones, y `instagram_business_manage_insights` para las métricas. Sin el segundo, las métricas vuelven como `instagram_permission_missing` y el resto funciona. Con menos de 100 seguidores, Meta no da algunas métricas de cuenta.

# Reglas de la tool (van en la respuesta, `how_to_suggest`)
- Tres ideas concretas con formato y gancho, cada una apoyada en un dato real.
- Guardados y compartidos por alcance pesan más que los likes.
- En rotación, contenido que pueda grabar con el móvil. Libre, lo que necesite más tiempo.
- Confidencialidad de VistaJet: nunca clientes, matrículas, interiores identificables ni ubicación en tiempo real.
- No inventar métricas. Terminar empujando con `tasks_create` o `reminders_create`.

# Archivos relevantes
`isabel-api/src/core/instagram.js`, `isabel-api/src/core/specialists/brand.js`, `isabel-api/src/mcp.js` (`brand_content_context`), `isabel-api/migrations/instagram_credentials.sql`, `isabel-api/src/__tests__/brand.test.js`.

# Pendiente
- Su texto de ChatGPT → destilar → que ella lo revise → `areas.ia_context`.
- Token de Instagram, migración y verificación de las métricas contra su cuenta real. Los nombres de métricas de Meta no se pudieron probar sin token.
- Empujón semanal de contenido (cron del Gateway) cuando haya estrategia y métricas.
- Que Isabel pueda anotar cambios de estrategia que ella le cuente (hoy solo se escribe desde una sesión de desarrollo).
- Vista propia en la app.

# Fuera de alcance
Publicar, comentar o leer mensajes de Instagram. Ver cuentas ajenas o navegar por internet.
