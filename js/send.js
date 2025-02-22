document.addEventListener("DOMContentLoaded", function () {
    updateTanggal()
    const openCamera = document.getElementById("openCamera");
    const video = document.getElementById("cameraFeed");
    const canvas = document.getElementById("photoCanvas");
    const photoPreview = document.getElementById("photoPreview");
    const sendAbsensi = document.getElementById("sendAbsensi");

    let stream;
    let absensiData = []; // Menyimpan data absen dalam array

    function updateTanggal() {
        // let tanggalEl = document.getElementById("#");
        let now = new Date();
        let hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        let namaHari = hari[now.getDay()];
        let tanggal = now.getDate();
        let bulan = now.toLocaleString('id-ID', { month: 'long' });
        let tahun = now.getFullYear();
    }



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

        console.log("Mencoba Mengacces Kamera");
        navigator.mediaDevices.getUserMedia({video: true})
        //.then(stream => console.log("Kamera Berhasil Di Buka", stream))
        .then((value) => console.log("Gagal Mengacces Kamera", value));        
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

    async function sendAbsensiTelegram() {
        Swal.fire({
            title: "Masukkan Nama Anda",
            input: "text",
            inputAttributes: { autocapitalize: "off" },
            showCancelButton: true,
            confirmButtonText: "Kirim",
            showLoaderOnConfirm: true,
            preConfirm: async (nama) => {
                const allowedNames = ["Nabila", "nabila", "anisa", "Anisa", "Lita", "adi", "Adi"];
                if (!nama) return Swal.showValidationMessage("Nama tidak boleh kosong!");
                if (!allowedNames.includes(nama)) return Swal.showValidationMessage("Nama Tidak Terdaftar Silahkan Hubungi Mas Pur!");
                return nama;
            },
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            if (result.isConfirmed) {
                const nama = result.value.trim().substring(0, 50); 
                const now = new Date();
                const jam = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const tanggal = document.getElementById("tanggal")?.textContent?.trim()?.substring(0, 50) || "Tanggal Tidak Ditemukan";
    
                let timerInterval; 
    
                Swal.fire({
                    title: "Mengirim Absensi...",
                    html: "Foto akan dikirim dalam <b></b> detik.",
                    timer: 8000,
                    timerProgressBar: true,
                    didOpen: () => {
                        Swal.showLoading();
                        const timer = Swal.getPopup().querySelector("b");
                        timerInterval = setInterval(() => {
                            timer.textContent = `${Swal.getTimerLeft() / 1000}`;
                        }, 100);
                    },
                    willClose: () => {
                        clearInterval(timerInterval);
                    }
                }).then(async () => {
                    const telegramBotToken = "7079092015:AAFOhQM0L0PGWmKcfW2DULtjo0KHzBEHbz8";
                    const chatId = "7355777672";
    
                    function canvasToBlobAsync(canvas) {
                        return new Promise((resolve) => {
                            canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.8);
                        });
                    }
    
                    try {
                        console.log("Mencari elemen canvas...");
                        const canvas = document.getElementById("photoCanvas"); // Pastikan ID benar
                        if (!canvas) {
                            console.error("Canvas Tidak Di Temukan");
                            throw new Error("Canvas Tidak di temukan")
                        } 
                        console.log("canvas ditemukan: ", canvas)
                        
                        const blob = await canvasToBlobAsync(canvas);
    
                        let formData = new FormData();
                        formData.append("chat_id", chatId);
                        formData.append("photo", blob, "Absensi.jpg");
    
                        let caption = `ABSENSI SANDIKOMPUTER\n Nama: ${nama}\nTanggal: ${tanggal}\nJam: ${jam}`;
                        if (caption.length > 1024) {
                            console.warn("Caption terlalu panjang, memotong teks...");
                            caption = caption.substring(0, 1024); 
                        }
    
                        console.log(`Caption Length: ${caption.length}`);
                        console.log(`Caption Content: ${caption}`);
                        formData.append("caption", caption);
    
                        const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendPhoto`, {
                            method: "POST",
                            body: formData
                        });
    
                        const data = await response.json();

                        console.log("Response Telegram: ", data)

                        if (!response.ok) {
                            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
                        }

                        if(!data.ok) {
                            throw new Error(`Telegram API Error: ${data.description}`);
                        }

                        if (data.ok) {
                            Swal.fire({
                                title: "Absensi Berhasil Dikirim!",
                                icon: "success",
                                draggable: true
                            });
    
                            if (typeof saveToExcel === "function") {
                                const photoPreview = document.getElementById("photoPreview");
                                saveToExcel(nama, tanggal, jam, photoPreview?.src || "Foto tidak ditemukan");
                            } else {
                                console.warn("Fungsi saveToExcel() tidak ditemukan!");
                            }
                        } else {
                            console.warn(`Peringatan: Telegram API mengembalikan error -> ${data.description}`)
                            Swal.fire({
                                icon: "warning",
                                title: "Absensi Berahsil Terkirim, Tapi Ada Kesalahan!",
                                text: `Peringatan dari Telegram API: ${data.description}`
                            });
                        }
                    } catch (error) {
                        // tampilkan di konsole error
                        console.error(" Terjadi Error: ",error);
                        // kondisi agar bias debugin dengan mudah
                        if (error.message.includes("Failed to fetch") || error.message.includes("HTTP Error")){
                            Swal.fire({
                                icon: "error",
                                title: "Koneksi Gagal",
                                text: "Tidak dapat terhubung ke server Telegram. Periksa koneksi internet Anda."
                            });
                        } else {
                            Swal.fire({
                                icon: "error",
                                title: "Error",
                                text: `Terjadi Kesalahan: ${error.message}`
                            });
                        }
                    }
                });
            }
        });
    }
    

    function saveToExcel(nama, tanggal, jam, fotoBase64) {

        if (fotoBase64.length > 32767) {
            console.warn("Memotong Text Agar Menghindari Error Di Data Excel...")
            fotoBase64 = fotoBase64.substring(0, 32767)
        }

        const bulanSekarang = new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' });
        const fileName = `Absensi ${bulanSekarang}.xlsx`;

        absensiData.push([tanggal, jam, nama, fotoBase64]);

        let ws = XLSX.utils.aoa_to_sheet([
            ["Tanggal", "Jam", "Nama", "Foto (Base64)"],
            ...absensiData
        ]);

        let wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Absensi");
        XLSX.writeFile(wb, fileName);
    }

    async function sendDataExcelTele() {
        try {
            const now = Date();
            if (now.getDate() !== 1) return;

            const fileName = `Absensi_${now.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}.xlsx`;
            let wb = XLSX.utils.book_new();
            let ws = XLSX.utils.aoa_to_sheet(absensiData);
            XLSX.utils.book_append_sheet(wb, ws, "absensi");

            let fileBlob = new Blob([XLSX.write(wb, { type: 'array' })], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"})
            let file = new File([fileBlob], fileName);

            let formData = new FormData();
            formData.append("chat_id", "7355777672");
            formData.append("document", file);
            formData.append("Caption", `Laporan Absensi: ${fileName}`);

            const API = "7079092015:AAFOhQM0L0PGWmKcfW2DULtjo0KHzBEHbz8"
            const response = await fetch(`https://api.telegram.org/${API}/sendDocument`, {
                method: "POST",
                body: formData
            });

            const data = await response.json();
            if (!data.ok) throw new Error(data.description);
            
            console.log("Laporan Absensi Berhasil Di Kirim");
        } catch(error) {
            console.warn("Laporan Tidak Terkirim!! Error: ", error)       
        }
    }
    setInterval(sendDataExcelTele, 3600000)
});
