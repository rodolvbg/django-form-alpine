/**
 * The django-unfold preset: the admin preset's resolvers for Unfold's markup.
 * Unfold has one ".field-line" per field (label, input, help and errors) in
 * each ".form-row", and each inline form is a ".form-group".
 */
const djangoUnfoldAlpineResolvers = {
    // Unfold has no multi-field container: a row with several fields.
    "form-multiline": (el) => el.closest(".form-row"),
    "form-row": (el) => el.closest(".form-row"),
    fieldset: (el) => el.closest("fieldset"),
    form: (el) => el.closest("form"),

    "inline-container": (el) => el.closest(".form-group"),

    "nonfield-errorlist": (el) =>
        el
            .closest(".form-group")
            ?.querySelector(".errorlist.nonfield, .row-form-errors") || null,

    label: (el) => unfoldFieldLine(el)?.querySelector("label") || null,
    "field-box": (el) => unfoldFieldLine(el),
    "field-container": (el) => unfoldFieldLine(el),
    errorlist: (el) => unfoldFieldLine(el)?.querySelector(".errorlist") || null,
    help: (el) =>
        unfoldFieldLine(el)?.querySelector(
            ".help, div.leading-relaxed.mt-2.text-xs",
        ) || null,

    "option-label": (el) => el.closest("label"),
    td: (el) => el.closest("td"),
};

/** The field's container: its ".field-line", or its cell in a tabular inline. */
function unfoldFieldLine(el) {
    return el.closest(".field-line") || el.closest("td") || null;
}

function prepareUnfoldAlpineBeforeLoad() {
    window.DjangoFormAlpine = window.DjangoFormAlpine || {};
    const windowDjangoFormAlpine = window.DjangoFormAlpine;
    if (
        !windowDjangoFormAlpine?.resolvers ||
        windowDjangoFormAlpine?.useAdminResolvers
    ) {
        windowDjangoFormAlpine.resolvers = {
            ...djangoUnfoldAlpineResolvers,
            ...(windowDjangoFormAlpine.resolvers || {}),
        };
    }
}

prepareUnfoldAlpineBeforeLoad();
