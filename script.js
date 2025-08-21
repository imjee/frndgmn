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
let allBarang = [],
    keranjang = [],
    dataPesananFinal = {};

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
        return [];
    }
}

// === LOGIKA HALAMAN UTAMA ===
async function initIndexPage() {
    let currentSeries = 'vespa',
        currentJenis = 'ALL',
        searchTerm = '';
    const seriesContainer = document.querySelector('.produk-series-selector'),
        jenisContainer = document.getElementById('jenis-selector'),
        searchInput = document.getElementById('search-input'),
        listContainer = document.getElementById('barang-list'),
        loadingIndicator = document.getElementById('loading-indicator'),
        highlightTabBtns = document.querySelectorAll('.highlight-tab-btn');

    loadingIndicator.style.display = 'flex';
    await fetchProducts();
    loadingIndicator.style.display = 'none';

    function renderProductCards(container, productList) {
        container.innerHTML = '';
        if (!productList || productList.length === 0) {
            container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">Produk tidak ditemukan.</p>';
            return;
        }
        productList.forEach((barang, index) => {
            const el = document.createElement('div');
            el.className = 'produk-card';
            el.style.animationDelay = `${index * 50}ms`;
            const pesanWhatsapp = encodeURIComponent(`Halo DRC Racing, saya mau tanya spesifikasi lebih lanjut tentang produk ${barang.nama}`);
            const linkWhatsapp = `https://wa.me/${barang.whatsapp || '62895363383732'}?text=${pesanWhatsapp}`;
            el.innerHTML = `
                <img src="${barang.foto}" alt="${barang.nama}" class="produk-img"/>
                <h3>${barang.nama}</h3>
                <p class="produk-desc">${barang.deskripsi || ""}</p>
                <div class="produk-specs">
                    <p><strong>Bahan:</strong> ${barang.bahan || "N/A"}</p>
                    <p><strong>Suara:</strong> ${barang.suara || "N/A"}</p>
                    <p><strong>Mesin:</strong> ${barang.rekomendasi_mesin || "N/A"}</p>
                </div>
                <p class="produk-stok">${barang.stok || ""}</p>
                <p class="produk-harga">Rp${barang.harga.toLocaleString("id-ID")}</p>
                <div class="produk-actions">
                    <button class="produk-btn" onclick="bukaModalPilihanBeli('${barang._id}')">Beli Sekarang</button>
                    <a href="${linkWhatsapp}" target="_blank" class="btn-whatsapp-ask" title="Tanya via WhatsApp"><i class="fab fa-whatsapp"></i></a>
                </div>`;
            container.appendChild(el);
        });
    }

    function renderJenisButtons() {
        jenisContainer.innerHTML = '';
        kategoriMotor[currentSeries].jenis.forEach(jenis => {
            const btn = document.createElement('button');
            btn.className = 'jenis-btn' + (jenis === currentJenis ? ' active' : '');
            btn.textContent = jenis;
            btn.dataset.jenis = jenis;
            jenisContainer.appendChild(btn);
        });
    }

    function renderFilteredProducts() {
        loadingIndicator.style.display = 'flex';
        listContainer.innerHTML = '';
        listContainer.appendChild(loadingIndicator);
        setTimeout(() => {
            let filtered = allBarang.filter(p => p.kategori === currentSeries);
            if (currentJenis !== 'ALL') { filtered = filtered.filter(p => p.jenis.includes(currentJenis)); }
            if (searchTerm) { filtered = filtered.filter(p => p.nama.toLowerCase().includes(searchTerm)); }
            renderProductCards(listContainer, filtered);
            loadingIndicator.style.display = 'none';
        }, 300);
    }

    seriesContainer.addEventListener('click', e => { if (e.target.matches('.series-btn')) { seriesContainer.querySelector('.active').classList.remove('active'); e.target.classList.add('active'); currentSeries = e.target.dataset.series; currentJenis = 'ALL'; renderJenisButtons(); renderFilteredProducts(); } });
    jenisContainer.addEventListener('click', e => { if (e.target.matches('.jenis-btn')) { jenisContainer.querySelector('.active')?.classList.remove('active'); e.target.classList.add('active'); currentJenis = e.target.dataset.jenis; renderFilteredProducts(); } });
    searchInput.addEventListener('input', () => { searchTerm = searchInput.value.toLowerCase(); renderFilteredProducts(); });
    highlightTabBtns.forEach(btn => { btn.addEventListener('click', () => { document.querySelector('.highlight-tab-btn.active').classList.remove('active'); btn.classList.add('active'); document.querySelectorAll('.highlight-tab-content').forEach(content => { content.style.display = 'none'; }); document.getElementById(btn.dataset.tab).style.display = 'block'; }) });

    renderJenisButtons();
    renderFilteredProducts();
    renderProductCards(document.getElementById('launching-list'), allBarang.filter(b => b.newlaunching));
    renderProductCards(document.getElementById('best-seller-list'), allBarang.filter(b => b.bestseller));
}

// === LOGIKA KERANJANG BELANJA ===
function muatKeranjang() { const a = localStorage.getItem("keranjangBelanjaDRC"); keranjang = a ? JSON.parse(a) : [], updateIkonKeranjang() }
function simpanKeranjang() { localStorage.setItem("keranjangBelanjaDRC", JSON.stringify(keranjang)), updateIkonKeranjang() }
function updateIkonKeranjang() { const a = keranjang.reduce((a, b) => a + b.kuantitas, 0); document.getElementById("cart-count").innerText = a }
const modalPilihJenis = document.getElementById("modal-pilih-jenis");
function bukaModalPilihJenis(a) { const b = allBarang.find(b => b._id === a); if (b) { if (b.jenis && b.jenis.length > 1) { document.getElementById("nama-produk-pilihan").innerText = b.nama; const a = document.getElementById("container-opsi-jenis"); a.innerHTML = "", b.jenis.forEach((b, c) => { const d = 0 === c ? "checked" : ""; a.innerHTML += `<label><input type="radio" name="pilihan_jenis_modal" value="${b}" ${d}> ${b}</label>` }), document.getElementById("btn-tambah-keranjang-final").onclick = function() { const a = document.querySelector('input[name="pilihan_jenis_modal"]:checked').value; tambahKeKeranjang(b._id, a), tutupSemuaModal() }, modalPilihJenis.style.display = "flex" } else { const a = b.jenis && b.jenis.length > 0 ? b.jenis[0] : "Standar"; tambahKeKeranjang(b._id, a) } } }
function tambahKeKeranjang(a, b, c = 1) { const d = allBarang.find(b => b._id === a); if (d) { const e = `${a}-${b}`, f = keranjang.find(a => a.idItem === e); f ? f.kuantitas += c : keranjang.push({ idItem: e, idProduk: a, nama: d.nama, harga: d.harga, foto: d.foto, jenis: b, kuantitas: c }), simpanKeranjang(), showToast(`"${d.nama} (${b})" ditambahkan ke keranjang!`) } }

// === FUNGSI MODAL & TAMPILAN ===
const modalKeranjang = document.getElementById("modal-keranjang"),
    modalMarketplace = document.getElementById("modal-marketplace-links"),
    modalHalamanPembayaran = document.getElementById("modal-halaman-pembayaran"),
    waErrorEl = document.getElementById("wa-error"),
    modalPilihanBeli = document.getElementById("modal-pilihan-beli");

function bukaModalPilihanBeli(a) { const b = allBarang.find(b => b._id === a); b && (document.getElementById("nama-produk-pembelian").textContent = b.nama, document.getElementById("btn-pilihan-keranjang").onclick = function() { tutupSemuaModal(), bukaModalPilihJenis(a) }, document.getElementById("btn-pilihan-marketplace").onclick = function() { tutupSemuaModal(), bukaModalMarketplace(a) }, modalPilihanBeli.style.display = "flex") }
function bukaModalMarketplace(a) { const b = allBarang.find(b => b._id === a); b && (document.getElementById("nama-produk-marketplace").textContent = b.nama, document.getElementById("modal-marketplace-buttons").innerHTML = `<a href="${b.tokopedia}" target="_blank" class="btn-marketplace btn-tokopedia"><i class="fas fa-store"></i> Tokopedia</a><a href="${b.shopee}" target="_blank" class="btn-marketplace btn-shopee"><i class="fas fa-shopping-bag"></i> Shopee</a>`, modalMarketplace.style.display = "flex") }
function tampilkanKeranjang() { const a = document.getElementById("keranjang-list-container"), b = document.getElementById("keranjang-total-harga"), c = document.getElementById("keranjang-kosong"), d = document.getElementById("checkout-form-container"); if (a.innerHTML = "", 0 === keranjang.length) c.style.display = "block", d.style.display = "none"; else { c.style.display = "none", d.style.display = "block"; let e = 0; keranjang.forEach(c => { const d = document.createElement("div"); d.className = "keranjang-item", e += c.harga * c.kuantitas, d.innerHTML = `<div class="keranjang-item-info"><h4>${c.nama}</h4><p>Jenis: ${c.jenis} | Harga: Rp${c.harga.toLocaleString("id-ID")}</p></div><div class="keranjang-item-actions"><div class="quantity-selector"><button onclick="ubahKuantitasDiKeranjang('${c.idItem}', -1)">-</button><input type="number" value="${c.kuantitas}" readonly><button onclick="ubahKuantitasDiKeranjang('${c.idItem}', 1)">+</button></div><button class="btn-hapus-item" onclick="hapusDariKeranjang('${c.idItem}')"><i class="fas fa-trash-alt"></i></button></div>`, a.appendChild(d) }), b.innerText = `Rp${e.toLocaleString("id-ID")}` } modalKeranjang.style.display = "flex" }
function ubahKuantitasDiKeranjang(a, b) { const c = keranjang.find(b => b.idItem === a); c && (c.kuantitas += b, c.kuantitas <= 0 ? hapusDariKeranjang(a) : (simpanKeranjang(), tampilkanKeranjang())) }
function hapusDariKeranjang(a) { keranjang = keranjang.filter(b => b.idItem !== a), simpanKeranjang(), tampilkanKeranjang() }

// === LOGIKA CHECKOUT & PEMBAYARAN ===
function lanjutKePembayaran(a) { a.preventDefault(); if (0 === keranjang.length) return void alert("Keranjang Anda kosong!"); const b = document.getElementById("telepon-pelanggan"), c = b.value.trim(); if (!/^08[0-9]{8,11}$/.test(c)) return waErrorEl.textContent = "Format nomor salah. Contoh: 08123456789", waErrorEl.style.display = "block", void b.focus(); waErrorEl.style.display = "none"; let d = 0; keranjang.forEach(a => { d += a.harga * a.kuantitas }), dataPesananFinal = { items: keranjang, totalBayar: (new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 })).format(d), namaPelanggan: document.getElementById("nama-pelanggan").value, alamatLengkap: document.getElementById("alamat-lengkap").value, kota: document.getElementById("kota-kabupaten").value, provinsi: document.getElementById("provinsi").value, kodePos: document.getElementById("kode-pos").value, telepon: c, catatan: document.getElementById("notes-tambahan").value, metodeBayar: document.querySelector('input[name="pembayaran"]:checked').value, nomorWhatsappTujuan: "62895363383732" }; const e = document.getElementById("final-ringkasan-produk"); e.innerHTML = "", dataPesananFinal.items.forEach(a => { e.innerHTML += `<p>• ${a.nama} (${a.jenis}) x${a.kuantitas}</p>` }), document.getElementById("final-total-tagihan").textContent = dataPesananFinal.totalBayar; const f = document.getElementById("final-instruksi-pembayaran"), g = dataPesananFinal.metodeBayar; f.innerHTML = "QRIS" === g ? `<h4>Scan QRIS di bawah ini:</h4><img src="${detailBank.QRIS.img}" alt="QRIS Code" style="max-width: 180px; border-radius: 8px;">` : `<h4>Transfer ke ${g}:</h4><p class="rekening-info">Nomor Rekening: <strong id="final-rek-${g.toLowerCase()}">${detailBank[g].norek}</strong><button type="button" class="btn-salin" onclick="salinRekening('final-rek-${g.toLowerCase()}', '${g}')">Salin</button></p><p>a.n. <strong>${detailBank[g].an}</strong></p>`, modalKeranjang.style.display = "none", modalHalamanPembayaran.style.display = "flex" }
function salinRekening(a, b) { const c = document.getElementById(a).innerText; navigator.clipboard.writeText(c).then(() => { showToast(`Nomor rekening ${b} berhasil disalin!`) }) }
function konfirmasiViaWhatsapp() { let a = ""; dataPesananFinal.items.forEach((b, c) => { a += `${c+1}. ${b.nama}\n   - Jenis: ${b.jenis}\n   - Jumlah: ${b.kuantitas} pcs\n` }); let b = `${dataPesananFinal.alamatLengkap}\n${dataPesananFinal.kota}, ${dataPesananFinal.provinsi}\nKode Pos: ${dataPesananFinal.kodePos}`; "" !== dataPesananFinal.catatan.trim() && (b += `\n\n*Catatan:* ${dataPesananFinal.catatan}`); let c = `Halo DRC Racing, saya ingin konfirmasi pesanan:\n\n*PESANAN BARU*\n-------------------------\n*Produk:*\n${a}\n*Total:* ${dataPesananFinal.totalBayar}\n-------------------------\n\n*DATA PENERIMA*\n*Nama:* ${dataPesananFinal.namaPelanggan}\n*Alamat Lengkap:*\n${b}\n\n*No. HP:* ${dataPesananFinal.telepon}\n\n*METODE PEMBAYARAN:*\n${dataPesananFinal.metodeBayar}\n-------------------------\n\nSaya akan segera mengirimkan bukti transfer. Mohon diproses, terima kasih!`; const d = `https://wa.me/${dataPesananFinal.nomorWhatsappTujuan}?text=${encodeURIComponent(c.trim())}`; window.open(d, "_blank"), keranjang = [], simpanKeranjang(), tutupSemuaModal() }
function tutupSemuaModal() { modalKeranjang.style.display = "none", modalHalamanPembayaran.style.display = "none", modalPilihJenis.style.display = "none", modalMarketplace.style.display = "none", modalPilihanBeli.style.display = "none", document.body.style.overflow = "auto" }
function showToast(a) { const b = document.getElementById("toast-notification"); b.textContent = a, b.className = "toast show", setTimeout(function() { b.className = b.className.replace("show", "") }, 3e3) }

// === EVENT LISTENER UTAMA ===
document.addEventListener("DOMContentLoaded", () => {
    initIndexPage();
    muatKeranjang();
    const backToTopBtn = document.getElementById('back-to-top');
    window.onscroll = function() { if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) { backToTopBtn.style.display = "block"; } else { backToTopBtn.style.display = "none"; } };
    backToTopBtn.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });
});
