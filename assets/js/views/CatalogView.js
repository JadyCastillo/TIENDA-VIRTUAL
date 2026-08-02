import { escapeHtml, formatCurrency } from "../utils/formatters.js";

const sizeLabels = {
  available: "Stock",
  preorder: "Reserva",
};

export class CatalogView {
  constructor() {
    this.grid = document.querySelector("#product-grid");
    this.typeFilters = document.querySelector("#type-filters");
    this.filters = document.querySelector("#category-filters");
    this.searchInput = document.querySelector("#catalog-search");
    this.productCount = document.querySelector("#product-count");
    this.status = document.querySelector("#catalog-status");
    this.emptyState = document.querySelector("#empty-state");
    this.dialog = document.querySelector("#product-dialog");
    this.dialogContent = document.querySelector("#dialog-content");
    this.loadingTemplate = document.querySelector("#loading-card-template");
  }

  showLoading(quantity = 6) {
    this.grid.innerHTML = "";

    for (let index = 0; index < quantity; index += 1) {
      this.grid.append(this.loadingTemplate.content.cloneNode(true));
    }

    this.status.textContent = "Cargando camisetas...";
  }

  renderStore(store) {
    document.title = `${store.name} | Camisetas de fútbol`;

    document.querySelectorAll("[data-store-name]").forEach((element) => {
      element.textContent = store.name;
    });

    document.querySelectorAll("[data-store-location]").forEach((element) => {
      element.textContent = store.location;
    });
  }

  renderProductTypes(types, activeType) {
    this.typeFilters.innerHTML = types
      .map(
        (type) => `
          <button
            class="category-button ${type.id === activeType ? "active" : ""}"
            type="button"
            data-product-type="${escapeHtml(type.id)}"
            aria-pressed="${type.id === activeType}"
          >
            ${escapeHtml(type.label)}
          </button>
        `,
      )
      .join("");
  }

  updateActiveType(productType) {
    this.typeFilters
      .querySelectorAll("[data-product-type]")
      .forEach((button) => {
        const isActive = button.dataset.productType === productType;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });
  }

  renderCategories(categories, activeCategory = "all") {
    const allCategories = [{ id: "all", label: "Todas" }, ...categories];

    this.filters.innerHTML = allCategories
      .map(
        (category) => `
          <button
            class="category-button ${category.id === activeCategory ? "active" : ""}"
            type="button"
            data-category="${escapeHtml(category.id)}"
            aria-pressed="${category.id === activeCategory}"
          >
            ${escapeHtml(category.label)}
          </button>
        `,
      )
      .join("");
  }

  renderProducts(products, store) {
    this.grid.innerHTML = products
      .map((product) => this.#createProductCard(product, store))
      .join("");

    this.productCount.textContent = String(products.length);
    this.status.textContent = "";
    this.emptyState.hidden = products.length > 0;
  }

  showError(message) {
    this.grid.innerHTML = "";
    this.status.textContent = message;
    this.productCount.textContent = "0";
  }

  updateActiveCategory(category) {
    this.filters.querySelectorAll("[data-category]").forEach((button) => {
      const isActive = button.dataset.category === category;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  openProduct(product, store) {
    const availableNow = Object.values(product.sizes).some(
      (status) => status === "available",
    );
    const onlyPreorder = !availableNow;
    const canCustomize = product.customizable !== false || onlyPreorder;
    const defaultImage = product.images[0];

    this.dialogContent.innerHTML = `
      <div class="dialog-shell" data-product-id="${escapeHtml(product.id)}">
        <button class="icon-button dialog-close" type="button" data-action="close-dialog" aria-label="Cerrar">
          ×
        </button>

        <div class="dialog-grid">
          <div class="dialog-gallery">
            <div class="gallery-thumbnails" aria-label="Imágenes de la camiseta">
              ${product.images
                .map(
                  (image, index) => `
                    <button
                      class="thumbnail-button ${index === 0 ? "active" : ""}"
                      type="button"
                      data-action="change-image"
                      data-image-index="${index}"
                      aria-label="Ver imagen ${index + 1}"
                    >
                      <img src="${escapeHtml(image.src)}" alt="">
                    </button>
                  `,
                )
                .join("")}
            </div>
            <div class="gallery-main">
              <img id="dialog-main-image" src="${escapeHtml(defaultImage.src)}" alt="${escapeHtml(
                defaultImage.alt,
              )}">
            </div>
          </div>

          <div class="dialog-details">
            <span class="dialog-category">${escapeHtml(product.categoryLabel)}</span>
            <h2 id="dialog-product-name">${escapeHtml(product.name)}</h2>
            <p class="dialog-price">${formatCurrency(product.price, store.locale, store.currency)}</p>
            <p class="dialog-description">${escapeHtml(product.description)}</p>

            <div class="option-group">
              <div class="option-title-row">
                <span class="option-title">Selecciona tu talla</span>
                <span class="option-help">Rojo = disponible por reserva</span>
              </div>
              <div class="size-options">
                ${Object.entries(product.sizes)
                  .map(
                    ([size, status]) => `
                      <button
                        class="size-option ${status}"
                        type="button"
                        data-action="select-size"
                        data-size="${escapeHtml(size)}"
                        data-size-status="${escapeHtml(status)}"
                      >
                        <strong>${escapeHtml(size)}</strong>
                        <small>${sizeLabels[status] ?? status}</small>
                      </button>
                    `,
                  )
                  .join("")}
              </div>
              <p id="availability-message" class="availability-message">
                ${availableNow ? "Selecciona una talla para comprar o reservar." : "Todas las tallas se solicitan mediante reserva."}
              </p>
            </div>

            ${
              canCustomize
                ? `
                  <div class="customization-box">
                    <p class="option-title">Elige cómo deseas la camiseta</p>

                    <label class="customization-toggle">
                      <input
                        type="radio"
                        name="print-option"
                        value="original"
                        checked
                      >
                      <span>
                        <strong>Como aparece en la imagen</strong>
                        <small>Se mantiene el nombre y número mostrados.</small>
                      </span>
                    </label>

                    <label class="customization-toggle">
                      <input
                        type="radio"
                        name="print-option"
                        value="blank"
                      >
                      <span>
                        <strong>Sin nombre ni número</strong>
                        <small>Camiseta sin estampado en la espalda.</small>
                      </span>
                    </label>

                    <label class="customization-toggle">
                      <input
                        type="radio"
                        name="print-option"
                        value="custom"
                      >
                      <span>
                        <strong>
                          Personalizar (+${formatCurrency(
                            store.customizationPrice,
                            store.locale,
                            store.currency,
                          )})
                        </strong>
                        <small>Coloca otro nombre, número o ambos.</small>
                      </span>
                    </label>

                    <div id="customization-fields" class="customization-fields" hidden>
                      <label class="field">
                        <span>Nombre</span>
                        <input
                          id="custom-name"
                          type="text"
                          maxlength="18"
                          placeholder="Ejemplo: JADY"
                        >
                      </label>

                      <label class="field">
                        <span>Número</span>
                        <input
                          id="custom-number"
                          type="text"
                          inputmode="numeric"
                          maxlength="3"
                          placeholder="10"
                        >
                      </label>
                    </div>
                  </div>
                `
                : ""
            }

            <div class="order-summary">
              <div>
                <small>Total referencial</small>
                <strong id="dialog-total">${formatCurrency(
                  product.price,
                  store.locale,
                  store.currency,
                )}</strong>
              </div>
              <span id="order-type-badge" class="status-badge ${availableNow ? "available" : "preorder"}">
                ${availableNow ? "Elige talla" : "Reserva"}
              </span>
            </div>

            <button class="button dialog-order-button" type="button" data-action="send-order">
              Selecciona una talla
            </button>
            <p id="form-error" class="form-error" aria-live="polite"></p>
            <p class="option-help">${escapeHtml(product.leadTime ?? "")}</p>
          </div>
        </div>
      </div>
    `;

    document.body.classList.add("dialog-open");
    this.dialog.showModal();
  }

  closeProduct() {
    if (this.dialog.open) {
      this.dialog.close();
    }
    document.body.classList.remove("dialog-open");
    this.dialogContent.innerHTML = "";
  }

  updateGallery(product, imageIndex) {
    const image = product.images[imageIndex];
    const mainImage = this.dialogContent.querySelector("#dialog-main-image");

    if (!image || !mainImage) {
      return;
    }

    mainImage.src = image.src;
    mainImage.alt = image.alt;

    this.dialogContent
      .querySelectorAll("[data-action='change-image']")
      .forEach((button) => {
        button.classList.toggle(
          "active",
          Number(button.dataset.imageIndex) === imageIndex,
        );
      });
  }

  updateSizeSelection(size, status) {
    this.dialogContent
      .querySelectorAll("[data-action='select-size']")
      .forEach((button) => {
        button.classList.toggle("selected", button.dataset.size === size);
      });

    const availabilityMessage = this.dialogContent.querySelector(
      "#availability-message",
    );
    const orderButton = this.dialogContent.querySelector(
      "[data-action='send-order']",
    );
    const badge = this.dialogContent.querySelector("#order-type-badge");

    if (status === "available") {
      availabilityMessage.textContent = `La talla ${size} está disponible para compra.`;
      orderButton.textContent = "Pedir por WhatsApp";
      badge.textContent = "En stock";
      badge.className = "status-badge available";
    } else {
      availabilityMessage.textContent = `La talla ${size} no está en stock, pero puedes reservarla.`;
      orderButton.textContent = "Reservar por WhatsApp";
      badge.textContent = "Reserva";
      badge.className = "status-badge preorder";
    }

    this.clearFormError();
  }

  toggleCustomization(enabled, total, store) {
    const fields = this.dialogContent.querySelector("#customization-fields");
    const totalElement = this.dialogContent.querySelector("#dialog-total");

    if (fields) {
      fields.hidden = !enabled;
    }

    if (totalElement) {
      totalElement.textContent = formatCurrency(
        total,
        store.locale,
        store.currency,
      );
    }

    this.clearFormError();
  }

  getOrderFormData() {
    const printOption =
      this.dialogContent.querySelector("input[name='print-option']:checked")
        ?.value ?? "original";

    return {
      printOption,
      customized: printOption === "custom",
      customName:
        this.dialogContent.querySelector("#custom-name")?.value.trim() ?? "",
      customNumber:
        this.dialogContent.querySelector("#custom-number")?.value.trim() ?? "",
    };
  }

  showFormError(message) {
    const element = this.dialogContent.querySelector("#form-error");
    if (element) {
      element.textContent = message;
    }
  }

  clearFormError() {
    this.showFormError("");
  }

  #createProductCard(product, store) {
    const hasStock = Object.values(product.sizes).some(
      (status) => status === "available",
    );
    const primaryImage = product.images[0];

    return `
      <article class="product-card">
        <div class="product-media">
          <div class="product-badges">
            <span class="status-badge ${hasStock ? "available" : "preorder"}">
              ${hasStock ? "En stock" : "Solo reserva"}
            </span>
            ${product.featured ? '<span class="featured-badge">Destacada</span>' : ""}
          </div>
          <img src="${escapeHtml(primaryImage.src)}" alt="${escapeHtml(primaryImage.alt)}" loading="lazy">
        </div>

        <div class="product-card-body">
          <p class="product-category">${escapeHtml(product.categoryLabel)}</p>
          <div class="product-title-row">
            <h3>${escapeHtml(product.name)}</h3>
            <span class="product-price">${formatCurrency(
              product.price,
              store.locale,
              store.currency,
            )}</span>
          </div>
          <p class="product-description">${escapeHtml(product.description)}</p>
          <div class="size-preview" aria-label="Disponibilidad de tallas">
            ${Object.entries(product.sizes)
              .map(
                ([size, status]) => `
                  <span class="${escapeHtml(status)}" title="${sizeLabels[status] ?? status}">
                    ${escapeHtml(size)}
                  </span>
                `,
              )
              .join("")}
          </div>
          <button class="button product-action" type="button" data-action="open-product" data-product-id="${escapeHtml(
            product.id,
          )}">
            Ver detalles
          </button>
        </div>
      </article>
    `;
  }
}
