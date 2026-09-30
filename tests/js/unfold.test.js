import { beforeEach, describe, expect, it } from "vitest";

import "../../src/django_form_alpine/static/django_form_alpine/js/core.js";
import "../../src/django_form_alpine/static/django_form_alpine/js/contrib/unfold.js";

const r = () => window.djangoUnfoldAlpineResolvers;

describe("contrib/unfold.js", () => {
    beforeEach(() => {
        window.DjangoFormAlpine = {};
    });

    it("registers its resolvers unless custom ones are set", () => {
        window.prepareUnfoldAlpineBeforeLoad();
        expect(window.DjangoFormAlpine.resolvers["field-line"]).toBeUndefined();
        expect(window.DjangoFormAlpine.resolvers["form-row"]).toBe(
            r()["form-row"],
        );

        const mine = () => null;
        window.DjangoFormAlpine = { resolvers: { mine } };
        window.prepareUnfoldAlpineBeforeLoad();
        expect(window.DjangoFormAlpine.resolvers).toEqual({ mine });

        window.DjangoFormAlpine = {
            resolvers: { mine },
            useAdminResolvers: true,
        };
        window.prepareUnfoldAlpineBeforeLoad();
        expect(window.DjangoFormAlpine.resolvers.mine).toBe(mine);
        expect(window.DjangoFormAlpine.resolvers.form).toBe(r().form);
    });

    it("resolves Unfold's field containers", () => {
        document.body.innerHTML = `
            <form><fieldset class="module">
              <div class="form-row field-row">
                <div class="field-line">
                  <div><label for="id_name">Name</label></div>
                  <div class="grow relative">
                    <input id="id_name" name="name">
                    <div class="leading-relaxed mt-2 text-xs">Help</div>
                    <div class="mt-2"><ul class="errorlist"><li>Bad</li></ul></div>
                  </div>
                </div>
              </div>
            </fieldset></form>`;
        const input = document.getElementById("id_name");
        const line = document.querySelector(".field-line");

        expect(r().form(input).tagName).toBe("FORM");
        expect(r().fieldset(input).tagName).toBe("FIELDSET");
        expect(r()["form-row"](input)).toBe(
            document.querySelector(".form-row"),
        );
        expect(r()["form-multiline"](input)).toBe(
            document.querySelector(".form-row"),
        );
        expect(r()["field-box"](input)).toBe(line);
        expect(r()["field-container"](input)).toBe(line);
        expect(r().label(input).textContent).toBe("Name");
        expect(r().help(input).textContent).toBe("Help");
        expect(r().errorlist(input).tagName).toBe("UL");
        expect(r()["inline-container"](input)).toBeNull();
        expect(r()["nonfield-errorlist"](input)).toBeNull();
        expect(r().td(input)).toBeNull();
        expect(r()["option-label"](input)).toBeNull();
    });

    it("resolves Unfold's tabular inline rows", () => {
        document.body.innerHTML = `
            <table><tbody class="form-group original">
              <tr class="row-form-errors"><td>Row error</td></tr>
              <tr class="form-row"><td class="field-title"><label><input name="items-0-title"></label></td></tr>
            </tbody></table>`;
        const input = document.querySelector("input");

        expect(r()["inline-container"](input).tagName).toBe("TBODY");
        expect(r()["nonfield-errorlist"](input).className).toBe(
            "row-form-errors",
        );
        expect(r().td(input).className).toBe("field-title");
        expect(r()["field-box"](input)).toBe(r().td(input));
        expect(r()["option-label"](input).tagName).toBe("LABEL");
    });

    it("namespaces __row_prefix__ from the field name when the row has no id", () => {
        document.body.innerHTML = `
            <table><tbody class="form-group">
              <tr class="form-row"><td><input name="items-3-title" x-add-model-data="__row_prefix__title"></td></tr>
            </tbody></table>`;
        const form = document.createElement("form");
        form.append(document.querySelector("table"));
        document.body.append(form);
        window.processFormElements(document, r());

        expect(document.querySelector("input").getAttribute("x-model")).toBe(
            "items_3_title",
        );
    });

    it("resolves nothing outside a field line or cell", () => {
        document.body.innerHTML = `<form><input name="loose"></form>`;
        const input = document.querySelector("input");
        expect(r()["field-box"](input)).toBeNull();
        expect(r().label(input)).toBeNull();
        expect(r().errorlist(input)).toBeNull();
        expect(r().help(input)).toBeNull();
    });

    it("waits for alpine:init when loaded while the page is parsed", () => {
        document.body.innerHTML = `<form><input x-add-model-data="late"></form>`;
        window.DjangoFormAlpine = { resolvers: r() };
        const readyState = Object.getOwnPropertyDescriptor(
            Document.prototype,
            "readyState",
        );
        Object.defineProperty(document, "readyState", {
            configurable: true,
            get: () => "loading",
        });
        try {
            window.startDjangoFormAlpine();
        } finally {
            delete document.readyState;
            Object.defineProperty(Document.prototype, "readyState", readyState);
        }
        const input = document.querySelector("input");
        expect(input.getAttribute("x-model")).toBeNull();

        document.dispatchEvent(new CustomEvent("alpine:init"));
        expect(input.getAttribute("x-model")).toBe("late");
    });
});
