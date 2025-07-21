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

  const loadDemoData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('/api/demo-data');
      if (response.data.success) {
        onDataExtracted(response.data.data);
      } else {
        setError('Failed to load demo data');
      }
    } catch (err: any) {
      console.error('Demo data error:', err);
      // Fallback to local demo data if API fails
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="card">
        <div className="form-group">
          <label htmlFor="figma-url">
            Figma File URL or File ID
          </label>
          <input
            id="figma-url"
            type="text"
            value={fileId}
            onChange={(e) => handleFileIdChange(e.target.value)}
            placeholder="https://www.figma.com/file/abc123... or just abc123"
          />
          <p className="text-xs text-gray-500" style={{ marginTop: '0.25rem' }}>
            Paste the full Figma URL or just the file ID
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="access-token">
            Figma Access Token
          </label>
          <input
            id="access-token"
            type="password"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="figd_..."
          />
          <p className="text-xs text-gray-500" style={{ marginTop: '0.25rem' }}>
            Get your token from{' '}
            <a 
              href="https://www.figma.com/developers/api#access-tokens" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600"
            >
              Figma Developer Settings
            </a>
          </p>
        </div>

        {fileInfo && (
          <div className="alert alert-success">
            <h4 style={{ fontWeight: '500', marginBottom: '0.5rem' }}>File Information</h4>
            <div className="text-sm">
              <p><strong>Name:</strong> {fileInfo.name}</p>
              <p><strong>Last Modified:</strong> {new Date(fileInfo.lastModified).toLocaleDateString()}</p>
              <p><strong>Pages:</strong> {fileInfo.document.children}</p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <button
            onClick={getFileInfo}
            disabled={loading || !fileId || !accessToken}
            className="btn-secondary"
            style={{ flex: 1 }}
          >
            {loading ? 'Connecting...' : 'Check File'}
          </button>

          <button
            onClick={extractText}
            disabled={loading || !fileId || !accessToken}
            className="btn-primary"
            style={{ flex: 1 }}
          >
            {loading ? (
              <span>
                <span className="spinner"></span>
                Extracting...
              </span>
            ) : (
              'Extract Text'
            )}
          </button>
        </div>

        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
          <p className="text-sm text-gray-600 mb-4">
            Don't have a Figma file ready? Try our demo data:
          </p>
          <button
            onClick={loadDemoData}
            className="btn-demo"
          >
            🚀 Load Demo Data
          </button>
        </div>
      </div>

      <div className="card" style={{ backgroundColor: '#f9fafb' }}>
        <h3 style={{ fontWeight: '500', marginBottom: '0.75rem' }}>How to get your Figma Access Token:</h3>
        <ol className="text-sm text-gray-600" style={{ paddingLeft: '1.25rem', lineHeight: '1.6' }}>
          <li>Go to your Figma account settings</li>
          <li>Navigate to "Personal access tokens"</li>
          <li>Click "Create new token"</li>
          <li>Give it a name and copy the token</li>
          <li>Paste it in the field above</li>
        </ol>
        <p className="text-xs text-gray-500 mt-4">
          Note: Your token is only used to connect to Figma and is not stored anywhere.
        </p>
      </div>
    </div>
  );
};

export default FigmaExtractor;