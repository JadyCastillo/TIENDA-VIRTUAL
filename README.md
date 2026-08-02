# Jady Sport - catálogo con WhatsApp

Sitio web estático para mostrar camisetas de fútbol, seleccionar una talla, agregar una personalización y enviar el pedido o la reserva por WhatsApp.

## Qué incluye

- Diseño responsive para computadora y celular.
- Catálogo separado en selecciones, clubes internacionales y equipos peruanos.
- Tallas disponibles en verde y tallas para reserva en rojo.
- Galería con una o varias imágenes por producto.
- Personalización opcional por S/ 10.
- Mensaje automático de WhatsApp con producto, talla, estado, personalización y total.
- Organización tipo MVC adaptada a un sitio estático.
- Sin carrito, base de datos ni pago online.

## Configuración rápida

### 1. Cambiar el número de WhatsApp

Abre `data/store.json` y reemplaza:

```json
"whatsappNumber": "51999999999"
```

Usa el código de país y el número, sin `+`, espacios ni guiones. Para Perú empieza con `51`.

En ese mismo archivo también puedes cambiar el nombre de la tienda, ciudad y costo de personalización.

### 2. Agregar o modificar camisetas

Edita `data/products.json`. Cada producto usa esta estructura:

```json
{
  "id": "id-unico",
  "name": "Nombre de la camiseta",
  "productType": "camisetas",
  "productTypeLabel": "Camisetas de fútbol",
  "category": "selecciones",
  "categoryLabel": "Selecciones",
  "price": 79.90,
  "featured": true,
  "description": "Descripción corta",
  "images": [
    {
      "src": "assets/img/products/foto-frontal.jpg",
      "alt": "Parte delantera"
    },
    {
      "src": "assets/img/products/foto-trasera.jpg",
      "alt": "Parte trasera"
    }
  ],
  "sizes": {
    "S": "available",
    "M": "available",
    "L": "preorder",
    "XL": "preorder",
    "XXL": "preorder"
  },
  "customizable": true,
  "leadTime": "Texto de entrega o reserva."
}
```

Estados de talla:

- `available`: aparece en verde y genera un pedido.
- `preorder`: aparece en rojo y genera una reserva.

Para una camiseta totalmente agotada, coloca todas las tallas como `preorder`.

Los campos `productType` y `productTypeLabel` permiten agregar después otras secciones, por ejemplo `polos`, `pantalones` o `accesorios`. Al añadir un nuevo tipo en el JSON, aparecerá como una nueva pestaña del catálogo.

### 3. Colocar tus fotos

Guarda las imágenes dentro de `assets/img/products/` y escribe la ruta en `products.json`.

Puedes usar JPG, PNG, WEBP o SVG. Se recomienda que todas tengan una proporción y un fondo parecidos para que el catálogo se vea ordenado.

## Probar en tu computadora

No abras `index.html` únicamente con doble clic, porque el navegador puede bloquear la lectura de los archivos JSON. Ejecuta un servidor local.

Opción con Visual Studio Code:

1. Instala la extensión Live Server.
2. Haz clic derecho en `index.html`.
3. Selecciona `Open with Live Server`.

Opción con Python:

```bash
python -m http.server 5500
```

Luego abre `http://localhost:5500`.

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub.
2. Sube todo el contenido de esta carpeta a la rama `main`.
3. En el repositorio entra a `Settings`.
4. Abre `Pages`.
5. En `Build and deployment`, selecciona `Deploy from a branch`.
6. Elige la rama `main` y la carpeta `/ (root)`.
7. Guarda y espera a que GitHub publique el sitio.

## Organización MVC

```text
assets/js/
├── models/
│   ├── ProductModel.js
│   └── StoreModel.js
├── views/
│   └── CatalogView.js
├── controllers/
│   └── CatalogController.js
├── services/
│   └── WhatsAppService.js
├── utils/
│   └── formatters.js
└── app.js
```

- Modelo: carga y filtra los datos JSON.
- Vista: crea las tarjetas, modal, galería y estados visuales.
- Controlador: conecta las acciones del usuario con el modelo, la vista y WhatsApp.
- Servicio: arma el enlace y el mensaje de WhatsApp.

## Importante

Este proyecto usa un número de ejemplo. Debes reemplazarlo antes de publicar.

GitHub Pages publica contenido estático. Si más adelante deseas administrar productos desde un panel, guardar pedidos o controlar stock sin editar archivos, necesitarás agregar un servicio externo o un backend.
