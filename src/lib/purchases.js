import { Capacitor } from "@capacitor/core";
import { NativePurchases, PURCHASE_TYPE } from "@capgo/native-purchases";

const MONTHLY_PRODUCT_ID = "com.amplifyu.app.monthly2";
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

const FREE_TRIAL_LIMIT = 2;

export function getTrialCount(key) {
  try {
    return parseInt(localStorage.getItem(key), 10) || 0;
  } catch (_) {
    return 0;
  }
}

export function incrementTrialCount(key) {
  try {
    localStorage.setItem(key, String(getTrialCount(key) + 1));
  } catch (_) {}
}

export function trialExhausted(key) {
  return getTrialCount(key) >= FREE_TRIAL_LIMIT && !isEntitled();
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

// Ask StoreKit which subscriptions are active right now and mirror that in
// the local unlock flag. StoreKit answers from its on-device copy, so this
// works offline. It runs at launch so that a free trial from an offer code
// (or any subscription) that has ended or been refunded locks again, and a
// code redeemed outside the app (e.g. from a link) unlocks without a Restore.
// The flag is only cleared on a successful answer, never on an error.
export function syncEntitlement() {
  if (!Capacitor.isNativePlatform()) return Promise.resolve(isEntitled());
  return NativePurchases.getPurchases({ productType: PURCHASE_TYPE.SUBS, onlyCurrentEntitlements: true })
    .then(({ purchases }) => {
      const active = (purchases || []).some(
        (p) => p.productIdentifier === MONTHLY_PRODUCT_ID && p.isActive !== false
      );
      setEntitled(active);
      return active;
    })
    .catch((err) => {
      console.error("[purchases] entitlement check failed:", err);
      return isEntitled();
    });
}

// Apple's own offer code sheet (e.g. a 2-week free trial code). Once it
// closes, check a few times for the new subscription, since the redeemed
// transaction can land a moment after the sheet is dismissed.
export function redeemOfferCode() {
  return NativePurchases.presentOfferCodeRedeemSheet().then(async () => {
    for (let i = 0; i < 6; i++) {
      if (await syncEntitlement()) return true;
      await new Promise((r) => setTimeout(r, 1500));
    }
    return false;
  });
}

export function initPurchases() {
  syncEntitlement();
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
