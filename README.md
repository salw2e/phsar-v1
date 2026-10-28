# phsar

Self-hosted store for selling apps and digital products.

Demo: https://app.justsal.xyz

```
pnpm install
pnpm dev
```

The first account to sign up is the owner. Settings, products and payments are in `/admin`. Data is stored in `data/`.

Stripe and Google login haven't been tested with real accounts yet.

```
docker build -t phsar .
docker run -d -p 3000:3000 -v phsar:/data phsar
```

<picture>
  <source media="(min-width: 700px)" srcset="shots/shop-row.webp">
  <img src="shots/shop-grid.webp" alt="store">
</picture>

<picture>
  <source media="(min-width: 700px)" srcset="shots/owner-row.webp">
  <img src="shots/owner-grid.webp" alt="admin">
</picture>

## Todo

- [ ] emails
- [ ] cart
