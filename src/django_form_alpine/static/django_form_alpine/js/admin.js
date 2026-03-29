const djangoAdminAlpineResolvers = {
  "form-multiline": (el) => el.closest(".form-multiline"),
  "form-row": (el) => el.closest(".form-row"),
  fieldset: (el) => el.closest("fieldset"),
  form: (el) => el.closest("form"),

  "inline-container": (el) =>
    el.closest("tr.form-row") || el.closest(".inline-related"),

  "nonfield-errorlist": (el) => {
    const tableRow = el.closest("tr.form-row");
    if (tableRow) {
      const prev = tableRow.previousElementSibling;
      return prev?.matches(".row-form-errors")
        ? prev.querySelector(".errorlist.nonfield")
        : null;
    }

    const inlineRelated = el.closest(".inline-related");
    return inlineRelated?.querySelector(".errorlist.nonfield") || null;
  },

  label: (el) => getLabel(el),
  "field-box": (el) => getFieldBox(el),
  "field-container": (el) => getFieldContainer(el),
  errorlist: (el) => getFieldContainer(el)?.querySelector(".errorlist") || null,
  help: (el) => getFieldContainer(el)?.querySelector(".help") || null,

  "option-label": (el) => el.closest("label"),
  td: (el) => el.closest("td"),
};
function prepareAdminAlpineBeforeLoad() {
  window.DjangoFormAlpine = window.DjangoFormAlpine || {};
  let windowDjangoFormAlpine = window.DjangoFormAlpine;
  if (
    !windowDjangoFormAlpine?.resolvers ||
    windowDjangoFormAlpine?.useAdminResolvers
  ) {
    const result = { ...djangoAdminAlpineResolvers };
    windowDjangoFormAlpine.resolvers = {
      ...result,
      ...(windowDjangoFormAlpine.resolvers || {}),
    };
  }
}

function getLabel(el) {
  return (
    el.closest(".flex-container")?.querySelector("label") ||
    el.closest(".form-row")?.querySelector("label") ||
    null
  );
}

function getFieldBox(el) {
  return (
    el.closest(".field-box") || getLabel(el)?.parentElement || el.parentElement
  );
}

function getFieldContainer(el) {
  return getFieldBox(el)?.parentElement || null;
}

// Run immediately — defer scripts execute in document order after full HTML
// parse, so admin.js always runs before core.js and alpine.js.
prepareAdminAlpineBeforeLoad();
