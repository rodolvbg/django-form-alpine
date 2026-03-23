document.addEventListener("DOMContentLoaded", () => {
  prepareAdminAlpineBeforeLoad();
});

/**
 * Extracts prefixed attributes from an element and applies them as Alpine.js directives to a container.
 * @param {string} prefix - The prefix of the attributes to look for on the element.
 * @param {HTMLElement} element - The source element containing the prefixed attributes.
 * @param {HTMLElement|null} container - The target container element to apply the directives to.
 */
function applyPrefixedDirectivesToContainer(prefix, element, container) {
  const fieldContainerAttrs = element
    .getAttributeNames()
    .filter((name) => name.startsWith(prefix));
  if (!fieldContainerAttrs.length) return;
  if (!container) return;
  fieldContainerAttrs.forEach((name) => {
    const value = element.getAttribute(name) || "true";
    const directive = name.replace(prefix, "").trim();
    if (!directive) return;
    container.setAttribute(`x-${directive}`, value);
  });
}

/**
 * Automatically sets up Alpine.js bindings on form inputs before the page loads.
 * It assigns 'x-model' based on the 'name' attribute or 'x-add-name-as-model',
 * updates the form's 'x-data' with initial values, and applies container directives.
 */
function prepareAdminAlpineBeforeLoad() {
  document.querySelectorAll("input, select, textarea").forEach((el) => {
    const addNameAsModel = el.hasAttribute("x-add-name-as-model");
    const xModel = el.getAttribute("x-model");

    if (addNameAsModel && xModel) {
      console.warn(
        `Element with name "${el.getAttribute(
          "name",
        )}" has both "x-add-name-as-model" and "x-model" attributes. "x-add-name-as-model" will be ignored.`,
      );
    }

    if (addNameAsModel || xModel) {
      const name = xModel || el.getAttribute("name");
      const form = el.closest("form") || el.closest("form");
      const data = JSON.parse(form.getAttribute("x-data") || "{}");
      if (!(name in data)) {
        data[name] = getInitialValue(el);
        form.setAttribute("x-data", JSON.stringify(data));
      }
      el.setAttribute("x-model", name);
    }

    applyPrefixedDirectivesToContainer(
      "x-field-container-",
      el,
      el.closest(".flex-container")?.parentElement || el.parentElement,
    );
    applyPrefixedDirectivesToContainer(
      "x-form-row-",
      el,
      el.closest(".form-row"),
    );
  });
}

/**
 * Retrieves the initial value for a given form element based on its type.
 * @param {HTMLElement} el - The form input element (checkbox, radio, text, etc.).
 * @returns {string|boolean} The initial value of the element.
 */
function getInitialValue(el) {
  if (el.type === "checkbox") {
    return el.checked;
  }

  if (el.type === "radio") {
    return el.checked ? el.value : "";
  }

  return el.value ?? "";
}
