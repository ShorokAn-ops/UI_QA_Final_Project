# UI Tests with Allure Reporting

## Setup

### 1. Install Python dependencies

```bash
pip install -r tests/ui/requirements.txt
```

### 2. Install Playwright browsers

```bash
python -m playwright install chromium
```

## Running Tests

### Run all UI tests

```bash
pytest tests/ui -v --tb=short --alluredir=allure-results
```

### Run specific test file

```bash
pytest tests/ui/test_dashboard_page.py -v --alluredir=allure-results
```

## Allure Reports

### Generate Allure HTML report

```bash
# On Windows
allure generate allure-results -o allure-report --clean

# Or use npm script
npm run allure:generate
```

### Open Allure report in browser

```bash
# On Windows
allure open allure-report

# Or use npm script
npm run allure:open
```

### Install Allure CLI (if not already installed)

```bash
# Windows (using Scoop)
scoop install allure

# Or download from: https://github.com/allure-framework/allure2/releases
```

## Notes

- Frontend must be running on `http://localhost:3001` before running tests
- Start frontend: `npm run dev` or `npm run dev:test`
- Allure results are stored in `./allure-results`
- HTML reports are generated in `./allure-report`
