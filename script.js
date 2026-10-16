
document.addEventListener("DOMContentLoaded", () => {
  const languageButton = document.querySelector("#language-toggle");
  const menuButton = document.querySelector("#menu-toggle");
  const navigation = document.querySelector("#navigation");
  const filterButtons = document.querySelectorAll(".filter-button");
  const projectCards = document.querySelectorAll(".project-card");
  const revealElements = document.querySelectorAll(".reveal");

  // IDIOMA
  let currentLanguage = "pt";

  function setLanguage(language) {
    currentLanguage = language;
    document.documentElement.lang = language === "pt" ? "pt-BR" : "en";

    document.querySelectorAll("[data-pt][data-en]").forEach((element) => {
      const translation = element.dataset[language];

      if (translation !== undefined) {
        // Permite HTML apenas nos elementos de apresentação
        // cujo conteúdo HTML foi definido no próprio index.html.
        if (element.matches("h2")) {
          element.innerHTML = translation;
        } else {
          element.textContent = translation;
        }
      }
    });

    if (languageButton) {
      languageButton.textContent = language === "pt" ? "EN" : "PT";
      languageButton.setAttribute(
        "aria-label",
        language === "pt" ? "Switch to English" : "Mudar para português"
      );
    }

    document.title =
      language === "pt"
        ? "JohnMcArt — Portfólio"
        : "JohnMcArt — Portfolio";

    try {
      // Persiste a escolha durante a navegação na mesma sessão.
      sessionStorage.setItem("portfolio-language", language);
    } catch {
      // O site continua funcionando se o armazenamento estiver indisponível.
    }
  }

  if (languageButton) {
    languageButton.addEventListener("click", () => {
      setLanguage(currentLanguage === "pt" ? "en" : "pt");
    });
  }

  try {
    const savedLanguage = sessionStorage.getItem("portfolio-language");

    if (savedLanguage === "en" || savedLanguage === "pt") {
      setLanguage(savedLanguage);
    }
  } catch {
    // O idioma padrão continua sendo português.
  }

  // MENU PARA DISPOSITIVOS MÓVEIS
  function closeMenu() {
    if (!menuButton || !navigation) return;

    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute(
      "aria-label",
      currentLanguage === "pt" ? "Abrir menu" : "Open menu"
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
          ? (currentLanguage === "pt" ? "Abrir menu" : "Open menu")
          : (currentLanguage === "pt" ? "Fechar menu" : "Close menu")
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
