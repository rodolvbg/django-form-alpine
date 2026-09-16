## Development and Testing

This project uses [uv](https://github.com/astral-sh/uv) for Python dependency management and [Vitest](https://vitest.dev/) for JavaScript testing.

### Python Environment and Tests

1.  **Install dependencies**:

    ```bash
    uv sync
    ```

2.  **Install Playwright browsers**:

    ```bash
    uv run playwright install
    ```

3.  **Run Python tests**:
    ```bash
    uv run pytest
    ```

4.  **Lint / format / type-check**:
    ```bash
    uv run ruff check .
    uv run ruff format --check .
    uv run mypy src example
    ```

### Compatibility matrix (tox)

`uv run pytest` above only runs against whatever Django version
`uv.lock` resolved (the newest one satisfying `dependencies`). To check
the full supported range — every Django series in `classifiers`,
against the oldest and newest Python it supports (within this
package's own `requires-python` floor) — run the tox matrix instead:

```bash
uv run tox run           # every env
uv run tox -e py39-dj32  # a single env, e.g. to debug one failure
```

`[tool.tox]` in `pyproject.toml` lists the exact envs. Each one gets its own ephemeral venv
(via [tox-uv](https://github.com/tox-dev/tox-uv), using uv's own Python
builds — `uv python install <version>` once for any you don't have yet)
with only `pytest`/`pytest-django`/`pytest-cov` and that env's pinned
Django, not the full `dev` group, and skips `tests/e2e/` (no Playwright
in those envs). This only tests boundaries (oldest + newest Python per
Django series), not every valid combination — that catches most real
breakage while staying fast. This is exactly how the matrix caught a
real bug: `mixins.py` imported `django.forms.Script` unconditionally,
which doesn't exist before Django 5.2 — every older Django version
would crash on import despite being declared as supported (fixed with
a conditional import and a plain-string fallback). Runs in CI as a
separate `compat-matrix.yml` workflow, alongside the regular
`pytest.yml`.

### JavaScript Tests

1.  **Install dependencies**:

    ```bash
    npm install
    ```

2.  **Run JS tests**:

    ```bash
    npm test
    ```

3.  **Run JS coverage**:
    ```bash
    npm run coverage
    ```

### Pre-commit

This project uses [pre-commit](https://pre-commit.com/) to run formatting,
linting and type-checking hooks (ruff, biome, django-upgrade, mypy,
pyproject-fmt) automatically before each commit, and the same hooks run in
CI.

1.  **Install the git hook** (one-time, after `uv sync`):

    ```bash
    uv run pre-commit install
    ```

2.  **Run all hooks against the whole repo** (useful before opening a PR):

    ```bash
    uv run pre-commit run --all-files
    ```

The `mypy` hook runs against the project's `uv` environment (it needs
`django-stubs` to resolve model/field types), not an isolated pre-commit
environment, so make sure `uv sync` has been run first.
