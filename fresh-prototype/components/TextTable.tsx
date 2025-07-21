import React from 'react';
import { TextElement } from '../types';

interface TextTableProps {
  data: TextElement[];
}

const TextTable: React.FC<TextTableProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No text elements found</h3>
        <p className="text-gray-600">Extract text from a Figma file to see the results here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Extracted Text Elements ({data.length})
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Preview of all text content found in your prototype
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Text Content
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Context
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-start space-x-3">
                    {item.image && (
                      <div className="flex-shrink-0">
                        <img
                          src={item.image}
                          alt="Screenshot"
                          className="w-8 h-8 rounded border border-gray-200 object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 break-words">
                        "{item.original_text}"
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        ID: {item.id}
                      </p>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <div className="font-medium">{item.frame_name}</div>
                    <div className="text-gray-500 text-xs mt-1 break-all">
                      {item.component_path}
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className="text-xs text-gray-600">
                    {item.context_notes}
                  </div>
                  {item.coordinates && (
                    <div className="text-xs text-gray-400 mt-1">
                      {Math.round(item.coordinates.x)}, {Math.round(item.coordinates.y)} 
                      ({Math.round(item.coordinates.width)}×{Math.round(item.coordinates.height)})
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Total: {data.length} text elements</span>
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-1"></span>
              Ready for editing
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextTable;