# phsar

self hosted store for selling apps and other digital stuff. think app store page, but its your own site and you run it. still wip

```
pnpm install
pnpm dev
```

makes a sqlite db in `data/` on first run and puts some fake products in so its not empty

first account you sign up with is the owner, after that go to `/admin` and change whatever

## todo

- [x] storefront
- [x] product page
- [x] login
- [x] admin (products, screenshots, bundles, categories, store settings)
- [ ] checkout, stripe + crypto
- [ ] orders + download delivery
