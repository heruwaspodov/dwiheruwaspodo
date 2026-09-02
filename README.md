# Dwi Heru Budi Waspodo - Personal Portfolio

Welcome to the personal portfolio repository of Dwi Heru Budi Waspodo. This project showcases my professional journey, skills, and projects as a Software Engineer and Tech Lead.

🔗 **Live Website:** [https://dwiheruwaspodo.web.app](https://dwiheruwaspodo.web.app)

## 📌 Overview

This is a multi-route, SEO-friendly portfolio built with Next.js and exported to Firebase Hosting. Content remains managed through **Google Cloud Firestore**, with Supabase added for database utilities, Edge Functions, and public storage assets.

Key highlights include:
- **Dynamic Content:** All major sections (Bio, Experience, Education, Projects, Skills, Contacts) are fetched dynamically from Firestore.
- **Interactive Elements:** Includes portfolio filters, project detail routes, a developer utility belt, a lazy-loaded Typeform contact form, and a low-poly 3D CRT hero.
- **SEO Optimized:** Fully integrated with Open Graph tags, Twitter Cards, and JSON-LD Schema for maximum discoverability.

## 🛠 Tech Stack

Built with modern web technologies for performance and scalability:

- **Frontend:**
  - **Next.js App Router + TypeScript:** Static route generation, metadata, and client navigation.
  - **React Three Fiber:** Low-poly CRT landing experience with a semantic fallback.
  - **Scalar API Reference:** Embedded OpenAPI documentation viewer and lightweight request executor with Scalar proxy support.
  - **Custom CSS:** Oldish neobrutalist visual system with responsive layouts and reduced-motion support.

- **Backend / Infrastructure:**
  - **Google Firebase:**
    - **Firestore:** NoSQL database for flexible content management.
    - **Hosting:** Serves the exported Next.js routes.
  - **Supabase:**
    - **Database:** Stores lightweight operational records such as keep-alive checks.
    - **Edge Functions:** Runs server-side utilities, including the keep-alive endpoint called from the homepage.
    - **Storage:** Hosts public assets such as the current CV PDF; the public URL remains referenced from Firestore.
  - **GitLab & GitHub:** Code repository and version control.

## 🚀 Features

1.  **Dynamic Portfolio Grid:**
    - Projects are fetched from the `works` collection in Firestore.
    - Includes category filters and a crawlable detail page for every project.
2.  **Developer Utility Belt:**
    - Ruby Hash ↔ JSON, File ↔ Base64, URL encode/decode, text diff, timestamp, UUID, Ruby compiler, Unicode character counting, OpenAPI documentation viewing, and Scalar proxy request execution tools.
    - The tool registry is prepared for additional daily utilities.
3.  **Real-time Data:**
    - Firestore is captured during the production build for crawlable HTML, then refreshed in the browser after hydration.
4.  **Supabase Keep-alive:**
    - The homepage calls a Supabase Edge Function after hydration, which performs a throttled lightweight database write to keep the Supabase project active.
5.  **Responsive Design:**
    - Desktop and mobile share the same content and identity, with layout and navigation adapted to the available space.

## 📝 Content Management (Firestore)

To update the website content, data is managed in the following Firestore collections:

-   `bio`: Personal information (Name, Role, Domicile, About Me, CV Link, Form URL).
-   `works`: Experience history and Portfolio projects.
-   `educations`: Educational background.
-   `skills`: Technical skills and proficiency levels.
-   `roles`: Service/Role descriptions (e.g., Backend Dev, Tech Lead).
-   `contacts`: Social media links (GitHub, LinkedIn, Instagram, etc.).

## 📦 Run Locally

Clone the project:
```bash
git clone https://gitlab.com/dwiheruwaspodo/dwiheruwaspodo.git
cd dwiheruwaspodo
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview the static export:
```bash
npm start
```

Deploy to Firebase:
```bash
npm run deploy
```

## Supabase workflow

1. Edge Functions live in `supabase/functions/` and are deployed by GitHub Actions when that directory changes.
2. Database schema changes live in `supabase/migrations/` and should be applied with the Supabase CLI before relying on a function that uses the new schema.
3. The `keep-alive` function uses the `keep_alive_checks` table and throttles writes to avoid unnecessary database churn.
4. Upload versioned public assets, such as CV PDFs, to Supabase Storage and update `bio/data.cv` in Firestore with the new public URL.
5. Keep the previous storage object and Firestore value available until production verification passes.

No Supabase service role key, access token, Firebase service account, or other write credential belongs in this repository or in browser code.

---
*Created by [Dwi Heru Budi Waspodo](https://www.linkedin.com/in/dwiheruwaspodo/).*
