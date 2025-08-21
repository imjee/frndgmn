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
let cart = JSON.parse(localStorage.getItem('DRCcart')) || [];
let productToBuy = null; // Menyimpan produk yang akan dibeli

// === FUNGSI-FUNGSI UTAMA ===
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

function showGridBarangList() {
    renderProductCards('#barang-list > .produk-list-grid', allBarang.filter(b => b.kategori === currentSeries && b.jenis.includes(currentJenis)), 'produk-card');
}

function renderLaunchingProducts() {
    renderProductCards('#launching-list', allBarang.filter(b => b.newlaunching), 'produk-card highlight');
}

function renderBestSellerProducts() {
    renderProductCards('#best-seller-list', allBarang.filter(b => b.bestseller), 'produk-card highlight');
}

function renderProductCards(containerSelector, productList, cardClass) {
    let container = document.querySelector(containerSelector);
    if (!container) {
        if (containerSelector === '#barang-list > .produk-list-grid') {
             container = document.getElementById('barang-list');
             const grid = document.createElement('div');
             grid.className = 'produk-list-grid';
             container.innerHTML = ''; container.appendChild(grid);
             container = grid;
        } else {
            container = document.querySelector(containerSelector.replace(' > .produk-list-grid', ''));
        }
    }
    container.innerHTML = '';
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
            <button class="produk-btn" onclick='openModalBeli(${JSON.stringify(barang).replace(/'/g, "\\'")})'>Beli Sekarang</button>
        `;
        container.appendChild(el);
    });
}

// === FUNGSI-FUNGSI MODAL & PEMBELIAN ===

function openModalBeli(barangRaw) {
    productToBuy = typeof barangRaw === "string" ? JSON.parse(barangRaw.replace(/'/g, '"')) : barangRaw;
    document.getElementById('modal-pilihan-title').textContent = productToBuy.nama;
    document.getElementById('modal-pilihan').style.display = 'flex';
}

function openMarketplaceModal() {
    document.getElementById('modal-pilihan').style.display = 'none';
    document.getElementById('modal-beli-title').textContent = productToBuy.nama;
    document.getElementById('modal-beli-desc').textContent = productToBuy.deskripsi;
    document.querySelector('.modal-beli-btn.tokopedia').href = productToBuy.tokopedia || "#";
    document.querySelector('.modal-beli-btn.shopee').href = productToBuy.shopee || "#";
    let waMsg = encodeURIComponent(`Halo, saya ingin bertanya tentang ${productToBuy.nama} (${productToBuy.jenis.join(', ')})`);
    let waNumber = "62895363383732";
    document.querySelector('.modal-beli-btn.whatsapp').href = `https://wa.me/${waNumber}?text=${waMsg}`;
    document.getElementById('modal-beli').style.display = 'flex';
}

function buyDirect() {
    document.getElementById('modal-pilihan').style.display = 'none';
    addToCart(productToBuy.id);
    document.getElementById('cart-btn').click();
}

function openCheckout() {
    document.getElementById('modal-keranjang').style.display = 'none';
    renderCheckoutSummary();
    document.getElementById('modal-checkout').style.display = 'flex';
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
                </div>`;
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

function renderCheckoutSummary() {
    const summaryContainer = document.getElementById('checkout-summary-items');
    const totalHargaEl = document.getElementById('checkout-total-harga');
    summaryContainer.innerHTML = '';
    let totalPrice = 0;
    cart.forEach(item => {
        const product = allBarang.find(p => p.id === item.id);
        if (product) {
            totalPrice += product.harga * item.quantity;
            summaryContainer.innerHTML += `<p>${product.nama} (x${item.quantity})</p>`;
        }
    });
    totalHargaEl.textContent = `Rp${totalPrice.toLocaleString('id-ID')}`;
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
            currentJenis = ''; renderJenisSelector(); showGridBarangList();
        });
    });

    // Event listener untuk pencarian
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    searchInput.addEventListener('input', () => { searchTerm = searchInput.value; showGridBarangList(); });
    searchBtn.addEventListener('click', () => { searchTerm = searchInput.value; showGridBarangList(); });
    
    // Event listener untuk semua modal
    const modals = {
        beli: document.getElementById('modal-beli'),
        pilihan: document.getElementById('modal-pilihan'),
        keranjang: document.getElementById('modal-keranjang'),
        checkout: document.getElementById('modal-checkout')
    };

    // Tombol buka
    document.getElementById('cart-btn').onclick = () => { renderCart(); modals.keranjang.style.display = 'flex'; };
    document.getElementById('btn-pilihan-marketplace').onclick = openMarketplaceModal;
    document.getElementById('btn-pilihan-langsung').onclick = buyDirect;
    document.querySelector('.checkout-btn-trigger').onclick = openCheckout;

    // Tombol tutup & klik di luar
    for (const key in modals) {
        if (modals[key]) {
            modals[key].querySelector(`.modal-${key}-close`).onclick = () => { modals[key].style.display = 'none'; };
            modals[key].onclick = (e) => { if (e.target === modals[key]) modals[key].style.display = 'none'; };
        }
    }
    
    // Submit Form Checkout
    document.getElementById('checkout-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const nama = document.getElementById('nama').value;
        const no_wa = document.getElementById('whatsapp').value;
        const alamat = document.getElementById('alamat').value;

        let pesan = `*Pesanan Baru Masuk - Website*\n\n`;
        pesan += `*Nama:* ${nama}\n`;
        pesan += `*No. WhatsApp:* ${no_wa}\n`;
        pesan += `*Alamat:* ${alamat}\n\n`;
        pesan += `*Detail Pesanan:*\n`;

        let totalHarga = 0;
        cart.forEach(item => {
            const product = allBarang.find(p => p.id === item.id);
            if (product) {
                totalHarga += product.harga * item.quantity;
                pesan += `- ${product.nama} (x${item.quantity})\n`;
            }
        });
        pesan += `\n*Total Belanja: Rp${totalHarga.toLocaleString('id-ID')}*`;

        const nomorAdmin = "62895363383732"; // GANTI DENGAN NOMOR WA ADMIN
        const linkWhatsApp = `https://api.whatsapp.com/send?phone=${nomorAdmin}&text=${encodeURIComponent(pesan)}`;
        
        window.open(linkWhatsApp, '_blank');
        
        alert('Pesanan Anda sedang dialihkan ke WhatsApp Admin. Mohon selesaikan proses pengiriman pesan.');
        this.reset();
        cart = [];
        saveCart();
        modals.checkout.style.display = 'none';
    });
});
