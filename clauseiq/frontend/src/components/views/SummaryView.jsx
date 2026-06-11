import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import { FileText, Anchor, BookOpen, AlertCircle, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const SummaryView = ({ documentId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/v1/documents/${documentId}/summary`);
        setData(response.data);
      } catch (err) {
        console.error(err);
        setData({ error: "Failed to load summary." });
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [documentId]);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Skeleton style={{ height: '150px' }} />
      <Skeleton style={{ height: '100px' }} />
      <Skeleton style={{ height: '100px' }} />
    </div>
  );

  if (!data || data.error) return <div>{data?.error || "Error"}</div>;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <motion.div variants={itemVariants}>
        <Card style={{ borderTop: '4px solid var(--brand-primary)' }}>
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText color="var(--brand-primary)" /> Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p style={{ color: 'var(--text-primary)', fontSize: '1rem', lineHeight: '1.6' }}>{data.executive_summary}</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Anchor color="var(--brand-primary)" size={20} /> Purpose
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{data.purpose}</p>
          </CardContent>
        </Card>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <motion.div variants={itemVariants}>
          <Card style={{ height: '100%' }}>
            <CardHeader>
              <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen color="var(--brand-primary)" size={20} /> Key Obligations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                {data.key_obligations?.map((item, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{item}</li>)}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card style={{ height: '100%' }}>
            <CardHeader>
              <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert color="var(--status-warning)" size={20} /> Exceptions & Penalties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Exceptions</h4>
              <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                {data.exceptions?.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
              <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Penalties</h4>
              <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                {data.penalties?.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>

    </motion.div>
  );
};

export default SummaryView;
