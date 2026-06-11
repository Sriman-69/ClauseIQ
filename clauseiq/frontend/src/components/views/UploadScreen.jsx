import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Loader2 } from 'lucide-react';
import axios from 'axios';
import { Button } from '../ui/Button';
import './views.css';
import { motion } from 'framer-motion';

const UploadScreen = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleFile = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/api/v1/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onUploadSuccess(response.data);
    } catch (err) {
      alert('Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="upload-container"
    >
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Analyze Contracts with AI</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
          Upload an NDA, MSA, or any legal agreement to get instant compliance risks and summaries.
        </p>
      </div>

      <div 
        className={`upload-dropzone ${isDragging ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          accept="application/pdf" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleChange}
        />
        
        {uploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <Loader2 size={48} color="var(--brand-primary)" className="spin" style={{ animation: 'spin 2s linear infinite' }} />
            <h3 style={{ margin: 0 }}>Processing Document...</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Extracting clauses and generating vectors.</p>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '50%' }}>
              <UploadCloud size={48} color="var(--brand-primary)" />
            </div>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>Click or drag file to this area</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>Support for a single PDF upload. Maximum size 50MB.</p>
            </div>
            <Button variant="primary" style={{ marginTop: '1rem' }}>Select PDF</Button>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default UploadScreen;
