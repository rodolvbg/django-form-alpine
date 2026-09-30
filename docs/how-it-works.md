# How it works

The library has two JavaScript layers and two Python mixins.

## JavaScript layers

- **`core.js`** — the engine. On `DOMContentLoaded` it reads `window.DjangoFormAlpine.resolvers`, iterates over all form inputs, and for each resolver applies any matching prefixed attributes to the resolved container.
- **`admin.js`** — the Django Admin preset. Registers built-in resolvers for all standard admin containers into `window.DjangoFormAlpine` unless you supply your own.

## Python mixins

| Mixin              | Loads                                | Use when                                   |
| ------------------ | ------------------------------------ | ------------------------------------------ |
| `FormAlpineMixin`  | `core.js` + `alpine.js`              | Any Django form with custom resolvers      |
| `AdminAlpineMixin` | `admin.js` + `core.js` + `alpine.js` | Django Admin (built-in resolvers included) |
| `contrib.unfold.UnfoldAdminAlpineMixin` | `contrib/unfold.js` + `core.js` | django-unfold, with its own Alpine.js (see [django-unfold](themes/unfold.md)) |

Both mixins inject their scripts via the standard Django `media` property, so no template changes are needed — Django admin already renders form media automatically.

## Request lifecycle

1. Page loads — Django renders the form with its media scripts.
2. Scripts load (deferred) in order: `admin.js` → `core.js` → `alpine.js`.
3. `DOMContentLoaded` fires:
   - `admin.js` registers its resolvers into `window.DjangoFormAlpine.resolvers`.
   - `core.js` reads those resolvers, iterates all inputs, and applies prefixed attrs to the resolved containers, setting up `x-data` and `x-model` on the form.
4. Alpine.js initialises and picks up the `x-data` / `x-model` / `x-show` attributes.

Loaded as plain scripts instead (`UnfoldAdminAlpineMixin`, when the page already has its own deferred Alpine.js), `core.js` runs while the page is still parsed: it waits for Alpine's `alpine:init` event, fired right before Alpine initialises, and does step 3 then.
