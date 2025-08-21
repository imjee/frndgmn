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

const modalPilihan = document.getElementById('modal-pilihan-beli');
const modalMarketplace = document.getElementById('modal-marketplace-links');
const modalForm = document.getElementById('modal-pembelian');
const formNamaProduk = document.getElementById('form-nama-produk');
const formHargaProduk = document.getElementById('form-harga-produk');
const inputKuantitas = document.getElementById('kuantitas');
const totalHargaSpan = document.getElementById('total-harga');
const waErrorEl = document.getElementById('wa-error');

window.bukaModalPilihan = function(idProduk) {
    produkTerpilih = allBarang.find(p => p._id === idProduk);
    if (!produkTerpilih) return;
    document.getElementById('modal-pilihan-produk').textContent = produkTerpilih.nama;
    modalPilihan.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

window.tutupModalPilihan = function() { modalPilihan.style.display = 'none'; document.body.style.overflow = 'auto'; produkTerpilih = null; }
window.pilihBeliLangsung = function() { if (!produkTerpilih) return; modalPilihan.style.display = 'none'; bukaFormPembelian(); }
window.pilihBeliMarketplace = function() { if (!produkTerpilih) return; modalPilihan.style.display = 'none'; bukaModalMarketplace(); }
window.bukaModalMarketplace = function() {
    if (!produkTerpilih) return;
    const buttonsContainer = document.getElementById('modal-marketplace-buttons');
    buttonsContainer.innerHTML = `
        <a href="${produkTerpilih.tokopedia}" target="_blank" class="btn-marketplace btn-tokopedia"><i class="fas fa-store"></i> Tokopedia</a>
        <a href="${produkTerpilih.shopee}" target="_blank" class="btn-marketplace btn-shopee"><i class="fas fa-shopping-bag"></i> Shopee</a>
    `;
    modalMarketplace.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}
window.tutupModalMarketplace = function() { modalMarketplace.style.display = 'none'; document.body.style.overflow = 'auto'; produkTerpilih = null; }
window.bukaFormPembelian = function() {
    if (!produkTerpilih) return;
    formNamaProduk.value = produkTerpilih.nama; formHargaProduk.value = produkTerpilih.harga;
    inputKuantitas.value = 1; hitungTotal(); modalForm.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}
window.tutupFormPembelian = function() {
    modalForm.style.display = 'none'; document.getElementById('instruksi-pembayaran').style.display = 'none';
    document.getElementById('form-beli').reset(); document.body.style.overflow = 'auto';
    waErrorEl.style.display = 'none'; produkTerpilih = null;
}
window.ubahKuantitas = function(jumlah) { let kuantitasSaatIni = parseInt(inputKuantitas.value); kuantitasSaatIni += jumlah; if (kuantitasSaatIni < 1) { kuantitasSaatIni = 1; } inputKuantitas.value = kuantitasSaatIni; hitungTotal(); }
window.hitungTotal = function() { const harga = parseFloat(formHargaProduk.value); const kuantitas = parseInt(inputKuantitas.value); const total = harga * kuantitas; totalHargaSpan.innerText = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(total); }
window.tampilkanInstruksi = function(metode) { hitungTotal(); const areaInstruksi = document.getElementById('instruksi-pembayaran'); const semuaDetail = document.querySelectorAll('.detail-instruksi'); semuaDetail.forEach(detail => detail.style.display = 'none'); const detailPilihan = document.getElementById(`detail-${metode}`); if (detailPilihan) { detailPilihan.style.display = 'block'; } areaInstruksi.style.display = 'block'; }

window.salinRekening = function(elementId) {
    const rekening = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(rekening).then(() => { showToast(`Nomor rekening ${rekening} berhasil disalin!`); });
}
function showToast(message) {
    const toast = document.getElementById("toast-notification");
    toast.textContent = message; toast.className = "toast show";
    setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3000);
}

window.kirimKeWhatsapp = function(event) {
    event.preventDefault();
    if (!produkTerpilih) { alert("Terjadi kesalahan, silakan coba lagi."); return; }
    const teleponInput = document.getElementById('telepon-pelanggan'); const telepon = teleponInput.value.trim();
    if (!/^08[0-9]{8,11}$/.test(telepon)) { waErrorEl.textContent = 'Format nomor salah. Contoh: 08123456789'; waErrorEl.style.display = 'block'; teleponInput.focus(); return; }
    waErrorEl.style.display = 'none';
    const nomorWhatsappTujuan = produkTerpilih.whatsapp || "62895363383732";
    const namaProduk = formNamaProduk.value; const kuantitas = inputKuantitas.value;
    const namaPelanggan = document.getElementById('nama-pelanggan').value;
    const metodeBayar = document.querySelector('input[name="pembayaran"]:checked').value;
    const totalBayar = totalHargaSpan.innerText;
    const alamatLengkap = document.getElementById('alamat-lengkap').value;
    const kota = document.getElementById('kota-kabupaten').value; const provinsi = document.getElementById('provinsi').value;
    const kodePos = document.getElementById('kode-pos').value; const catatan = document.getElementById('notes-tambahan').value;
    let alamatFormatted = `${alamatLengkap}\n${kota}, ${provinsi}\nKode Pos: ${kodePos}`;
    if (catatan.trim() !== "") { alamatFormatted += `\n\n*Catatan:* ${catatan}`; }
    const pesan = `Halo DRC Racing, saya mau pesan:\n\n*PESANAN BARU*\n-------------------------\n*Produk:* ${namaProduk}\n*Jumlah:* ${kuantitas} pcs\n*Total:* ${totalBayar}\n-------------------------\n\n*DATA PENERIMA*\n*Nama:* ${namaPelanggan}\n*Alamat Lengkap:*\n${alamatFormatted}\n\n*No. HP:* ${telepon}\n\n*METODE PEMBAYARAN:*\n${metodeBayar}\n-------------------------\n\nSaya akan segera melakukan pembayaran dan mengirimkan bukti transfer. Mohon diproses, terima kasih!`;
    const linkWhatsapp = `https://wa.me/${nomorWhatsappTujuan}?text=${encodeURIComponent(pesan.trim())}`;
    window.open(linkWhatsapp, '_blank');
    tutupFormPembelian();
}

document.addEventListener('DOMContentLoaded', () => {
    initIndexPage();
    window.addEventListener('click', e => {
        if (e.target == modalPilihan) tutupModalPilihan();
        if (e.target == modalMarketplace) tutupModalMarketplace();
        if (e.target == modalForm) tutupFormPembelian();
    });
    const backToTopBtn = document.getElementById('back-to-top');
    window.onscroll = function() {
        if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) { backToTopBtn.style.display = "block"; } 
        else { backToTopBtn.style.display = "none"; }
    };
    backToTopBtn.addEventListener('click', () => { window.scrollTo({top: 0, behavior: 'smooth'}); });
});
