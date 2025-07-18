const { Figma } = require('figma-api');
const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class FigmaService {
  constructor(accessToken) {
    this.api = new Figma(accessToken);
    this.accessToken = accessToken;
  }

  async extractTextFromFile(fileId) {
    try {
      // Get file data
      const file = await this.api.getFile(fileId);
      const textElements = [];

      // Recursively traverse the file tree to find text nodes
      const traverseNodes = (nodes, frameName = '', componentPath = '') => {
        for (const node of nodes) {
          const currentPath = componentPath ? `${componentPath}/${node.name}` : node.name;

          if (node.type === 'TEXT' && node.characters) {
            const textElement = {
              id: node.id,
              original_text: node.characters,
              edited_text: '',
              frame_name: frameName || 'Unknown Frame',
              component_path: currentPath,
              context_notes: this.generateContextNotes(node),
              node_type: node.type,
              style_info: this.extractStyleInfo(node),
              coordinates: {
                x: node.absoluteBoundingBox?.x || 0,
                y: node.absoluteBoundingBox?.y || 0,
                width: node.absoluteBoundingBox?.width || 0,
                height: node.absoluteBoundingBox?.height || 0
              }
            };
            textElements.push(textElement);
          }

          // Set frame name for top-level frames
          const nextFrameName = (node.type === 'FRAME' || node.type === 'CANVAS') ? 
            node.name : frameName;

          // Recursively process children
          if (node.children && node.children.length > 0) {
            traverseNodes(node.children, nextFrameName, currentPath);
          }
        }
      };

      // Start traversal from document children
      if (file.document && file.document.children) {
        traverseNodes(file.document.children);
      }

      // Generate screenshots for text elements
      const nodeIds = textElements.map(element => element.id);
      if (nodeIds.length > 0) {
        const screenshots = await this.generateScreenshots(fileId, nodeIds);
        
        // Add screenshot URLs to text elements
        textElements.forEach(element => {
          const screenshot = screenshots.find(s => s.nodeId === element.id);
          element.image = screenshot ? screenshot.url : '';
        });
      }

      return textElements;
    } catch (error) {
      console.error('Error extracting text from Figma file:', error);
      throw new Error(`Failed to extract text: ${error.message}`);
    }
  }

  async generateScreenshots(fileId, nodeIds) {
    try {
      // Batch node IDs to avoid API limits (max 100 per request)
      const batches = [];
      for (let i = 0; i < nodeIds.length; i += 50) {
        batches.push(nodeIds.slice(i, i + 50));
      }

      const allScreenshots = [];

      for (const batch of batches) {
        try {
          const response = await this.api.getImage(fileId, {
            ids: batch.join(','),
            format: 'png',
            scale: 2
          });

          if (response.images) {
            for (const [nodeId, imageUrl] of Object.entries(response.images)) {
              if (imageUrl) {
                // Download and save the image locally
                const savedImagePath = await this.downloadAndSaveImage(imageUrl, nodeId);
                allScreenshots.push({
                  nodeId,
                  url: imageUrl,
                  localPath: savedImagePath
                });
              }
            }
          }
        } catch (batchError) {
          console.warn(`Failed to generate screenshots for batch:`, batchError.message);
        }
      }

      return allScreenshots;
    } catch (error) {
      console.error('Error generating screenshots:', error);
      throw new Error(`Failed to generate screenshots: ${error.message}`);
    }
  }

  async downloadAndSaveImage(imageUrl, nodeId) {
    try {
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(response.data);
      
      // Ensure uploads directory exists
      const uploadsDir = path.join(__dirname, '../uploads');
      await fs.mkdir(uploadsDir, { recursive: true });
      
      // Save image with unique filename
      const filename = `screenshot_${nodeId}_${Date.now()}.png`;
      const filepath = path.join(uploadsDir, filename);
      
      await fs.writeFile(filepath, imageBuffer);
      
      return `/uploads/${filename}`;
    } catch (error) {
      console.warn(`Failed to download image for node ${nodeId}:`, error.message);
      return '';
    }
  }

  async updateTextInFile(fileId, textUpdates) {
    try {
      const updates = [];
      
      for (const update of textUpdates) {
        if (update.edited_text && update.edited_text.trim() !== '') {
          updates.push({
            nodeId: update.id,
            characters: update.edited_text
          });
        }
      }

      if (updates.length === 0) {
        throw new Error('No text updates provided');
      }

      // Note: Figma API doesn't directly support text updates via REST API
      // This would typically require using Figma's plugin API or webhooks
      // For now, we'll return the updates that would be applied
      
      console.log('Text updates to apply:', updates);
      
      return {
        updates,
        message: 'Text updates prepared. Note: Direct text updates require Figma plugin or manual application.',
        instructions: 'Use these updates in a Figma plugin or apply them manually in the Figma interface.'
      };
    } catch (error) {
      console.error('Error updating text in Figma file:', error);
      throw new Error(`Failed to update text: ${error.message}`);
    }
  }

  async getFileInfo(fileId) {
    try {
      const file = await this.api.getFile(fileId);
      
      return {
        name: file.name,
        lastModified: file.lastModified,
        thumbnailUrl: file.thumbnailUrl,
        version: file.version,
        role: file.role,
        document: {
          id: file.document.id,
          name: file.document.name,
          type: file.document.type,
          children: file.document.children?.length || 0
        }
      };
    } catch (error) {
      console.error('Error getting file info:', error);
      throw new Error(`Failed to get file info: ${error.message}`);
    }
  }

  generateContextNotes(node) {
    const notes = [];
    
    if (node.style) {
      notes.push(`Font: ${node.style.fontFamily || 'Unknown'}`);
      notes.push(`Size: ${node.style.fontSize || 'Unknown'}px`);
    }
    
    if (node.absoluteBoundingBox) {
      notes.push(`Position: (${Math.round(node.absoluteBoundingBox.x)}, ${Math.round(node.absoluteBoundingBox.y)})`);
    }
    
    if (node.visible === false) {
      notes.push('Hidden element');
    }
    
    return notes.join(', ');
  }

  extractStyleInfo(node) {
    return {
      fontFamily: node.style?.fontFamily,
      fontSize: node.style?.fontSize,
      fontWeight: node.style?.fontWeight,
      textAlign: node.style?.textAlignHorizontal,
      textCase: node.style?.textCase,
      letterSpacing: node.style?.letterSpacing,
      lineHeight: node.style?.lineHeightPx,
      fills: node.fills,
      visible: node.visible
    };
  }
}

module.exports = FigmaService;