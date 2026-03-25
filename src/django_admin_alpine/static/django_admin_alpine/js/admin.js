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
    let tableRow = el.closest("tr.form-row");
    let inlineRelated = el.closest(".inline-related");
    if (inlineRelated || tableRow) {
      let inlineContainer;
      let nonFieldErrors = null;
      if (tableRow) {
        inlineContainer = tableRow;
        const prev = tableRow.previousElementSibling;
        nonFieldErrors = prev?.matches(".row-form-errors")
          ? prev.querySelector(".errorlist.nonfield")
          : null;
      } else if (inlineRelated) {
        inlineContainer = inlineRelated;
        nonFieldErrors = inlineRelated?.querySelector(".errorlist.nonfield");
      }
      applyPrefixedDirectives("inline-container", inlineContainer);
      applyPrefixedDirectives("nonfield-errorlist", nonFieldErrors);
    }

    // field elements
    const label =
      el?.closest(".flex-container")?.querySelector("label") ||
      el?.closest(".form-row")?.querySelector("label");
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

    // option elements
    applyPrefixedDirectives("option-label", el.closest("label"));
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
 * Returns the Alpine.js-safe prefix derived from the closest inline container's ID.
 * Dashes in the container ID are replaced with underscores so the result is a valid JS identifier.
 * @param {HTMLElement} element - The element to search from.
 * @returns {string} The sanitized prefix string, or an empty string if no container is found.
 */
function getRowPrefix(element) {
  const container =
    element.closest("tr.form-row") || element.closest(".inline-related");
  return (container?.id || "").replaceAll("-", "_");
}

/**
 * Processes a string to replace the special placeholder __row_prefix__
 * with the ID of the closest .inline-related container.
 * @param {HTMLElement} element - The element to find the prefix for.
 * @param {string} value - The string to process.
 * @returns {string} The processed string with replacements made.
 */
function handleInlinePrefix(element, value) {
  const inlinePrefix = "__row_prefix__";
  if (typeof value === "string" && value.includes(inlinePrefix)) {
    const prefixValue = getRowPrefix(element);
    if (prefixValue && !value.startsWith(inlinePrefix + "_")) {
      return value.replaceAll(inlinePrefix, prefixValue + "_");
    }
    return value.replaceAll(inlinePrefix, prefixValue);
  }
  return value;
}
