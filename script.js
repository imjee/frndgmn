// === KONFIGURASI & VARIABEL GLOBAL ===
const kategoriMotor = {
    matic: { title: 'Matic Series', jenis: ['Vario', 'Mio'] },
    herex: { title: 'Herex Series', jenis: ['CB', 'GL', 'Tiger'] },
    vespa: { title: 'Vespa Series', jenis: ['PX', 'PTS', 'Excel', 'SUPER'] },
    ninja: { title: 'Ninja Series', jenis: ['Ninja R', 'Ninja RR', 'Ninja KIS'] }
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

function addToCart(barangId) {
    if (!barangId) {
        console.error("ID Produk tidak valid!");
        return;
    }
    const existingItem = cart.find(item => item.id === barangId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ id: barangId, quantity: 1 });
    }
    saveCart();
    alert('Produk berhasil ditambahkan ke keranjang!');
}

// === LOGIKA UNTUK HALAMAN INDEX.HTML ===
async function initIndexPage() {
    await fetchProducts();
    
    function renderProductCards(container, productList) {
        if (!container) return;
        container.innerHTML = '';
        if (!productList || !productList.length) {
            container.innerHTML = '<p>Produk tidak ditemukan.</p>';
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

    window.openMarketplaceModal = function(barang) {
        const modal = document.getElementById('modal-marketplace');
        document.getElementById('modal-marketplace-title').textContent = barang.nama;
        document.getElementById('modal-marketplace-actions').innerHTML = `
            <a href="${barang.tokopedia}" target="_blank" class="modal-beli-btn tokopedia"><i class="fab fa-shopify"></i> Tokopedia</a>
            <a href="${barang.shopee}" target="_blank" class="modal-beli-btn shopee"><i class="fas fa-store"></i> Shopee</a>
        `;
        modal.style.display = 'flex';
    }

    const marketplaceModal = document.getElementById('modal-marketplace');
    if (marketplaceModal) {
        marketplaceModal.querySelector('.modal-marketplace-close').onclick = () => {
            marketplaceModal.style.display = 'none';
        };
    }
    
    renderProductCards(document.getElementById('launching-list'), allBarang.filter(b => b.newlaunching));
    renderProductCards(document.getElementById('best-seller-list'), allBarang.filter(b => b.bestseller));
    // Logika render untuk filter utama akan ditambahkan di event listener
}

// === LOGIKA UNTUK HALAMAN KERANJANG.HTML ===
async function initCartPage() {
    await fetchProducts();
    const container = document.getElementById('cart-items-container');
    const summaryEl = document.getElementById('cart-summary');
    
    if (cart.length === 0) {
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
                    <input type="number" value="${item.quantity}" min="1" onchange="updateQuantity('${item.id}', this.value)">
                    <button onclick="removeFromCart('${item.id}')" title="Hapus"><i class="fas fa-trash"></i></button>
                </div>
            `;
            container.appendChild(itemEl);
        }
    });

    document.getElementById('cart-total-price').textContent = `Rp${totalPrice.toLocaleString('id-ID')}`;
    summaryEl.style.display = 'block';
}

function updateQuantity(id, qty) {
    const item = cart.find(i => i.id === id);
    if(item) {
        item.quantity = parseInt(qty, 10);
        if(item.quantity <= 0) removeFromCart(id);
        else { saveCart(); initCartPage(); }
    }
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    initCartPage();
}

// === LOGIKA UNTUK HALAMAN CHECKOUT.HTML ===
async function initCheckoutPage() {
    await fetchProducts();
    const summaryContainer = document.getElementById('checkout-summary-items');
    const totalEl = document.getElementById('checkout-total-harga');
    let totalPrice = 0;

    if (cart.length === 0) {
        summaryContainer.innerHTML = "<p>Keranjang kosong. Silakan kembali dan pilih produk.</p>"
        document.getElementById('checkout-form').style.display = 'none';
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
        
        alert('Pesanan Anda sedang dialihkan ke WhatsApp Admin. Mohon selesaikan proses pengiriman pesan untuk konfirmasi.');
        this.reset();
        cart = [];
        saveCart();
        window.location.href = '/index.html';
    });
}

// === ROUTER SEDERHANA & INISIALISASI ===
document.addEventListener('DOMContentLoaded', () => {
    updateCartIcon();
    const path = window.location.pathname.split("/").pop();

    if (path.includes('keranjang.html')) {
        initCartPage();
    } else if (path.includes('checkout.html')) {
        initCheckoutPage();
    } else {
        initIndexPage();
    }
});
