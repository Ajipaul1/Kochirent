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

    // Accordion Logic
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const content = header.nextElementSibling;
            const icon = header.querySelector('i');
            
            const isOpen = content.style.display === 'block';
            
            // Close all other items (optional, but usually better for mobile)
            document.querySelectorAll('.accordion-content').forEach(c => c.style.display = 'none');
            document.querySelectorAll('.accordion-header i').forEach(i => {
                i.classList.remove('fa-minus');
                i.classList.add('fa-plus');
            });
            
            if (!isOpen) {
                content.style.display = 'block';
                icon.classList.remove('fa-plus');
                icon.classList.add('fa-minus');
            } else {
                content.style.display = 'none';
                icon.classList.remove('fa-minus');
                icon.classList.add('fa-plus');
            }
        });
    });
});
