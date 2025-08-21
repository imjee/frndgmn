// === KONFIGURASI & VARIABEL GLOBAL ===
const kategoriMotor = {
    matic: { title: 'Matic Series', jenis: ['Vario', 'Mio'] },
    herex: { title: 'Herex Series', jenis: ['CB', 'GL', 'Tiger'] },
    vespa: { title: 'Vespa Series', jenis: ['PX', 'PTS', 'Excel', 'SUPER'] },
    ninja: { title: 'Ninja Series', jenis: ['Ninja R', 'Ninja RR', 'Ninja KIS'] }
};
let allBarang = [];
let currentSeries = 'matic';
let currentJenis = '';
let searchTerm = '';
// Memuat keranjang dari localStorage atau membuat array kosong jika tidak ada
let cart = JSON.parse(localStorage.getItem('DRCcart')) || [];


// === FUNGSI-FUNGSI UTAMA ===

// Memuat semua data produk dari file JSON
async function loadPublicBarangList() {
    const loadingEl = document.getElementById('produk-loading');
    if (loadingEl) loadingEl.style.display = 'block';
    try {
        const res = await fetch('/data/barang.json');
        if (!res.ok) throw new Error('Gagal memuat data produk.');
        const result = await res.json();
        allBarang = result.data || [];

        renderLaunchingProducts();
        renderBestSellerProducts();
        renderJenisSelector();
        showGridBarangList();
    } catch (err) {
        console.error(err);
        document.getElementById('barang-list').innerHTML = '<p>Produk tidak dapat dimuat.</p>';
    } finally {
        if (loadingEl) loadingEl.style.display = 'none';
    }
}

// Mengganti tampilan produk berdasarkan tab (Terbaru / Terlaris)
function openHighlightTab(evt, tabName) {
    const tabcontent = document.getElementsByClassName("highlight-tab-content");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    const tablinks = document.getElementsByClassName("highlight-tab-btn");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}


// === FUNGSI-FUNGSI RENDER TAMPILAN (UI) ===

// Membuat tombol-tombol sub-kategori (Vario, Mio, dll)
function renderJenisSelector() {
    const jenisContainer = document.getElementById('jenis-selector');
    if (!jenisContainer) return;
    jenisContainer.innerHTML = '';
    const jenisArr = kategoriMotor[currentSeries].jenis;
    if (!jenisArr.includes(currentJenis)) {
        currentJenis = jenisArr[0] || '';
    }
    jenisArr.forEach(jenis => {
        const btn = document.createElement('button');
        btn.className = 'jenis-btn' + (currentJenis === jenis ? ' active' : '');
        btn.textContent = jenis;
        btn.onclick = () => {
            currentJenis = jenis;
            showGridBarangList();
            document.querySelectorAll('.jenis-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        };
        jenisContainer.appendChild(btn);
    });
}

// Menampilkan produk utama berdasarkan filter
function showGridBarangList() {
    renderProductCards('#barang-list > .produk-list-grid', allBarang.filter(b => b.kategori === currentSeries && b.jenis.includes(currentJenis)), 'produk-card');
}

// Menampilkan produk di bagian New Launching
function renderLaunchingProducts() {
    renderProductCards('#launching-list', allBarang.filter(b => b.newlaunching), 'produk-card highlight');
}

// Menampilkan produk di bagian Best Seller
function renderBestSellerProducts() {
    renderProductCards('#best-seller-list', allBarang.filter(b => b.bestseller), 'produk-card highlight');
}

// Fungsi terpusat untuk membuat kartu produk
function renderProductCards(containerSelector, productList, cardClass) {
    let container = document.querySelector(containerSelector);
    if (!container) {
        if (containerSelector === '#barang-list > .produk-list-grid') {
             container = document.getElementById('barang-list');
             const grid = document.createElement('div');
             grid.className = 'produk-list-grid';
             container.innerHTML = '';
             container.appendChild(grid);
             container = grid;
        } else {
            container = document.querySelector(containerSelector.replace(' > .produk-list-grid', ''));
        }
    }
    
    container.innerHTML = '';

    // Filter pencarian
    if (searchTerm.trim() && containerSelector.includes('#barang-list')) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        productList = productList.filter(b =>
            b.nama.toLowerCase().includes(lowerCaseSearchTerm) ||
            b.jenis.some(j => j.toLowerCase().includes(lowerCaseSearchTerm))
        );
    }
    
    if (!productList.length) {
        container.innerHTML = '<p>Produk tidak ditemukan.</p>';
        return;
    }
    
    productList.forEach(barang => {
        const el = document.createElement('div');
        el.className = cardClass;
        el.innerHTML = `
            <img src="${barang.foto}" alt="${barang.nama}" class="produk-img"/>
            <h3>${barang.nama}</h3>
            <div class="produk-jenis">${barang.jenis.join(' / ')}</div>
            <p class="produk-desc">${barang.deskripsi}</p>
            <p class="produk-harga">Rp${barang.harga.toLocaleString('id-ID')}</p>
            <button class="produk-btn" onclick="addToCart('${barang.id}')">Tambah ke Keranjang</button>
        `;
        container.appendChild(el);
    });
}


// === FUNGSI-FUNGSI KERANJANG BELANJA (CART) ===

function addToCart(barangId) {
    const existingItem = cart.find(item => item.id === barangId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ id: barangId, quantity: 1 });
    }
    saveCart();
    // Beri feedback visual singkat
    const cartBtn = document.getElementById('cart-btn');
    cartBtn.classList.add('shake');
    setTimeout(() => cartBtn.classList.remove('shake'), 500);
}

function saveCart() {
    localStorage.setItem('DRCcart', JSON.stringify(cart));
    updateCartIcon();
    renderCart();
}

function updateCartIcon() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalItems;
}

function renderCart() {
    const cartContainer = document.getElementById('keranjang-list-items');
    const cartFooter = document.getElementById('keranjang-footer');
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p style="text-align:center;">Keranjang Anda kosong.</p>';
        cartFooter.style.display = 'none';
        return;
    }
    
    cartContainer.innerHTML = '';
    let totalPrice = 0;

    cart.forEach(item => {
        const product = allBarang.find(p => p.id === item.id);
        if (product) {
            totalPrice += product.harga * item.quantity;
            const cartItemEl = document.createElement('div');
            cartItemEl.className = 'keranjang-item';
            cartItemEl.innerHTML = `
                <img src="${product.foto}" alt="${product.nama}">
                <div class="keranjang-item-info">
                    <h4>${product.nama}</h4>
                    <p>Rp${product.harga.toLocaleString('id-ID')}</p>
                </div>
                <div class="keranjang-item-actions">
                    <input type="number" value="${item.quantity}" min="1" onchange="updateQuantity('${product.id}', this.value)">
                    <button onclick="removeFromCart('${product.id}')" title="Hapus item"><i class="fas fa-trash"></i></button>
                </div>
            `;
            cartContainer.appendChild(cartItemEl);
        }
    });

    document.getElementById('keranjang-total-harga').textContent = `Rp${totalPrice.toLocaleString('id-ID')}`;
    cartFooter.style.display = 'block';
}

function updateQuantity(barangId, quantity) {
    const item = cart.find(item => item.id === barangId);
    if (item) {
        item.quantity = parseInt(quantity, 10);
        if (item.quantity <= 0) {
            removeFromCart(barangId);
        } else {
            saveCart();
        }
    }
}

function removeFromCart(barangId) {
    cart = cart.filter(item => item.id !== barangId);
    saveCart();
}


// === EVENT LISTENERS ===
document.addEventListener('DOMContentLoaded', () => {
    loadPublicBarangList();
    updateCartIcon();

    // Event listener untuk tombol series
    document.querySelectorAll('.series-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.series-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentSeries = this.getAttribute('data-series');
            currentJenis = '';
            renderJenisSelector();
            showGridBarangList();
        });
    });

    // Event listener untuk pencarian
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    searchInput.addEventListener('input', () => {
        searchTerm = searchInput.value;
        showGridBarangList();
    });
    searchBtn.addEventListener('click', () => {
        searchTerm = searchInput.value;
        showGridBarangList();
    });
    
    // Event listener untuk modal keranjang
    const cartModal = document.getElementById('modal-keranjang');
    const openCartBtn = document.getElementById('cart-btn');
    const closeCartBtn = document.querySelector('.modal-keranjang-close');
    openCartBtn.onclick = () => {
        renderCart();
        cartModal.style.display = 'flex';
    };
    closeCartBtn.onclick = () => {
        cartModal.style.display = 'none';
    };
    cartModal.onclick = (e) => {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
    };
});
