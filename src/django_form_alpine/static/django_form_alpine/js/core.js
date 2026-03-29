/**
 * Built-in resolvers always available regardless of which preset or custom
 * resolvers are configured. User-defined resolvers can override these keys.
 *  - self: returns the element itself, useful for applying directives directly
 *    to the input (e.g. in formsets where no surrounding container is needed).
 */
const builtinResolvers = {
  self: (el) => el,
};

/**
 * Queries all form inputs within a container and applies Alpine.js directives
 * to each one, skipping Django empty form template elements (__prefix__).
 * @param {Document|HTMLElement} container - The root to search for inputs.
 * @param {Object} resolvers - Map of prefix → resolver function.
 */
function processFormElements(container, resolvers) {
  const merged = { ...builtinResolvers, ...resolvers };
  container.querySelectorAll("input, select, textarea").forEach((el) => {
    if (el.name?.includes("__prefix__") || el.id?.includes("__prefix__")) {
      return;
    }

    addModelData(el);

    Object.entries(merged).forEach(([prefix, resolver]) => {
      applyPrefixedDirectivesToContainer(prefix, el, resolver(el));
    });
  });
}

/**
 * Processes all existing form inputs on the page and registers a listener for
 * dynamically added inline rows (Django Admin's "formset:added" event).
 * @param {Object} resolvers - Map of prefix → resolver function.
 */
function prepareAlpineBeforeLoad(resolvers) {
  processFormElements(document, resolvers);

  document.addEventListener("formset:added", (event) => {
    processFormElements(event.target, resolvers);
    if (window.Alpine) {
      window.Alpine.initTree(event.target);
    }
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
      const initialValue = getInitialValue(el);
      data[xModel] = initialValue;
      form.setAttribute("x-data", JSON.stringify(data));
      // If Alpine has already initialised this form, also update the live
      // reactive state so the new key is immediately available to x-model.
      if (form._x_dataStack?.[0] && !(xModel in form._x_dataStack[0])) {
        form._x_dataStack[0][xModel] = initialValue;
      }
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
 * Hyphens in the prefix are converted to underscores so the result is a
 * valid JavaScript identifier for Alpine.js (e.g. "items_0_field").
 * @param {HTMLElement} element - The element to resolve the prefix for.
 * @param {string} value - The string to process.
 * @returns {string} The processed string with all __row_prefix__ occurrences replaced.
 */
function handleInlinePrefix(element, value) {
  const inlinePrefix = "__row_prefix__";
  if (typeof value === "string" && value.includes(inlinePrefix)) {
    const prefixValue = getRowPrefix(element);
    if (prefixValue) {
      // Sanitize for Alpine.js: hyphens are invalid in JS identifiers, so
      // replace them with underscores to produce a valid variable name.
      const alpinePrefix = prefixValue.replaceAll("-", "_");
      return value.replaceAll(inlinePrefix, alpinePrefix + "_");
    }
    return value.replaceAll(inlinePrefix, "");
  }
  return value;
}

/**
 * Reads resolvers from window.DjangoFormAlpine and starts processing.
 * Called immediately (not on DOMContentLoaded) because defer scripts execute
 * after the DOM is fully parsed, in document order — so this runs before
 * alpine.js and the DOM is already ready.
 */
function initFromWindow() {
  const resolvers = window?.DjangoFormAlpine?.resolvers;
  if (resolvers) {
    prepareAlpineBeforeLoad(resolvers);
  } else {
    console.warn(
      "DjangoFormAlpine or its resolvers not found on window. Admin Alpine.js directives will not be processed.",
    );
  }
}

initFromWindow();
