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

    // === AUTH & CONTACT UNLOCK LOGIC ===
    let currentUser = null;
    try {
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
            updateAuthHeader();
        }
    } catch (e) {
        console.error('Failed to parse stored user:', e);
    }

    function updateAuthHeader() {
        const loginBtnDesktop = document.querySelector('.desktop-login');
        const loginBtnMobile = document.querySelector('.drawer-location'); // Hamburger login description
        
        if (currentUser) {
            const displayName = currentUser.displayName || currentUser.email || currentUser.phone || 'User';
            if (loginBtnDesktop) {
                loginBtnDesktop.textContent = displayName.substring(0, 10) + (displayName.length > 10 ? '..' : '');
                loginBtnDesktop.setAttribute('title', displayName);
            }
            if (loginBtnMobile) {
                loginBtnMobile.textContent = `Logged in: ${displayName}`;
            }
        } else {
            if (loginBtnDesktop) loginBtnDesktop.textContent = 'Login / Sign up';
            if (loginBtnMobile) loginBtnMobile.textContent = 'Login for Premium Features';
        }
    }

    // OTP Auth UI handlers
    const sendOtpBtn = document.getElementById('sendOtpBtn');
    const verifyOtpBtn = document.getElementById('verifyOtpBtn');
    const resendOtpBtn = document.getElementById('resendOtpBtn');
    const backToInputBtn = document.getElementById('backToInputBtn');
    
    const authIdentityInput = document.getElementById('authIdentityInput');
    const authOtpInput = document.getElementById('authOtpInput');
    const authInputStep = document.getElementById('authInputStep');
    const authOtpStep = document.getElementById('authOtpStep');
    
    const authStatusMessage = document.getElementById('authStatusMessage');
    const otpTimer = document.getElementById('otpTimer');
    
    let countdownTimerInterval = null;

    function showStatus(text, type) {
        if (!authStatusMessage) return;
        authStatusMessage.textContent = text;
        authStatusMessage.className = `auth-status-msg ${type}`;
        authStatusMessage.style.display = 'block';
    }

    function clearStatus() {
        if (authStatusMessage) {
            authStatusMessage.textContent = '';
            authStatusMessage.style.display = 'none';
        }
    }

    function startOtpTimer() {
        let count = 60;
        if (resendOtpBtn) resendOtpBtn.style.display = 'none';
        if (otpTimer) otpTimer.style.display = 'inline';
        
        clearInterval(countdownTimerInterval);
        countdownTimerInterval = setInterval(() => {
            count--;
            if (otpTimer) otpTimer.textContent = `Resend in ${count}s`;
            if (count <= 0) {
                clearInterval(countdownTimerInterval);
                if (otpTimer) otpTimer.style.display = 'none';
                if (resendOtpBtn) resendOtpBtn.style.display = 'inline';
            }
        }, 1000);
    }

    // Call send-otp API
    async function handleSendOtp() {
        const identity = authIdentityInput?.value.trim();
        if (!identity) {
            showStatus('Please enter an email or phone number.', 'error');
            return;
        }

        clearStatus();
        if (sendOtpBtn) {
            sendOtpBtn.disabled = true;
            sendOtpBtn.textContent = 'Sending...';
        }

        try {
            const response = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identity })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                showStatus('OTP sent! Please check your email inbox or console log.', 'success');
                if (authInputStep) authInputStep.style.display = 'none';
                if (authOtpStep) authOtpStep.style.display = 'block';
                startOtpTimer();
            } else {
                showStatus(data.error || 'Failed to send OTP.', 'error');
            }
        } catch (e) {
            console.error('Send OTP error:', e);
            showStatus('Connection error. Please try again.', 'error');
        } finally {
            if (sendOtpBtn) {
                sendOtpBtn.disabled = false;
                sendOtpBtn.textContent = 'Send OTP';
            }
        }
    }

    // Call verify-otp API
    async function handleVerifyOtp() {
        const identity = authIdentityInput?.value.trim();
        const otp = authOtpInput?.value.trim();

        if (!identity || !otp) {
            showStatus('Please enter the 6-digit OTP.', 'error');
            return;
        }

        clearStatus();
        if (verifyOtpBtn) {
            verifyOtpBtn.disabled = true;
            verifyOtpBtn.textContent = 'Verifying...';
        }

        try {
            const response = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identity, otp })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                currentUser = data.user;
                localStorage.setItem('auth_user', JSON.stringify(currentUser));
                updateAuthHeader();
                showStatus('Successfully logged in!', 'success');
                setTimeout(() => {
                    closeProfileModal();
                    // Reset modal steps
                    if (authInputStep) authInputStep.style.display = 'block';
                    if (authOtpStep) authOtpStep.style.display = 'none';
                    if (authOtpInput) authOtpInput.value = '';
                    clearStatus();
                }, 1000);
            } else {
                showStatus(data.error || 'Invalid OTP. Please try again.', 'error');
            }
        } catch (e) {
            console.error('Verify OTP error:', e);
            showStatus('Connection error. Please verify code.', 'error');
        } finally {
            if (verifyOtpBtn) {
                verifyOtpBtn.disabled = false;
                verifyOtpBtn.textContent = 'Verify & Log In';
            }
        }
    }

    sendOtpBtn?.addEventListener('click', handleSendOtp);
    verifyOtpBtn?.addEventListener('click', handleVerifyOtp);
    resendOtpBtn?.addEventListener('click', handleSendOtp);
    
    backToInputBtn?.addEventListener('click', () => {
        if (authInputStep) authInputStep.style.display = 'block';
        if (authOtpStep) authOtpStep.style.display = 'none';
        clearStatus();
    });

    // Contact Unlocking logic
    window.handleUnlockContact = async function(listingId, rentPrice, buttonElement) {
        if (!currentUser) {
            openProfileModal();
            // Show custom alert inside status
            setTimeout(() => {
                showStatus('Please Log In or Sign Up first to unlock contact details.', 'error');
            }, 200);
            return;
        }

        const confirmMsg = `Unlock Owner Contact Number?\n\nThis will simulate a ₹99 payment.\nIf the deal is not successful, you can click refund instantly.`;
        if (!confirm(confirmMsg)) return;

        const originalText = buttonElement.innerHTML;
        buttonElement.disabled = true;
        buttonElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        try {
            const response = await fetch('/api/listings/unlock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    listing_id: listingId,
                    user_id: currentUser.id
                })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                // Successfully unlocked! Replace button with contact details and refund action
                buttonElement.parentNode.innerHTML = `
                    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 10px; margin-top: 12px; font-size: 13px; text-align: center; color: #166534; clear: both;">
                        <p style="margin: 0 0 4px; font-weight: 700;"><i class="fas fa-phone-alt"></i> Contact: ${data.contact_number}</p>
                        <button onclick="handleRequestRefund(${data.lead_id}, this)" style="background: #fee2e2; border: 1px solid #fca5a5; color: #991b1b; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; margin-top: 6px;">Request ₹99 Refund</button>
                    </div>
                `;
            } else {
                alert(data.error || 'Failed to unlock listing.');
                buttonElement.disabled = false;
                buttonElement.innerHTML = originalText;
            }
        } catch (e) {
            console.error('Unlock error:', e);
            alert('Connection error. Please try again.');
            buttonElement.disabled = false;
            buttonElement.innerHTML = originalText;
        }
    };

    // Refund logic
    window.handleRequestRefund = async function(leadId, buttonElement) {
        if (!confirm('Are you sure you want to request a refund of your ₹99 lead fee?\n\nThis will simulate an instant refund via Razorpay.')) return;

        buttonElement.disabled = true;
        buttonElement.textContent = 'Refunding...';

        try {
            const response = await fetch('/api/leads/refund', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lead_id: leadId,
                    user_id: currentUser.id
                })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                alert(data.message);
                // Replace parent container with Refunded message
                buttonElement.parentNode.innerHTML = `
                    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 10px; margin-top: 12px; font-size: 13px; text-align: center; color: #991b1b; font-weight: 700; width: 100%;">
                        <i class="fas fa-check-circle"></i> ₹99 Refunded
                    </div>
                `;
            } else {
                alert(data.error || 'Failed to request refund.');
                buttonElement.disabled = false;
                buttonElement.textContent = 'Request ₹99 Refund';
            }
        } catch (e) {
            console.error('Refund error:', e);
            alert('Connection error. Please try again.');
            buttonElement.disabled = false;
            buttonElement.textContent = 'Request ₹99 Refund';
        }
    };
});
