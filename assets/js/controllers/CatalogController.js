import { WhatsAppService } from "../services/WhatsAppService.js";

export class CatalogController {
  constructor({ productModel, storeModel, view }) {
    this.productModel = productModel;
    this.storeModel = storeModel;
    this.view = view;
    this.store = null;
    this.activeType = "";
    this.activeCategory = "all";
    this.searchQuery = "";
    this.currentProduct = null;
    this.selectedSize = "";
    this.selectedSizeStatus = "";
  }

  async init() {
    this.#bindGlobalEvents();
    this.view.showLoading();

    try {
      const [products, store] = await Promise.all([
        this.productModel.load(),
        this.storeModel.load()
      ]);

      this.store = store;
      const productTypes = this.productModel.getProductTypes();
      this.activeType = productTypes[0]?.id ?? "all";

      this.view.renderStore(store);
      this.view.renderProductTypes(productTypes, this.activeType);
      this.view.renderCategories(
        this.productModel.getCategories(this.activeType),
        this.activeCategory
      );
      this.#renderFilteredProducts();
    } catch (error) {
      console.error(error);
      this.view.showError(
        "No se pudo cargar el catálogo. Revisa los archivos JSON y ejecuta la página desde un servidor local."
      );
    }
  }

  #bindGlobalEvents() {
    this.view.typeFilters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-product-type]");
      if (!button) return;

      this.activeType = button.dataset.productType;
      this.activeCategory = "all";
      this.view.updateActiveType(this.activeType);
      this.view.renderCategories(
        this.productModel.getCategories(this.activeType),
        this.activeCategory
      );
      this.#renderFilteredProducts();
    });

    this.view.filters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-category]");
      if (!button) return;

      this.activeCategory = button.dataset.category;
      this.view.updateActiveCategory(this.activeCategory);
      this.#renderFilteredProducts();
    });

    this.view.searchInput.addEventListener("input", (event) => {
      this.searchQuery = event.target.value;
      this.#renderFilteredProducts();
    });

    this.view.grid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-action='open-product']");
      if (!button) return;

      const product = this.productModel.getById(button.dataset.productId);
      if (!product) return;

      this.currentProduct = product;
      this.selectedSize = "";
      this.selectedSizeStatus = "";
      this.view.openProduct(product, this.store);
    });

    this.view.dialogContent.addEventListener("click", (event) => {
      const actionElement = event.target.closest("[data-action]");
      if (!actionElement) return;

      const action = actionElement.dataset.action;

      if (action === "close-dialog") {
        this.view.closeProduct();
      }

      if (action === "change-image" && this.currentProduct) {
        this.view.updateGallery(
          this.currentProduct,
          Number(actionElement.dataset.imageIndex)
        );
      }

      if (action === "select-size") {
        this.selectedSize = actionElement.dataset.size;
        this.selectedSizeStatus = actionElement.dataset.sizeStatus;
        this.view.updateSizeSelection(this.selectedSize, this.selectedSizeStatus);
      }

      if (action === "send-order") {
        this.#sendOrder();
      }
    });

    this.view.dialogContent.addEventListener("change", (event) => {
      if (event.target.id !== "customization-toggle" || !this.currentProduct) {
        return;
      }

      const customizationEnabled = event.target.checked;
      const total =
        Number(this.currentProduct.price) +
        (customizationEnabled ? Number(this.store.customizationPrice) : 0);

      this.view.toggleCustomization(customizationEnabled, total, this.store);
    });

    this.view.dialog.addEventListener("click", (event) => {
      if (event.target === this.view.dialog) {
        this.view.closeProduct();
      }
    });

    this.view.dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      this.view.closeProduct();
    });

    document.querySelectorAll("[data-action='general-whatsapp']").forEach((button) => {
      button.addEventListener("click", () => {
        if (!this.store) return;
        this.#openWhatsApp(this.store.generalMessage);
      });
    });

    const menuButton = document.querySelector(".menu-toggle");
    const navigation = document.querySelector("#main-nav");

    menuButton?.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });

    navigation?.addEventListener("click", () => {
      navigation.classList.remove("open");
      menuButton?.setAttribute("aria-expanded", "false");
    });
  }

  #renderFilteredProducts() {
    const products = this.productModel.filter({
      productType: this.activeType,
      category: this.activeCategory,
      query: this.searchQuery
    });

    this.view.renderProducts(products, this.store);
  }

  #sendOrder() {
    if (!this.currentProduct || !this.store) {
      return;
    }

    if (!this.selectedSize) {
      this.view.showFormError("Selecciona una talla antes de continuar.");
      return;
    }

    const formData = this.view.getOrderFormData();

    if (formData.customized && !formData.customName && !formData.customNumber) {
      this.view.showFormError(
        "Escribe por lo menos un nombre o un número para la personalización."
      );
      return;
    }

    const message = WhatsAppService.createOrderMessage({
      store: this.store,
      product: this.currentProduct,
      size: this.selectedSize,
      sizeStatus: this.selectedSizeStatus,
      ...formData
    });

    this.#openWhatsApp(message);
  }

  #openWhatsApp(message) {
    try {
      const url = WhatsAppService.createUrl(this.store.whatsappNumber, message);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error(error);
      window.alert(error.message);
    }
  }
}
