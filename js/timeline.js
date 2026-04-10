/**
 * TIMELINE.JS - Premium Real-time Interactive Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Selectors
    const timelineContainer = document.getElementById('timeline-content');
    const timelineWrapper = document.getElementById('timeline-wrapper');

    // Dropdown Triggers
    const viewTrigger = document.getElementById('view-trigger');
    const bookTrigger = document.getElementById('book-trigger');
    const chapterTrigger = document.getElementById('chapter-trigger');
    const fullscreenBtn = document.getElementById('fullscreen-btn');

    // Dropdown Panels
    const viewDropdownContent = document.getElementById('view-dropdown-content');
    const bookDropdownContent = document.getElementById('book-dropdown-content');
    const chapterDropdownContent = document.getElementById('chapter-dropdown-content');

    // Dropdown Lists
    const viewOptionsList = document.getElementById('view-options-list');
    const bookOptionsList = document.getElementById('book-options-list');
    const chapterOptionsList = document.getElementById('chapter-options-list');

    // Selection Text
    const selectedViewText = document.getElementById('selected-view-text');
    const selectedBookText = document.getElementById('selected-book-text');
    const selectedChapterText = document.getElementById('selected-chapter-text');

    // State Variables
    let currentView = 'master'; // 'master', 'book', 'chapter'
    let currentBook = 'all';
    let currentChapter = 'all';
    let currentEvents = [...timelineData];

    /* ============================================================================
       INITIALIZATION & EVENT LISTENERS
       ============================================================================ */

    function init() {
        populateViewDropdown();
        populateBookDropdown();

        setupEventListeners();
        filterAndRender();
    }

    function setupEventListeners() {
        // Dropdown Toggle Handlers
        viewTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown(viewDropdownContent, viewTrigger);
        });

        bookTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!bookTrigger.parentElement.classList.contains('disabled')) {
                toggleDropdown(bookDropdownContent, bookTrigger);
            }
        });
        // Fullscreen Toggle Logic
        fullscreenBtn.addEventListener('click', () => {
            const icon = fullscreenBtn.querySelector('i');
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
                icon.classList.replace('fa-expand', 'fa-compress');
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                    icon.classList.replace('fa-compress', 'fa-expand');
                }
            }
        });

        // Sync icon if user exits using ESC key
        document.addEventListener('fullscreenchange', () => {
            const icon = fullscreenBtn.querySelector('i');
            if (!document.fullscreenElement) {
                icon.classList.replace('fa-compress', 'fa-expand');
            }
        });

        chapterTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!chapterTrigger.parentElement.classList.contains('disabled')) {
                toggleDropdown(chapterDropdownContent, chapterTrigger);
            }
        });

        // Close dropdowns on outside click
        document.addEventListener('click', () => {
            closeAllDropdowns();
        });

        // Prevent closing when clicking inside content
        viewDropdownContent.addEventListener('click', (e) => e.stopPropagation());
        bookDropdownContent.addEventListener('click', (e) => e.stopPropagation());
        chapterDropdownContent.addEventListener('click', (e) => e.stopPropagation());

        // Horizontal Scroll with Mouse Wheel
        timelineWrapper.addEventListener('wheel', (evt) => {
            if (evt.deltaY !== 0) {
                evt.preventDefault();
                timelineWrapper.scrollLeft += evt.deltaY * 1.5;
            }
        });
    }

    /* ============================================================================
       DROPDOWN UI CONTROLLER
       ============================================================================ */

    function toggleDropdown(panel, trigger) {
        const isShowing = panel.classList.contains('show');
        closeAllDropdowns();
        if (!isShowing) {
            panel.classList.add('show');
            trigger.classList.add('active');
        }
    }

    function closeAllDropdowns() {
        [viewDropdownContent, bookDropdownContent, chapterDropdownContent].forEach(p => p.classList.remove('show'));
        [viewTrigger, bookTrigger, chapterTrigger].forEach(t => t.classList.remove('active'));
    }

    /* ============================================================================
       DYNAMIC OPTION POPULATORS
       ============================================================================ */

    function populateViewDropdown() {
        const options = [
            { id: 'master', label: 'All Chapters (Master Order)' },
            { id: 'book', label: 'Book-wise Order' },
            { id: 'chapter', label: 'Chapter-wise Order' }
        ];

        viewOptionsList.innerHTML = '';
        options.forEach(opt => {
            const item = document.createElement('div');
            item.className = `radio-option ${currentView === opt.id ? 'selected' : ''}`;
            item.innerHTML = `
                <div class="radio-custom"></div>
                <span class="option-label">${opt.label}</span>
            `;
            item.addEventListener('click', () => selectView(opt));
            viewOptionsList.appendChild(item);
        });
    }

    function populateBookDropdown() {
        const psData = timelineRegistry;
        const books = Object.keys(psData);

        bookOptionsList.innerHTML = '';

        // "All Books" option
        const allOption = { id: 'all', label: 'All Books' };
        const allItem = createRadioItem(allOption, currentBook === 'all', () => selectBook(allOption));
        bookOptionsList.appendChild(allItem);

        books.forEach(book => {
            const opt = { id: book, label: book };
            const item = createRadioItem(opt, currentBook === book, () => selectBook(opt));
            bookOptionsList.appendChild(item);
        });
    }

    function populateChapterDropdown(bookName) {
        chapterOptionsList.innerHTML = '';

        if (!bookName || bookName === 'all') {
            currentChapter = 'all';
            selectedChapterText.textContent = 'All Chapters';
            return;
        }

        const chapters = timelineRegistry[bookName];

        // "All Chapters" option
        const allOption = { id: 'all', label: 'All Chapters' };
        const allItem = createCheckItem(allOption, currentChapter === 'all', () => selectChapter(allOption));
        chapterOptionsList.appendChild(allItem);

        chapters.forEach(chap => {
            const opt = { id: chap, label: chap };
            const item = createCheckItem(opt, currentChapter === chap, () => selectChapter(opt));
            chapterOptionsList.appendChild(item);
        });
    }

    function createRadioItem(opt, isSelected, callback) {
        const item = document.createElement('div');
        item.className = `radio-option ${isSelected ? 'selected' : ''}`;
        item.innerHTML = `
            <div class="radio-custom"></div>
            <span class="option-label">${opt.label}</span>
        `;
        item.addEventListener('click', callback);
        return item;
    }

    function createCheckItem(opt, isSelected, callback) {
        const item = document.createElement('div');
        item.className = `chapter-item ${isSelected ? 'selected' : ''}`;
        item.innerHTML = `
            <div class="chapter-checkbox">
                <i class="fas fa-check"></i>
            </div>
            <span class="chapter-name">${opt.label}</span>
        `;
        item.addEventListener('click', callback);
        return item;
    }

    /* ============================================================================
       SELECTION HANDLERS
       ============================================================================ */

    function selectView(opt) {
        currentView = opt.id;
        selectedViewText.textContent = opt.label;

        // Contextual enabling/disabling
        const bookDropdown = document.getElementById('book-dropdown');
        const chapterDropdown = document.getElementById('chapter-dropdown');

        if (currentView === 'master') {
            bookDropdown.classList.add('disabled');
            chapterDropdown.classList.add('disabled');
            currentBook = 'all';
            currentChapter = 'all';
            selectedBookText.textContent = 'All Books';
            selectedChapterText.textContent = 'All Chapters';
        } else if (currentView === 'book') {
            bookDropdown.classList.remove('disabled');
            chapterDropdown.classList.add('disabled');
            currentChapter = 'all';
            selectedChapterText.textContent = 'All Chapters';
        } else {
            bookDropdown.classList.remove('disabled');
            chapterDropdown.classList.remove('disabled');
        }

        populateViewDropdown();
        closeAllDropdowns();
        filterAndRender();
    }

    function selectBook(opt) {
        currentBook = opt.id;
        selectedBookText.textContent = opt.label;

        // When book changes, reset chapter to all and rebuild list
        currentChapter = 'all';
        selectedChapterText.textContent = 'All Chapters';
        populateChapterDropdown(currentBook);

        populateBookDropdown();
        closeAllDropdowns();
        filterAndRender();
    }

    function selectChapter(opt) {
        currentChapter = opt.id;
        selectedChapterText.textContent = opt.label;

        populateChapterDropdown(currentBook);
        closeAllDropdowns();
        filterAndRender();
    }

    /* ============================================================================
       FILTERING & RENDERING LOGIC
       ============================================================================ */

    function filterAndRender() {
        currentEvents = timelineData.filter(event => {
            // Master mode ignores all filters
            if (currentView === 'master') return true;

            // Book mode filters ONLY by book
            if (currentView === 'book') {
                return currentBook === 'all' || event.book === currentBook;
            }

            // Chapter mode filters by book AND specific chapter
            if (currentView === 'chapter') {
                const bookMatch = currentBook === 'all' || event.book === currentBook;
                const chapterMatch = currentChapter === 'all' || event.chapter === currentChapter;
                return bookMatch && chapterMatch;
            }

            return true;
        });

        // Sort chronologically (handles "1985", "March 1985", "Nov 9, 1989")
        currentEvents.sort((a, b) => {
            const dateA = new Date(a.year).getTime() || parseInt(a.year.match(/\d{4}/)?.[0] || 0);
            const dateB = new Date(b.year).getTime() || parseInt(b.year.match(/\d{4}/)?.[0] || 0);
            return dateA - dateB;
        });
        renderTimeline();
    }

    function renderTimeline() {
        timelineContainer.innerHTML = '';

        if (currentEvents.length === 0) {
            timelineContainer.innerHTML = `
                <div class="no-events-container">
                    <i class="fas fa-search"></i>
                    <p>No events found for the selected filters.</p>
                </div>`;
            return;
        }

        currentEvents.forEach((event) => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';

            const isCWP = event.book === "Contemporary World Politics";
            const tagLabel = isCWP ? "CWP" : "PISI";
            const tagClass = isCWP ? "tag-cwp" : "tag-pisi";

            timelineItem.innerHTML = `
                <div class="event-card">
                    <div class="event-card-header">
                        <i class="fas fa-book-open"></i>
                        <span>${event.chapter}</span>
                    </div>
                    <h3>${event.title}</h3>
                    <p>${event.description}</p>
                    <span class="card-tag ${tagClass}">${tagLabel}</span>
                </div>
                <div class="timeline-stalk"></div>
                <div class="timeline-node"></div>
                <div class="timeline-year">${event.year}</div>
            `;


            timelineContainer.appendChild(timelineItem);
        });

        // Update track length dynamically
        const totalWidth = timelineContainer.scrollWidth;
        const track = document.querySelector('.timeline-track');
        if (track) track.style.width = `${totalWidth + 500}px`;
    }

    // Initialize
    init();
});
