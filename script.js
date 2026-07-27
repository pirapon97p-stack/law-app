document.addEventListener('DOMContentLoaded', () => {
    const loadingEl = document.getElementById('loading');
    const appContent = document.getElementById('app-content');
    const lawListEl = document.getElementById('lawList');
    const searchInput = document.getElementById('searchInput');
    const bookFilter = document.getElementById('bookFilter');
    const btnRandom = document.getElementById('btnRandom');
    const btnClear = document.getElementById('btnClear');

    function init() {
        if (window.lawData && window.lawData.length > 0) {
            if (loadingEl) loadingEl.style.display = 'none';
            if (appContent) appContent.style.display = 'block';
            renderLaws(window.lawData);
        } else {
            setTimeout(init, 100);
        }
    }

    // ฟังก์ชันช่วยตัดแต่งและใส่แท็ก <p> เพื่อสร้างย่อหน้า
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
        lawListEl.innerHTML = '';

        if (data.length === 0) {
            lawListEl.innerHTML = '<div class="card" style="text-align:center;">ไม่พบข้อมูลมาตราที่ค้นหา</div>';
            return;
        }

        data.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            
            const formattedText = formatParagraphs(item.text);
            const formattedElements = formatParagraphs(item.elements);

            card.innerHTML = `
                <small style="color: #64748b; font-weight: 500;">${item.book} > ${item.chapter}</small>
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

        const filtered = window.lawData.filter(item => {
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
                ? window.lawData.filter(item => item.book === selectedBook)
                : window.lawData;

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
            renderLaws(window.lawData);
        });
    }

    init();
});
