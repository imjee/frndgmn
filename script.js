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
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const result = await res.json();
        allBarang = result.data || [];
        return allBarang;
    } catch (err) {
        console.error("Gagal total memuat produk:", err);
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
    // 1. Definisikan semua elemen & variabel yang dibutuhkan
    let currentSeries = 'vespa';
    let currentJenis = 'ALL';
    let searchTerm = '';
    const seriesContainer = document.querySelector('.produk-series-selector');
    const jenisContainer = document.getElementById('jenis-selector');
    const searchInput = document.getElementById('search-input');
    const listContainer = document.getElementById('barang-list');
    const launchingListContainer = document.getElementById('launching-list');
    const bestSellerListContainer = document.getElementById('best-seller-list');

    // 2. Fungsi terpusat untuk membuat kartu produk
    function renderProductCards(container, productList, isHighlight = false) {
        if (!container) return;
        container.innerHTML = '';
        if (!productList || productList.length === 0) {
            if (!isHighlight) {
                container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 20px;">Produk tidak ditemukan.</p>';
            }
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
                </div>
            `;
            container.appendChild(el);
        });
    }
    
    // 3. Fungsi utama untuk memfilter dan me-render produk
    function displayProducts() {
        let filtered = allBarang.filter(p => p.kategori === currentSeries);
        if (currentJenis !== 'ALL') {
            filtered = filtered.filter(p => p.jenis.includes(currentJenis));
        }
        if (searchTerm) {
            filtered = filtered.filter(p => p.nama.toLowerCase().includes(searchTerm));
        }
        renderProductCards(listContainer, filtered);
    }

    // 4. Fungsi untuk membuat tombol "Jenis"
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
    
    // 5. Setup Event Listeners
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

    // 6. Inisialisasi Tampilan Awal
    await fetchProducts(); // Tunggu produk dimuat
    renderProductCards(launchingListContainer, allBarang.filter(b => b.newlaunching), true);
    renderProductCards(bestSellerListContainer, allBarang.filter(b => b.bestseller), true);
    renderJenisButtons();
    displayProducts();
}

// === LOGIKA UNTUK HALAMAN KERANJANG.HTML ===
async function initCartPage() {
    await fetchProducts(); // Wajib tunggu
    const container = document.getElementById('cart-items-container');
    const summaryEl = document.getElementById('cart-summary');
    
    if (!cart || cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding: 20px;">Keranjang Anda kosong.</p>';
        return;
    }
    
    container.innerHTML = '';
    let totalPrice = 0;
    
    cart.forEach(item => {
        const product = allBarang.find(p => p.id === item.id);
        if (product) {
            totalPrice += product.harga * item.quantity;
            const itemEl = document.createElement('div');
            itemEl.className = 'keranjang-item';
            itemEl.innerHTML = `
                <img src="${product.foto}" alt="${product.nama}">
                <div class="keranjang-item-info">
                    <h4>${product.nama}</h4>
                    <p>Rp${product.harga.toLocaleString('id-ID')}</p>
                </div>
                <div class="keranjang-item-actions">
                    <input type="number" value="${item.quantity}" min="1" onchange="window.updateQuantity('${item.id}', this.value)">
                    <button onclick="window.removeFromCart('${item.id}')" title="Hapus"><i class="fas fa-trash"></i></button>
                </div>
            `;
            container.appendChild(itemEl);
        }
    });

    document.getElementById('cart-total-price').textContent = `Rp${totalPrice.toLocaleString('id-ID')}`;
    summaryEl.style.display = 'block';
}

window.updateQuantity = function(id, qty) {
    const item = cart.find(i => i.id === id);
    if(item) {
        item.quantity = parseInt(qty, 10);
        if(item.quantity <= 0) window.removeFromCart(id);
        else { saveCart(); initCartPage(); }
    }
}

window.removeFromCart = function(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    initCartPage();
}

// === LOGIKA UNTUK HALAMAN CHECKOUT.HTML ===
async function initCheckoutPage() {
    await fetchProducts(); // Wajib tunggu
    const summaryContainer = document.getElementById('checkout-summary-items');
    const totalEl = document.getElementById('checkout-total-harga');
    let totalPrice = 0;

    if (!cart || cart.length === 0) {
        window.location.href = '/keranjang.html';
        return;
    }

    cart.forEach(item => {
        const product = allBarang.find(p => p.id === item.id);
        if (product) {
            totalPrice += product.harga * item.quantity;
            summaryContainer.innerHTML += `<p>${product.nama} (x${item.quantity})</p>`;
        }
    });

    totalEl.textContent = `Rp${totalPrice.toLocaleString('id-ID')}`;

    document.getElementById('checkout-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const nama = document.getElementById('nama').value;
        const no_wa = document.getElementById('whatsapp').value;
        const alamat = document.getElementById('alamat').value;
        let pesan = `*Pesanan Baru Masuk - Website*\n\n`;
        pesan += `*Nama:* ${nama}\n*No. WhatsApp:* ${no_wa}\n*Alamat:* ${alamat}\n\n`;
        pesan += `*Detail Pesanan:*\n`;
        cart.forEach(item => {
            const product = allBarang.find(p => p.id === item.id);
            if (product) pesan += `- ${product.nama} (x${item.quantity})\n`;
        });
        pesan += `\n*Total Belanja: Rp${totalPrice.toLocaleString('id-ID')}*\n\n`;
        pesan += `Pesanan ini menunggu konfirmasi pembayaran. Terima kasih.`;
        const nomorAdmin = "62895363383732";
        const linkWhatsApp = `https://api.whatsapp.com/send?phone=${nomorAdmin}&text=${encodeURIComponent(pesan)}`;
        
        window.open(linkWhatsApp, '_blank');
        
        alert('Pesanan Anda sedang dialihkan ke WhatsApp Admin.');
        this.reset();
        cart = [];
        saveCart();
        window.location.href = '/index.html';
    });
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
