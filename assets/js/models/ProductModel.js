import { normalizeText } from "../utils/formatters.js";

export class ProductModel {
  #products = [];

  async load() {
    const response = await fetch("./data/products.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`No se pudo cargar el catálogo (${response.status}).`);
    }

    const data = await response.json();

    if (!Array.isArray(data.products)) {
      throw new Error("El archivo products.json no tiene una lista de productos válida.");
    }

    this.#products = data.products;
    return this.getAll();
  }

  getAll() {
    return [...this.#products];
  }

  getById(productId) {
    return this.#products.find((product) => product.id === productId) ?? null;
  }

  getProductTypes() {
    const typeMap = new Map();

    this.#products.forEach((product) => {
      if (!typeMap.has(product.productType)) {
        typeMap.set(product.productType, product.productTypeLabel);
      }
    });

    return [...typeMap.entries()].map(([id, label]) => ({ id, label }));
  }

  getCategories(productType = "all") {
    const categoryMap = new Map();

    this.#products
      .filter((product) => productType === "all" || product.productType === productType)
      .forEach((product) => {
        if (!categoryMap.has(product.category)) {
          categoryMap.set(product.category, product.categoryLabel);
        }
      });

    return [...categoryMap.entries()].map(([id, label]) => ({ id, label }));
  }

  filter({ productType = "all", category = "all", query = "" } = {}) {
    const normalizedQuery = normalizeText(query.trim());

    return this.#products.filter((product) => {
      const typeMatches = productType === "all" || product.productType === productType;
      const categoryMatches = category === "all" || product.category === category;
      const searchableText = normalizeText(
        `${product.name} ${product.productTypeLabel} ${product.categoryLabel} ${product.description}`
      );
      const queryMatches = !normalizedQuery || searchableText.includes(normalizedQuery);
      return typeMatches && categoryMatches && queryMatches;
    });
  }
}
