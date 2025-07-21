import React, { useState } from 'react';
import axios from 'axios';
import FigmaExtractor from './components/FigmaExtractor';
import TextTable from './components/TextTable';
import SpreadsheetManager from './components/SpreadsheetManager';
import Header from './components/Header';
import { TextElement, ExtractedData } from './types';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || (
  process.env.NODE_ENV === 'production' 
    ? '' // Use relative URLs in production (same domain)
    : 'http://localhost:5000'
);

function App() {
  const [extractedData, setExtractedData] = useState<TextElement[]>([]);
  const [currentStep, setCurrentStep] = useState<'extract' | 'review' | 'update'>('extract');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDataExtracted = (data: TextElement[]) => {
    setExtractedData(data);
    setCurrentStep('review');
    setError(null);
  };

  const handleUpdateText = async (updates: TextElement[]) => {
    setLoading(true);
    setError(null);
    
    try {
      // This would typically require a Figma file ID and access token
      // For demo purposes, we'll just show the updates
      console.log('Text updates to apply:', updates);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(`Successfully prepared ${updates.length} text updates. Check console for details.`);
      setCurrentStep('update');
    } catch (err) {
      setError('Failed to update text in prototype');
      console.error('Update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetApp = () => {
    setExtractedData([]);
    setCurrentStep('extract');
    setError(null);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Header />
      
      <main className="container" style={{ padding: '2rem 0' }}>
        {error && (
          <div className="alert alert-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {currentStep === 'extract' && (
          <div style={{ marginBottom: '2rem' }}>
            <div className="text-center mb-6">
              <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                Extract Text from Prototype
              </h2>
              <p className="text-gray-600" style={{ fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto' }}>
                Connect your Figma file to extract all text elements and generate a spreadsheet for editing.
              </p>
            </div>
            
            <FigmaExtractor 
              onDataExtracted={handleDataExtracted}
              loading={loading}
              setLoading={setLoading}
              setError={setError}
            />
          </div>
        )}

        {currentStep === 'review' && extractedData.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  Review Extracted Text
                </h2>
                <p className="text-gray-600">
                  Found {extractedData.length} text elements. Download as spreadsheet or edit inline.
                </p>
              </div>
              <button
                onClick={resetApp}
                className="btn-secondary"
              >
                Start Over
              </button>
            </div>

            <div className="two-column">
              <div>
                <SpreadsheetManager 
                  data={extractedData}
                  onUpdateText={handleUpdateText}
                  loading={loading}
                />
              </div>
              
              <div>
                <TextTable data={extractedData} />
              </div>
            </div>
          </div>
        )}

        {currentStep === 'update' && (
          <div className="text-center">
            <div style={{ maxWidth: '400px', margin: '0 auto' }}>
              <div className="success-icon">
                ✓
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Updates Prepared!</h2>
              <p className="text-gray-600 mb-6">
                Your text updates have been prepared. Since direct Figma updates require plugin access, 
                you can use the generated update instructions to apply changes manually.
              </p>
              <button
                onClick={resetApp}
                className="btn-primary"
                style={{ padding: '0.75rem 1.5rem' }}
              >
                Process Another File
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
