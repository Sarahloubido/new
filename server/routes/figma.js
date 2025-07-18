const express = require('express');
const router = express.Router();
const { Figma } = require('figma-api');
const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const FigmaService = require('../services/figmaService');

// Extract text from Figma file
router.post('/extract', async (req, res) => {
  try {
    const { fileId, accessToken } = req.body;

    if (!fileId || !accessToken) {
      return res.status(400).json({ 
        error: 'Missing required parameters: fileId and accessToken' 
      });
    }

    const figmaService = new FigmaService(accessToken);
    const extractedData = await figmaService.extractTextFromFile(fileId);

    res.json({
      success: true,
      data: extractedData,
      message: `Extracted ${extractedData.length} text elements`
    });

  } catch (error) {
    console.error('Figma extraction error:', error);
    res.status(500).json({ 
      error: 'Failed to extract text from Figma',
      message: error.message 
    });
  }
});

// Update Figma file with edited text
router.post('/update', async (req, res) => {
  try {
    const { fileId, accessToken, textUpdates } = req.body;

    if (!fileId || !accessToken || !textUpdates) {
      return res.status(400).json({ 
        error: 'Missing required parameters: fileId, accessToken, and textUpdates' 
      });
    }

    const figmaService = new FigmaService(accessToken);
    const result = await figmaService.updateTextInFile(fileId, textUpdates);

    res.json({
      success: true,
      data: result,
      message: `Updated ${textUpdates.length} text elements`
    });

  } catch (error) {
    console.error('Figma update error:', error);
    res.status(500).json({ 
      error: 'Failed to update Figma file',
      message: error.message 
    });
  }
});

// Get file info
router.get('/file/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const { accessToken } = req.query;

    if (!accessToken) {
      return res.status(400).json({ 
        error: 'Missing accessToken parameter' 
      });
    }

    const figmaService = new FigmaService(accessToken);
    const fileInfo = await figmaService.getFileInfo(fileId);

    res.json({
      success: true,
      data: fileInfo
    });

  } catch (error) {
    console.error('Figma file info error:', error);
    res.status(500).json({ 
      error: 'Failed to get file info',
      message: error.message 
    });
  }
});

// Generate screenshots for nodes
router.post('/screenshots', async (req, res) => {
  try {
    const { fileId, accessToken, nodeIds } = req.body;

    if (!fileId || !accessToken || !nodeIds) {
      return res.status(400).json({ 
        error: 'Missing required parameters: fileId, accessToken, and nodeIds' 
      });
    }

    const figmaService = new FigmaService(accessToken);
    const screenshots = await figmaService.generateScreenshots(fileId, nodeIds);

    res.json({
      success: true,
      data: screenshots,
      message: `Generated ${screenshots.length} screenshots`
    });

  } catch (error) {
    console.error('Screenshot generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate screenshots',
      message: error.message 
    });
  }
});

module.exports = router;