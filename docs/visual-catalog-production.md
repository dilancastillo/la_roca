# Catalogo visual de produccion

## Alcance inicial

El catalogo visual administra componentes generales asociados con valores que
ya existen en Odoo. No crea atributos, valores, exclusiones ni secuencias
comerciales. La primera version productiva admite solamente:

1. Cuellos.
2. Bolsillos inferiores.
3. Botas.

Las familias de producto admitidas son `Blusa`, `Pantalon` y `Uniforme`. La
fuente visual es SVG y la vista soportada es frontal.

## Arranque limpio

Produccion comienza sin definiciones, releases, escenarios ni lineas fijadas.
No se importa la carpeta local `.visual-catalog`, que permanece ignorada por
Git. Las migraciones crean unicamente tablas, funciones, restricciones, el
bucket privado y un puntero de release activa con valor nulo.

Mientras no exista una release activa:

1. Los asesores siguen usando los dibujos incluidos actualmente en el codigo.
2. Aprobar un componente no cambia el configurador de ventas.
3. Crear o aprobar una release tampoco cambia el configurador de ventas.
4. Solo `Publicar` cambia el puntero de produccion.

## Arquitectura productiva

- Vercel sirve la aplicacion web y la API Hono.
- Odoo sigue siendo la fuente de productos, atributos, valores, PTAV,
  exclusiones, orden y configuraciones comerciales.
- Supabase conserva metadatos, SVG privados, auditoria, releases, escenarios y
  fijaciones de version por linea.
- El navegador nunca recibe `SUPABASE_SERVICE_ROLE_KEY`.
- Preview y Production deben usar proyectos Supabase separados.

## Migraciones de Supabase

Ejecutar en orden, tanto en el proyecto Preview como en Production:

1. `infra/supabase/migrations/001_visual_catalog.sql`.
2. `infra/supabase/migrations/002_visual_catalog_general_products.sql`.
3. `infra/supabase/migrations/003_visual_catalog_releases.sql`.
4. `infra/supabase/migrations/004_visual_catalog_production_hardening.sql`.
5. `infra/supabase/migrations/005_visual_catalog_release_restore_idempotency.sql`.

La migracion `004` agrega:

- Numeracion concurrente de releases.
- Una sola release activa.
- Publicacion y restauracion atomicas.
- Estado productivo inicialmente vacio.
- Limite privado de 800 KB por SVG.
- MIME permitido `image/svg+xml`.

La migracion `005` hace idempotente una restauracion repetida de la misma
release activa, para que un doble clic o una respuesta tardia no deje el panel
mostrando un estado de error que ya fue aplicado en produccion.

Despues de ejecutar las migraciones, esta consulta debe devolver cero en las
tres primeras columnas y `null` en la ultima:

```sql
select
  (select count(*) from public.visual_definition_versions) as definitions,
  (select count(*) from public.visual_catalog_releases) as releases,
  (select count(*) from public.visual_catalog_line_release_pins) as pins,
  (select active_release_id
     from public.visual_catalog_release_state
    where id = 'production') as active_release_id;
```

No ejecutar `insert`, copias de JSON locales ni cargas manuales al bucket.

## Variables de Vercel

Configurar todas las siguientes variables por separado para Preview y
Production:

```text
ODOO_BASE_URL
ODOO_DB
ODOO_API_KEY
APP_JWT_SECRET
APP_USERS_JSON
APP_COOKIE_NAME=la_roca_session
APP_COOKIE_SECURE=true
APP_AUTOMATION_TOKEN
APP_ADMIN_EMAILS
APP_VISUAL_CATALOG_PUBLISHER_EMAILS
ALLOW_DEV_BYPASS_ACCESS=false
VISUAL_CATALOG_BACKEND=supabase
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_VISUAL_CATALOG_BUCKET=visual-catalog
```

Preview debe apuntar a Odoo de pruebas y Supabase Preview. Production debe
apuntar a Odoo real y Supabase Production. Nunca crear variables con prefijo
`VITE_` para secretos.

Todo publicador debe aparecer tambien en `APP_ADMIN_EMAILS`. Un despliegue de
Vercel devuelve HTTP 503 si falta una variable, si las cookies no son seguras,
si se activa el acceso de desarrollo o si se intenta usar archivos locales.

## Crear usuarios productivos

Desde una terminal local en la raiz del repositorio:

```powershell
npm run generate:app-user -- --email "admin@empresa.com" --name "Administrador"
```

El comando solicita dos veces la clave sin mostrarla y devuelve el JSON con
salt y hash PBKDF2. Colocar el arreglo completo como valor de `APP_USERS_JSON`.
Para varios usuarios, generar cada objeto y reunirlos dentro de un unico
arreglo JSON.

Generar secretos independientes para Preview y Production:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Ejecutar una vez para `APP_JWT_SECRET` y otra para
`APP_AUTOMATION_TOKEN`. No guardar los resultados en Git.

## Verificacion antes del merge

Desde la rama `test`:

```powershell
npm ci
npm run verify:production
git status --short
git ls-files .visual-catalog
```

`npm run verify:production` debe terminar correctamente y
`git ls-files .visual-catalog` no debe mostrar nada.

El workflow `.github/workflows/production-readiness.yml` repite la verificacion
en cada pull request hacia `main`.

## Despliegue Preview

1. Subir la rama `test`.
2. Abrir el deployment Preview generado por Vercel.
3. Iniciar sesion con un usuario de `APP_USERS_JSON` de Preview.
4. Abrir `/api/health`; debe devolver `ok: true`.
5. Abrir `/api/admin/visual-catalog/readiness` en la misma sesion.
6. Confirmar `backend: "supabase"`.
7. Confirmar `supportedSlots: ["neck", "lower_pocket", "boot"]`.
8. Confirmar `definitionCount: 0`, `releaseCount: 0`,
   `activeReleaseId: null` y `startsEmpty: true`.
9. Abrir `/tools/visual-catalog` y verificar que no existan versiones.
10. Crear componentes de prueba solamente en Preview.
11. Completar revision, laboratorio, publicacion y restauracion.
12. Confirmar que Odoo de produccion no recibio ningun cambio.

## Merge y despliegue Production

1. En Vercel, definir `main` como Production Branch.
2. Confirmar que las variables Production apuntan a recursos productivos.
3. Confirmar que las variables Preview siguen apuntando a recursos de prueba.
4. Crear el pull request de `test` hacia `main`.
5. Esperar que `Production readiness` y Vercel Preview terminen correctamente.
6. Revisar el diff y aprobar el pull request.
7. Hacer merge sin copiar `.visual-catalog` ni datos de Supabase Preview.
8. Esperar el deployment Production de Vercel.
9. Repetir `/api/health` y `/api/admin/visual-catalog/readiness`.
10. Confirmar nuevamente el arranque vacio.
11. Abrir una linea de venta y confirmar que mantiene el render legado.

## Primera activacion productiva

1. Crear desde cero un componente en Production.
2. Vincularlo visualmente con el valor estable recibido desde Odoo Production.
3. Guardarlo como borrador.
4. Enviarlo a revision y aprobarlo.
5. Crear una release candidata.
6. Abrir el laboratorio con una linea productiva de prueba controlada.
7. Probar candidata, publicada y comparacion.
8. Guardar al menos un escenario.
9. Completar toda la lista de comprobacion.
10. Enviar y aprobar la release.
11. Publicarla durante una ventana controlada.
12. Abrir una linea nueva y verificar el componente.
13. Guardar y volver a abrir la linea para comprobar la fijacion de version.

## Recuperacion

- Un error de componente se resuelve restaurando la release anterior desde la
  pestana `Releases`.
- La restauracion es atomica y no elimina SVG ni pedidos historicos.
- Un error de codigo se revierte desde Vercel al deployment anterior.
- No eliminar releases, definiciones ni objetos del bucket manualmente.
- Mantener respaldos de Supabase antes de cada ampliacion del alcance.

## Flujo operativo

Una definicion aprobada es inmutable. Para corregirla se clona, se modifica la
nueva version, se prueba en una release candidata y solo despues se publica.
Las lineas guardadas conservan los IDs concretos de sus definiciones y las
lineas nuevas fijan la release activa al abrirse por primera vez.
