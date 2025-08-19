// --- SCRIPT UNTUK HALAMAN UTAMA (index.html) ---
let allBarang = [];
let currentTab = 'all';

async function loadPublicBarangList() {
    const loadingEl = document.getElementById('produk-loading');
    if (loadingEl) loadingEl.style.display = 'block';

    try {
        const res = await fetch('/data/barang.json'); // perhatikan '/' di depan
        if (!res.ok) throw new Error(`Gagal memuat data: ${res.status}`);
        
        const result = await res.json();
        allBarang = result.data.reverse();

        showPublicBarangList(allBarang);
    } catch (err) {
        console.error('Gagal load barang:', err);
        const barangList = document.getElementById('barang-list');
        if (barangList) barangList.innerHTML = '<p>Maaf, produk tidak dapat dimuat saat ini. Silakan coba lagi nanti.</p>';
    } finally {
        if (loadingEl) loadingEl.style.display = 'none';
    }
}

function showPublicBarangList(barangList) {
    const list = document.getElementById('barang-list');
    if (!list) return;

    list.innerHTML = '';

    let filteredBarang = [];
    if (currentTab === 'new') {
        filteredBarang = barangList.filter(barang => barang.newLaunching);
    } else if (currentTab === 'best') {
        filteredBarang = barangList.filter(barang => barang.bestSeller);
    } else {
        filteredBarang = barangList;
    }

    if (filteredBarang.length === 0) {
        list.innerHTML = '<p>Produk tidak ditemukan.</p>';
        return;
    }

    filteredBarang.forEach(barang => {
        const el = document.createElement('div');
        el.className = 'produk-card produk-card-iqos fade-in-item';
        el.innerHTML = `
            <div class="produk-card-image-iqos">
                <img src="${barang.foto}" alt="${barang.nama}" />
            </div>
            <div class="produk-card-content-iqos">
                <h3>${barang.nama}</h3>
                <p>${barang.deskripsi}</p>
                <p><strong>Rp${barang.harga.toLocaleString('id-ID')}</strong></p>
                <a href="${barang.link}" target="_blank" class="produk-btn produk-btn-iqos">Beli Sekarang</a>
            </div>
        `;
        list.appendChild(el);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('barang-list')) {
        loadPublicBarangList();

        const tabs = document.querySelectorAll('.produk-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const newTab = e.target.dataset.tab;
                if (newTab !== currentTab) {
                    document.querySelector('.produk-tab.active')?.classList.remove('active');
                    e.target.classList.add('active');
                    currentTab = newTab;
                    showPublicBarangList(allBarang);
                }
            });
        });
    }
});
