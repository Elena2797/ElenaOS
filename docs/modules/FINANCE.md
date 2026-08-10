Estado: especialista V1 de solo lectura preparado; UI/Core determinista integrado
Última verificación: 2026-08-10
Verificado en: datos reales de Supabase, `isabel-api/src/core/specialists/finance.js`, `GET /v1/finance/summary`, `life-os-app/src/services/financeReadModel.js`
Fuente de verdad de datos: `DATA_MODEL.md` § `transactions` y `metrics`

# Finanzas

## Objetivo

Responder con evidencia a “¿cómo va el mes y dónde requiere atención?”, sin convertir LIFEOS en un sistema contable ni inventar saldos o predicciones.

## Estado real

La tabla contiene 881 movimientos entre 2026-01-01 y 2026-06-26: 762 gastos y 119 ingresos. Las fuentes normalizadas son 631 Sabadell, 240 Revolut y 10 sin fuente conocida. La lectura real de junio reconoce 125 movimientos, cero filas inválidas y cero gastos sin categoría.

La vista legacy sigue ofreciendo CRUD, filtros por mes/categoría, YTD y heatmap. Encima de ella, el Core incorpora una primera lectura determinista y fail-closed:

- ventana mensual semiabierta y moneda EUR declaradas;
- ingresos, gasto, neto y transferencias a ahorro separados;
- Transferencias, Ahorro y Nómina no cuentan como consumo por categoría;
- cobertura, fechas y fuentes normalizadas;
- comparación sólo contra presupuestos positivos configurados;
- señales explicables `budget_exceeded` y `budget_near_limit`;
- candidatos de acción estructurados, todavía no conectados a prioridad ni entrega.

## Contrato de seguridad

`GET /v1/finance/summary?month=YYYY-MM` es una lectura autenticada. No llama a modelos, no escribe, no entra en `/v1/now`, MCP, Telegram, proactividad o crons. Si la lectura falla, LIFEOS muestra “no disponible”; nunca convierte un fallo en cero gasto.

No hay presupuestos configurados hoy, por lo que la lectura real produce cero señales y cero candidatos. Esto es el resultado correcto, no falta de detección.

## Isabel y superficies

LIFEOS consume el resumen Core y lo revalida al abrir o volver a la app. Isabel todavía no tiene tools financieras: no puede consultar este resumen desde Telegram ni escribir transacciones como specialist. Esa activación queda fuera de O4.

## Huecos

- `transactions`, `metrics` y sus políticas no tienen migración reproducible completa en el repositorio.
- No hay importación bancaria automática.
- No existen fuentes verificadas para saldos, deuda, inversiones, suscripciones contractuales, facturas futuras o patrimonio.
- Las señales financieras no alimentan aún Goals, FollowUps ni Home prioritario.
- La vista legacy continúa calculando importes para sus gráficos; la nueva tarjeta de estado sí representa el Core.

## Próximo hito

Después de O4: versionar el esquema real y activar de forma reversible la lectura financiera para Isabel/Knowledge. La primera activación no debe incluir predicciones, recomendaciones de inversión ni movimientos de dinero.
