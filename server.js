const express = require('express');
const request = require('request');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const cloudinary = require('cloudinary').v2;
require('dotenv').config()

const app = express();

app.use(cors());

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
});


app.use('/image/', async function (req, res) {
    var url = req.url.slice(1);

    // Fetch the image and upload it directly to Cloudinary
    const response = await axios.get(url, { responseType: 'stream' });
    const stream = response.data.pipe(cloudinary.uploader.upload_stream({
        public_id: path.basename(url, path.extname(url))
    }, (error, result) => {
        if (error) {
            console.error('Upload to Cloudinary failed:', error);
            res.status(500).send('Upload to Cloudinary failed');
        } else {
            // Redirect to the URL of the uploaded image
            res.redirect(result.url);
        }
    }));
});

app.use('/', function (req, res) {
    var url = req.url.slice(1);
    // For non-image requests, continue to proxy as before
    req.pipe(request({ uri: url, headers: { 'User-Agent': 'thuvienwibu' } })).pipe(res);
});

console.log(`server run on port ${process.env.PORT || 3000}`)

app.listen(process.env.PORT || 3000);
