import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import axios from 'axios';
import { UploadCloud, Loader2, Zap, ShieldCheck, Search, ArrowRight, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import Login from '../../pages/Login';
import Register from '../../pages/Register';
import logoImg from '../../assets/logo.png';
import './landing.css';

const LandingPage = ({ onEnterApp }) => {
  const { isAuthenticated, logout, currentUser } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState('login');
  const [toastMessage, setToastMessage] = useState('');

  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const heroRef = useRef(null);
  const subRef = useRef(null);
  const dropzoneRef = useRef(null);
  const gridRef = useRef(null);
  const backgroundRef = useRef(null);

  // GSAP Animations
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to(heroRef.current, { y: 0, opacity: 1, duration: 1, delay: 0.2 })
      .to(subRef.current, { y: 0, opacity: 1, duration: 1 }, "-=0.7")
      .to(dropzoneRef.current, { y: 0, opacity: 1, duration: 0.8 }, "-=0.6")
      .to(gridRef.current, { opacity: 1, duration: 1 }, "-=0.4");
  }, []);

  // GSAP Background Particles
  useEffect(() => {
    const wrapper = backgroundRef.current;
    if (!wrapper) return;

    const dots = [];
    const numDots = 50;
    
    for (let i = 0; i < numDots; i++) {
      const dot = document.createElement('div');
      dot.style.position = 'absolute';
      dot.style.width = Math.random() * 3 + 1 + 'px';
      dot.style.height = dot.style.width;
      dot.style.background = 'rgba(99, 102, 241, 0.4)';
      dot.style.borderRadius = '50%';
      dot.style.top = Math.random() * 100 + 'vh';
      dot.style.left = Math.random() * 100 + 'vw';
      wrapper.appendChild(dot);
      dots.push(dot);

      gsap.to(dot, {
        y: `+=${Math.random() * 200 - 100}`,
        x: `+=${Math.random() * 200 - 100}`,
        scale: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.7 + 0.1,
        duration: Math.random() * 5 + 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: Math.random() * -5
      });
    }

    return () => {
      dots.forEach(d => d.remove());
    };
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true);
    else if (e.type === 'dragleave') setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      setShowAuthModal(false);
    }
  }, [isAuthenticated]);

  const handleFile = async (file) => {
    if (!isAuthenticated) {
      setToastMessage('Please log in to upload agreements');
      setTimeout(() => setToastMessage(''), 4000);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/api/v1/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Delay slightly for effect before entering
      setTimeout(() => onEnterApp(response.data), 800);
    } catch (err) {
      alert('Failed to upload document.');
      setUploading(false);
    }
  };

  return (
    <div className="landing-wrapper" style={{ paddingTop: '80px' }}>
      <div className="landing-background" ref={backgroundRef}></div>
      <div className="landing-grid-overlay"></div>

      {/* Top Navigation Header */}
      <header style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        padding: '1.25rem 2.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10,
        borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
        background: 'linear-gradient(to bottom, rgba(5, 5, 7, 0.8) 0%, rgba(5, 5, 7, 0) 100%)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={logoImg} alt="ClauseIQ Logo" style={{ height: '70px', width: 'auto', objectFit: 'contain' }} />
        </div>

        <div>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Signed in as <strong style={{ color: '#fff', fontWeight: 500 }}>{currentUser?.email}</strong>
              </span>
              <button 
                onClick={() => onEnterApp(null)}
                style={{
                  background: 'var(--brand-primary)',
                  border: '1px solid var(--brand-primary)',
                  color: '#fff',
                  padding: '0.45rem 1.15rem',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  outline: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--brand-hover)'}
                onMouseOut={e => e.currentTarget.style.background = 'var(--brand-primary)'}
              >
                Enter App
                <ArrowRight size={13} />
              </button>
              <button 
                onClick={logout}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: 'var(--text-primary)',
                  padding: '0.45rem 1.15rem',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button 
              onClick={() => { setAuthView('login'); setShowAuthModal(true); }}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#e2e8f0',
                padding: '0.55rem 1.4rem',
                borderRadius: '30px',
                cursor: 'pointer',
                fontSize: '0.825rem',
                fontWeight: 600,
                transition: 'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease',
                outline: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)'
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = '#ffffff';
                e.currentTarget.style.color = '#0e0e11';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = '#e2e8f0';
              }}
            >
              <ShieldCheck size={14} style={{ flexShrink: 0 }} />
              <span>Log In</span>
            </button>
          )}
        </div>
      </header>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, x: 120, y: 0, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 350, damping: 24 }}
            style={{
              position: 'fixed',
              top: '1.5rem',
              right: '1.5rem',
              zIndex: 9999,
              width: '360px',
              backgroundColor: 'rgba(10, 10, 14, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              borderLeft: '4px solid #f43f5e',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '14px',
              padding: '1rem 1.25rem',
              boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 1px 0 rgba(255, 255, 255, 0.05) inset, 0 0 30px rgba(244, 63, 94, 0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <div style={{
              background: 'rgba(244, 63, 94, 0.1)',
              color: '#f43f5e',
              padding: '0.5rem',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(244, 63, 94, 0.2)',
              flexShrink: 0
            }}>
              <AlertCircle size={18} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', flexGrow: 1 }}>
              <div style={{ color: '#f8fafc', fontSize: '0.875rem', fontWeight: 600 }}>Upload Blocked</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.3' }}>
                {toastMessage}
              </div>
            </div>
            <button 
              onClick={() => setToastMessage('')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.25rem',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.2s',
                outline: 'none'
              }}
              onMouseOver={e => e.currentTarget.style.color = '#f8fafc'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(5, 5, 7, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9998
        }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '440px' }}>
            <button 
              onClick={() => setShowAuthModal(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: 'var(--text-secondary)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                transition: 'all 0.2s',
                outline: 'none'
              }}
              onMouseOver={e => e.currentTarget.style.color = '#fff'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              ✕
            </button>
            {authView === 'login' ? (
              <Login onToggle={() => setAuthView('register')} isModal={true} />
            ) : (
              <Register onToggle={() => setAuthView('login')} isModal={true} />
            )}
          </div>
        </div>
      )}

      <div className="landing-content">
        <h1 className="hero-title" ref={heroRef}>
          Contract Intelligence, <br /> Redefined.
        </h1>
        <p className="hero-subtitle" ref={subRef}>
          Upload an NDA, MSA, or complex agreement and instantly extract risks, compliance checklists, and semantic summaries powered by Gemini 2.5 Flash.
        </p>

        <div className="glowing-dropzone-wrapper" ref={dropzoneRef}>
          <motion.div 
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
            className={`glowing-dropzone ${isDragging ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={(e) => {
              if (uploading) return;
              if (!isAuthenticated) {
                e.preventDefault();
                setToastMessage('Please log in to upload agreements');
                setTimeout(() => setToastMessage(''), 4000);
                return;
              }
              fileInputRef.current?.click();
            }}
          >
            <input 
              type="file" 
              accept="application/pdf" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleChange}
            />
            
            {uploading ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="dropzone-inner">
                {/* Processing SVG */}
                <div className="dropzone-svg-wrapper">
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                    <circle cx="40" cy="40" r="36" stroke="rgba(99,102,241,0.15)" strokeWidth="2"/>
                    <circle cx="40" cy="40" r="36" stroke="#6366f1" strokeWidth="2"
                      strokeDasharray="56 170" strokeLinecap="round">
                      <animateTransform attributeName="transform" type="rotate"
                        from="0 40 40" to="360 40 40" dur="1.2s" repeatCount="indefinite"/>
                    </circle>
                    <circle cx="40" cy="40" r="24" stroke="rgba(168,85,247,0.2)" strokeWidth="1.5"/>
                    <circle cx="40" cy="40" r="24" stroke="#a855f7" strokeWidth="1.5"
                      strokeDasharray="28 122" strokeLinecap="round">
                      <animateTransform attributeName="transform" type="rotate"
                        from="360 40 40" to="0 40 40" dur="0.9s" repeatCount="indefinite"/>
                    </circle>
                    {/* Center dot */}
                    <circle cx="40" cy="40" r="5" fill="#6366f1">
                      <animate attributeName="r" values="4;6;4" dur="1s" repeatCount="indefinite"/>
                      <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite"/>
                    </circle>
                  </svg>
                </div>
                <h3 className="dropzone-title">Processing Document...</h3>
                <p className="dropzone-sub">Parsing clauses, generating embeddings, building RAG index.</p>
                <div className="upload-progress-bar">
                  <div className="upload-progress-fill"></div>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="dropzone-inner">
                {/* Animated SVG Upload Icon */}
                <div className="dropzone-svg-wrapper">
                  {/* Outer pulse ring */}
                  <div className={`dropzone-pulse-ring ${isDragging ? 'drag-active' : ''}`}/>
                  <svg width="96" height="96" viewBox="0 0 96 96" fill="none" className="dropzone-svg">
                    {/* Animated dashed border circle */}
                    <circle cx="48" cy="48" r="44" stroke="rgba(99,102,241,0.12)" strokeWidth="1.5"/>
                    <circle cx="48" cy="48" r="44" stroke="#6366f1" strokeWidth="1.5"
                      strokeDasharray="16 8" strokeLinecap="round" opacity="0.6">
                      <animateTransform attributeName="transform" type="rotate"
                        from="0 48 48" to="360 48 48" dur="12s" repeatCount="indefinite"/>
                    </circle>
                    {/* Inner orbit */}
                    <circle cx="48" cy="48" r="30" stroke="rgba(168,85,247,0.1)" strokeWidth="1"/>
                    <circle cx="48" cy="48" r="30" stroke="#a855f7" strokeWidth="1"
                      strokeDasharray="10 10" strokeLinecap="round" opacity="0.4">
                      <animateTransform attributeName="transform" type="rotate"
                        from="360 48 48" to="0 48 48" dur="8s" repeatCount="indefinite"/>
                    </circle>
                    {/* Orbiting dot on outer ring */}
                    <circle r="3" fill="#6366f1">
                      <animateMotion dur="12s" repeatCount="indefinite">
                        <mpath href="#outerOrbit"/>
                      </animateMotion>
                    </circle>
                    {/* Orbiting dot on inner ring */}
                    <circle r="2" fill="#a855f7">
                      <animateMotion dur="8s" repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1">
                        <mpath href="#innerOrbit"/>
                      </animateMotion>
                    </circle>
                    {/* Paths for animateMotion */}
                    <path id="outerOrbit" d="M92,48 a44,44 0 1,1 -0.001,0" fill="none"/>
                    <path id="innerOrbit" d="M78,48 a30,30 0 1,1 -0.001,0" fill="none"/>
                    {/* Upload arrow icon in center */}
                    <g transform="translate(48,48)">
                      {/* Background circle */}
                      <circle r="18" fill="rgba(99,102,241,0.12)"/>
                      <circle r="18" stroke="#6366f1" strokeWidth="1" fill="none" opacity="0.4"/>
                      {/* Upload arrow */}
                      <path d="M0 4 L0 -6 M0 -6 L-5 -1 M0 -6 L5 -1" 
                        stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite"/>
                      </path>
                      {/* Base line */}
                      <path d="M-6 7 L6 7" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/>
                    </g>
                    {/* Small sparkle dots */}
                    <circle cx="14" cy="20" r="1.5" fill="#6366f1" opacity="0.6">
                      <animate attributeName="opacity" values="0.6;0.1;0.6" dur="2.5s" begin="0s" repeatCount="indefinite"/>
                    </circle>
                    <circle cx="80" cy="30" r="1" fill="#a855f7" opacity="0.5">
                      <animate attributeName="opacity" values="0.5;0.1;0.5" dur="1.8s" begin="0.5s" repeatCount="indefinite"/>
                    </circle>
                    <circle cx="75" cy="72" r="1.5" fill="#6366f1" opacity="0.4">
                      <animate attributeName="opacity" values="0.4;0.9;0.4" dur="3s" begin="1s" repeatCount="indefinite"/>
                    </circle>
                    <circle cx="18" cy="68" r="1" fill="#a855f7" opacity="0.5">
                      <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2.2s" begin="0.2s" repeatCount="indefinite"/>
                    </circle>
                  </svg>
                </div>

                <h3 className="dropzone-title">{isDragging ? 'Release to Upload' : 'Drag & drop your PDF here'}</h3>
                <p className="dropzone-sub">Supports single PDF files up to 50MB.</p>
                <button className="dropzone-btn">
                  Select File
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>


        <div className="feature-grid" ref={gridRef}>
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Zap size={24} />
            </div>
            <h3 className="feature-title">Zero-Cost Caching</h3>
            <p className="feature-desc">Analyzed documents are intelligently snapshotted. Repeated queries cost $0 and load instantly without invoking Gemini.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Search size={24} />
            </div>
            <h3 className="feature-title">Hybrid Reranking</h3>
            <p className="feature-desc">Perplexity-style RAG Chat utilizing FAISS and BM25 heuristic reranking to find the perfect citation every time.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <ShieldCheck size={24} />
            </div>
            <h3 className="feature-title">Offline Resilience</h3>
            <p className="feature-desc">If API limits are exceeded, ClauseIQ gracefully falls back to rigorous regex and semantic heuristic parsers.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
