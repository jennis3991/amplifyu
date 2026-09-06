import { NativePurchases, PURCHASE_TYPE } from "@capgo/native-purchases";

const MONTHLY_PRODUCT_ID = "com.amplifyu.app.monthly";
const ENTITLEMENT_KEY = "au1_entitled";

let productPromise = null;

function setEntitled(value) {
  try {
    if (value) localStorage.setItem(ENTITLEMENT_KEY, "true");
    else localStorage.removeItem(ENTITLEMENT_KEY);
  } catch (_) {}
}

export function isEntitled() {
  try {
    return localStorage.getItem(ENTITLEMENT_KEY) === "true";
  } catch (_) {
    return false;
  }
}

function fetchSubscriptionProduct() {
  return NativePurchases.getProduct({
    productIdentifier: MONTHLY_PRODUCT_ID,
  }).then(({ product }) => {
    console.log(
      `[purchases] ${product.identifier}: ${product.title} — ${product.priceString}`
    );
    return product;
  });
}

export function initPurchases() {
  if (!productPromise) {
    productPromise = fetchSubscriptionProduct().catch((err) => {
      console.error("[purchases] failed to fetch subscription product:", err);
      productPromise = null;
      throw err;
    });
  }
  return productPromise;
}

export function getSubscriptionProduct() {
  return productPromise || initPurchases();
}

export function purchaseSubscription() {
  return NativePurchases.purchaseProduct({
    productIdentifier: MONTHLY_PRODUCT_ID,
    productType: PURCHASE_TYPE.SUBS,
  }).then((transaction) => {
    console.log("[purchases] purchase succeeded:", transaction);
    setEntitled(true);
    return transaction;
  }).catch((err) => {
    console.error("[purchases] purchase failed or cancelled:", err);
    throw err;
  });
}

export function restorePurchases() {
  return NativePurchases.restorePurchases()
    .then(() => NativePurchases.getPurchases({ productType: PURCHASE_TYPE.SUBS }))
    .then(({ purchases }) => {
      const found = purchases.some(
        (p) => p.productIdentifier === MONTHLY_PRODUCT_ID && p.isActive !== false
      );
      console.log("[purchases] restore result:", purchases, "— entitlement found:", found);
      setEntitled(found);
      return found;
    })
    .catch((err) => {
      console.error("[purchases] restore failed:", err);
      throw err;
    });
}
