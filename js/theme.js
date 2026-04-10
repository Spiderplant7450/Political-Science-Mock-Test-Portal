/**
 * ============================================================================
 * THEME.JS - Theme Switching Module (Light / Dark / System Default)
 * ============================================================================
 * 
 * Self-contained theme management module. Does NOT interact with any existing
 * JavaScript files (common.js, home.js, test.js, result.js, etc.).
 * 
 * Features:
 * - Three modes: Light, Dark, System Default (auto)
 * - Persists preference in localStorage
 * - Flash prevention via inline <script> in <head> (see HTML files)
 * - Injects a premium toggle button into each page's header
 * - Listens for OS theme changes when in 'auto' mode
 * 
 * Load this file on every page, after all other scripts.
 * ============================================================================
 */

const ThemeManager = (() => {
    // =========================================================================
    // CONSTANTS
    // =========================================================================
    const THEMES = ['light', 'dark', 'auto'];
    const STORAGE_KEY = 'theme-preference';
    const ICONS = {
        light: 'fa-sun',
        dark: 'fa-moon',
        auto: 'fa-display'
    };
    const LABELS = {
        light: 'Light',
        dark:  'Dark',
        auto:  'Auto'
    };
    const TOOLTIPS = {
        light: 'Light Mode — Click to switch to Dark',
        dark:  'Dark Mode — Click to switch to Auto',
        auto:  'System Default — Click to switch to Light'
    };

    // =========================================================================
    // STATE
    // =========================================================================
    let currentPreference = 'light';
    let systemMediaQuery = null;
    let toggleButton = null;

    // =========================================================================
    // CORE THEME LOGIC
    // =========================================================================

    /**
     * Get the stored theme preference from localStorage.
     * Defaults to 'light' on first visit.
     * @returns {'light'|'dark'|'auto'}
     */
    function getPreference() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && THEMES.includes(stored)) {
            return stored;
        }
        return 'light';
    }

    /**
     * Resolve the actual theme to apply ('light' or 'dark').
     * When preference is 'auto', checks the OS setting.
     * @param {string} preference - The stored preference
     * @returns {'light'|'dark'}
     */
    function resolveTheme(preference) {
        if (preference === 'auto') {
            return getSystemPreference();
        }
        return preference;
    }

    /**
     * Get the OS/system color scheme preference.
     * @returns {'light'|'dark'}
     */
    function getSystemPreference() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    /**
     * Apply a theme by setting the data-theme attribute on <html>.
     * @param {'light'|'dark'} theme - The resolved theme to apply
     */
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }

    /**
     * Save the user's preference to localStorage.
     * @param {'light'|'dark'|'auto'} preference
     */
    function savePreference(preference) {
        localStorage.setItem(STORAGE_KEY, preference);
    }

    /**
     * Set the theme preference: save, apply, and update the button.
     * @param {'light'|'dark'|'auto'} preference
     */
    function setTheme(preference) {
        currentPreference = preference;
        savePreference(preference);
        applyTheme(resolveTheme(preference));
        updateButton();
        updateSystemListener();
    }

    /**
     * Cycle to the next theme in order: light → dark → auto → light.
     */
    function cycle() {
        const currentIndex = THEMES.indexOf(currentPreference);
        const nextIndex = (currentIndex + 1) % THEMES.length;
        setTheme(THEMES[nextIndex]);
    }

    // =========================================================================
    // SYSTEM PREFERENCE LISTENER
    // =========================================================================

    /**
     * Handle system theme changes (only relevant in 'auto' mode).
     * @param {MediaQueryListEvent} e
     */
    function onSystemChange(e) {
        if (currentPreference === 'auto') {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    }

    /**
     * Add or remove the system color scheme change listener
     * based on whether we're in 'auto' mode.
     */
    function updateSystemListener() {
        if (!systemMediaQuery) {
            systemMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        }

        // Remove existing listener first to prevent duplicates
        try {
            systemMediaQuery.removeEventListener('change', onSystemChange);
        } catch (e) {
            // Fallback for older browsers
            try { systemMediaQuery.removeListener(onSystemChange); } catch (e2) { /* ignore */ }
        }

        // Add listener only when in auto mode
        if (currentPreference === 'auto') {
            try {
                systemMediaQuery.addEventListener('change', onSystemChange);
            } catch (e) {
                // Fallback for older browsers
                try { systemMediaQuery.addListener(onSystemChange); } catch (e2) { /* ignore */ }
            }
        }
    }

    // =========================================================================
    // TOGGLE BUTTON RENDERING
    // =========================================================================

    /**
     * Create the theme toggle button element.
     * @returns {HTMLButtonElement}
     */
    function createButton() {
        const btn = document.createElement('button');
        btn.className = 'theme-toggle-btn';
        btn.setAttribute('id', 'theme-toggle');
        btn.setAttribute('type', 'button');
        btn.setAttribute('aria-label', 'Toggle theme');
        btn.innerHTML = `
            <span class="theme-icon"><i class="fas ${ICONS[currentPreference]}"></i></span>
            <span class="theme-label">${LABELS[currentPreference]}</span>
        `;
        btn.setAttribute('data-tooltip', TOOLTIPS[currentPreference]);
        btn.addEventListener('click', () => cycle());
        return btn;
    }

    /**
     * Update the button's icon, label, and tooltip to match the current preference.
     */
    function updateButton() {
        if (!toggleButton) return;

        const iconEl = toggleButton.querySelector('.theme-icon i');
        const labelEl = toggleButton.querySelector('.theme-label');

        if (iconEl) {
            // Remove all theme icon classes
            iconEl.className = '';
            iconEl.classList.add('fas', ICONS[currentPreference]);
        }

        if (labelEl) {
            labelEl.textContent = LABELS[currentPreference];
        }

        toggleButton.setAttribute('data-tooltip', TOOLTIPS[currentPreference]);
        toggleButton.setAttribute('aria-label', `Current theme: ${LABELS[currentPreference]}. Click to switch.`);
    }

    /**
     * Inject the toggle button into the correct location based on the current page.
     * Auto-detects page type and finds the appropriate container.
     */
    function renderButton() {
        toggleButton = createButton();

        // Detect which page we're on and inject into the right spot
        const injectionStrategies = [
            // Home page: inject into .header-actions (before timeline button)
            {
                selector: '.header-actions',
                condition: () => !!document.querySelector('#home-view'),
                inject: (container) => {
                    container.insertBefore(toggleButton, container.firstChild);
                    // Add flex layout if not already present
                    container.style.display = 'flex';
                    container.style.alignItems = 'center';
                    container.style.gap = '0.75rem';
                }
            },
            // Test page: inject into .header-right (before fullscreen button)
            {
                selector: '.header-right',
                condition: () => !!document.querySelector('#test-view'),
                inject: (container) => {
                    const fullscreenBtn = container.querySelector('#fullscreen-btn');
                    if (fullscreenBtn) {
                        container.insertBefore(toggleButton, fullscreenBtn);
                    } else {
                        container.appendChild(toggleButton);
                    }
                }
            },
            // Result page: inject into .nav-actions (after home button)
            {
                selector: '.result-navbar .nav-actions',
                condition: () => !!document.querySelector('#result-view'),
                inject: (container) => {
                    container.appendChild(toggleButton);
                }
            },
            // Answer Key page: inject into .answer-key-header (between h2 and back button)
            {
                selector: '.answer-key-header',
                condition: () => !!document.querySelector('#answer-key-view'),
                inject: (container) => {
                    const backBtn = container.querySelector('#back-to-result-btn');
                    if (backBtn) {
                        container.insertBefore(toggleButton, backBtn);
                    } else {
                        container.appendChild(toggleButton);
                    }
                }
            },
            // Timeline page: inject into .back-nav (after fullscreen button container)
            {
                selector: '.fixed-top-section',
                condition: () => !!document.querySelector('.timeline-app'),
                inject: (container) => {
                    // Place the toggle in the top-right area next to fullscreen
                    toggleButton.classList.add('timeline-toggle');
                    document.body.appendChild(toggleButton);
                }
            },
            // Doc pages (privacy, terms, contact): inject next to .back-home
            {
                selector: '.back-home',
                condition: () => !!document.querySelector('.doc-page'),
                inject: (container) => {
                    // Position fixed next to back-home link
                    toggleButton.classList.add('doc-toggle');
                    document.body.appendChild(toggleButton);
                }
            }
        ];

        // Try each strategy until one matches
        for (const strategy of injectionStrategies) {
            if (strategy.condition()) {
                const container = document.querySelector(strategy.selector);
                if (container) {
                    strategy.inject(container);
                    return;
                }
                // For strategies that append to body (timeline, doc pages),
                // the condition matched but we just need the inject logic
                if (strategy.selector === '.fixed-top-section' || strategy.selector === '.back-home') {
                    strategy.inject(null);
                    return;
                }
            }
        }

        // Fallback: append to body as fixed button
        toggleButton.style.position = 'fixed';
        toggleButton.style.top = '1rem';
        toggleButton.style.right = '1rem';
        toggleButton.style.zIndex = '10000';
        document.body.appendChild(toggleButton);
    }

    // =========================================================================
    // INITIALIZATION
    // =========================================================================

    /**
     * Initialize the theme system.
     * Called automatically when the DOM is ready.
     * 
     * NOTE: The actual theme application (data-theme attribute) is handled
     * by the inline <script> in each page's <head> to prevent flash.
     * This init() only sets up the button and listeners.
     */
    function init() {
        // Read the current preference
        currentPreference = getPreference();

        // Apply theme (in case inline script wasn't present)
        applyTheme(resolveTheme(currentPreference));

        // Set up system preference listener
        updateSystemListener();

        // Render the toggle button into the page
        renderButton();
    }

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM already loaded
        init();
    }

    // =========================================================================
    // PUBLIC API (exposed for advanced use, not required for normal operation)
    // =========================================================================
    return {
        setTheme,
        cycle,
        getPreference: () => currentPreference,
        getResolvedTheme: () => resolveTheme(currentPreference)
    };
})();
