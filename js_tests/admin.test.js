import { describe, it, expect, beforeEach, vi } from "vitest";

// Al instanciar esta importación en un archivo Jsdom, Vitest lo compila
// y pasa por el plugin exposeToWindowPlugin definido en vitest.config.js
import "../src/django_admin_alpine/static/admin.js";

describe("admin.js tests with Vitest", () => {
  beforeEach(() => {
    // Restauramos el DOM base. window ya contiene las funciones reusables
    // exportadas por Vite gracias al plugin de vitest.config.js
    document.body.innerHTML = "";
  });

  describe("DOMContentLoaded initialization", () => {
    it("should execute prepareAdminAlpineBeforeLoad automatically", () => {
      const form = document.createElement("form");
      const input = document.createElement("input");
      input.name = "dom_loaded_test";
      input.setAttribute("x-add-name-as-model", "true");
      form.appendChild(input);
      document.body.appendChild(form);

      // Disparar el evento que 'admin.js' está escuchando al momento del import
      const event = document.createEvent("Event");
      event.initEvent("DOMContentLoaded", true, true);
      document.dispatchEvent(event);

      // Verificamos que se ejecutó correctamente viendo un efecto secundario (x-model se agregó)
      expect(input.getAttribute("x-model")).toBe("dom_loaded_test");
    });
  });

  describe("getInitialValue", () => {
    it("should return a boolean for checkboxes", () => {
      const el = document.createElement("input");
      el.type = "checkbox";
      el.checked = true;
      expect(window.getInitialValue(el)).toBe(true);

      el.checked = false;
      expect(window.getInitialValue(el)).toBe(false);
    });

    it("should return the value or an empty string for radios", () => {
      const el = document.createElement("input");
      el.type = "radio";
      el.value = "yes";
      el.checked = true;
      expect(window.getInitialValue(el)).toBe("yes");

      el.checked = false;
      expect(window.getInitialValue(el)).toBe("");
    });

    it("should return the expected value for other inputs", () => {
      const el = document.createElement("input");
      el.type = "text";
      el.value = "hello";
      expect(window.getInitialValue(el)).toBe("hello");
    });

    it("should return empty string if value is nullish", () => {
      // Mocked custom element without the .value property to hit `el.value ?? ""` fallback branch
      const mockEl = { type: "text" };
      expect(window.getInitialValue(mockEl)).toBe("");
    });
  });

  describe("applyPrefixedDirectivesToContainer", () => {
    it("should apply the attributes to the final container", () => {
      const el = document.createElement("input");
      el.setAttribute("x-field-container-show", "true");
      el.setAttribute("x-field-container-transition", "fade");

      const container = document.createElement("div");

      window.applyPrefixedDirectivesToContainer(
        "x-field-container-",
        el,
        container,
      );

      expect(container.getAttribute("x-show")).toBe("true");
      expect(container.getAttribute("x-transition")).toBe("fade");
    });

    it("should do nothing if no attribute matches", () => {
      const el = document.createElement("input");
      el.setAttribute("id", "my-id");

      const container = document.createElement("div");
      window.applyPrefixedDirectivesToContainer(
        "x-field-container-",
        el,
        container,
      );

      expect(container.attributes.length).toBe(0);
    });

    it("should handle null container gracefully", () => {
      const el = document.createElement("input");
      el.setAttribute("x-field-container-show", "true");

      expect(() => {
        window.applyPrefixedDirectivesToContainer(
          "x-field-container-",
          el,
          null,
        );
      }).not.toThrow();
    });

    it("should ignore empty directives (prefix exact match)", () => {
      const el = document.createElement("input");
      el.setAttribute("x-field-container-", "true");
      const container = document.createElement("div");

      window.applyPrefixedDirectivesToContainer(
        "x-field-container-",
        el,
        container,
      );

      expect(container.attributes.length).toBe(0);
    });

    it("should use 'true' as default value if attribute value is empty", () => {
      const el = document.createElement("input");
      el.setAttribute("x-field-container-disabled", "");
      const container = document.createElement("div");

      window.applyPrefixedDirectivesToContainer(
        "x-field-container-",
        el,
        container,
      );

      expect(container.getAttribute("x-disabled")).toBe("true");
    });
  });

  describe("prepareAdminAlpineBeforeLoad", () => {
    it("should initialize x-model and update x-data in the form", () => {
      const form = document.createElement("form");
      form.setAttribute("x-data", JSON.stringify({ existing_data: "123" }));

      const wrapper = document.createElement("div");
      wrapper.classList.add("form-row");

      const flexContainer = document.createElement("div");
      flexContainer.classList.add("flex-container");

      const input = document.createElement("input");
      input.type = "text";
      input.name = "my_field";
      input.value = "my_val";
      input.setAttribute("x-add-name-as-model", "true");
      input.setAttribute("x-field-container-show", "true");

      flexContainer.appendChild(input);
      wrapper.appendChild(flexContainer);
      form.appendChild(wrapper);
      document.body.appendChild(form);

      window.prepareAdminAlpineBeforeLoad();

      expect(input.getAttribute("x-model")).toBe("my_field");

      expect(wrapper.getAttribute("x-show")).toBe("true");

      const updatedData = JSON.parse(form.getAttribute("x-data"));
      expect(updatedData.my_field).toBe("my_val");
      expect(updatedData.existing_data).toBe("123");
    });

    it("should warn if both x-add-name-as-model and x-model are present", () => {
      const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const form = document.createElement("form");
      const input = document.createElement("input");
      input.name = "test_warn";
      input.setAttribute("x-add-name-as-model", "true");
      input.setAttribute("x-model", "test_warn_model");
      form.appendChild(input);
      document.body.appendChild(form);

      window.prepareAdminAlpineBeforeLoad();

      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining('has both "x-add-name-as-model" and "x-model"'),
      );
      expect(input.getAttribute("x-model")).toBe("test_warn_model");
      spy.mockRestore();
    });

    it("should not overwrite existing x-data keys", () => {
      const form = document.createElement("form");
      form.setAttribute("x-data", JSON.stringify({ kept_field: "old-value" }));

      const input = document.createElement("input");
      input.type = "text";
      input.name = "kept_field";
      input.value = "new-value"; // Should be ignored because kept_field exists
      input.setAttribute("x-add-name-as-model", "true");

      form.appendChild(input);
      document.body.appendChild(form);

      window.prepareAdminAlpineBeforeLoad();

      const updatedData = JSON.parse(form.getAttribute("x-data"));
      expect(updatedData.kept_field).toBe("old-value");
      expect(updatedData.kept_field).not.toBe("new-value");
    });

    it("should gracefully handle form inputs without wrapper elements (closest flex-container fallback to parentElement)", () => {
      const form = document.createElement("form");
      const input = document.createElement("input");
      input.type = "text";
      input.setAttribute("x-field-container-show", "true");

      form.appendChild(input);
      document.body.appendChild(form);

      window.prepareAdminAlpineBeforeLoad();

      expect(form.getAttribute("x-show")).toBe("true");
    });

    it("should return early and not throw if input is completely outside a form", () => {
      const input = document.createElement("input");
      input.type = "text";
      input.setAttribute("x-add-name-as-model", "true");

      // input not wraped in a form appended directly to body
      document.body.appendChild(input);

      expect(() => {
        window.prepareAdminAlpineBeforeLoad();
      }).not.toThrow();
    });
  });
});
