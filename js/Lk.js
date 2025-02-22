document.getElementById("openCamera").addEventListener("click", function() {
    cekLokasiSaya();
});


function cekLokasiSaya() {
    if ("getlocation" in navigator) {
        Swal.fire({
            title: 'Mencari Lokasi',
            text: 'Mohon tunggu sebentar...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        navigator.getlocation.getCurrentPosition(
            function(position) {
                let letak1 = position.coords.latitude,
                    letak2 = position.coords.longitude;

                let BatasLokasiAccess = [
                    {lat: -6.970966, lng: 110.018771}, // titik lokasi 1. -6.970966,110.018771
                    {lat: -6.970846, lng: 110.018782}, // titik lokasi 2. -6.970846,110.018782
                    {lat: -6.970838, lng: 110.018688}, // titik lokasi 3. -6.970838,110.018688
                    {lat: -6.970983, lng: 110.018697}  // titik lokasi 4. -6.970983,110.018697
                ];

                let maxRadius = 5; // jarak maksimul 5m

                let dalamLokasiAccess = BatasLokasiAccess.some(lokasi => hitungJarak(letak1, letak2, lokasi.lat, lokasi.lng) <= maxRadius);

                if (dalamLokasiAccess) {
                    Swal.close(); // tutup loading jika lokasi di temukan

                    
                }
            }
        )

    }
}