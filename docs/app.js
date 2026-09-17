/* CWI Store buy mechanism.
 *
 * Reads docs/BUY_LINKS.json. Each key maps a product id to its checkout URL.
 * - URL present: primary button goes straight to checkout.
 * - URL empty/absent: primary button is a prefilled mailto to hp@cumulativeweb.com,
 *   labeled exactly "Order via email", with an honest "Online checkout opens soon." line.
 */
(function () {
  "use strict";

  var STORE_EMAIL = "hp@cumulativeweb.com";

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
    ].join("\n")
  };

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
    var url = (buyLinks && typeof buyLinks[id] === "string") ? buyLinks[id].trim() : "";

    slot.innerHTML = "";

    var btn = document.createElement("a");
    btn.className = "btn";
    if (url) {
      btn.href = url;
      btn.textContent = "Buy now";
      btn.rel = "noopener";
    } else {
      btn.href = buildMailto(id, name, price);
      btn.textContent = "Order via email";
    }
    slot.appendChild(btn);

    var note = document.createElement("p");
    note.className = url ? "checkout-note" : "soon-note";
    note.textContent = url ? "Secure checkout." : "Online checkout opens soon.";
    slot.appendChild(note);
  }

  function renderAll(buyLinks) {
    var slots = document.querySelectorAll(".buy-slot");
    for (var i = 0; i < slots.length; i++) {
      renderSlot(slots[i], buyLinks);
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
