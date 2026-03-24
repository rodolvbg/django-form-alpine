document.addEventListener("DOMContentLoaded", () => {
  prepareAdminAlpineBeforeLoad();
});

function prepareAdminAlpineBeforeLoad() {
  document.querySelectorAll("input, select, textarea").forEach((el) => {
    addModelData(el);

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

function addModelData(el) {
  const xModel = el.getAttribute("x-add-model-data");
  const xModelExisting = el.getAttribute("x-model");

  if (xModel) {
    const form = el.closest("form");
    if (!form) return;
    const data = JSON.parse(form.getAttribute("x-data") || "{}");
    if (!(xModel in data)) {
      data[xModel] = getInitialValue(el);
      form.setAttribute("x-data", JSON.stringify(data));
    }
    if (xModelExisting) {
      console.warn(
        `Element ${el.name} has both "x-add-model-data" and "x-model" attributes. "x-add-model-data" will be ignored.`,
      );
    } else {
      el.setAttribute("x-model", xModel);
    }
  }
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
