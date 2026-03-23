import { defineConfig } from "vitest/config";

const exposeToWindowPlugin = {
  name: "expose-to-window",
  transform(src, id) {
    if (id.endsWith("admin.js")) {
      // Agregamos código al final para exponer las funciones a window
      // Esto solo ocurre en el entorno de pruebas de vitest en memoria, sin tocar el archivo real
      const exportCode = `
        if (typeof window !== "undefined") {
          window.applyPrefixedDirectivesToContainer = applyPrefixedDirectivesToContainer;
          window.prepareAdminAlpineBeforeLoad = prepareAdminAlpineBeforeLoad;
          window.getInitialValue = getInitialValue;
        }
      `;
      return {
        code: src + exportCode,
        map: null,
      };
    }
  },
};

export default defineConfig({
  test: {
    environment: "jsdom",
    exclude: ["node_modules", "src/django_admin_alpine/static/alpine.js"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/django_admin_alpine/static/admin.js"],
    },
  },
  plugins: [exposeToWindowPlugin],
});
