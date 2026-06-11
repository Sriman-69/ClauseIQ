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
import MyDocuments from './components/views/MyDocuments';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { FileText, ArrowRight } from 'lucide-react';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [document, setDocument] = useState(null);
  const [activeRoute, setActiveRoute] = useState('documents'); // default to documents/upload
  const [hasEnteredApp, setHasEnteredApp] = useState(false);

  React.useEffect(() => {
    if (!isAuthenticated) {
      setHasEnteredApp(false);
      setDocument(null);
    }
  }, [isAuthenticated]);

  const handleUploadSuccess = (doc) => {
    setDocument(doc);
    setActiveRoute(doc ? 'dashboard' : 'documents');
    setHasEnteredApp(true);
  };

  const renderContent = () => {
    if (activeRoute === 'metrics') return <ObservabilityDashboard />;
    if (activeRoute === 'documents') return <MyDocuments onSelectDocument={handleUploadSuccess} />;

    if (!document) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '60vh',
          textAlign: 'center',
          gap: '1.5rem',
          background: 'linear-gradient(135deg, rgba(30, 30, 38, 0.4) 0%, rgba(20, 20, 25, 0.25) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem'
        }}>
          <FileText size={48} style={{ color: 'var(--brand-primary)', opacity: 0.8 }} />
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 600 }}>No Active Document Selected</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem', maxWidth: '400px' }}>
              Please select an existing document from your repository or upload a new one to begin your analysis.
            </p>
          </div>
          <button 
            onClick={() => setActiveRoute('documents')} 
            style={{
              background: 'var(--brand-primary)',
              border: 'none',
              color: '#fff',
              padding: '0.6rem 1.2rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem'
            }}
          >
            Go to Documents
            <ArrowRight size={16} />
          </button>
        </div>
      );
    }

    switch (activeRoute) {
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
          >
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
