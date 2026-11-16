(() => {
  const form = document.querySelector("#date-form");
  const gate = document.querySelector("#gate");
  const content = document.querySelector("#site-content");
  const error = document.querySelector("#gate-error");
  const dayInput = document.querySelector("#day-input");
  const monthInput = document.querySelector("#month-input");

  if (!form || !gate || !content || !error || !dayInput || !monthInput) {
    throw new Error("The engagement page is missing required entrance elements.");
  }

  document.body.classList.add("gate-open");

  const normalize = (value) => value
    .trim()
    .toLowerCase()
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/\u0640/g, "")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/\s+/g, " ");

  const validDay = new Set(["5", "five", "٥", "خمسة"]);
  const validMonth = new Set(["11", "november", "نوفمبر"]);
  const wrongDateMessages = [
    "مش ده يوم ميلادك يا نور عيني… جرّبي تاني ♡",
    "فكّري في اليوم اللي الدنيا نورت فيه بوجودك يا قمري 💗",
    "يوم ميلادك أجمل تاريخ… جربي تفتكريه يا حبيبتي ✨",
    "قريبة يا أجمل هدية في عمري… اكتبي يوم وشهر ميلادك 🌸",
    "يا صاحبة أحلى عيد ميلاد، حاولي مرة كمان… مستنيكي ♡"
  ];
  let wrongDateAttempts = 0;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const day = normalize(dayInput.value);
    const month = normalize(monthInput.value);

    if (validDay.has(day) && validMonth.has(month)) {
      error.textContent = "";
      gate.classList.add("gate-leaving");
      window.setTimeout(() => {
        gate.hidden = true;
        content.hidden = false;
        document.body.classList.remove("gate-open");
        startNameAnimation();
        setupCarousels();
        setupMemoriesCarousel();
        setupPhotoViewer();
        window.scrollTo({ top: 0, behavior: "instant" });
      }, 360);
      return;
    }

    error.textContent = wrongDateMessages[wrongDateAttempts % wrongDateMessages.length];
    wrongDateAttempts += 1;
    dayInput.setAttribute("aria-invalid", "true");
    monthInput.setAttribute("aria-invalid", "true");
  });

  for (const input of [dayInput, monthInput]) {
    input.addEventListener("input", () => {
      error.textContent = "";
      input.removeAttribute("aria-invalid");
    });
  }

  function startNameAnimation() {
    const names = [
      [document.querySelector("#mohamed-name"), "Mohamed"],
      [document.querySelector("#haneen-name"), "Haneen"]
    ];

    for (const [element, name] of names) {
      if (!element) continue;
      element.replaceChildren(...Array.from(name, (letter, index) => {
        const span = document.createElement("span");
        span.textContent = letter;
        span.style.setProperty("--letter-delay", `${index * 0.16}s`);
        return span;
      }));
    }
  }

  function setupCarousels() {
    document.querySelectorAll("[data-carousel]").forEach((carousel) => {
      const track = carousel.querySelector(".carousel-track");
      const cards = Array.from(carousel.querySelectorAll(".carousel-card"));
      const next = carousel.querySelector(".carousel-next");
      const previous = carousel.querySelector(".carousel-prev");
      const dots = carousel.parentElement.querySelector(".carousel-dots");
      const windowElement = carousel.querySelector(".carousel-window");
      if (!track || !cards.length || !next || !previous || !dots || !windowElement) return;

      let index = 0;
      let timer;
      let touchStartX = 0;

      const renderDots = () => {
        dots.replaceChildren();
        for (let dotIndex = 0; dotIndex < cards.length; dotIndex += 1) {
          const dot = document.createElement("button");
          dot.type = "button";
          dot.setAttribute("aria-label", `عرض الصورة ${dotIndex + 1}`);
          dot.addEventListener("click", () => {
            index = dotIndex;
            update();
            restartTimer();
          });
          dots.append(dot);
        }
      };

      const update = () => {
        index = (index + cards.length) % cards.length;
        track.style.transform = `translateX(${-index * windowElement.clientWidth}px)`;
        Array.from(dots.children).forEach((dot, dotIndex) => {
          dot.classList.toggle("active", dotIndex === index);
          dot.setAttribute("aria-current", dotIndex === index ? "true" : "false");
        });
      };

      const move = (direction) => {
        index = (index + direction + cards.length) % cards.length;
        update();
      };

      const stopTimer = () => window.clearInterval(timer);
      const restartTimer = () => {
        stopTimer();
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && cards.length > 1) {
          timer = window.setInterval(() => move(1), 4200);
        }
      };

      next.addEventListener("click", () => {
        move(1);
        restartTimer();
      });
      previous.addEventListener("click", () => {
        move(-1);
        restartTimer();
      });
      carousel.addEventListener("mouseenter", stopTimer);
      carousel.addEventListener("mouseleave", restartTimer);
      carousel.addEventListener("focusin", stopTimer);
      carousel.addEventListener("focusout", restartTimer);
      windowElement.addEventListener("touchstart", (event) => {
        touchStartX = event.changedTouches[0].screenX;
      }, { passive: true });
      windowElement.addEventListener("touchend", (event) => {
        const distance = event.changedTouches[0].screenX - touchStartX;
        if (Math.abs(distance) > 40) {
          move(distance < 0 ? 1 : -1);
          restartTimer();
        }
      }, { passive: true });

      renderDots();
      update();
      restartTimer();
      window.addEventListener("resize", update, { passive: true });
    });
  }

  function setupMemoriesCarousel() {
    const bootstrapCarousel = window.bootstrap?.Carousel;
    const carouselElements = document.querySelectorAll(".memories-carousel");
    if (!carouselElements.length || !bootstrapCarousel) {
      throw new Error("The photo sections require the Bootstrap carousel component.");
    }

    carouselElements.forEach((carouselElement) => {
      bootstrapCarousel.getOrCreateInstance(carouselElement, {
        interval: 4500,
        pause: "hover",
        ride: "carousel",
        touch: true,
        wrap: true
      });
    });
  }

  function setupPhotoViewer() {
    const viewer = document.querySelector("#photo-viewer");
    const viewerImage = document.querySelector("#photo-viewer-image");
    const caption = document.querySelector("#photo-viewer-caption");
    const closeButton = viewer?.querySelector(".photo-viewer-close");
    if (!(viewer instanceof HTMLDialogElement) || !viewerImage || !caption || !closeButton) {
      throw new Error("The photo viewer is missing required elements.");
    }

    document.querySelectorAll(
      ".featured-photo, .mosaic-photo, .family-photo, .carousel-card, .memories-carousel .carousel-item"
    ).forEach((photo) => {
      const image = photo.querySelector("img");
      if (!image) return;

      photo.classList.add("photo-zoom-target");
      photo.setAttribute("role", "button");
      photo.setAttribute("tabindex", "0");
      photo.setAttribute("aria-label", `عرض الصورة كاملة: ${image.alt}`);

      const openViewer = () => {
        viewerImage.src = image.currentSrc || image.src;
        viewerImage.alt = image.alt;
        caption.textContent = image.alt;
        viewer.showModal();
      };

      photo.addEventListener("click", openViewer);
      photo.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openViewer();
        }
      });
    });

    closeButton.addEventListener("click", () => viewer.close());
    viewer.addEventListener("click", (event) => {
      if (event.target === viewer) viewer.close();
    });
  }
})();