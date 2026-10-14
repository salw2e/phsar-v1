# phsar

Self-hosted store for selling apps and other digital products, with an app store style product page on your own site.

Demo: https://app.justsal.xyz

```
pnpm install
pnpm dev
```

The first run creates a SQLite database in `data/` and adds a few example products.

The first account that signs up is the owner. Everything else is set up in `/admin`.

Payments are off until a Stripe key or a wallet address is added in Admin > Settings. USDT sent to a Tron (TRC20) wallet is matched to its order and confirmed automatically. Other coins are confirmed by hand under Orders. Google login is set up the same way, with the client ID and secret in Settings.

The card payment flow and Google login have not been tested against real accounts yet.

## Running it in production

```
pnpm build
pnpm start
```

Everything is stored in `data/`: the database, uploaded screenshots and the files customers buy. Backing up that folder backs up the whole store. Set `DATABASE_PATH` to keep it somewhere else, uploads are stored next to it. The build reads the database, so build with the same `DATABASE_PATH` you start with.

With Docker the store is kept in the `phsar` volume:

```
docker build -t phsar .
docker run -d -p 3000:3000 -v phsar:/data phsar
```

The first start takes a minute because it builds inside the container.

Put it behind nginx or Caddy for HTTPS. To sell large files, raise the upload limit there (`client_max_body_size` in nginx).

<picture>
  <source media="(min-width: 700px)" srcset="shots/shop-row.webp">
  <img src="shots/shop-grid.webp" alt="store screens">
</picture>

<picture>
  <source media="(min-width: 700px)" srcset="shots/owner-row.webp">
  <img src="shots/owner-grid.webp" alt="admin screens">
</picture>

## Todo

- [x] storefront
- [x] product page
- [x] login, google login
- [x] admin (products, screenshots, bundles, categories, customers, pages, store settings)
- [x] checkout (stripe card, crypto)
- [x] orders, library, file downloads
- [x] terms / privacy / support pages
- [ ] emails (receipts, password reset)
- [ ] cart
- [ ] currencies other than usd
- [x] reviews
