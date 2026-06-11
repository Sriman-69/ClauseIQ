import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import { ChevronDown, ChevronUp, FileText, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ClauseExplorer = ({ documentId }) => {
  const [clauses, setClauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchClauses = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/v1/documents/${documentId}/clauses`);
        setClauses(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClauses();
  }, [documentId]);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Skeleton style={{ height: '60px' }} />
      <Skeleton style={{ height: '60px' }} />
      <Skeleton style={{ height: '60px' }} />
    </div>
  );

  const filteredClauses = clauses.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) || 
    c.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search clauses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '1rem 1rem 1rem 3rem',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: '1rem'
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredClauses.map(clause => (
          <Card key={clause.id} style={{ overflow: 'hidden' }}>
            <div 
              onClick={() => setExpandedId(expandedId === clause.id ? null : clause.id)}
              style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: expandedId === clause.id ? 'var(--bg-tertiary)' : 'transparent' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500 }}>
                <FileText size={18} color="var(--brand-primary)" />
                {clause.title}
              </div>
              {expandedId === clause.id ? <ChevronUp size={20} color="var(--text-muted)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
            </div>
            
            <AnimatePresence>
              {expandedId === clause.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-primary)' }}
                >
                  <div style={{ padding: '1.5rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    {clause.content}
                    <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      Source: Page {clause.page_number}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        ))}
        {filteredClauses.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No clauses match your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default ClauseExplorer;
