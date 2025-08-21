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
    QRIS: { img: "/images/qris-placeholder.png" } // Ganti dengan path gambar QRIS Anda
};

let allBarang = [];
let keranjang = []; // Variabel untuk keranjang belanja
let dataPesananFinal = {};

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
    let currentSeries = 'vespa';
    let currentJenis = 'ALL';
    let searchTerm = '';
    const seriesContainer = document.querySelector('.produk-series-selector');
    const jenisContainer = document.getElementById('jenis-selector');
    const searchInput = document.getElementById('search-input');
    const listContainer = document.getElementById('barang-list');
    const loadingIndicator = document.getElementById('loading-indicator');
    
    // ===== KODE YANG HILANG DIMASUKKAN KEMBALI DI SINI =====
    const highlightTabBtns = document.querySelectorAll('.highlight-tab-btn');

    loadingIndicator.style.display = 'flex';
    await fetchProducts();
    loadingIndicator.style.display = 'none';

    function renderProductCards(container, productList) {
        if (!container) return;
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

    // ===== KODE YANG HILANG DIMASUKKAN KEMBALI DI SINI =====
    highlightTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.highlight-tab-btn.active').classList.remove('active');
            btn.classList.add('active');
            document.querySelectorAll('.highlight-tab-content').forEach(content => {
                content.style.display = 'none';
            });
            document.getElementById(btn.dataset.tab).style.display = 'block';
        })
    });
    // ===== AKHIR DARI BAGIAN YANG DIPERBAIKI =====

    renderProductCards(listContainer, allBarang);
    renderProductCards(document.getElementById('launching-list'), allBarang.filter(b => b.newlaunching));
    renderProductCards(document.getElementById('best-seller-list'), allBarang.filter(b => b.bestseller));
}

// === LOGIKA KERANJANG BELANJA ===

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
        const jenis = produk.jenis && produk.jenis.length > 0 ? produk.jenis[0] : 'Standar';
        tambahKeKeranjang(idProduk, jenis);
    } else {
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
window.tutupModalPilihJenis = function() {
    modalPilihJenis.style.display = 'none';
}

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

// === FUNGSI MODAL & TAMPILAN KERANJANG ===

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
            tampilkanKeranjang();
        }
    }
}

window.hapusDariKeranjang = function(idItem) {
    keranjang = keranjang.filter(i => i.idItem !== idItem);
    simpanKeranjang();
    tampilkanKeranjang();
}

// === LOGIKA CHECKOUT & PEMBAYARAN ===

const modalHalamanPembayaran = document.getElementById('modal-halaman-pembayaran');
const waErrorEl = document.getElementById('wa-error');

window.lanjutKePembayaran = function(event) {
    event.preventDefault();
    if (keranjang.length === 0) {
        alert("Keranjang Anda kosong!");
        return;
    }
    
    const teleponInput = document.getElementById('telepon-pelanggan');
    const telepon = teleponInput.value.trim();
    if (!/^08[0-9]{8,11}$/.test(telepon)) {
        waErrorEl.textContent = 'Format nomor salah. Contoh: 08123456789';
        waErrorEl.style.display = 'block';
        teleponInput.focus();
        return;
    }
    waErrorEl.style.display = 'none';

    let totalBayar = 0;
    keranjang.forEach(item => { totalBayar += item.harga * item.kuantitas; });

    dataPesananFinal = {
        items: keranjang,
        totalBayar: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalBayar),
        namaPelanggan: document.getElementById('nama-pelanggan').value,
        alamatLengkap: document.getElementById('alamat-lengkap').value,
        kota: document.getElementById('kota-kabupaten').value,
        provinsi: document.getElementById('provinsi').value,
        kodePos: document.getElementById('kode-pos').value,
        telepon: telepon,
        catatan: document.getElementById('notes-tambahan').value,
        metodeBayar: document.querySelector('input[name="pembayaran"]:checked').value,
        nomorWhatsappTujuan: "62895363383732"
    };

    const ringkasanProdukEl = document.getElementById('final-ringkasan-produk');
    ringkasanProdukEl.innerHTML = '';
    dataPesananFinal.items.forEach(item => {
        ringkasanProdukEl.innerHTML += `<p>• ${item.nama} (${item.jenis}) x${item.kuantitas}</p>`;
    });
    document.getElementById('final-total-tagihan').textContent = dataPesananFinal.totalBayar;
    
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

    modalKeranjang.style.display = 'none';
    modalHalamanPembayaran.style.display = 'flex';
}

window.salinRekening = function(elementId, bank) {
    const rekening = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(rekening).then(() => {
        showToast(`Nomor rekening ${bank} berhasil disalin!`);
    });
}

window.konfirmasiViaWhatsapp = function() {
    let daftarProdukText = '';
    dataPesananFinal.items.forEach((item, index) => {
        daftarProdukText += `${index + 1}. ${item.nama}\n   - Jenis: ${item.jenis}\n   - Jumlah: ${item.kuantitas} pcs\n`;
    });
    
    let alamatFormatted = `${dataPesananFinal.alamatLengkap}\n${dataPesananFinal.kota}, ${dataPesananFinal.provinsi}\nKode Pos: ${dataPesananFinal.kodePos}`;
    if (dataPesananFinal.catatan.trim() !== "") {
        alamatFormatted += `\n\n*Catatan:* ${dataPesananFinal.catatan}`;
    }

    let pesan = `Halo DRC Racing, saya ingin konfirmasi pesanan:\n\n*PESANAN BARU*\n-------------------------\n*Produk:*\n${daftarProdukText}\n*Total:* ${dataPesananFinal.totalBayar}\n-------------------------\n\n*DATA PENERIMA*\n*Nama:* ${dataPesananFinal.namaPelanggan}\n*Alamat Lengkap:*\n${alamatFormatted}\n\n*No. HP:* ${dataPesananFinal.telepon}\n\n*METODE PEMBAYARAN:*\n${dataPesananFinal.metodeBayar}\n-------------------------\n\nSaya akan segera mengirimkan bukti transfer. Mohon diproses, terima kasih!`;

    const linkWhatsapp = `https://wa.me/${dataPesananFinal.nomorWhatsappTujuan}?text=${encodeURIComponent(pesan.trim())}`;
    
    window.open(linkWhatsapp, '_blank');
    keranjang = [];
    simpanKeranjang();
    tutupSemuaModal();
}

window.tutupSemuaModal = function() {
    document.getElementById('modal-keranjang').style.display = 'none';
    document.getElementById('modal-halaman-pembayaran').style.display = 'none';
    document.getElementById('modal-pilih-jenis').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function showToast(message) {
    const toast = document.getElementById("toast-notification");
    toast.textContent = message;
    toast.className = "toast show";
    setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    initIndexPage();
    muatKeranjang();
});
