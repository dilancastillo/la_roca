# Identidades Odoo para el catálogo visual

Los SVG, reglas y calibraciones existentes se crearon con las identidades de training. El cambio de base exige adaptar esa identidad visual; no hay que desplazar ni volver a dibujar los recursos.

La frontera de lectura de la API convierte IDs de atributo y product.attribute.value productivos al espacio visual de training. Los IDs reales se conservan en odooAttributeId y odooSourceValueId para diagnóstico. **value.id, selecciones, valores personalizados, exclusiones y escrituras de variantes continúan siendo PTAV reales del Odoo conectado.** Nunca se usan IDs PAV para escribir una variante.

El perfil se selecciona con ODOO_ID_PROFILE=training o laroca-production. Si se omite, únicamente la combinación documentada ODOO_DB=larocadotaciones y ODOO_BASE_URL=https://larocadotaciones.odoo.com activa el perfil productivo. El entorno Production/Preview de Vercel no decide qué base se usa. Una colisión de atributos se rechaza antes de mezclar opciones.

El editor recibe las mismas identidades visuales que el configurador, por lo que las asociaciones, condiciones de activación y tokens de vivos ya almacenados siguen siendo válidos. No se reescriben definiciones ni publicaciones de Supabase. Una referencia con sourceValueId explícito tiene prioridad sobre un PTAV histórico que coincida por número. Solo las referencias antiguas sin sourceValueId necesitan traducir binding.valueId al PTAV destino.

La tabla se genera con scripts/generate-odoo-identities.mjs desde IDS_Y_RELACIONES_COMPLETOS.md. Solo se incluyen filas CONSERVADO/CAMBIADO. El hash del inventario queda registrado en el archivo generado y en el fixture de pruebas; nunca se ejecuta texto del documento. Las tres tablas separan atributos, PAV y PTAV.

Verificación requerida:

- Validar las55 identidades de atributo,665 PAV y1476 PTAV del inventario, incluidos los16/304/589 cambios.
- Comparar escenas del navegador y servidor en training/producción, Blusa/Uniforme y Hombre/Mujer; verificar SVG dinámico, blancos y colores y calibración.
- Ejecutar typecheck, pruebas de catálogo y pruebas de equivalencia productiva.
- Contrastar los datos y SVG de la release activa, sin publicar otra release para corregir las referencias.
- Verificar lectura, guardado y recarga en una cotización de prueba antes de afirmar finalización. El permiso Products/Create de Odoo sigue siendo obligatorio para combinaciones sin variante existente.

Los dibujos y la calibración se mantienen intactos. Este cambio no ejecuta migraciones SQL ni crea todas las variantes comerciales.
