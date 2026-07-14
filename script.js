/**
 * Kathait Wedding Point - Website Logic
 * Handles interactive luxury features, smooth scroll offsets,
 * counters, gallery filtering, custom lightbox, and form handles.
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. PRELOADER & ANIMATIONS ---
  window.addEventListener("load", () => {
    const preloader = document.getElementById("preloader");
    if (preloader) {
      preloader.style.opacity = "0";
      setTimeout(() => {
        preloader.style.display = "none";
        // Trigger initial reveal animations once loader is gone
        triggerRevealOnLoad();
      }, 600);
    }
  });

  // Fallback in case load event takes too long
  setTimeout(() => {
    const preloader = document.getElementById("preloader");
    if (preloader && preloader.style.display !== "none") {
      preloader.style.opacity = "0";
      setTimeout(() => { preloader.style.display = "none"; }, 600);
    }
  }, 3500);


  // --- 2. SCROLL PROGRESS INDICATOR ---
  const scrollProgress = document.getElementById("scrollProgress");
  window.addEventListener("scroll", () => {
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    if (scrollProgress) {
      scrollProgress.style.width = scrolled + "%";
    }
  });


  // --- 3. STICKY NAVBAR & ACTIVE NAV LINKS ON SCROLL ---
  const navbar = document.querySelector(".custom-navbar");
  const navLinks = document.querySelectorAll(".nav-link-custom");
  const sections = document.querySelectorAll("section[id]");
  const backToTop = document.getElementById("backToTop");

  function handleScrollEffects() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    // Sticky navbar backdrop state
    if (scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }

    // Back to top floating button visibility
    if (scrollY > 600) {
      backToTop.classList.add("show");
    } else {
      backToTop.classList.remove("show");
    }

    // Active Section link highlighter
    sections.forEach((section) => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120; // offset for sticky navbar
      const sectionId = section.getAttribute("id");

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${sectionId}`) {
            link.classList.add("active");
          }
        });
      }
    });
  }

  window.addEventListener("scroll", handleScrollEffects);
  // Run on load too
  handleScrollEffects();

  // Mobile menu scroll prevention
  const navbarCollapseElement = document.getElementById("navbarNav");
  if (navbarCollapseElement) {
    navbarCollapseElement.addEventListener("show.bs.collapse", () => {
      document.body.classList.add("no-scroll");
    });
    navbarCollapseElement.addEventListener("hide.bs.collapse", () => {
      document.body.classList.remove("no-scroll");
    });
  }


  // --- 4. BACK TO TOP CLICK ACTION ---
  if (backToTop) {
    backToTop.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }


  // --- 5. SMOOTH SCROLL FOR NAV LINKS ---
  navLinks.forEach((link) => {
    link.addEventListener("click", function(e) {
      const targetId = this.getAttribute("href");
      if (targetId.startsWith("#")) {
        e.preventDefault();
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          // Close mobile collapse if open
          const navbarCollapse = document.getElementById("navbarNav");
          if (navbarCollapse.classList.contains("show")) {
            const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
            if (bsCollapse) bsCollapse.hide();
          }

          const targetOffset = targetSection.offsetTop - 80; // height of sticky bar
          window.scrollTo({
            top: targetOffset,
            behavior: "smooth"
          });
        }
      }
    });
  });


  // --- 6. SCROLL REVEAL ANIMATIONS (Intersection Observer) ---
  const revealElements = document.querySelectorAll(".reveal-elem");

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target); // Animate once only
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: "0px 0px -50px 0px"
  });

  revealElements.forEach((elem) => {
    revealObserver.observe(elem);
  });

  function triggerRevealOnLoad() {
    // Reveal items that are already visible in viewport on initial load
    revealElements.forEach((elem) => {
      const rect = elem.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        elem.classList.add("revealed");
      }
    });
  }


  // --- 7. ANIMATED STATISTICS COUNTERS (Intersection Observer) ---
  const counterSection = document.getElementById("hero-stats");
  const counters = document.querySelectorAll(".stat-number");
  let countersAnimated = false;

  function runCounters() {
    counters.forEach((counter) => {
      const target = +counter.getAttribute("data-target");
      const duration = 2000; // 2 seconds
      const speed = duration / target;
      
      let count = 0;
      const updateCount = () => {
        const increment = Math.ceil(target / (duration / 30)); // update roughly every 30ms
        count += increment;
        if (count < target) {
          counter.innerText = count + "+";
          setTimeout(updateCount, 30);
        } else {
          counter.innerText = target + "+";
        }
      };
      
      updateCount();
    });
  }

  if (counterSection && counters.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !countersAnimated) {
          runCounters();
          countersAnimated = true;
          counterObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.5
    });

    counterObserver.observe(counterSection);
  }


  // --- 8. GALLERY MASONRY FILTERING ---
  const filterButtons = document.querySelectorAll(".gallery-filter-btn");
  const galleryItems = document.querySelectorAll(".gallery-item");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Toggle Active class on buttons
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filterValue = btn.getAttribute("data-filter");

      galleryItems.forEach((item) => {
        const itemCategory = item.getAttribute("data-category");

        if (filterValue === "all" || itemCategory === filterValue) {
          item.classList.remove("hidden");
          // Re-trigger visual entry animations
          setTimeout(() => {
            item.style.opacity = "1";
            item.style.transform = "scale(1)";
          }, 50);
        } else {
          item.style.opacity = "0";
          item.style.transform = "scale(0.8)";
          // Set to hidden after CSS transition ends
          setTimeout(() => {
            item.classList.add("hidden");
          }, 350);
        }
      });
    });
  });


  // --- 9. CUSTOM HIGH-RES IMAGE LIGHTBOX ---
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");

  let activeImages = []; // List of currently visible images in gallery
  let currentIndex = 0;

  // Re-map index based on filtered list
  function updateActiveImages() {
    activeImages = Array.from(galleryItems).filter(item => !item.classList.contains("hidden"));
  }

  galleryItems.forEach((item) => {
    item.addEventListener("click", () => {
      updateActiveImages();
      
      const currentImg = item.querySelector("img");
      const currentSrc = currentImg.getAttribute("src");
      const currentTitle = item.querySelector(".gallery-item-title").innerText;
      
      currentIndex = activeImages.indexOf(item);
      
      openLightbox(currentSrc, currentTitle);
    });
  });

  function openLightbox(src, caption) {
    if (!lightbox) return;
    lightboxImg.setAttribute("src", src);
    lightboxCaption.innerText = caption;
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden"; // Disable scroll when open
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("active");
    document.body.style.overflow = ""; // Re-enable scroll
  }

  function showNextImage() {
    if (activeImages.length === 0) return;
    currentIndex = (currentIndex + 1) % activeImages.length;
    const nextItem = activeImages[currentIndex];
    const img = nextItem.querySelector("img");
    const src = img.getAttribute("src");
    const title = nextItem.querySelector(".gallery-item-title").innerText;
    
    // Smooth transition effect
    lightboxImg.style.opacity = "0";
    setTimeout(() => {
      lightboxImg.setAttribute("src", src);
      lightboxCaption.innerText = title;
      lightboxImg.style.opacity = "1";
    }, 200);
  }

  function showPrevImage() {
    if (activeImages.length === 0) return;
    currentIndex = (currentIndex - 1 + activeImages.length) % activeImages.length;
    const prevItem = activeImages[currentIndex];
    const img = prevItem.querySelector("img");
    const src = img.getAttribute("src");
    const title = prevItem.querySelector(".gallery-item-title").innerText;
    
    // Smooth transition effect
    lightboxImg.style.opacity = "0";
    setTimeout(() => {
      lightboxImg.setAttribute("src", src);
      lightboxCaption.innerText = title;
      lightboxImg.style.opacity = "1";
    }, 200);
  }

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightboxNext) lightboxNext.addEventListener("click", showNextImage);
  if (lightboxPrev) lightboxPrev.addEventListener("click", showPrevImage);

  // Close when clicking overlay backdrop
  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }

  // Keyboard navigation support
  document.addEventListener("keydown", (e) => {
    if (!lightbox || !lightbox.classList.contains("active")) return;
    
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") showNextImage();
    if (e.key === "ArrowLeft") showPrevImage();
  });


  // --- 10. PRESET EVENT INQUIRY TYPE FROM PACKAGE BUTTONS ---
  const bookButtons = document.querySelectorAll(".book-package-btn");
  const eventSelect = document.getElementById("eventType");

  bookButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const packageType = btn.getAttribute("data-package");
      if (eventSelect && packageType) {
        eventSelect.value = packageType;
        
        // Scroll smoothly to contact section
        const contactSection = document.getElementById("contact");
        if (contactSection) {
          const targetOffset = contactSection.offsetTop - 80;
          window.scrollTo({
            top: targetOffset,
            behavior: "smooth"
          });
        }
      }
    });
  });


  // --- 11. PREMIUM CONTACT FORM HANDLING & EMAILJS INTEGRATION ---
  const contactForm = document.getElementById("contactForm");
  const toastNotification = document.getElementById("toastNotification");

  function showToast(message, isSuccess = true) {
    if (!toastNotification) return;
    
    const toastIcon = toastNotification.querySelector("i");
    const toastText = toastNotification.querySelector(".toast-text");
    
    if (isSuccess) {
      toastNotification.style.borderLeft = "5px solid #28a745";
      toastIcon.className = "bi bi-check-circle-fill text-success";
    } else {
      toastNotification.style.borderLeft = "5px solid #dc3545";
      toastIcon.className = "bi bi-exclamation-triangle-fill text-danger";
    }
    
    toastText.innerText = message;
    toastNotification.classList.add("show");
    
    setTimeout(() => {
      toastNotification.classList.remove("show");
    }, 4500);
  }

  if (contactForm) {
    contactForm.addEventListener("submit", function(e) {
      e.preventDefault();

      // Form data extraction
      const name = document.getElementById("fullName").value.trim();
      const phone = document.getElementById("phoneNumber").value.trim();
      const email = document.getElementById("emailAddress").value.trim();
      const eventType = document.getElementById("eventType").value;
      const eventDate = document.getElementById("eventDate").value;
      const guests = document.getElementById("guestCount").value;
      const subject = document.getElementById("subject").value.trim();
      const message = document.getElementById("message").value.trim();

      // Basic field validation
      if (!name || !phone || !email || !eventType || !eventDate || !message) {
        showToast("Please fill in all the required fields.", false);
        return;
      }

      // Submit visual state
      const submitBtn = contactForm.querySelector("button[type='submit']");
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';

      /* =========================================================================
       * EMAILJS INTEGRATION GUIDE FOR PRODUCTION DEPLOYMENT
       * -------------------------------------------------------------------------
       * To send emails directly from the frontend to the owner's inbox:
       * 1. Go to https://www.emailjs.com/ and create a free account.
       * 2. Connect your Email Service (e.g., Gmail, Outlook).
       * 3. Create an Email Template with placeholder variables like:
       *    {{name}}, {{phone}}, {{email}}, {{eventType}}, {{eventDate}}, {{guests}}, {{subject}}, {{message}}
       * 4. Add the EmailJS script to your HTML header:
       *    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
       * 5. Initialize it in HTML or script.js:
       *    emailjs.init("YOUR_PUBLIC_KEY");
       * 6. Replace the placeholder config below with your actual keys.
       * ========================================================================= */

      const EMAILJS_CONFIG = {
        enabled: false,             // Set this to true to activate EmailJS
        publicKey: "YOUR_PUBLIC_KEY",
        serviceId: "YOUR_SERVICE_ID",
        templateId: "YOUR_TEMPLATE_ID"
      };

      if (EMAILJS_CONFIG.enabled) {
        // Trigger EmailJS library execution
        // Make sure the EmailJS SDK script is loaded in index.html
        if (typeof emailjs !== "undefined") {
          emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            {
              name: name,
              phone: phone,
              email: email,
              eventType: eventType,
              eventDate: eventDate,
              guests: guests,
              subject: subject,
              message: message
            },
            EMAILJS_CONFIG.publicKey
          )
          .then(() => {
            showToast("Enquiry submitted successfully! We will get in touch shortly.");
            contactForm.reset();
          })
          .catch((err) => {
            console.error("EmailJS Error:", err);
            showToast("Failed to send enquiry. Please try again or Call us directly.", false);
          })
          .finally(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
          });
        } else {
          console.warn("EmailJS SDK not loaded. Ensure EmailJS script tags are in index.html");
          showToast("EmailJS is not configured yet. Calling mock submission...", false);
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
      } else {
        // Mock Successful Submission (For Demo/Frontend Preview)
        setTimeout(() => {
          showToast("Demo Submit: Enquiry sent successfully to Kathait Wedding Point!");
          contactForm.reset();
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }, 1500);
      }
    });
  }
});
