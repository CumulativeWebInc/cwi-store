/* CWI Store buy mechanism.
 *
 * Reads docs/BUY_LINKS.json. Schema v2: each product id maps to an object
 *   { "checkout_url": "...", "payment_provider": "gumroad"|"stripe"|"",
 *     "status": "pending"|"live"|"disabled" }
 * Legacy form (plain string URL) is still honored as a live checkout link.
 *
 * - status "live" with a non-empty checkout_url: primary button goes to
 *   checkout, labeled "Buy now", with a provider-named "Secure checkout"
 *   line, and the card's delivery line switches from email fulfillment
 *   to provider-appropriate delivery copy.
 * - anything else (pending / disabled / empty URL): primary button is a
 *   prefilled mailto to hp@cumulativeweb.com, labeled exactly
 *   "Order via email", with an honest "Online checkout opens soon." line.
 *
 * No checkout URL may be staged as live without a human having opened it
 * and confirmed the product and price match. Pending slots keep mailto.
 */
(function () {
  "use strict";

  var STORE_EMAIL = "hp@cumulativeweb.com";

  var PROVIDER_NAMES = {
    gumroad: "Gumroad",
    stripe: "Stripe"
  };

  // Per-product order email bodies. Keep plain and fill-in-the-blank.
  var ORDER_BODIES = {
    "pitch-kit": [
      "Hello CWI,",
      "",
      "I'd like to order:",
      "",
      "Product: The $0 Playlist Pitch Kit",
      "Price: $19 USD",
      "",
      "Name:",
      "Email:"
    ].join("\n"),
    "evidence-report": [
      "Hello CWI,",
      "",
      "I'd like to order:",
      "",
      "Product: Playlist Evidence Report",
      "Price: $49 USD",
      "",
      "Name:",
      "Email:",
      "Spotify artist URL:",
      "Playlists I believe I'm on:"
    ].join("\n"),
    "sync-pack": [
      "Hello CWI,",
      "",
      "I'd like to order:",
      "",
      "Product: Sync Readiness Pack",
      "Price: $149 USD",
      "",
      "Name:",
      "Email:"
    ].join("\n")
  };

  // Delivery copy shown on the card once checkout is live, per provider.
  // Kept provider-honest: Gumroad delivers digital files instantly;
  // Stripe Payment Links confirm the order and CWI fulfills by email.
  var DELIVERY_COPY = {
    gumroad: "Delivered instantly after purchase — download links arrive from Gumroad.",
    stripe: "Order confirmed at checkout — CWI delivers your files by email."
  };
  var DELIVERY_COPY_DEFAULT =
    "Digital delivery completes after your purchase — see the checkout page for details.";

  function normalizeEntry(entry) {
    if (typeof entry === "string") {
      var url = entry.trim();
      return { url: url, provider: "legacy", live: url !== "" };
    }
    if (entry && typeof entry === "object") {
      var ourl = ((entry.checkout_url || "") + "").trim();
      var provider = ((entry.payment_provider || "") + "").trim().toLowerCase();
      return {
        url: ourl,
        provider: provider,
        live: entry.status === "live" && ourl !== ""
      };
    }
    return { url: "", provider: "", live: false };
  }

  function providerLabel(provider) {
    return PROVIDER_NAMES[provider] || "checkout";
  }

  function buildMailto(productId, name, price) {
    var subject = "Order: " + name + " — " + price;
    var body = ORDER_BODIES[productId] || ("Hello CWI,\n\nI'd like to order:\n\nProduct: " + name + "\nPrice: " + price + " USD\n\nName:\nEmail:");
    return "mailto:" + STORE_EMAIL +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);
  }

  function renderSlot(slot, buyLinks) {
    var id = slot.getAttribute("data-id");
    var name = slot.getAttribute("data-name");
    var price = slot.getAttribute("data-price");
    var entry = normalizeEntry(buyLinks ? buyLinks[id] : null);

    slot.innerHTML = "";

    var btn = document.createElement("a");
    btn.className = "btn";
    if (entry.live) {
      btn.href = entry.url;
      btn.textContent = "Buy now";
      btn.rel = "noopener";
    } else {
      btn.href = buildMailto(id, name, price);
      btn.textContent = "Order via email";
    }
    slot.appendChild(btn);

    var note = document.createElement("p");
    note.className = entry.live ? "checkout-note" : "soon-note";
    note.textContent = entry.live
      ? "Secure checkout via " + providerLabel(entry.provider) + "."
      : "Online checkout opens soon.";
    slot.appendChild(note);

    // Swap the card's delivery line once checkout is live so it never
    // promises email fulfillment for a checkout purchase (or vice versa).
    var card = slot.closest ? slot.closest("article") : null;
    var delivery = card ? card.querySelector(".delivery") : null;
    if (delivery && entry.live) {
      delivery.textContent =
        DELIVERY_COPY[entry.provider] || DELIVERY_COPY_DEFAULT;
    }
  }

  function allLive(slots, buyLinks) {
    if (!slots.length) { return false; }
    for (var i = 0; i < slots.length; i++) {
      if (!normalizeEntry(buyLinks ? buyLinks[slots[i].getAttribute("data-id")] : null).live) {
        return false;
      }
    }
    return true;
  }

  function renderAll(buyLinks) {
    var slots = document.querySelectorAll(".buy-slot");
    for (var i = 0; i < slots.length; i++) {
      renderSlot(slots[i], buyLinks);
    }

    // When every product has live checkout, the page-level copy stops
    // describing email ordering. Mixed state keeps the email wording,
    // which stays accurate for the products still on mailto.
    if (allLive(slots, buyLinks)) {
      var lede = document.getElementById("store-lede");
      if (lede) {
        lede.textContent = "Real products from the label. Buy instantly with secure checkout.";
      }
      var step1 = document.getElementById("how-step-1");
      if (step1) {
        step1.innerHTML = "<strong>Checkout online.</strong> Hit \u201cBuy now\u201d " +
          "on a product — secure payment, and delivery completes as described on each card.";
      }
    }
  }

  function boot() {
    fetch("BUY_LINKS.json", { cache: "no-store" })
      .then(function (resp) { return resp.ok ? resp.json() : {}; })
      .then(renderAll)
      .catch(function () { renderAll({}); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
