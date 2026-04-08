/**
 * ============================================================================
 * HOME.JS - Home Page Logic
 * ============================================================================
 * 
 * This file handles all functionality for the home/landing page:
 * - Subject and chapter selection dropdowns
 * - Single/multi-select mode toggle
 * - Question reshuffle toggle
 * - Start test button
 * - Validation and navigation to test page
 * 
 * Dependencies: registry.js, common.js
 * ============================================================================
 */

/* ============================================================================
   DOM ELEMENT SELECTORS
   ============================================================================ */

// Subject dropdown elements
const subjectTrigger = document.getElementById('subject-trigger');
const subjectList = document.getElementById('subject-list');
const selectedSubjectText = document.getElementById('selected-subject-text');
const subjectDropdownContent = document.getElementById('subject-dropdown-content');

// Chapter dropdown elements
const chapterDropdown = document.getElementById('chapter-dropdown');
const chapterTrigger = document.getElementById('chapter-trigger');
const chapterList = document.getElementById('chapter-list');
const selectedChapterText = document.getElementById('selected-chapter-text');
const chapterDropdownContent = document.getElementById('chapter-dropdown-content');

// Action buttons
const applyChaptersBtn = document.getElementById('apply-chapters-btn');
const clearChaptersBtn = document.getElementById('clear-chapters-btn');
const startTestBtn = document.getElementById('start-test-btn');

// UI elements
const selectedCountBadge = document.getElementById('selected-count');
const modeHint = document.getElementById('mode-hint');
const modeRadios = document.querySelectorAll('input[name="selection-mode"]');
const reshuffleContainer = document.querySelector('.reshuffle-container');
const reshuffleToggle = document.getElementById('reshuffle-toggle');

/* ============================================================================
   RETENTION LOGIC (RETAKE)
   ============================================================================ */

/**
 * Automatically apply configuration from a previous test
 * @param {Object} data - Test data from sessionStorage
 */
function applyRetakeConfig(data) {
    if (!data) return;

    const { currentSubject: subject, selectedChapters: chapters, selectionMode: mode, reshuffleEnabled } = data;

    // 1. Set selection mode
    selectionMode = mode || 'multi';
    modeRadios.forEach(radio => {
        radio.checked = radio.value === selectionMode;
    });
    updateModeHint();

    // 2. Select subject
    const subjectItems = subjectList.querySelectorAll('.chapter-item');
    let subjectItemToSelect = null;
    subjectItems.forEach(item => {
        if (item.querySelector('.chapter-name').textContent === subject) {
            subjectItemToSelect = item;
        }
    });

    if (subjectItemToSelect) {
        // Re-implement selection without calling clearSelection()
        currentSubject = subject;
        selectedSubjectText.textContent = subject;
        subjectItems.forEach(item => item.classList.remove('selected'));
        subjectItemToSelect.classList.add('selected');

        populateChapters(currentSubject);
        chapterDropdown.classList.remove('disabled');

        // 3. Select chapters
        // We must re-populate selectedChapters array
        selectedChapters = [];
        const chapterItems = chapterList.querySelectorAll('.chapter-item');
        chapterItems.forEach(item => {
            if (chapters.includes(item.dataset.chapter)) {
                item.classList.add('selected');
                selectedChapters.push(item.dataset.chapter);
            }
        });

        // 4. Update UI
        updateSelectionUI();
        updateTriggerText();

        if (selectedChapters.length > 0) {
            startTestBtn.disabled = false;
        }

        // 5. Handle Reshuffle Toggle
        if (reshuffleToggle && reshuffleEnabled !== undefined) {
            reshuffleToggle.checked = reshuffleEnabled;
        }
    }
}

/* ============================================================================
   INITIALIZATION
   ============================================================================ */

/**
 * Initialize the home page
 * Populates subjects and sets up event listeners
 */
function init() {
    if (!isRegistryLoaded()) return;

    populateSubjects();
    setupEventListeners();
    updateModeHint();

    // Check for retake data (persisted testData)
    const testData = loadTestData();
    if (testData) {
        applyRetakeConfig(testData);
    }
}

/* ============================================================================
   SUBJECT MANAGEMENT
   ============================================================================ */

/**
 * Populate the subject dropdown with all available subjects
 */
function populateSubjects() {
    subjectList.innerHTML = '';
    const subjects = Object.keys(subjectsRegistry);

    subjects.forEach(subject => {
        const item = document.createElement('div');
        item.className = 'chapter-item';
        item.innerHTML = `
            <div class="chapter-item-left">
                <span class="chapter-name">${subject}</span>
            </div>
        `;
        item.addEventListener('click', () => selectSubject(subject, item));
        subjectList.appendChild(item);
    });

    if (subjects.length > 0) {
        const firstItem = subjectList.querySelector('.chapter-item');
        if (firstItem) {
            selectSubject(subjects[0], firstItem);
        }
    }
}

/**
 * Handle subject selection
 * @param {string} subject - Selected subject name
 * @param {HTMLElement} element - Clicked element
 */
function selectSubject(subject, element) {
    currentSubject = subject;
    selectedSubjectText.textContent = subject;

    // Update UI selection
    const items = subjectList.querySelectorAll('.chapter-item');
    items.forEach(item => item.classList.remove('selected'));
    element.classList.add('selected');

    // Close dropdown
    subjectDropdownContent.classList.remove('show');
    subjectTrigger.classList.remove('active');

    // Update chapters and reset selection
    populateChapters(currentSubject);
    chapterDropdown.classList.remove('disabled');
    startTestBtn.disabled = true;
    clearSelection();
}

/* ============================================================================
   CHAPTER MANAGEMENT
   ============================================================================ */

/**
 * Populate chapter dropdown for selected subject
 * @param {string} subject - Subject name
 */
function populateChapters(subject) {
    chapterList.innerHTML = '';
    const books = subjectsRegistry[subject];

    if (!books) return;

    // Iterate through books and chapters
    for (const bookName in books) {
        // Create book header
        const header = document.createElement('div');
        header.className = 'book-header';
        header.textContent = bookName;
        chapterList.appendChild(header);

        const chapters = books[bookName];
        for (const chapterName in chapters) {
            const info = chapters[chapterName];
            const item = document.createElement('div');
            item.className = 'chapter-item';
            item.dataset.chapter = chapterName;
            item.dataset.path = info.path;

            item.innerHTML = `
                <div class="chapter-item-left">
                    <div class="chapter-checkbox">
                        <i class="fas fa-check"></i>
                    </div>
                    <span class="chapter-name">${chapterName}</span>
                </div>
                <span class="quest-count">${info.count > 0 ? info.count + ' quests' : 'Coming Soon'}</span>
            `;

            // Only allow selection if chapter has questions
            if (info.count > 0) {
                item.addEventListener('click', () => toggleChapter(item, chapterName));
            } else {
                item.classList.add('disabled');
                item.style.opacity = '0.5';
                item.style.cursor = 'not-allowed';
            }
            chapterList.appendChild(item);
        }
    }
}

/**
 * Toggle chapter selection
 * @param {HTMLElement} element - Clicked chapter element
 * @param {string} chapter - Chapter name
 */
function toggleChapter(element, chapter) {
    if (selectionMode === 'single') {
        // Single-select mode: only one chapter at a time
        const items = chapterList.querySelectorAll('.chapter-item');
        items.forEach(item => {
            if (item !== element) item.classList.remove('selected');
        });
        selectedChapters = element.classList.contains('selected') ? [] : [chapter];
        element.classList.toggle('selected');
    } else {
        // Multi-select mode: multiple chapters allowed
        if (element.classList.contains('selected')) {
            element.classList.remove('selected');
            selectedChapters = selectedChapters.filter(c => c !== chapter);
        } else {
            element.classList.add('selected');
            selectedChapters.push(chapter);
        }
    }
    updateSelectionUI();
}

/**
 * Update selection UI (badge count)
 */
function updateSelectionUI() {
    selectedCountBadge.textContent = selectedChapters.length;
}

/**
 * Update trigger text based on selection
 */
function updateTriggerText() {
    if (selectedChapters.length === 0) {
        selectedChapterText.textContent = 'Select Chapter';
    } else if (selectedChapters.length === 1) {
        selectedChapterText.textContent = selectedChapters[0];
    } else {
        selectedChapterText.textContent = `${selectedChapters.length} Chapters Selected`;
    }
}

/**
 * Clear all chapter selections
 */
function clearSelection() {
    selectedChapters = [];
    const items = chapterList.querySelectorAll('.chapter-item');
    items.forEach(item => item.classList.remove('selected'));
    updateSelectionUI();
    updateTriggerText();
    startTestBtn.disabled = true;
}

/* ============================================================================
   MODE MANAGEMENT
   ============================================================================ */

/**
 * Update mode hint text based on selection mode
 */
function updateModeHint() {
    if (selectionMode === 'multi') {
        modeHint.textContent = 'Multi-select mode: 50 random questions, 60-minute limit';
        modeHint.className = 'mode-hint multi-mode';
        reshuffleContainer.style.display = 'none'; // Multi-mode is random by default
    } else {
        modeHint.textContent = 'Single-select mode: All questions, No-time limit';
        modeHint.className = 'mode-hint single-mode';
        reshuffleContainer.style.display = 'block';
    }
}

/* ============================================================================
   EVENT LISTENERS
   ============================================================================ */

/**
 * Set up all event listeners for the home page
 */
function setupEventListeners() {
    // Subject dropdown toggle
    subjectTrigger.addEventListener('click', () => {
        // Close chapter dropdown if open
        chapterDropdownContent.classList.remove('show');
        chapterTrigger.classList.remove('active');

        // Toggle subject dropdown
        subjectDropdownContent.classList.toggle('show');
        subjectTrigger.classList.toggle('active');
    });

    // Chapter dropdown toggle
    chapterTrigger.addEventListener('click', () => {
        if (!currentSubject) return;

        // Close subject dropdown if open
        subjectDropdownContent.classList.remove('show');
        subjectTrigger.classList.remove('active');

        // Toggle chapter dropdown
        chapterDropdownContent.classList.toggle('show');
        chapterTrigger.classList.toggle('active');
    });

    // Modal scroll requirements
    function checkScrollPosition() {
        const instrBody = document.querySelector('.instructions-body');
        const instrContinueBtn = document.getElementById('instr-continue-btn');
        const originalText = 'I Understand, Continue <i class="fa-solid fa-arrow-right"></i>';

        if (instrBody && instrContinueBtn) {
            // Give 5px tolerance
            if (Math.ceil(instrBody.scrollTop + instrBody.clientHeight) >= Math.floor(instrBody.scrollHeight) - 5) {
                instrContinueBtn.disabled = false;
                instrContinueBtn.innerHTML = originalText;
                instrBody.removeEventListener('scroll', checkScrollPosition);
            }
        }
    }

    // Modal functions
    function showInstructionsModal() {
        const modalOverlay = document.getElementById('instructions-modal-overlay');
        const instrBody = document.querySelector('.instructions-body');
        const instrContinueBtn = document.getElementById('instr-continue-btn');

        // Update dynamic content
        const titleObj = document.getElementById('instr-test-title');
        if (titleObj) {
            if (selectionMode === 'multi') {
                titleObj.textContent = `Test Title: ${currentSubject} - Multi-Chapter Mock Examination (2026)`;
            } else {
                const chapterName = selectedChapters[0] || 'Selected Chapter';
                titleObj.textContent = `Test Title: ${currentSubject} - ${chapterName} (2026)`;
            }
        }

        const durationObj = document.getElementById('instr-duration');
        const qcountObj = document.getElementById('instr-qcount');

        if (selectionMode === 'multi') {
            if (durationObj) durationObj.textContent = "60 minutes";
            if (qcountObj) qcountObj.textContent = "50";
        } else {
            if (durationObj) durationObj.textContent = "Unlimited";

            // Get actual question count for the selected chapter
            let totalCount = 0;
            if (selectedChapters.length > 0) {
                const books = subjectsRegistry[currentSubject];
                const chapterName = selectedChapters[0];
                for (const bookName in books) {
                    if (books[bookName][chapterName]) {
                        totalCount = books[bookName][chapterName].count;
                        break;
                    }
                }
            }
            if (qcountObj) qcountObj.textContent = totalCount || "All";
        }

        if (modalOverlay) {
            modalOverlay.classList.remove('hidden');

            // Check scrolling constraints
            if (instrBody && instrContinueBtn) {
                // Reset scroll
                instrBody.scrollTop = 0;

                // Allow CSS display changes to apply before calculating scrollHeight
                setTimeout(() => {
                    if (instrBody.scrollHeight > instrBody.clientHeight + 5) {
                        instrContinueBtn.disabled = true;
                        instrContinueBtn.innerHTML = '<i class="fas fa-arrow-down"></i> Scroll down to continue';
                        instrBody.addEventListener('scroll', checkScrollPosition);
                    } else {
                        instrContinueBtn.disabled = false;
                        instrContinueBtn.innerHTML = 'I Understand, Continue <i class="fa-solid fa-arrow-right"></i>';
                    }
                }, 10);
            }
        }
    }

    function closeInstructionsModal() {
        const modalOverlay = document.getElementById('instructions-modal-overlay');
        const instrBody = document.querySelector('.instructions-body');

        if (modalOverlay) {
            modalOverlay.classList.add('hidden');
            if (instrBody) {
                instrBody.removeEventListener('scroll', checkScrollPosition);
            }
        }
    }

    // Modal buttons
    const instrCancelBtn = document.getElementById('instr-cancel-btn');
    if (instrCancelBtn) {
        instrCancelBtn.addEventListener('click', closeInstructionsModal);
    }

    const instrContinueBtn = document.getElementById('instr-continue-btn');
    if (instrContinueBtn) {
        instrContinueBtn.addEventListener('click', () => {
            goToTest(currentSubject, selectedChapters, selectionMode);
        });
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        const subDropdown = document.getElementById('subject-dropdown');
        const chapDropdown = document.getElementById('chapter-dropdown');

        if (!subDropdown.contains(e.target)) {
            subjectDropdownContent.classList.remove('show');
            subjectTrigger.classList.remove('active');
        }
        if (!chapDropdown.contains(e.target)) {
            chapterDropdownContent.classList.remove('show');
            chapterTrigger.classList.remove('active');
        }
    });

    // Mode selection (single/multi)
    modeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            selectionMode = e.target.value;
            updateModeHint();
            clearSelection();
        });
    });

    // Apply chapters button
    applyChaptersBtn.addEventListener('click', () => {
        if (selectedChapters.length > 0) {
            chapterDropdownContent.classList.remove('show');
            chapterTrigger.classList.remove('active');
            startTestBtn.disabled = false;
            updateTriggerText();
        } else {
            alert('Please select at least one chapter.');
        }
    });

    // Clear chapters button
    clearChaptersBtn.addEventListener('click', clearSelection);

    // Start test button
    startTestBtn.addEventListener('click', () => {
        showInstructionsModal();
    });

    // Start Practice Now button (Smart Flow)
    const practiceNowBtn = document.getElementById('practice-now-btn');
    if (practiceNowBtn) {
        practiceNowBtn.addEventListener('click', () => {
            if (currentSubject && selectedChapters.length > 0) {
                // If everything is selected, start the test directly
                showInstructionsModal();
            } else {
                // Scroll to selection container so user can choose subject/chapter
                const selectionContainer = document.querySelector('.selection-container');
                if (selectionContainer) {
                    selectionContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });

                    // Highlight the subject dropdown to draw attention
                    subjectTrigger.style.boxShadow = '0 0 15px rgba(99, 102, 241, 0.6)';
                    subjectTrigger.style.borderColor = '#6366f1';

                    if (!currentSubject) {
                        subjectTrigger.classList.add('active'); // show dropdown arrow turned
                    } else if (selectedChapters.length === 0) {
                        chapterTrigger.style.boxShadow = '0 0 15px rgba(99, 102, 241, 0.6)';
                    }

                    setTimeout(() => {
                        subjectTrigger.style.boxShadow = '';
                        subjectTrigger.style.borderColor = '';
                        subjectTrigger.classList.remove('active');
                        chapterTrigger.style.boxShadow = '';
                    }, 1500);
                }
            }
        });
    }
}

/* ============================================================================
   INITIALIZATION CALL
   ============================================================================ */

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
