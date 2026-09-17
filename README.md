# CWI Store

The live storefront for CWI products — https://cumulativewebinc.github.io/cwi-store/

Vanilla HTML/CSS/JS, zero dependencies, served by GitHub Pages from `/docs`.

## How buying works

Two modes, switched automatically per product by `docs/BUY_LINKS.json`:

- **Pending (today):** every product's `status` is `"pending"` with an empty
  `checkout_url`, so each product card's primary button is a prefilled
  `mailto:` to hp@cumulativeweb.com (labeled "Order via email") with a
  secondary "Online checkout opens soon." line.
- **Live:** once Black pastes a real payment URL into a product's
  `checkout_url`, sets `payment_provider` (`"gumroad"` or `"stripe"`), and
  flips `status` to `"live"`, that card's button becomes "Buy now" pointing
  at checkout, the note becomes "Secure checkout via Gumroad/Stripe.", and
  the card's delivery line switches from email fulfillment to
  provider-appropriate delivery copy. When all products are live, the page
  header and "How ordering works" step 1 switch to checkout wording too.

### BUY_LINKS.json schema (v2)

```json
{
  "_note": "staging note, ignored by the storefront",
  "pitch-kit": {
    "checkout_url": "",
    "payment_provider": "",
    "status": "pending"
  }
}
```

A `live` slot also carries `"verified"` — a provenance marker (date + how the
URL was verified: right product, right price, seen live). The honesty tests
reject any real checkout URL whose slot lacks it.

Rules enforced by `tests/test_store.py`:
- `status` must be one of `pending` / `live` / `disabled`.
- A non-`live` slot must have an **empty** `checkout_url` — no fabricated
  checkout URLs, ever. Never set a URL you have not opened and verified
  (right product, right price).
- Legacy plain-string values are still honored as live checkout URLs
  (backward compatibility), but new entries should use the object form.

## Products live

- The $0 Playlist Pitch Kit — $19
- Playlist Evidence Report — $49
- Sync Readiness Pack — $149

Kill rule (enforced by tests): a product may be listed only while its
deliverable files exist (`test_kill_rule` checks the file paths). A product
without a credible paying-customer path within 14 days leaves the money
board — delist by removing its card, and set its BUY_LINKS.json slot to
`{"checkout_url": "", "payment_provider": "", "status": "disabled"}`.

## Local test

```sh
python3 tests/test_store.py            # local checks
python3 tests/test_store.py --live     # + live HTTP 200 checks after deploy
```

## Deploy

```sh
python3 deploy.py                      # push via Git Data API, enable Pages
python3 deploy.py "custom commit message"
```

## License

MIT. See LICENSE (generated at deploy time).
