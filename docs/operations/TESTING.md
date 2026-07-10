Estado: implementado (solo en isabel-api)
Última verificación: 2026-07-10
Verificado en: isabel-api/src/__tests__/, package.json
Fuente de verdad de datos: ninguna

# operations/TESTING.md

## isabel-api — únicos tests automatizados del proyecto
```bash
cd isabel-api
npm test   # node --test src/__tests__/parser.test.js src/__tests__/exception.test.js
```
Framework: `node:test` nativo (sin dependencia externa). Cobertura: `parseLine`/`splitIntoLines`/`detectBatch` (parser de inventario, incluidos los 3 formatos de línea soportados), `buildPatch` (las 4 acciones: count/consume/missing/request), y el flujo de excepciones. 30/30 en verde a fecha de esta documentación.

**Nota de gitignore**: el patrón `_*` usado para archivos scratch temporales estuvo a punto de excluir accidentalmente `__tests__/` del control de versiones (empieza por `_`). Corregido con una excepción explícita en `.gitignore`. Si añades un nuevo directorio con prefijo `_`, verifica que no colisione con esta regla.

## life-os-app — sin tests automatizados
No se encontró ningún framework de testing configurado (`package.json` no tiene `test` script). La verificación de este repo se ha hecho, en la práctica, de forma empírica y manual: `npm run build` para confirmar que compila, y comparación antes/después de exports reales (PDF/Excel) contra producción.

## Patrón de verificación empírica (no es "testing" formal, pero es la práctica real del proyecto)
Para cambios que tocan exportadores o mapeos de campos: generar el documento con marcadores únicos por campo/fila, renderizar, comparar visualmente o programáticamente contra lo esperado. Usado en Cabin Care, Shopping y Daily Duties de HOTO — ver `modules/VISTAJET_HOTO.md` § Verificaciones empíricas.

## lifeos-agent
No se auditó su testing — fuera del alcance verificado en esta documentación.
