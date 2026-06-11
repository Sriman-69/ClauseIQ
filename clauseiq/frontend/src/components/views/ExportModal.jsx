import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Download, FileJson, FileText, FileBadge } from 'lucide-react';
import { motion } from 'framer-motion';

const ExportModal = ({ documentId }) => {
  const [downloading, setDownloading] = useState(false);

  const handleExport = async (format) => {
    setDownloading(format);
    try {
      const response = await axios.post(`http://localhost:8000/api/v1/documents/${documentId}/export?export_format=${format}`);
      const { download_url } = response.data;
      
      // trigger download
      window.open(`http://localhost:8000${download_url}`, '_blank');
    } catch (err) {
      alert("Export failed.");
    } finally {
      setDownloading(false);
    }
  };

  const formats = [
    { id: 'pdf', name: 'PDF Report', icon: FileBadge, color: 'var(--status-danger)', desc: 'Professional, uneditable report for external sharing.' },
    { id: 'docx', name: 'Word Document', icon: FileText, color: 'var(--brand-primary)', desc: 'Fully editable report for internal review and redlining.' },
    { id: 'json', name: 'Raw JSON', icon: FileJson, color: 'var(--status-warning)', desc: 'Machine-readable format for API integrations and data lakes.' }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Export Intelligence Center</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
          Generate comprehensive audit reports containing the executive summary, compliance checklist, and risk analysis.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {formats.map(f => (
          <Card key={f.id} style={{ display: 'flex', alignItems: 'center', padding: '1.5rem', gap: '1.5rem', transition: 'all 0.2s', border: '1px solid var(--border-subtle)' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <f.icon size={32} color={f.color} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{f.name}</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>{f.desc}</p>
            </div>
            <Button 
              variant="secondary" 
              onClick={() => handleExport(f.id)}
              disabled={downloading !== false}
              style={{ display: 'flex', gap: '0.5rem' }}
            >
              {downloading === f.id ? 'Generating...' : <> <Download size={16} /> Export </>}
            </Button>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};

export default ExportModal;
