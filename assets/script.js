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

document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const targetTab = button.dataset.tab;
            tabContents.forEach(content => {
                if (content.id === targetTab) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        });
    });
});
