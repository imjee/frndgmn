// === KONFIGURASI & VARIABEL GLOBAL ===
const kategoriMotor = {
    vespa: { title: 'Vespa Series', jenis: ['ALL', 'PX', 'PTS', 'Excel', 'SUPER'] },
    matic: { title: 'Matic Series', jenis: ['ALL', 'Vario', 'Mio'] },
    herex: { title: 'Herex Series', jenis: ['ALL', 'CB', 'GL', 'Tiger'] },
    ninja: { title: 'Ninja Series', jenis: ['ALL', 'Ninja R', 'Ninja RR', 'Ninja KIS'] }
};
let allBarang = [];

// === FUNGSI UTAMA UNTUK MENGAMBIL DATA PRODUK ===
async function fetchProducts() {
    if (allBarang.length > 0) return allBarang;
    try {
        const res = await fetch('/barang.json'); // Pastikan path ke barang.json Anda benar
        if (!res.ok) throw new Error('Data produk tidak ditemukan');
        const result = await res.json();
        allBarang = result.data || [];
        return allBarang;
    } catch (err) {
        console.error("Gagal memuat produk:", err);
        return [];
    }
}

// === LOGIKA UNTUK HALAMAN UTAMA (INDEX.HTML) ===
async function initIndexPage() {
    await fetchProducts();
    
    // Variabel untuk state filter
    let currentSeries = 'vespa';
    let currentJenis = 'ALL';
    let searchTerm = '';

    // Elemen DOM
    const seriesContainer = document.querySelector('.produk-series-selector');
    const jenisContainer = document.getElementById('jenis-selector');
    const searchInput = document.getElementById('search-input');
    const listContainer = document.getElementById('barang-list');
    const highlightTabBtns = document.querySelectorAll('.highlight-tab-btn');

    // --- FUNGSI RENDERING ---
    function renderFilteredProducts() {
        let filtered = allBarang.filter(p => p.kategori === currentSeries);
        if (currentJenis !== 'ALL') {
            filtered = filtered.filter(p => p.jenis.includes(currentJenis));
        }
        if (searchTerm) {
            filtered = filtered.filter(p => p.nama.toLowerCase().includes(searchTerm));
        }
        renderProductCards(listContainer, filtered);
    }

    function renderProductCards(container, productList) {
        if (!container) return;
        container.innerHTML = '';
        if (!productList || productList.length === 0) {
            container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">Produk tidak ditemukan.</p>';
            return;
        }
        productList.forEach(barang => {
            const el = document.createElement('div');
            el.className = 'produk-card';
            
            const safeNamaProduk = barang.nama.replace(/'/g, "\\'");

            el.innerHTML = `
                <img src="${barang.foto}" alt="${barang.nama}" class="produk-img"/>
                <h3>${barang.nama}</h3>
                <p class="produk-desc">${barang.deskripsi}</p>
                <p class="produk-harga">Rp${barang.harga.toLocaleString('id-ID')}</p>
                <div class="produk-actions">
                    <button class="produk-btn" onclick="bukaFormPembelian('${safeNamaProduk}', ${barang.harga})">Beli Sekarang</button>
                </div>
            `;
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
    
    // --- EVENT LISTENERS UNTUK FILTER ---
    seriesContainer.addEventListener('click', (e) => {
        if (e.target.matches('.series-btn')) {
            seriesContainer.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            currentSeries = e.target.dataset.series;
            currentJenis = 'ALL';
            renderJenisButtons();
            renderFilteredProducts();
        }
    });

    jenisContainer.addEventListener('click', (e) => {
        if (e.target.matches('.jenis-btn')) {
            jenisContainer.querySelector('.active')?.classList.remove('active');
            e.target.classList.add('active');
            currentJenis = e.target.dataset.jenis;
            renderFilteredProducts();
        }
    });

    searchInput.addEventListener('input', () => {
        searchTerm = searchInput.value.toLowerCase();
        renderFilteredProducts();
    });

    highlightTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.highlight-tab-btn.active').classList.remove('active');
            btn.classList.add('active');

            document.querySelectorAll('.highlight-tab-content').forEach(content => {
                content.style.display = 'none';
            });

            const tabId = btn.dataset.tab;
            document.getElementById(tabId).style.display = 'block';
        });
    });

    // --- INISIALISASI TAMPILAN AWAL ---
    renderJenisButtons();
    renderFilteredProducts();
    renderProductCards(document.getElementById('launching-list'), allBarang.filter(b => b.newlaunching));
    renderProductCards(document.getElementById('best-seller-list'), allBarang.filter(b => b.bestseller));
}

// === FUNGSI-FUNGSI BARU UNTUK FORM PEMBELIAN VIA MODAL ===

const modal = document.getElementById('modal-pembelian');
const formNamaProduk = document.getElementById('form-nama-produk');
const formHargaProduk = document.getElementById('form-harga-produk');
const inputKuantitas = document.getElementById('kuantitas');
const totalHargaSpan = document.getElementById('total-harga');

window.bukaFormPembelian = function(namaProduk, hargaProduk) {
  formNamaProduk.value = namaProduk;
  formHargaProduk.value = hargaProduk;
  inputKuantitas.value = 1;
  hitungTotal();
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

window.tutupFormPembelian = function() {
  modal.style.display = 'none';
  document.getElementById('instruksi-pembayaran').style.display = 'none';
  document.getElementById('form-beli').reset();
  document.body.style.overflow = 'auto';
}

window.ubahKuantitas = function(jumlah) {
  let kuantitasSaatIni = parseInt(inputKuantitas.value);
  kuantitasSaatIni += jumlah;
  if (kuantitasSaatIni < 1) {
    kuantitasSaatIni = 1;
  }
  inputKuantitas.value = kuantitasSaatIni;
  hitungTotal();
}

window.hitungTotal = function() {
    const harga = parseFloat(formHargaProduk.value);
    const kuantitas = parseInt(inputKuantitas.value);
    const total = harga * kuantitas;
    totalHargaSpan.innerText = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(total);
}

window.tampilkanInstruksi = function(metode) {
    hitungTotal();
    const areaInstruksi = document.getElementById('instruksi-pembayaran');
    const semuaDetail = document.querySelectorAll('.detail-instruksi');
    semuaDetail.forEach(detail => detail.style.display = 'none');
    
    const detailPilihan = document.getElementById(`detail-${metode}`);
    if(detailPilihan) {
        detailPilihan.style.display = 'block';
    }
    areaInstruksi.style.display = 'block';
}

window.kirimKeWhatsapp = function(event) {
  event.preventDefault();

  // GANTI DENGAN NOMOR WA ANDA (gunakan 62, bukan 0)
  const nomorWhatsappTujuan = "6281234567890"; 

  const namaProduk = document.getElementById('form-nama-produk').value;
  const kuantitas = document.getElementById('kuantitas').value;
  const namaPelanggan = document.getElementById('nama-pelanggan').value;
  const alamat = document.getElementById('alamat-pelanggan').value;
  const telepon = document.getElementById('telepon-pelanggan').value;
  const metodeBayar = document.querySelector('input[name="pembayaran"]:checked').value;
  const totalBayar = totalHargaSpan.innerText;

  const pesan = `
Halo DRC Racing, saya mau pesan:

*PESANAN BARU*
-------------------------
*Produk:* ${namaProduk}
*Jumlah:* ${kuantitas} pcs
*Total:* ${totalBayar}
-------------------------

*DATA PENERIMA*
*Nama:* ${namaPelanggan}
*Alamat:* ${alamat}
*No. HP:* ${telepon}

*METODE PEMBAYARAN:*
${metodeBayar}
-------------------------

Saya akan segera melakukan pembayaran dan mengirimkan bukti transfer. Mohon diproses, terima kasih!
  `;

  const linkWhatsapp = `https://wa.me/${nomorWhatsappTujuan}?text=${encodeURIComponent(pesan.trim())}`;
  window.open(linkWhatsapp, '_blank');
  tutupFormPembelian();
}

// === INISIALISASI SCRIPT ===
document.addEventListener('DOMContentLoaded', () => {
    initIndexPage();

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            tutupFormPembelian();
        }
    });
});
