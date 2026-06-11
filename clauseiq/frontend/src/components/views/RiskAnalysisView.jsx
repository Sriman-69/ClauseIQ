import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import { Badge } from '../ui/Badge';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const RiskAnalysisView = ({ documentId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRisks = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/v1/documents/${documentId}/risks`);
        setData(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRisks();
  }, [documentId]);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Skeleton style={{ height: '100px' }} />
      <Skeleton style={{ height: '100px' }} />
    </div>
  );

  const RiskCard = ({ risk, level }) => {
    let colorVar = "var(--status-info)";
    let Icon = Info;
    
    if (level === 'high') { colorVar = "var(--status-danger)"; Icon = AlertTriangle; }
    if (level === 'medium') { colorVar = "var(--status-warning)"; Icon = AlertCircle; }

    return (
      <Card style={{ borderLeft: `4px solid ${colorVar}`, marginBottom: '1rem' }}>
        <CardHeader style={{ paddingBottom: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem' }}>
              <Icon color={colorVar} size={20} /> {risk.risk}
            </CardTitle>
            <Badge variant={level === 'high' ? 'danger' : level === 'medium' ? 'warning' : 'outline'}>
              {level.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{risk.reason}</p>
          <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', borderLeft: '2px solid var(--border-strong)', fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            {risk.citation !== 'None' ? `"${risk.citation}"` : 'Citation unavailable'}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div>
        <h2 style={{ color: 'var(--status-danger)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <AlertTriangle /> High Risks ({data?.high_risks?.length || 0})
        </h2>
        {data?.high_risks?.length === 0 ? (
           <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No high risks detected in this document.</p>
        ) : (
          data?.high_risks?.map((r, i) => <RiskCard key={`h-${i}`} risk={r} level="high" />)
        )}
      </div>

      <div>
        <h2 style={{ color: 'var(--status-warning)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <AlertCircle /> Medium Risks ({data?.medium_risks?.length || 0})
        </h2>
        {data?.medium_risks?.length === 0 ? (
           <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No medium risks detected.</p>
        ) : (
          data?.medium_risks?.map((r, i) => <RiskCard key={`m-${i}`} risk={r} level="medium" />)
        )}
      </div>

      <div>
        <h2 style={{ color: 'var(--status-info)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Info /> Low Risks/Notables ({data?.low_risks?.length || 0})
        </h2>
        {data?.low_risks?.length === 0 ? (
           <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No low risks detected.</p>
        ) : (
          data?.low_risks?.map((r, i) => <RiskCard key={`l-${i}`} risk={r} level="low" />)
        )}
      </div>

    </motion.div>
  );
};

export default RiskAnalysisView;
