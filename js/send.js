const { response, text } = require("express");
const { Types } = require("twilio/lib/rest/content/v1/content");

document.addEventListener("DOMContentLoaded", function () {
    const openCamera = document.getElementById("openCamera");
    const video = document.getElementById("cameraFeed");
    const canvas = document.getElementById("photoCanvas");
    const photoPreview = document.getElementById("photoPreview");
    const sendAbsensi = document.getElementById("sendAbsensi");

    let stream;
    let absensiData = []; // Menyimpan data absen dalam array

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

    document.addEventListener("DOMContentLoaded", function () {
        updateTanggal()
    })

    openCamera.addEventListener("click", async function () {
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: "user"
                }
            });
            video.srcObject = stream;
            video.classList.remove("d-none");
            sendAbsensi.classList.remove("d-none");
            sendAbsensi.innerHTML = "📸 Ambil Foto";
            sendAbsensi.onclick = capturePhoto;
        } catch (error) {
            alert("Gagal mengakses kamera: " + error);
        }
    });

    function capturePhoto() {
        const ctx = canvas.getContext("2d");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();

        let dataURL = canvas.toDataURL("image/jpeg", 1.0);
        photoPreview.src = dataURL;
        photoPreview.style.width = `${video.clientWidth}px`;
        photoPreview.style.height = `${video.clientHeight}px`;
        photoPreview.classList.remove("d-none");
        video.classList.add("d-none");

        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        Swal.fire({
            title: "Mengambil Foto",
            html: "Tunggu sebentar",
            timer: 4000,
            timerProgressBar: true,
            didOpen: () => Swal.showLoading(),
            willClose: () => {
                sendAbsensi.innerHTML = "📤 Kirim Absensi";
                sendAbsensi.disabled = false;
                sendAbsensi.onclick = sendAbsensiTelegram;
            }
        });
    }

    function sendAbsensiTelegram() {
        Swal.fire({
            title: "Masukkan Nama Anda",
            input: "text",
            inputAttributes: { autocapitalize: "off" },
            showCancelButton: true,
            confirmButtonText: "Kirim",
            showLoaderOnConfirm: true,
            preConfirm: async (nama) => {
                const allowedNames = ["Nabila", "Anisa", "Lita", "adi", "Adi"];
                if (!nama) return Swal.showValidationMessage("Nama tidak boleh kosong!");
                if (!allowedNames.includes(nama)) return Swal,showValidationMessage("Nama Tidak Terdaftar Silahkan Hubungi Mas Pur!");
                return nama;
            },
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            if (result.isConfirmed) {
                const nama = result.value;
                const now = new Date();
                const jam = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const tanggal = document.getElementById("tanggal").textContent;

                Swal.fire({
                    title: "Mengirim Absensi...",
                    html: "Foto akan dikirim dalam <b></b> detik.",
                    timer: 4000,
                    timerProgressBar: true,
                    didOpen: () => {
                        Swal.showLoading();
                        const timer = Swal.getPopup().querySelector("b");
                        let timerInterval = setInterval(() => {
                            timer.textContent = `${Swal.getTimerLeft() / 1000}`;
                        }, 100);
                    },
                    willClose: () => clearInterval(timerInterval)
                }).then(() => {
                    const telegramBotToken = "7079092015:AAFOhQM0L0PGWmKcfW2DULtjo0KHzBEHbz8";
                    const chatId = "7355777672";

                    canvas.toBlob(function (blob) {
                        let formData = new FormData();
                        formData.append("chat_id", chatId);
                        formData.append("photo", blob, "absensi.jpg");
                        formData.append("caption", `Absensi: ${tanggal}\nJam: ${jam}\nNama: ${nama}`);

                        fetch(`https://api.telegram.org/bot${telegramBotToken}/sendPhoto`, {
                            method: "POST",
                            body: formData
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.ok) {
                                Swal.fire({
                                    title: "Absensi Berhasil Dikirim",
                                    icon: "success",
                                    draggable: true
                                });
                                saveToExcel(nama, tanggal, jam, photoPreview.src);
                            } else {
                                Swal.fire({
                                    icon: "error",
                                    title: "Error Silahkan Coba Lagi",
                                    text: "Gagal Mengirim Absensi Periksa Koneksi Anda!"
                                });
                            }
                        })
                        .catch(error => {
                            Swal.fire({
                                icon: "error",
                                title: "Error",
                                text: `Terjadi kesalahan: ${error}`
                            });
                        });
                    }, "image/jpeg");
                });
            }
        });
    }

    function saveToExcel(nama, tanggal, jam, fotoBase64) {
        const bulanSekarang = new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' });
        const fileName = `Absensi_${bulanSekarang}.xlsx`;

        absensiData.push([tanggal, jam, nama, fotoBase64]);

        let ws = XLSX.utils.aoa_to_sheet([
            ["Tanggal", "Jam", "Nama", "Foto (Base64)"],
            ...absensiData
        ]);

        let wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Absensi");

        XLSX.writeFile(wb, fileName);
    }

    function sendDataExcelTele() {
        const Token = "7079092015:AAFOhQM0L0PGWmKcfW2DULtjo0KHzBEHbz8";
        const chatId = "7355777672";
        const admin = "5560083488";

        const bulanLalu = new Date();
        bulanLalu.setMonth(bulanLalu.getMonth() -1 );
        const namaFile = `Absensi_${bulanLalu.toLocaleString('id-ID', {month: 'Long', year: 'numeric'})}.xlsx`;

        let formData = new FormData();
        formData.append("chat_id", chatId);
        formData.append("document", new File([new Blob([XLSX.write(absensiData, { type: 'array' })])], namaFile, { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
        formData.append("caption", `Laporan Absensi Bulan Lalu: ${namaFile}`);

        fetch(`https://api.telegram.org/bot${Token}/sendDocument`, {
            method: "POST",
            body: formData
        }).then(response => response.json)
        .then(data => {
            if (data.ok) {
                sendAdmin = `✅ Laporan Absensi Bulan ${bulanLalu.toLocaleString('id-ID', {month: 'long', year: 'numeric'})} Berhasil Di Kirim`;
            } else {
                sendAdmin = `❌ Laporan Tidak Berhasil Di Kirim ${data.description}`;
            };
        
            // kirim api
            fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "aplication/json" },
                body: JSON.stringify({
                    chat_id: admin,
                    text: sendAdmin
                })
            })
        }).catch(error => {
            fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "aplication/json" },
                body: JSON.stringify({
                    chat_id: admin,
                    text: `❌ Laporan Tidak Berhasil Di Kirim ${error.message}`
                })
            })
        })
        
        function cekDataTele() {
            const now = new Date();
            if (now.getDate() === 1) {
                sendDataExcelTele();
            }
        }
        setInterval(cekDataTele, 3600000)
    }
});
