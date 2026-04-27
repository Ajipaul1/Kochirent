document.addEventListener('DOMContentLoaded', () => {
    const suggestionBox = document.getElementById('search-suggestions');
    const searchContainer = document.querySelector('.search-tabs-container');
    const tabButtons = document.querySelectorAll('.tab-button');
    const searchInputs = document.querySelectorAll('[data-search-input]');
    const propertyTypeSelect = document.getElementById('stay-property-type');

    if (!suggestionBox || !searchContainer || !searchInputs.length) return;

    const mockSuggestions = {
        stay: [
            { label: 'Kakkanad (Ernakulam)', value: 'Kakkanad', propertyTypes: ['1BHK', '2BHK', 'Flats', 'Room', 'Villa', 'Plot'] },
            { label: 'Kakkanad Flats', value: 'Kakkanad Flats', propertyTypes: ['1BHK', '2BHK', 'Flats', 'Room'] },
            { label: 'Kakkanad Rooms', value: 'Kakkanad Rooms', propertyTypes: ['Room', '1BHK'] },
            { label: 'Edappally Apartments', value: 'Edappally Apartments', propertyTypes: ['1BHK', '2BHK', 'Flats', 'Villa'] },
            { label: 'Aluva Budget Homes', value: 'Aluva Budget Homes', propertyTypes: ['1BHK', '2BHK', 'Room', 'Plot'] }
        ],
        move: [
            { label: 'Aluva', value: 'Aluva' },
            { label: 'Palarivattom', value: 'Palarivattom' },
            { label: 'Kakkanad', value: 'Kakkanad' },
            { label: 'Edappally', value: 'Edappally' },
            { label: 'Fort Kochi', value: 'Fort Kochi' }
        ],
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

    const debounce = (callback, delay = 250) => (...args) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => callback(...args), delay);
    };

    const setBoxPosition = (input) => {
        if (!input) return;
        const field = input.closest('.search-field');
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

        if (tabType === 'move') {
            return list.filter((item) => item.label.toLowerCase().includes(normalized));
        }

        return list.filter((item) => item.label.toLowerCase().includes(normalized));
    };

    const fetchSuggestions = async (query, tabType) => {
        const endpoint = `/api/search/suggestions?q=${encodeURIComponent(query)}&type=${encodeURIComponent(tabType)}`;

        try {
            const response = await fetch(endpoint, { headers: { Accept: 'application/json' } });
            if (!response.ok) {
                throw new Error(`Suggestions API returned ${response.status}`);
            }

            const payload = await response.json();
            if (Array.isArray(payload?.suggestions)) {
                return payload.suggestions;
            }

            return [];
        } catch (error) {
            console.error('Autocomplete suggestions unavailable, using mock data.', error);
            return filterMockSuggestions(query, tabType);
        }
    };

    const handleInput = debounce(async (event) => {
        const input = event.target;
        const query = input.value.trim();
        const tabType = input.dataset.tabType || activeTabType;

        activeInput = input;
        activeTabType = tabType;
        setBoxPosition(input);

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
            if (input.value.trim()) {
                setBoxPosition(input);
            }
        });

        input.addEventListener('input', handleInput);
    });

    tabButtons.forEach((tabButton) => {
        tabButton.addEventListener('click', () => {
            activeTabType = tabButton.dataset.tab || activeTabType;
            hideSuggestions();
        });
    });

    searchContainer.addEventListener('submit', () => {
        hideSuggestions();
    });

    document.addEventListener('click', (event) => {
        if (!searchContainer.contains(event.target)) {
            hideSuggestions();
        }
    });

    window.addEventListener('resize', () => {
        if (!suggestionBox.hidden && activeInput) {
            setBoxPosition(activeInput);
        }
    });
});
