function updateTanggal() {
    let tanggalEl = document.getElementById("tanggal");
    let waktuEl = document.getElementById("wkatu");
    let now = new Date();

    // Menentukan hari dan tanggal
    let hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    let namaHari = hari[now.getDay()];
    let tanggal = now.getDate();
    let bulan = now.toLocaleString('id-ID', { month: 'long' });
    let tahun = now.getFullYear();

    // Menentukan jam saat ini
    let jam = now.getHours();
    let menit = now.getMinutes().toString().padStart(2, "0");

    // Menentukan waktu (Pagi, Siang, Sore, Malam)
    let waktu;
    if (jam >= 5 && jam < 12) {
        waktu = "Pagi 🌅";
    } else if (jam >= 12 && jam < 15) {
        waktu = "Siang ☀️";
    } else if (jam >= 15 && jam < 18) {
        waktu = "Sore 🌆";
    } else {
        waktu = "Malam 🌙";
    }

    // Menampilkan hasil ke dalam elemen HTML
    tanggalEl.textContent = `${namaHari}, ${tanggal} ${bulan} ${tahun}`;
    waktuEl.textContent = `${jam}:${menit} - ${waktu}`;
}

// Memanggil updateTanggal setiap detik agar jam terus diperbarui
setInterval(updateTanggal, 1000);

// Jalankan fungsi pertama kali
updateTanggal();
