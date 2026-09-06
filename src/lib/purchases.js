import { NativePurchases } from "@capgo/native-purchases";

const MONTHLY_PRODUCT_ID = "com.amplifyu.app.monthly";

let productPromise = null;

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
