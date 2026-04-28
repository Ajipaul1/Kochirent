window.initKochiNestMapSearch = () => {};

document.addEventListener('DOMContentLoaded', () => {
    const suggestionBox = document.getElementById('search-suggestions');
    const searchContainer = document.querySelector('.search-tabs-container');
    const tabButtons = document.querySelectorAll('.tab-button');
    const searchInputs = document.querySelectorAll('[data-search-input]');
    const propertyTypeSelect = document.getElementById('stay-property-type');
    const noResultsFound = document.getElementById('noResultsFound');
    const noResultsMessage = document.getElementById('noResultsMessage');
    const nearbyAlternativesList = document.getElementById('nearbyAlternativesList');
    const customRepairRedirect = document.getElementById('customRepairRedirect');
    const smartLeadForm = document.getElementById('smartLeadForm');

    if (!suggestionBox || !searchContainer || !searchInputs.length) return;

    const KOCHI_CENTER = { lat: 9.9312, lng: 76.2673 };
    const KOCHI_RADIUS_METERS = 50000;

    const kochiBounds = {
        north: KOCHI_CENTER.lat + 0.45,
        south: KOCHI_CENTER.lat - 0.45,
        east: KOCHI_CENTER.lng + 0.45,
        west: KOCHI_CENTER.lng - 0.45
    };

    const searchableInventory = {
        stay: ['kakkanad', 'edappally', 'aluva', 'kadavanthra', 'mg road', 'fort kochi', 'marine drive', 'palarivattom'],
        move: ['kakkanad', 'edappally', 'aluva', 'kadavanthra', 'mg road', 'fort kochi', 'airport', 'palarivattom'],
        service: ['ac repair', 'washing machine repair', 'plumbing', 'electrician', 'packers', 'movers']
    };

    const fallbackAlternatives = {
        'fort kochi': ['MG Road', 'Kadavanthra', 'Marine Drive'],
        'infopark': ['Kakkanad', 'Palarivattom', 'Edappally'],
        'airport': ['Aluva', 'Nedumbassery', 'Kakkanad'],
        default: ['MG Road', 'Kadavanthra', 'Edappally']
    };

    const searchState = {
        stay: { text: '', place_id: '', formatted_address: '' },
        move: {
            from: { text: '', place_id: '', formatted_address: '' },
            to: { text: '', place_id: '', formatted_address: '' }
        },
        service: { type: '', area: '' }
    };

    const mockSuggestions = {
        service: [
            { label: 'AC Repair', value: 'AC Repair' },
            { label: 'Washing Machine Repair', value: 'Washing Machine Repair' },
            { label: 'Plumbing', value: 'Plumbing' },
            { label: 'Refrigerator Repair', value: 'Refrigerator Repair' },
            { label: 'Electrician Service', value: 'Electrician Service' }
        ]
    };

    let activeInput = null;
    let activeTabType = 'stay';
    let debounceTimer = null;

    const debounce = (callback, delay = 220) => (...args) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => callback(...args), delay);
    };

    const setBoxPosition = (input) => {
        const field = input?.closest('.search-field');
        if (!field) return;

        const fieldRect = field.getBoundingClientRect();
        const parentRect = searchContainer.getBoundingClientRect();

        suggestionBox.style.left = `${fieldRect.left - parentRect.left}px`;
        suggestionBox.style.top = `${fieldRect.bottom - parentRect.top + 6}px`;
        suggestionBox.style.width = `${fieldRect.width}px`;
    };

    const showSuggestionState = (message, loading = false) => {
        suggestionBox.hidden = false;
        suggestionBox.innerHTML = `<div class="suggestion-state">${loading ? '<span class="suggestion-spinner" aria-hidden="true"></span>' : ''}${message}</div>`;
    };

    const hideSuggestions = () => {
        suggestionBox.hidden = true;
        suggestionBox.innerHTML = '';
    };

    const setNoResultsVisibility = (visible) => {
        if (!noResultsFound) return;
        noResultsFound.hidden = !visible;
    };

    const getAlternatives = (term) => {
        const normalized = term.trim().toLowerCase();
        if (!normalized) return fallbackAlternatives.default;
        const matchedKey = Object.keys(fallbackAlternatives).find((key) => key !== 'default' && normalized.includes(key));
        return fallbackAlternatives[matchedKey] || fallbackAlternatives.default;
    };

    const showNoResults = (term, tabType) => {
        setNoResultsVisibility(true);
        const safeTerm = term || 'your selected area';
        noResultsFound.querySelector('h2').textContent = `Looking for rentals in ${safeTerm}?`;
        noResultsMessage.textContent = `We are currently updating our listings for ${safeTerm}. Want us to find this for you?`;

        const alternatives = getAlternatives(safeTerm);
        nearbyAlternativesList.innerHTML = alternatives
            .map((item) => `<a href="#" data-suggested-term="${item}">${item}</a>`)
            .join('');

        nearbyAlternativesList.querySelectorAll('[data-suggested-term]').forEach((link) => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const value = link.dataset.suggestedTerm || '';
                if (tabType === 'stay') {
                    document.getElementById('stay-location').value = value;
                } else if (tabType === 'move') {
                    document.getElementById('move-to').value = value;
                } else {
                    document.getElementById('service-area').value = value;
                }
                setNoResultsVisibility(false);
            });
        });

        const isCustomRepairRequest = tabType === 'service' && /(repair|service|fix)/i.test(safeTerm)
            && !searchableInventory.service.some((service) => safeTerm.toLowerCase().includes(service));
        customRepairRedirect.hidden = !isCustomRepairRequest;
    };

    const applyStayPropertyTypes = (suggestion) => {
        if (!propertyTypeSelect || !suggestion?.propertyTypes?.length) return;

        Array.from(propertyTypeSelect.options).forEach((option) => {
            if (!option.value) {
                option.hidden = false;
                option.disabled = false;
                return;
            }

            const allowed = suggestion.propertyTypes.includes(option.value);
            option.hidden = !allowed;
            option.disabled = !allowed;
        });

        if (propertyTypeSelect.selectedOptions[0]?.disabled) {
            propertyTypeSelect.value = '';
        }
    };

    const renderSuggestions = (suggestions, input, tabType) => {
        suggestionBox.hidden = false;

        suggestionBox.innerHTML = suggestions
            .map((item) => `<button type="button" class="suggestion-item" data-value="${item.value}" data-label="${item.label}">${item.label}</button>`)
            .join('');

        suggestionBox.querySelectorAll('.suggestion-item').forEach((itemButton, index) => {
            itemButton.addEventListener('click', () => {
                const selected = suggestions[index];
                input.value = selected.value;
                if (tabType === 'stay') {
                    applyStayPropertyTypes(selected);
                }
                hideSuggestions();
                input.dispatchEvent(new Event('change', { bubbles: true }));
            });
        });
    };

    const filterMockSuggestions = (query, tabType) => {
        const list = mockSuggestions[tabType] || [];
        const normalized = query.trim().toLowerCase();
        if (!normalized) return [];

        return list.filter((item) => item.label.toLowerCase().includes(normalized));
    };

    const fetchSuggestions = async (query, tabType) => {
        const endpoint = `/api/search/suggestions?q=${encodeURIComponent(query)}&type=${encodeURIComponent(tabType)}`;

        try {
            const response = await fetch(endpoint, { headers: { Accept: 'application/json' } });
            if (!response.ok) throw new Error(`Suggestions API returned ${response.status}`);

            const payload = await response.json();
            if (Array.isArray(payload?.suggestions)) return payload.suggestions;
            return [];
        } catch (error) {
            console.error('Autocomplete suggestions unavailable, using mock data.', error);
            return filterMockSuggestions(query, tabType);
        }
    };

    const evaluateSearchResults = (tabType) => {
        let term = '';
        if (tabType === 'stay') {
            term = document.getElementById('stay-location')?.value || '';
            searchState.stay.text = term;
        } else if (tabType === 'move') {
            const from = document.getElementById('move-from')?.value || '';
            const to = document.getElementById('move-to')?.value || '';
            term = `${from} ${to}`.trim();
            searchState.move.from.text = from;
            searchState.move.to.text = to;
        } else {
            const serviceType = document.getElementById('service-type')?.value || '';
            const serviceArea = document.getElementById('service-area')?.value || '';
            term = `${serviceType} ${serviceArea}`.trim();
            searchState.service.type = serviceType;
            searchState.service.area = serviceArea;
        }

        const normalizedTerm = term.toLowerCase();
        const resultCount = searchableInventory[tabType].reduce((count, keyword) => (
            normalizedTerm.includes(keyword) ? count + 1 : count
        ), 0);

        if (resultCount === 0 && normalizedTerm) {
            showNoResults(term, tabType);
        } else {
            setNoResultsVisibility(false);
        }

        return resultCount;
    };

    const bindPlacesAutocomplete = (input) => {
        if (!window.google?.maps?.places || !input) return;

        const autocomplete = new google.maps.places.Autocomplete(input, {
            fields: ['place_id', 'formatted_address', 'name', 'geometry'],
            componentRestrictions: { country: 'in' },
            bounds: kochiBounds,
            strictBounds: false,
            types: ['geocode']
        });

        if (autocomplete.setOptions) {
            autocomplete.setOptions({
                locationBias: {
                    center: KOCHI_CENTER,
                    radius: KOCHI_RADIUS_METERS
                }
            });
        }

        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            const formatted = place.formatted_address || place.name || input.value;
            input.value = formatted;

            if (input.id === 'stay-location') {
                searchState.stay.place_id = place.place_id || '';
                searchState.stay.formatted_address = formatted;
            } else if (input.id === 'move-from') {
                searchState.move.from.place_id = place.place_id || '';
                searchState.move.from.formatted_address = formatted;
            } else if (input.id === 'move-to') {
                searchState.move.to.place_id = place.place_id || '';
                searchState.move.to.formatted_address = formatted;
            }

            input.dataset.placeId = place.place_id || '';
            input.dataset.formattedAddress = formatted;
            setNoResultsVisibility(false);
        });
    };

    const initializeGooglePlaces = () => {
        const targets = ['stay-location', 'move-from', 'move-to']
            .map((id) => document.getElementById(id))
            .filter(Boolean);

        if (!targets.length) return;

        if (window.google?.maps?.places) {
            targets.forEach(bindPlacesAutocomplete);
            return;
        }

        const apiKey = window.KOCHINEST_GOOGLE_MAPS_API_KEY || document.querySelector('meta[name="google-maps-api-key"]')?.content;
        if (!apiKey) {
            console.warn('Google Maps API key missing. Kochi location fields are using local fallback suggestions.');
            return;
        }

        if (document.querySelector('script[data-google-maps-loader="kochinest"]')) {
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.dataset.googleMapsLoader = 'kochinest';
        script.onload = () => targets.forEach(bindPlacesAutocomplete);
        script.onerror = () => console.error('Failed to load Google Maps Places library.');
        document.head.appendChild(script);
    };

    const handleInput = debounce(async (event) => {
        const input = event.target;
        const query = input.value.trim();
        const tabType = input.dataset.tabType || activeTabType;

        activeInput = input;
        activeTabType = tabType;
        setBoxPosition(input);

        const isGoogleManagedField = ['stay-location', 'move-from', 'move-to'].includes(input.id);
        if (isGoogleManagedField && window.google?.maps?.places) {
            hideSuggestions();
            return;
        }

        if (!query) {
            hideSuggestions();
            return;
        }

        showSuggestionState('Loading suggestions...', true);

        const suggestions = await fetchSuggestions(query, tabType);

        if (!suggestions.length) {
            showSuggestionState('No results found. Try searching for AC Repair or Kakkanad.');
            return;
        }

        renderSuggestions(suggestions, input, tabType);
    }, 250);

    searchInputs.forEach((input) => {
        input.addEventListener('focus', () => {
            activeInput = input;
            activeTabType = input.dataset.tabType || activeTabType;
            if (input.value.trim()) setBoxPosition(input);
        });

        input.addEventListener('input', handleInput);
    });

    tabButtons.forEach((tabButton) => {
        tabButton.addEventListener('click', () => {
            activeTabType = tabButton.dataset.tab || activeTabType;
            hideSuggestions();
            setNoResultsVisibility(false);
        });
    });

    searchContainer.addEventListener('submit', () => hideSuggestions());

    document.addEventListener('click', (event) => {
        if (!searchContainer.contains(event.target)) hideSuggestions();
    });

    window.addEventListener('resize', () => {
        if (!suggestionBox.hidden && activeInput) setBoxPosition(activeInput);
    });

    document.querySelectorAll('[data-search-target]').forEach((button) => {
        button.addEventListener('click', () => {
            const activeTab = document.querySelector('.tab-button.active')?.dataset.tab || 'stay';
            evaluateSearchResults(activeTab);
        });
    });

    customRepairRedirect?.addEventListener('click', () => {
        window.open('https://wa.me/916282520339?text=Hi%20Er.%20Aji%20Paul%2C%20I%20need%20a%20custom%20repair%20service%20in%20Kochi.', '_blank');
    });

    smartLeadForm?.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('leadName')?.value.trim();
        const service = document.getElementById('leadService')?.value.trim();
        const phone = document.getElementById('leadPhone')?.value.trim();
        const whatsappAllowed = document.getElementById('leadWhatsapp')?.checked;
        if (!name || !service || !phone) return;

        const leadPayload = {
            name,
            service,
            phone,
            whatsappAllowed,
            searchContext: {
                stay: searchState.stay,
                move: searchState.move,
                service: searchState.service
            },
            submittedAt: new Date().toISOString()
        };

        if (whatsappAllowed) {
            const whatsappPhoneNumber = 'YOUR_PHONE_NUMBER';
            const message = `Interested in ${service} for ${name}`;
            const whatsappUrl = `https://wa.me/${whatsappPhoneNumber}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        }

        localStorage.setItem('kochinestSmartLead', JSON.stringify(leadPayload));
        noResultsMessage.textContent = 'Thanks! Our team will contact you with curated options shortly.';
        smartLeadForm.reset();
    });

    window.initKochiNestMapSearch = initializeGooglePlaces;
    initializeGooglePlaces();
});
