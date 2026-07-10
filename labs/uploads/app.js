const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// server 
app.use("/uploads",express.static(path.join(__dirname,"uploads")));

const storage = multer.diskStorage({
                destination :(req,file,cb) => {cb(null,"uploads/");},
                filename:(req,file,cb) => {
                  cb(null,Date.now() + path.extname(file.originalname));
                }  
});

const upload = multer({storage});

// home page 

app.get("/",(req,res)) => {
                           res.sendfile(
                            path.join(__dirname,"index.html"));
});



