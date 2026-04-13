const modeTabs = document.querySelectorAll(".search-tab");
const panels = document.querySelectorAll(".search-panel");
const languageToggle = document.querySelector(".language-toggle");

modeTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        const mode = tab.dataset.mode;

        modeTabs.forEach((item) => {
            const active = item === tab;
            item.classList.toggle("is-active", active);
            item.setAttribute("aria-selected", String(active));
        });

        panels.forEach((panel) => {
            const active = panel.dataset.panel === mode;
            panel.classList.toggle("is-active", active);
            panel.hidden = !active;
        });
    });
});

document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
        const pressed = chip.getAttribute("aria-pressed") === "true";
        chip.setAttribute("aria-pressed", String(!pressed));
        chip.classList.toggle("is-selected", !pressed);
    });
});

if (languageToggle) {
    languageToggle.addEventListener("click", () => {
        const pressed = languageToggle.getAttribute("aria-pressed") === "true";
        const nextPressed = !pressed;
        const label = languageToggle.querySelector(".language-toggle__label");

        languageToggle.setAttribute("aria-pressed", String(nextPressed));

        if (label) {
            label.textContent = nextPressed ? "ML" : "EN";
        }
    });
}
