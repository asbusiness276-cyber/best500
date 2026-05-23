# Publishing a new article

Vite fails with `Failed to resolve import "./articles/..."` when `src/data/articles.ts` imports a file that does not exist yet. Follow this order every time.

## Safe workflow

1. **Create the article module first** — `src/data/articles/{slug}.ts` (from CSV import script or copy an existing article as a template).
2. **Then** add the import and array entry in `src/data/articles.ts`.
3. **Then** add the route in `scripts/site-routes.mjs` (`articleRoutes`).
4. Run `npm run verify:articles` (or `npm run build`) to confirm imports resolve.
5. Add featured image under `public/images/`, run SEO export / build as usual.

**Never** add an import to `articles.ts` or a route in `site-routes.mjs` before the `{slug}.ts` file exists.

## CSV imports

Use the matching `scripts/import-*-csv.cjs` (or `scripts/publish-article-from-csv.mjs` when wired) so the article file is generated before registry updates.

## Verify script

```bash
npm run verify:articles
```

Runs `scripts/verify-articles-imports.mjs` and exits with an error if any `./articles/*` import is missing its `.ts` file.
