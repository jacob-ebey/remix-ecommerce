import { Language } from "~/models/language";

export function getTranslations<
  RequestedTranslations extends keyof Translations
>(lang: Language, requestedTranslations: Array<RequestedTranslations>) {
  let results: Record<RequestedTranslations, string> = {} as any;
  for (let translation of requestedTranslations) {
    results[translation] = translations[translation][lang];
  }

  return results;
}

type Translations = typeof translations;
export type PickTranslations<TranslationKeys extends keyof Translations> =
  Record<TranslationKeys, string>;

let translations = {
  All: {
    en: "All",
    es: "Todo",
  },
  Cart: {
    en: "Shopping Cart",
    es: "Carrito de compras",
  },
  "Close Menu": {
    en: "Close Menu",
    es: "Cerrar menú",
  },
  English: {
    en: "English",
    es: "Inglés",
  },
  Home: {
    en: "Home",
    es: "Inicio",
  },
  "Open Menu": {
    en: "Open Menu",
    es: "Abrir menú",
  },
  "Search for products...": {
    en: "Search for products...",
    es: "Buscar productos...",
  },
  Spanish: {
    en: "Spanish",
    es: "Español",
  },
  "Store Name": {
    en: "Remix Ecommerce",
    es: "Remix Ecommerce",
  },
  Wishlist: {
    en: "Wishlist",
    es: "Lista de deseos",
  },
  "Price: High to low": {
    en: "Price: High to low",
    es: "Precio: de mayor a menor",
  },
  "Price: Low to high": {
    en: "Price: Low to high",
    es: "Precio: de menor a mayor",
  },
  "Latest arrivals": {
    en: "Latest arrivals",
    es: "Últimos arrivos",
  },
  Trending: {
    en: "Trending",
    es: "Tendencias",
  },
  "Looks like your language doesn't match": {
    en: "Looks like your language doesn't match",
    es: "Parece que tu idioma no coincide",
  },
  "Would you like to switch to $1?": {
    en: "Would you like to switch to $1?",
    es: "¿Quieres cambiar a $1?",
  },
  Yes: {
    en: "Yes",
    es: "Sí",
  },
  No: {
    en: "No",
    es: "No",
  },
  Close: {
    en: "Close",
    es: "Cerrar",
  },
  "Your cart is empty": {
    en: "Your cart is empty",
    es: "Tu carrito está vacío",
  },
  "Add to cart": {
    en: "Add to cart",
    es: "Añadir al carrito",
  },
  Adding: {
    en: "Adding...",
    es: "Agregando...",
  },
  "Added!": {
    en: "Added!",
    es: "¡Adicional!",
  },
  "Sold out": {
    en: "Sold out",
    es: "No disponible",
  },
  "Quantity: $1": {
    en: "Quantity: $1",
    es: "Cantidad: $1",
  },
  "Remove from cart": {
    en: "Remove from cart",
    es: "Eliminar del carrito",
  },
  "Subtract item": {
    en: "Subtract item",
    es: "Restar item",
  },
  "Add item": {
    en: "Add item",
    es: "Añadir item",
  },
  "Calculated at checkout": {
    en: "Calculated at checkout",
    es: "Calculado al pagar",
  },
  "Proceed to checkout": {
    en: "Proceed to checkout",
    es: "Proceder a pagar",
  },
  Subtotal: {
    en: "Subtotal",
    es: "Subtotal",
  },
  Total: {
    en: "Total",
    es: "Total",
  },
  Taxes: {
    en: "Taxes",
    es: "Impuestos",
  },
  Shipping: {
    en: "Shipping",
    es: "Envío",
  },
  "Your wishlist is empty": {
    en: "Your wishlist is empty",
    es: "Tu lista de deseos está vacía",
  },
  "Remove from wishlist": {
    en: "Remove from wishlist",
    es: "Eliminar de la lista de deseos",
  },
  "Move to cart": {
    en: "Move to cart",
    es: "Mover al carrito",
  },
  "Add to wishlist": {
    en: "Add to wishlist",
    es: "Añadir a la lista de deseos",
  },

  MockCTAHeadline: {
    en: "Dessert dragée halvah croissant.",
    es: "Dessert dragée halvah croissant.",
  },
  MockCTADescription: {
    en: "Cupcake ipsum dolor sit amet lemon drops pastry cotton candy. Sweet carrot cake macaroon bonbon croissant fruitcake jujubes macaroon oat cake. Soufflé bonbon caramels jelly beans. Tiramisu sweet roll cheesecake pie carrot cake.",
    es: "Cupcake ipsum dolor sit amet lemon drops pastry cotton candy. Sweet carrot cake macaroon bonbon croissant fruitcake jujubes macaroon oat cake. Soufflé bonbon caramels jelly beans. Tiramisu sweet roll cheesecake pie carrot cake.",
  },
  MockCTALink: {
    en: "Read it here",
    es: "Leerlo aquí",
  },
};
