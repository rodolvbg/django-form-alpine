import json

from django.contrib.auth.models import User
from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from playwright.sync_api import expect, sync_playwright


class AdminAlpineTests(StaticLiveServerTestCase):
    """Browser tests for Alpine.js admin integration, logged in as admin."""

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch()

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()
        super().tearDownClass()

    def setUp(self):
        super().setUp()
        self.context = self.browser.new_context()
        self.page = self.context.new_page()
        self.login_as_admin()

    def login_as_admin(self):
        User.objects.filter(username="admin").delete()
        User.objects.create_superuser("admin", "admin@example.com", "password")
        self.page.goto(f"{self.live_server_url}/admin/login/")
        self.page.fill("#id_username", "admin")
        self.page.fill("#id_password", "password")
        self.page.click("[type=submit]")
        self.page.wait_for_url(f"{self.live_server_url}/admin/")

    def tearDown(self):
        self.context.close()
        super().tearDown()

    def test_admin_login(self):
        """Admin login succeeds and redirects to the dashboard."""
        expect(self.page).to_have_url(f"{self.live_server_url}/admin/")
        expect(self.page.locator("h1")).to_contain_text("Site administration")

    def test_alpine_js_loaded_on_add_page(self):
        """Alpine.js is available on the ParentModel add page."""
        page = self.page
        page.goto(f"{self.live_server_url}/admin/test_app/parentmodel/add/")
        page.wait_for_function("() => window.Alpine && window.Alpine.version")
        version = page.evaluate("() => window.Alpine.version")
        assert version, "Alpine.js should expose a version string"

    def test_admin_js_sets_x_data_on_form(self):
        """admin.js initialises x-data on the form with extraFieldState."""
        page = self.page
        page.goto(f"{self.live_server_url}/admin/test_app/parentmodel/add/")
        page.wait_for_function("() => document.querySelector('form[x-data]') !== null")
        x_data_str = page.locator("form[x-data]").first.get_attribute("x-data")
        assert x_data_str is not None, "form must have x-data attribute"
        x_data = json.loads(x_data_str)
        assert "extraFieldState" in x_data
        assert x_data["extraFieldState"] == ""

    def test_x_add_model_data_becomes_x_model(self):
        """x-add-model-data on extra_field is converted to x-model by admin.js."""
        page = self.page
        page.goto(f"{self.live_server_url}/admin/test_app/parentmodel/add/")
        page.wait_for_function("() => document.querySelector('form[x-data]') !== null")
        expect(page.locator("#id_extra_field")).to_have_attribute(
            "x-model", "extraFieldState"
        )

    def test_form_row_hides_when_secret_typed(self):
        """Typing 'secret' hides the form row via Alpine x-show reactivity."""
        page = self.page
        page.goto(f"{self.live_server_url}/admin/test_app/parentmodel/add/")
        page.wait_for_function("() => window.Alpine && window.Alpine.version")

        extra_field = page.locator("#id_extra_field")
        form_row = page.locator(".form-row", has=page.locator("#id_extra_field"))

        expect(form_row).to_be_visible()

        extra_field.fill("secret")
        expect(form_row).to_be_hidden()

    def test_form_row_reappears_after_clearing_secret(self):
        """Clearing the 'secret' value restores form row visibility."""
        page = self.page
        page.goto(f"{self.live_server_url}/admin/test_app/parentmodel/add/")
        page.wait_for_function("() => window.Alpine && window.Alpine.version")

        extra_field = page.locator("#id_extra_field")
        form_row = page.locator(".form-row", has=page.locator("#id_extra_field"))

        extra_field.fill("secret")
        expect(form_row).to_be_hidden()

        # Clear via JS because the element is now hidden (display:none)
        page.evaluate(
            """
            const el = document.querySelector('#id_extra_field');
            el.value = '';
            el.dispatchEvent(new Event('input', { bubbles: true }));
            """
        )
        expect(form_row).to_be_visible()

    def test_stacked_inline_extra_has_x_model(self):
        """Stacked inline stacked_extra input gets x-model set by admin.js."""
        page = self.page
        page.goto(f"{self.live_server_url}/admin/test_app/parentmodel/add/")
        page.wait_for_function("() => document.querySelector('form[x-data]') !== null")
        stacked_extra = page.locator("[id$='-stacked_extra']").first
        x_model = stacked_extra.get_attribute("x-model")
        assert x_model is not None, "stacked_extra should have x-model set"
        assert "stacked_extra" in x_model

    def test_tabular_inline_extra_has_x_model(self):
        """Tabular inline tabular_extra checkbox gets x-model set by admin.js."""
        page = self.page
        page.goto(f"{self.live_server_url}/admin/test_app/parentmodel/add/")
        page.wait_for_function("() => document.querySelector('form[x-data]') !== null")
        tabular_extra = page.locator("[id$='-tabular_extra']").first
        x_model = tabular_extra.get_attribute("x-model")
        assert x_model is not None, "tabular_extra should have x-model set"
        assert "tabular_extra" in x_model

    def test_inline_x_data_contains_inline_fields(self):
        """The form x-data contains keys for all inline extra fields."""
        page = self.page
        page.goto(f"{self.live_server_url}/admin/test_app/parentmodel/add/")
        page.wait_for_function("() => document.querySelector('form[x-data]') !== null")
        x_data_str = page.locator("form[x-data]").first.get_attribute("x-data")
        x_data = json.loads(x_data_str)

        # Check that at least one key contains the inline field names
        stacked_keys = [k for k in x_data if "stacked_extra" in k]
        tabular_keys = [k for k in x_data if "tabular_extra" in k]
        assert stacked_keys, f"x-data missing stacked_extra key, got: {x_data}"
        assert tabular_keys, f"x-data missing tabular_extra key, got: {x_data}"
