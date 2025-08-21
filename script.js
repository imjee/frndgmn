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

/**
 * FUNGSI BARU UNTUK TAB HIGHLIGHT
 */
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
    const list = document.getElementById('barang-list');
    if (!list) return;
    list.innerHTML = '';
    let barangList = allBarang.filter(b => b.kategori === currentSeries && b.jenis.includes(currentJenis));
    if (searchTerm.trim()) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        barangList = barangList.filter(b =>
            b.nama.toLowerCase().includes(lowerCaseSearchTerm) ||
            b.jenis.some(j => j.toLowerCase().includes(lowerCaseSearchTerm))
        );
    }
    if (!barangList.length) {
        list.innerHTML = '<p>Produk tidak ditemukan.</p>';
        return;
    }
    const grid = document.createElement('div');
    grid.className = 'produk-list-grid';
    barangList.forEach(barang => {
        const el = document.createElement('div');
        el.className = 'produk-card';
        el.innerHTML = `
            <img src="${barang.foto}" alt="${barang.nama}" class="produk-img"/>
            <h3>${barang.nama}</h3>
            <div class="produk-jenis">${barang.jenis.join(' / ')}</div>
            <p class="produk-desc">${barang.deskripsi}</p>
            <p class="produk-harga">Rp${barang.harga.toLocaleString('id-ID')}</p>
            <button class="produk-btn" onclick='openModalBeli(${JSON.stringify(barang).replace(/'/g, "\\'")})'>Beli Sekarang</button>
        `;
        grid.appendChild(el);
    });
    list.appendChild(grid);
}

function renderLaunchingProducts() {
    const container = document.getElementById('launching-list');
    container.innerHTML = '';
    const launchingProducts = allBarang.filter(b => b.newlaunching);
    if (!launchingProducts.length) {
        container.innerHTML = '<p>Belum ada produk launching.</p>';
        return;
    }
    launchingProducts.forEach(barang => {
        const el = document.createElement('div');
        el.className = 'produk-card highlight';
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

function renderBestSellerProducts() {
    const container = document.getElementById('best-seller-list');
    container.innerHTML = '';
    const bestSellerProducts = allBarang.filter(b => b.bestseller);
    if (!bestSellerProducts.length) {
        container.innerHTML = '<p>Belum ada produk best seller.</p>';
        return;
    }
    bestSellerProducts.forEach(barang => {
        const el = document.createElement('div');
        el.className = 'produk-card highlight';
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

function openModalBeli(barangRaw) {
    let barang = typeof barangRaw === "string" ? JSON.parse(barangRaw.replace(/'/g, '"')) : barangRaw;
    document.getElementById('modal-beli-title').textContent = barang.nama;
    document.getElementById('modal-beli-desc').textContent = barang.deskripsi;
    document.querySelector('.modal-beli-btn.tokopedia').href = barang.tokopedia || "#";
    document.querySelector('.modal-beli-btn.shopee').href = barang.shopee || "#";
    let waMsg = encodeURIComponent(`Halo, saya ingin beli ${barang.nama} (${barang.jenis.join(', ')})`);
    let waNumber = barang.whatsapp || "62895363383732";
    document.querySelector('.modal-beli-btn.whatsapp').href = `https://wa.me/${waNumber}?text=${waMsg}`;
    document.getElementById('modal-beli').style.display = 'flex';
    setTimeout(() => {
        document.getElementById('modal-beli').classList.add('show');
    }, 10);
}

document.querySelector('.modal-beli-close').onclick = function() {
    document.getElementById('modal-beli').classList.remove('show');
    setTimeout(() => {
        document.getElementById('modal-beli').style.display = 'none';
    }, 200);
};

document.getElementById('modal-beli').onclick = function(e) {
    if (e.target === this) {
        document.querySelector('.modal-beli-close').onclick();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    loadPublicBarangList();
    document.querySelectorAll('.series-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.series-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSeries = btn.getAttribute('data-series');
            currentJenis = '';
            renderJenisSelector();
            showGridBarangList();
        });
    });
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            searchTerm = e.target.value;
            showGridBarangList();
        });
    }
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            searchTerm = document.getElementById('search-input').value;
            showGridBarangList();
        });
    }
});
