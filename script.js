// --- SCRIPT UNTUK HALAMAN UTAMA (index.html) ---
let allBarang = [];
let currentTab = 'all';

async function loadPublicBarangList() {
    const loadingEl = document.getElementById('produk-loading');
    if (loadingEl) loadingEl.style.display = 'block';

    try {
        const res = await fetch('data/barang.json');
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
    // Hanya jalankan jika di halaman utama
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
    
    // Logika untuk admin panel
    if (document.getElementById('admin-barang-list')) {
        loadAdminBarangList();
    }
});

// --- SCRIPT UNTUK HALAMAN LOGIN (login.html) ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = loginForm.username.value;
        const password = loginForm.password.value;
        if (username === 'admin' && password === '123') {
            localStorage.setItem('drc_token', 'admin_token_123');
            window.location.href = 'admin.html';
        } else {
            alert('Username atau password salah!');
        }
    });
}

// --- SCRIPT UNTUK HALAMAN ADMIN (admin.html) ---
let nextId = 1;
const barangForm = document.getElementById('barangForm');
if (barangForm) {
    barangForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const successMessage = document.getElementById('success-message');
        const submitBtn = document.getElementById('submitBtn');

        submitBtn.disabled = true;
        
        const form = new FormData(barangForm);
        const newBarang = {
            _id: form.get('id') || `new-${Date.now()}`,
            nama: form.get('nama'),
            deskripsi: form.get('deskripsi'),
            harga: parseInt(form.get('harga')),
            foto: form.get('foto') ? URL.createObjectURL(form.get('foto')) : document.getElementById('currentFoto').src,
            link: form.get('link'),
            bestSeller: form.get('bestSeller') === 'on',
            newLaunching: form.get('newLaunching') === 'on'
        };

        let barangIndex = allBarang.findIndex(b => b._id === newBarang._id);

        if (barangIndex !== -1) {
            allBarang[barangIndex] = newBarang;
            successMessage.textContent = 'Produk berhasil diupdate!';
        } else {
            allBarang.unshift(newBarang);
            successMessage.textContent = 'Produk berhasil ditambahkan!';
        }

        saveBarangList(allBarang);
        showAdminBarangList();
        barangForm.reset();
        document.getElementById('currentFoto').style.display = 'none';
        submitBtn.textContent = 'Tambah Produk';
        submitBtn.disabled = false;
        
        setTimeout(() => successMessage.textContent = '', 3000);
    });
}

async function loadAdminBarangList() {
    const loadingEl = document.getElementById('dashboard-loading');
    if (loadingEl) loadingEl.style.display = 'block';

    try {
        const res = await fetch('data/barang.json');
        if (!res.ok) throw new Error(`Gagal memuat data: ${res.status}`);
        
        const result = await res.json();
        allBarang = result.data.reverse();

        showAdminBarangList();
    } catch (err) {
        console.error('Gagal load barang admin:', err);
    } finally {
        if (loadingEl) loadingEl.style.display = 'none';
    }
}

function showAdminBarangList() {
    const list = document.getElementById('admin-barang-list');
    if (!list) return;

    list.innerHTML = '';
    allBarang.forEach(barang => {
        const el = document.createElement('div');
        el.className = 'admin-barang-card';
        el.innerHTML = `
            <img src="${barang.foto}" alt="${barang.nama}" />
            <div class="content">
                <h3>${barang.nama}</h3>
                <p>Harga: <strong>Rp${barang.harga.toLocaleString('id-ID')}</strong></p>
                <p>${barang.deskripsi.substring(0, 50)}...</p>
            </div>
            <div class="actions">
                <button class="btn-edit" data-id="${barang._id}">Edit</button>
                <button class="btn-hapus" data-id="${barang._id}">Hapus</button>
            </div>
        `;
        list.appendChild(el);
    });
    
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => editBarang(e.target.dataset.id));
    });
    document.querySelectorAll('.btn-hapus').forEach(btn => {
        btn.addEventListener('click', (e) => hapusBarang(e.target.dataset.id));
    });
}

function editBarang(id) {
    const barang = allBarang.find(b => b._id === id);
    if (!barang) return;
    
    barangForm.querySelector('input[name="id"]').value = barang._id;
    barangForm.querySelector('input[name="nama"]').value = barang.nama;
    barangForm.querySelector('textarea[name="deskripsi"]').value = barang.deskripsi;
    barangForm.querySelector('input[name="harga"]').value = barang.harga;
    barangForm.querySelector('input[name="link"]').value = barang.link;
    barangForm.querySelector('input[name="bestSeller"]').checked = barang.bestSeller;
    barangForm.querySelector('input[name="newLaunching"]').checked = barang.newLaunching;
    
    const fotoEl = document.getElementById('currentFoto');
    fotoEl.src = barang.foto;
    fotoEl.style.display = 'block';

    document.getElementById('submitBtn').textContent = 'Update Produk';
}

function hapusBarang(id) {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
        allBarang = allBarang.filter(b => b._id !== id);
        saveBarangList(allBarang);
        showAdminBarangList();
    }
}

function saveBarangList(data) {
    // Simpan ke localStorage, karena tidak ada backend
    localStorage.setItem('barangData', JSON.stringify({ data: data }));
    alert('Data berhasil disimpan ke Local Storage!');
}
