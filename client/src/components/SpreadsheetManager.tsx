import React, { useState, useRef } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import { TextElement, SpreadsheetExport, UploadedFile, TextUpdate } from '../types';

interface SpreadsheetManagerProps {
  data: TextElement[];
  onUpdateText: (updates: TextElement[]) => void;
  loading: boolean;
}

const SpreadsheetManager: React.FC<SpreadsheetManagerProps> = ({
  data,
  onUpdateText,
  loading
}) => {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [uploadedData, setUploadedData] = useState<TextUpdate[]>([]);
  const [processingFile, setProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || (
    process.env.NODE_ENV === 'production' 
      ? '' // Use relative URLs in production (same domain)
      : 'http://localhost:5000'
  );

  const generateSpreadsheet = async (format: 'csv' | 'xlsx') => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/spreadsheet/generate`, {
        data,
        format,
        filename: `text_review_${new Date().toISOString().split('T')[0]}`
      });

      if (response.data.success) {
        const fullUrl = `${API_BASE_URL}${response.data.downloadUrl}`;
        setDownloadUrl(fullUrl);
        
        // Trigger download
        const link = document.createElement('a');
        link.href = fullUrl;
        link.download = response.data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Failed to generate spreadsheet:', error);
      alert('Failed to generate spreadsheet. Please try again.');
    }
  };

  const downloadTemplate = async (format: 'csv' | 'xlsx') => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/spreadsheet/template/${format}`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `text_review_template.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download template:', error);
      alert('Failed to download template. Please try again.');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProcessingFile(true);

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (fileExtension === 'csv') {
        // Handle CSV files
        const text = await file.text();
        const result = Papa.parse(text, {
          header: true,
          skipEmptyLines: true
        });

        if (result.errors.length > 0) {
          throw new Error(`CSV parsing errors: ${result.errors.map(e => e.message).join(', ')}`);
        }

        const updates = result.data
          .filter((row: any) => row.edited_text && row.edited_text.trim() !== '')
          .map((row: any) => ({
            id: row.id,
            original_text: row.original_text,
            edited_text: row.edited_text,
            frame_name: row.frame_name,
            component_path: row.component_path
          }));

        setUploadedData(updates);
      } else if (fileExtension === 'xlsx') {
        // Handle Excel files by uploading to server
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(`${API_BASE_URL}/api/upload/spreadsheet`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.data.success) {
          const processResponse = await axios.post(`${API_BASE_URL}/api/spreadsheet/process`, {
            fileContent: response.data.content,
            format: response.data.format
          });

          if (processResponse.data.success) {
            setUploadedData(processResponse.data.data);
          }
        }
      } else {
        throw new Error('Unsupported file format. Please upload CSV or Excel files.');
      }
    } catch (error: any) {
      console.error('File processing error:', error);
      alert(error.message || 'Failed to process uploaded file. Please try again.');
    } finally {
      setProcessingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const applyUpdates = () => {
    if (uploadedData.length === 0) {
      alert('No updates found. Please upload a file with edited text.');
      return;
    }

    // Merge updates with original data
    const updatedElements = data.map(original => {
      const update = uploadedData.find(u => u.id === original.id);
      return update ? { ...original, edited_text: update.edited_text } : original;
    });

    onUpdateText(updatedElements);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Spreadsheet Management
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Export for editing or upload your changes
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Export Section */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            1. Export for Editing
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => generateSpreadsheet('csv')}
              className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download CSV
            </button>
            <button
              onClick={() => generateSpreadsheet('xlsx')}
              className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Excel
            </button>
          </div>
          
          <div className="mt-3 text-xs text-gray-500">
            <p>Don't have data yet? Download templates:</p>
            <div className="flex space-x-2 mt-1">
              <button
                onClick={() => downloadTemplate('csv')}
                className="text-blue-600 hover:text-blue-800"
              >
                CSV Template
              </button>
              <span>•</span>
              <button
                onClick={() => downloadTemplate('xlsx')}
                className="text-blue-600 hover:text-blue-800"
              >
                Excel Template
              </button>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            2. Upload Edited File
          </h4>
          
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> your edited file
                </p>
                <p className="text-xs text-gray-500">CSV or Excel files</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                disabled={processingFile}
              />
            </label>
          </div>

          {processingFile && (
            <div className="mt-3 flex items-center justify-center text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Processing file...
            </div>
          )}

          {uploadedData.length > 0 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium text-green-800">
                  Found {uploadedData.length} text updates
                </span>
              </div>
              <div className="mt-2 text-xs text-green-700">
                <p>Preview of changes:</p>
                <ul className="mt-1 space-y-1">
                  {uploadedData.slice(0, 3).map((update, index) => (
                    <li key={index} className="truncate">
                      "{update.original_text}" → "{update.edited_text}"
                    </li>
                  ))}
                  {uploadedData.length > 3 && (
                    <li className="text-green-600">
                      ...and {uploadedData.length - 3} more changes
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Apply Section */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            3. Apply Updates
          </h4>
          <button
            onClick={applyUpdates}
            disabled={loading || uploadedData.length === 0}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Applying Updates...
              </div>
            ) : (
              `Apply ${uploadedData.length} Updates`
            )}
          </button>
          
          {uploadedData.length === 0 && (
            <p className="mt-2 text-xs text-gray-500 text-center">
              Upload an edited file to enable updates
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpreadsheetManager;