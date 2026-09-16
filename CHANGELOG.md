# Changelog

## [Unreleased]

### Added

- Compatibility matrix via tox (`[tool.tox]` in `pyproject.toml`, using
  [tox-uv](https://github.com/tox-dev/tox-uv)): tests every Django series
  in `classifiers` (3.2 through 5.2) against its oldest and newest
  supported Python, within this package's own floor. `uv run tox run`
  locally, a separate `compat-matrix.yml` CI workflow.
- Type checking: `mypy` + `django-stubs`, and a `py.typed` marker.

### Changed

- Build backend: `setuptools` → `hatchling`.
- Test config moved from a standalone `pytest.ini` into
  `[tool.pytest.ini_options]` in `pyproject.toml`.
- JS lint/format: `prettier` → `biome`, matching the sibling `django-*`
  packages.
- JS tests moved from a top-level `js_tests/` directory to `tests/js/`.
- `tests/test_playwright.py` renamed and moved to `tests/e2e/test_e2e.py`
  — browser end-to-end tests now live in their own subdirectory, named
  after what they test rather than the tool.

### Fixed

- **`mixins.py` imported `django.forms.Script` unconditionally, but
  `Script` was only added in Django 5.2** — every older Django version
  this package declares support for (3.2 through 5.1) would crash
  immediately on import. The regular test suite never caught this because
  `uv.lock` always resolves to the newest compatible Django; the new
  compatibility matrix caught it on its very first Django-3.2 run. Fixed
  with a conditional import and a plain-string fallback for `Media.js`
  entries on Django < 5.2 — `defer` is only set on the `<script>` tag when
  `Script` is available, everything still loads either way.

## [0.0.5] - 2026-03-29

### Fixed

- **Scripts now run synchronously instead of on `DOMContentLoaded`** — `admin.js` and `core.js` previously registered `DOMContentLoaded` listeners, but Alpine v3 calls `Alpine.start()` immediately when its script executes (it checks `document.readyState`, which is already `"interactive"` for `defer` scripts). This meant Alpine initialized the DOM before our listeners fired, causing "Undefined variable" Alpine errors on every directive we applied. Both scripts now run their initialization synchronously. Since `defer` guarantees document-order execution (`admin.js` → `core.js` → `alpine.js`), Alpine always sees the fully prepared DOM.

## [0.0.4] - 2026-03-27

### Added

- **Dynamic inline rows supported** — `core.js` now listens for the `formset:added` event that Django Admin dispatches when a new inline row is added. The new row's inputs are processed automatically (directives applied, `x-model` set, Alpine state updated), and `Alpine.initTree` is called on the row so bindings take effect immediately without a page reload.

### Fixed

- **Empty form template rows skipped** — elements whose `name` or `id` contains Django's `__prefix__` placeholder are now ignored by `core.js`. Previously these template inputs were processed, producing phantom state keys and Alpine expression errors.

## [0.0.3] - 2026-03-27

### Added

- **`td` Django Admin preset resolver** — targets the closest `<td>`, useful for applying directives to individual cells in tabular formsets (`x-td-<directive>`).
- **`self` built-in resolver** — always available regardless of which mixin or custom resolvers are configured. Use `x-self-<directive>` to apply Alpine directives directly to the input element itself, which is especially useful in formsets where no surrounding container is needed.

### Changed

- **`__row_prefix__` sanitizes hyphens to underscores** for Alpine.js compatibility. The row prefix (from the container ID or element `name`) is now sanitized so hyphens become underscores, producing valid JavaScript identifiers (e.g. `items_0_myField` instead of `items-0-myField`). Hyphens in Alpine expressions cause a parse error because JavaScript treats them as subtraction operators.

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
