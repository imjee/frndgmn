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
        const res = await fetch('/data/barang.json');
        if (!res.ok) throw new Error('Data produk tidak ditemukan');
        const result = await res.json();
        allBarang = result.data || [];
        return allBarang;
    } catch (err) {
        console.error("Gagal memuat produk:", err);
        return [];
    }
}

// Dibuat global agar bisa diakses dari onclick HTML
window.addToCart = function(barangId) {
    if (!barangId) return;
    const existingItem = cart.find(item => item.id === barangId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ id: barangId, quantity: 1 });
    }
    saveCart();
    alert('Produk berhasil ditambahkan ke keranjang!');
}

window.openMarketplaceModal = function(barang) {
    const modal = document.getElementById('modal-marketplace');
    document.getElementById('modal-marketplace-title').textContent = barang.nama;
    document.getElementById('modal-marketplace-actions').innerHTML = `
        <a href="${barang.tokopedia}" target="_blank" class="modal-beli-btn tokopedia"><i class="fab fa-shopify"></i> Tokopedia</a>
        <a href="${barang.shopee}" target="_blank" class="modal-beli-btn shopee"><i class="fas fa-store"></i> Shopee</a>
    `;
    modal.style.display = 'flex';
}

// === LOGIKA UNTUK HALAMAN INDEX.HTML ===
async function initIndexPage() {
    await fetchProducts();
    
    let currentSeries = 'vespa';
    let currentJenis = 'ALL';
    let searchTerm = '';

    const seriesContainer = document.querySelector('.produk-series-selector');
    const jenisContainer = document.getElementById('jenis-selector');
    const searchInput = document.getElementById('search-input');
    const listContainer = document.getElementById('barang-list');

    function renderFilteredProducts() {
        let filtered = allBarang.filter(p => p.kategori === currentSeries);
        if (currentJenis !== 'ALL') {
            filtered = filtered.filter(p => p.jenis.includes(currentJenis));
        }
        if (searchTerm) {
            filtered = filtered.filter(p => p.nama.toLowerCase().includes(searchTerm));
        }
        renderProductCards(listContainer, filtered);
    }

    function renderProductCards(container, productList) {
        if (!container) return;
        container.innerHTML = '';
        if (!productList || productList.length === 0) {
            container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">Produk tidak ditemukan.</p>';
            return;
        }
        productList.forEach(barang => {
            const el = document.createElement('div');
            el.className = 'produk-card';
            const barangString = JSON.stringify(barang).replace(/'/g, "&apos;");
            el.innerHTML = `
                <img src="${barang.foto}" alt="${barang.nama}" class="produk-img"/>
                <h3>${barang.nama}</h3>
                <p class="produk-desc">${barang.deskripsi}</p>
                <p class="produk-harga">Rp${barang.harga.toLocaleString('id-ID')}</p>
                <div class="produk-actions">
                    <button class="produk-btn" onclick="addToCart('${barang.id}')">Tambah ke Keranjang</button>
                    <button class="btn-marketplace" onclick='openMarketplaceModal(${barangString})'>Beli di Marketplace</button>
                </div>
            `;
            container.appendChild(el);
        });
    }

    function renderJenisButtons() {
        jenisContainer.innerHTML = '';
        kategoriMotor[currentSeries].jenis.forEach(jenis => {
            const btn = document.createElement('button');
            btn.className = 'jenis-btn' + (jenis === currentJenis ? ' active' : '');
            btn.textContent = jenis;
            btn.dataset.jenis = jenis;
            jenisContainer.appendChild(btn);
        });
    }
    
    seriesContainer.addEventListener('click', (e) => {
        if (e.target.matches('.series-btn')) {
            seriesContainer.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            currentSeries = e.target.dataset.series;
            currentJenis = 'ALL';
            renderJenisButtons();
            renderFilteredProducts();
        }
    });

    jenisContainer.addEventListener('click', (e) => {
        if (e.target.matches('.jenis-btn')) {
            jenisContainer.querySelector('.active')?.classList.remove('active');
            e.target.classList.add('active');
            currentJenis = e.target.dataset.jenis;
            renderFilteredProducts();
        }
    });

    searchInput.addEventListener('input', () => {
        searchTerm = searchInput.value.toLowerCase();
        renderFilteredProducts();
    });

    document.getElementById('modal-marketplace')?.querySelector('.modal-marketplace-close').onclick = () => {
        document.getElementById('modal-marketplace').style.display = 'none';
    };
    
    renderJenisButtons();
    renderFilteredProducts();
    renderProductCards(document.getElementById('launching-list'), allBarang.filter(b => b.newlaunching));
    renderProductCards(document.getElementById('best-seller-list'), allBarang.filter(b => b.bestseller));
}

// === LOGIKA UNTUK HALAMAN KERANJANG.HTML ===
async function initCartPage() {
    await fetchProducts();
    // ... (kode lengkap dari revisi sebelumnya)
}

// === LOGIKA UNTUK HALAMAN CHECKOUT.HTML ===
async function initCheckoutPage() {
    await fetchProducts();
    // ... (kode lengkap dari revisi sebelumnya)
}

// === ROUTER SEDERHANA & INISIALISASI ===
document.addEventListener('DOMContentLoaded', () => {
    updateCartIcon();
    const path = window.location.pathname;

    if (path.includes('keranjang.html')) {
        initCartPage();
    } else if (path.includes('checkout.html')) {
        initCheckoutPage();
    } else {
        initIndexPage();
    }
});
