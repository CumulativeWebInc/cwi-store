# CWI Store

The live storefront for CWI products — https://cumulativewebinc.github.io/cwi-store/

Vanilla HTML/CSS/JS, zero dependencies, served by GitHub Pages from `/docs`.

## How buying works

There is no online checkout yet — that is Black's tap (Gumroad/Stripe account + payment links).
Each product card's primary button is a prefilled `mailto:` to hp@cumulativeweb.com
(labeled "Order via email") with a secondary "Online checkout opens soon." line.

`docs/BUY_LINKS.json` maps product id → checkout URL. All values are empty today.
When Black pastes his Gumroad/Stripe payment links in, the buttons switch to
checkout automatically — no code change needed.

## Products live

- The $0 Playlist Pitch Kit — $19
- Playlist Evidence Report — $49

The Sync Readiness Pack ($149) is staged but its product files are not built yet,
so it is not listed (kill rule: never list a product whose files are missing).

## Local test

```sh
python3 tests/test_store.py            # local checks
python3 tests/test_store.py --live     # + live HTTP 200 checks after deploy
```

## License

MIT. See LICENSE.
