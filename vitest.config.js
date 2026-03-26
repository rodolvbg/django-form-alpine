import { defineConfig } from "vitest/config";

const exposeToWindowPlugin = {
  name: "expose-to-window",
  transform(src, id) {
    if (id.endsWith("core.js")) {
      const exportCode = `
        if (typeof window !== "undefined") {
          window.applyPrefixedDirectivesToContainer = applyPrefixedDirectivesToContainer;
          window.prepareAlpineBeforeLoad = prepareAlpineBeforeLoad;
          window.getInitialValue = getInitialValue;
        }
      `;
      return { code: src + exportCode, map: null };
    }
    if (id.endsWith("admin.js")) {
      const exportCode = `
        if (typeof window !== "undefined") {
          window.djangoAdminAlpineResolvers = djangoAdminAlpineResolvers;
        }
      `;
      return { code: src + exportCode, map: null };
    }
  },
};

export default defineConfig({
  test: {
    environment: "jsdom",
    exclude: [
      "node_modules",
      "src/django_admin_alpine/static/django_admin_alpine/js/alpine.js",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "src/django_admin_alpine/static/django_admin_alpine/js/core.js",
        "src/django_admin_alpine/static/django_admin_alpine/js/admin.js",
      ],
    },
  },
  plugins: [exposeToWindowPlugin],
});
