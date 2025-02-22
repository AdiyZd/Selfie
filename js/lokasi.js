document.getElementById("lokasi").addEventListener("click", function() {
    cekLokasiSaya();
});

function cekLokasiSaya() {
    if ("geolocation" in navigator) {
        // Kasih Loading Agar Gk Di Sepam!

        Swal.fire({
            title: "Mencari Lokasi!",
            text: "Mohon Tunggu Sebentar!",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        })

        navigator.geolocation.getCurrentPosition(
            function (position) {
                let letak1 = position.coords.latitude;
                let letak2 = position.coords.longitude;

                let BatasLokasiAccess = [
                    {lat: -6.970966, lng: 110.018771}, // titik lokasi 1. -6.970966,110.018771
                    {lat: -6.970846, lng: 110.018782}, // titik lokasi 2. -6.970846,110.018782
                    {lat: -6.970838, lng: 110.018688}, // titik lokasi 3. -6.970838,110.018688
                    {lat: -6.970983, lng: 110.018697}  // titik lokasi 4. -6.970983,110.018697
                ];

                let maxRadius = 5; // 10meter

                let dalamLokasiAccess = BatasLokasiAccess.some(lokasi => hitungJarak(letak1, letak2, lokasi.lat, lokasi.lng) <= maxRadius);

                if (dalamLokasiAccess) {
                    Swal.close(); // tutup setelah lokasi ditemukan

                    Swal.fire({
                        title: "Lokasi Anda!",
                        text: `Berada Di: ${letak1},${letak2}`,
                        showClass: {
                            popup: `
                            animate__animated
                            animate__fadeInUp
                            animate__faster
                            `
                        },
                        hidenClass: {
                            popup: `
                            animate__animated
                            animate__fadeOutDown
                            animate__faster
                            `
                        }
                    })

                } else {
                    Swal.fire({
                        imageUrl: "../pic/icon/LokasiGedung.svg",
                        title: "Di Luar Jangkauan!",
                        text: "Anda Di Luar Jangkauan Perusahaan Silahak Masuk Ke Dalam Jangkauan!",
                        imageWidth: 250,
                        imageHeight: 150,
                        imageAlt: "2D Lokasi"
                    });

                };


            }, 
            function (error) {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        Swal.fire({
                            imageUrl: "../pic/icon/Warning.svg",
                            title: "Izin Lokasi Di Tolak",
                            text: "Silahkan Izinkan DI Pengaturan!",
                            imageWidth: 250,
                            imageHeight: 150,
                            imageAlt: "Izin Lokasi"
                        });
                        break;
                    case error.POSITION_UNAVAILABLE:
                        Swal.fire({
                            imageUrl: "../pic/icon/MencariLokasi.svg",
                            title: "Lokasi Tidak Ditemukan",
                            text: "Refresh Websaite!",
                            imageWidth: 250,
                            imageHeight: 150,
                            imageAlt: "Tidak Ditemukan Lokasi"
                        });
                        break;
                    case error.TIMEOUT:
                        Swal.fire({
                            imageUrl: "../pic/icon/SearchLokasi.svg",
                            title: "Terlalu Lama Mencari Lokasi",
                            text: "Periksa Koneksi Internet",
                            imageWidth: 250,
                            imageHeight: 150,
                            imageAlt: "LoadLokasi Terlalu Lama!"
                        });
                        break;
                    default:
                        Swal.fire({
                            imageUrl: "../pic/icon/TidakDiketahui.svg",
                            title: "Hubungi Maspur!",
                            text: "Code Error Tidak Teduga!",
                            imageWidth: 250,
                            imageHeight: 150,
                            imageAlt: "Error Tidak Diketahui!"
                        })
                        break;
                };
            }
        )
    } else {
        Swal.fire({
            imageUrl: "../pic/icon/MasukBox.svg",
            title: "Tidak Ada Dukungan",
            text: "Get Lokasi Tidak Di Dukung Di Broser Ini!",
            imageWidth: 250,
            imageHeight: 150,
            imageAlt: "Broser!"
        })
    }
};


function hitungJarak(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // radius bumi dalam meter
    const q1 = lat1 * Math.PI / 180;
    const q2 = lat2 * Math.PI / 180;
    const pi = (lat2 - lat1) * Math.PI / 180;
    const pi2 = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(pi / 2) * Math.sin(pi / 2) +
             Math.cos(q1) * Math.cos(q2) *
             Math.sin(pi2 / 2) * Math.sin(pi2 / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // hasil hitungan dalam bentuk meter
}

