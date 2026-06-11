import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { FileText, Layers, AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import gsap from 'gsap';

const Overview = ({ document }) => {
  const [metrics, setMetrics] = useState(null);
  const headerRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/v1/metrics').then(res => {
      setMetrics(res.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    // GSAP Timeline for dashboard entry
    const tl = gsap.timeline({ defaults: { ease: 'back.out(1.7)' } });
    
    tl.fromTo(headerRef.current, 
      { opacity: 0, y: -20 }, 
      { opacity: 1, y: 0, duration: 0.8 }
    )
    .fromTo(cardsRef.current,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1 },
      "-=0.4"
    );
  }, [document]);

  if (!document) return null;

  return (
    <div className="overview-container">
      <div className="document-header" ref={headerRef}>
        <div>
          <h1 className="document-title">
            <FileText color="var(--brand-primary)" />
            {document.filename}
            <Badge variant="default">v{document.version_number}</Badge>
          </h1>
          <div className="document-meta">
            <span>ID: {document.id}</span>
            <span>Uploaded: {new Date(document.upload_timestamp).toLocaleDateString()}</span>
          </div>
        </div>
        <Badge variant="success" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
          <ShieldCheck size={18} style={{ marginRight: '0.5rem' }} />
          Processed Successfully
        </Badge>
      </div>

      <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Document Intelligence Overview</h2>
      
      <div className="overview-grid">
        <Card ref={el => cardsRef.current[0] = el} style={{ background: 'rgba(22, 22, 26, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <CardHeader>
            <CardDescription style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={16} /> Total Clauses Extracted
            </CardDescription>
            <div className="metric-value">24</div>
          </CardHeader>
        </Card>
        
        <Card ref={el => cardsRef.current[1] = el} style={{ background: 'rgba(22, 22, 26, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <CardHeader>
            <CardDescription style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={16} color="var(--status-danger)" /> High Risks Detected
            </CardDescription>
            <div className="metric-value" style={{ color: 'var(--status-danger)' }}>3</div>
          </CardHeader>
        </Card>

        <Card ref={el => cardsRef.current[2] = el} style={{ background: 'rgba(22, 22, 26, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <CardHeader>
            <CardDescription style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={16} color="var(--status-success)" /> Compliance Score
            </CardDescription>
            <div className="metric-value" style={{ color: 'var(--status-success)' }}>85%</div>
          </CardHeader>
        </Card>

        {metrics && (
           <Card ref={el => cardsRef.current[3] = el} style={{ background: 'rgba(22, 22, 26, 0.6)', backdropFilter: 'blur(12px)', borderLeft: '4px solid var(--brand-primary)' }}>
             <CardHeader>
               <CardDescription>Global Cache Hits</CardDescription>
               <div className="metric-value">{metrics.metrics.cache_hit || 0}</div>
             </CardHeader>
           </Card>
        )}
      </div>
      
      <Card ref={el => cardsRef.current[4] = el} style={{ marginTop: '2rem', padding: '2rem', textAlign: 'center', borderStyle: 'dashed', background: 'rgba(22, 22, 26, 0.3)' }}>
        <h3 style={{ marginBottom: '1rem' }}>Ready for Analysis</h3>
        <p style={{ color: 'var(--text-muted)' }}>
          Navigate using the tabs below to view the Executive Summary, Compliance Checklist, 
          Risk Profile, or chat directly with the document.
        </p>
      </Card>
    </div>
  );
};

export default Overview;
