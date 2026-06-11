import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../ui/Skeleton';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

const ChecklistView = ({ documentId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchChecklist = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/v1/documents/${documentId}/checklist`);
        setItems(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchChecklist();
  }, [documentId]);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Skeleton style={{ height: '40px' }} />
      <Skeleton style={{ height: '60px' }} />
      <Skeleton style={{ height: '60px' }} />
      <Skeleton style={{ height: '60px' }} />
    </div>
  );

  const filteredItems = items.filter(item => filter === 'All' || item.status.toLowerCase() === filter.toLowerCase());

  const getStatusIcon = (status) => {
    switch(status.toLowerCase()) {
      case 'present': return <CheckCircle2 color="var(--status-success)" size={20} />;
      case 'missing': return <AlertCircle color="var(--status-danger)" size={20} />;
      default: return <HelpCircle color="var(--status-warning)" size={20} />;
    }
  };

  const getStatusBadge = (status) => {
    switch(status.toLowerCase()) {
      case 'present': return <Badge variant="success">Present</Badge>;
      case 'missing': return <Badge variant="danger">Missing</Badge>;
      default: return <Badge variant="warning">Unclear</Badge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {['All', 'Present', 'Missing', 'Unclear'].map(f => (
          <button 
            key={f} 
            onClick={() => setFilter(f)}
            style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '9999px',
              border: '1px solid var(--border-strong)',
              background: filter === f ? 'var(--brand-primary)' : 'transparent',
              color: filter === f ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-tertiary)' }}>
                <th style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>Requirement</th>
                <th style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>Explanation</th>
                <th style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>Evidence</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, idx) => (
                <motion.tr 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}
                >
                  <td style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {getStatusIcon(item.status)}
                      {item.title}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>{getStatusBadge(item.status)}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{item.explanation}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem', fontStyle: 'italic' }}>
                    {item.citation !== 'None' ? `"${item.citation}"` : '-'}
                  </td>
                </motion.tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No requirements match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ChecklistView;
