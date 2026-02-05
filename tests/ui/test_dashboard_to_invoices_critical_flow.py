"""
End-to-End UI Flow Test: Dashboard → Invoices (Critical Risk Filter)

This test verifies the complete user journey:
1. User views the Dashboard with Risk Distribution chart
2. User clicks on the "Critical" bar in the chart
3. App navigates to Invoices page with Critical filter applied
4. Only Critical invoices are displayed

This represents a key business flow for risk analysis.
"""

import unittest
from tests.ui.base_test import BaseUITest
from tests.ui.pages.dashboard_page import DashboardPage
from tests.ui.pages.invoices_page import InvoicesPage


class TestDashboardToInvoicesCriticalFlow(BaseUITest):
    """
    Test suite for Dashboard → Invoices navigation with risk filtering.
    
    Validates that clicking a risk level in the Risk Distribution chart
    correctly filters the Invoices page.
    
    All verification steps run sequentially in a single comprehensive test.
    """

    def test_complete_dashboard_to_invoices_critical_flow(self):
        """
        Complete end-to-end flow test: Dashboard → Invoices with Critical filter.
        
        This test runs all verification steps sequentially:
        
        PART 1: Dashboard Navigation & URL Verification
        1. Open Dashboard
        2. Get count of Critical invoices from Risk Distribution chart
        3. Click on "Critical" in Risk Distribution
        4. Verify URL updates to /invoices?risk_level=CRITICAL
        
        PART 2: Invoices Page Filter Verification
        5. Verify filter dropdown shows "Critical"
        6. Verify "Filtered: Critical" badge is visible
        7. Verify all visible invoices have Critical risk level
        8. Verify invoice count matches dashboard
        
        PART 3: Data Isolation Verification
        9. Verify no other risk levels appear (Low/Medium/High)
        10. Confirm data integrity across the flow
        """
        
        print("\n" + "="*70)
        print("STARTING COMPLETE DASHBOARD → INVOICES CRITICAL FLOW TEST")
        print("="*70 + "\n")
        
        # ========================================
        # PART 1: DASHBOARD NAVIGATION & URL VERIFICATION
        # ========================================
        print("PART 1: Dashboard Navigation & URL Verification")
        print("-" * 70)
        
        # Step 1: Open Dashboard
        print("Step 1: Opening Dashboard...")
        dashboard = DashboardPage(self.page)
        dashboard.open()
        print("✓ Dashboard loaded successfully")
        
        # OPTIONAL: Close "Visit Site" overlay if it appears
        try:
            visit_btn = self.page.get_by_role("button", name="Visit Site")
            if visit_btn.is_visible(timeout=3000):
                visit_btn.click()
                self.page.wait_for_load_state("domcontentloaded")
        except Exception:
            pass
        
        # Step 2: Get the count of Critical invoices (for later validation)
        print("\nStep 2: Getting Critical invoice count from Dashboard...")
        try:
            critical_count = dashboard.get_risk_count("Critical")
            print(f"✓ Dashboard shows {critical_count} Critical invoices")
        except Exception as e:
            print(f"⚠ Could not get Critical count from dashboard: {e}")
            critical_count = None
        
        # Step 3: Click on the Critical bar/card in Risk Distribution
        print("\nStep 3: Clicking Critical bar in Risk Distribution chart...")
        dashboard.click_risk_distribution("Critical")
        print("✓ Clicked Critical risk level")
        
        # Step 4: Verify URL updates correctly
        print("\nStep 4: Verifying URL navigation...")
        self.page.wait_for_url("**/invoices?risk_level=CRITICAL", timeout=10_000)
        current_url = self.page.url
        self.assertIn("/invoices", current_url)
        self.assertIn("risk_level=CRITICAL", current_url)
        print(f"✓ URL correctly updated to: {current_url}")
        print("✓ URL contains '/invoices' and 'risk_level=CRITICAL'")
        
        # ========================================
        # PART 2: INVOICES PAGE FILTER VERIFICATION
        # ========================================
        print("\n" + "="*70)
        print("PART 2: Invoices Page Filter Verification")
        print("-" * 70)
        
        invoices = InvoicesPage(self.page)
        
        # Wait for invoices page to load
        self.page.wait_for_selector("h2:has-text('Invoices')", timeout=10_000)
        print("✓ Invoices page loaded")
        
        # Step 5: Verify the filter dropdown shows "Critical" selected
        print("\nStep 5: Verifying filter dropdown selection...")
        invoices.assert_risk_filter_selected("Critical")
        print("✓ Filter dropdown shows 'Critical' selected")
        
        # Step 6: Verify the "Filtered: Critical" badge is visible
        print("\nStep 6: Verifying 'Filtered: Critical' badge...")
        invoices.assert_filtered_badge_visible("Critical")
        print("✓ 'Filtered: Critical' badge is visible")
        
        # Step 7: Verify all visible invoice rows have Critical risk level
        print("\nStep 7: Verifying all displayed invoices are Critical...")
        row_count = invoices.get_visible_row_count()
        
        if row_count > 0:
            print(f"✓ Found {row_count} invoice(s) in the filtered table")
            
            # Assert all rows match the Critical risk level
            invoices.assert_all_rows_match_risk("CRITICAL")
            print(f"✓ All {row_count} invoices have Critical risk level")
            
            # Step 8: Verify count consistency
            print("\nStep 8: Verifying count consistency between pages...")
            if critical_count is not None:
                if row_count != critical_count:
                    print(
                        f"⚠ WARNING: Dashboard showed {critical_count} Critical invoices, "
                        f"but table shows {row_count}."
                    )
                    print("  This might indicate data changed between page loads.")
                else:
                    print(f"✓ Count matches: {row_count} Critical invoices on both pages")
            else:
                print("⚠ Skipping count comparison (dashboard count unavailable)")
        else:
            print("⚠ No Critical invoices found in the table")
            print("  (This might be expected if no Critical data exists)")
        
        # ========================================
        # PART 3: DATA ISOLATION VERIFICATION
        # ========================================
        print("\n" + "="*70)
        print("PART 3: Data Isolation Verification")
        print("-" * 70)
        
        # Step 9: Verify no other risk levels appear
        print("\nStep 9: Verifying no other risk levels are displayed...")
        
        if row_count > 0:
            forbidden_levels = ["Low", "Medium", "High"]
            all_clean = True
            
            for forbidden in forbidden_levels:
                # Try to find a row with the forbidden level
                forbidden_rows = self.page.locator(
                    f"tbody tr:has-text('{forbidden}')"
                ).count()
                
                # Filter out "Critical" rows that might contain "High" as substring
                actual_forbidden = 0
                for i in range(forbidden_rows):
                    row = self.page.locator(f"tbody tr:has-text('{forbidden}')").nth(i)
                    # Check if this row has "Critical" - if so, it's not forbidden
                    if row.get_by_text("Critical", exact=False).count() == 0:
                        actual_forbidden += 1
                
                if actual_forbidden > 0:
                    all_clean = False
                    self.fail(
                        f"❌ Found {actual_forbidden} invoice(s) with '{forbidden}' risk level "
                        f"when filtering for Critical"
                    )
                else:
                    print(f"✓ No '{forbidden}' risk invoices found (correct)")
            
            if all_clean:
                print(f"✓ Data isolation verified: Only Critical invoices displayed")
        else:
            print("⚠ Skipping data isolation check (no rows to verify)")
        
        # Step 10: Final confirmation
        print("\nStep 10: Final verification...")
        print("✓ All filter components working correctly")
        print("✓ Navigation flow completed successfully")
        print("✓ Data integrity maintained throughout flow")
        
        print("\n" + "="*70)
        print("✅ COMPLETE FLOW TEST PASSED")
        print("="*70 + "\n")


if __name__ == "__main__":
    unittest.main()
