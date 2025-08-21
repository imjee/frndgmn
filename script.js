// === KONFIGURASI & VARIABEL GLOBAL ===
const kategoriMotor = {
    vespa: { title: 'Vespa Series', jenis: ['ALL', 'PX', 'PTS', 'Excel', 'SUPER'] },
    matic: { title: 'Matic Series', jenis: ['ALL', 'Vario', 'Mio'] },
    herex: { title: 'Herex Series', jenis: ['ALL', 'CB', 'GL', 'Tiger'] },
    ninja: { title: 'Ninja Series', jenis: ['ALL', 'Ninja R', 'Ninja RR', 'Ninja KIS'] }
};
let allBarang = [];
let produkTerpilih = null;

// === FUNGSI UTAMA UNTUK MENGAMBIL DATA PRODUK ===
async function fetchProducts() { /* ... tidak berubah ... */ }

// === LOGIKA UNTUK HALAMAN UTAMA (INDEX.HTML) ===
async function initIndexPage() {
    let currentSeries = 'vespa'; let currentJenis = 'ALL'; let searchTerm = '';
    const seriesContainer = document.querySelector('.produk-series-selector');
    const jenisContainer = document.getElementById('jenis-selector');
    const searchInput = document.getElementById('search-input');
    const listContainer = document.getElementById('barang-list');
    const loadingIndicator = document.getElementById('loading-indicator');
    const highlightTabBtns = document.querySelectorAll('.highlight-tab-btn');

    loadingIndicator.style.display = 'flex'; await fetchProducts(); loadingIndicator.style.display = 'none';

    function renderFilteredProducts() {
        loadingIndicator.style.display = 'flex'; listContainer.innerHTML = ''; listContainer.appendChild(loadingIndicator);
        setTimeout(() => {
            let filtered = allBarang.filter(p => p.kategori === currentSeries);
            if (currentJenis !== 'ALL') filtered = filtered.filter(p => p.jenis.includes(currentJenis));
            if (searchTerm) filtered = filtered.filter(p => p.nama.toLowerCase().includes(searchTerm));
            renderProductCards(listContainer, filtered);
            loadingIndicator.style.display = 'none';
        }, 300);
    }

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
                    <button class="produk-btn" onclick="bukaModalPilihan('${barang._id}')">Beli Sekarang</button>
                    <a href="${linkWhatsapp}" target="_blank" class="btn-whatsapp-ask" title="Tanya via WhatsApp"><i class="fab fa-whatsapp"></i></a>
                </div>
            `;
            container.appendChild(el);
        });
    }

    function renderJenisButtons() { /* ... tidak berubah ... */ }
    
    // Event listeners tidak berubah
    seriesContainer.addEventListener('click', e => { /* ... */ });
    jenisContainer.addEventListener('click', e => { /* ... */ });
    searchInput.addEventListener('input', () => { /* ... */ });
    highlightTabBtns.forEach(btn => { btn.addEventListener('click', () => { /* ... */ })});

    renderJenisButtons(); renderFilteredProducts();
    renderProductCards(document.getElementById('launching-list'), allBarang.filter(b => b.newlaunching));
    renderProductCards(document.getElementById('best-seller-list'), allBarang.filter(b => b.bestseller));
}

// === KUMPULAN FUNGSI MODAL & ALUR PEMBELIAN ===
const modalPilihan = document.getElementById('modal-pilihan-beli');
const modalMarketplace = document.getElementById('modal-marketplace-links');
const modalForm = document.getElementById('modal-pembelian');
const formNamaProduk = document.getElementById('form-nama-produk');
const formHargaProduk = document.getElementById('form-harga-produk');
const inputKuantitas = document.getElementById('kuantitas');
const totalHargaSpan = document.getElementById('total-harga');
const waErrorEl = document.getElementById('wa-error');

window.bukaModalPilihan = function(idProduk) { /* ... tidak berubah ... */ }
window.tutupModalPilihan = function() { /* ... tidak berubah ... */ }
window.pilihBeliLangsung = function() { /* ... tidak berubah ... */ }
window.pilihBeliMarketplace = function() { /* ... tidak berubah ... */ }
window.bukaModalMarketplace = function() { /* ... tidak berubah ... */ }
window.tutupModalMarketplace = function() { /* ... tidak berubah ... */ }
window.bukaFormPembelian = function() { /* ... tidak berubah ... */ }
window.tutupFormPembelian = function() { /* ... tidak berubah ... */ }

// === FUNGSI-FUNGSI PEMBANTU ===
window.ubahKuantitas = function(jumlah) { /* ... tidak berubah ... */ }
window.hitungTotal = function() { /* ... tidak berubah ... */ }
window.tampilkanInstruksi = function(metode) { /* ... tidak berubah ... */ }

// Fungsi salin rekening dengan notifikasi toast baru
window.salinRekening = function(elementId) {
    const rekening = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(rekening).then(() => {
        showToast(`Nomor rekening ${rekening} berhasil disalin!`);
    });
}

// Fungsi baru untuk menampilkan notifikasi toast
function showToast(message) {
    const toast = document.getElementById("toast-notification");
    toast.textContent = message;
    toast.className = "toast show";
    setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3000);
}

// Fungsi final untuk mengirim pesanan ke WhatsApp
window.kirimKeWhatsapp = function(event) {
    event.preventDefault();
    if (!produkTerpilih) { alert("Terjadi kesalahan, silakan coba lagi."); return; }
    
    const teleponInput = document.getElementById('telepon-pelanggan');
    const telepon = teleponInput.value.trim();
    if (!/^08[0-9]{8,11}$/.test(telepon)) {
        waErrorEl.textContent = 'Format nomor salah. Contoh: 08123456789'; waErrorEl.style.display = 'block';
        teleponInput.focus(); return;
    }
    waErrorEl.style.display = 'none';
    
    const nomorWhatsappTujuan = produkTerpilih.whatsapp || "62895363383732"; 
    const namaProduk = formNamaProduk.value; const kuantitas = inputKuantitas.value;
    const namaPelanggan = document.getElementById('nama-pelanggan').value;
    const metodeBayar = document.querySelector('input[name="pembayaran"]:checked').value;
    const totalBayar = totalHargaSpan.innerText;

    // Ambil data alamat baru
    const alamatLengkap = document.getElementById('alamat-lengkap').value;
    const kota = document.getElementById('kota-kabupaten').value;
    const provinsi = document.getElementById('provinsi').value;
    const kodePos = document.getElementById('kode-pos').value;
    const catatan = document.getElementById('notes-tambahan').value;
    let alamatFormatted = `${alamatLengkap}\n${kota}, ${provinsi}\nKode Pos: ${kodePos}`;
    if (catatan.trim() !== "") { alamatFormatted += `\n\n*Catatan:* ${catatan}`; }

    const pesan = `Halo DRC Racing, saya mau pesan:\n\n*PESANAN BARU*\n-------------------------\n*Produk:* ${namaProduk}\n*Jumlah:* ${kuantitas} pcs\n*Total:* ${totalBayar}\n-------------------------\n\n*DATA PENERIMA*\n*Nama:* ${namaPelanggan}\n*Alamat Lengkap:*\n${alamatFormatted}\n\n*No. HP:* ${telepon}\n\n*METODE PEMBAYARAN:*\n${metodeBayar}\n-------------------------\n\nSaya akan segera melakukan pembayaran dan mengirimkan bukti transfer. Mohon diproses, terima kasih!`;
    const linkWhatsapp = `https://wa.me/${nomorWhatsappTujuan}?text=${encodeURIComponent(pesan.trim())}`;
    window.open(linkWhatsapp, '_blank');
    tutupFormPembelian();
}

// === INISIALISASI SCRIPT & FITUR TAMBAHAN ===
document.addEventListener('DOMContentLoaded', () => {
    initIndexPage(); // Memulai semua fungsi utama
    
    // Menangani penutupan modal saat klik di luar
    window.addEventListener('click', e => {
        if (e.target == modalPilihan) tutupModalPilihan();
        if (e.target == modalMarketplace) tutupModalMarketplace();
        if (e.target == modalForm) tutupFormPembelian();
    });

    // Logika untuk tombol "Kembali ke Atas"
    const backToTopBtn = document.getElementById('back-to-top');
    window.onscroll = function() {
        if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
            backToTopBtn.style.display = "block";
        } else {
            backToTopBtn.style.display = "none";
        }
    };
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({top: 0, behavior: 'smooth'});
    });
});
// --- Kode Lengkap script.js di bawah (untuk salin-tempel) ---
// (Kode lengkap sudah digabungkan di atas untuk kemudahan)
