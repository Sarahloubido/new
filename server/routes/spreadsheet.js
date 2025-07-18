const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const Papa = require('papaparse');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Generate spreadsheet from extracted text data
router.post('/generate', async (req, res) => {
  try {
    const { data, format = 'csv', filename } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ 
        error: 'Invalid data format. Expected array of text elements.' 
      });
    }

    const spreadsheetData = data.map(item => ({
      id: item.id,
      original_text: item.original_text,
      edited_text: item.edited_text || '',
      frame_name: item.frame_name,
      component_path: item.component_path,
      context_notes: item.context_notes,
      image: item.image || ''
    }));

    const exportDir = path.join(__dirname, '../exports');
    await fs.mkdir(exportDir, { recursive: true });

    const timestamp = new Date().toISOString().split('T')[0];
    const baseFilename = filename || `text_review_${timestamp}`;
    
    let filePath;
    let downloadUrl;

    if (format === 'xlsx') {
      filePath = path.join(exportDir, `${baseFilename}.xlsx`);
      downloadUrl = `/exports/${baseFilename}.xlsx`;
      await generateExcelFile(spreadsheetData, filePath);
    } else {
      filePath = path.join(exportDir, `${baseFilename}.csv`);
      downloadUrl = `/exports/${baseFilename}.csv`;
      await generateCsvFile(spreadsheetData, filePath);
    }

    res.json({
      success: true,
      downloadUrl,
      filename: path.basename(filePath),
      rowCount: spreadsheetData.length,
      message: `Generated ${format.toUpperCase()} file with ${spreadsheetData.length} text elements`
    });

  } catch (error) {
    console.error('Spreadsheet generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate spreadsheet',
      message: error.message 
    });
  }
});

// Process uploaded spreadsheet with edits
router.post('/process', async (req, res) => {
  try {
    const { fileContent, format = 'csv' } = req.body;

    if (!fileContent) {
      return res.status(400).json({ 
        error: 'No file content provided' 
      });
    }

    let parsedData;

    if (format === 'xlsx') {
      parsedData = parseExcelContent(fileContent);
    } else {
      parsedData = parseCsvContent(fileContent);
    }

    // Filter out rows with edited text
    const textUpdates = parsedData
      .filter(row => row.edited_text && row.edited_text.trim() !== '')
      .map(row => ({
        id: row.id,
        original_text: row.original_text,
        edited_text: row.edited_text,
        frame_name: row.frame_name,
        component_path: row.component_path
      }));

    res.json({
      success: true,
      data: textUpdates,
      totalRows: parsedData.length,
      updatedRows: textUpdates.length,
      message: `Processed ${textUpdates.length} text updates from ${parsedData.length} total rows`
    });

  } catch (error) {
    console.error('Spreadsheet processing error:', error);
    res.status(500).json({ 
      error: 'Failed to process spreadsheet',
      message: error.message 
    });
  }
});

// Download template spreadsheet
router.get('/template/:format', async (req, res) => {
  try {
    const { format } = req.params;

    const templateData = [{
      id: 'example-id-1',
      original_text: 'Welcome to our app',
      edited_text: '',
      frame_name: 'Landing Page',
      component_path: 'MainFrame/Header/Title',
      context_notes: 'Font: Inter, Size: 24px, Position: (100, 50)',
      image: '/uploads/example-screenshot.png'
    }, {
      id: 'example-id-2',
      original_text: 'Click here to get started',
      edited_text: '',
      frame_name: 'Landing Page',
      component_path: 'MainFrame/CTAButton/ButtonText',
      context_notes: 'Font: Inter, Size: 16px, Position: (200, 150)',
      image: '/uploads/example-screenshot-2.png'
    }];

    const exportDir = path.join(__dirname, '../exports');
    await fs.mkdir(exportDir, { recursive: true });

    const filename = `text_review_template.${format}`;
    const filePath = path.join(exportDir, filename);

    if (format === 'xlsx') {
      await generateExcelFile(templateData, filePath);
    } else if (format === 'csv') {
      await generateCsvFile(templateData, filePath);
    } else {
      return res.status(400).json({ error: 'Invalid format. Use csv or xlsx.' });
    }

    res.download(filePath, filename);

  } catch (error) {
    console.error('Template generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate template',
      message: error.message 
    });
  }
});

// Helper functions
async function generateCsvFile(data, filePath) {
  const csv = Papa.unparse(data, {
    header: true,
    quotes: true
  });
  await fs.writeFile(filePath, csv, 'utf8');
}

async function generateExcelFile(data, filePath) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Set column widths for better readability
  const columnWidths = [
    { wch: 15 }, // id
    { wch: 30 }, // original_text
    { wch: 30 }, // edited_text
    { wch: 20 }, // frame_name
    { wch: 25 }, // component_path
    { wch: 40 }, // context_notes
    { wch: 25 }  // image
  ];
  worksheet['!cols'] = columnWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Text Review');
  
  XLSX.writeFile(workbook, filePath);
}

function parseCsvContent(content) {
  const result = Papa.parse(content, {
    header: true,
    skipEmptyLines: true,
    transform: (value, field) => {
      // Clean up the data
      return typeof value === 'string' ? value.trim() : value;
    }
  });

  if (result.errors.length > 0) {
    throw new Error(`CSV parsing errors: ${result.errors.map(e => e.message).join(', ')}`);
  }

  return result.data;
}

function parseExcelContent(content) {
  try {
    // Assuming content is base64 encoded
    const buffer = Buffer.from(content, 'base64');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    return XLSX.utils.sheet_to_json(worksheet);
  } catch (error) {
    throw new Error(`Excel parsing error: ${error.message}`);
  }
}

module.exports = router;