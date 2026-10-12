# phsar

self hosted store for selling apps and other digital stuff. think app store page, but its your own site and you run it

demo: https://app.justsal.xyz

```
pnpm install
pnpm dev
```

makes a sqlite db in `data/` on first run and puts some fake products in so its not empty

first account you sign up with is the owner, after that go to `/admin` and change whatever

payments are off until you put a stripe key or a wallet address in admin > settings. usdt sent to a tron (trc20) wallet gets matched to the order and confirms on its own, any other coin you confirm by hand under orders. google login is the same deal, paste the client id + secret in settings

heads up: the card flow and google login havent been run against real accounts yet

## running it for real

```
pnpm build
pnpm start
```

everything lives in `data/` (the db, uploaded screenshots, the files people buy). back that folder up and thats your whole store. set `DATABASE_PATH` if you want it somewhere else, uploads go next to it

build with the same `DATABASE_PATH` you start with, the build reads the db

or with docker, the store ends up in the `phsar` volume

```
docker build -t phsar .
docker run -d -p 3000:3000 -v phsar:/data phsar
```

first start takes a minute, it builds inside the container

put it behind nginx or caddy for https. if you sell big files raise the upload limit there (`client_max_body_size` in nginx)

<picture>
  <source media="(min-width: 700px)" srcset="shots/shop-row.webp">
  <img src="shots/shop-grid.webp" alt="store screens">
</picture>

<picture>
  <source media="(min-width: 700px)" srcset="shots/owner-row.webp">
  <img src="shots/owner-grid.webp" alt="admin screens">
</picture>

## todo

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
