document.addEventListener('DOMContentLoaded', () => {
    const loadingEl = document.getElementById('loading');
    const appContent = document.getElementById('app-content');
    const lawListEl = document.getElementById('lawList');
    const searchInput = document.getElementById('searchInput');
    const bookFilter = document.getElementById('bookFilter');
    const btnRandom = document.getElementById('btnRandom');
    const btnClear = document.getElementById('btnClear');

    // ฟังก์ชันตรวจสอบและเริ่มดึงข้อมูล
    function init() {
        if (window.lawData && window.lawData.length > 0) {
            // โหลดสำเร็จ ให้ซ่อนคำว่ากำลังโหลด แล้วแสดงส่วนเนื้อหา
            if (loadingEl) loadingEl.style.display = 'none';
            if (appContent) appContent.style.display = 'block';

            renderLaws(window.lawData);
        } else {
            // หากข้อมูลยังไม่มา ให้ลองอีกครั้งใน 100ms
            setTimeout(init, 100);
        }
    }

    // ฟังก์ชันแสดงผลรายการมาตรา
    function renderLaws(data) {
        lawListEl.innerHTML = '';

        if (data.length === 0) {
            lawListEl.innerHTML = '<div class="card" style="text-align:center;">ไม่พบข้อมูลมาตราที่ค้นหา</div>';
            return;
        }

        data.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <small style="color: #64748b;">${item.book} > ${item.chapter}</small>
                <h3>มาตรา ${item.section} : ${item.title}</h3>
                <div class="card-text">${item.text}</div>
                ${item.elements ? `<div class="card-elements"><strong>องค์ประกอบ / สาระสำคัญ:</strong>\n${item.elements}</div>` : ''}
            `;
            lawListEl.appendChild(card);
        });
    }

    // ระบบค้นหาข้อมูล (Search & Filter)
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

    // Event Listeners
    searchInput.addEventListener('input', filterData);
    bookFilter.addEventListener('change', filterData);

    // ปุ่มสุ่มมาตรา
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

    // ปุ่มล้างการค้นหา
    btnClear.addEventListener('click', () => {
        searchInput.value = '';
        bookFilter.value = '';
        renderLaws(window.lawData);
    });

    // เรียกเริ่มการทำงาน
    init();
});
