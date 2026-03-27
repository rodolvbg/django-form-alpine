document.addEventListener("DOMContentLoaded", () => {
  const resolvers = window?.DjangoFormAlpine?.resolvers;
  if (resolvers) {
    prepareAlpineBeforeLoad(resolvers);
  } else {
    console.warn(
      "DjangoFormAlpine or its resolvers not found on window. Admin Alpine.js directives will not be processed.",
    );
  }
});

function prepareAlpineBeforeLoad(resolvers) {
  document.querySelectorAll("input, select, textarea").forEach((el) => {
    addModelData(el);

    Object.entries(resolvers).forEach(([prefix, resolver]) => {
      applyPrefixedDirectivesToContainer(prefix, el, resolver(el));
    });
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
 * Returns the row prefix used to namespace Alpine.js state keys for inline forms.
 * Resolution order:
 *  1. Closest "tr.form-row" or ".inline-related" container — its ID as-is
 *     (e.g. "items-0"), matching Django's own inline field naming convention.
 *  2. element.name parsed with the pattern /prefix-number/ — returned as-is
 *     (e.g. "items-0").
 *  3. Empty string if neither source yields a match.
 * @param {HTMLElement} element - The element to resolve the prefix for.
 * @returns {string} The row prefix string, or "" if none can be determined.
 */
function getRowPrefix(element) {
  const container =
    element.closest("tr.form-row") || element.closest(".inline-related");
  if (container) {
    return container?.id || "";
  }
  const regex = /^([a-zA-Z0-9_-]+)-(\d+)$/;
  const match = element?.name?.match(regex);

  if (match) {
    return `${match[1]}-${match[2]}`;
  }
  return "";
}

/**
 * Processes a string to replace the special placeholder __row_prefix__
 * with the prefix returned by getRowPrefix for the given element.
 * A trailing dash separator is appended when the prefix is non-empty,
 * so "__row_prefix__field" becomes e.g. "items-0-field" (Django's inline
 * field naming convention: <prefix>-<number>-<field>).
 * @param {HTMLElement} element - The element to resolve the prefix for.
 * @param {string} value - The string to process.
 * @returns {string} The processed string with all __row_prefix__ occurrences replaced.
 */
function handleInlinePrefix(element, value) {
  const inlinePrefix = "__row_prefix__";
  if (typeof value === "string" && value.includes(inlinePrefix)) {
    const prefixValue = getRowPrefix(element);
    if (prefixValue) {
      return value.replaceAll(inlinePrefix, prefixValue + "-");
    }
    return value.replaceAll(inlinePrefix, "");
  }
  return value;
}
