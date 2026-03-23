import { describe, it, expect, beforeEach } from "vitest";
import fs from "fs";
import path from "path";

// Read the original file into memory to evaluate it (without modifying its source code)
const scriptPath = path.resolve(
  __dirname,
  "../src/django_admin_alpine/static/admin.js",
);
const scriptContent = fs.readFileSync(scriptPath, "utf-8");

describe("admin.js tests with Vitest", () => {
  beforeEach(() => {
    // Reset the DOM so tests have an isolated environment
    document.body.innerHTML = "";

    // Using eval in the window scope adds declared functions globally (simulating how the script loads in the browser)
    window.eval(scriptContent);
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
  });
});
