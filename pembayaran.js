document.addEventListener('DOMContentLoaded', () => {
    const pesanan = JSON.parse(localStorage.getItem('detailPesanan'));

    if (!pesanan) {
        document.querySelector('.payment-container').innerHTML = '<h1>Error: Data pesanan tidak ditemukan.</h1><p>Silakan <a href="/index.html">kembali ke beranda</a> dan ulangi proses pemesanan.</p>';
        return;
    }

    document.getElementById('summary-produk').textContent = pesanan.namaProduk;
    document.getElementById('summary-kuantitas').textContent = `${pesanan.kuantitas} pcs`;
    document.getElementById('summary-total').textContent = pesanan.totalBayar;
    
    document.getElementById('summary-nama').textContent = pesanan.namaPelanggan;
    document.getElementById('summary-alamat').innerHTML = `${pesanan.alamatFormatted.replace(/\n/g, '<br>')}`;
    document.getElementById('summary-telepon').textContent = `Telp: ${pesanan.telepon}`;

    const semuaInstruksi = document.querySelectorAll('.instr-detail');
    semuaInstruksi.forEach(instr => instr.style.display = 'none'); 

    const instruksiTerpilih = document.getElementById(`instr-${pesanan.metodeBayar.toLowerCase()}`);
    if (instruksiTerpilih) {
        instruksiTerpilih.style.display = 'block';
    }

    const konfirmasiBtn = document.getElementById('konfirmasi-btn');
    konfirmasiBtn.addEventListener('click', () => {
        const pesanKonfirmasi = `Halo DRC Racing,

Saya sudah melakukan pembayaran untuk pesanan berikut:
-------------------------
*Produk:* ${pesanan.namaProduk}
*Jumlah:* ${pesanan.kuantitas} pcs
*Total:* ${pesanan.totalBayar}
*Nama:* ${pesanan.namaPelanggan}
-------------------------

Mohon segera diproses. Berikut saya lampirkan bukti transfernya. Terima kasih!`;

        const nomorWhatsappTujuan = pesanan.nomorWhatsappTujuan || "62895363383732"; // Fallback number
        const linkWhatsapp = `https://wa.me/${nomorWhatsappTujuan}?text=${encodeURIComponent(pesanKonfirmasi.trim())}`;
        
        localStorage.removeItem('detailPesanan');
        window.location.href = linkWhatsapp;
    });
});
