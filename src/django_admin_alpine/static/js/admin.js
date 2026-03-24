document.addEventListener("DOMContentLoaded", () => {
  prepareAdminAlpineBeforeLoad();
});

/**
 * Scans the document for inputs and prepares them for Alpine.js before loading.
 * It identifies elements requiring state synchronization and applies prefixed directives to their containers.
 */
function prepareAdminAlpineBeforeLoad() {
  document.querySelectorAll("input, select, textarea").forEach((el) => {
    addModelData(el);

    function applyPrefixedDirectives(prefix, container) {
      applyPrefixedDirectivesToContainer(prefix, el, container);
    }

    // fieldset elements
    const multiLine = el.closest(".form-multiline");
    applyPrefixedDirectives("form-multiline", multiLine);
    const formRow = el.closest(".form-row");
    applyPrefixedDirectives("form-row", formRow);
    const fieldset = el.closest("fieldset");
    applyPrefixedDirectives("fieldset", fieldset);
    const form = el.closest("form");
    applyPrefixedDirectives("form", form);

    // inline elements
    let inlineRelated = el.closest(".inline-related");
    let tableRow = el.closest("tr.form-row");
    if (inlineRelated || tableRow) {
      let inlineContainer;

      let nonFieldErrors;
      if (inlineRelated) {
        inlineContainer = inlineRelated;
        nonFieldErrors = inlineRelated?.querySelector(".errorlist.nonfield");
      } else if (tableRow) {
        inlineContainer = tableRow;
        const prev = tableRow.previousElementSibling;
        nonFieldErrors = prev?.querySelector(".errorlist.nonfield");
      }
      applyPrefixedDirectives("inline-container", inlineContainer);
      applyPrefixedDirectives("nonfield-errorlist", nonFieldErrors);
    }

    // field elements
    const label = formRow
      ? formRow.querySelector(`label[for="${el.id}"]`)
      : null;
    applyPrefixedDirectives("label", label);
    const fieldBox =
      el.closest(".field-box") || label?.parentElement || el.parentElement;
    applyPrefixedDirectives("field-box", fieldBox);
    const fieldContainer = fieldBox ? fieldBox.parentElement : null;
    applyPrefixedDirectives("field-container", fieldContainer);
    const errorList = fieldContainer?.querySelector(".errorlist");
    applyPrefixedDirectives("errorlist", errorList);
    const help = fieldContainer?.querySelector(".help");
    applyPrefixedDirectives("help", help);
  });
}

/**
 * Extracts prefixed attributes from an element and applies them as Alpine.js directives to a container.
 * @param {string} prefix - The prefix of the attributes to look for on the element.
 * @param {HTMLElement} element - The source element containing the prefixed attributes.
 * @param {HTMLElement|null} container - The target container element to apply the directives to.
 */
function applyPrefixedDirectivesToContainer(prefix, element, container) {
  if (!container) return;
  const prefixes = ["x-", "@"];

  element.getAttributeNames().forEach((name) => {
    for (const p of prefixes) {
      const fullPrefix = `${p}${prefix}-`;
      if (name.startsWith(fullPrefix)) {
        const directive = name.slice(fullPrefix.length).trim();
        if (!directive) continue;

        let value = element.getAttribute(name) || "true";
        value = handleInlinePrefix(element, value);

        container.setAttribute(
          `${p}${directive}`,
          value === "true" ? "" : value,
        );
        break;
      }
    }
  });
}

/**
 * Checks for "x-add-model-data" attribute on an element and synchronizes it with the form's Alpine.js state.
 * If found, it initializes the model's value in the form's "x-data" if it doesn't already exist.
 * @param {HTMLElement} el - The form input element to process.
 */
function addModelData(el) {
  let xModel = el.getAttribute("x-add-model-data");
  const xModelExisting = el.getAttribute("x-model");

  if (xModel) {
    xModel = handleInlinePrefix(el, xModel);
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

/**
 * Processes a string to replace the special placeholder __inline_prefix__
 * with the ID of the closest .inline-related container.
 * @param {HTMLElement} element - The element to find the prefix for.
 * @param {string} value - The string to process.
 * @returns {string} The processed string with replacements made.
 */
function handleInlinePrefix(element, value) {
  if (typeof value === "string" && value.includes("__inline_prefix__")) {
    const prefixValue = element.closest(".inline-related")?.id || "";
    return value.replaceAll("__inline_prefix__", prefixValue);
  }
  return value;
}
