// === KONFIGURASI & VARIABEL GLOBAL ===
const kategoriMotor = {
    vespa: { title: 'Vespa Series', jenis: ['ALL', 'PX', 'PTS', 'Excel', 'SUPER'] },
    matic: { title: 'Matic Series', jenis: ['ALL', 'Vario', 'Mio'] },
    herex: { title: 'Herex Series', jenis: ['ALL', 'CB', 'GL', 'Tiger'] },
    ninja: { title: 'Ninja Series', jenis: ['ALL', 'Ninja R', 'Ninja RR', 'Ninja KIS'] }
};
const detailBank = {
    BCA: { norek: "1234567890", an: "DRC RACING EXHAUST" },
    BRI: { norek: "0987654321", an: "DRC RACING EXHAUST" },
    BNI: { norek: "1122334455", an: "DRC RACING EXHAUST" },
    Mandiri: { norek: "5566778899", an: "DRC RACING EXHAUST" },
    QRIS: { img: "/images/qris-placeholder.png" }
};

let allBarang = [];
let keranjang = []; // Variabel untuk keranjang belanja
let dataPesananFinal = {};

// === FUNGSI UTAMA UNTUK MENGAMBIL DATA PRODUK === (Tidak Berubah)
async function fetchProducts() {
    try {
        const res = await fetch('./data/barang.json');
        if (!res.ok) throw new Error('Data produk tidak ditemukan');
        const result = await res.json();
        allBarang = result.data || [];
        return allBarang;
    } catch (err) { console.error("Gagal memuat produk:", err); return []; }
}

// === LOGIKA HALAMAN UTAMA === (Tombol diubah)
async function initIndexPage() {
    // ... (fungsi renderFilteredProducts, renderJenisButtons, dan event listener lainnya tetap sama) ...
    // ... (Pastikan Anda menyalin fungsi-fungsi ini dari kode lama Anda jika belum ada) ...
    let currentSeries = 'vespa'; let currentJenis = 'ALL'; let searchTerm = '';
    const seriesContainer = document.querySelector('.produk-series-selector');
    const jenisContainer = document.getElementById('jenis-selector');
    const searchInput = document.getElementById('search-input');
    const listContainer = document.getElementById('barang-list');
    const loadingIndicator = document.getElementById('loading-indicator');
    
    loadingIndicator.style.display = 'flex'; await fetchProducts(); loadingIndicator.style.display = 'none';

    function renderFilteredProducts() { /* ... (kode sama seperti sebelumnya) ... */ }
    seriesContainer.addEventListener('click', e => { /* ... (kode sama seperti sebelumnya) ... */ });
    jenisContainer.addEventListener('click', e => { /* ... (kode sama seperti sebelumnya) ... */ });
    searchInput.addEventListener('input', () => { /* ... (kode sama seperti sebelumnya) ... */ });

    // === PERUBAHAN PENTING PADA RENDER KARTU PRODUK ===
    function renderProductCards(container, productList) {
        if (!container) return; container.innerHTML = '';
        if (!productList || productList.length === 0) { container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">Produk tidak ditemukan.</p>'; return; }
        productList.forEach((barang, index) => {
            const el = document.createElement('div');
            el.className = 'produk-card'; el.style.animationDelay = `${index * 50}ms`;
            const pesanWhatsapp = encodeURIComponent(`Halo DRC Racing, saya mau tanya spesifikasi lebih lanjut tentang produk ${barang.nama}`);
            const linkWhatsapp = `https://wa.me/${barang.whatsapp}?text=${pesanWhatsapp}`;
            el.innerHTML = `
                <img src="${barang.foto}" alt="${barang.nama}" class="produk-img"/>
                <h3>${barang.nama}</h3>
                <p class="produk-desc">${barang.deskripsi || ''}</p>
                <div class="produk-specs">
                    <p><strong>Bahan:</strong> ${barang.bahan || 'N/A'}</p>
                    <p><strong>Suara:</strong> ${barang.suara || 'N/A'}</p>
                    <p><strong>Mesin:</strong> ${barang.rekomendasi_mesin || 'N/A'}</p>
                </div>
                <p class="produk-stok">${barang.stok || ''}</p>
                <p class="produk-harga">Rp${barang.harga.toLocaleString('id-ID')}</p>
                <div class="produk-actions">
                    <button class="produk-btn" onclick="bukaModalPilihJenis('${barang._id}')">Tambah ke Keranjang</button>
                    <a href="${linkWhatsapp}" target="_blank" class="btn-whatsapp-ask" title="Tanya via WhatsApp"><i class="fab fa-whatsapp"></i></a>
                </div>
            `;
            container.appendChild(el);
        });
    }

    renderProductCards(listContainer, allBarang); // Tampilkan semua produk awal
    renderProductCards(document.getElementById('launching-list'), allBarang.filter(b => b.newlaunching));
    renderProductCards(document.getElementById('best-seller-list'), allBarang.filter(b => b.bestseller));
}

// === LOGIKA KERANJANG BELANJA (BARU) ===

function muatKeranjang() {
    const keranjangDariStorage = localStorage.getItem('keranjangBelanjaDRC');
    keranjang = keranjangDariStorage ? JSON.parse(keranjangDariStorage) : [];
    updateIkonKeranjang();
}

function simpanKeranjang() {
    localStorage.setItem('keranjangBelanjaDRC', JSON.stringify(keranjang));
    updateIkonKeranjang();
}

function updateIkonKeranjang() {
    const totalItem = keranjang.reduce((total, item) => total + item.kuantitas, 0);
    document.getElementById('cart-count').innerText = totalItem;
}

const modalPilihJenis = document.getElementById('modal-pilih-jenis');
window.bukaModalPilihJenis = function(idProduk) {
    const produk = allBarang.find(p => p._id === idProduk);
    if (!produk) return;

    if (!produk.jenis || produk.jenis.length <= 1) {
        // Jika hanya 1 jenis atau tidak ada, langsung tambahkan
        const jenis = produk.jenis && produk.jenis.length > 0 ? produk.jenis[0] : 'Standar';
        tambahKeKeranjang(idProduk, jenis);
    } else {
        // Jika banyak jenis, tampilkan modal pilihan
        document.getElementById('nama-produk-pilihan').innerText = produk.nama;
        const containerOpsi = document.getElementById('container-opsi-jenis');
        containerOpsi.innerHTML = '';
        produk.jenis.forEach((item, index) => {
            const isChecked = index === 0 ? 'checked' : '';
            containerOpsi.innerHTML += `<label><input type="radio" name="pilihan_jenis_modal" value="${item}" ${isChecked}> ${item}</label>`;
        });
        
        const btnFinal = document.getElementById('btn-tambah-keranjang-final');
        btnFinal.onclick = function() {
            const jenisTerpilih = document.querySelector('input[name="pilihan_jenis_modal"]:checked').value;
            tambahKeKeranjang(idProduk, jenisTerpilih);
            tutupModalPilihJenis();
        };
        
        modalPilihJenis.style.display = 'flex';
    }
}
window.tutupModalPilihJenis = function() { modalPilihJenis.style.display = 'none'; }

function tambahKeKeranjang(idProduk, jenis, kuantitas = 1) {
    const produk = allBarang.find(p => p._id === idProduk);
    if (!produk) return;

    const idItemDiKeranjang = `${idProduk}-${jenis}`;
    const itemAda = keranjang.find(item => item.idItem === idItemDiKeranjang);

    if (itemAda) {
        itemAda.kuantitas += kuantitas;
    } else {
        keranjang.push({
            idItem: idItemDiKeranjang,
            idProduk: idProduk,
            nama: produk.nama,
            harga: produk.harga,
            foto: produk.foto,
            jenis: jenis,
            kuantitas: kuantitas
        });
    }
    simpanKeranjang();
    showToast(`"${produk.nama} (${jenis})" ditambahkan ke keranjang!`);
}

// === FUNGSI MODAL & TAMPILAN KERANJANG (BARU & MODIFIKASI) ===

const modalKeranjang = document.getElementById('modal-keranjang');
window.tampilkanKeranjang = function() {
    const listContainer = document.getElementById('keranjang-list-container');
    const totalHargaEl = document.getElementById('keranjang-total-harga');
    const keranjangKosongEl = document.getElementById('keranjang-kosong');
    const checkoutFormEl = document.getElementById('checkout-form-container');
    
    listContainer.innerHTML = '';

    if (keranjang.length === 0) {
        keranjangKosongEl.style.display = 'block';
        checkoutFormEl.style.display = 'none';
    } else {
        keranjangKosongEl.style.display = 'none';
        checkoutFormEl.style.display = 'block';
        
        let totalHarga = 0;
        keranjang.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'keranjang-item';
            totalHarga += item.harga * item.kuantitas;
            
            itemEl.innerHTML = `
                <div class="keranjang-item-info">
                    <h4>${item.nama}</h4>
                    <p>Jenis: ${item.jenis} | Harga: Rp${item.harga.toLocaleString('id-ID')}</p>
                </div>
                <div class="keranjang-item-actions">
                    <div class="quantity-selector">
                        <button onclick="ubahKuantitasDiKeranjang('${item.idItem}', -1)">-</button>
                        <input type="number" value="${item.kuantitas}" readonly>
                        <button onclick="ubahKuantitasDiKeranjang('${item.idItem}', 1)">+</button>
                    </div>
                    <button class="btn-hapus-item" onclick="hapusDariKeranjang('${item.idItem}')"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            listContainer.appendChild(itemEl);
        });
        totalHargaEl.innerText = `Rp${totalHarga.toLocaleString('id-ID')}`;
    }
    modalKeranjang.style.display = 'flex';
}

window.ubahKuantitasDiKeranjang = function(idItem, jumlah) {
    const item = keranjang.find(i => i.idItem === idItem);
    if (item) {
        item.kuantitas += jumlah;
        if (item.kuantitas <= 0) {
            hapusDariKeranjang(idItem);
        } else {
            simpanKeranjang();
            tampilkanKeranjang(); // Refresh tampilan keranjang
        }
    }
}

window.hapusDariKeranjang = function(idItem) {
    keranjang = keranjang.filter(i => i.idItem !== idItem);
    simpanKeranjang();
    tampilkanKeranjang(); // Refresh tampilan keranjang
}

// === LOGIKA CHECKOUT & PEMBAYARAN (DIMODIFIKASI) ===

const modalHalamanPembayaran = document.getElementById('modal-halaman-pembayaran');
const waErrorEl = document.getElementById('wa-error');

window.lanjutKePembayaran = function(event) {
    event.preventDefault();
    if (keranjang.length === 0) {
        alert("Keranjang Anda kosong!");
        return;
    }
    // ... (Validasi nomor WA sama seperti sebelumnya) ...
    
    // Kumpulkan data
    let totalBayar = 0;
    keranjang.forEach(item => { totalBayar += item.harga * item.kuantitas; });

    dataPesananFinal = {
        items: keranjang,
        totalBayar: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalBayar),
        namaPelanggan: document.getElementById('nama-pelanggan').value,
        // ... (data pelanggan lainnya sama)
        metodeBayar: document.querySelector('input[name="pembayaran"]:checked').value,
        nomorWhatsappTujuan: "62895363383732" // Ambil dari produk pertama atau set default
    };

    // Tampilkan data di halaman pembayaran
    const ringkasanProdukEl = document.getElementById('final-ringkasan-produk');
    ringkasanProdukEl.innerHTML = '';
    dataPesananFinal.items.forEach(item => {
        ringkasanProdukEl.innerHTML += `<p>• ${item.nama} (${item.jenis}) x${item.kuantitas}</p>`;
    });
    document.getElementById('final-total-tagihan').textContent = dataPesananFinal.totalBayar;
    
    // ... (Logika menampilkan instruksi bank sama seperti sebelumnya) ...

    modalKeranjang.style.display = 'none';
    modalHalamanPembayaran.style.display = 'flex';
}

window.konfirmasiViaWhatsapp = function() {
    // Bangun pesan dari data yang sudah disimpan
    let daftarProdukText = '';
    dataPesananFinal.items.forEach((item, index) => {
        daftarProdukText += `${index + 1}. ${item.nama}\n   - Jenis: ${item.jenis}\n   - Jumlah: ${item.kuantitas} pcs\n`;
    });

    let pesan = `Halo DRC Racing, saya ingin konfirmasi pesanan:\n\n*PESANAN BARU*\n-------------------------\n*Produk:*\n${daftarProdukText}\n*Total:* ${dataPesananFinal.totalBayar}\n-------------------------\n\n*DATA PENERIMA*\n*Nama:* ${dataPesananFinal.namaPelanggan}\n... (lanjutkan format pesan seperti sebelumnya) ...`;

    const linkWhatsapp = `https://wa.me/${dataPesananFinal.nomorWhatsappTujuan}?text=${encodeURIComponent(pesan.trim())}`;
    
    window.open(linkWhatsapp, '_blank');
    keranjang = []; // Kosongkan keranjang setelah checkout
    simpanKeranjang();
    tutupSemuaModal();
}

window.tutupSemuaModal = function() {
    modalKeranjang.style.display = 'none';
    modalHalamanPembayaran.style.display = 'none';
    modalPilihJenis.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function showToast(message) {
    const toast = document.getElementById("toast-notification");
    toast.textContent = message; toast.className = "toast show";
    setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3000);
}


// Event Listener untuk memuat keranjang saat halaman dibuka
document.addEventListener('DOMContentLoaded', () => {
    initIndexPage();
    muatKeranjang();
    // ... (event listener lainnya sama seperti sebelumnya) ...
});
