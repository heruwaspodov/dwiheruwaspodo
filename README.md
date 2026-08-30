# Dwi Heru Budi Waspodo - Personal Portfolio

Welcome to the personal portfolio repository of Dwi Heru Budi Waspodo. This project showcases my professional journey, skills, and projects as a Software Engineer and Tech Lead.

🔗 **Live Website:** [https://dwiheruwaspodo.web.app](https://dwiheruwaspodo.web.app)

## 📌 Overview

This is a multi-route, SEO-friendly portfolio built with Next.js and exported to Firebase Hosting. Content remains managed through **Google Cloud Firestore**, and the browser refreshes the build-time snapshot after hydration.

Key highlights include:
- **Dynamic Content:** All major sections (Bio, Experience, Education, Projects, Skills, Contacts) are fetched dynamically from Firestore.
- **Interactive Elements:** Includes portfolio filters, project detail routes, a developer utility belt, a lazy-loaded Typeform contact form, and a low-poly 3D CRT hero.
- **SEO Optimized:** Fully integrated with Open Graph tags, Twitter Cards, and JSON-LD Schema for maximum discoverability.

## 🛠 Tech Stack

Built with modern web technologies for performance and scalability:

- **Frontend:**
  - **Next.js App Router + TypeScript:** Static route generation, metadata, and client navigation.
  - **React Three Fiber:** Low-poly CRT landing experience with a semantic fallback.
  - **Custom CSS:** Oldish neobrutalist visual system with responsive layouts and reduced-motion support.

- **Backend / Infrastructure:**
  - **Google Firebase:**
    - **Firestore:** NoSQL database for flexible content management.
    - **Hosting:** Serves the exported Next.js routes.
  - **Cloudflare R2:** Stores versioned CV PDFs only; the current public URL remains in Firestore.
  - **GitLab & GitHub:** Code repository and version control.

## 🚀 Features

1.  **Dynamic Portfolio Grid:**
    - Projects are fetched from the `works` collection in Firestore.
    - Includes category filters and a crawlable detail page for every project.
2.  **Developer Utility Belt:**
    - Ruby Hash ↔ JSON, Image ↔ Base64, and URL encode/decode tools run locally in the browser.
    - The tool registry is prepared for additional daily utilities.
3.  **Real-time Data:**
    - Firestore is captured during the production build for crawlable HTML, then refreshed in the browser after hydration.
4.  **Responsive Design:**
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

## CV storage workflow

1. Upload a versioned PDF to the Cloudflare R2 bucket, for example `documents/cv/dwi-heru-cv-2026-08.pdf`.
2. Use a production custom domain for the public R2 URL; do not use `r2.dev` in production.
3. Verify the PDF response and filename.
4. Update `bio/data.cv` in Firestore with the new public URL.
5. Keep the previous object and Firestore value available until production verification passes.

No R2 write credential belongs in this repository or in browser code.

---
*Created by [Dwi Heru Budi Waspodo](https://www.linkedin.com/in/dwiheruwaspodo/).*
