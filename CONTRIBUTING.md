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
