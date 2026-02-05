# UI Test Plan

## What to test

- **Dashboard**: Main dashboard loads, displays summary statistics, and shows invoice risk widgets.
- **Invoice List**: Invoice table displays correctly with filters (risk level, vendor), expandable rows show item details, and risk reasons are visible.
- **Critical Flow**: Dashboard → Navigate to invoices → Filter by risk level → View invoice details.
- **Vendor Analytics**: Vendor risk charts render with correct data and filtering works.

## Test strategy

UI automation tests using Pytest with Selenium WebDriver and Page Object Model pattern.
Tests interact with the Next.js frontend (localhost:3000) and validate API integration with backend (localhost:8081).

## Environment

Local execution with Chrome browser in headless mode.
Backend API must be running on localhost:8081.
Frontend Next.js app on localhost:3000.

## Success & reporting

All critical UI workflows are covered by automated tests.
Test results are generated with Allure reports showing pass/fail status with screenshots.
Execute tests with: `pytest tests/ui/ -v`
Generate reports with: `allure generate allure-results -o allure-report`
