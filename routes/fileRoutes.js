const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');
const { imageStorage, videoStorage, THUMBNAIL_SIZE } = require('../middlewares/upload');
const File = require('../models/File');
const mongoose = requre('mongoose');
const imageUpload = multer({ storage: imageStorage });
const videoUpload = multer({ storage: videoStorage });

router.post('/upload-image', imageUpload.single('image'), async (req, res) => {
    const thumbnailPath = path.join(thumbnailDirectory, Date.now() + '-' + req.file.filename);

    sharp(req.file.path)
        .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE)
        .toFile(thumbnailPath, (err) => {
            if (err) {
                console.error('Error creating thumbnail:', err);
                return res.status(500).json({ message: 'Internal server error creating thumbnail' });
            }

            const file = new File({
                filename: req.file.filename,
                path: req.file.path,
                thumbnailPath,
                type: 'image'
            });
            
            file.save().then(() => {
                res.json({ file: req.file, dbFile: file });
            }).catch((err) => {
                res.status(500).json({ message: err.message });
            });
        });
});

router.post('/upload-video', videoUpload.single('video'), async (req, res) => {
    const file = new File({
        filename: req.file.filename,
        path: req.file.path,
        type: 'video'
    });
    file.save().then(() => {
        res.json({ file: req.file, dbFile: file });
    }).catch((err) => {
        res.status(500).json({ message: err.message });
    });
});

router.get('/files/:fileId', async (req, res) => {
    const fileId = req.params.fileId;
    
    // Validate if fileId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
        return res.status(400).json({ message: 'Invalid file ID format.' });
    }
    
    try {
        const file = await File.findById(fileId);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }
        res.json(file);
    } catch (error) {
        console.error('Error fetching file by ID:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/files', async (req, res) => {
    try {
        const files = await File.find().sort({ createdAt: -1 });
        res.json(files);
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.delete('/files/delete', async (req, res) => {
    const filename = req.body.filename;

    try {
        const file = await File.findOne({ filename });
        if (!file) {
            console.warn('File record not found in database:', filename);
            return res.status(404).json({ message: 'File record not found in database' });
        }

        // Delete the physical file from storage if it exists
        if (fs.existsSync(file.path)) {
            fs.unlink(file.path, async (err) => {
                if (err) {
                    console.error('Error deleting the file from storage:', err);
                    return res.status(500).json({ message: 'Internal server error when deleting from storage' });
                }

                // Delete the file entry from the database
                const result = await File.deleteOne({ _id: file._id });
                if (result.deletedCount === 0) {
                    console.warn('File record not deleted:', filename);
                    return res.status(500).json({ message: 'Failed to delete file record from database' });
                }
                
                res.json({ message: 'File deleted successfully' });
            });
        } else {
            console.warn('Physical file does not exist, but deleting the record:', file.path);
            
            // Delete the file entry from the database even if physical file doesn't exist
            const result = await File.deleteOne({ _id: file._id });
            if (result.deletedCount === 0) {
                console.warn('File record not deleted:', filename);
                return res.status(500).json({ message: 'Failed to delete file record from database' });
            }
            
            res.json({ message: 'File reference deleted successfully' });
        }
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;