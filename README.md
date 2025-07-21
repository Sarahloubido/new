# 🚀 Prototype Text Review Tool

A comprehensive tool for extracting text from design prototypes (Figma), editing content in spreadsheets, and applying updates back to the original designs.

![Prototype Text Review Tool](https://img.shields.io/badge/status-ready-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue) ![Node.js](https://img.shields.io/badge/node.js-%3E%3D14.0.0-brightgreen)

## ✨ Features

- **🎨 Figma Integration**: Extract text from Figma files using the official API
- **📊 Spreadsheet Export**: Generate CSV/Excel files with all text content
- **✏️ Visual Context**: Include screenshots and position data for better editing context
- **🔄 Batch Updates**: Upload edited spreadsheets and apply changes in bulk
- **🎯 Smart Filtering**: Only process text elements that have been modified
- **💻 Modern UI**: Clean, responsive interface built with React and Tailwind CSS

## 🏗️ Architecture

```
prototype-text-review-tool/
├── server/                 # Node.js + Express backend
│   ├── routes/            # API route handlers
│   ├── services/          # Business logic (Figma API, etc.)
│   ├── uploads/           # Temporary file storage
│   └── exports/           # Generated spreadsheets
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   └── types.ts       # TypeScript definitions
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 14.0.0 or higher
- npm or yarn
- Figma Access Token (for live data extraction)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd prototype-text-review-tool
   ```

2. **Install dependencies**
   ```bash
   npm run setup
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on `http://localhost:5000`
   - Frontend development server on `http://localhost:3000`

### 🌐 Deploy to Vercel

Ready to deploy? This app is configured for easy Vercel deployment:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will auto-detect the settings
   - Click "Deploy"

3. **Configuration**
   - Build Command: `npm run vercel-build`
   - Output Directory: `client/build`
   - Install Command: `npm install`
   - Root Directory: `./` (default)
   - No additional setup needed!

📖 See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## 📋 Usage Guide

### Step 1: Extract Text from Figma

1. **Get your Figma Access Token**
   - Go to [Figma Account Settings](https://www.figma.com/developers/api#access-tokens)
   - Generate a new personal access token
   - Copy the token

2. **Connect to your Figma file**
   - Paste your Figma file URL or file ID
   - Enter your access token
   - Click "Extract Text"

3. **Demo Mode** (for testing without Figma API)
   - Click "Load Demo Data" to try the tool with sample data

### Step 2: Review Extracted Text

- View all extracted text elements in a structured table
- See visual context including screenshots and positioning
- Review frame names and component paths for better organization

### Step 3: Generate Spreadsheet

1. **Export for editing**
   - Choose CSV or Excel format
   - Download the generated file
   - Contains columns: `id`, `original_text`, `edited_text`, `frame_name`, `component_path`, `context_notes`, `image`

2. **Edit the spreadsheet**
   - Open in your preferred editor (Excel, Google Sheets, etc.)
   - Fill in the `edited_text` column with your changes
   - Leave other columns unchanged

### Step 4: Upload and Apply Changes

1. **Upload edited file**
   - Drag and drop or click to upload your edited CSV/Excel file
   - The tool will automatically detect and preview changes

2. **Apply updates**
   - Review the detected changes
   - Click "Apply Updates" to process the changes
   - Get update instructions for manual application in Figma

## 🔧 API Endpoints

### Figma Routes (`/api/figma`)

- `POST /extract` - Extract text from Figma file
- `POST /update` - Prepare text updates (returns instructions)
- `GET /file/:fileId` - Get Figma file information
- `POST /screenshots` - Generate screenshots for text elements

### Spreadsheet Routes (`/api/spreadsheet`)

- `POST /generate` - Generate CSV/Excel from extracted data
- `POST /process` - Process uploaded spreadsheet
- `GET /template/:format` - Download template files

### Upload Routes (`/api/upload`)

- `POST /spreadsheet` - Upload edited spreadsheet
- `POST /batch` - Batch file upload
- `POST /image` - Upload images
- `DELETE /cleanup` - Clean old files

## 📊 Data Structure

### TextElement Interface

```typescript
interface TextElement {
  id: string;                    // Unique node identifier
  original_text: string;         // Original text content
  edited_text: string;           // Modified text (empty initially)
  frame_name: string;            // Figma frame/page name
  component_path: string;        // Hierarchical component path
  context_notes: string;         // Font, size, position info
  image?: string;                // Screenshot URL
  coordinates?: Coordinates;      // Position and dimensions
  style_info?: StyleInfo;        // Font and styling details
}
```

## 🎨 Customization

### Environment Variables

```bash
# Server Configuration
NODE_ENV=development
PORT=5000

# Figma API
FIGMA_API_URL=https://api.figma.com/v1

# Client Configuration  
REACT_APP_API_URL=http://localhost:5000

# File Upload Settings
MAX_FILE_SIZE=50MB
UPLOAD_DIR=server/uploads
EXPORT_DIR=server/exports
```

### Styling

The frontend uses Tailwind CSS for styling. Customize the theme in `client/tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#3b82f6',  // Main brand color
          600: '#2563eb',  // Hover states
          700: '#1d4ed8',  // Active states
        }
      }
    }
  }
}
```

## 🔐 Security Considerations

- Access tokens are never stored server-side
- File uploads are validated and limited in size
- Temporary files are automatically cleaned up
- CORS is configured for the frontend domain

## 🚧 Known Limitations

1. **Figma Write Access**: Direct text updates require Figma plugin development
2. **Large Files**: Very large Figma files may hit API rate limits
3. **Complex Text**: Rich text formatting is simplified during extraction
4. **Screenshots**: May fail for very large or complex components

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/prototype-text-review-tool/issues)
- **Documentation**: [Wiki](https://github.com/your-repo/prototype-text-review-tool/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/prototype-text-review-tool/discussions)

## 🙏 Acknowledgments

- [Figma API](https://www.figma.com/developers/api) for design file access
- [PapaParse](https://www.papaparse.com/) for CSV handling
- [SheetJS](https://sheetjs.com/) for Excel file processing
- [Tailwind CSS](https://tailwindcss.com/) for styling

---

**Built with ❤️ for designers and content teams everywhere.**