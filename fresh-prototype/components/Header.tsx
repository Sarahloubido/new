import React from 'react';

const Header: React.FC = () => {
  return (
    <header>
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">
              📝
            </div>
            <div>
              <h1>
                Prototype Text Review Tool
              </h1>
              <p className="subtitle">
                Extract • Edit • Update
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></span>
                <span>Extract text from Figma</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%' }}></span>
                <span>Edit in spreadsheet</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: '8px', height: '8px', backgroundColor: '#8b5cf6', borderRadius: '50%' }}></span>
                <span>Apply updates</span>
              </div>
            </div>
            
            <button className="btn-secondary text-sm">
              GitHub
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;