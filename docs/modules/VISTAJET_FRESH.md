Estado: implementado mínimo
Última verificación: 2026-07-10
Verificado en: life-os-app/src/main.js, vjFreshView()
Fuente de verdad de datos: ninguna

# modules/VISTAJET_FRESH.md

# Objetivo
Plan de provisiones frescas basado en sectores y pasajeros de la rotación.

# Estado real
Vista existente, sin lógica de dominio verificada más allá de mostrarse como tarjeta ("Basado en sectores y pasajeros" es el texto descriptivo en la UI, no una función que calcule nada).

# Qué funciona
`vjFreshView()` se renderiza como parte del router de vistas de VistaJet.

# Qué está parcialmente implementado
No se verificó lógica real de cálculo de necesidades por sector/pasajeros — el texto de la tarjeta lo sugiere pero no se confirmó implementación.

# Qué no existe todavía
Cualquier conexión con `shopping` de HOTO (que sí captura frescos concretos como lemons, limes, leche, etc. — ver `VISTAJET_HOTO.md`). Son dos superficies distintas sobre un tema relacionado, sin puente entre ellas.

# Modelo de datos
No verificado con certeza en esta auditoría — pendiente de revisión más profunda si este módulo se prioriza.

# Flujos de usuario
No verificado en detalle.

# Backend/endpoints
Ninguno identificado.

# Frontend/vistas
`life-os-app/src/main.js`: `vjFreshView()`.

# Archivos relevantes
`life-os-app/src/main.js`.

# Verificaciones empíricas
Ninguna realizada — módulo no fue objeto de trabajo en esta sesión.

# Bugs conocidos
Ninguno identificado (no se auditó a fondo).

# Decisiones cerradas
Ninguna.

# Fuera de alcance actual
Todo — este módulo no fue objeto de desarrollo activo en el periodo cubierto por esta documentación.

# Próximo hito
Auditar en profundidad antes de asumir cualquier cosa sobre su funcionamiento real — este documento declara explícitamente la incertidumbre en vez de inventar detalle.
