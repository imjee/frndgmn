document.addEventListener('DOMContentLoaded', () => {
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
    const saveCart = () => {
        localStorage.setItem('DRCcart', JSON.stringify(cart));
        updateCartIcon();
    };

    const updateCartIcon = () => {
        const cartCountEl = document.getElementById('cart-count');
        if (cartCountEl) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCountEl.textContent = totalItems;
            cartCountEl.style.display = totalItems > 0 ? 'inline-block' : 'none';
        }
    };

    const fetchProducts = async () => {
        if (allBarang.length > 0) return allBarang;
        try {
            const res = await fetch('/data/barang.json');
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const result = await res.json();
            allBarang = result.data || [];
            return allBarang;
        } catch (err) {
            console.error("GAGAL MEMUAT PRODUK:", err);
            return [];
        }
    };

    const addToCart = (barangId) => {
        if (!barangId) return;
        const existingItem = cart.find(item => item.id === barangId);
        if (existingItem) existingItem.quantity++;
        else cart.push({ id: barangId, quantity: 1 });
        saveCart();
        alert('Produk berhasil ditambahkan ke keranjang!');
    };
    
    // === LOGIKA HALAMAN INDEX ===
    const initIndexPage = async () => {
        const seriesContainer = document.querySelector('.produk-series-selector');
        const jenisContainer = document.getElementById('jenis-selector');
        const searchInput = document.getElementById('search-input');
        const listContainer = document.getElementById('barang-list');
        const launchingListContainer = document.getElementById('launching-list');
        const bestSellerListContainer = document.getElementById('best-seller-list');
        
        if (!seriesContainer) return;

        let currentSeries = 'vespa';
        let currentJenis = 'ALL';
        let searchTerm = '';

        const renderProductCards = (container, productList) => {
            if (!container) return;
            container.innerHTML = '';
            if (!productList || productList.length === 0) {
                container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">Produk tidak ditemukan.</p>';
                return;
            }
            productList.forEach(barang => {
                const el = document.createElement('div');
                el.className = 'produk-card';
                el.innerHTML = `
                    <img src="${barang.foto}" alt="${barang.nama}" class="produk-img"/>
                    <h3>${barang.nama}</h3>
                    <p class="produk-desc">${barang.deskripsi}</p>
                    <p class="produk-harga">Rp${barang.harga.toLocaleString('id-ID')}</p>
                    <div class="produk-actions">
                        <button class="produk-btn add-to-cart-btn">Tambah ke Keranjang</button>
                        <button class="btn-marketplace">Beli di Marketplace</button>
                    </div>`;
                
                el.querySelector('.add-to-cart-btn').addEventListener('click', () => addToCart(barang.id));
                // Event listener untuk marketplace bisa ditambahkan di sini jika diperlukan
                
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
        
        await fetchProducts();
        renderProductCards(launchingListContainer, allBarang.filter(b => b.newlaunching));
        renderProductCards(bestSellerListContainer, allBarang.filter(b => b.bestseller));
        renderJenisButtons();
        displayProducts();
    };

    // === LOGIKA HALAMAN LAIN ===
    const initCartPage = async () => { /* ... (kode lengkap dari jawaban sebelumnya) ... */ };
    const initCheckoutPage = async () => { /* ... (kode lengkap dari jawaban sebelumnya) ... */ };

    // === ROUTER SEDERHANA ===
    updateCartIcon();
    const path = window.location.pathname;
    if (path.includes('keranjang.html')) initCartPage();
    else if (path.includes('checkout.html')) initCheckoutPage();
    else initIndexPage();
});
