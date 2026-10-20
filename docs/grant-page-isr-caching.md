# Grant pages: render once per deploy, not hourly

**Status: implemented, awaiting post-deploy verification.** Raised from a Vercel
usage review on 2026-10-19. Covers `app/grants/[id]/page.tsx` and
`app/clinical-trials/[id]/page.tsx`.

## The problem

Grant data only changes when one of these happens:

- **A deploy.** GitLab runs `generate`, which writes the branch's S3 prefix, then
  fires the deploy (see `decoupled-build.md`).
- **The weekly `fetch_pubmed_data` job.** It overwrites the per-grant
  `pubmed/*.json` files.

The grant page makes no CMS calls and passes no `announcements` to `Layout`.

Even so, the route regenerated itself at most once an hour, whenever someone visited
(`revalidate = 3600` on the route and on both `fetch()` calls).

There are about 30k grants, each visited rarely, mostly by crawlers. That means nearly
every visit landed on a copy older than an hour and started a background re-render
plus an ISR write. From 25 Sept to 19 Oct 2026 the numbers were:

| `/grants/[id]` | |
|---|---|
| Function invocations | ~379k (≈ 12–13 re-renders per grant, of unchanged content) |
| ISR write units | ~1.36M (≈ 100% of the project's ISR writes; ≈ 3.6 units per render: HTML, RSC and fetch-cache entries) |
| Cost this cycle | ISR Writes ~$6.20 plus a share of Fluid CPU (~$3.70 project-wide) |

Crawl bursts (meta-externalagent 2–5 Oct, AhrefsBot 17–18 Oct) made it worse, but
the cause was the hourly window, not the bots.

## The change

Each grant renders on its first request after a deploy, and that copy is served until
the next deploy. A new deployment starts with an empty ISR cache.

1. **Route:** `revalidate = false`. `dynamicParams = true` and the empty
   `generateStaticParams()` stay. Building all 30k pages would slow every deploy for
   little gain.
2. **Fetches** go through `fetchRemoteJson()` (`app/helpers/remote-data.ts`):
   - It uses `cache: 'force-cache'`. A route's `revalidate` doesn't override a
     per-fetch `revalidate`, so leaving 3600 on the fetches would have kept the
     page hourly.
   - It appends `?v=$VERCEL_DEPLOYMENT_ID`. Vercel's Data Cache outlives
     deployments, and `generate` overwrites the same S3 URLs, so without a
     per-deploy key a new dataset could keep serving old JSON.
3. **Missing vs failed:**
   - **404/403** from S3 means the object doesn't exist → `notFound()`. That 404 is
     cached for the deploy, which is correct.
   - **Any other failure throws.** Nothing is cached, and the next request retries.
     Before this change every failure became a 404, which ISR would now have
     frozen for the whole deploy.
   - **PubMed is the exception.** It's optional on the page and still degrades to
     an empty list. That empty list is cached for the deploy, which is an accepted
     trade-off.
4. **PubMed freshness:**
   - The weekly `fetch_pubmed_data` job (master) always invalidates `/pubmed/*` on
     CloudFront and waits for the purge to finish. A failed purge fails the job.
   - The `deploy_pubmed` job then fires the production deploy hook, so new
     publications go live with a fresh deployment.
   - Grant files already invalidate their CloudFront prefix on upload
     (`upload-grants.ts`).

Expected result: at most one render (~3.6 write units) per visited grant per
deployment. A full crawl after a deploy costs roughly $0.50. With a weekly PubMed
deploy plus code deploys, that's ~$2 a cycle in the worst case, against ~$6 now.

PubMed keys aren't branch-scoped, but only production redeploys weekly. Develop and
preview deployments pick up new publications on their next deploy.

## Things to keep in mind

- **Announcements:** none on grant pages today. If one is added later, fetch it
  client-side. Fetching it through `GraphQl.ts` would tag every grant page `cms`, so
  each announcement webhook (`revalidateTag('cms')`) would invalidate all 30k pages.

## Verifying

- After deploying, request the same grant twice and check `x-vercel-cache` (`MISS`,
  then `HIT`). Repeat more than an hour later; it should still be `HIT`, not `STALE`.
  A grant ID that doesn't exist should return 404.
- A day or two later, check usage:
  `vercel metrics vercel.isr_operation.write_units -a sum --scope enovatedesign -p pandemic-pact --prod -s 2d --group-by route`.
  `/grants/[id]` should be roughly flat apart from first-visit renders.
- After the first scheduled PubMed run, check that `fetch_pubmed_data` logs a completed
  CloudFront invalidation, and that `deploy_pubmed` produces a new production deployment.

## Out of scope (separate follow-ups)

- **`/api/og`** (~88 GB, ~80% of Fast Origin Transfer this cycle):
  - Each image is ~820 KB, because the photographic background is rendered to PNG.
  - The route also re-fetches grant JSON through `$VERCEL_URL`. That loops back
    through the rewrite and shows up as the `node` user agent.
  - Options: pre-generate the images during `generate` and upload them to S3, or
    use a lighter background.
- **robots.txt:** the meta-externalagent block (added in `8f546eb5`, 5 Oct) stopped
  that crawler within two days. AhrefsBot, SemrushBot and PetalBot aren't listed yet.
