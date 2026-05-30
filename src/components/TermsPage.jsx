import React from 'react';
import { Scale, ArrowLeft, BookOpen, User, RefreshCw, XCircle, Copyright, Cloud, AlertTriangle, Layers, PowerOff, FileText, Mail, ShieldAlert, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './LegalPages.css';

export default function TermsPage() {
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
              <Scale size={24} />
            </div>
            <h1 className="legal-title">Terms & <span className="smooth-gradient-text">Conditions</span></h1>
          </div>
          <p className="legal-subtitle">Understand the operating rules, data responsibilities, and system access boundaries</p>
          <div className="legal-badge">Last Updated: May 30, 2026</div>
        </div>

        <div className="legal-content">
          <p className="legal-intro-text">
            Welcome to <strong>GraVITal</strong>. By accessing or using our website, you agree to comply with and be bound by the following Terms and Conditions.
          </p>

          <div className="legal-dashboard-grid">
            
            {/* Section 1 */}
            <div className="support-dashboard-card">
              <div className="card-header-row">
                <BookOpen size={18} className="card-icon help" />
                <h5>1. Use of the Service</h5>
              </div>
              <p>GraVITal provides tools for:</p>
              <ul className="support-bullet-list">
                <li>CGPA calculation and target tracking.</li>
                <li>Academic performance tracking over semesters.</li>
                <li>Data visualization and insights.</li>
              </ul>
              <p style={{ marginTop: '8px' }}>You agree to use this platform only for lawful and personal academic purposes.</p>
            </div>

            {/* Section 2 */}
            <div className="support-dashboard-card">
              <div className="card-header-row">
                <User size={18} className="card-icon security" />
                <h5>2. User Accounts</h5>
              </div>
              <ul className="support-bullet-list">
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>You agree to provide accurate and complete information during registration.</li>
                <li>You are responsible for all activities that occur under your account.</li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="support-dashboard-card">
              <div className="card-header-row">
                <AlertTriangle size={18} className="card-icon fixes" />
                <h5>3. User Data & Responsibility</h5>
              </div>
              <p>You are solely responsible for the data you input (grades, subjects, etc.).</p>
              <ul className="support-bullet-list" style={{ marginBottom: '10px' }}>
                <li>GraVITal does not verify the accuracy of user-entered academic data.</li>
                <li>Results generated (CGPA, SGPA, simulations) are estimates and should not be considered official university transcripts.</li>
              </ul>
            </div>

            {/* Section 4 */}
            <div className="support-dashboard-card">
              <div className="card-header-row">
                <RefreshCw size={18} className="card-icon suggestions" />
                <h5>4. Account Deletion</h5>
              </div>
              <p>You may delete your account at any time from your profile settings.</p>
              <div className="support-highlight-box" style={{ marginBottom: '10px' }}>
                Upon deletion, all your data (academic records, targets, and profile info) will be permanently removed. <strong>This action is irreversible.</strong>
              </div>
              <p>GraVITal also reserves the right to remove inactive accounts after prolonged inactivity (e.g., 1 year).</p>
            </div>

            {/* Section 5 */}
            <div className="support-dashboard-card">
              <div className="card-header-row">
                <XCircle size={18} className="card-icon fixes" />
                <h5>5. Acceptable Use</h5>
              </div>
              <p>You agree NOT to:</p>
              <ul className="support-bullet-list">
                <li>Use the platform for illegal, deceptive, or harmful activities.</li>
                <li>Attempt to hack, disrupt, overburden, or exploit the system infrastructure.</li>
                <li>Access other users' academic records or session data without authorization.</li>
                <li>Use automated scripts, scraper tools, or bots to abuse the service.</li>
              </ul>
            </div>

            {/* Section 6 */}
            <div className="support-dashboard-card">
              <div className="card-header-row">
                <Copyright size={18} className="card-icon status" />
                <h5>6. Intellectual Property</h5>
              </div>
              <ul className="support-bullet-list">
                <li>All content, custom design layouts, brand markers, logos, and software features of GraVITal are the property of the platform owner.</li>
                <li>You may not copy, distribute, extract, or reproduce any part of the service structure without permission.</li>
              </ul>
            </div>

            {/* Section 7 */}
            <div className="support-dashboard-card">
              <div className="card-header-row">
                <Cloud size={18} className="card-icon help" />
                <h5>7. Service Availability</h5>
              </div>
              <ul className="support-bullet-list">
                <li>We strive to keep GraVITal online at all times, but we do not guarantee uninterrupted access.</li>
                <li>The service layout and features may be modified, updated, or discontinued at any time without prior notice.</li>
              </ul>
            </div>

            {/* Section 8 */}
            <div className="support-dashboard-card">
              <div className="card-header-row">
                <AlertTriangle size={18} className="card-icon security" />
                <h5>8. Limitation of Liability</h5>
              </div>
              <p>GraVITal is provided “as is” without warranties of any kind. We are not responsible for:</p>
              <ul className="support-bullet-list">
                <li>Incorrect calculations due to user input or grade weight configuration errors.</li>
                <li>Data loss due to host server issues or communication outages.</li>
                <li>Any academic choices or career decisions made using calculations from this platform.</li>
              </ul>
            </div>

            {/* Section 9 */}
            <div className="support-dashboard-card">
              <div className="card-header-row">
                <Layers size={18} className="card-icon status" />
                <h5>9. Third-Party Services</h5>
              </div>
              <p>GraVITal relies on external infrastructure services to operate:</p>
              <ul className="support-bullet-list">
                <li>MongoDB Atlas (database persistence)</li>
                <li>ImageKit (cloud profile photo hosting)</li>
                <li>Vercel / Render (web deployment systems)</li>
              </ul>
              <p style={{ marginTop: '8px' }}>We are not responsible for outages or issues caused by these services.</p>
            </div>

            {/* Section 10 */}
            <div className="support-dashboard-card">
              <div className="card-header-row">
                <PowerOff size={18} className="card-icon fixes" />
                <h5>10. Termination</h5>
              </div>
              <p>We reserve the right to:</p>
              <ul className="support-bullet-list">
                <li>Suspend or terminate accounts that violate these terms.</li>
                <li>Remove content or uploads that are harmful, offensive, or violate security guidelines.</li>
              </ul>
            </div>

            {/* Section 11 */}
            <div className="support-dashboard-card">
              <div className="card-header-row">
                <FileText size={18} className="card-icon suggestions" />
                <h5>11. Changes to Terms</h5>
              </div>
              <p>
                We may update these Terms and Conditions at any time. Continued use of the platform implies acceptance of the updated terms.
              </p>
            </div>

            {/* Section 12 */}
            <div className="support-dashboard-card">
              <div className="card-header-row">
                <Mail size={18} className="card-icon security" />
                <h5>12. Contact</h5>
              </div>
              <p>For any questions regarding these Terms, contact:</p>
              <div className="copy-email-box" style={{ maxWidth: '300px', marginTop: '8px' }}>
                <code>darshanedu2256@gmail.com</code>
              </div>
            </div>

          </div>
        </div>

        <div className="legal-footer-copyright">
          By using GraVITal, you acknowledge that you have read, understood, and agreed to these Terms and Conditions.
        </div>
      </main>
    </div>
  );
}
