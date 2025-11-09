const toggleBtn = document.querySelector(".menu-toggle");
const menu = document.getElementById("mobile-menu");
const closeBtn = menu ? menu.querySelector(".mobile-menu__close") : null;
const panel = menu ? menu.querySelector(".mobile-menu__panel") : null;
const LINK_SEL = ".mobile-menu__link";
const FOCUSABLE_SEL =
  'a,button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])';

if (toggleBtn && menu && panel && closeBtn) {
  let isOpen = false;
  let lastFocused = null;
  const lockScroll = () => document.body.classList.add("no-scroll");
  const unLockScroll = () => document.body.classList.remove("no-scroll");
  const getFocusables = () =>
    Array.from(menu.querySelectorAll(FOCUSABLE_SEL)).filter(
      (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1
    );
  function openMenu() {
    if (isOpen) return;
    isOpen = true;
    lastFocused = document.activeElement;

    menu.hidden = false;

    requestAnimationFrame(() => menu.classList.add("is-open"));
    toggleBtn.setAttribute("aria-expanded", "true");

    lockScroll();

    document.addEventListener("keydown", onTrapTab, true);
    document.addEventListener("keydown", onEscToClose, true);
  }
  function actuallyHideMenu() {
    menu.hidden = true;
    unLockScroll();
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  function closeMenu() {
    if (!isOpen) return;
    isOpen = false;
    menu.classList.remove("is-open");
    toggleBtn.setAttribute("aria-expanded", "false");

    const onEnd = (e) => {
      if (
        e.target === panel &&
        (e.propertyName === "transform" || e.propertyName === "opacity")
      ) {
        panel.removeEventListener("transitionend", onEnd);
        actuallyHideMenu();
      }
    };
    panel.addEventListener("transitionend", onEnd, { once: true });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      panel.removeEventListener("transitionend", onEnd);
      actuallyHideMenu();
    }
    document.removeEventListener("keydown", onTrapTab, true);
    document.removeEventListener("keydown", onEscToClose, true);
  }
  function onTrapTab(e) {
    if (e.key !== "Tab") return;
    const focusables = getFocusables();
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftkey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shifkey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
  function onEscToClose(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeMenu();
    }
  }
  toggleBtn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    openMenu();
  });
  closeBtn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    closeMenu();
  });
  menu.addEventListener("pointerdown", (e) => {
    const link = e.target.closest(LINK_SEL);
    if (!link) return;

    const href = link.getAttribute("href") || "#";
    closeMenu();
    setTimeout(() => (window.location.href = href), 0);
  });
  menu.addEventListener("pointerdown", (e) => {
    if (e.target === menu) closeMenu();
  });
}
