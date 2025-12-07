# Dwi Heru Budi Waspodo - Personal Portfolio

Welcome to the personal portfolio repository of Dwi Heru Budi Waspodo. This project showcases my professional journey, skills, and projects as a Software Engineer and Tech Lead.

🔗 **Live Website:** [https://dwiheruwaspodo.web.app](https://dwiheruwaspodo.web.app)

## 📌 Overview

This is a dynamic, single-page portfolio website designed to be modern, responsive, and easy to manage. Unlike traditional static portfolios, the content here allows direct management through **Google Cloud Firestore**, enabling real-time updates without redeploying the code.

Key highlights include:
- **Dynamic Content:** All major sections (Bio, Experience, Education, Projects, Skills, Contacts) are fetched dynamically from Firestore.
- **Interactive Elements:** Includes a built-in Ruby Compiler (OneCompiler), Typeform integration, and expandable project details.
- **SEO Optimized:** Fully integrated with Open Graph tags, Twitter Cards, and JSON-LD Schema for maximum discoverability.

## 🛠 Tech Stack

Built with modern web technologies for performance and scalability:

- **Frontend:**
  - **HTML5 & Vanilla CSS3:** For semantic structure and custom, high-performance styling.
  - **JavaScript (ES6+):** For logic, DOM manipulation, and API interactions.
  - **Vite:** Next-generation frontend tooling for fast builds and development.

- **Backend / Infrastructure:**
  - **Google Firebase:**
    - **Firestore:** NoSQL database for flexible content management.
    - **Hosting:** Fast and secure global hosting.
  - **GitLab & GitHub:** Code repository and version control.

## 🚀 Features

1.  **Dynamic Portfolio Grid:**
    - Projects are fetched from the `works` collection in Firestore.
    - Includes logic to filter by category (Role) and display details in a modal popup.
2.  **Integrated Ruby Compiler:**
    - A dedicated section for showcasing or testing Ruby code directly within the browser using OneCompiler embed.
3.  **Real-time Data:**
    - Updates to your bio, job history, or contact info in Firestore reflect immediately on the site.
4.  **Responsive Design:**
    - Optimized for all devices, from mobile phones to large desktop screens, with a custom sidebar navigation system.

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

Deploy to Firebase:
```bash
npm run deploy
```

---
*Created by [Dwi Heru Budi Waspodo](https://www.linkedin.com/in/dwiheruwaspodo/).*
