const app = {
    currentLevel: null,
    currentKanji: null,
    kanjiHistory: [],

    init() {
        window.addEventListener('hashchange', () => this.handleRouting());
        this.handleRouting();

        const searchInput = document.getElementById('kanji-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterKanji(e.target.value));
        }
    },

    handleRouting() {
        const hash = window.location.hash.slice(1) || 'home';
        this.showView(hash);

        if (hash === 'n5' || hash === 'n4') {
            this.currentLevel = hash;
            this.renderGrid(hash);
        }

        // Update Nav UI
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${hash}`);
        });
    },

    showView(viewId) {
        document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));

        if (viewId === 'n5' || viewId === 'n4') {
            document.getElementById('kanji-view').classList.remove('hidden');
            document.getElementById('view-title').innerText = `${viewId.toUpperCase()} Kanji`;
        } else {
            const el = document.getElementById(`${viewId}-view`);
            if (el) el.classList.remove('hidden');
        }
    },

    renderGrid(level, filterText = '') {
        const grid = document.getElementById('kanji-grid');
        grid.innerHTML = '';

        const data = kanjiData[level];
        const filtered = data.filter(k => {
            const search = filterText.toLowerCase();
            return k.char.includes(search) ||
                k.meaning.toLowerCase().includes(search) ||
                k.onyomi.toLowerCase().includes(search) ||
                k.kunyomi.toLowerCase().includes(search);
        });

        filtered.forEach(k => {
            const card = document.createElement('div');
            card.className = 'kanji-card';
            card.innerHTML = `
                <div class="char">${k.char}</div>
                <div class="meaning">${k.meaning}</div>
                <div class="readings">${k.onyomi}<br>${k.kunyomi}</div>
            `;
            card.onclick = () => this.openModal(k);
            grid.appendChild(card);
        });
    },

    filterKanji(text) {
        if (this.currentLevel) {
            this.renderGrid(this.currentLevel, text);
        }
    },

    openModal(k) {
        this.currentKanji = k;
        document.getElementById('modal-char').innerText = k.char;
        document.getElementById('modal-meaning').innerText = k.meaning;
        document.getElementById('modal-onyomi').innerText = k.onyomi;
        document.getElementById('modal-kunyomi').innerText = k.kunyomi || 'N/A';

        const exampleList = document.getElementById('modal-example-list');
        exampleList.innerHTML = k.examples.map(ex => `
            <li class="example-item">
                <div class="ex-jp">${ex.jp}</div>
                <div class="ex-ro">${ex.ro}</div>
                <div class="ex-en">${ex.en}</div>
            </li>
        `).join('');

        const similarList = document.getElementById('modal-similar-list');
        similarList.innerHTML = '';

        if (k.similar && k.similar.length > 0) {
            k.similar.forEach(sim => {
                const char = typeof sim === 'string' ? sim : sim.char;
                const item = document.createElement('div');
                item.className = 'similar-item';
                item.innerText = char;
                item.onclick = () => {
                    const similarK = this.findKanji(char);
                    if (similarK) {
                        this.kanjiHistory.push(this.currentKanji);
                        this.openModal(similarK);
                    }
                };
                similarList.appendChild(item);
            });
        }

        // Handle back button visibility
        const backBtn = document.getElementById('modal-back');
        if (this.kanjiHistory.length > 0) {
            backBtn.classList.remove('hidden');
        } else {
            backBtn.classList.add('hidden');
        }

        document.getElementById('kanji-modal').classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent scroll
    },

    closeModal() {
        document.getElementById('kanji-modal').classList.add('hidden');
        document.body.style.overflow = 'auto';
        this.kanjiHistory = []; // Reset history when closing
    },

    back() {
        if (this.kanjiHistory.length > 0) {
            const prevKanji = this.kanjiHistory.pop();
            this.openModal(prevKanji);
        }
    },

    findKanji(char) {
        // Search in both levels
        return kanjiData.n5.find(k => k.char === char) ||
            kanjiData.n4.find(k => k.char === char);
    },

    navigate(view) {
        window.location.hash = view;
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
