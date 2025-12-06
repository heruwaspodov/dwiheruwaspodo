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

// Master init function
async function initApp() {
  await Promise.all([loadBio(), loadRoles(), loadContacts()]);
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

// testimonials variables
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

// modal variable
const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

// modal toggle function
const testimonialsModalFunc = function () {
  modalContainer.classList.toggle("active");
  overlay.classList.toggle("active");
};

// add click event to all modal items
for (let i = 0; i < testimonialsItem.length; i++) {
  testimonialsItem[i].addEventListener("click", function () {
    modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
    modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
    modalTitle.innerHTML = this.querySelector(
      "[data-testimonials-title]",
    ).innerHTML;
    modalText.innerHTML = this.querySelector(
      "[data-testimonials-text]",
    ).innerHTML;

    testimonialsModalFunc();
  });
}

// add click event to modal close button
if (modalCloseBtn)
  modalCloseBtn.addEventListener("click", testimonialsModalFunc);
if (overlay) overlay.addEventListener("click", testimonialsModalFunc);

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
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {
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
