import json

import pytest
from django.contrib.auth.models import User
from playwright.sync_api import Page, expect

pytestmark = pytest.mark.django_db(transaction=True)


def _create_superuser():
    User.objects.filter(username="admin").delete()
    User.objects.create_superuser("admin", "admin@example.com", "password")


@pytest.fixture
def admin_page(page: Page, live_server):
    """Return a page already logged into the admin."""
    _create_superuser()
    page.goto(f"{live_server.url}/admin/login/")
    page.fill("#id_username", "admin")
    page.fill("#id_password", "password")
    page.click("[type=submit]")
    page.wait_for_url(f"{live_server.url}/admin/")
    return page


def test_admin_login(page: Page, live_server):
    """Admin login succeeds and redirects to the dashboard."""
    _create_superuser()
    page.goto(f"{live_server.url}/admin/login/")
    page.fill("#id_username", "admin")
    page.fill("#id_password", "password")
    page.click("[type=submit]")
    expect(page).to_have_url(f"{live_server.url}/admin/")
    expect(page.locator("h1")).to_contain_text("Site administration")


def test_alpine_js_loaded_on_add_page(admin_page: Page, live_server):
    """Alpine.js is available on the ParentModel add page."""
    admin_page.goto(f"{live_server.url}/admin/test_app/parentmodel/add/")
    admin_page.wait_for_function("() => window.Alpine && window.Alpine.version")
    version = admin_page.evaluate("() => window.Alpine.version")
    assert version, "Alpine.js should expose a version string"


def test_admin_js_sets_x_data_on_form(admin_page: Page, live_server):
    """admin.js initialises x-data on the form with extraFieldState."""
    admin_page.goto(f"{live_server.url}/admin/test_app/parentmodel/add/")
    admin_page.wait_for_function(
        "() => document.querySelector('form[x-data]') !== null"
    )
    x_data_str = admin_page.locator("form[x-data]").first.get_attribute("x-data")
    assert x_data_str is not None, "form must have x-data attribute"
    x_data = json.loads(x_data_str)
    assert "extraFieldState" in x_data
    assert x_data["extraFieldState"] == ""


def test_x_add_model_data_becomes_x_model(admin_page: Page, live_server):
    """x-add-model-data on extra_field is converted to x-model by admin.js."""
    admin_page.goto(f"{live_server.url}/admin/test_app/parentmodel/add/")
    admin_page.wait_for_function(
        "() => document.querySelector('form[x-data]') !== null"
    )
    expect(admin_page.locator("#id_extra_field")).to_have_attribute(
        "x-model", "extraFieldState"
    )


def test_form_row_hides_when_secret_typed(admin_page: Page, live_server):
    """Typing 'secret' hides the form row via Alpine x-show reactivity."""
    admin_page.goto(f"{live_server.url}/admin/test_app/parentmodel/add/")
    admin_page.wait_for_function("() => window.Alpine && window.Alpine.version")

    extra_field = admin_page.locator("#id_extra_field")
    form_row = admin_page.locator(
        ".form-row", has=admin_page.locator("#id_extra_field")
    )

    expect(form_row).to_be_visible()

    extra_field.fill("secret")
    expect(form_row).to_be_hidden()


def test_form_row_reappears_after_clearing_secret(admin_page: Page, live_server):
    """Clearing the 'secret' value restores form row visibility."""
    admin_page.goto(f"{live_server.url}/admin/test_app/parentmodel/add/")
    admin_page.wait_for_function("() => window.Alpine && window.Alpine.version")

    extra_field = admin_page.locator("#id_extra_field")
    form_row = admin_page.locator(
        ".form-row", has=admin_page.locator("#id_extra_field")
    )

    extra_field.fill("secret")
    expect(form_row).to_be_hidden()

    # Clear via JS because the element is now hidden (display:none)
    admin_page.evaluate(
        """
        const el = document.querySelector('#id_extra_field');
        el.value = '';
        el.dispatchEvent(new Event('input', { bubbles: true }));
        """
    )
    expect(form_row).to_be_visible()


def test_stacked_inline_extra_has_x_model(admin_page: Page, live_server):
    """Stacked inline stacked_extra input gets x-model set by admin.js."""
    admin_page.goto(f"{live_server.url}/admin/test_app/parentmodel/add/")
    admin_page.wait_for_function(
        "() => document.querySelector('form[x-data]') !== null"
    )
    stacked_extra = admin_page.locator("[id$='-stacked_extra']").first
    x_model = stacked_extra.get_attribute("x-model")
    assert x_model is not None, "stacked_extra should have x-model set"
    assert "stacked_extra" in x_model


def test_tabular_inline_extra_has_x_model(admin_page: Page, live_server):
    """Tabular inline tabular_extra checkbox gets x-model set by admin.js."""
    admin_page.goto(f"{live_server.url}/admin/test_app/parentmodel/add/")
    admin_page.wait_for_function(
        "() => document.querySelector('form[x-data]') !== null"
    )
    tabular_extra = admin_page.locator("[id$='-tabular_extra']").first
    x_model = tabular_extra.get_attribute("x-model")
    assert x_model is not None, "tabular_extra should have x-model set"
    assert "tabular_extra" in x_model


def test_inline_x_data_contains_inline_fields(admin_page: Page, live_server):
    """The form x-data contains keys for all inline extra fields."""
    admin_page.goto(f"{live_server.url}/admin/test_app/parentmodel/add/")
    admin_page.wait_for_function(
        "() => document.querySelector('form[x-data]') !== null"
    )
    x_data_str = admin_page.locator("form[x-data]").first.get_attribute("x-data")
    x_data = json.loads(x_data_str)

    # Check that at least one key contains the inline field names
    stacked_keys = [k for k in x_data if "stacked_extra" in k]
    tabular_keys = [k for k in x_data if "tabular_extra" in k]
    assert stacked_keys, f"x-data missing stacked_extra key, got: {x_data}"
    assert tabular_keys, f"x-data missing tabular_extra key, got: {x_data}"
