document.addEventListener("DOMContentLoaded", function () {
    const modeToggle = document.getElementById("modeToggle");
    const body = document.body;

    // Cek localStorage
    if (localStorage.getItem("theme") === "dark") {
        body.classList.remove("light-mode");
        body.classList.add("dark-mode");
        modeToggle.innerHTML = "🌞"; // Icon untuk Light Mode
    }

    // Klik tombol untuk mengubah mode
    modeToggle.addEventListener("click", function () {
        if (body.classList.contains("light-mode")) {
            body.classList.remove("light-mode");
            body.classList.add("dark-mode");
            modeToggle.innerHTML = "🌞"; // Ganti icon
            localStorage.setItem("theme", "dark"); // Simpan mode
        } else {
            body.classList.remove("dark-mode");
            body.classList.add("light-mode");
            modeToggle.innerHTML = "🌙"; // Ganti icon
            localStorage.setItem("theme", "light"); // Simpan mode
        }
    });
});


// send telegram