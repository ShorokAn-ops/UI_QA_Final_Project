# Allure Reporting - Usage Guide

## ✅ Integration Complete

Allure reporting has been integrated into your UI tests **without modifying any test logic or assertions**.

## 📋 What Changed

### Files Modified:

1. **[pytest.ini](pytest.ini)** - Added `--alluredir=allure-results` to automatically generate Allure results
2. **[test_journey_create_invoice_then_verify_risk.py](tests/test_journey_create_invoice_then_verify_risk.py)** - Added Allure decorators and steps
3. **[test_vendor_filter_ui.py](tests/test_vendor_filter_ui.py)** - Added Allure decorators and steps

### Allure Features Added:

- ✓ **Test titles** - Descriptive names for better readability
- ✓ **Severity levels** - CRITICAL/NORMAL priority indicators
- ✓ **Test descriptions** - Context about what each test validates
- ✓ **Step annotations** - UI flow visualization (navigate, apply filter, verify)
- ✓ **Attachments** - Invoice IDs, vendor names, URLs on failure
- ✓ **No logic changes** - All assertions and test behavior remain identical

## 🚀 Running Tests with Allure

### Option 1: Run tests (results auto-generated)

```powershell
pytest tests/ui
```

Results are saved to `allure-results/` automatically.

### Option 2: Run specific test

```powershell
pytest tests/test_vendor_filter_ui.py -v
```

### Option 3: Run with explicit output dir

```powershell
pytest tests/ui --alluredir=allure-results
```

## 📊 Viewing Allure Reports

### Generate and Open Report

```powershell
# Generate HTML report
allure generate allure-results -o allure-report --clean

# Open in browser
allure open allure-report
```

### Quick Serve (Generate + Open)

```powershell
allure serve allure-results
```

## 📦 Installing Allure Commandline

### Windows (Scoop)

```powershell
scoop install allure
```

### macOS (Homebrew)

```bash
brew install allure
```

### Manual Download

Download from: https://github.com/allure-framework/allure2/releases

## 📝 Example Report Features

When you view the Allure report, you'll see:

- **Test Overview** - Pass/fail stats, duration, trends
- **Test Details** - Each test with title, severity, and description
- **Test Steps** - Visual flow of UI actions (navigate → filter → verify)
- **Attachments** - Invoice IDs, vendor names, failure URLs
- **Timeline** - Test execution sequence
- **Retries** - Retry attempts visible in the journey test

## 🔄 Workflow

```
1. Run tests → pytest tests/ui
2. Results saved → allure-results/
3. Generate report → allure generate allure-results -o allure-report --clean
4. View report → allure open allure-report
```

## ✅ Test Behavior Unchanged

All existing test logic remains **exactly the same**:

- Same assertions
- Same selectors
- Same retry logic
- Same timeouts
- Same wait conditions

Only **metadata and visualization** were added.

## 🎯 Next Steps

1. Run tests to generate initial Allure results
2. View the report using `allure serve allure-results`
3. Share reports by committing `allure-report/` to Git or hosting it

---

**Note:** The `allure-results/` directory is regenerated on each test run. Archive important reports before re-running tests.
