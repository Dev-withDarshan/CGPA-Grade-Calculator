import React from 'react';
import { Shield, ArrowLeft, User, BookOpen, Cpu, Settings, Lock, Clock, Trash2, Layers, Cookie, HelpCircle, Mail, Database, EyeOff, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './LegalPages.css';

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="legal-page-container animate-fade-in">
      <div className="legal-bg-glow" />
      
      <div className="legal-header">
        <button className="legal-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> <span>Return to System</span>
        </button>
      </div>

      <main className="legal-card glass-panel" style={{ maxWidth: '860px', width: '100%', margin: '0 auto' }}>
        <div className="legal-title-section">
          <div className="legal-title-row">
            <div className="legal-icon-wrap">
              <Shield size={24} />
            </div>
            <h1 className="legal-title">Privacy <span className="smooth-gradient-text">Protocol</span></h1>
          </div>
          <p className="legal-subtitle">Understand how your data is collected, secured, and managed within GraVITal</p>
          <div className="legal-badge">Last Updated: May 30, 2026</div>
        </div>

        <div className="legal-content">
          <p className="legal-intro-text">
            Welcome to <strong>GraVITal</strong>. We are committed to protecting your privacy and ensuring transparency in how your data is handled. This Privacy Policy outlines how we collect, use, store, and safeguard your information when you use our platform.
          </p>

          <div className="support-dashboard-grid">
            
            {/* Section 1 */}
            <div className="support-dashboard-card">
              <div className="card-header-row">
                <Database size={18} className="card-icon help" />
                <h5>1. Information We Collect</h5>
              </div>
              <p>We collect only the information necessary to provide and improve our services:</p>
              
              <div className="sub-info-block">
                <div className="sub-info-item">
                  <span className="sub-info-header"><User size={14} /> a. Personal Information</span>
                  <ul className="support-bullet-list">
                    <li>Email address (used for authentication)</li>
                    <li>Username (if applicable)</li>
                    <li>Profile photo (optional)</li>
                  </ul>
                </div>

                <div className="sub-info-item">
                  <span className="sub-info-header"><BookOpen size={14} /> b. Academic Data</span>
                  <ul className="support-bullet-list">
                    <li>Subjects, grades, CGPA inputs</li>
                    <li>User-entered academic information and preferences</li>
                  </ul>
                </div>

                <div className="sub-info-item">
                  <span className="sub-info-header"><Cpu size={14} /> c. Technical & Usage Data</span>
                  <ul className="support-bullet-list">
                    <li>IP address</li>
                    <li>Browser type and device information</li>
                    <li>Usage behavior (pages visited, actions performed)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="support-dashboard-card">
              <div className="card-header-row">
                <EyeOff size={18} className="card-icon security" />
                <h5>2. Purpose of Data Collection</h5>
              </div>
              <p>Your data is used strictly for:</p>
              <ul className="support-bullet-list">
                <li>Providing CGPA calculations and academic insights</li>
                <li>Maintaining your user account and preferences</li>
                <li>Improving platform performance and features</li>
                <li>Ensuring security and preventing unauthorized access</li>
              </ul>
              <div className="support-highlight-box" style={{ marginTop: '10px' }}>
                We do <strong>not sell or trade your personal data</strong> to third parties.
              </div>
            </div>

            {/* Section 3 */}
            <div className="support-dashboard-card">
              <div className="card-header-row">
                <Lock size={18} className="card-icon status" />
                <h5>3. Data Storage and Security</h5>
              </div>
              <ul className="support-bullet-list" style={{ marginBottom: '12px' }}>
                <li>Data is securely stored using <strong>MongoDB Atlas</strong></li>
                <li>Authentication is handled via <strong>JWT (JSON Web Tokens)</strong></li>
                <li>We implement industry-standard security measures, including:</li>
                <ul className="support-bullet-list" style={{ paddingLeft: '20px', listStyleType: 'circle' }}>
                  <li>Encrypted communication (HTTPS)</li>
                  <li>Secure authentication flows</li>
                  <li>Restricted database access</li>
                </ul>
              </ul>
              <div className="support-highlight-box">
                <em>While we strive to protect your data, no system can guarantee absolute security.</em>
              </div>
            </div>

            {/* Section 4 */}
            <div className="support-dashboard-card">
              <div className="card-header-row">
                <Clock size={18} className="card-icon fixes" />
                <h5>4. Data Retention Policy</h5>
              </div>
              <ul className="support-bullet-list">
                <li>Your data is retained as long as your account remains active</li>
                <li>Accounts that remain inactive for <strong>over 1 year may be automatically deleted</strong></li>
                <li>You may delete your account at any time</li>
              </ul>
              <div className="support-highlight-box" style={{ marginTop: '10px' }}>
                Upon deletion, all associated personal and academic data is permanently removed, and this process is <strong>irreversible</strong>.
              </div>
            </div>

            {/* Section 5 */}
            <div className="support-dashboard-card">
              <div className="card-header-row">
                <ShieldCheck size={18} className="card-icon help" />
                <h5>5. Account & Data Control</h5>
              </div>
              <p>You have full control over your data:</p>
              <ul className="support-bullet-list">
                <li>Access and update your information anytime</li>
                <li>Delete your account directly from profile settings</li>
                <li>Request clarification about data usage</li>
              </ul>
            </div>

            {/* Section 6 */}
            <div className="support-dashboard-card">
              <div className="card-header-row">
                <Layers size={18} className="card-icon status" />
                <h5>6. Third-Party Services</h5>
              </div>
              <p>GraVITal relies on trusted third-party services for core functionality:</p>
              <ul className="support-bullet-list">
                <li><strong>MongoDB Atlas</strong> – Database storage</li>
                <li><strong>ImageKit</strong> – Profile image hosting</li>
                <li><strong>Vercel / Render</strong> – Application hosting</li>
              </ul>
              <p style={{ marginTop: '8px' }}>These services may process your data strictly for operational purposes.</p>
            </div>

            {/* Section 7 */}
            <div className="support-dashboard-card">
              <div className="card-header-row">
                <Cookie size={18} className="card-icon suggestions" />
                <h5>7. Cookies and Local Storage</h5>
              </div>
              <p>We may use browser storage mechanisms to:</p>
              <ul className="support-bullet-list">
                <li>Maintain login sessions</li>
                <li>Store user preferences</li>
                <li>Improve performance and user experience</li>
              </ul>
              <div className="support-highlight-box" style={{ marginTop: '10px' }}>
                No invasive tracking or advertising cookies are used.
              </div>
            </div>

            {/* Section 8 */}
            <div className="support-dashboard-card">
              <div className="card-header-row">
                <AlertTriangle size={18} className="card-icon fixes" />
                <h5>8. Inactive Account Handling</h5>
              </div>
              <p>To maintain system efficiency and data hygiene:</p>
              <ul className="support-bullet-list">
                <li>Accounts inactive for more than <strong>12 months may be automatically removed</strong></li>
                <li>This is handled via automated database policies</li>
              </ul>
            </div>

            {/* Section 9 */}
            <div className="support-dashboard-card">
              <div className="card-header-row">
                <Settings size={18} className="card-icon suggestions" />
                <h5>9. Policy Updates</h5>
              </div>
              <p>
                We may update this Privacy Policy periodically. Changes will be reflected on this page with an updated “Last Updated” date.
              </p>
              <p style={{ marginTop: '8px' }}>
                Continued use of the platform implies acceptance of any updates.
              </p>
            </div>

            {/* Section 10 */}
            <div className="support-dashboard-card">
              <div className="card-header-row">
                <Mail size={18} className="card-icon security" />
                <h5>10. Contact Information</h5>
              </div>
              <p>For any privacy-related concerns or questions, contact:</p>
              <div className="copy-email-box" style={{ maxWidth: '300px', marginTop: '8px' }}>
                <code>darshanedu2256@gmail.com</code>
              </div>
            </div>

          </div>
        </div>

        <div className="legal-footer-copyright">
          By using GraVITal, you acknowledge that you have read and agreed to this Privacy Policy.
        </div>
      </main>
    </div>
  );
}
