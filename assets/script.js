const languageToggle = document.querySelector(".language-toggle");

if (languageToggle) {
    languageToggle.addEventListener("click", () => {
        const pressed = languageToggle.getAttribute("aria-pressed") === "true";
        const nextPressed = !pressed;
        const options = languageToggle.querySelectorAll(".language-toggle__option");

        languageToggle.setAttribute("aria-pressed", String(nextPressed));

        options.forEach((option, index) => {
            const active = nextPressed ? index === 1 : index === 0;
            option.classList.toggle("is-active", active);
        });
    });
}
