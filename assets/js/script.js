import {
  database,
  ref,
  push,
  firestore,
  doc,
  getDoc,
  collection,
  getDocs,
} from "./firebase-init.js";

("use strict");

/**
 * ------------------------------------------------------------------------
 *  DATA LOADING FUNCTIONS
 * ------------------------------------------------------------------------
 */

async function loadBio() {
  try {
    const bioDocRef = doc(firestore, "bio", "data");
    const bioSnap = await getDoc(bioDocRef);

    if (bioSnap.exists()) {
      const bioData = bioSnap.data();

      // Update Name
      const nameElem = document.querySelector(".name");
      if (nameElem) {
        nameElem.textContent = bioData.name;
        nameElem.title = bioData.name;
      }

      // Update Role/Title
      const titleElem = document.querySelector(".title");
      if (titleElem) titleElem.textContent = bioData.role;

      // Update Location (Domicile + Country)
      const locationElem = document.querySelector("address");
      if (locationElem && bioData.domicile && bioData.country) {
        locationElem.textContent = `${bioData.domicile}, ${bioData.country}`;
      } else if (locationElem && bioData.country) {
        locationElem.textContent = bioData.country;
      }

      // Update About Text
      const aboutTextP = document.querySelector(".about-text p");
      if (aboutTextP) aboutTextP.textContent = bioData.aboutme;

      // Update CV
      const cvLink = document.querySelector("[data-contact-cv]");
      if (cvLink) {
        if (bioData.cv) {
          cvLink.href = bioData.cv;
          // Ensure it's visible (closest li)
          cvLink.parentElement.parentElement.style.display = "flex";
        } else {
          // Hide if no CV
          cvLink.parentElement.parentElement.style.display = "none";
        }
      }

      // Update Typeform
      const formContainer = document.querySelector("[data-typeform-container]");
      if (formContainer && bioData.form) {
        // Use embed URL, ensure it spans the container
        formContainer.innerHTML = `<iframe id="typeform-full" width="100%" height="100%" frameborder="0" allow="camera; microphone; autoplay; encrypted-media;" src="${bioData.form}"></iframe>`;
        // Optional: Import Typeform script if needed for advanced embedding, but iframe is safer for raw links
      } else if (formContainer) {
        formContainer.innerHTML = "<p style='padding: 20px;'>Contact form not configured.</p>";
      }
    }
  } catch (error) {
    console.error("Error loading Bio:", error);
    checkPermissionError(error);
  }
}

async function loadRoles() {
  try {
    const serviceList = document.querySelector(".service-list");
    if (!serviceList) return;

    const rolesSnap = await getDocs(collection(firestore, "roles"));
    if (!rolesSnap.empty) {
      serviceList.innerHTML = ""; // Clear hardcoded/loading content
      const icons = [
        "./assets/images/icon-app.svg",
        "./assets/images/icon-photo.svg",
        "./assets/images/icon-dev.svg",
        "./assets/images/icon-design.svg",
      ];

      let i = 0;
      rolesSnap.forEach((doc) => {
        const data = doc.data();
        const iconSrc = icons[i % icons.length];
        i++;

        const li = document.createElement("li");
        li.className = "service-item";

        li.innerHTML = `
            <div class="service-icon-box">
              <img src="${iconSrc}" alt="icon" width="40">
            </div>
            <div class="service-content-box">
              <h4 class="h4 service-item-title">${data.role || "Service"}</h4>
              <p class="service-item-text">
                ${data.description || ""}
              </p>
            </div>
          `;

        serviceList.appendChild(li);
      });
    }
  } catch (error) {
    console.error("Error loading Roles:", error);
  }
}

async function loadContacts() {
  try {
    const contactsDocRef = doc(firestore, "contacts", "data");
    const contactsSnap = await getDoc(contactsDocRef);

    if (contactsSnap.exists()) {
      const contactsData = contactsSnap.data();

      // Email
      const emailLink = document.querySelector("[data-contact-email]");
      if (emailLink) {
        emailLink.href = `mailto:${contactsData.email}`;
        emailLink.textContent = contactsData.email;
      }

      // Phone
      const phoneLink = document.querySelector("[data-contact-phone]");
      if (phoneLink) {
        // Simple regex to check if it contains digits
        if (contactsData.phone && /[0-9]/.test(contactsData.phone)) {
          phoneLink.href = `tel:${contactsData.phone}`;
        } else {
          phoneLink.href = "#";
          phoneLink.style.pointerEvents = "none";
        }
        phoneLink.textContent = contactsData.phone;
      }

      // Social Media List
      const socialList = document.querySelector(".social-list");
      if (socialList) {
        socialList.innerHTML = ""; // Clear existing

        const socialMapping = [
          { key: "github", icon: "logo-github" },
          { key: "facebook", icon: "logo-facebook" },
          { key: "twitter", icon: "logo-twitter" },
          { key: "instagram", icon: "logo-instagram" },
          { key: "linkedin", icon: "logo-linkedin" },
          { key: "gitlab", icon: "logo-gitlab" },
          { key: "repo", icon: "logo-gitlab" },
          { key: "web_1", icon: "globe-outline" },
        ];

        socialMapping.forEach((item) => {
          if (contactsData[item.key]) {
            const li = document.createElement("li");
            li.className = "social-item";

            const a = document.createElement("a");
            a.href = contactsData[item.key];
            a.className = "social-link";
            a.target = "_blank";

            const icon = document.createElement("ion-icon");
            icon.name = item.icon;

            a.appendChild(icon);
            li.appendChild(a);
            socialList.appendChild(li);
          }
        });
      }
    }
  } catch (error) {
    console.error("Error loading Contacts:", error);
  }
}

function checkPermissionError(error) {
  if (error.code === "permission-denied") {
    console.warn(
      "PERMISSION DENIED: Please update your Firestore Security Rules.",
    );
  }
}

async function loadExperience() {
  try {
    const experienceList = document.querySelector("[data-experience-list]");
    if (!experienceList) return;

    const worksSnap = await getDocs(collection(firestore, "works"));
    if (!worksSnap.empty) {
      experienceList.innerHTML = "";

      let worksData = [];
      worksSnap.forEach((doc) => {
        worksData.push({ id: doc.id, ...doc.data() });
      });

      // Helper to format Firestore timestamp to "Month Year"
      const formatDate = (timestamp) => {
        if (!timestamp) return null;
        let date;
        // Handle Firestore Timestamp (has .toDate())
        if (timestamp.toDate && typeof timestamp.toDate === "function") {
          date = timestamp.toDate();
        } else {
          // Handle string or Date object
          date = new Date(timestamp);
        }

        if (isNaN(date.getTime())) return "";

        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        });
      };

      // Sort: Mekari first, then descending by date_start
      worksData.sort((a, b) => {
        // Safe check for company/title string existence
        const companyA = a.company ? String(a.company).toLowerCase() : "";
        const titleA = a.title ? String(a.title).toLowerCase() : "";
        const isMekariA =
          companyA.includes("mekari") || titleA.includes("mekari");

        const companyB = b.company ? String(b.company).toLowerCase() : "";
        const titleB = b.title ? String(b.title).toLowerCase() : "";
        const isMekariB =
          companyB.includes("mekari") || titleB.includes("mekari");

        if (isMekariA && !isMekariB) return -1;
        if (!isMekariA && isMekariB) return 1;

        // Descending sort by date_start
        const getSeconds = (val) => {
          if (!val) return 0;
          if (val.seconds) return val.seconds; // Firestore Timestamp
          return new Date(val).getTime() / 1000;
        };

        return getSeconds(b.date_start) - getSeconds(a.date_start);
      });

      worksData.forEach((work) => {
        const li = document.createElement("li");
        li.className = "timeline-item";

        // Construct period string from date_start and date_end
        let period = "";
        const startStr = formatDate(work.date_start);
        // If date_end is null/undefined, it means "Present"
        const endStr = work.date_end ? formatDate(work.date_end) : "Present";

        if (startStr) {
          period = `${startStr} — ${endStr}`;
        } else {
          // Fallback for legacy fields
          period = work.period || work.year || "";
        }

        li.innerHTML = `
          <h4 class="h4 timeline-item-title">${work.title || work.role || "Job Title"}</h4>
          ${work.company ? `<span style="display:block; font-weight:500; color: var(--orange-yellow-crayola); margin-bottom: 4px;">${work.company}</span>` : ""}
          <span style="display:block; font-size: 14px; color: var(--light-gray); margin-bottom: 10px;">${period}</span>
          <p class="timeline-text">
            ${work.description || ""}
          </p>
        `;
        experienceList.appendChild(li);
      });
    }
  } catch (error) {
    console.error("Error loading Experience:", error);
  }
}

async function loadEducation() {
  try {
    const educationList = document.querySelector("[data-education-list]");
    if (!educationList) return;

    const eduSnap = await getDocs(collection(firestore, "educations"));
    if (!eduSnap.empty) {
      educationList.innerHTML = "";

      let eduData = [];
      eduSnap.forEach((doc) => {
        eduData.push({ id: doc.id, ...doc.data() });
      });

      // Sort desc by date if possible
      eduData.sort((a, b) => {
        const dateA = a.startDate || a.year || a.period || "";
        const dateB = b.startDate || b.year || b.period || "";

        if (dateA > dateB) return -1;
        if (dateA < dateB) return 1;
        return 0;
      });

      eduData.forEach((edu) => {
        const li = document.createElement("li");
        li.className = "timeline-item";

        let period = "";
        if (edu.startDate && edu.endDate) {
          period = `${edu.startDate} — ${edu.endDate}`;
        } else if (edu.period) {
          period = edu.period;
        } else if (edu.year) {
          period = edu.year;
        }

        li.innerHTML = `
          <h4 class="h4 timeline-item-title">${edu.institution || edu.school || "School"}</h4>
          <span>${period}</span>
          <p class="timeline-text">
            ${edu.description || edu.degree || ""}
          </p>
        `;
        educationList.appendChild(li);
      });
    }
  } catch (error) {
    console.error("Error loading Education:", error);
  }
}

async function loadSkills() {
  try {
    const skillsList = document.querySelector("[data-skills-list]");
    if (!skillsList) return;

    const skillsSnap = await getDocs(collection(firestore, "skills"));
    if (!skillsSnap.empty) {
      skillsList.innerHTML = "";

      let skillsData = [];
      skillsSnap.forEach((doc) => {
        skillsData.push({ id: doc.id, ...doc.data() });
      });

      // Sort Descending by Strength
      skillsData.sort((a, b) => (b.strength || 0) - (a.strength || 0));

      skillsData.forEach((item) => {
        const strength = item.strength || 0;
        const percentage = strength * 10; // Convert 1-10 scale to 0-100%
        const name = item.skill || "Skill";

        const li = document.createElement("li");
        li.className = "skills-item";

        li.innerHTML = `
          <div class="title-wrapper">
            <h5 class="h5">${name}</h5>
            <data value="${percentage}">${percentage}%</data>
          </div>

          <div class="skill-progress-bg">
            <div class="skill-progress-fill" style="width: ${percentage}%"></div>
          </div>
        `;

        skillsList.appendChild(li);
      });
    }
  } catch (error) {
    console.error("Error loading Skills:", error);
  }
}

async function loadActivity() {
  try {
    const activityList = document.querySelector("[data-activity-list]");
    if (!activityList) return;

    // Update Section Title
    const titleElem = document.querySelector(".testimonials-title");
    if (titleElem) titleElem.innerHTML = "Projects";

    const contactsDocRef = doc(firestore, "contacts", "data");
    const contactsSnap = await getDoc(contactsDocRef);
    let githubUsername = "";

    // Get GitHub username from Firestore
    if (contactsSnap.exists()) {
      const data = contactsSnap.data();
      if (data.github) {
        const urlPart = data.github.split("/").filter(Boolean);
        githubUsername = urlPart[urlPart.length - 1];
      }
    }

    const gitlabUsername = "dwiheruwaspodo"; // Explicitly requested
    const allProjects = [];

    // --- 1. Fetch GitHub Repos ---
    if (githubUsername) {
      try {
        // Fetch sort by updated, 10 items
        const ghRes = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=10`);
        if (ghRes.ok) {
          const ghRepos = await ghRes.json();
          ghRepos.forEach(repo => {
            if (!repo.fork) { // Optional: Filter out forks if desired, or keep them. Let's keep them but maybe prefer sources.
              allProjects.push({
                source: "GitHub",
                icon: "logo-github",
                name: repo.name,
                url: repo.html_url,
                description: repo.description,
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                updatedAt: new Date(repo.updated_at),
                language: repo.language // Main language
              });
            }
          });
        }
      } catch (e) { console.error("GitHub repos fetch error", e); }
    }

    // --- 2. Fetch GitLab Repos ---
    if (gitlabUsername) {
      try {
        const userRes = await fetch(`https://gitlab.com/api/v4/users?username=${gitlabUsername}`);
        if (userRes.ok) {
          const users = await userRes.json();
          if (users.length > 0) {
            const userId = users[0].id;
            const glRes = await fetch(`https://gitlab.com/api/v4/users/${userId}/projects?order_by=last_activity_at&sort=desc&per_page=10&visibility=public`);
            if (glRes.ok) {
              const glRepos = await glRes.json();
              glRepos.forEach(repo => {
                allProjects.push({
                  source: "GitLab",
                  icon: "logo-gitlab",
                  name: repo.name,
                  url: repo.web_url,
                  description: repo.description,
                  stars: repo.star_count,
                  forks: repo.forks_count,
                  updatedAt: new Date(repo.last_activity_at),
                  language: null // GitLab doesn't provide easily in summary
                });
              });
            }
          }
        }
      } catch (e) { console.error("GitLab repos fetch error", e); }
    }

    // --- 3. Merge, Sort & Render ---
    activityList.innerHTML = "";

    // Sort by Updated Date Descending
    allProjects.sort((a, b) => b.updatedAt - a.updatedAt);

    if (allProjects.length === 0) {
      activityList.innerHTML = `<li class="testimonials-item"><p style="color:var(--light-gray); padding:20px;">No projects found.</p></li>`;
      return;
    }

    allProjects.forEach(project => {
      const dateStr = project.updatedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

      const li = document.createElement("li");
      li.className = "testimonials-item";

      li.innerHTML = `
          <div class="content-card" style="height: 100%; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start; min-width: 300px; padding: 20px;" data-testimonials-item>
            
            <div style="width: 100%;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 10px;">
                    <h4 class="h4 testimonials-item-title" style="font-size: 16px; font-weight: 600; margin:0; word-break:break-all; padding-right:10px;">
                       <a href="${project.url}" target="_blank" style="color:var(--orange-yellow-crayola);">${project.name}</a>
                    </h4>
                    <ion-icon name="${project.icon}" style="font-size: 20px; color: var(--light-gray); flex-shrink:0;"></ion-icon>
                </div>

                <p class="testimonials-text" style="font-size: 14px; margin-bottom: 15px; line-height: 1.5; color: var(--light-gray);">
                  ${project.description || "No description provided."}
                </p>
            </div>

            <div style="display: flex; gap: 15px; align-items: center; font-size: 12px; color: var(--light-gray-70); width: 100%; margin-top: auto;">
               <!-- Language (GitHub only mostly) -->
               ${project.language ? `
               <div style="display:flex; align-items:center; gap:4px;">
                  <span style="width:8px; height:8px; border-radius:50%; background:var(--vegas-gold);"></span>
                  <span>${project.language}</span>
               </div>
               ` : ''}

               <!-- Stars -->
               ${project.stars > 0 ? `
               <div style="display:flex; align-items:center; gap:4px;">
                  <ion-icon name="star-outline"></ion-icon>
                  <span>${project.stars}</span>
               </div>
               ` : ''}

               <!-- Updated -->
               <div style="margin-left: auto;">
                 ${dateStr}
               </div>
            </div>
          </div>
        `;
      activityList.appendChild(li);
    });

  } catch (error) {
    console.error("Error loading Projects:", error);
  }
}

async function loadPortfolio() {
  try {
    const projectList = document.querySelector("[data-project-list]");
    if (!projectList) return;

    // Modal Elements
    const modalContainer = document.querySelector("[data-modal-container]");
    const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
    const modalOverlay = document.querySelector("[data-modal-overlay]");

    // Modal Content Elements
    const modalTitle = document.querySelector("[data-modal-title]");
    const modalCategory = document.querySelector("[data-modal-category]");
    const modalText = document.querySelector("[data-modal-text]");
    const modalImg = document.querySelector("[data-modal-img]");
    const modalImgWrapper = document.querySelector("[data-modal-img-wrapper]");

    // Close Modal Function
    const closeModal = () => {
      if (modalContainer) modalContainer.classList.remove("active");
      if (modalOverlay) modalOverlay.classList.remove("active");
    };

    // Add Close Listeners (check if already added to avoid dupes if re-run, but initApp runs once)
    if (modalCloseBtn) modalCloseBtn.onclick = closeModal;
    if (modalOverlay) modalOverlay.onclick = closeModal;


    const worksSnap = await getDocs(collection(firestore, "works"));
    const allProjects = [];

    worksSnap.forEach((doc) => {
      const data = doc.data();
      if (data.projects && Array.isArray(data.projects)) {
        data.projects.forEach(proj => {
          allProjects.push({
            ...proj,
            companyLogo: data.logo // Use company logo as fallback
          });
        });
      }
    });

    // 1. Render Projects
    projectList.innerHTML = "";
    const uniqueCategories = new Set(["all"]); // Use lowercase for logic, but display original? Let's use lowercase for ID/matching.

    allProjects.forEach(proj => {
      const category = (proj.role || "project").toLowerCase();
      uniqueCategories.add(category);

      const li = document.createElement("li");
      li.className = "project-item active"; // Default active
      li.setAttribute("data-filter-item", "");
      li.setAttribute("data-category", category);

      // Image logic: proj.image -> companyLogo -> default placeholder
      const imgSrc = proj.image || proj.companyLogo || "./assets/images/project-1.jpg";

      li.innerHTML = `
          <a href="#">
            <figure class="project-img">
              <div class="project-item-icon-box">
                <ion-icon name="eye-outline"></ion-icon>
              </div>
              <img src="${imgSrc}" alt="${proj.name}" loading="lazy">
            </figure>
            <h3 class="project-title">${proj.name}</h3>
            <p class="project-category">${proj.role || "Project"}</p>
          </a>
        `;

      // Add Click Event for Modal
      li.querySelector("a").addEventListener("click", (e) => {
        e.preventDefault();

        // Populate Modal
        if (modalTitle) modalTitle.textContent = proj.name;
        if (modalCategory) modalCategory.textContent = proj.role || "Project";
        if (modalText) modalText.innerHTML = proj.desc ? `<p>${proj.desc}</p>` : "<p>No description available.</p>"; // Allow HTML in desc if needed, or textContent

        if (modalImg && imgSrc) {
          modalImg.src = imgSrc;
          modalImg.alt = proj.name;
          if (modalImgWrapper) modalImgWrapper.style.display = "block";
        } else {
          if (modalImgWrapper) modalImgWrapper.style.display = "none";
        }

        // Show Modal
        if (modalContainer) modalContainer.classList.add("active");
        if (modalOverlay) modalOverlay.classList.add("active");
      });

      projectList.appendChild(li);
    });

    // 2. Render Filters (Dynamic)
    const filterList = document.querySelector(".filter-list");
    const selectList = document.querySelector(".select-list");
    const selectValue = document.querySelector("[data-selecct-value]");
    const select = document.querySelector("[data-select]");

    if (filterList && selectList) {
      filterList.innerHTML = "";
      selectList.innerHTML = "";

      uniqueCategories.forEach(cat => {
        const displayCat = cat.charAt(0).toUpperCase() + cat.slice(1); // Capitalize

        // Desktop Filter Button
        const filterItem = document.createElement("li");
        filterItem.className = "filter-item";
        const filterBtn = document.createElement("button");
        filterBtn.innerText = displayCat === "All" ? "All" : displayCat; // "All" is already capitalized
        filterBtn.setAttribute("data-filter-btn", "");
        if (cat === "all") filterBtn.classList.add("active");

        filterBtn.addEventListener("click", function () {
          // Handle active class for buttons
          const allBtns = document.querySelectorAll("[data-filter-btn]");
          allBtns.forEach(btn => btn.classList.remove("active"));
          this.classList.add("active");

          // Filter
          filterFunc(cat);
        });

        filterItem.appendChild(filterBtn);
        filterList.appendChild(filterItem);

        // Mobile Select Item
        const selectItem = document.createElement("li");
        selectItem.className = "select-item";
        const selectBtn = document.createElement("button");
        selectBtn.innerText = displayCat;
        selectBtn.setAttribute("data-select-item", "");

        selectBtn.addEventListener("click", function () {
          if (selectValue) selectValue.innerText = this.innerText;
          if (select) elementToggleFunc(select);
          filterFunc(cat);
        });

        selectItem.appendChild(selectBtn);
        selectList.appendChild(selectItem);
      });
    }

  } catch (error) {
    console.error("Error loading Portfolio:", error);
  }
}

async function loadCompanies() {
  try {
    const clientsList = document.querySelector("[data-clients-list]");
    if (!clientsList) return;

    const worksSnap = await getDocs(collection(firestore, "works"));
    const companies = [];
    const seenCompanies = new Set();

    worksSnap.forEach((doc) => {
      const data = doc.data();
      // Normalize company name to avoid duplicates
      const companyName = data.company ? data.company.trim() : "";

      if (data.logo && companyName && !seenCompanies.has(companyName)) {
        companies.push(data);
        seenCompanies.add(companyName);
      }
    });

    if (companies.length === 0) {
      // Optional: Hide section or show message? User just said "nampilin logo".
      // Leave empty if no logos.
      return;
    }

    clientsList.innerHTML = "";

    companies.forEach(comp => {
      const li = document.createElement("li");
      li.className = "clients-item";

      // Use company URL if available, else #
      const linkUrl = comp.url || comp.website || "#";
      const isClickable = linkUrl !== "#";

      li.innerHTML = `
          <a href="${linkUrl}" ${isClickable ? 'target="_blank"' : 'style="pointer-events: none; cursor: default;"'}>
            <img src="${comp.logo}" alt="${comp.company} logo" style="max-height: 50px; width: auto; /* Ensure reasonable size */">
          </a>
        `;
      clientsList.appendChild(li);
    });

  } catch (error) {
    console.error("Error loading companies:", error);
  }
}

// Master init function
async function initApp() {
  await Promise.all([
    loadBio(),
    loadRoles(),
    loadContacts(),
    loadExperience(),
    loadEducation(),
    loadSkills(),
    loadActivity(),
    loadCompanies(),
    loadPortfolio() // Added
  ]);
}

// Start Data Loading
initApp();

/**
 * ------------------------------------------------------------------------
 *  UI INTERACTION LOGIC
 * ------------------------------------------------------------------------
 */

// element toggle function
const elementToggleFunc = function (elem) {
  elem.classList.toggle("active");
};

// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
if (sidebarBtn) {
  sidebarBtn.addEventListener("click", function () {
    elementToggleFunc(sidebar);
  });
}



// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

if (select) {
  select.addEventListener("click", function () {
    elementToggleFunc(this);
  });
}

// add event in all select items
for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {
    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    elementToggleFunc(select);
    filterFunc(selectedValue);
  });
}

// filter variables
const filterFunc = function (selectedValue) {
  const filterItems = document.querySelectorAll("[data-filter-item]"); // Dynamic query
  for (let i = 0; i < filterItems.length; i++) {
    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }
  }
};

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {
  filterBtn[i].addEventListener("click", function () {
    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    filterFunc(selectedValue);

    if (lastClickedBtn) lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;
  });
}

// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {
    // check form validation
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }
  });
}

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {
      fullname: formData.get("fullname"),
      email: formData.get("email"),
      message: formData.get("message"),
      timestamp: Date.now(),
    };

    const messagesRef = ref(database, "messages");

    push(messagesRef, data)
      .then(() => {
        alert("Message sent successfully!");
        form.reset();
        formBtn.setAttribute("disabled", "");
      })
      .catch((error) => {
        console.error("Error writing to Firebase Database", error);
        alert("There was an error sending your message. Please try again.");
      });
  });
}

// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {
    for (let i = 0; i < pages.length; i++) {
      // Reset scrolling
      window.scrollTo(0, 0);

      if (this.innerHTML.toLowerCase() === pages[i].dataset.page) {
        pages[i].classList.add("active");
        navigationLinks[i].classList.add("active");
      } else {
        pages[i].classList.remove("active");
        navigationLinks[i].classList.remove("active");
      }
    }
  });
}
