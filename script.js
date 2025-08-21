document.addEventListener('DOMContentLoaded', async () => {
    // === KONFIGURASI & VARIABEL GLOBAL ===
    const kategoriMotor = {
        vespa: { jenis: ['ALL', 'PX', 'PTS', 'Excel', 'SUPER'] },
        matic: { jenis: ['ALL', 'Vario', 'Mio'] },
        herex: { jenis: ['ALL', 'CB', 'GL', 'Tiger'] },
        ninja: { jenis: ['ALL', 'Ninja R', 'Ninja RR', 'Ninja KIS'] }
    };
    let allBarang = [];
    let cart = JSON.parse(localStorage.getItem('DRCcart')) || [];
    let currentSeries = 'vespa';
    let currentJenis = 'ALL';

    // === FUNGSI-FUNGSI ===
    const fetchProducts = async () => {
        try {
            const res = await fetch('/data/barang.json');
            if (!res.ok) throw new Error('Data produk tidak ditemukan');
            const result = await res.json();
            allBarang = result.data || [];
        } catch (err) {
            console.error("GAGAL MEMUAT PRODUK:", err);
        }
    };

    const saveCart = () => {
        localStorage.setItem('DRCcart', JSON.stringify(cart));
        updateCartIcon();
    };

    const updateCartIcon = () => {
        const cartCountEl = document.getElementById('cart-count');
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountEl.textContent = totalItems;
        cartCountEl.style.display = totalItems > 0 ? 'inline-block' : 'none';
    };

    const renderProductCards = (container, productList) => {
        container.innerHTML = '';
        if (productList.length === 0) {
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
                    <button class="produk-btn">Tambah ke Keranjang</button>
                    <button class="btn-marketplace">Beli di Marketplace</button>
                </div>`;
            
            el.querySelector('.produk-btn').addEventListener('click', () => {
                const existingItem = cart.find(item => item.id === barang.id);
                if (existingItem) existingItem.quantity++;
                else cart.push({ id: barang.id, quantity: 1 });
                saveCart();
                alert('Produk ditambahkan!');
            });

            el.querySelector('.btn-marketplace').addEventListener('click', () => {
                const modal = document.getElementById('modal-marketplace');
                document.getElementById('modal-marketplace-title').textContent = barang.nama;
                document.getElementById('modal-marketplace-actions').innerHTML = `
                    <a href="${barang.tokopedia}" target="_blank" class="modal-beli-btn tokopedia">Tokopedia</a>
                    <a href="${barang.shopee}" target="_blank" class="modal-beli-btn shopee">Shopee</a>`;
                modal.style.display = 'flex';
            });
            container.appendChild(el);
        });
    };

    const displayFilteredProducts = () => {
        let filtered = allBarang.filter(p => p.kategori === currentSeries);
        if (currentJenis !== 'ALL') {
            filtered = filtered.filter(p => p.jenis.includes(currentJenis));
        }
        renderProductCards(document.getElementById('barang-list'), filtered);
    };

    const renderJenisButtons = () => {
        const container = document.getElementById('jenis-selector');
        container.innerHTML = '';
        kategoriMotor[currentSeries].jenis.forEach(jenis => {
            const btn = document.createElement('button');
            btn.className = 'jenis-btn' + (jenis === currentJenis ? ' active' : '');
            btn.textContent = jenis;
            btn.dataset.jenis = jenis;
            container.appendChild(btn);
        });
    };

    // === INISIALISASI & EVENT LISTENERS ===
    await fetchProducts();
    updateCartIcon();

    // Render Produk Awal
    renderProductCards(document.getElementById('launching-list'), allBarang.filter(b => b.newlaunching));
    renderProductCards(document.getElementById('best-seller-list'), allBarang.filter(b => b.bestseller));
    renderJenisButtons();
    displayFilteredProducts();

    // Event Listener untuk Filter
    document.querySelector('.produk-series-selector').addEventListener('click', (e) => {
        if (e.target.matches('.series-btn')) {
            document.querySelector('.series-btn.active').classList.remove('active');
            e.target.classList.add('active');
            currentSeries = e.target.dataset.series;
            currentJenis = 'ALL';
            renderJenisButtons();
            displayFilteredProducts();
        }
    });

    document.getElementById('jenis-selector').addEventListener('click', (e) => {
        if (e.target.matches('.jenis-btn')) {
            document.querySelector('.jenis-btn.active')?.classList.remove('active');
            e.target.classList.add('active');
            currentJenis = e.target.dataset.jenis;
            displayFilteredProducts();
        }
    });

    // Event Listener untuk Modal
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal-beli-bg').style.display = 'none';
        });
    });
});
