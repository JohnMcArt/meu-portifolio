
document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.querySelector("#menu-toggle");
  const navigation = document.querySelector("#navigation");
  const filterButtons = document.querySelectorAll(".filter-button");
  const projectCards = document.querySelectorAll(".project-card");
  const revealElements = document.querySelectorAll(".reveal");
  const currentLanguage = "pt";

  document.documentElement.lang = "pt-BR";
  document.title = "JohnMcArt — Portfólio";

  // MENU PARA DISPOSITIVOS MÓVEIS
  function closeMenu() {
    if (!menuButton || !navigation) return;

    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute(
      "aria-label",
      "Abrir menu"
    );
    navigation.classList.remove("is-open");
  }

  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      const isOpen =
        menuButton.getAttribute("aria-expanded") === "true";

      menuButton.setAttribute("aria-expanded", String(!isOpen));
      menuButton.setAttribute(
        "aria-label",
        isOpen
          ? ("Abrir menu")
          : ("Fechar menu")
      );

      navigation.classList.toggle("is-open", !isOpen);
    });

    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
        menuButton.focus();
      }
    });

    document.addEventListener("click", (event) => {
      const clickedInsideMenu =
        navigation.contains(event.target) ||
        menuButton.contains(event.target);

      if (!clickedInsideMenu) {
        closeMenu();
      }
    });
  }

  // GALERIA VISUAL: arraste com mouse ou deslize no toque; setas do teclado também funcionam.
  const artTrack = document.querySelector("#art-track");
  if (artTrack) {
    let isDown = false;
    let startX = 0;
    let startScrollLeft = 0;
    let didDrag = false;

    artTrack.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "touch") return;
      isDown = true;
      didDrag = false;
      startX = event.clientX;
      startScrollLeft = artTrack.scrollLeft;
      artTrack.classList.add("is-dragging");
      artTrack.setPointerCapture(event.pointerId);
    });

    artTrack.addEventListener("pointermove", (event) => {
      if (!isDown) return;
      const distance = event.clientX - startX;
      if (Math.abs(distance) > 4) didDrag = true;
      artTrack.scrollLeft = startScrollLeft - distance;
    });

    const stopDragging = () => {
      isDown = false;
      artTrack.classList.remove("is-dragging");
    };
    artTrack.addEventListener("pointerup", stopDragging);
    artTrack.addEventListener("pointercancel", stopDragging);
    artTrack.addEventListener("lostpointercapture", stopDragging);
    artTrack.addEventListener("click", (event) => {
      if (didDrag) {
        event.preventDefault();
        event.stopPropagation();
        didDrag = false;
      }
    }, true);
    artTrack.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") artTrack.scrollBy({ left: 260, behavior: "smooth" });
      if (event.key === "ArrowLeft") artTrack.scrollBy({ left: -260, behavior: "smooth" });
    });
  }

  // FILTROS DE PROJETOS
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedFilter = button.dataset.filter;

      filterButtons.forEach((filter) => {
        const isActive = filter === button;

        filter.classList.toggle("active", isActive);
        filter.setAttribute("aria-pressed", String(isActive));
      });

      projectCards.forEach((card) => {
        const categories = (card.dataset.category || "").split(" ");
        const shouldShow =
          selectedFilter === "all" ||
          categories.includes(selectedFilter);

        card.classList.toggle("is-hidden", !shouldShow);
      });
    });
  });

  // ANIMAÇÕES AO ROLAR A PÁGINA
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if ("IntersectionObserver" in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -30px 0px",
      }
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add("is-visible");
    });
  }

  // DESTAQUE DA SEÇÃO ATUAL NA NAVEGAÇÃO
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav-links a");

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          navLinks.forEach((link) => {
            const isCurrent =
              link.getAttribute("href") === `#${entry.target.id}`;

            link.classList.toggle("active", isCurrent);

            if (isCurrent) {
              link.setAttribute("aria-current", "location");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        });
      },
      {
        rootMargin: "-25% 0px -65% 0px",
      }
    );

    sections.forEach((section) => {
      sectionObserver.observe(section);
    });
  }

  // LINKS QUE AINDA PRECISAM SER CONFIGURADOS
  document.querySelectorAll("[data-placeholder-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const type = link.dataset.placeholderLink;
      const configuredUrl = link.dataset.url;

      // Evita encaminhar para páginas genéricas ou links incompletos.
      if (!configuredUrl) {
        event.preventDefault();

        const message =
          currentLanguage === "pt"
            ? `O link de ${type === "linkedin" ? "LinkedIn" : "WhatsApp"} ainda precisa ser configurado no index.html.`
            : `The ${type} link still needs to be configured in index.html.`;

        window.alert(message);
        return;
      }

      link.href = configuredUrl;
    });
  });
});


// Pré-visualização local das mídias nos espaços da galeria.
document.querySelectorAll('[data-art-slot]').forEach((input) => {
  input.addEventListener('change', () => {
    const file = input.files && input.files[0];
    if (!file) return;
    const slot = input.closest('.art-upload-slot');
    const preview = slot && slot.querySelector('.art-preview');
    if (!slot || !preview) return;
    const url = URL.createObjectURL(file);
    preview.replaceChildren();
    let media;
    if (file.type.startsWith('video/')) {
      media = document.createElement('video'); media.src = url; media.controls = true; media.muted = true; media.playsInline = true;
    } else {
      media = document.createElement('img'); media.src = url; media.alt = 'Pré-visualização da arte ' + input.dataset.artSlot;
    }
    preview.appendChild(media); slot.classList.add('has-media');
  });
});
