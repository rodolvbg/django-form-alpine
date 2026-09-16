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
