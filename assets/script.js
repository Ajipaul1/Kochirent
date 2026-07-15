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
            
            // Set active state on bottom nav items if clicked
            const parentNav = item.closest('.bottom-navigation');
            if (parentNav) {
                parentNav.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            }

            const action = item.dataset.navAction;
            if (action === 'home') {
                showHomeView();
                doScroll('top');
            }
            if (action === 'search') {
                showHomeView();
                doScroll('hero');
            }
            if (action === 'post') {
                if (!currentUser) {
                    openProfileModal();
                    setTimeout(() => showStatus('Please log in first to post listings.', 'error'), 200);
                } else {
                    showDashboardView();
                    // Activate Post Deal tab
                    document.querySelectorAll('.dash-tab-btn').forEach(b => b.classList.remove('active'));
                    const tab = document.getElementById('postDealDashTab');
                    if (tab) tab.classList.add('active');
                    document.querySelectorAll('.dash-tab-content').forEach(c => c.style.display = 'none');
                    const postContent = document.getElementById('dash-post-deal');
                    if (postContent) postContent.style.display = 'block';
                }
            }
            if (action === 'messages') openWhatsapp();
            if (action === 'profile') {
                if (!currentUser) {
                    openProfileModal();
                } else {
                    showDashboardView();
                }
            }
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
            // Show desktop dashboard link
            const dashLink = document.getElementById('desktopDashboardLink');
            if (dashLink) dashLink.style.display = 'inline-block';
        }
    } catch (e) {
        console.error('Failed to parse stored user:', e);
    }

    function updateAuthHeader() {
        const loginBtnDesktop = document.querySelector('.desktop-login');
        const loginBtnMobile = document.querySelector('.drawer-location'); // Hamburger login description
        const drawerTitle = document.querySelector('.drawer-welcome-title');
        
        if (currentUser) {
            const displayName = currentUser.name || currentUser.displayName || currentUser.email || currentUser.phone || 'User';
            if (loginBtnDesktop) {
                loginBtnDesktop.textContent = displayName.substring(0, 10) + (displayName.length > 10 ? '..' : '');
                loginBtnDesktop.setAttribute('title', displayName);
            }
            if (drawerTitle) {
                drawerTitle.textContent = displayName.substring(0, 15) + (displayName.length > 15 ? '..' : '');
            }
            if (loginBtnMobile) {
                loginBtnMobile.textContent = 'Log Out Account';
                loginBtnMobile.style.color = '#ef4444';
                loginBtnMobile.style.textDecoration = 'underline';
            }
        } else {
            if (loginBtnDesktop) loginBtnDesktop.textContent = 'Login / Sign up';
            if (drawerTitle) drawerTitle.textContent = 'KochiNest User';
            if (loginBtnMobile) {
                loginBtnMobile.textContent = 'Click to Login / Sign Up';
                loginBtnMobile.style.color = 'rgba(255,255,255,0.7)';
                loginBtnMobile.style.textDecoration = 'none';
            }
        }
    }

    // Make mobile drawer profile section interactive (click to Login or Logout)
    const drawerWelcome = document.querySelector('.drawer-welcome');
    if (drawerWelcome) {
        drawerWelcome.style.cursor = 'pointer';
        drawerWelcome.addEventListener('click', () => {
            if (!currentUser) {
                openProfileModal();
                const menuOverlay = document.getElementById('mobileMenuOverlay');
                if (menuOverlay) menuOverlay.style.display = 'none';
            } else {
                if (confirm('Are you sure you want to log out?')) {
                    logOutUser();
                }
            }
        });
    }

    function logOutUser() {
        localStorage.removeItem('auth_user');
        currentUser = null;
        updateAuthHeader();
        const dashLink = document.getElementById('desktopDashboardLink');
        if (dashLink) dashLink.style.display = 'none';
        showHomeView();
        window.location.reload();
    }

    // View toggles
    window.showHomeView = function() {
        document.getElementById('heroSection').style.display = 'block';
        document.getElementById('pricingSection').style.display = 'block';
        document.getElementById('verifiedSection').style.display = 'block';
        const aggregatedSection = document.getElementById('aggregatedRentalsSection');
        if (aggregatedSection) aggregatedSection.style.display = 'block';
        document.getElementById('dashboardSection').style.display = 'none';
        
        // Update active nav state in bottom bar
        const navItems = document.querySelectorAll('.bottom-navigation .nav-item');
        navItems.forEach(i => i.classList.remove('active'));
        const homeNav = document.querySelector('.bottom-navigation .nav-item[data-nav-action="home"]');
        if (homeNav) homeNav.classList.add('active');
    }

    window.showDashboardView = function() {
        if (!currentUser) {
            openProfileModal();
            return;
        }
        
        document.getElementById('heroSection').style.display = 'none';
        document.getElementById('pricingSection').style.display = 'none';
        document.getElementById('verifiedSection').style.display = 'none';
        const aggregatedSection = document.getElementById('aggregatedRentalsSection');
        if (aggregatedSection) aggregatedSection.style.display = 'none';
        document.getElementById('dashboardSection').style.display = 'block';
        
        // Update active nav state in bottom bar
        const navItems = document.querySelectorAll('.bottom-navigation .nav-item');
        navItems.forEach(i => i.classList.remove('active'));
        const profileNav = document.querySelector('.bottom-navigation .nav-item[data-nav-action="profile"]');
        if (profileNav) profileNav.classList.add('active');
        
        // Load user metrics and dashboard data
        loadDashboardData();
    }

    // Helper to proceed after successful authentication
    function proceedAfterLogin(user) {
        currentUser = user;
        localStorage.setItem('auth_user', JSON.stringify(currentUser));
        updateAuthHeader();
        
        // Show desktop dashboard link
        const dashLink = document.getElementById('desktopDashboardLink');
        if (dashLink) dashLink.style.display = 'inline-block';
        
        closeProfileModal();
        clearStatus();
        
        // Reset modal steps
        if (authInputStep) authInputStep.style.display = 'block';
        if (authOtpStep) authOtpStep.style.display = 'none';
        if (authOtpInput) authOtpInput.value = '';
        
        if (!currentUser.name || !currentUser.purpose) {
            // Open complete profile modal
            const regModal = document.getElementById('registerDetailsModal');
            if (regModal) {
                // Pre-populate known email/phone
                const regEmail = document.getElementById('regEmail');
                const regPhone = document.getElementById('regPhone');
                if (regEmail && currentUser.email) regEmail.value = currentUser.email;
                if (regPhone && currentUser.phone) regPhone.value = currentUser.phone;
                regModal.style.display = 'flex';
            }
        } else {
            showDashboardView();
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

        const isEmail = identity.includes('@');

        if (isEmail) {
            // Email Auth -> Call SMTP backend API
            try {
                const response = await fetch('/api/auth/send-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identity })
                });
                const data = await response.json();
                if (response.ok && data.success) {
                    showStatus('OTP sent! Please check your email inbox.', 'success');
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
        } else {
            // Phone Auth -> Call Firebase Auth
            let formattedPhone = identity.replace(/[\s\-\(\)]/g, '');
            formattedPhone = formattedPhone.replace(/[^0-9+]/g, '');

            if (!formattedPhone.startsWith('+')) {
                if (formattedPhone.length === 12 && formattedPhone.startsWith('91')) {
                    formattedPhone = '+' + formattedPhone;
                } else {
                    if (formattedPhone.startsWith('0')) {
                        formattedPhone = formattedPhone.substring(1);
                    }
                    formattedPhone = '+91' + formattedPhone;
                }
            }
            console.log("Firebase Auth Phone Number:", formattedPhone);

            try {
                if (!window.recaptchaVerifier) {
                    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
                        'size': 'invisible'
                    });
                }

                const confirmationResult = await window.firebaseAuth.signInWithPhoneNumber(formattedPhone, window.recaptchaVerifier);
                window.confirmationResult = confirmationResult;
                
                showStatus('SMS OTP sent! Please check your mobile phone.', 'success');
                if (authInputStep) authInputStep.style.display = 'none';
                if (authOtpStep) authOtpStep.style.display = 'block';
                startOtpTimer();
            } catch (e) {
                console.error('Firebase SMS send error:', e);
                showStatus('Failed to send SMS OTP: ' + (e.message || 'Check phone number format.'), 'error');
            } finally {
                if (sendOtpBtn) {
                    sendOtpBtn.disabled = false;
                    sendOtpBtn.textContent = 'Send OTP';
                }
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

        const isEmail = identity.includes('@');

        if (isEmail) {
            try {
                const response = await fetch('/api/auth/verify-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identity, otp })
                });
                const data = await response.json();
                if (response.ok && data.success) {
                    proceedAfterLogin(data.user);
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
        } else {
            if (!window.confirmationResult) {
                showStatus('No active OTP session. Please request OTP again.', 'error');
                if (verifyOtpBtn) {
                    verifyOtpBtn.disabled = false;
                    verifyOtpBtn.textContent = 'Verify & Log In';
                }
                return;
            }

            try {
                const result = await window.confirmationResult.confirm(otp);
                const firebaseUser = result.user;
                const phone = firebaseUser.phoneNumber;

                const response = await fetch('/api/auth/firebase-login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone })
                });
                const data = await response.json();

                if (response.ok && data.success) {
                    proceedAfterLogin(data.user);
                } else {
                    showStatus('Postgres DB registration failed.', 'error');
                }
            } catch (e) {
                console.error('Firebase verification error:', e);
                showStatus('Invalid SMS OTP. Please try again.', 'error');
            } finally {
                if (verifyOtpBtn) {
                    verifyOtpBtn.disabled = false;
                    verifyOtpBtn.textContent = 'Verify & Log In';
                }
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

    // Complete profile registration details submit
    const registerDetailsForm = document.getElementById('registerDetailsForm');
    registerDetailsForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user_id = currentUser?.id;
        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const phone = document.getElementById('regPhone').value.trim();
        const purpose = document.getElementById('regPurpose').value;

        if (!user_id || !name || !purpose) return;

        try {
            const response = await fetch('/api/auth/register-details', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id, name, email, phone, purpose })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                currentUser = data.user;
                localStorage.setItem('auth_user', JSON.stringify(currentUser));
                updateAuthHeader();
                document.getElementById('registerDetailsModal').style.display = 'none';
                showDashboardView();
            } else {
                alert(data.error || 'Failed to save profile details.');
            }
        } catch (err) {
            console.error('Error saving profile details:', err);
            alert('Failed to save details. Try again.');
        }
    });

    // Contact Unlocking logic
    window.handleUnlockContact = async function(listingId, rentPrice, buttonElement) {
        if (!currentUser) {
            openProfileModal();
            setTimeout(() => {
                showStatus('Please Log In or Sign Up first to unlock contact details.', 'error');
            }, 200);
            return;
        }

        const confirmMsg = `Unlock Owner Contact Number?

This will use 1 unlock token from your account.`;
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
                // Update local token count and save
                currentUser.tokens = data.new_tokens;
                localStorage.setItem('auth_user', JSON.stringify(currentUser));
                
                // Successfully unlocked! Show contact details and direct WhatsApp redirect link
                const waLink = `https://wa.me/916282520339?text=Hi KochiNest! I unlocked the contact for property ID ${listingId}. Please connect me with the owner.`;
                buttonElement.parentNode.innerHTML = `
                    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 10px; margin-top: 12px; font-size: 13px; text-align: center; color: #166534; clear: both; width: 100%;">
                        <p style="margin: 0 0 4px; font-weight: 700;"><i class="fas fa-phone-alt"></i> Contact: ${data.contact_number}</p>
                        <a href="${waLink}" target="_blank" style="background: #25d366; color: white; display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 600; text-decoration: none; margin-top: 4px; margin-right: 6px;"><i class="fab fa-whatsapp"></i> Get Details on WhatsApp</a>
                        <button onclick="handleRequestRefund(${data.lead_id}, this)" style="background: #fee2e2; border: 1px solid #fca5a5; color: #991b1b; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; margin-top: 4px;">Request Refund</button>
                    </div>
                `;
            } else if (response.status === 402 || data.error === 'insufficient_tokens') {
                // Insufficient tokens -> Prompt to buy unlocks
                alert("You have 0 unlocks remaining. Please click 'Buy 3 Unlocks (Rs. 100)' in your dashboard to continue.");
                buttonElement.disabled = false;
                buttonElement.innerHTML = originalText;
                // Switch to dashboard
                showDashboardView();
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
        if (!confirm(`Are you sure you want to mark this deal as failed?

This will refund 1 unlock token back to your KochiNest dashboard instantly.`)) return;

        buttonElement.disabled = true;
        buttonElement.textContent = 'Processing...';

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
                // Increment tokens in local session
                currentUser.tokens = (currentUser.tokens || 0) + 1;
                localStorage.setItem('auth_user', JSON.stringify(currentUser));
                
                // Replace parent container with Refunded message
                buttonElement.parentNode.innerHTML = `
                    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 10px; margin-top: 12px; font-size: 13px; text-align: center; color: #991b1b; font-weight: 700; width: 100%;">
                        <i class="fas fa-check-circle"></i> Token Refunded to Dashboard
                    </div>
                `;
            } else {
                alert(data.error || 'Failed to request refund.');
                buttonElement.disabled = false;
                buttonElement.textContent = 'Request Refund';
            }
        } catch (e) {
            console.error('Refund error:', e);
            alert('Connection error. Please try again.');
            buttonElement.disabled = false;
            buttonElement.textContent = 'Request Refund';
        }
    };

    // Load Public Listings on Home Page from Postgres
    async function loadPublicListings() {
        const container = document.querySelector('.verified-cards-container');
        if (!container) return;

        try {
            const response = await fetch('/api/listings');
            if (!response.ok) throw new Error('Failed to load listings');
            const listings = await response.json();
            
            if (listings && listings.length > 0) {
                container.innerHTML = ''; // Clear hardcoded
                listings.forEach(listing => {
                    const title = listing.title.substring(0, 30) + (listing.title.length > 30 ? '...' : '');
                    const card = document.createElement('div');
                    card.className = 'verified-card';
                    card.setAttribute('data-listing-id', listing.id);
                    
                    // Increment view count when user hovers over listing
                    card.addEventListener('mouseenter', () => {
                        fetch(`/api/listings/${listing.id}/view`, { method: 'POST' }).catch(() => {});
                    }, { once: true });
                    
                    const rentText = listing.title.toLowerCase().includes('bike') || listing.title.toLowerCase().includes('car') ? '/day' : '/month';
                    
                    card.innerHTML = `
                        <img src="${listing.photo_urls || 'https://via.placeholder.com/300x200?text=Listing'}" alt="${listing.title}" loading="lazy" style="height: 140px; object-fit: cover;">
                        <div class="verified-badge">KOCHINEST VERIFIED</div>
                        <h3>${title}</h3>
                        <p><i class="fas fa-map-marker-alt" style="font-size: 11px;"></i> ${listing.location}</p>
                        <div class="price">₹${parseInt(listing.rent_price).toLocaleString()} <span>${rentText}</span></div>
                        <div class="unlock-container">
                            <button class="unlock-number-btn" onclick="handleUnlockContact(${listing.id}, ${listing.rent_price}, this)">
                                <i class="fas fa-phone-alt"></i> Get Contact (Unlock)
                            </button>
                        </div>
                    `;
                    container.appendChild(card);
                });
            }
        } catch (e) {
            console.error('Error loading public listings:', e);
        }
    }

    // Dashboard Data loading
    async function loadDashboardData() {
        if (!currentUser) return;
        
        // 1. Populate Profile Card
        const avatar = document.getElementById('dashProfileAvatar');
        const nameText = document.getElementById('dashProfileName');
        const purposeText = document.getElementById('dashProfilePurpose');
        const contactText = document.getElementById('dashProfileContact');
        const tokensText = document.getElementById('dashProfileTokens');
        
        nameText.textContent = currentUser.name || 'User Profile';
        purposeText.textContent = currentUser.purpose === 'posting' ? 'Listing Owner' : 'Renting Stay/Vehicles';
        contactText.textContent = currentUser.email || currentUser.phone || '';
        tokensText.textContent = currentUser.tokens || 0;
        
        // 2. Fetch Owner Posted Listings
        const userListingsContainer = document.getElementById('userListingsContainer');
        try {
            const res = await fetch(`/api/listings/user/${currentUser.id}`);
            const listings = await res.json();
            if (res.ok && listings && listings.length > 0) {
                userListingsContainer.innerHTML = '';
                listings.forEach(listing => {
                    const card = document.createElement('div');
                    card.className = 'dash-card';
                    card.innerHTML = `
                        <img src="${listing.photo_urls || 'https://via.placeholder.com/300x200?text=Listing'}">
                        <div class="dash-card-content">
                            <h4>${listing.title}</h4>
                            <p><i class="fas fa-map-marker-alt"></i> ${listing.location}</p>
                            <p style="font-weight:700; color:#0ea5e9;">Rent: ₹${parseInt(listing.rent_price).toLocaleString()}</p>
                            <div class="dash-card-metrics">
                                <span><i class="fas fa-eye"></i> Views: ${listing.views_count}</span>
                                <span><i class="fas fa-unlock"></i> Unlocks: ${listing.unlocks_count}</span>
                            </div>
                            ${listing.deal_status === 'available' ? 
                              `<button class="dash-card-action-btn" onclick="openGenerateAgreementModal(${listing.id}, ${listing.rent_price}, '${listing.title.replace(/'/g, "\'")}')"><i class="fas fa-handshake"></i> Close Deal & Generate Agreement</button>` : 
                              `<div style="color:#10b981; font-weight:700; text-align:center; padding: 6px; background:#ecfdf5; border-radius:6px; font-size:12px; margin-top:5px;"><i class="fas fa-check-double"></i> Deal Finalized</div>`
                            }
                        </div>
                    `;
                    userListingsContainer.appendChild(card);
                });
            } else {
                userListingsContainer.innerHTML = `<p class="empty-state-text">You haven't posted any listings yet. Click "Post Your Deal" to get started!</p>`;
            }
        } catch (err) {
            console.error('Error fetching dashboard listings:', err);
        }

        // 3. Fetch Tenant Leads
        const userLeadsContainer = document.getElementById('userLeadsContainer');
        try {
            const res = await fetch(`/api/leads/user/${currentUser.id}`);
            const leads = await res.json();
            if (res.ok && leads && leads.length > 0) {
                userLeadsContainer.innerHTML = '';
                leads.forEach(lead => {
                    const card = document.createElement('div');
                    card.className = 'dash-card';
                    const waLink = `https://wa.me/916282520339?text=Hi KochiNest! I unlocked the contact for property ${lead.title} (ID ${lead.listing_id}) and want to close the deal.`;
                    card.innerHTML = `
                        <img src="${lead.photo_urls || 'https://via.placeholder.com/300x200?text=Listing'}">
                        <div class="dash-card-content">
                            <h4>${lead.title}</h4>
                            <p><i class="fas fa-map-marker-alt"></i> ${lead.location}</p>
                            <p style="font-weight:700; color:#0ea5e9;">Rent: ₹${parseInt(lead.rent_price).toLocaleString()}</p>
                            
                            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; font-size:12px; margin-top:5px;">
                                <p style="margin:0 0 2px;"><i class="fas fa-phone-alt"></i> Owner Phone: <strong>${lead.contact_number}</strong></p>
                            </div>
                            
                            ${lead.refunded ? 
                              `<div style="color:#ef4444; font-weight:700; text-align:center; padding: 6px; background:#fef2f2; border-radius:6px; font-size:12px;"><i class="fas fa-info-circle"></i> Deal Failed (Token Refunded)</div>` : 
                              `<div style="display:flex; gap:5px; margin-top:5px;">
                                  <a href="${waLink}" target="_blank" class="dash-card-action-btn" style="background:#25d366; font-size:11px; margin:0;"><i class="fab fa-whatsapp"></i> Chat on WhatsApp</a>
                                  <button class="dash-card-action-btn" style="background:#ef4444; font-size:11px; margin:0;" onclick="handleRequestRefund(${lead.lead_id}, this)">Mark Deal Failed</button>
                               </div>`
                            }
                        </div>
                    `;
                    userLeadsContainer.appendChild(card);
                });
            } else {
                userLeadsContainer.innerHTML = `<p class="empty-state-text">You haven't unlocked any contacts yet.</p>`;
            }
        } catch (err) {
            console.error('Error fetching dashboard leads:', err);
        }

        // 4. Fetch Agreements
        const userAgreementsContainer = document.getElementById('userAgreementsContainer');
        try {
            const res = await fetch(`/api/agreements/user/${currentUser.id}`);
            const agreements = await res.json();
            if (res.ok && agreements && agreements.length > 0) {
                userAgreementsContainer.innerHTML = '';
                agreements.forEach(agree => {
                    const card = document.createElement('div');
                    card.className = 'dash-card';
                    
                    const role = agree.is_owner ? 'owner' : 'tenant';
                    const rentVal = parseFloat(agree.rent_amount);
                    const brokerageVal = rentVal / 6;
                    const isSelfPaid = agree.is_owner ? agree.owner_paid_brokerage : agree.tenant_paid_brokerage;
                    
                    card.innerHTML = `
                        <div class="dash-card-content" style="padding:20px;">
                            <h4 style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px; margin-bottom:10px;">Lease: ${agree.listing_title}</h4>
                            <p><strong>Owner:</strong> ${agree.owner_name} (${agree.owner_phone})</p>
                            <p><strong>Tenant:</strong> ${agree.tenant_name} (${agree.tenant_phone})</p>
                            <p><strong>Rent Amount:</strong> ₹${rentVal.toLocaleString()}/month</p>
                            <p><strong>Brokerage Due (1/6th rent):</strong> ₹${brokerageVal.toLocaleString()}</p>
                            <p><strong>Start Date:</strong> ${agree.start_date}</p>
                            
                            <div style="background:rgba(15,23,42,0.4); padding:10px; border-radius:6px; font-size:11px; margin: 10px 0;">
                                <p style="margin:0 0 4px;">Owner Brokerage: ${agree.owner_paid_brokerage ? '<span style="color:#10b981;">PAID</span>' : '<span style="color:#f59e0b;">PENDING</span>'}</p>
                                <p style="margin:0;">Tenant Brokerage: ${agree.tenant_paid_brokerage ? '<span style="color:#10b981;">PAID</span>' : '<span style="color:#f59e0b;">PENDING</span>'}</p>
                            </div>
                            
                            ${!isSelfPaid ? 
                              `<button class="dash-card-action-btn" onclick="payBrokerageFee(${agree.id}, '${role}')"><i class="fas fa-credit-card"></i> Pay Brokerage (₹${brokerageVal.toLocaleString()})</button>` : 
                              `<div style="color:#10b981; font-weight:700; text-align:center; padding: 6px; background:#ecfdf5; border-radius:6px; font-size:11px; margin-bottom:5px;"><i class="fas fa-check-circle"></i> Your Brokerage Paid</div>`
                            }
                            
                            ${agree.both_paid ? 
                              `<a href="/api/agreements/download/${agree.id}" class="dash-card-action-btn" style="background:#10b981; text-align:center;"><i class="fas fa-download"></i> Download Lease Agreement PDF</a>` : 
                              `<button class="dash-card-action-btn secondary" disabled style="cursor:not-allowed;"><i class="fas fa-lock"></i> PDF Locked (Pending Both Payments)</button>`
                            }
                        </div>
                    `;
                    userAgreementsContainer.appendChild(card);
                });
            } else {
                userAgreementsContainer.innerHTML = '<p class="empty-state-text">No active agreements found.</p>';
            }
        } catch (err) {
            console.error('Error fetching agreements:', err);
        }
    }

    // Buy Tokens Payment simulation (Rs. 100)
    const buyTokensBtn = document.getElementById('buyTokensBtn');
    buyTokensBtn?.addEventListener('click', async () => {
        if (!currentUser) return;
        
        if (!confirm(`Pay Rs. 100 to purchase 3 contact unlocks?

This will trigger a mock UPI payment simulation.`)) return;
        
        try {
            const response = await fetch('/api/payments/buy-tokens', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: currentUser.id })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                currentUser.tokens = data.tokens;
                localStorage.setItem('auth_user', JSON.stringify(currentUser));
                alert(data.message);
                loadDashboardData();
            } else {
                alert(data.error || 'Payment failed.');
            }
        } catch (err) {
            console.error('Buy tokens error:', err);
            alert('Connection error. Please try again.');
        }
    });

    // Create property listing submit
    const createListingForm = document.getElementById('createListingForm');
    createListingForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUser) return;

        const title = document.getElementById('listingTitle').value.trim();
        const category = document.getElementById('listingCategory').value;
        const rent_price = parseFloat(document.getElementById('listingRent').value);
        const rent_deposit = parseFloat(document.getElementById('listingDeposit').value || 0);
        const location = document.getElementById('listingLocation').value.trim();
        const contact_number = document.getElementById('listingContact').value.trim();
        const sqft = parseInt(document.getElementById('listingSqft').value || 0);
        const floor_number = parseInt(document.getElementById('listingFloor').value || 0);
        const photo_urls = document.getElementById('listingPhoto').value.trim();
        const facilities = document.getElementById('listingFacilities').value.trim();

        try {
            const response = await fetch('/api/listings/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    owner_id: currentUser.id,
                    title, category, rent_price, rent_deposit, location, contact_number, sqft, floor_number, photo_urls, facilities
                })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                alert(data.message);
                createListingForm.reset();
                
                // Reload home public listings & switch back to listings tab
                loadPublicListings();
                
                // Activate My Listings tab in dashboard
                document.querySelectorAll('.dash-tab-btn').forEach(btn => btn.classList.remove('active'));
                document.querySelector('.dash-tab-btn[data-dash-tab="my-listings"]').classList.add('active');
                document.querySelectorAll('.dash-tab-content').forEach(c => c.style.display = 'none');
                document.getElementById('dash-my-listings').style.display = 'block';
                
                loadDashboardData();
            } else {
                alert(data.error || 'Failed to post listing.');
            }
        } catch (err) {
            console.error('Post listing error:', err);
            alert('Connection error. Please try again.');
        }
    });

    // Pay 1/6th rent brokerage simulated payment
    window.payBrokerageFee = async function(agreementId, role) {
        if (!confirm(`Simulate payment of 1/6th rent brokerage fee as ${role}?

This will trigger a mock credit card/UPI verification.`)) return;

        try {
            const response = await fetch('/api/agreements/pay-brokerage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agreement_id: agreementId,
                    role: role
                })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                alert('Brokerage payment received successfully! PDF download is unlocked when both parties pay.');
                loadDashboardData();
            } else {
                alert(data.error || 'Brokerage payment failed.');
            }
        } catch (err) {
            console.error('Brokerage payment error:', err);
            alert('Connection error. Please try again.');
        }
    };

    // Open Close Deal Agreement modal
    window.openGenerateAgreementModal = function(listingId, rentPrice, title) {
        document.getElementById('agreeListingId').value = listingId;
        document.getElementById('agreeRent').value = rentPrice;
        document.getElementById('agreeDeposit').value = rentPrice * 2; // Default security deposit = 2 months rent
        document.getElementById('agreeTenantName').value = '';
        document.getElementById('agreeTenantPhone').value = '';
        document.getElementById('agreeTenantEmail').value = '';
        document.getElementById('agreeDuration').value = 11; // Standard 11 months duration
        document.getElementById('agreeStartDate').value = new Date().toISOString().substring(0, 10);
        
        document.getElementById('generateAgreementModal').style.display = 'flex';
    }

    // Submit generate agreement form
    const generateAgreementForm = document.getElementById('generateAgreementForm');
    generateAgreementForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const listing_id = parseInt(document.getElementById('agreeListingId').value);
        const tenant_name = document.getElementById('agreeTenantName').value.trim();
        const tenant_phone = document.getElementById('agreeTenantPhone').value.trim();
        const tenant_email = document.getElementById('agreeTenantEmail').value.trim();
        const start_date = document.getElementById('agreeStartDate').value;
        const duration_months = parseInt(document.getElementById('agreeDuration').value);
        const rent_amount = parseFloat(document.getElementById('agreeRent').value);
        const deposit_amount = parseFloat(document.getElementById('agreeDeposit').value);

        try {
            const response = await fetch('/api/agreements/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    listing_id, tenant_name, tenant_phone, tenant_email, start_date, duration_months, rent_amount, deposit_amount
                })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                alert('Deal closed and Rental Agreement generated! You can pay success brokerage in the Agreements tab to unlock the PDF.');
                document.getElementById('generateAgreementModal').style.display = 'none';
                
                // Reload home listings (removes deal) & refresh dashboard
                loadPublicListings();
                
                // Switch to agreements tab in dashboard
                document.querySelectorAll('.dash-tab-btn').forEach(btn => btn.classList.remove('active'));
                document.querySelector('.dash-tab-btn[data-dash-tab="my-agreements"]').classList.add('active');
                document.querySelectorAll('.dash-tab-content').forEach(c => c.style.display = 'none');
                document.getElementById('dash-my-agreements').style.display = 'block';
                
                loadDashboardData();
            } else {
                alert(data.error || 'Failed to close deal and generate agreement.');
            }
        } catch (err) {
            print(err);
            alert('Connection error. Please try again.');
        }
    });

    // Bind dashboard tab buttons
    const dashTabButtons = document.querySelectorAll('.dash-tab-btn');
    dashTabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            dashTabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const tabId = btn.getAttribute('data-dash-tab');
            document.querySelectorAll('.dash-tab-content').forEach(content => {
                content.style.display = 'none';
            });
            
            const targetContent = document.getElementById(`dash-${tabId}`);
            if (targetContent) targetContent.style.display = 'block';
        });
    });



    // Initial load: Fetch listings from Postgres
    loadPublicListings();
});
