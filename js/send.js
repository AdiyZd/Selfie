document.addEventListener("DOMContentLoaded", function () {
    const openCamera = document.getElementById("openCamera");
    const video = document.getElementById("cameraFeed");
    const canvas = document.getElementById("photoCanvas");
    const photoPreview = document.getElementById("photoPreview");
    const sendAbsensi = document.getElementById("sendAbsensi");

    let stream;

    // Fungsi update tanggal
    function updateTanggal() {
        let tanggalEl = document.getElementById("tanggal");
        let now = new Date();
        let hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        let namaHari = hari[now.getDay()];
        let tanggal = now.getDate();
        let bulan = now.toLocaleString('id-ID', { month: 'long' });
        let tahun = now.getFullYear();
        tanggalEl.textContent = `${namaHari}, ${tanggal} ${bulan} ${tahun}`;
    }

    updateTanggal();

    // Fungsi membuka kamera
    openCamera.addEventListener("click", async function () {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                alert("Peramban tidak mendukung akses kamera!");
            } else {
                console.log("Kamera didukung!");
            }            
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: {ideal: 1280},
                    height: {ideal: 720},
                    facingMode: "user"
                } });
            video.srcObject = stream;
            video.classList.remove("d-none");
            sendAbsensi.classList.remove("d-none");
            sendAbsensi.innerHTML = "📸 Ambil Foto";
            sendAbsensi.onclick = capturePhoto;
        } catch (error) {
            alert("Gagal mengakses kamera: " + error);
        }
    });

    // Fungsi ambil gambar
    function capturePhoto() {
        const ctx = canvas.getContext("2d");
    
        // Samakan ukuran canvas dengan resolusi asli video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    
        // Gambar video ke dalam canvas
        ctx.translate(canvas.width, 0)
        ctx.scale(-1, 1)
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        let dataURL = canvas.toDataURL("image/jpeg", 1.0);
        photoPreview.src = dataURL;

        ctx.setTransfrom(1, 0, 0, 1, 0);
    
        // Pastikan ukuran tampilan preview tetap sama seperti video
        photoPreview.style.width = `${video.clientWidth}px`;
        photoPreview.style.height = `${video.clientHeight}px`;
        photoPreview.classList.remove("d-none");
    
        video.classList.add("d-none");
    
        // Hentikan kamera setelah ambil gambar
        stream.getTracks().forEach(track => track.stop());
    
        // Ubah tombol ke mode loading
        Swal.fire({
            title: "Mengambil Foto",
            html: "Tunggu sebentar",
            timer: 5000,
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading();
            }, 

            willClose: () => {
                sendAbsensi.innerHTML = "📤 send Foto Absensi",
                sendAbsensi.disabled = false;
                sendAbsensi.onclick = sendAbsensiTelegram;
            }
        });
    };
    
    

    // Fungsi kirim ke Telegram
    function sendAbsensiTelegram() {
        const telegramBotToken = "7079092015:AAFOhQM0L0PGWmKcfW2DULtjo0KHzBEHbz8"; // Ganti dengan token bot
        const chatId = "7355777672"; // Ganti dengan chat ID

        canvas.toBlob(function (blob) {
            let formData = new FormData();
            formData.append("chat_id", chatId);
            formData.append("photo", blob, "absensi.jpg");
            formData.append("caption", `Absensi: ${document.getElementById("tanggal").textContent}`);

            fetch(`https://api.telegram.org/bot${telegramBotToken}/sendPhoto`, {
                method: "POST",
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.ok) {
                    Swal.alert({
                        title: "Absensi Berhasil Di Kirim",
                        icon: "success",
                        draggable: true
                    });
                } else {
                    Swal.alert({
                        icon: "error",
                        title: "Error Silahkan Coba Lagi",
                        text: "Gagal Mengirim Absensi Periksa Koneksi Anda!",
                        footer: '<a href="#"> Kenapa Ini Terjadi? </a>'
                    });
                }
            })
            .catch(error => alert("Error: " + error));
        }, "image/jpeg");
    }
});
