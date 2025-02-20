const express = require('express');
const app = express();

app.get("/", (req, res) => {
    res.send("Server Runing: http://0.0.0.0:5500");
});

app.listen(3000, '0.0.0.0', () => {
    console.log("Server Runing ON: http://0.0.0.0:3000");
});
