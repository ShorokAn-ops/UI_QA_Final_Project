# Playwright UI Tests - Implementation Summary

## Overview

This implementation provides comprehensive Playwright UI tests using the Page Object Model (POM) pattern for testing the Risk Analysis system across ERPNext and the Risk UI.

## Files Created/Updated

### Page Objects (tests/pages/)

1. **erpnext_login_page.py** - ERPNext login functionality
   - `open()` - Navigate to ERPNext
   - `login(user, pass)` - Perform login
2. **purchase_invoice_list_page.py** - Purchase Invoice list page
   - `open()` - Navigate to purchase invoice list
   - `click_add_purchase_invoice()` - Click Add button
3. **purchase_invoice_form_page.py** - Purchase Invoice form
   - `fill_company(company)` - Fill company field
   - `fill_supplier(supplier)` - Fill supplier field
   - `fill_item_row(item, qty, rate)` - Add item row with details
   - `save_and_get_invoice_id()` - Save and extract invoice ID from URL
4. **risk_ui_invoices_page.py** - Risk UI invoices page with full functionality
   - `open()` - Navigate to invoices page
   - `set_risk_filter(label)` - Apply risk filter
   - `wait_for_invoice(invoice_id)` - Wait for invoice to appear
   - `get_row_by_invoice_id(invoice_id)` - Get specific row
   - `open_more_reasons_for_row(row)` - Click +X more link
   - `assert_row_risk(row, expected_label)` - Assert risk level
   - `assert_modal_has_ai_insights()` - Verify AI insights in modal
   - `assert_all_rows_match_risk(expected)` - Validate filtered results

### Test Files (tests/)

1. **test_journey_create_invoice_then_verify_risk.py** - End-to-end journey test
   - Creates invoice in ERPNext
   - Verifies invoice appears in Risk UI
   - Validates supplier, risk level, and reasons
   - Checks AI insights in modal
2. **test_component_invoices_filter_and_reasons.py** - Component test
   - Tests risk filtering functionality
   - Validates all filtered rows match selected risk
   - Tests reasons modal display

## Environment Variables

The tests support the following environment variables (with defaults):

```bash
# ERPNext Configuration
ERPNEXT_URL=http://localhost:8080
ERPNEXT_USER=Administrator
ERPNEXT_PASS=admin

# Risk UI Configuration
RISK_UI_URL=http://localhost:3001

# Test Execution
HEADLESS=0  # 0 = visible browser, 1 = headless

# Component Test Configuration
FILTER_LABEL=High Risk  # or "Low Risk", "Critical"
FILTER_EXPECTED=HIGH    # or "LOW", "CRITICAL"
```

## Running the Tests

### Prerequisites

1. Install dependencies:

   ```bash
   pip install -r requirements.txt
   playwright install chromium
   ```

2. Ensure both servers are running:
   - ERPNext: http://localhost:8080
   - Risk UI: http://localhost:3001

### Run Individual Tests

**Journey Test (End-to-End):**

```bash
pytest tests/test_journey_create_invoice_then_verify_risk.py -v
```

**Component Test (Filter & Modal):**

```bash
pytest tests/test_component_invoices_filter_and_reasons.py -v
```

### Run All Tests

```bash
pytest tests/ -v
```

### Run with Options

```bash
# Run in headless mode
HEADLESS=1 pytest tests/test_component_invoices_filter_and_reasons.py -v

# Run with different filter
FILTER_LABEL="Low Risk" FILTER_EXPECTED=LOW pytest tests/test_component_invoices_filter_and_reasons.py -v

# Run with detailed output
pytest tests/ -v --tb=long
```

## Test Architecture

### Page Object Model Benefits

- **Separation of Concerns**: Locators and UI actions are in page objects, not tests
- **Maintainability**: Changes to UI only require updating page objects
- **Reusability**: Page objects can be reused across multiple tests
- **Readability**: Tests read like user scenarios

### Stability Features

- Uses `expect()` with timeouts instead of `sleep()`
- Robust selectors based on visible text/roles
- Handles UI polling/updates with proper waits
- Scoped searches to avoid flaky selectors
- Automatic retry on filter application if needed

## Test Scenarios

### TEST 1: Journey (End-to-End)

**Purpose**: Verify complete flow from invoice creation to risk analysis

**Steps**:

1. Login to ERPNext
2. Navigate to Purchase Invoice list
3. Create new invoice with:
   - Company: "Demo Company"
   - Supplier: "NovaTech Trading"
   - Item: "Office Supplies"
   - Qty: 30
   - Rate: 10000
4. Save (not submit) and capture invoice ID
5. Open Risk UI and wait for invoice
6. Verify supplier, risk level, and reasons
7. Open modal and verify AI insights

**Expected Results**:

- Invoice created successfully
- Invoice appears in Risk UI within 60 seconds
- Risk level shows "High Risk" (or expected level)
- Modal contains risk details and AI insights

### TEST 2: Component (Filter & Modal)

**Purpose**: Test risk filtering and modal display independently

**Steps**:

1. Open Risk UI invoices page
2. Apply risk filter (e.g., "High Risk")
3. Wait for UI to update
4. Verify all visible rows match filter
5. Click "+X more" on first available row
6. Verify modal content

**Expected Results**:

- Filter applies successfully
- All visible rows show correct risk level
- Modal displays:
  - "Risk Analysis Details"
  - "All Reasons"
  - At least one "AI INSIGHT"
  - Substantial text content (>50 chars)

## Troubleshooting

### Test Hangs or Times Out

- Check that both ERPNext and Risk UI servers are running
- Verify network connectivity to localhost:8080 and localhost:3001
- Check browser console for JavaScript errors
- Increase timeout values in page objects if needed

### Selectors Not Found

- Check if UI has changed (text labels, structure)
- Update selectors in page objects (not in tests)
- Use `page.pause()` in tests to debug interactively

### Modal Not Opening

- Ensure "+X more" links exist in filtered data
- Check if modal is being blocked by other UI elements
- Verify modal selector in risk_ui_invoices_page.py

### Filter Not Applying

- Check network tab for API calls
- Verify filter dropdown options match FILTER_LABEL
- Ensure adequate wait time for React state updates

## Future Enhancements

Potential additions to the test suite:

- Test multiple risk levels in journey test
- Test pagination in invoices table
- Test search functionality
- Test modal close behaviors
- Test error handling scenarios
- Add data-driven tests with multiple suppliers/items
- Add visual regression testing
- Add performance measurements

## Code Quality

The implementation follows best practices:

- ✅ Clean separation: Page Objects vs Tests
- ✅ No hardcoded waits (`sleep`)
- ✅ Robust selectors (text-based, not CSS classes)
- ✅ Proper error messages for debugging
- ✅ Environment variable support
- ✅ Comprehensive documentation
- ✅ Stable waits with expect()
- ✅ Minimal test code duplication
