import React from 'react';
import { BookOpen, ArrowLeft, Cpu, Database, Server, User, Key, Shield, Layers, HelpCircle, Activity, RefreshCw, List, Sliders, AlertTriangle, Compass, Sparkles, LogIn, Lock, CheckCircle, Eye, Calendar, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './LegalPages.css';

export default function HelpPage() {
  const navigate = useNavigate();

  return (
    <div className="legal-page-container animate-fade-in">
      <div className="legal-bg-glow" />
      
      <div className="legal-header">
        <button className="legal-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> <span>Return to System</span>
        </button>
      </div>

      <main className="legal-card glass-panel" style={{ maxWidth: '100%', width: '100%', margin: '0 auto' }}>
        <div className="manual-header-tagline-wrapper">
          <span className="manual-header-tagline">GraVITal — Grade VIT for All, Grab it all as Every 0.01 is vital.</span>
        </div>
        <div className="legal-title-section">
          <div className="legal-title-row">
            <div className="legal-icon-wrap">
              <BookOpen size={24} />
            </div>
            <h1 className="legal-title">Complete <span className="smooth-gradient-text">System Manual</span></h1>
          </div>
          <p className="legal-subtitle">The comprehensive technical documentation detailing GraVITal's architecture, pages, user workflows, media management, and security protocols</p>
          <div className="legal-badge">Version 2.0 • Last Updated: May 30, 2026</div>
        </div>

        <div className="legal-content">
          <div className="support-dashboard-grid" style={{ gridTemplateColumns: '1fr', gap: '32px' }}>
            
            {/* Section 1: Introduction */}
            <div className="support-dashboard-card">
              <div className="card-header-row">
                <Compass size={20} className="card-icon help" />
                <h5>1. Introduction & Project Philosophy</h5>
              </div>
              <div className="sub-info-block" style={{ marginTop: '12px' }}>
                <div className="sub-info-item">
                  <span className="sub-info-header"><Cpu size={14} /> 1.1 What is GraVITal?</span>
                  <p style={{ margin: '8px 0 0' }}>
                    GraVITal (derived from <em>Grade VIT for All</em>) is a high-density, full-stack academic planning and analytics dashboard custom-engineered for students. The core mission is encapsulated in its tagline: <strong>"Grab it all. Every 0.01 is vital."</strong> The application treats academic tracking not just as a set of calculations, but as a dynamic optimization challenge, giving students foresight into their GPA, CGPA trajectories, and grade needs.
                  </p>
                </div>

                <div className="sub-info-item">
                  <span className="sub-info-header"><Sparkles size={14} /> 1.2 Core Architectural Principles</span>
                  <ul className="support-bullet-list" style={{ marginTop: '8px' }}>
                    <li><strong>Single Source of Truth:</strong> User profiles, settings, and academic logs are persisted in MongoDB and updated in real-time, eliminating inconsistent client-side states.</li>
                    <li><strong>Hybrid Session Handlers:</strong> Offers a fully registered cloud-backed experience alongside an instant "Guest Access Mode" that operates entirely on localized browser space.</li>
                    <li><strong>Event-Driven Theme Engine:</strong> Supports automated context theme rendering, ensuring standard dark theme persistence on structural/legal pages and customized theme preferences on workspace pages.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 2: Page-by-Page Feature Blueprint */}
            <div className="support-dashboard-card">
              <div className="card-header-row">
                <Layers size={20} className="card-icon suggestions" />
                <h5>2. Detailed Page-by-Page Feature Blueprint</h5>
              </div>
              
              <div className="sub-info-block">
                {/* 2.1 Landing Page */}
                <div className="sub-info-item">
                  <span className="sub-info-header"><Sparkles size={14} /> 2.1 Landing Page ("/")</span>
                  <p style={{ margin: '6px 0 0' }}>
                    The entry gateway of GraVITal. Designed with a custom-engineered HTML5 canvas particle background, it outlines the core features of the system and presents direct calls-to-action (CTAs). If a session is already authenticated, the CTAs automatically shift to route the user into the active workspace.
                  </p>
                </div>

                {/* 2.2 Auth Screen */}
                <div className="sub-info-item">
                  <span className="sub-info-header"><LogIn size={14} /> 2.2 Authentication Screen ("/login")</span>
                  <p style={{ margin: '6px 0 0' }}>
                    A dual-panel interface supporting secure login and user signup. Key features include:
                  </p>
                  <ul className="support-bullet-list" style={{ marginTop: '6px' }}>
                    <li><strong>Security Verification:</strong> Passwords are verified against character guidelines (letters, numbers, and special symbols) before being processed.</li>
                    <li><strong>Guest Access Option:</strong> Allows users to completely skip database signup, creating local mock sessions on the browser to perform calculations immediately.</li>
                  </ul>
                </div>

                {/* 2.3 Navbar Component */}
                <div className="sub-info-item">
                  <span className="sub-info-header"><List size={14} /> 2.3 Premium Navigation Header</span>
                  <p style={{ margin: '6px 0 0' }}>
                    A glassmorphic header containing conditional controls:
                  </p>
                  <ul className="support-bullet-list" style={{ marginTop: '6px' }}>
                    <li><strong>Context Tabs:</strong> Renders active calculators dynamically when on the dashboard (Semester GPA, CGPA, Target CGPA, What-If).</li>
                    <li><strong>Conditional Theme Toggle:</strong> Displays a theme toggle button (Sun/Moon icons) exclusively on the primary functional pages (Dashboard, Profile, ScoreFlow) and hides it on static pages.</li>
                    <li><strong>Cloud Save Sync:</strong> A magnetic button to save pending client modifications to the database with visual status feedbacks.</li>
                    <li><strong>User Avatar Dropdown:</strong> Offers shortcuts to user configurations, analytics, the system guide, and session destruction (logout).</li>
                  </ul>
                </div>

                {/* 2.4 Dashboard Page */}
                <div className="sub-info-item">
                  <span className="sub-info-header"><Sliders size={14} /> 2.4 Calculator Dashboard ("/dashboard")</span>
                  <p style={{ margin: '6px 0 0' }}>
                    The calculation engine of GraVITal, containing four distinct functional tabs:
                  </p>
                  <div style={{ paddingLeft: '14px', marginTop: '8px' }}>
                    <p><strong>A. Semester GPA Tab:</strong> Provides tools to list, add, delete, and rename courses. Supports credit assignment (1 to 6) and grade input mapping to VIT's grading weights (S=10, A=9, B=8, C=7, D=6, E=5, F=0). Supports four data input modes:</p>
                    <ul className="support-bullet-list" style={{ marginLeft: '12px' }}>
                      <li><em>Manual Input:</em> Individual course creation.</li>
                      <li><em>Grade Table Mode:</em> Structured tabular grid for rapid entering.</li>
                      <li><em>Timetable Paste Autofill:</em> Extracts course details automatically using regular expression parsing on raw text copied from the university portal.</li>
                      <li><em>AI Screenshot Parser:</em> Supports image uploads to automatically scan and import grades.</li>
                    </ul>
                    
                    <p style={{ marginTop: '8px' }}><strong>B. CGPA (Overall) Tab:</strong> Consolidates semester-by-semester SGPA logs and cumulative credit tallies to compute overall CGPA.</p>
                    
                    <p style={{ marginTop: '8px' }}><strong>C. Target CGPA Tab:</strong> Allows students to input a target CGPA. The algorithm calculates the minimum required average GPA for all remaining semesters to hit the goal, providing warnings if the target is mathematically unachievable.</p>
                    
                    <p style={{ marginTop: '8px' }}><strong>D. What-If Grade Simulator Tab:</strong> Enables real-time manipulation of expected grades in active courses to preview the immediate mathematical impact on current SGPA and cumulative CGPA without altering saved data.</p>
                  </div>
                </div>

                {/* 2.5 Profile Settings */}
                <div className="sub-info-item">
                  <span className="sub-info-header"><User size={14} /> 2.5 Profile & Account Configurations ("/profile")</span>
                  <p style={{ margin: '6px 0 0' }}>
                    Central settings dashboard divided into key components:
                  </p>
                  <ul className="support-bullet-list" style={{ marginTop: '6px' }}>
                    <li><strong>Identity Hub:</strong> Displays user avatar, verified checkmarks, and membership details. Supports local image compression (under 2MB) before cloud uploads.</li>
                    <li><strong>Academic Profile:</strong> Stores core details like branch (CSE, ECE, IT, etc.), study year, and target CGPA metrics.</li>
                    <li><strong>System Preferences:</strong> Configures local parameters such as preferred grading system (VIT 10-Point, Standard 10-Point, 4-Point GPA) and theme settings (Light, Dark, System Sync).</li>
                    <li><strong>Security & Password Changes:</strong> Handles password modifications with secure hashing checks.</li>
                    <li><strong>Irreversible Account Deletion:</strong> Requires password confirmation, deletes all user records from MongoDB, and cleans up cloud media files immediately.</li>
                    <li><strong>Student Badge Preview:</strong> Renders a verified digital student card with real-time academic stats and custom themes.</li>
                  </ul>
                </div>

                {/* 2.6 ScoreFlow Analytics */}
                <div className="sub-info-item">
                  <span className="sub-info-header"><TrendingUp size={14} /> 2.6 ScoreFlow Academic Analytics ("/score-flow")</span>
                  <p style={{ margin: '6px 0 0' }}>
                    Provides visual representations of academic history:
                  </p>
                  <ul className="support-bullet-list" style={{ marginTop: '6px' }}>
                    <li><strong>Semester Progression Charts:</strong> Line graphs tracking GPA trends over time.</li>
                    <li><strong>Credit Milestone Accumulator:</strong> Tracks earned academic credits against graduation targets.</li>
                    <li><strong>Grade Distribution Metrics:</strong> Bar and pie charts detailing the frequency of earned grades (e.g., number of S, A, or B grades).</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 3: Technical Architecture & Core Workflows */}
            <div className="support-dashboard-card">
              <div className="card-header-row">
                <Server size={20} className="card-icon status" />
                <h5>3. Technical Architecture & Core Workflows</h5>
              </div>
              <p>GraVITal operates as a secure, three-tier application built on modern web patterns:</p>
              
              <div className="sub-info-block">
                <div className="sub-info-item">
                  <span className="sub-info-header"><Cpu size={14} /> 3.1 Tech Stack Components</span>
                  <ul className="support-bullet-list" style={{ marginTop: '6px' }}>
                    <li><strong>Frontend:</strong> React.js, compiled using Vite, styled with vanilla CSS, and deployed on Vercel.</li>
                    <li><strong>Backend:</strong> Node.js and Express framework, hosting REST APIs and serving route controllers, deployed on Render.</li>
                    <li><strong>Database:</strong> MongoDB Atlas cloud database. Keeps user schemas and academic documents.</li>
                    <li><strong>Media Storage:</strong> ImageKit Cloud SDK, hosting uploaded profile avatars.</li>
                  </ul>
                </div>

                <div className="sub-info-item">
                  <span className="sub-info-header"><Key size={14} /> 3.2 Secure API Authentication Flow</span>
                  <p style={{ margin: '6px 0 0' }}>
                    User registration and login requests are secured using industry-standard protocols:
                  </p>
                  <ol className="support-bullet-list" style={{ listStyleType: 'decimal', paddingLeft: '20px', marginTop: '6px' }}>
                    <li>The user submits credentials via the auth portal.</li>
                    <li>The backend hashes passwords using `bcrypt` (10 salt rounds) before writing to the database.</li>
                    <li>On successful verification, a JSON Web Token (JWT) is generated, containing the user ID.</li>
                    <li>The JWT token is sent back and stored in the browser's `localStorage` for session maintenance.</li>
                    <li>Every protected endpoint request includes the token in the `Authorization` bearer header, verified by backend middleware.</li>
                  </ol>
                </div>

                <div className="sub-info-item">
                  <span className="sub-info-header"><Database size={14} /> 3.3 Database Schema & Cloud Synchronization</span>
                  <p style={{ margin: '6px 0 0' }}>
                    Academic records are stored directly within the primary User document as embedded sub-documents. This denormalized pattern ensures:
                  </p>
                  <ul className="support-bullet-list" style={{ marginTop: '6px' }}>
                    <li>Single-query data fetches during dashboard loads, minimizing API response times.</li>
                    <li>Atomic operations: saves and updates write all active semesters and course logs in one operation.</li>
                    <li>Simple, cascading deletions: deleting a user automatically removes all embedded academic data.</li>
                  </ul>
                </div>

                <div className="sub-info-item">
                  <span className="sub-info-header"><Activity size={14} /> 3.4 ImageKit Media Upload & Deletion Workflow</span>
                  <p style={{ margin: '6px 0 0' }}>
                    The profile image management system uses a secure upload and deletion lifecycle:
                  </p>
                  <ul className="support-bullet-list" style={{ marginTop: '6px' }}>
                    <li><strong>Optimized Uploads:</strong> Files are compressed to base64 strings locally to reduce transfer size. The backend uploads them to ImageKit in a dedicated folder (`/gravital/profiles/`) with `useUniqueFileName: true` enabled.</li>
                    <li><strong>Direct File Deletions:</strong> The backend saves the unique ImageKit `fileId` as `profilePhotoFileId` in the user's database document. When uploading a new photo or deleting the account, the system deletes the old file directly via `deleteFile(fileId)` in $O(1)$ time, bypassing slow search listings.</li>
                    <li><strong>Cache Control:</strong> Since filenames contain unique hash suffixes, new upload URLs change instantly. This forces browsers and CDNs to fetch the updated image immediately.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 4: Security, Compliance & System Automations */}
            <div className="support-dashboard-card">
              <div className="card-header-row">
                <Shield size={20} className="card-icon security" />
                <h5>4. Security, Compliance & System Automations</h5>
              </div>
              <div className="sub-info-block">
                <div className="sub-info-item">
                  <span className="sub-info-header"><RefreshCw size={14} /> 4.1 Inactive Account Automatic Deletion System</span>
                  <p style={{ margin: '6px 0 0' }}>
                    To maintain database hygiene and protect student data privacy, GraVITal implements an automated database cleanup policy. Every User document contains a `lastLogin` timestamp that is updated on every login. A MongoDB TTL index is configured on this field:
                  </p>
                  <pre style={{ 
                    background: 'rgba(0,0,0,0.25)', 
                    padding: '12px 16px', 
                    borderRadius: '8px', 
                    fontSize: '12px', 
                    marginTop: '6px', 
                    color: '#a78bfa',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    lineHeight: '1.5'
                  }}>
                    Expiry: Automatically deletes the user document after 1 year of inactivity, subject to GraVITal policy.
                  </pre>
                  <p style={{ marginTop: '6px', fontSize: '13px' }}>
                    Once 365 days pass without a login event, MongoDB's background thread automatically deletes the user document, purging all associated academic records.
                  </p>
                </div>

                <div className="sub-info-item">
                  <span className="sub-info-header"><Lock size={14} /> 4.2 Security Audits and Policies</span>
                  <ul className="support-bullet-list" style={{ marginTop: '6px' }}>
                    <li><strong>CORS Policy:</strong> Restricted to authorized domains (development localhost and production Vercel clients) to prevent cross-origin scripting attacks.</li>
                    <li><strong>Sanitized Inputs:</strong> Academic input forms are strictly validated on both frontend and backend to protect database integrity.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 5: Troubleshooting & Support Guide */}
            <div className="support-dashboard-card">
              <div className="card-header-row">
                <HelpCircle size={20} className="card-icon fixes" />
                <h5>5. Troubleshooting & Support Guide</h5>
              </div>
              <div className="sub-info-block">
                <div className="sub-info-item">
                  <span className="sub-info-header">A. Session Disconnect / Failed Saves</span>
                  <p style={{ margin: 0 }}>If your cloud synchronization button fails, it is usually due to an expired session token. Log out using the avatar dropdown, clear your browser cache, and log back in to renew your token.</p>
                </div>
                <div className="sub-info-item">
                  <span className="sub-info-header">B. Timetable Parsing Fails</span>
                  <p style={{ margin: 0 }}>Ensure you copy the raw text from the official university timetable portal. Clean text containing standard slot mappings (e.g., A1, B1, ETH, ELA) is required for the regex extraction engine to parse course lines correctly.</p>
                </div>
                <div className="sub-info-item">
                  <span className="sub-info-header">C. Avatar Update Latency</span>
                  <p style={{ margin: 0 }}>If a new avatar upload does not appear instantly, clear your browser's disk cache. The system uses cache-busting URLs, but strict browser caches may occasionally cause rendering delays.</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="legal-footer-copyright">
          © 2026 GraVITal Complete System Manual. All rights reserved.
        </div>
      </main>
    </div>
  );
}
