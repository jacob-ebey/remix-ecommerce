import { createCookieSessionStorage } from "remix";
import type { Params } from "react-router-dom";

import type { CartItem } from "./models/ecommerce-provider.server";
import { validateLanguage } from "./models/language";
import type { Language } from "./models/language";

if (!process.env.ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_KEY environment variable is not set");
}

let sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.ENCRYPTION_KEY],
  },
});

let cartSessionKey = "cart";
let langSessionKey = "language";

export async function getSession(
  input: Request | string | null | undefined,
  params: Params
) {
  let cookieHeader =
    !input || typeof input === "string" ? input : input.headers.get("Cookie");
  let session = await sessionStorage.getSession(cookieHeader);

  return {
    commitSession() {
      return sessionStorage.commitSession(session);
    },
    // TODO: Get and set cart from redis or something if user is logged in (could probably use a storage abstraction)
    async getCart(): Promise<CartItem[]> {
      let cart = JSON.parse(session.get(cartSessionKey) || "[]");
      return cart;
    },
    async setCart(cart: CartItem[]) {
      session.set(cartSessionKey, JSON.stringify(cart));
    },
    getLanguage(): Language {
      if (validateLanguage(params.lang)) {
        return params.lang;
      }

      return session.get(langSessionKey) || "en";
    },
    setLanguage(language: Language) {
      session.set(langSessionKey, language);
    },
  };
}

export function addToCart(
  cart: CartItem[],
  variantId: string,
  quantity: number
) {
  let added = false;
  for (let item of cart) {
    if (item.variantId === variantId) {
      item.quantity += quantity;
      added = true;
      break;
    }
  }
  if (!added) {
    cart.push({ variantId, quantity });
  }
  return cart;
}

export function updateCartItem(
  cart: CartItem[],
  variantId: string,
  quantity: number
) {
  let updated = false;
  for (let item of cart) {
    if (item.variantId === variantId) {
      item.quantity = quantity;
      updated = true;
      break;
    }
  }
  if (!updated) {
    cart.push({ variantId, quantity });
  }
  return cart;
}

export function removeCartItem(cart: CartItem[], variantId: string) {
  return cart.filter((item) => item.variantId !== variantId);
}
