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
    const whatsappUrl = "https://wa.me/916282520339?text=Hi%20KochiNest%2C%20I'm%20interested%20in%20your%20service";
    const scrollMap = {
        top: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
        hero: () => document.querySelector('.hero-section-mobile')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        homes: () => document.getElementById('homesSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        trending: () => document.getElementById('trendingSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        packers: () => document.getElementById('packersSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        repair: () => document.getElementById('repairSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        "more-services": () => document.getElementById('moreServicesSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    };

    const doScroll = (target) => {
        const handler = scrollMap[target];
        if (handler) handler();
    };

    const openWhatsapp = () => window.open(whatsappUrl, '_blank');

    const postModal = document.getElementById('postModal');
    const profileModal = document.getElementById('profileModal');
    const notificationToggle = document.getElementById('notificationToggle');
    const notificationDropdown = document.getElementById('notificationDropdown');
    const menuToggle = document.getElementById('hamburgerMenuToggle');
    const menuOverlay = document.getElementById('mobileMenuOverlay');
    const menuDrawer = document.getElementById('mobileDrawer');

    const openPostModal = () => {
        if (postModal) postModal.style.display = 'flex';
    };
    const closePostModal = () => {
        if (postModal) postModal.style.display = 'none';
    };
    const openProfileModal = () => {
        if (profileModal) profileModal.style.display = 'flex';
    };
    const closeProfileModal = () => {
        if (profileModal) profileModal.style.display = 'none';
    };

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

    document.querySelectorAll('[data-search-target]').forEach(button => {
        button.addEventListener('click', () => {
            doScroll(button.dataset.searchTarget);
        });
    });

    document.querySelectorAll('[data-scroll-target]').forEach(item => {
        item.addEventListener('click', (event) => {
            event.preventDefault();
            doScroll(item.dataset.scrollTarget);
        });
    });

    document.querySelectorAll('[data-menu-target]').forEach(item => {
        item.addEventListener('click', (event) => {
            event.preventDefault();
            doScroll(item.dataset.menuTarget);
            if (menuOverlay) menuOverlay.style.display = 'none';
        });
    });

    document.querySelectorAll('[data-open-whatsapp]').forEach(item => {
        item.addEventListener('click', (event) => {
            event.preventDefault();
            openWhatsapp();
        });
    });

    document.querySelectorAll('[data-open-post]').forEach(item => {
        item.addEventListener('click', (event) => {
            event.preventDefault();
            openPostModal();
            if (menuOverlay) menuOverlay.style.display = 'none';
        });
    });

    document.querySelectorAll('[data-nav-action]').forEach(item => {
        item.addEventListener('click', (event) => {
            event.preventDefault();
            const action = item.dataset.navAction;
            if (action === 'home') doScroll('top');
            if (action === 'search') doScroll('hero');
            if (action === 'post') openPostModal();
            if (action === 'messages') openWhatsapp();
            if (action === 'profile') openProfileModal();
        });
    });

    if (menuToggle && menuOverlay) {
        menuToggle.addEventListener('click', () => {
            menuOverlay.style.display = 'block';
        });
    }

    if (menuOverlay && menuDrawer) {
        menuOverlay.addEventListener('click', (event) => {
            if (!menuDrawer.contains(event.target)) {
                menuOverlay.style.display = 'none';
            }
        });
    }

    if (notificationToggle && notificationDropdown) {
        notificationToggle.addEventListener('click', () => {
            const isVisible = notificationDropdown.style.display === 'block';
            notificationDropdown.style.display = isVisible ? 'none' : 'block';
        });
    }

    if (postModal) {
        postModal.addEventListener('click', (event) => {
            if (event.target === postModal) closePostModal();
        });
    }
    if (profileModal) {
        profileModal.addEventListener('click', (event) => {
            if (event.target === profileModal) closeProfileModal();
        });
    }
    document.getElementById('closePostModal')?.addEventListener('click', closePostModal);
    document.getElementById('closeProfileModal')?.addEventListener('click', closeProfileModal);

    document.addEventListener('click', (event) => {
        if (notificationDropdown && notificationToggle && !notificationDropdown.contains(event.target) && event.target !== notificationToggle) {
            notificationDropdown.style.display = 'none';
        }
    });

    const deals = [
        { title: 'Honda Dio - Limited Offer!', pickup: 'Pickup: Kakkanad', price: '₹399', image: 'https://images.pexels.com/photos/2611690/pexels-photo-2611690.jpeg?auto=compress&cs=tinysrgb&w=440&h=280&fit=crop' },
        { title: 'Activa 6G - Daily Deal!', pickup: 'Pickup: Edappally', price: '₹449', image: 'https://images.pexels.com/photos/2519374/pexels-photo-2519374.jpeg?auto=compress&cs=tinysrgb&w=600&h=360&fit=crop' },
        { title: 'Bike Rental - Flash Deal!', pickup: 'Pickup: Kakkanad', price: '₹429', image: 'https://images.pexels.com/photos/163210/motorcycles-race-helmets-pilots-163210.jpeg?auto=compress&cs=tinysrgb&w=480&h=288&fit=crop' }
    ];

    const dealTitle = document.getElementById('dealTitle');
    const dealPickup = document.getElementById('dealPickup');
    const dealPrice = document.getElementById('dealPrice');
    const dealImage = document.getElementById('dealImage');

    const rotateDeal = () => {
        const deal = deals[Math.floor(Math.random() * deals.length)];
        if (dealTitle) dealTitle.textContent = deal.title;
        if (dealPickup) dealPickup.textContent = deal.pickup;
        if (dealPrice) dealPrice.textContent = deal.price;
        if (dealImage) dealImage.src = deal.image;
    };
    rotateDeal();
    setInterval(rotateDeal, 12000);

    const timerElement = document.querySelector('.deal-of-the-day .time');
    let countdownSeconds = (8 * 3600) + (45 * 60) + 32;
    if (timerElement) {
        setInterval(() => {
            countdownSeconds = countdownSeconds <= 0 ? (8 * 3600) + (45 * 60) + 32 : countdownSeconds - 1;
            const hours = String(Math.floor(countdownSeconds / 3600)).padStart(2, '0');
            const minutes = String(Math.floor((countdownSeconds % 3600) / 60)).padStart(2, '0');
            const seconds = String(countdownSeconds % 60).padStart(2, '0');
            timerElement.textContent = `${hours} : ${minutes} : ${seconds}`;
        }, 1000);
    }

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
