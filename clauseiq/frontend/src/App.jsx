import React, { useState } from 'react';
import DashboardLayout from './components/layout/DashboardLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/Tabs';
import LandingPage from './components/views/LandingPage';
import Overview from './components/views/Overview';
import SummaryView from './components/views/SummaryView';
import ChecklistView from './components/views/ChecklistView';
import RiskAnalysisView from './components/views/RiskAnalysisView';
import ChatView from './components/views/ChatView';
import ClauseExplorer from './components/views/ClauseExplorer';
import ComparisonView from './components/views/ComparisonView';
import ObservabilityDashboard from './components/views/ObservabilityDashboard';
import ExportModal from './components/views/ExportModal';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [document, setDocument] = useState(null);
  const [activeRoute, setActiveRoute] = useState('documents'); // default to documents/upload
  const [isContextOpen, setIsContextOpen] = useState(false);
  const [hasEnteredApp, setHasEnteredApp] = useState(false);

  React.useEffect(() => {
    if (!isAuthenticated) {
      setHasEnteredApp(false);
      setDocument(null);
    }
  }, [isAuthenticated]);

  const handleUploadSuccess = (doc) => {
    setDocument(doc);
    setActiveRoute('dashboard');
    setHasEnteredApp(true);
  };

  const renderContent = () => {
    if (activeRoute === 'metrics') return <ObservabilityDashboard />;

    switch (activeRoute) {
      case 'documents':
      case 'dashboard':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <Overview document={document} />
            <Tabs defaultValue="summary" onValueChange={() => {}}>
              <TabsList>
                <TabsTrigger value="summary">Executive Summary</TabsTrigger>
                <TabsTrigger value="checklist">Compliance Checklist</TabsTrigger>
                <TabsTrigger value="risks">Risk Profile</TabsTrigger>
                <TabsTrigger value="chat">RAG Chat</TabsTrigger>
                <TabsTrigger value="clauses">Clause Explorer</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary"><SummaryView documentId={document.id} /></TabsContent>
              <TabsContent value="checklist"><ChecklistView documentId={document.id} /></TabsContent>
              <TabsContent value="risks"><RiskAnalysisView documentId={document.id} /></TabsContent>
              <TabsContent value="chat"><ChatView documentId={document.id} /></TabsContent>
              <TabsContent value="clauses"><ClauseExplorer documentId={document.id} /></TabsContent>
            </Tabs>
          </div>
        );
      case 'comparison':
        return <ComparisonView documentId={document.id} />;
      case 'exports':
        return <ExportModal documentId={document.id} />;
      default:
        return <div>Route not found</div>;
    }
  };

  const renderContextContent = () => {
    if (!document) return <div style={{ color: 'var(--text-muted)' }}>No document selected.</div>;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '1.25rem 1rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ fontSize: '0.675rem', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>FILENAME</div>
          <div style={{ fontWeight: 500, wordBreak: 'break-all', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{document.filename}</div>
        </div>
        
        <div style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '1.25rem 1rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ fontSize: '0.675rem', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>DOCUMENT ID</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', wordBreak: 'break-all', color: 'var(--text-secondary)' }}>{document.id}</div>
        </div>
        
        <div style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '1.25rem 1rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ fontSize: '0.675rem', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>UPLOAD DATE</div>
          <div style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{new Date(document.upload_timestamp).toLocaleString()}</div>
        </div>
        
        <button 
          onClick={() => { setDocument(null); setHasEnteredApp(false); }} 
          style={{ 
            padding: '0.85rem', 
            marginTop: '1rem', 
            background: 'rgba(239, 68, 68, 0.06)', 
            border: '1px solid rgba(239, 68, 68, 0.2)', 
            color: 'var(--status-danger)', 
            borderRadius: 'var(--radius-lg)', 
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer', 
            transition: 'all 0.2s ease' 
          }}
          onMouseOver={e => { 
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)'; 
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.35)'; 
            e.currentTarget.style.boxShadow = '0 0 12px rgba(239, 68, 68, 0.08)';
          }}
          onMouseOut={e => { 
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.06)'; 
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)'; 
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Clear Session
        </button>
      </div>
    );
  };

  return (
    <AnimatePresence mode="wait">
      {!hasEnteredApp ? (
        <motion.div key="landing" style={{ width: '100%', minHeight: '100vh' }} exit={{ opacity: 0, y: -50, scale: 0.98 }} transition={{ duration: 0.5, ease: 'easeInOut' }}>
          <LandingPage onEnterApp={handleUploadSuccess} />
        </motion.div>
      ) : (
        <motion.div key="dashboard" style={{ width: '100%', height: '100vh' }} initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
          <DashboardLayout 
            activeRoute={activeRoute} 
            setActiveRoute={setActiveRoute}
            isContextOpen={isContextOpen}
            setIsContextOpen={setIsContextOpen}
            contextContent={renderContextContent()}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button 
                onClick={() => setIsContextOpen(!isContextOpen)}
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '0.875rem' }}
              >
                {isContextOpen ? 'Close Metadata' : 'View Metadata'}
              </button>
            </div>
            {renderContent()}
          </DashboardLayout>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
