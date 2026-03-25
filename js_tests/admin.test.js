import { describe, it, expect, beforeEach, vi } from "vitest";

// Al instanciar esta importación en un archivo Jsdom, Vitest lo compila
// y pasa por el plugin exposeToWindowPlugin definido en vitest.config.js
import "../src/django_admin_alpine/static/django_admin_alpine/js/admin.js";

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
      input.setAttribute("x-add-model-data", "dom_loaded_test");
      form.appendChild(input);
      document.body.appendChild(form);

      const event = document.createEvent("Event");
      event.initEvent("DOMContentLoaded", true, true);
      document.dispatchEvent(event);

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
        "field-container",
        el,
        container,
      );

      expect(container.getAttribute("x-show")).toBe("");
      expect(container.getAttribute("x-transition")).toBe("fade");
    });

    it("should do nothing if no attribute matches", () => {
      const el = document.createElement("input");
      el.setAttribute("id", "my-id");

      const container = document.createElement("div");
      window.applyPrefixedDirectivesToContainer(
        "field-container",
        el,
        container,
      );

      expect(container.attributes.length).toBe(0);
    });

    it("should handle null container gracefully", () => {
      const el = document.createElement("input");
      el.setAttribute("x-field-container-show", "true");

      expect(() => {
        window.applyPrefixedDirectivesToContainer("field-container", el, null);
      }).not.toThrow();
    });

    it("should ignore empty directives (prefix exact match)", () => {
      const el = document.createElement("input");
      el.setAttribute("x-field-container-", "true");
      const container = document.createElement("div");

      window.applyPrefixedDirectivesToContainer(
        "field-container",
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
        "field-container",
        el,
        container,
      );

      expect(container.getAttribute("x-disabled")).toBe("");
    });
  });

  describe("applyPrefixedDirectivesToContainer with @ prefix", () => {
    it("should apply the @ attributes to the final container", () => {
      // Use mocks to avoid JSDOM setAttribute strictness with "@"
      const elMock = {
        getAttributeNames: () => ["@field-container-click"],
        getAttribute: (name) =>
          name === "@field-container-click" ? "alert('hi')" : null,
      };

      const setAttributeSpy = vi.fn();
      const containerMock = {
        setAttribute: setAttributeSpy,
      };

      window.applyPrefixedDirectivesToContainer(
        "field-container",
        elMock,
        containerMock,
      );

      expect(setAttributeSpy).toHaveBeenCalledWith("@click", "alert('hi')");
    });
  });

  describe("applyPrefixedDirectivesToContainer with __row_prefix__", () => {
    it("should use element.name to derive the prefix when no container is found", () => {
      const el = document.createElement("input");
      el.name = "items-0";
      el.setAttribute("x-field-container-model", "__row_prefix__field");

      const container = document.createElement("div");
      window.applyPrefixedDirectivesToContainer(
        "field-container",
        el,
        container,
      );

      // Fallback: name "items-0" matches /prefix-number/, returned as-is → "items-0_field"
      expect(container.getAttribute("x-model")).toBe("items-0_field");
    });

    it("should replace __row_prefix__ with empty string if no .inline-related container is found", () => {
      const el = document.createElement("input");
      el.setAttribute("x-field-container-model", "__row_prefix__field");

      const container = document.createElement("div");
      window.applyPrefixedDirectivesToContainer(
        "field-container",
        el,
        container,
      );

      expect(container.getAttribute("x-model")).toBe("field");
    });

    it("should replace __row_prefix__ with the ID of the closest .inline-related container", () => {
      const wrapper = document.createElement("div");
      wrapper.classList.add("inline-related");
      wrapper.id = "items-0";

      const el = document.createElement("input");
      el.setAttribute("x-field-container-model", "__row_prefix__otherField");
      wrapper.appendChild(el);

      const container = document.createElement("div");
      window.applyPrefixedDirectivesToContainer(
        "field-container",
        el,
        container,
      );

      expect(container.getAttribute("x-model")).toBe("items_0_otherField");
    });

    it("should replace multiple occurrences of __row_prefix__ using the container ID", () => {
      const wrapper = document.createElement("div");
      wrapper.classList.add("inline-related");
      wrapper.id = "form-2";

      const el = document.createElement("input");
      el.setAttribute(
        "x-field-container-show",
        "__row_prefix__field1 && __row_prefix__field2 !== ''",
      );
      wrapper.appendChild(el);

      const container = document.createElement("div");
      window.applyPrefixedDirectivesToContainer(
        "field-container",
        el,
        container,
      );

      expect(container.getAttribute("x-show")).toBe(
        "form_2_field1 && form_2_field2 !== ''",
      );
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
      input.value = "my_val";
      input.setAttribute("x-add-model-data", "my_field");
      input.setAttribute("x-field-container-show", "true");

      flexContainer.appendChild(input);
      wrapper.appendChild(flexContainer);
      form.appendChild(wrapper);
      document.body.appendChild(form);

      window.prepareAdminAlpineBeforeLoad();

      expect(input.getAttribute("x-model")).toBe("my_field");

      expect(wrapper.getAttribute("x-show")).toBe("");
      expect(form.getAttribute("x-show")).toBe(null); // Should not be on form anymore with this structure

      const updatedData = JSON.parse(form.getAttribute("x-data"));
      expect(updatedData.my_field).toBe("my_val");
      expect(updatedData.existing_data).toBe("123");
    });

    it("should warn if both x-add-model-data and x-model are present", () => {
      const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const form = document.createElement("form");
      const input = document.createElement("input");
      input.name = "test_warn";
      input.setAttribute("x-add-model-data", "true");
      input.setAttribute("x-model", "test_warn_model");
      form.appendChild(input);
      document.body.appendChild(form);

      window.prepareAdminAlpineBeforeLoad();

      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining('has both "x-add-model-data" and "x-model"'),
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
      input.setAttribute("x-add-model-data", "kept_field");

      form.appendChild(input);
      document.body.appendChild(form);

      window.prepareAdminAlpineBeforeLoad();

      const updatedData = JSON.parse(form.getAttribute("x-data"));
      expect(updatedData.kept_field).toBe("old-value");
      expect(updatedData.kept_field).not.toBe("new-value");
    });

    it("should use .field-box as fieldBox if present", () => {
      const fieldBox = document.createElement("div");
      fieldBox.classList.add("field-box");
      const input = document.createElement("input");
      input.setAttribute("x-field-box-show", "true");
      fieldBox.appendChild(input);
      document.body.appendChild(fieldBox);

      window.prepareAdminAlpineBeforeLoad();
      expect(fieldBox.getAttribute("x-show")).toBe("");
    });

    it("should use label.parentElement as fieldBox if .field-box is missing", () => {
      const formRow = document.createElement("div");
      formRow.classList.add("form-row");
      const fieldBoxSubstitute = document.createElement("div");
      const label = document.createElement("label");
      label.setAttribute("for", "my_id");

      const input = document.createElement("input");
      input.id = "my_id";
      input.setAttribute("x-field-box-show", "true");

      fieldBoxSubstitute.appendChild(input);
      formRow.appendChild(fieldBoxSubstitute);
      document.body.appendChild(formRow);

      window.prepareAdminAlpineBeforeLoad();

      expect(fieldBoxSubstitute.getAttribute("x-show")).toBe("");
    });

    it("should find label inside .form-row", () => {
      const formRow = document.createElement("div");
      formRow.classList.add("form-row");

      const label = document.createElement("label");
      label.setAttribute("for", "id_field");

      const input = document.createElement("input");
      input.id = "id_field";
      input.setAttribute("x-label-show", "true");

      formRow.appendChild(label);
      formRow.appendChild(input);
      document.body.appendChild(formRow);

      window.prepareAdminAlpineBeforeLoad();

      expect(label.getAttribute("x-show")).toBe("");
    });

    it("should handle stacked inlines (.inline-related)", () => {
      const inlineRelated = document.createElement("div");
      inlineRelated.classList.add("inline-related");

      const nonfieldErrors = document.createElement("div");
      nonfieldErrors.classList.add("errorlist", "nonfield");
      inlineRelated.appendChild(nonfieldErrors);

      const input = document.createElement("input");
      input.setAttribute("x-inline-container-show", "true");
      input.setAttribute("x-nonfield-errorlist-show", "true");
      inlineRelated.appendChild(input);
      document.body.appendChild(inlineRelated);

      window.prepareAdminAlpineBeforeLoad();

      expect(inlineRelated.getAttribute("x-show")).toBe("");
      expect(nonfieldErrors.getAttribute("x-show")).toBe("");
    });

    it("should handle tabular inlines (tr.form-row)", () => {
      const table = document.createElement("table");
      const tbody = document.createElement("tbody");

      const headerRow = document.createElement("tr");
      headerRow.classList.add("row-form-errors");
      const errorCell = document.createElement("td");
      const nonfieldErrors = document.createElement("div");
      nonfieldErrors.classList.add("errorlist", "nonfield");
      errorCell.appendChild(nonfieldErrors);
      headerRow.appendChild(errorCell);

      const tableRow = document.createElement("tr");
      tableRow.classList.add("form-row");

      const inputCell = document.createElement("td");
      const input = document.createElement("input");
      input.setAttribute("x-inline-container-show", "true");
      input.setAttribute("x-nonfield-errorlist-show", "true");
      inputCell.appendChild(input);
      tableRow.appendChild(inputCell);

      tbody.appendChild(headerRow);
      tbody.appendChild(tableRow);
      table.appendChild(tbody);
      document.body.appendChild(table);

      window.prepareAdminAlpineBeforeLoad();

      expect(tableRow.getAttribute("x-show")).toBe("");
      expect(nonfieldErrors.getAttribute("x-show")).toBe("");
    });

    it("should handle tabular inlines (tr.form-row) without row-form-errors sibling (coverage for line 38 null branch)", () => {
      const table = document.createElement("table");
      const tbody = document.createElement("tbody");

      const tableRow = document.createElement("tr");
      tableRow.classList.add("form-row");

      const inputCell = document.createElement("td");
      const input = document.createElement("input");
      input.setAttribute("x-inline-container-show", "true");
      inputCell.appendChild(input);
      tableRow.appendChild(inputCell);

      tbody.appendChild(tableRow); // No previous sibling
      table.appendChild(tbody);
      document.body.appendChild(table);

      window.prepareAdminAlpineBeforeLoad();

      expect(tableRow.getAttribute("x-show")).toBe("");
    });

    it("should gracefully handle form inputs without wrapper elements (field-box matches parenElement)", () => {
      const form = document.createElement("form");
      const input = document.createElement("input");
      input.type = "text";
      input.setAttribute("x-field-box-show", "true");

      form.appendChild(input);
      document.body.appendChild(form);

      window.prepareAdminAlpineBeforeLoad();

      expect(form.getAttribute("x-show")).toBe("");
    });

    it("should return early and not throw if input is completely outside a form", () => {
      const input = document.createElement("input");
      input.type = "text";
      input.setAttribute("x-add-model-data", "true");

      // input not wraped in a form appended directly to body
      document.body.appendChild(input);

      expect(() => {
        window.prepareAdminAlpineBeforeLoad();
      }).not.toThrow();
    });

    it("should replace __row_prefix__ in x-add-model-data correctly", () => {
      const form = document.createElement("form");
      const wrapper = document.createElement("div");
      wrapper.classList.add("inline-related");
      wrapper.id = "items-1";

      const input = document.createElement("input");
      input.type = "text";
      input.id = "id_items-1-myfield";
      input.value = "hello";
      input.setAttribute("x-add-model-data", "__row_prefix__myfield");

      wrapper.appendChild(input);
      form.appendChild(wrapper);
      document.body.appendChild(form);

      window.prepareAdminAlpineBeforeLoad();

      const data = JSON.parse(form.getAttribute("x-data"));
      expect(data["items_1_myfield"]).toBe("hello");
      expect(input.getAttribute("x-model")).toBe("items_1_myfield");
    });

    it("should handle elements without parents gracefully (coverage for line 35 null branch)", () => {
      const input = document.createElement("input");
      // Manually mock querySelectorAll to return our orphaned input
      const spy = vi
        .spyOn(document, "querySelectorAll")
        .mockReturnValue([input]);

      expect(() => window.prepareAdminAlpineBeforeLoad()).not.toThrow();

      spy.mockRestore();
    });
  });
});
