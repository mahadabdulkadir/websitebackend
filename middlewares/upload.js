const multer = require('multer');
const path = require('path');
const fs = require('fs');

const imageDirectory = 'uploads/images/';
const videoDirectory = 'video_uploads/';
const thumbnailDirectory = 'uploads/images/thumbnails/';
const THUMBNAIL_SIZE = 80;

if (!fs.existsSync(thumbnailDirectory)){
    fs.mkdirSync(thumbnailDirectory, { recursive: true });
}

const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imageDirectory);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const videoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, videoDirectory);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

module.exports = {
    imageStorage,
    videoStorage,
    THUMBNAIL_SIZE
};