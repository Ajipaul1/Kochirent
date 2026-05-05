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
    const whatsappPhoneNumber = "916282520339";
    const defaultWhatsappUrl = `https://wa.me/${whatsappPhoneNumber}?text=${encodeURIComponent("Hi KochiNest, I'm interested in your service")}`;
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

    const buildLeadWhatsappUrl = (name, service) => {
        const message = `Interested in ${service} for ${name}`;
        return `https://wa.me/${whatsappPhoneNumber}?text=${encodeURIComponent(message)}`;
    };

    const openWhatsapp = () => window.open(defaultWhatsappUrl, '_blank');

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

    if (window.lucide?.createIcons) {
        window.lucide.createIcons();
    }

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

    const redirectLeadToWhatsapp = (name, service) => {
        const normalizedName = (name || '').trim();
        const normalizedService = (service || '').trim();
        if (!normalizedName || !normalizedService) return;
        window.open(buildLeadWhatsappUrl(normalizedName, normalizedService), '_blank');
    };

    const postLeadForm = document.getElementById('postLeadForm');
    postLeadForm?.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('postLeadName')?.value;
        const service = document.getElementById('postLeadService')?.value;
        redirectLeadToWhatsapp(name, service);
    });

    const deals = [
        { title: 'Honda Dio - Limited Offer!', pickup: 'Pickup: Kakkanad', price: '₹399', image: 'assets/deal-bike-kochi.webp' },
        { title: 'Activa 6G - Daily Deal!', pickup: 'Pickup: Edappally', price: '₹449', image: 'assets/deal-bike-kochi.webp' },
        { title: 'Bike Rental - Flash Deal!', pickup: 'Pickup: Kakkanad', price: '₹429', image: 'assets/deal-bike-kochi.webp' }
    ];

    const dealTitle = document.getElementById('dealTitle');
    const dealPickup = document.getElementById('dealPickup');
    const dealPrice = document.getElementById('dealPrice');
    const dealImage = document.getElementById('dealImage');
    if (dealImage) {
        dealImage.addEventListener('error', () => {
            console.error('Deal image failed to load:', dealImage.getAttribute('src'));
        });
    }

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

    // Dynamic Loading of Aggregated Rentals (SEO Safe)
    const aggregatedSection = document.getElementById('aggregatedRentalsSection');
    const aggregatedContainer = document.getElementById('aggregatedCardsContainer');
    
    if (aggregatedSection && aggregatedContainer) {
        fetch('kochinest_scraped_data.json')
            .then(response => {
                if (!response.ok) throw new Error('No scraped data found');
                return response.json();
            })
            .then(data => {
                if (data && data.length > 0) {
                    aggregatedContainer.innerHTML = ''; // Clear fallback
                    data.forEach(item => {
                        const card = document.createElement('div');
                        card.className = 'verified-card';
                        card.style.flex = '0 0 140px';
                        
                        // Default image if missing or invalid
                        const imgSrc = item.image && item.image.startsWith('http') ? item.image : 'https://via.placeholder.com/300x200?text=Listing';
                        
                        card.innerHTML = `
                            <a href="${item.link || '#'}" target="_blank" style="text-decoration: none; color: inherit; display: block;">
                                <img src="${imgSrc}" alt="${item.title}" loading="lazy">
                                <div style="font-size: 8px; color: #fff; background: #004d40; display: inline-block; padding: 2px 5px; border-radius: 4px; margin-bottom: 4px;">FROM ${item.source.toUpperCase()}</div>
                                <h3 style="font-size: 11px; margin: 4px 0;">${item.title.substring(0, 30)}${item.title.length > 30 ? '...' : ''}</h3>
                                <p style="font-size: 10px; margin: 0; color: #666;"><i class="fas fa-map-marker-alt" style="font-size: 8px;"></i> ${item.location}</p>
                                <div class="price" style="font-size: 13px; margin-top: 4px;">${item.price}</div>
                            </a>
                        `;
                        aggregatedContainer.appendChild(card);
                    });
                    // Only show section if we have data
                    aggregatedSection.style.display = 'block';
                }
            })
            .catch(err => {
                console.log('Aggregated rentals not available yet:', err);
            });
    }
});
