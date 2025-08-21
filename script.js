// === KONFIGURASI & VARIABEL GLOBAL ===
const kategoriMotor = {
    vespa: { title: 'Vespa Series', jenis: ['ALL', 'PX', 'PTS', 'Excel', 'SUPER'] },
    matic: { title: 'Matic Series', jenis: ['ALL', 'Vario', 'Mio'] },
    herex: { title: 'Herex Series', jenis: ['ALL', 'CB', 'GL', 'Tiger'] },
    ninja: { title: 'Ninja Series', jenis: ['ALL', 'Ninja R', 'Ninja RR', 'Ninja KIS'] }
};
let allBarang = [];
let cart = JSON.parse(localStorage.getItem('DRCcart')) || [];

// === FUNGSI BERSAMA (SHARED) ===
function saveCart() {
    localStorage.setItem('DRCcart', JSON.stringify(cart));
    updateCartIcon();
}

function updateCartIcon() {
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountEl.textContent = totalItems;
        cartCountEl.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
}

async function fetchProducts() {
    if (allBarang.length > 0) return allBarang;
    try {
        console.log("Mencoba memuat /data/barang.json...");
        const res = await fetch('/data/barang.json');
        if (!res.ok) {
            throw new Error(`Gagal memuat file! Status: ${res.status}`);
        }
        const result = await res.json();
        allBarang = result.data || [];
        console.log("Produk berhasil dimuat:", allBarang);
        return allBarang;
    } catch (err) {
        console.error("GAGAL TOTAL MEMUAT PRODUK:", err);
        return [];
    }
}

window.addToCart = function(barangId) {
    if (!barangId) return;
    const existingItem = cart.find(item => item.id === barangId);
    if (existingItem) existingItem.quantity++;
    else cart.push({ id: barangId, quantity: 1 });
    saveCart();
    alert('Produk berhasil ditambahkan ke keranjang!');
}

window.openMarketplaceModal = function(barangString) {
    const barang = JSON.parse(barangString.replace(/&apos;/g, "'"));
    const modal = document.getElementById('modal-marketplace');
    if(!modal) return;
    document.getElementById('modal-marketplace-title').textContent = barang.nama;
    document.getElementById('modal-marketplace-actions').innerHTML = `
        <a href="${barang.tokopedia}" target="_blank" class="modal-beli-btn tokopedia">Tokopedia</a>
        <a href="${barang.shopee}" target="_blank" class="modal-beli-btn shopee">Shopee</a>
    `;
    modal.style.display = 'flex';
}

// === LOGIKA UNTUK HALAMAN INDEX.HTML ===
async function initIndexPage() {
    console.log("Memulai Halaman Index...");
    const seriesContainer = document.querySelector('.produk-series-selector');
    const jenisContainer = document.getElementById('jenis-selector');
    const searchInput = document.getElementById('search-input');
    const listContainer = document.getElementById('barang-list');
    const launchingListContainer = document.getElementById('launching-list');
    const bestSellerListContainer = document.getElementById('best-seller-list');
    
    if (!seriesContainer) {
        console.log("Elemen filter tidak ditemukan, keluar dari initIndexPage.");
        return;
    }

    let currentSeries = 'vespa';
    let currentJenis = 'ALL';
    let searchTerm = '';

    const renderProductCards = (container, productList, isHighlight = false) => {
        if (!container) return;
        container.innerHTML = '';
        if (!productList || productList.length === 0) {
            if (!isHighlight) container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">Produk tidak ditemukan.</p>';
            return;
        }
        productList.forEach(barang => {
            const el = document.createElement('div');
            el.className = isHighlight ? 'produk-card highlight' : 'produk-card';
            const barangString = JSON.stringify(barang).replace(/'/g, "&apos;");
            el.innerHTML = `
                <img src="${barang.foto}" alt="${barang.nama}" class="produk-img"/>
                <h3>${barang.nama}</h3>
                <p class="produk-desc">${barang.deskripsi}</p>
                <p class="produk-harga">Rp${barang.harga.toLocaleString('id-ID')}</p>
                <div class="produk-actions">
                    <button class="produk-btn" onclick="window.addToCart('${barang.id}')">Tambah ke Keranjang</button>
                    <button class="btn-marketplace" onclick="window.openMarketplaceModal('${barangString}')">Beli di Marketplace</button>
                </div>`;
            container.appendChild(el);
        });
    };
    
    const displayProducts = () => {
        let filtered = allBarang.filter(p => p.kategori === currentSeries);
        if (currentJenis !== 'ALL') filtered = filtered.filter(p => p.jenis.includes(currentJenis));
        if (searchTerm) filtered = filtered.filter(p => p.nama.toLowerCase().includes(searchTerm));
        renderProductCards(listContainer, filtered);
    };

    const renderJenisButtons = () => {
        jenisContainer.innerHTML = '';
        kategoriMotor[currentSeries].jenis.forEach(jenis => {
            const btn = document.createElement('button');
            btn.className = 'jenis-btn' + (jenis === currentJenis ? ' active' : '');
            btn.textContent = jenis;
            btn.dataset.jenis = jenis;
            jenisContainer.appendChild(btn);
        });
    };
    
    seriesContainer.addEventListener('click', (e) => {
        if (e.target.matches('.series-btn')) {
            seriesContainer.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            currentSeries = e.target.dataset.series;
            currentJenis = 'ALL';
            renderJenisButtons();
            displayProducts();
        }
    });

    jenisContainer.addEventListener('click', (e) => {
        if (e.target.matches('.jenis-btn')) {
            jenisContainer.querySelector('.active')?.classList.remove('active');
            e.target.classList.add('active');
            currentJenis = e.target.dataset.jenis;
            displayProducts();
        }
    });

    searchInput.addEventListener('input', () => {
        searchTerm = searchInput.value.toLowerCase();
        displayProducts();
    });

    document.getElementById('modal-marketplace')?.querySelector('.modal-marketplace-close').onclick = () => {
        document.getElementById('modal-marketplace').style.display = 'none';
    };
    
    console.log("Memulai render awal...");
    await fetchProducts();
    renderProductCards(launchingListContainer, allBarang.filter(b => b.newlaunching), true);
    renderProductCards(bestSellerListContainer, allBarang.filter(b => b.bestseller), true);
    renderJenisButtons();
    displayProducts();
    console.log("Render awal selesai.");
}

// === LOGIKA HALAMAN LAIN (TETAP SAMA) ===
async function initCartPage() { /* ... kode dari sebelumnya ... */ }
async function initCheckoutPage() { /* ... kode dari sebelumnya ... */ }

// === ROUTER SEDERHANA & INISIALISASI ===
document.addEventListener('DOMContentLoaded', () => {
    updateCartIcon();
    const path = window.location.pathname;
    if (path.includes('keranjang.html')) initCartPage();
    else if (path.includes('checkout.html')) initCheckoutPage();
    else initIndexPage();
});
