require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const { Readable } = require('stream');


const storage = multer.diskStorage({
    destination: 'uploads',
    filename: (req, file, cb) => {
      const extension = file.originalname.split('.').pop();
      cb(null, `${file.fieldname}.-${Date.now()}.${extension}`);
    }
});

const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());

app.post('/upload', upload.array('files'), async (req, res) => {
    try {
        const credentials = JSON.parse(process.env.KEY);
        const auth = new google.auth.GoogleAuth({
            credentials: credentials,
            scopes: ['https://www.googleapis.com/auth/drive']
        });

        const drive = google.drive({ version: 'v3', auth });

        const uploadedFiles = [];

        for(let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            const bufferStream = new Readable();
            bufferStream.push(file.buffer);
            bufferStream.push(null);
            const response = await drive.files.create({
                requestBody: {
                    name: file.originalname,
                    mimeType: file.mimetype,
                    parents: ['1sNvvMcNTsS-XlAzWmmmR_LsRN42Vw6oY']
                },
                media: {
                    mimeType: file.mimetype,
                    body: bufferStream
                }
            });

            uploadedFiles.push(response.data);
        }

        res.send({files:uploadedFiles}); // automatically sends a 200 status code

    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

app.listen(3000, () => {
    console.log('App listening on port 3000');
});