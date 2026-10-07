/* ==================================================
   ÍCONES LOCAIS EM SVG
   ================================================== */

const icons = {
  home: `
    <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>
  `,

  search: `
    <circle cx="10.5" cy="10.5" r="6.5"/>
    <path d="m16 16 5 5"/>
  `,

  compass: `
    <circle cx="12" cy="12" r="9"/>
    <path d="m16 8-3 5-5 3 3-5Z"/>
  `,

  video: `
    <rect x="3" y="3" width="18" height="18" rx="4"/>
    <path d="M3 8h18M8 3l4 5m3-5 4 5"/>
    <path d="m10 11 5 3-5 3Z"/>
  `,

  message: `
    <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8Z"/>
  `,

  heart: `
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>
  `,

  plus: `
    <rect x="3" y="3" width="18" height="18" rx="5"/>
    <path d="M12 8v8M8 12h8"/>
  `,

  user: `
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 21v-2a8 8 0 0 1 16 0v2"/>
  `,

  users: `
    <circle cx="9" cy="8" r="3"/>
    <path d="M3 21v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M21 21v-2a6 6 0 0 0-4-5.7"/>
  `,

  menu: `
    <path d="M3 6h18M3 12h18M3 18h18"/>
  `,

  more: `
    <circle cx="5" cy="12" r="1" fill="currentColor"/>
    <circle cx="12" cy="12" r="1" fill="currentColor"/>
    <circle cx="19" cy="12" r="1" fill="currentColor"/>
  `,

  image: `
    <rect x="3" y="3" width="18" height="18" rx="3"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <path d="m21 15-5-5L5 21"/>
  `,

  grid: `
    <rect x="3" y="3" width="18" height="18" rx="1"/>
    <path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>
  `,

  instagram: `
    <rect x="3" y="3" width="18" height="18" rx="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r=".7" fill="currentColor"/>
  `,

  bell: `
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>
  `,

  mail: `
    <rect x="3" y="5" width="18" height="14" rx="2"/>
    <path d="m3 6 9 7 9-7"/>
  `,

  bookmark: `
    <path d="M6 3h12v18l-6-4-6 4Z"/>
  `,

  "arrow-left": `
    <path d="m12 5-7 7 7 7M5 12h15"/>
  `,

  pin: `
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/>
    <circle cx="12" cy="10" r="2.5"/>
  `,

  link: `
    <path d="m10 13 4-4M8 16l-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0M16 8l1-1a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0" transform="translate(1 0) scale(.9)"/>
  `,

  calendar: `
    <rect x="3" y="5" width="18" height="16" rx="2"/>
    <path d="M16 3v4M8 3v4M3 11h18"/>
  `,

  repeat: `
    <path d="m17 2 4 4-4 4M3 11V8a2 2 0 0 1 2-2h16M7 22l-4-4 4-4M21 13v3a2 2 0 0 1-2 2H3"/>
  `,

  chart: `
    <path d="M4 20V10M10 20V4M16 20v-8M22 20V7"/>
  `
};

document.querySelectorAll("[data-icon]").forEach((element) => {
  const drawing = icons[element.dataset.icon];

  if (!drawing) return;

  // Somente desenhos definidos neste arquivo entram neste HTML.
  element.innerHTML = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      ${drawing}
    </svg>
  `;
});


/* ==================================================
   MENSAGENS DA INTERFACE
   ================================================== */

const toast = document.querySelector(".toast");
let toastTimeout;

function showToast(message) {
  if (!toast) return;

  clearTimeout(toastTimeout);
  toast.textContent = message;
  toast.classList.add("visible");

  toastTimeout = setTimeout(() => {
    toast.classList.remove("visible");
  }, 3000);
}

document.querySelectorAll("[data-demo]").forEach((button) => {
  button.addEventListener("click", () => {
    showToast("Este recurso ainda é apenas visual na simulação.");
  });
});


/* ==================================================
   SEGUIR / DEIXAR DE SEGUIR
   ================================================== */

document.querySelectorAll("[data-follow]").forEach((button) => {
  button.addEventListener("click", () => {
    const following = button.getAttribute("aria-pressed") === "true";

    button.setAttribute("aria-pressed", String(!following));
    button.textContent = following ? "Seguir" : "Seguindo";
  });
});


/* ==================================================
   CURTIR / DESFAZER CURTIDA
   ================================================== */

document.querySelectorAll("[data-like]").forEach((button) => {
  const counter = button.querySelector("[data-like-count]");
  const initialCount = Number(counter.textContent);

  button.addEventListener("click", () => {
    const liked = button.getAttribute("aria-pressed") === "true";

    button.setAttribute("aria-pressed", String(!liked));
    button.setAttribute("aria-label", liked ? "Curtir" : "Descurtir");
    counter.textContent = String(initialCount + (liked ? 0 : 1));
  });
});


/* ==================================================
   ABAS — CLIQUE E TECLADO
   ================================================== */

document.querySelectorAll("[data-tabs]").forEach((group) => {
  const tabs = [...group.querySelectorAll('[role="tab"]')];
  const panels = [...group.querySelectorAll('[role="tabpanel"]')];

  function activateTab(selectedTab, moveFocus = false) {
    tabs.forEach((tab) => {
      const selected = tab === selectedTab;

      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });

    panels.forEach((panel) => {
      panel.hidden = panel.id !== selectedTab.getAttribute("aria-controls");
    });

    if (moveFocus) selectedTab.focus();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      activateTab(tab);
    });

    tab.addEventListener("keydown", (event) => {
      let nextIndex;

      if (event.key === "ArrowRight") {
        nextIndex = (index + 1) % tabs.length;
      } else if (event.key === "ArrowLeft") {
        nextIndex = (index - 1 + tabs.length) % tabs.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = tabs.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      activateTab(tabs[nextIndex], true);
    });
  });
});