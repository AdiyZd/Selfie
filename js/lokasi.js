document.getElementById("lokasi").addEventListener("click", function() {
    cekLokasiSaya();
});

function cekLokasiSaya() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                let letak1 = position.coords.latitude;
                let letak2 = position.coords.longitude;

                document.getElementById("Hasil").innerText = `Lokasi1: ${letak1}\n Lokasi2: ${letak2}`;
            }, 
            function (error) {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        alert("Izin Lokasi Di Tolak!!");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        alert("Informasi Lokasi Tidak Di Temuakn");
                        break;
                    case error.TIMEOUT:
                        alert("Permintaan Lokasi Terlalu Lama");
                        break;
                    default:
                        alert("Terjadi Kesalahan Yang Tidak Terduga!!!");
                        break;
                };
            }
        )
    } else {
        alert("Get Lokasion Tidak Di Dukung Di Broser Ini!")
    }
};