# Portfolio Refactor Plan

## 1. Objective

Refactor the existing Vite + static HTML portfolio into a responsive, SEO-friendly Next.js portfolio while preserving the infrastructure that is already working:

- Firebase Hosting remains the production host.
- Cloud Firestore remains the only content database.
- Existing Firebase client configuration remains in use.
- Cloudflare is used only for R2 object storage.
- The first R2 use case is storing versioned PDF CV files.
- Existing Firestore collections and data are migrated only when a schema adjustment is explicitly required.

Implementation must not start until this plan is reviewed and approved.

## 2. Confirmed Architecture

```text
Browser
   |
   v
Firebase Hosting
   |
   +-- Next.js static output
   |     +-- /
   |     +-- /resume/
   |     +-- /portfolio/
   |     +-- /tools/
   |     +-- /contact/
   |
   +-- Firestore client reads
         +-- bio/data
         +-- roles
         +-- works
         +-- educations
         +-- skills
         +-- contacts/data

Cloudflare R2
   +-- documents/cv/dwi-heru-cv-<version>.pdf
         ^
         |
         +-- Public URL stored in Firestore: bio/data.cv
```

Cloudflare will not replace Firebase Hosting, Firestore, or Firebase Realtime Database in this refactor.

## 3. Current-State Findings

- The application is currently Vite with static HTML, CSS, and JavaScript.
- Firebase Hosting deploys the `build` directory.
- The current SPA rewrite sends every route to `index.html`.
- The CV download URL is read from `bio/data.cv` in Firestore.
- When `bio/data.cv` is empty, the current CV link is hidden.
- Firestore public reads are allowed; public writes are disabled except for contact messages.
- Firebase credentials already exist in `assets/js/firebase-init.js` and are client configuration, not privileged service-account credentials.
- Current Firestore collections must remain compatible:
  - `bio`
  - `roles`
  - `works`
  - `educations`
  - `skills`
  - `contacts`
- Company logos and permanent UI assets should remain in the repository. They do not need R2.

## 4. Technology Decisions

### Application

- Next.js App Router
- TypeScript
- React Server Components for static, crawlable page content
- Client Components only for interaction, Firestore live refresh, Three.js, animation, filters, and developer tools
- Next.js static export because hosting remains Firebase Hosting

### Data

- Firestore remains the source of truth.
- No Supabase dependency.
- No D1 database.
- No content duplication into R2.
- A single typed Firestore adapter will map existing documents into UI models.

### Storage

- Cloudflare R2 stores downloadable/editable assets such as CV versions.
- R2 credentials must never be exposed in browser code or committed to Git.
- Initial CV uploads are performed through the Cloudflare dashboard or a local authenticated CLI workflow.
- Building a browser-based upload admin requires a secure server endpoint and is out of scope for the initial refactor.

### Hosting

- Keep the existing Firebase project, domain, hosting target, Firestore, and deployment flow.
- Deploy the Next.js static output directory instead of the current Vite output.
- Do not introduce Cloudflare Workers into the application runtime.

## 5. Proposed Route Structure

```text
app/
├── layout.tsx
├── page.tsx
├── resume/
│   └── page.tsx
├── portfolio/
│   ├── page.tsx
│   └── [slug]/
│       └── page.tsx
├── tools/
│   └── page.tsx
├── contact/
│   └── page.tsx
├── sitemap.ts
├── robots.ts
├── manifest.ts
└── opengraph-image.tsx

components/
├── layout/
├── landing/
├── resume/
├── portfolio/
├── tools/
├── contact/
└── three/

lib/
├── firebase/
│   ├── config.ts
│   ├── client.ts
│   ├── queries.ts
│   ├── mappers.ts
│   └── types.ts
├── seo/
└── utils/

public/
├── assets/
├── companies/
└── three/
```

The exact directory split may be simplified during implementation, but route boundaries and data ownership must stay intact.

## 6. Firestore Integration Strategy

### Existing schema preservation

The first implementation must consume the current schema without renaming collections or documents.

Expected mappings:

| Firestore source | Application use |
| --- | --- |
| `bio/data` | name, role, location, about text, CV URL, Typeform URL |
| `roles` | What I Do cards |
| `works` | experience timeline and portfolio projects |
| `educations` | resume education tab |
| `skills` | resume skill groups |
| `contacts/data` | email, phone, social links, GitHub username |

### Build-time SEO data

Because Firebase Hosting is static, important Firestore content must be fetched during `next build` and rendered into HTML.

- Use public Firestore reads with the existing Firebase client configuration.
- Build output must contain meaningful About, Resume, and Portfolio text before JavaScript runs.
- If Firestore is temporarily unavailable during build, fail the production build instead of deploying empty SEO pages.
- Client-side Firestore reads may refresh content after hydration so visitors can see newer data before the next deployment.
- Client refresh must not erase the server-rendered content while loading.

This provides crawlable HTML while keeping Firestore as the single source of truth. Firestore changes become immediately visible through client refresh; the static SEO snapshot is refreshed on the next deployment.

### Security

- Keep Firebase client configuration public as intended by Firebase.
- Do not add `serviceAccount.json` to Git.
- Do not widen Firestore write access.
- Reassess the public `messages` creation rule separately because spam protection is outside this refactor.

## 7. Cloudflare R2 CV Plan

### Bucket structure

```text
portfolio-assets/
└── documents/
    └── cv/
        ├── dwi-heru-cv-2026-08.pdf
        ├── dwi-heru-cv-2026-11.pdf
        └── dwi-heru-cv-2027-02.pdf
```

### Public delivery

- Connect the bucket to a production custom domain, for example `assets.<portfolio-domain>`.
- Do not use an `r2.dev` URL for production.
- Serve PDFs with `Content-Type: application/pdf`.
- Prefer versioned object names to prevent stale CDN and browser caches.
- Set an appropriate `Content-Disposition` filename for downloads.
- The bucket must not expose directory listing behavior.

### Update workflow

1. Export the latest CV as PDF.
2. Upload it to a new versioned R2 key.
3. Verify the public custom-domain URL.
4. Update `bio/data.cv` in Firestore with the new URL.
5. Verify the CV button on desktop and mobile.
6. Keep the previous version temporarily for rollback.

The website continues to read the CV URL from Firestore. It does not need R2 access keys, an R2 SDK, or a Cloudflare runtime binding.

### Rollback

- Restore the previous `bio/data.cv` value in Firestore.
- Do not delete the previous CV until the new version has been verified in production.

## 8. Firebase Hosting Changes

The refactor will keep Firebase Hosting but change it from an SPA deployment to a multi-route static export.

Planned changes:

- Configure Next.js with static export.
- Prefer trailing-slash routes so Firebase can serve route directories predictably.
- Point `firebase.json` hosting `public` to the Next.js export directory.
- Remove the catch-all rewrite to `/index.html`; it would hide real route-level HTML from crawlers.
- Preserve cache headers for hashed JavaScript, CSS, images, fonts, and 3D assets.
- Do not apply immutable caching to HTML documents.
- Preserve correct content types for `robots.txt` and `sitemap.xml`.
- Add a generated static 404 page.

Deployment remains conceptually:

```text
npm run build
firebase deploy --only hosting
```

## 9. SEO Requirements

Every public page must work and contain meaningful content with JavaScript disabled.

### Page metadata

- Unique title and description per route.
- Canonical URL per route.
- Open Graph and Twitter metadata.
- Stable social-share image.
- Correct Indonesian or English language declaration based on final copy.

### Crawlability

- Real links between routes; navigation must not depend only on button state.
- Generated `sitemap.xml` containing all public routes and portfolio detail routes.
- Generated `robots.txt` allowing public routes and excluding any future admin route.
- Semantic heading hierarchy with one clear `h1` per page.
- Descriptive alt text for meaningful images and empty alt text for decoration.

### Structured data

- `Person` for Dwi Heru Budi Waspodo.
- `WebSite` for the portfolio.
- `ProfilePage` for the landing/About page.
- `CreativeWork` or `SoftwareSourceCode` for relevant portfolio detail pages.
- CV download URL must be represented as a normal crawlable link.

### Performance and animation

- Render text and navigation before loading the CRT/Three.js experience.
- Lazy-load Three.js below the critical content boundary.
- Provide a static poster/fallback when WebGL is unavailable.
- Respect `prefers-reduced-motion`.
- Avoid loading the Typeform iframe until the contact panel is requested or enters the viewport.
- Reserve image and canvas dimensions to prevent layout shift.
- Optimize the hero for mobile without serving a second content structure.

## 10. Design Implementation Scope

The implementation should follow the approved visual direction:

- Oldish neobrutalism.
- Sparse game-inspired presentation rather than a literal game UI.
- Low-poly CRT workstation as the landing focal point.
- Same information architecture on desktop and mobile; only layout changes.
- Desktop hero: copy on the left, CRT workstation on the right.
- Mobile hero: same content stacked with the CRT kept prominent.
- Navigation: About, Resume, Portfolio, Dev Tools, Contact.
- Resume based on a clean chronological experience log.
- Portfolio remains the dedicated place for project cards and details.
- Landing page uses Git activity instead of duplicating selected projects.
- Company section uses supplied official logo assets.
- Contact keeps Typeform but does not show a raw full-height white iframe by default.

## 11. Implementation Phases

### Phase 0 — Baseline and safety

- Record current routes, Firestore mappings, deployment settings, and production screenshots.
- Run the existing production build.
- Preserve the current implementation until the Next.js version reaches parity.
- Confirm that no secret or service-account file is committed.

### Phase 1 — Next.js foundation

- Replace the Vite entry structure with Next.js App Router and TypeScript.
- Create shared layout, navigation, typography, color tokens, and responsive container primitives.
- Configure static export for Firebase Hosting.
- Keep animation and Three.js out of the initial critical path.

### Phase 2 — Firestore data layer

- Move Firebase configuration into typed modules.
- Implement typed queries and mapping for all existing collections.
- Render Firestore data during build.
- Add client refresh without destructive loading states.
- Add explicit empty and error states.

### Phase 3 — Public pages

- Implement About/Landing.
- Implement Resume.
- Implement Portfolio and statically generated project detail routes.
- Implement Dev Tools registry with room for upcoming tools.
- Implement Contact and lazy Typeform loading.

### Phase 4 — R2 CV storage

- Create or configure the R2 bucket.
- Connect a production custom domain.
- Upload a versioned CV PDF.
- Update `bio/data.cv` in Firestore.
- Verify headers, download behavior, and rollback.

No Cloudflare account changes should be made without explicit authorization during execution.

### Phase 5 — SEO and performance

- Add route metadata, canonical URLs, OG/Twitter images, sitemap, robots, and JSON-LD.
- Add the WebGL fallback.
- Verify no core content depends on client rendering.
- Validate responsive behavior and reduced motion.
- Run Lighthouse and inspect generated HTML.

### Phase 6 — Firebase deployment

- Update Firebase Hosting output and route handling.
- Build locally.
- Test the exported site using a static server.
- Deploy to a preview channel first when available.
- Verify production routes, Firestore reads, CV download, Typeform, and metadata.
- Promote only after acceptance checks pass.

## 12. Verification Checklist

### Build

- `npm run build` completes without warnings that affect runtime or SEO.
- All expected route HTML files exist in the export output.
- No Cloudflare or Firebase secret is included in the client bundle.

### Data

- Bio, roles, experience, education, skills, projects, and contacts match current Firestore data.
- Firestore document order is deterministic.
- Missing optional fields do not break rendering.
- CV link reads only from `bio/data.cv`.

### R2

- CV URL uses the production custom domain.
- PDF opens and downloads correctly.
- Response has the correct content type and filename.
- Previous CV remains available for rollback during verification.

### SEO

- Home, Resume, Portfolio, Tools, and Contact return distinct HTML documents.
- Titles, descriptions, canonical URLs, and social metadata are correct.
- Sitemap and robots files are reachable.
- JSON-LD validates.
- Essential page content is present with JavaScript disabled.
- Portfolio detail routes can be crawled directly.

### UX

- Desktop and mobile use the same content hierarchy.
- Navigation works with direct URLs, refreshes, keyboard input, and browser history.
- CRT/Three.js failure does not hide or block the introduction.
- Reduced-motion mode removes nonessential motion.
- CV and contact actions remain usable on small screens.

## 13. Rollback Plan

- Keep the current deployable implementation in Git history until the new version is accepted.
- Do not delete current Firestore fields or collections during the refactor.
- Restore the previous Firebase Hosting release if route or rendering regressions occur.
- Restore the previous Firestore `bio/data.cv` URL if the R2 CV has delivery issues.
- Keep the previous CV object during the rollout window.

## 14. Explicit Non-Goals

- Replacing Firebase Hosting with Cloudflare.
- Migrating Firestore data to D1, Supabase, or another database.
- Adding Cloudflare Workers to the application runtime.
- Building a full CMS in the first refactor.
- Exposing R2 write credentials to the browser.
- Editing PDF contents directly inside the website.
- Replacing Typeform.
- Changing Firestore collection names without a separate migration plan.

## 15. Approval Gates

Execution should stop for confirmation before any of these actions:

1. Replacing the existing Vite structure with Next.js.
2. Creating an R2 bucket or custom domain.
3. Updating the production Firestore CV URL.
4. Changing Firebase Hosting route behavior.
5. Deploying to Firebase Hosting.

The next approved action after this document should be Phase 0 only: baseline inspection, dependency decision, and a non-deployed Next.js migration scaffold.

## 16. Execution Status — 2026-08-29

- [x] Baseline, current Firestore schema, assets, and rollback path recorded.
- [x] Next.js App Router, TypeScript, static export, and responsive design foundation implemented.
- [x] Existing Firestore schema mapped through one typed REST adapter with build-time rendering and client refresh.
- [x] About, Resume, Portfolio, project details, Dev Tools, and Contact implemented.
- [x] Route metadata, canonical URLs, Open Graph, Twitter metadata, JSON-LD, sitemap, robots, manifest, and static 404 implemented.
- [x] Firebase Hosting configured for the `out` directory without an SPA catch-all rewrite.
- [x] Desktop and mobile behavior smoke-tested from the production static export.
- [x] Lint, TypeScript, production build, and production dependency audit passed.
- [ ] Cloudflare R2 bucket/domain creation, CV upload, and Firestore CV URL update — intentionally pending explicit account authorization and R2 details.
- [ ] Firebase preview/production deployment — intentionally pending explicit deployment authorization.
