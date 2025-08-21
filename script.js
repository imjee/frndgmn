// === KONFIGURASI & VARIABEL GLOBAL ===
const kategoriMotor = {
    vespa: { title: 'Vespa Series', jenis: ['ALL', 'PX', 'PTS', 'Excel', 'SUPER'] },
    matic: { title: 'Matic Series', jenis: ['ALL', 'Vario', 'Mio'] },
    herex: { title: 'Herex Series', jenis: ['ALL', 'CB', 'GL', 'Tiger'] },
    ninja: { title: 'Ninja Series', jenis: ['ALL', 'Ninja R', 'Ninja RR', 'Ninja KIS'] }
};
// === TAMBAHKAN DETAIL REKENING DI SINI ===
const detailBank = {
    BCA: { norek: "1234567890", an: "DRC RACING EXHAUST" },
    BRI: { norek: "0987654321", an: "DRC RACING EXHAUST" },
    BNI: { norek: "1122334455", an: "DRC RACING EXHAUST" },
    Mandiri: { norek: "5566778899", an: "DRC RACING EXHAUST" },
    QRIS: { img: "/images/qris-placeholder.png" } // Ganti dengan path gambar QRIS Anda
};

let allBarang = [];
let produkTerpilih = null;
let dataPesananFinal = {}; // Variabel baru untuk menyimpan data pesanan


// === FUNGSI UTAMA UNTUK MENGAMBIL DATA PRODUK === (Tidak Berubah)
async function fetchProducts() {
    try {
        const res = await fetch('./data/barang.json');
        if (!res.ok) throw new Error('Data produk tidak ditemukan');
        const result = await res.json();
        allBarang = result.data || [];
        return allBarang;
    } catch (err) {
        console.error("Gagal memuat produk:", err);
        const listContainer = document.getElementById('barang-list');
        if (listContainer) {
            listContainer.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #ffc107;">Gagal memuat produk. Periksa file barang.json atau koneksi Anda.</p>';
        }
        return [];
    }
}
// === LOGIKA HALAMAN UTAMA === (Tidak Berubah)
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

    function renderJenisButtons() {
        jenisContainer.innerHTML = '';
        kategoriMotor[currentSeries].jenis.forEach(jenis => {
            const btn = document.createElement('button'); btn.className = 'jenis-btn' + (jenis === currentJenis ? ' active' : '');
            btn.textContent = jenis; btn.dataset.jenis = jenis; jenisContainer.appendChild(btn);
        });
    }

    seriesContainer.addEventListener('click', e => { if (e.target.matches('.series-btn')) {
        seriesContainer.querySelector('.active').classList.remove('active'); e.target.classList.add('active');
        currentSeries = e.target.dataset.series; currentJenis = 'ALL';
        renderJenisButtons(); renderFilteredProducts();
    }});
    jenisContainer.addEventListener('click', e => { if (e.target.matches('.jenis-btn')) {
        jenisContainer.querySelector('.active')?.classList.remove('active'); e.target.classList.add('active');
        currentJenis = e.target.dataset.jenis; renderFilteredProducts();
    }});
    searchInput.addEventListener('input', () => { searchTerm = searchInput.value.toLowerCase(); renderFilteredProducts(); });
    highlightTabBtns.forEach(btn => { btn.addEventListener('click', () => {
        document.querySelector('.highlight-tab-btn.active').classList.remove('active'); btn.classList.add('active');
        document.querySelectorAll('.highlight-tab-content').forEach(content => { content.style.display = 'none'; });
        document.getElementById(btn.dataset.tab).style.display = 'block';
    })});

    renderJenisButtons(); renderFilteredProducts();
    renderProductCards(document.getElementById('launching-list'), allBarang.filter(b => b.newlaunching));
    renderProductCards(document.getElementById('best-seller-list'), allBarang.filter(b => b.bestseller));
}

// === PENGATURAN MODAL ===
const modalPilihan = document.getElementById('modal-pilihan-beli');
const modalMarketplace = document.getElementById('modal-marketplace-links');
const modalForm = document.getElementById('modal-pembelian');
const modalHalamanPembayaran = document.getElementById('modal-halaman-pembayaran'); // Modal baru
const formNamaProduk = document.getElementById('form-nama-produk');
const formHargaProduk = document.getElementById('form-harga-produk');
const inputKuantitas = document.getElementById('kuantitas');
const waErrorEl = document.getElementById('wa-error');

window.bukaModalPilihan = function(idProduk) {
    produkTerpilih = allBarang.find(p => p._id === idProduk);
    if (!produkTerpilih) return;
    document.getElementById('modal-pilihan-produk').textContent = produkTerpilih.nama;
    modalPilihan.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

window.pilihBeliLangsung = function() { if (!produkTerpilih) return; modalPilihan.style.display = 'none'; bukaFormPembelian(); }
window.pilihBeliMarketplace = function() { if (!produkTerpilih) return; modalPilihan.style.display = 'none'; bukaModalMarketplace(); }

window.bukaModalMarketplace = function() {
    if (!produkTerpilih) return;
    const buttonsContainer = document.getElementById('modal-marketplace-buttons');
    buttonsContainer.innerHTML = `<a href="${produkTerpilih.tokopedia}" target="_blank" class="btn-marketplace btn-tokopedia"><i class="fas fa-store"></i> Tokopedia</a> <a href="${produkTerpilih.shopee}" target="_blank" class="btn-marketplace btn-shopee"><i class="fas fa-shopping-bag"></i> Shopee</a>`;
    modalMarketplace.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

window.bukaFormPembelian = function() {
    if (!produkTerpilih) return;
    formNamaProduk.value = produkTerpilih.nama; 
    formHargaProduk.value = produkTerpilih.harga;
    inputKuantitas.value = 1; 

    const formGroupJenis = document.getElementById('form-group-jenis');
    const jenisOptionsContainer = document.getElementById('jenis-options-container');
    jenisOptionsContainer.innerHTML = ''; 

    if (produkTerpilih.jenis && produkTerpilih.jenis.length > 1) {
        produkTerpilih.jenis.forEach((item, index) => {
            const isChecked = index === 0 ? 'checked' : '';
            jenisOptionsContainer.innerHTML += `<label><input type="radio" name="pilihan_jenis" value="${item}" ${isChecked}> ${item}</label>`;
        });
        formGroupJenis.style.display = 'block';
    } else {
        formGroupJenis.style.display = 'none';
    }
    modalForm.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// === MODIFIKASI: Fungsi untuk menutup SEMUA modal dan reset state ===
window.tutupSemuaModal = function() {
    modalPilihan.style.display = 'none';
    modalMarketplace.style.display = 'none';
    modalForm.style.display = 'none';
    modalHalamanPembayaran.style.display = 'none'; // tutup modal baru juga
    document.getElementById('form-beli').reset();
    document.body.style.overflow = 'auto';
    waErrorEl.style.display = 'none';
    produkTerpilih = null;
    dataPesananFinal = {}; // reset data pesanan
}

window.ubahKuantitas = function(jumlah) { let kuantitasSaatIni = parseInt(inputKuantitas.value); kuantitasSaatIni += jumlah; if (kuantitasSaatIni < 1) { kuantitasSaatIni = 1; } inputKuantitas.value = kuantitasSaatIni; }

function showToast(message) {
    const toast = document.getElementById("toast-notification");
    toast.textContent = message; toast.className = "toast show";
    setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3000);
}

// --- MODIFIKASI BESAR DIMULAI DI SINI ---

// === LANGKAH 1: Dari Form ke Halaman Pembayaran ===
window.lanjutKePembayaran = function(event) {
    event.preventDefault();
    if (!produkTerpilih) { alert("Terjadi kesalahan, silakan coba lagi."); return; }
    
    // Validasi Nomor WA
    const teleponInput = document.getElementById('telepon-pelanggan');
    const telepon = teleponInput.value.trim();
    if (!/^08[0-9]{8,11}$/.test(telepon)) {
        waErrorEl.textContent = 'Format nomor salah. Contoh: 08123456789';
        waErrorEl.style.display = 'block';
        teleponInput.focus();
        return;
    }
    waErrorEl.style.display = 'none';

    // Kumpulkan semua data dari form ke variabel global
    const harga = parseFloat(formHargaProduk.value);
    const kuantitas = parseInt(inputKuantitas.value);
    const total = harga * kuantitas;

    let jenisProduk = '';
    const radioJenisTerpilih = document.querySelector('input[name="pilihan_jenis"]:checked');
    if (radioJenisTerpilih) jenisProduk = radioJenisTerpilih.value;

    dataPesananFinal = {
        namaProduk: formNamaProduk.value,
        kuantitas: kuantitas,
        jenisProduk: jenisProduk,
        totalBayar: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(total),
        namaPelanggan: document.getElementById('nama-pelanggan').value,
        alamatLengkap: document.getElementById('alamat-lengkap').value,
        kota: document.getElementById('kota-kabupaten').value,
        provinsi: document.getElementById('provinsi').value,
        kodePos: document.getElementById('kode-pos').value,
        telepon: telepon,
        catatan: document.getElementById('notes-tambahan').value,
        metodeBayar: document.querySelector('input[name="pembayaran"]:checked').value,
        nomorWhatsappTujuan: produkTerpilih.whatsapp || "62895363383732"
    };

    // Tampilkan data di halaman pembayaran
    document.getElementById('final-nama-produk').textContent = `${dataPesananFinal.namaProduk} (${dataPesananFinal.kuantitas} pcs)`;
    document.getElementById('final-total-tagihan').textContent = dataPesananFinal.totalBayar;

    // Tampilkan instruksi bank yang dipilih
    const instruksiContainer = document.getElementById('final-instruksi-pembayaran');
    const metode = dataPesananFinal.metodeBayar;
    if (metode === 'QRIS') {
        instruksiContainer.innerHTML = `<h4>Scan QRIS di bawah ini:</h4><img src="${detailBank.QRIS.img}" alt="QRIS Code" style="max-width: 180px; border-radius: 8px;">`;
    } else {
        instruksiContainer.innerHTML = `
            <h4>Transfer ke ${metode}:</h4>
            <p class="rekening-info">
                Nomor Rekening: <strong id="final-rek-${metode.toLowerCase()}">${detailBank[metode].norek}</strong>
                <button type="button" class="btn-salin" onclick="salinRekening('final-rek-${metode.toLowerCase()}', '${metode}')">Salin</button>
            </p>
            <p>a.n. <strong>${detailBank[metode].an}</strong></p>
        `;
    }

    // Pindah dari modal form ke modal pembayaran
    modalForm.style.display = 'none';
    modalHalamanPembayaran.style.display = 'flex';
}

// Fungsi salin rekening baru
window.salinRekening = function(elementId, bank) {
    const rekening = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(rekening).then(() => { 
        showToast(`Nomor rekening ${bank} berhasil disalin!`); 
    });
}

// === LANGKAH 2: Dari Halaman Pembayaran ke WhatsApp ===
window.konfirmasiViaWhatsapp = function() {
    // Bangun pesan dari data yang sudah disimpan
    let alamatFormatted = `${dataPesananFinal.alamatLengkap}\n${dataPesananFinal.kota}, ${dataPesananFinal.provinsi}\nKode Pos: ${dataPesananFinal.kodePos}`;
    if (dataPesananFinal.catatan.trim() !== "") {
        alamatFormatted += `\n\n*Catatan:* ${dataPesananFinal.catatan}`;
    }

    let pesan = `Halo DRC Racing, saya ingin konfirmasi pesanan:\n\n*PESANAN BARU*\n-------------------------\n*Produk:* ${dataPesananFinal.namaProduk}\n`;
    if (dataPesananFinal.jenisProduk) {
        pesan += `*Jenis:* ${dataPesananFinal.jenisProduk}\n`;
    }
    pesan += `*Jumlah:* ${dataPesananFinal.kuantitas} pcs\n*Total:* ${dataPesananFinal.totalBayar}\n-------------------------\n\n*DATA PENERIMA*\n*Nama:* ${dataPesananFinal.namaPelanggan}\n*Alamat Lengkap:*\n${alamatFormatted}\n\n*No. HP:* ${dataPesananFinal.telepon}\n\n*METODE PEMBAYARAN:*\n${dataPesananFinal.metodeBayar}\n-------------------------\n\nSaya akan segera mengirimkan bukti transfer. Mohon diproses, terima kasih!`;

    const linkWhatsapp = `https://wa.me/${dataPesananFinal.nomorWhatsappTujuan}?text=${encodeURIComponent(pesan.trim())}`;
    
    // Buka WhatsApp lalu tutup semua modal
    window.open(linkWhatsapp, '_blank');
    tutupSemuaModal();
}

// --- MODIFIKASI BESAR SELESAI ---

document.addEventListener('DOMContentLoaded', () => {
    initIndexPage();
    window.addEventListener('click', e => {
        if (e.target == modalPilihan || e.target == modalMarketplace || e.target == modalForm || e.target == modalHalamanPembayaran) {
            tutupSemuaModal();
        }
    });
    const backToTopBtn = document.getElementById('back-to-top');
    window.onscroll = function() {
        if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) { backToTopBtn.style.display = "block"; } 
        else { backToTopBtn.style.display = "none"; }
    };
    backToTopBtn.addEventListener('click', () => { window.scrollTo({top: 0, behavior: 'smooth'}); });
});
