# Cómo funciona

La librería tiene dos capas de JavaScript y dos mixins de Python.

## Capas de JavaScript

- **`core.js`** — el motor. En `DOMContentLoaded` lee `window.DjangoFormAlpine.resolvers`, itera todos los inputs del formulario y, por cada resolver, aplica los atributos con prefijo coincidentes al contenedor resuelto.
- **`admin.js`** — el preset para Django Admin. Registra resolvers predefinidos para todos los contenedores estándar del admin en `window.DjangoFormAlpine`, salvo que ya hayas definido los tuyos.

## Mixins de Python

| Mixin              | Carga                                | Cuándo usarlo                                     |
| ------------------ | ------------------------------------ | ------------------------------------------------- |
| `FormAlpineMixin`  | `core.js` + `alpine.js`              | Cualquier formulario Django con resolvers propios |
| `AdminAlpineMixin` | `admin.js` + `core.js` + `alpine.js` | Django Admin (resolvers predefinidos incluidos)   |

Ambos mixins inyectan sus scripts a través de la propiedad `media` estándar de Django, por lo que no se necesitan cambios en las plantillas — el admin de Django ya renderiza el media del formulario automáticamente.

## Ciclo de vida de la petición

1. La página carga — Django renderiza el formulario con sus scripts de media.
2. Los scripts cargan (diferidos) en orden: `admin.js` → `core.js` → `alpine.js`.
3. Se dispara `DOMContentLoaded`:
   - `admin.js` registra sus resolvers en `window.DjangoFormAlpine.resolvers`.
   - `core.js` lee esos resolvers, itera todos los inputs y aplica los atributos con prefijo a los contenedores resueltos, configurando `x-data` y `x-model` en el formulario.
4. Alpine.js se inicializa y recoge los atributos `x-data` / `x-model` / `x-show`.
