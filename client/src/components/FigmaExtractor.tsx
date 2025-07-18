import React, { useState } from 'react';
import axios from 'axios';
import { TextElement, FigmaFileInfo } from '../types';

interface FigmaExtractorProps {
  onDataExtracted: (data: TextElement[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const FigmaExtractor: React.FC<FigmaExtractorProps> = ({
  onDataExtracted,
  loading,
  setLoading,
  setError
}) => {
  const [fileId, setFileId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [fileInfo, setFileInfo] = useState<FigmaFileInfo | null>(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const extractFileIdFromUrl = (url: string): string => {
    // Extract file ID from Figma URL
    // Format: https://www.figma.com/file/{fileId}/...
    const match = url.match(/\/file\/([a-zA-Z0-9]+)/);
    return match ? match[1] : url;
  };

  const handleFileIdChange = (value: string) => {
    const extractedId = extractFileIdFromUrl(value);
    setFileId(extractedId);
  };

  const getFileInfo = async () => {
    if (!fileId || !accessToken) {
      setError('Please provide both File ID and Access Token');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/figma/file/${fileId}?accessToken=${accessToken}`
      );

      if (response.data.success) {
        setFileInfo(response.data.data);
      } else {
        setError('Failed to fetch file information');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to connect to Figma');
    } finally {
      setLoading(false);
    }
  };

  const extractText = async () => {
    if (!fileId || !accessToken) {
      setError('Please provide both File ID and Access Token');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/figma/extract`, {
        fileId,
        accessToken
      });

      if (response.data.success) {
        onDataExtracted(response.data.data);
      } else {
        setError('Failed to extract text from Figma file');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to extract text from Figma');
    } finally {
      setLoading(false);
    }
  };

  const loadDemoData = () => {
    // Load demo data for testing without Figma API
    const demoData: TextElement[] = [
      {
        id: 'demo-1',
        original_text: 'Welcome to Our App',
        edited_text: '',
        frame_name: 'Landing Page',
        component_path: 'MainFrame/Header/Title',
        context_notes: 'Font: Inter, Size: 32px, Position: (120, 80)',
        image: ''
      },
      {
        id: 'demo-2',
        original_text: 'Get started today',
        edited_text: '',
        frame_name: 'Landing Page',
        component_path: 'MainFrame/CTASection/Button',
        context_notes: 'Font: Inter, Size: 16px, Position: (200, 300)',
        image: ''
      },
      {
        id: 'demo-3',
        original_text: 'Join thousands of users who trust our platform',
        edited_text: '',
        frame_name: 'Landing Page',
        component_path: 'MainFrame/CTASection/Subtitle',
        context_notes: 'Font: Inter, Size: 18px, Position: (150, 250)',
        image: ''
      },
      {
        id: 'demo-4',
        original_text: 'Learn More',
        edited_text: '',
        frame_name: 'About Page',
        component_path: 'AboutFrame/InfoSection/LinkButton',
        context_notes: 'Font: Inter, Size: 14px, Position: (300, 400)',
        image: ''
      }
    ];

    onDataExtracted(demoData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          <div>
            <label htmlFor="figma-url" className="block text-sm font-medium text-gray-700 mb-2">
              Figma File URL or File ID
            </label>
            <input
              id="figma-url"
              type="text"
              value={fileId}
              onChange={(e) => handleFileIdChange(e.target.value)}
              placeholder="https://www.figma.com/file/abc123... or just abc123"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              Paste the full Figma URL or just the file ID
            </p>
          </div>

          <div>
            <label htmlFor="access-token" className="block text-sm font-medium text-gray-700 mb-2">
              Figma Access Token
            </label>
            <input
              id="access-token"
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="figd_..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              Get your token from{' '}
              <a 
                href="https://www.figma.com/developers/api#access-tokens" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                Figma Developer Settings
              </a>
            </p>
          </div>

          {fileInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="font-medium text-blue-900 mb-2">File Information</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Name:</strong> {fileInfo.name}</p>
                <p><strong>Last Modified:</strong> {new Date(fileInfo.lastModified).toLocaleDateString()}</p>
                <p><strong>Pages:</strong> {fileInfo.document.children}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={getFileInfo}
              disabled={loading || !fileId || !accessToken}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connecting...' : 'Check File'}
            </button>

            <button
              onClick={extractText}
              disabled={loading || !fileId || !accessToken}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Extracting...
                </div>
              ) : (
                'Extract Text'
              )}
            </button>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600 mb-3">
              Don't have a Figma file ready? Try our demo data:
            </p>
            <button
              onClick={loadDemoData}
              className="w-full px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200"
            >
              Load Demo Data
            </button>
          </div>
        </div>
      </div>

      {/* Instructions Card */}
      <div className="mt-6 bg-gray-50 rounded-lg p-6">
        <h3 className="font-medium text-gray-900 mb-3">How to get your Figma Access Token:</h3>
        <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
          <li>Go to your Figma account settings</li>
          <li>Navigate to "Personal access tokens"</li>
          <li>Click "Create new token"</li>
          <li>Give it a name and copy the token</li>
          <li>Paste it in the field above</li>
        </ol>
        <p className="text-xs text-gray-500 mt-3">
          Note: Your token is only used to connect to Figma and is not stored anywhere.
        </p>
      </div>
    </div>
  );
};

export default FigmaExtractor;