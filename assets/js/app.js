import { CatalogController } from "./controllers/CatalogController.js";
import { ProductModel } from "./models/ProductModel.js";
import { StoreModel } from "./models/StoreModel.js";
import { CatalogView } from "./views/CatalogView.js";

document.querySelector("#current-year").textContent = String(new Date().getFullYear());

const controller = new CatalogController({
  productModel: new ProductModel(),
  storeModel: new StoreModel(),
  view: new CatalogView()
});

controller.init();
