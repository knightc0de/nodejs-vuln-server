const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

app.use("/uploads", express.static(uploadDir));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }
    res.send('File uploaded successfully! <a href="/files">View Files</a>');
});

app.get("/files", (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            return res.status(500).send("Error reading upload folder");
        }

        let html = `
            <h1>Uploaded Files</h1>
            <a href="/">Upload New File</a><hr>
        `;

        files.forEach(file => {
            const ext = path.extname(file).toLowerCase();

            if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) {
                html += `
                    <div style="margin: 20px 0;">
                        <img src="/uploads/${file}" width="300"><br>
                        <a href="/uploads/${file}" target="_blank">${file}</a>
                    </div>`;
            } else {
                html += `
                    <p>
                        <a href="/uploads/${file}" target="_blank">${file}</a>
                    </p>`;
            }
        });

        res.send(html);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});