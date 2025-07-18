import React, { useState } from 'react';
import axios from 'axios';
import FigmaExtractor from './components/FigmaExtractor';
import TextTable from './components/TextTable';
import SpreadsheetManager from './components/SpreadsheetManager';
import Header from './components/Header';
import { TextElement, ExtractedData } from './types';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {currentStep === 'extract' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Extract Text from Prototype
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Review Extracted Text
                </h2>
                <p className="text-gray-600">
                  Found {extractedData.length} text elements. Download as spreadsheet or edit inline.
                </p>
              </div>
              <button
                onClick={resetApp}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Start Over
              </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
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
          <div className="text-center space-y-6">
            <div className="max-w-md mx-auto">
              <div className="rounded-full bg-green-100 p-3 mx-auto w-16 h-16 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Updates Prepared!</h2>
              <p className="text-gray-600 mb-6">
                Your text updates have been prepared. Since direct Figma updates require plugin access, 
                you can use the generated update instructions to apply changes manually.
              </p>
              <button
                onClick={resetApp}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
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
