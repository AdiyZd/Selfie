document.getElementById("lokasi").addEventListener("click", function() {
    cekLokasiSaya();
});

function cekLokasiSaya() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                let letak1 = position.coords.latitude;
                let letak2 = position.coords.longitude;

                let BatasLokasiAccess = [
                    {lat: -6.949412, lng: 109.963582}, // titik lokasi 1 -6.949412,109.963582
                    {lat: -6.949704, lng: 109.963524}, // titik lokasi 2 -6.949704,109.963524
                    {lat: -6.949683, lng: 109.963311}, // titik lokasi 3 -6.949683,109.963311
                    {lat: -6.949377, lng: 109.963358} // titik lokasi 4 -6.949377,109.963358
                ];

                let maxRadius = 500; // 500meter

                let dalamLokasiAccess = BatasLokasiAccess.some(lokasi => hitungJarak(letak1, letak2, lokasi.lat, lokasi.lng) <= maxRadius);

                if (dalamLokasiAccess) {
                    document.getElementById("Hasil").innerText = `Lokasi1: ${letak1}\n Lokasi2: ${letak2}`;
                } else {
                    alert("Anda Berada Di Luar Area Yang Di Izinkan!!")
                }

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


function hitungJarak(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // radius bumi dalam meter
    const q1 = lat1 * Math.PI / 180;
    const q2 = lat2 * Math.PI / 180;
    const pi = (lat2 - lat1) * Math.PI / 180;
    const pi2 = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(pi / 2) * Math.sin(pi / 2) + Math.cos(q1) * Math.cos(q2) * Math.sin(pi2 / 2) * Math.sin(pi2 / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}