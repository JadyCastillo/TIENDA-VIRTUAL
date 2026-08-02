export class StoreModel {
  #store = null;

  async load() {
    const response = await fetch("./data/store.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`No se pudo cargar la configuración de la tienda (${response.status}).`);
    }

    this.#store = await response.json();
    return this.get();
  }

  get() {
    return this.#store ? { ...this.#store } : null;
  }
}
