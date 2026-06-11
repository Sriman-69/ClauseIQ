import React from 'react';
import { X } from 'lucide-react';
import './layout.css';

const ContextPanel = ({ isExpanded, setIsExpanded, children }) => {
  return (
    <div className="layout-context" style={{ width: isExpanded ? '320px' : '0px' }}>
      {isExpanded && (
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-secondary)' }}>Context</h3>
            <button
              onClick={() => setIsExpanded(false)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContextPanel;
