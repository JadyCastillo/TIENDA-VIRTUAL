import { formatCurrency } from "../utils/formatters.js";

export class WhatsAppService {
  static createUrl(phoneNumber, message) {
    const cleanNumber = String(phoneNumber ?? "").replace(/\D/g, "");

    if (!cleanNumber) {
      throw new Error("Configura un número de WhatsApp válido en data/store.json.");
    }

    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  }

  static createOrderMessage({ store, product, size, sizeStatus, customized, customName, customNumber }) {
    const customizationPrice = customized ? Number(store.customizationPrice) : 0;
    const total = Number(product.price) + customizationPrice;
    const orderType = sizeStatus === "available" ? "COMPRA" : "RESERVA";
    const statusText = sizeStatus === "available" ? "Disponible en stock" : "Solicitar por reserva";

    const lines = [
      `Hola, deseo realizar una ${orderType}:`,
      "",
      `Producto: ${product.name}`,
      `Descripción: ${product.description || "Sin descripción disponible"}`,
      `Categoría: ${product.categoryLabel}`,
      `Talla: ${size}`,
      `Estado: ${statusText}`,
      `Precio de camiseta: ${formatCurrency(product.price, store.locale, store.currency)}`,
      `Personalización: ${customized ? "Sí" : "No"}`
    ];

    if (customized) {
      lines.push(`Nombre: ${customName || "Sin nombre"}`);
      lines.push(`Número: ${customNumber || "Sin número"}`);
      lines.push(
        `Costo adicional: ${formatCurrency(store.customizationPrice, store.locale, store.currency)}`
      );
    }

    lines.push(`Total referencial: ${formatCurrency(total, store.locale, store.currency)}`);
    lines.push("");
    lines.push("Por favor, confírmame la disponibilidad y la fecha de entrega.");

    return lines.join("\n");
  }
}
