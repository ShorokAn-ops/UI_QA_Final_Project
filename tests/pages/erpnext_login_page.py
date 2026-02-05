from playwright.sync_api import Page

class ERPNextLoginPage:
    """
    Minimal login helper.
    Works with common ERPNext login selectors.
    If you're already logged in, it won't break.
    """

    def __init__(self, page: Page, base_url: str):
        self.page = page
        self.base_url = base_url.rstrip("/")

        self.user_input = 'input#login_email, input[name="usr"]'
        self.pass_input = 'input#login_password, input[name="pwd"], input[type="password"]'
        self.login_btn = 'button:has-text("Login"), button[type="submit"]'

    def open(self):
        self.page.goto(f"{self.base_url}/app", wait_until="domcontentloaded")
        return self

    def login(self, username: str, password: str):
        """Login method as per spec"""
        if self.page.locator(self.user_input).count() > 0:
            self.page.locator(self.user_input).first.fill(username)
            self.page.locator(self.pass_input).first.fill(password)
            self.page.locator(self.login_btn).first.click()
            self.page.wait_for_load_state("networkidle")
        return self

    def login_if_needed(self, username: str, password: str):
        # If login form exists, login. Otherwise assume already logged in.
        return self.login(username, password)
