import React, { useState } from 'react';
import DocumentUpload from './components/DocumentUpload';
import Dashboard from './components/Dashboard';
import ObservabilityDashboard from './components/ObservabilityDashboard';

function App() {
  const [documentId, setDocumentId] = useState(null);
  const [showMetrics, setShowMetrics] = useState(false);

  return (
    <div className="App">
      <header className="App-header" style={{ padding: '20px', backgroundColor: '#213547', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>ClauseIQ Analysis Engine</h1>
        <button 
          onClick={() => setShowMetrics(true)}
          style={{ backgroundColor: '#1a1a1a', color: 'white', border: '1px solid #555', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
        >
          View System Metrics
        </button>
      </header>
      <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {!documentId ? (
          <DocumentUpload onUploadSuccess={setDocumentId} />
        ) : (
          <Dashboard documentId={documentId} />
        )}
      </main>
      {showMetrics && <ObservabilityDashboard onClose={() => setShowMetrics(false)} />}
    </div>
  );
}

export default App;
