let currentCategory = '';
let currentLawData = [];

document.addEventListener('DOMContentLoaded', () => {
    const categoryScreen = document.getElementById('category-screen');
    const appScreen = document.getElementById('app-screen');
    const btnBack = document.getElementById('btnBack');
    const searchInput = document.getElementById('searchInput');
    const bookFilter = document.getElementById('bookFilter');
    const btnRandom = document.getElementById('btnRandom');
    const btnClear = document.getElementById('btnClear');

    // ผูก Event ให้ปุ่มเลือกหมวดหมู่ทุกปุ่ม
    const cards = document.querySelectorAll('.category-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const cat = card.getAttribute('data-category');
            selectCategory(cat);
        });
    });

    // ปุ่มย้อนกลับ
    if (btnBack) {
        btnBack.addEventListener('click', () => {
            appScreen.style.display = 'none';
            categoryScreen.style.display = 'block';
        });
    }

    function selectCategory(categoryKey) {
        currentCategory = categoryKey;
        
        categoryScreen.style.display = 'none';
        appScreen.style.display = 'block';

        const titleMap = {
            'อาญา': '⚖️ ประมวลกฎหมายอาญา',
            'วิ.อาญา': '⚖️ ประมวลกฎหมายวิธีพิจารณาความอาญา',
            'แพ่ง': '⚖️ ประมวลกฎหมายแพ่งและพาณิชย์',
            'วิ.แพ่ง': '⚖️ ประมวลกฎหมายวิธีพิจารณาความแพ่งและพาณิชย์'
        };
        document.getElementById('currentLawTitle').innerText = titleMap[categoryKey] || 'ประมวลกฎหมาย';

        loadLawData();
    }

    function loadLawData() {
        const loadingEl = document.getElementById('loading');
        const appContent = document.getElementById('app-content');

        loadingEl.style.display = 'block';
        appContent.style.display = 'none';

        if (window.lawData) {
            // ดึงข้อมูลกรณีมี category ตรงกัน หรือถ้าใน lawData ยังไม่ได้ใส่ category ไว้เลย แต่เลือก 'อาญา' ให้ดึงมาแสดงทั้งหมดไปก่อน
            currentLawData = window.lawData.filter(item => {
                if (item.category) {
                    return item.category === currentCategory;
                } else {
                    return currentCategory === 'อาญา'; 
                }
            });
            
            loadingEl.style.display = 'none';
            appContent.style.display = 'block';

            setupBookFilter();
            renderLaws(currentLawData);
        } else {
            setTimeout(loadLawData, 100);
        }
    }

    function setupBookFilter() {
        bookFilter.innerHTML = '<option value="">-- แสดงทุกภาค/ลักษณะ --</option>';
        const books = [...new Set(currentLawData.map(item => item.book))];
        books.forEach(book => {
            if (book) {
                const option = document.createElement('option');
                option.value = book;
                option.textContent = book;
                bookFilter.appendChild(option);
            }
        });
    }

    function formatParagraphs(text) {
        if (!text) return '';
        return text
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => `<p>${line}</p>`)
            .join('');
    }

    function renderLaws(data) {
        const lawListEl = document.getElementById('lawList');
        lawListEl.innerHTML = '';

        if (data.length === 0) {
            lawListEl.innerHTML = '<div class="card" style="text-align:center;">ยังไม่มีข้อมูลมาตราในหมวดหมู่นี้</div>';
            return;
        }

        data.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            
            const formattedText = formatParagraphs(item.text);
            const formattedElements = formatParagraphs(item.elements);

            card.innerHTML = `
                <small style="color: #64748b; font-weight: 500;">${item.book || ''} ${item.chapter ? '> ' + item.chapter : ''}</small>
                <h3>มาตรา ${item.section} : ${item.title}</h3>
                <div class="card-text">${formattedText}</div>
                ${item.elements ? `
                    <details style="margin-top: 15px;">
                        <summary style="cursor: pointer; font-weight: bold; color: #1e3a8a; padding: 5px 0;">👁️ แสดง/ซ่อน องค์ประกอบความผิด</summary>
                        <div class="card-elements" style="margin-top: 10px; padding: 12px 15px; background-color: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 4px;">
                            ${formattedElements}
                        </div>
                    </details>
                ` : ''}
            `;
            lawListEl.appendChild(card);
        });
    }

    function filterData() {
        const keyword = searchInput.value.trim().toLowerCase();
        const selectedBook = bookFilter.value;

        const filtered = currentLawData.filter(item => {
            const matchBook = !selectedBook || item.book === selectedBook;
            const matchSearch = !keyword || 
                item.section.toString().includes(keyword) ||
                item.title.toLowerCase().includes(keyword) ||
                item.text.toLowerCase().includes(keyword) ||
                (item.elements && item.elements.toLowerCase().includes(keyword));

            return matchBook && matchSearch;
        });

        renderLaws(filtered);
    }

    if (searchInput) searchInput.addEventListener('input', filterData);
    if (bookFilter) bookFilter.addEventListener('change', filterData);

    if (btnRandom) {
        btnRandom.addEventListener('click', () => {
            const selectedBook = bookFilter.value;
            const currentPool = selectedBook 
                ? currentLawData.filter(item => item.book === selectedBook)
                : currentLawData;

            if (currentPool.length > 0) {
                const randomIndex = Math.floor(Math.random() * currentPool.length);
                renderLaws([currentPool[randomIndex]]);
            }
        });
    }

    if (btnClear) {
        btnClear.addEventListener('click', () => {
            searchInput.value = '';
            bookFilter.value = '';
            renderLaws(currentLawData);
        });
    }
});
