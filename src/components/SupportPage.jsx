import React, { useState } from 'react';
import { HelpCircle, Mail, MessageSquare, ArrowLeft, Copy, Check, Send, Sparkles, ShieldCheck, Activity, Cpu, Wifi, CheckSquare, Square } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import './LegalPages.css';

export default function SupportPage() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });

  // State for interactive common fixes checklist
  const [fixes, setFixes] = useState([
    { id: 1, text: "Ensure stable internet connection", checked: false },
    { id: 2, text: "Clear browser cache if data isn't updating", checked: false },
    { id: 3, text: "Ensure using latest browser version", checked: false },
    { id: 4, text: "Avoid editing data in multiple tabs concurrently", checked: false }
  ]);

  const toggleFix = (id) => {
    setFixes(fixes.map(f => f.id === id ? { ...f, checked: !f.checked } : f));
  };

  const completedFixesCount = fixes.filter(f => f.checked).length;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('darshanedu2256@gmail.com');
    setCopied(true);
    toast.success('Support email copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill out all required fields.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      toast.success('Support ticket successfully transmitted to the core node!');
      setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
      setSubmitting(false);
    }, 1500);
  };

  return (
    <div className="legal-page-container animate-fade-in">
      <div className="legal-bg-glow" />
      
      <div className="legal-header">
        <button className="legal-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> <span>Return to System</span>
        </button>
      </div>

      <div className="support-grid-layout">
        
        {/* Left Column: Diagnostics, Common Fixes & Direct Email */}
        <section className="support-column glass-panel">
          <div className="support-header-section">
            <div className="support-icon-wrap">
              <HelpCircle size={32} />
            </div>
            <h1 className="support-title">Support <span className="smooth-gradient-text">Orbit</span></h1>
            <p className="support-subtitle">Welcome to GraVITal Support 🚀 We're here to help you get the most out of your experience.</p>
          </div>

          <div className="support-dashboard-grid">
            
            {/* 1. Need Help card */}
            <div className="support-dashboard-card">
              <div className="card-header-row">
                <HelpCircle size={18} className="card-icon help" />
                <h5>💡 Need Help?</h5>
              </div>
              <p>If you're facing issues with login/account access, CGPA calculations, data saving, or profile deletion:</p>
              <div className="support-highlight-box">
                <em>Try refreshing the page or logging out and back in. Most issues get resolved instantly.</em>
              </div>
            </div>

            {/* 2. Interactive Fixes Checklist */}
            <div className="support-dashboard-card">
              <div className="card-header-row">
                <Wifi size={18} className="card-icon fixes" />
                <h5>🛠️ Common Fixes Checklist</h5>
              </div>
              <p className="card-meta-text">Tap each diagnostic to check off:</p>
              <div className="interactive-checklist">
                {fixes.map((fix) => (
                  <div 
                    key={fix.id} 
                    className={`checklist-item ${fix.checked ? 'checked' : ''}`}
                    onClick={() => toggleFix(fix.id)}
                  >
                    {fix.checked ? <CheckSquare size={16} className="check-box-icon" /> : <Square size={16} className="check-box-icon" />}
                    <span>{fix.text}</span>
                  </div>
                ))}
              </div>
              <div className="checklist-progress">
                <div 
                  className="checklist-progress-bar" 
                  style={{ width: `${(completedFixesCount / fixes.length) * 100}%` }}
                />
                <span className="progress-text">{completedFixesCount} of {fixes.length} Checked</span>
              </div>
            </div>

            {/* 3. Account & Data Issues */}
            <div className="support-dashboard-card">
              <div className="card-header-row">
                <ShieldCheck size={18} className="card-icon security" />
                <h5>🔐 Account & Data Issues</h5>
              </div>
              <ul className="support-bullet-list">
                <li>Manage or delete your account from <strong>Profile Settings</strong>.</li>
                <li>All deletions are permanent and cannot be undone.</li>
                <li>Inactive accounts are removed after 1 year.</li>
              </ul>
            </div>

            {/* 4. Feedback & Suggestions */}
            <div className="support-dashboard-card">
              <div className="card-header-row">
                <Sparkles size={18} className="card-icon suggestions" />
                <h5>🚀 Feedback & Suggestions</h5>
              </div>
              <p>
                We're constantly improving GraVITal. If you have ideas, feature requests, or suggestions — transmit them directly via the ticket console!
              </p>
            </div>

            {/* 5. System Status */}
            <div className="support-dashboard-card status-card">
              <div className="card-header-row">
                <Activity size={18} className="card-icon status" />
                <h5>⚡ Real-time Status</h5>
              </div>
              <div className="status-indicator-row">
                <div className="pulsing-green-dot" />
                <span className="status-active-text">Core Systems: Operational</span>
              </div>
              <p className="status-description-text">
                GraVITal is actively monitored. If there's a major issue or downtime, our nodes will resolve it immediately.
              </p>
            </div>

          </div>

          {/* Email Contact Card */}
          <div className="support-email-card" style={{ marginTop: '24px' }}>
            <div className="email-card-icon">
              <Mail size={20} />
            </div>
            <div className="email-card-details">
              <h4>Direct Support Node</h4>
              <p>We usually respond within <strong>24–48 hours</strong></p>
              <div className="copy-email-box">
                <code>darshanedu2256@gmail.com</code>
                <button className="copy-btn" onClick={handleCopyEmail} aria-label="Copy Email">
                  {copied ? <Check size={14} className="copied-check" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Interactive Support Ticket Form */}
        <section className="support-column glass-panel">
          <div className="support-header-section">
            <div className="support-icon-wrap">
              <MessageSquare size={32} />
            </div>
            <h2 className="support-title">Submit a <span className="smooth-gradient-text">Ticket</span></h2>
            <p className="support-subtitle">Log a feedback item or support request into the core node</p>
          </div>

          <form onSubmit={handleSubmitForm} className="support-form">
            <div className="form-group-legal">
              <label htmlFor="support-name">Name *</label>
              <input 
                type="text" 
                id="support-name" 
                className="legal-input-field" 
                placeholder="e.g. Darshan"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group-legal">
              <label htmlFor="support-email">VIT Student Email *</label>
              <input 
                type="email" 
                id="support-email" 
                className="legal-input-field" 
                placeholder="e.g. name.surname2026@vitstudent.ac.in"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group-legal">
              <label htmlFor="support-subject">Category</label>
              <select 
                id="support-subject" 
                className="legal-select-field"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              >
                <option value="General Inquiry">General Inquiry</option>
                <option value="Calculation Issue">Calculation Bug / Correction</option>
                <option value="AI Import Issue">Gemini OCR Error</option>
                <option value="Account Deletion">Account Deletion Help</option>
                <option value="Suggestion">System Suggestion / Feedback</option>
              </select>
            </div>

            <div className="form-group-legal">
              <label htmlFor="support-message">Message Details *</label>
              <textarea 
                id="support-message" 
                className="legal-textarea-field" 
                rows="5"
                placeholder="Detail your request, suggestion, or bug report here..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="legal-submit-btn btn-primary"
              disabled={submitting}
            >
              <Send size={16} /> <span>{submitting ? 'Transmitting...' : 'Submit Support Ticket'}</span>
            </button>
          </form>
        </section>

      </div>
      
      <div className="legal-footer-copyright support-page-footer">
        Thanks for using GraVITal 💜
      </div>
    </div>
  );
}
