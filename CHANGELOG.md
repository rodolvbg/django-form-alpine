# Changelog

## [0.0.3] - 2026-03-27

### Added

- **`td` Django Admin preset resolver** — targets the closest `<td>`, useful for applying directives to individual cells in tabular formsets (`x-td-<directive>`).
- **`self` built-in resolver** — always available regardless of which mixin or custom resolvers are configured. Use `x-self-<directive>` to apply Alpine directives directly to the input element itself, which is especially useful in formsets where no surrounding container is needed.

### Changed

- **`__row_prefix__` sanitizes hyphens to underscores** for Alpine.js compatibility. The row prefix (from the container ID or element `name`) is now sanitized so hyphens become underscores, producing valid JavaScript identifiers (e.g. `items_0_myField` instead of `items-0-myField`). Hyphens in Alpine expressions cause a parse error because JavaScript treats them as subtraction operators.

### Fixed

- **Empty form template rows skipped** — elements whose `name` or `id` contains Django's `__prefix__` placeholder are now ignored by `core.js`. Previously these template inputs were processed, producing phantom state keys and Alpine expression errors.

## [0.0.2] - 2026-03-26

### Added

- `README.md` set as the PyPI long description via `pyproject.toml` (`readme = { file = "README.md", content-type = "text/markdown" }`).

## [0.0.1] - 2026-03-26

First release of `django-form-alpine`.

### Added

- **`FormAlpineMixin`** — base mixin that loads `core.js` and Alpine.js via Django's media framework. Use it in any Django form together with custom resolvers.
- **`AdminAlpineMixin`** — extends `FormAlpineMixin` and also loads `admin.js`, which registers built-in resolvers for all standard Django Admin containers.
- **`x-add-model-data`** attribute — declare it on a widget to automatically register the field's initial value in the closest `form[x-data]` and bind it with `x-model`.
- **Prefixed directives** — apply Alpine.js directives to surrounding containers directly from widget `attrs` using `x-<resolver>-<directive>` or `@<resolver>-<directive>` patterns.
- **`__row_prefix__` placeholder** — namespace Alpine state keys per inline row; resolved from the container ID or the element `name` attribute using Django's `<prefix>-<number>-<field>` convention.
- **Custom resolvers** — define `window.DjangoFormAlpine.resolvers` before the scripts load to target any container. Set `useAdminResolvers: true` to merge custom resolvers with the built-in admin ones.
- **Django Admin preset resolvers**: `form-row`, `form-multiline`, `form`, `fieldset`, `field-box`, `field-container`, `label`, `errorlist`, `help`, `inline-container`, `nonfield-errorlist`, `option-label`.
- **Configurable Alpine.js path** — override the bundled Alpine.js with `django_form_alpine_JS_PATH` in `settings.py`.
- Playwright end-to-end tests for Django Admin integration.
- Vitest unit tests with 100% statement, branch, function, and line coverage for `core.js` and `admin.js`.
