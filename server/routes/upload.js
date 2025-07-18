const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow spreadsheet files and images
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/json'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV, Excel, and image files are allowed.'));
    }
  }
});

// Upload edited spreadsheet
router.post('/spreadsheet', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    // Read and process the file content
    let fileContent;
    if (fileExtension === '.csv') {
      fileContent = await fs.readFile(filePath, 'utf8');
    } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      const buffer = await fs.readFile(filePath);
      fileContent = buffer.toString('base64');
    } else {
      return res.status(400).json({ error: 'Unsupported file format' });
    }

    res.json({
      success: true,
      filename: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      content: fileContent,
      format: fileExtension === '.csv' ? 'csv' : 'xlsx',
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload file',
      message: error.message 
    });
  }
});

// Upload multiple files (for batch processing)
router.post('/batch', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      const fileExtension = path.extname(file.originalname).toLowerCase();
      
      let fileContent;
      if (fileExtension === '.csv') {
        fileContent = await fs.readFile(file.path, 'utf8');
      } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
        const buffer = await fs.readFile(file.path);
        fileContent = buffer.toString('base64');
      }

      uploadedFiles.push({
        filename: file.originalname,
        path: file.path,
        size: file.size,
        content: fileContent,
        format: fileExtension === '.csv' ? 'csv' : 'xlsx'
      });
    }

    res.json({
      success: true,
      files: uploadedFiles,
      count: uploadedFiles.length,
      message: `Successfully uploaded ${uploadedFiles.length} files`
    });

  } catch (error) {
    console.error('Batch upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload files',
      message: error.message 
    });
  }
});

// Upload image files (for visual context)
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    res.json({
      success: true,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: `/uploads/${req.file.filename}`,
      size: req.file.size,
      mimetype: req.file.mimetype,
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload image',
      message: error.message 
    });
  }
});

// Clean up old uploaded files
router.delete('/cleanup', async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '../uploads');
    const files = await fs.readdir(uploadsDir);
    
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - 24); // Delete files older than 24 hours
    
    let deletedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.mtime < cutoffDate) {
        await fs.unlink(filePath);
        deletedCount++;
      }
    }

    res.json({
      success: true,
      deletedCount,
      message: `Cleaned up ${deletedCount} old files`
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ 
      error: 'Failed to cleanup files',
      message: error.message 
    });
  }
});

// Get file info
router.get('/info/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', filename);
    
    const stats = await fs.stat(filePath);
    
    res.json({
      success: true,
      filename,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      path: `/uploads/${filename}`
    });

  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'File not found' });
    } else {
      console.error('File info error:', error);
      res.status(500).json({ 
        error: 'Failed to get file info',
        message: error.message 
      });
    }
  }
});

module.exports = router;