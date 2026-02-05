import os
import pytest
from collections.abc import Iterator
from playwright.sync_api import sync_playwright, Browser, BrowserContext, Page

UI_BASE_URL = os.getenv("UI_BASE_URL", "http://localhost:3001")

@pytest.fixture(scope="session")
def browser() -> Iterator[Browser]:
    with sync_playwright() as p:
        b = p.chromium.launch(headless=(os.getenv("HEADLESS", "1") == "1"))
        yield b
        b.close()

@pytest.fixture()
def context(browser: Browser) -> Iterator[BrowserContext]:
    ctx = browser.new_context(base_url=UI_BASE_URL)
    yield ctx
    ctx.close()

@pytest.fixture()
def page(context: BrowserContext) -> Iterator[Page]:
    p = context.new_page()
    yield p
    p.close()

