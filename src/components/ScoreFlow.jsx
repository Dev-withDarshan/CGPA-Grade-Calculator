import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSemesterGPA, getSemesterCredits, GRADE_MAP } from '../utils/analytics';
import { 
  TrendingUp, 
  BookOpen, 
  Award, 
  ArrowLeft, 
  ChevronRight, 
  Activity,
  Layers,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Search,
  Star,
  ThumbsUp,
  GraduationCap,
  PieChart
} from 'lucide-react';
import toast from 'react-hot-toast';
import './ScoreFlow.css';

const SEMESTER_THEMES = [
  'sem-theme-purple',
  'sem-theme-cyan',
  'sem-theme-rose',
  'sem-theme-emerald',
  'sem-theme-amber',
  'sem-theme-orange',
  'sem-theme-teal',
  'sem-theme-magenta'
];

export default function ScoreFlow() {
  const { userData, currentUser, isLoading, scoreFlowData, saveScoreFlowData } = useAuth();
  const navigate = useNavigate();

  // Navigation tab for Score Flow page: "timeline" vs "vtop"
  const [activeTab, setActiveTab] = useState('timeline');

  // VTOP paste input state
  const [pastedText, setPastedText] = useState('');
  const [vtopData, setVtopData] = useState(() => {
    // Prefer backend data from AuthContext, fallback to localStorage
    if (scoreFlowData) return scoreFlowData;
    const saved = localStorage.getItem('vtop_imported_data');
    return saved ? JSON.parse(saved) : null;
  });
  const [isSubjectsExpanded, setIsSubjectsExpanded] = useState(true);

  // Sync vtopData when scoreFlowData arrives from backend (e.g. after login)
  useEffect(() => {
    if (scoreFlowData && !vtopData) {
      setVtopData(scoreFlowData);
    }
  }, [scoreFlowData]);

  // VTOP table filter states
  const [vtopSearch, setVtopSearch] = useState('');
  const [vtopCategoryFilter, setVtopCategoryFilter] = useState('all');
  const [vtopDistFilter, setVtopDistFilter] = useState('all');
  const [vtopGradeFilter, setVtopGradeFilter] = useState('all');
  const [vtopCreditFilter, setVtopCreditFilter] = useState('all');

  // Extract unique distributions dynamically
  const uniqueDistributions = useMemo(() => {
    if (!vtopData || !vtopData.subjects) return [];
    const distSet = new Set(vtopData.subjects.map(s => s.distribution).filter(Boolean));
    return Array.from(distSet);
  }, [vtopData]);

  // Extract unique grades dynamically
  const uniqueGrades = useMemo(() => {
    if (!vtopData || !vtopData.subjects) return [];
    const gradeSet = new Set(vtopData.subjects.map(s => s.grade).filter(Boolean));
    return Array.from(gradeSet).sort();
  }, [vtopData]);

  // Extract unique credits dynamically
  const uniqueCredits = useMemo(() => {
    if (!vtopData || !vtopData.subjects) return [];
    const creditsSet = new Set(vtopData.subjects.map(s => s.credits).filter(c => typeof c === 'number'));
    return Array.from(creditsSet).sort((a, b) => a - b);
  }, [vtopData]);

  // Filtered VTOP subjects array with preserved original indices
  const filteredVtopSubjects = useMemo(() => {
    if (!vtopData || !vtopData.subjects) return [];
    
    return vtopData.subjects
      .map((sub, originalIndex) => ({ ...sub, originalIndex }))
      .filter(sub => {
        // 1. Search term match
        const query = vtopSearch.toLowerCase().trim();
        const matchesSearch = !query || 
          sub.code.toLowerCase().includes(query) || 
          sub.title.toLowerCase().includes(query);
        
        // 2. Category match
        let matchesCategory = true;
        if (vtopCategoryFilter === 'graded') {
          matchesCategory = sub.category === 'graded';
        } else if (vtopCategoryFilter === 'ngcr') {
          matchesCategory = sub.category === 'ngcr';
        } else if (vtopCategoryFilter === 'excluded') {
          matchesCategory = sub.category === 'excluded';
        }
        
        // 3. Distribution match
        const matchesDist = vtopDistFilter === 'all' || sub.distribution === vtopDistFilter;
        
        // 4. Grade match
        const matchesGrade = vtopGradeFilter === 'all' || sub.grade === vtopGradeFilter;

        // 5. Credit match
        const matchesCredit = vtopCreditFilter === 'all' || sub.credits === parseFloat(vtopCreditFilter);
        
        return matchesSearch && matchesCategory && matchesDist && matchesGrade && matchesCredit;
      });
  }, [vtopData, vtopSearch, vtopCategoryFilter, vtopDistFilter, vtopGradeFilter, vtopCreditFilter]);

  // Load semesters from userData
  const semesters = useMemo(() => {
    return userData?.overall?.semesters || [];
  }, [userData]);

  const activeSems = useMemo(() => {
    return semesters.filter(s => s.isIncluded !== false);
  }, [semesters]);

  const hasTimelineData = activeSems.length > 0;

  // Compute Overall KPI Metrics for Dashboard Timeline
  const timelineMetrics = useMemo(() => {
    if (!hasTimelineData) return { cgpa: 0, totalCredits: 0, totalSubjects: 0, gradeDistribution: {} };

    let totalCredits = 0;
    let totalWeightedPoints = 0;
    let totalSubjects = 0;
    const gradeDistribution = { S: 0, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };

    activeSems.forEach(sem => {
      const gpa = getSemesterGPA(sem);
      const credits = getSemesterCredits(sem);
      totalCredits += credits;
      totalWeightedPoints += gpa * credits;

      if (sem.mode === 'detailed' && Array.isArray(sem.subjects)) {
        sem.subjects.forEach(sub => {
          totalSubjects += 1;
          const grade = sub.grade?.toUpperCase();
          if (gradeDistribution[grade] !== undefined) {
            gradeDistribution[grade] += 1;
          }
        });
      }
    });

    const cgpa = totalCredits === 0 ? 0 : totalWeightedPoints / totalCredits;

    return {
      cgpa,
      totalCredits,
      totalSubjects,
      gradeDistribution
    };
  }, [activeSems, hasTimelineData]);

  // Compute grade percentages for timeline ratio bar
  const timelineGradePercentages = useMemo(() => {
    const totalDetailedSubjects = Object.values(timelineMetrics.gradeDistribution).reduce((a, b) => a + b, 0);
    if (totalDetailedSubjects === 0) return [];
    
    return Object.entries(timelineMetrics.gradeDistribution)
      .map(([grade, count]) => ({
        grade,
        count,
        percentage: (count / totalDetailedSubjects) * 100
      }))
      .filter(item => item.count > 0);
  }, [timelineMetrics.gradeDistribution]);

  // Scroll to a semester section
  const scrollToSemester = (id) => {
    const element = document.getElementById(`sem-section-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('highlight-flash');
      setTimeout(() => {
        element.classList.remove('highlight-flash');
      }, 1500);
    }
  };

  // Helper to color GPA badges
  const getGpaColorClass = (gpa) => {
    if (gpa >= 9.0) return 'gpa-excellent';
    if (gpa >= 8.0) return 'gpa-good';
    if (gpa >= 7.0) return 'gpa-average';
    return 'gpa-poor';
  };

  // Robust VTOP parsing function
  const handleImportVTOP = () => {
    if (!pastedText.trim()) {
      toast.error('Please paste your VTOP result table first.');
      return;
    }

    const rows = pastedText.split('\n');
    const subjects = [];
    let totalGradedCredits = 0;
    let totalGradePoints = 0;
    let totalNgcrCredits = 0;
    let totalOverallCredits = 0;

    const GRADE_VALS = { S: 10, A: 9, B: 8, C: 7, D: 6, E: 5, F: 0 };

    rows.forEach(row => {
      const trimmed = row.trim();
      if (!trimmed) return;

      // Split by tabs or multiple spaces
      const cols = trimmed.split(/\t| {2,}/).map(c => c.trim()).filter(Boolean);
      if (cols.length < 5) return; // Skip malformed rows

      // Ignore header rows
      if (cols.some(c => c.toLowerCase().includes('course code') || c.toLowerCase().includes('sl.no') || c.toLowerCase().includes('course title'))) {
        return;
      }

      // Check if first column is numeric Sl.No, if so, shift starting index
      let startIndex = 0;
      if (/^\d+$/.test(cols[0])) {
        startIndex = 1;
      }

      const code = cols[startIndex];
      const title = cols[startIndex + 1];
      const type = cols[startIndex + 2];
      const creditsStr = cols[startIndex + 3];
      const grade = cols[startIndex + 4]?.toUpperCase();
      
      // Course distribution is typically the last column
      const distribution = cols[cols.length - 1] || 'General';

      if (!code || !title || !creditsStr || !grade) return;

      const credits = parseFloat(creditsStr);
      if (isNaN(credits) || credits < 0) return;

      // Classification
      const isForceExcluded = title.trim().toLowerCase() === "effective english communication";
      const isNgcr = grade === 'P' || grade === 'PASS' || distribution === 'NGCR';
      
      let category = 'graded';
      if (isForceExcluded) {
        category = 'excluded';
      } else if (isNgcr) {
        category = 'ngcr';
      }

      subjects.push({
        code,
        title,
        credits,
        grade,
        type,
        category,
        distribution
      });

      totalOverallCredits += credits;
      if (category === 'excluded') {
        totalNgcrCredits += credits; // Track under total non-graded credits or just excluded
      } else if (category === 'ngcr') {
        totalNgcrCredits += credits;
      } else {
        const gp = GRADE_VALS[grade];
        if (gp !== undefined) {
          totalGradedCredits += credits;
          totalGradePoints += credits * gp;
        }
      }
    });

    if (subjects.length === 0) {
      toast.error('Could not parse any valid subjects. Check your column headers and copy again.');
      return;
    }

    const cgpa = totalGradedCredits === 0 ? 0 : totalGradePoints / totalGradedCredits;
    
    // Count exact excluded credits
    const excludedCredits = subjects
      .filter(s => s.category === 'excluded')
      .reduce((sum, s) => sum + s.credits, 0);

    const finalData = {
      name: "All Sems",
      cgpa,
      originalCgpa: cgpa,
      totalCredits: totalOverallCredits,
      gradedCredits: totalGradedCredits,
      ngcrCredits: totalNgcrCredits - excludedCredits, // separate NGCR from excluded
      excludedCredits,
      subjects
    };

    setVtopData(finalData);
    localStorage.setItem('vtop_imported_data', JSON.stringify(finalData));
    saveScoreFlowData(finalData);
    toast.success('Results Imported Successfully! ⚡');
    setPastedText('');
  };

  const handleResetVTOP = () => {
    if (window.confirm('Are you sure you want to clear the imported VTOP data?')) {
      setVtopData(null);
      localStorage.removeItem('vtop_imported_data');
      toast.success('Imported results cleared.');
    }
  };

  const handleGradeChange = (index, newGrade) => {
    if (!vtopData) return;

    // Map and update the specific subject
    const updatedSubjects = vtopData.subjects.map((sub, idx) => {
      if (idx !== index) return sub;

      const isForceExcluded = sub.title.trim().toLowerCase() === "effective english communication";
      let category = sub.category;
      if (isForceExcluded) {
        category = 'excluded';
      } else {
        const isNgcr = newGrade === 'P' || sub.distribution === 'NGCR';
        category = isNgcr ? 'ngcr' : 'graded';
      }

      return {
        ...sub,
        grade: newGrade,
        category
      };
    });

    // Re-calculate metrics
    let totalGradedCredits = 0;
    let totalGradePoints = 0;
    let totalNgcrCredits = 0;
    let totalExcludedCredits = 0;
    let totalOverallCredits = 0;

    const GRADE_VALS = { S: 10, A: 9, B: 8, C: 7, D: 6, E: 5, F: 0 };

    updatedSubjects.forEach(sub => {
      totalOverallCredits += sub.credits;
      if (sub.category === 'excluded') {
        totalExcludedCredits += sub.credits;
      } else if (sub.category === 'ngcr') {
        totalNgcrCredits += sub.credits;
      } else {
        const gp = GRADE_VALS[sub.grade];
        if (gp !== undefined) {
          totalGradedCredits += sub.credits;
          totalGradePoints += sub.credits * gp;
        }
      }
    });

    const cgpa = totalGradedCredits === 0 ? 0 : totalGradePoints / totalGradedCredits;

    const updatedData = {
      ...vtopData,
      cgpa,
      totalCredits: totalOverallCredits,
      gradedCredits: totalGradedCredits,
      ngcrCredits: totalNgcrCredits,
      excludedCredits: totalExcludedCredits,
      subjects: updatedSubjects
    };

    setVtopData(updatedData);
    localStorage.setItem('vtop_imported_data', JSON.stringify(updatedData));
    toast.success(`Grade updated to ${newGrade}! ⚡`, { id: 'grade-update-toast' });
  };

  const handleToggleCategory = (index) => {
    if (!vtopData) return;

    const targetSub = vtopData.subjects[index];
    if (targetSub.title.trim().toLowerCase() === "effective english communication") {
      toast.error('"Effective English Communication" is permanently excluded from CGPA.');
      return;
    }

    const updatedSubjects = vtopData.subjects.map((sub, idx) => {
      if (idx !== index) return sub;

      const newCategory = sub.category === 'ngcr' ? 'graded' : 'ngcr';
      return {
        ...sub,
        category: newCategory
      };
    });

    // Re-calculate metrics
    let totalGradedCredits = 0;
    let totalGradePoints = 0;
    let totalNgcrCredits = 0;
    let totalExcludedCredits = 0;
    let totalOverallCredits = 0;

    const GRADE_VALS = { S: 10, A: 9, B: 8, C: 7, D: 6, E: 5, F: 0 };

    updatedSubjects.forEach(sub => {
      totalOverallCredits += sub.credits;
      if (sub.category === 'excluded') {
        totalExcludedCredits += sub.credits;
      } else if (sub.category === 'ngcr') {
        totalNgcrCredits += sub.credits;
      } else {
        const gp = GRADE_VALS[sub.grade];
        if (gp !== undefined) {
          totalGradedCredits += sub.credits;
          totalGradePoints += sub.credits * gp;
        }
      }
    });

    const cgpa = totalGradedCredits === 0 ? 0 : totalGradePoints / totalGradedCredits;

    const updatedData = {
      ...vtopData,
      cgpa,
      totalCredits: totalOverallCredits,
      gradedCredits: totalGradedCredits,
      ngcrCredits: totalNgcrCredits,
      excludedCredits: totalExcludedCredits,
      subjects: updatedSubjects
    };

    setVtopData(updatedData);
    localStorage.setItem('vtop_imported_data', JSON.stringify(updatedData));

    const wasGraded = updatedSubjects[index].category === 'graded';
    toast.success(
      wasGraded
        ? `${updatedSubjects[index].code} set to Graded (Included in CGPA)! 📈`
        : `${updatedSubjects[index].code} set to Not Graded (Excluded from CGPA)! 📉`,
      { id: 'category-toggle-toast' }
    );
  };

  // Group VTOP subjects by Course Distribution category
  const vtopDistributions = useMemo(() => {
    if (!vtopData || !vtopData.subjects) return {};
    
    const distMap = {};
    vtopData.subjects.forEach(sub => {
      const dist = sub.distribution || 'Other';
      if (!distMap[dist]) {
        distMap[dist] = { credits: 0, count: 0 };
      }
      distMap[dist].credits += sub.credits;
      distMap[dist].count += 1;
    });

    return distMap;
  }, [vtopData]);

  // Group VTOP subjects by Grade
  const vtopGradeDistributions = useMemo(() => {
    if (!vtopData || !vtopData.subjects) return {};
    
    const gradeMap = {};
    const sortedGrades = ['S', 'A', 'B', 'C', 'D', 'E', 'F', 'P'];
    sortedGrades.forEach(g => {
      gradeMap[g] = { credits: 0, count: 0 };
    });

    vtopData.subjects.forEach(sub => {
      const g = sub.grade?.toUpperCase() || 'F';
      if (gradeMap[g] !== undefined) {
        gradeMap[g].credits += sub.credits;
        gradeMap[g].count += 1;
      }
    });

    return gradeMap;
  }, [vtopData]);

  if (isLoading) {
    return (
      <div className="score-flow-loading">
        <h2 className="smooth-gradient-text animate-pulse">Syncing Score Flow...</h2>
      </div>
    );
  }

  return (
    <div className="score-flow-container saas-dashboard">
      {/* Back Header */}
      <div className="score-flow-header-actions">
        <button className="btn-back-dashboard" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        {activeTab === 'vtop' && vtopData && (
          <button className="btn-reset-vtop-header" onClick={handleResetVTOP}>
            <RefreshCw size={14} /> Reset & Import Different Results
          </button>
        )}
      </div>

      {/* Hero Banner */}
      <div className="score-flow-hero">
        <h1 className="score-flow-title">
          My <span className="smooth-gradient-text">Score Flow</span>
        </h1>
        <p className="score-flow-subtitle">
          Track your course classifications, grade maps, and overall timeline.
        </p>
      </div>

      {/* Page Tabs */}
      <div className="score-flow-tabs-bar">
        <button 
          className={`score-flow-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          <Layers size={16} /> Semester Timeline
        </button>
        <button 
          className={`score-flow-tab-btn ${activeTab === 'vtop' ? 'active' : ''}`}
          onClick={() => setActiveTab('vtop')}
        >
          <Upload size={16} /> VTOP Grade Importer
        </button>
      </div>

      {/* TAB CONTENT: TIMELINE */}
      {activeTab === 'timeline' && (
        <>
          {!hasTimelineData ? (
            <div className="score-flow-empty-card glass-panel animate-scale-in">
              <Layers size={48} className="empty-flow-icon" />
              <h3>No Score Flow Data Available</h3>
              <p>
                You haven't added any semester data yet. Start tracking your grades on the dashboard to build your academic flow diagram.
              </p>
              <button className="btn-primary" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div className="score-flow-content">
              {/* KPI Metrics */}
              <div className="score-flow-metrics-grid">
                <div className="flow-kpi-card glass-panel animate-fade-in">
                  <div className="flow-kpi-header">
                    <Award size={20} className="kpi-icon-purple" />
                    <span>OVERALL CGPA</span>
                  </div>
                  <span className="flow-kpi-value">{timelineMetrics.cgpa.toFixed(2)}</span>
                  <p className="flow-kpi-desc">Weighted average across semesters</p>
                </div>

                <div className="flow-kpi-card glass-panel animate-fade-in">
                  <div className="flow-kpi-header">
                    <BookOpen size={20} className="kpi-icon-cyan" />
                    <span>CREDITS EARNED</span>
                  </div>
                  <span className="flow-kpi-value">{timelineMetrics.totalCredits}</span>
                  <p className="flow-kpi-desc">Total credits completed successfully</p>
                </div>

                <div className="flow-kpi-card glass-panel animate-fade-in">
                  <div className="flow-kpi-header">
                    <Activity size={20} className="kpi-icon-emerald" />
                    <span>COURSES TAKEN</span>
                  </div>
                  <span className="flow-kpi-value">{timelineMetrics.totalSubjects}</span>
                  <p className="flow-kpi-desc">Subjects in Detailed Entry mode</p>
                </div>
              </div>

              {/* Grade Proportions */}
              {timelineGradePercentages.length > 0 && (
                <div className="flow-ratio-section glass-panel">
                  <h3 className="flow-section-title">Grade Proportions</h3>
                  <div className="flow-ratio-bar-wrapper">
                    <div className="flow-ratio-bar">
                      {timelineGradePercentages.map((item) => (
                        <div 
                          key={item.grade}
                          className={`flow-ratio-segment segment-${item.grade.toLowerCase()}`}
                          style={{ width: `${item.percentage}%` }}
                          title={`${item.grade}: ${item.count} subjects (${item.percentage.toFixed(1)}%)`}
                        />
                      ))}
                    </div>
                    <div className="flow-ratio-legend">
                      {timelineGradePercentages.map((item) => (
                        <div key={item.grade} className="legend-item">
                          <span className={`legend-dot grade-${item.grade.toLowerCase()}`} />
                          <span className="legend-label">{item.grade}</span>
                          <span className="legend-val">({item.count})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Horizontal Map */}
              <div className="flow-timeline-map glass-panel">
                <h3 className="flow-section-title">Semester Flow Map</h3>
                <div className="flow-nodes-container">
                  {activeSems.map((sem, idx) => {
                    const gpa = getSemesterGPA(sem);
                    const credits = getSemesterCredits(sem);
                    const themeClass = SEMESTER_THEMES[idx % SEMESTER_THEMES.length];

                    return (
                      <React.Fragment key={sem.id}>
                        <div 
                          className={`flow-node-card ${themeClass}`}
                          onClick={() => scrollToSemester(sem.id)}
                          title={`Click to jump to ${sem.name}`}
                        >
                          <span className="flow-node-sem">{sem.name}</span>
                          <span className="flow-node-gpa">{gpa.toFixed(2)} GPA</span>
                          <span className="flow-node-credits">{credits} Credits</span>
                        </div>
                        {idx < activeSems.length - 1 && (
                          <div className="flow-node-connector">
                            <ChevronRight size={18} className="connector-arrow" />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Chronological Timeline List */}
              <div className="flow-details-section">
                <h3 className="flow-section-title">Detailed Academic Timeline</h3>
                <div className="flow-semesters-list">
                  {[...activeSems].reverse().map((sem, index) => {
                    const originalIdx = activeSems.length - 1 - index;
                    const gpa = getSemesterGPA(sem);
                    const credits = getSemesterCredits(sem);
                    const gpaColorClass = getGpaColorClass(gpa);
                    const themeClass = SEMESTER_THEMES[originalIdx % SEMESTER_THEMES.length];
                    const isDetailed = sem.mode === 'detailed';

                    return (
                      <div 
                        key={sem.id} 
                        id={`sem-section-${sem.id}`} 
                        className={`flow-semester-card glass-panel border-${themeClass}`}
                      >
                        <div className="flow-sem-card-header">
                          <div className="flow-sem-name-group">
                            <span className="flow-sem-badge">#{originalIdx + 1}</span>
                            <h4 className="flow-sem-name">{sem.name}</h4>
                          </div>
                          <div className="flow-sem-stats-group">
                            <div className={`flow-sem-gpa-badge ${gpaColorClass}`}>
                              {gpa.toFixed(2)} GPA
                            </div>
                            <div className="flow-sem-credits-badge">
                              {credits} Credits
                            </div>
                          </div>
                        </div>

                        <div className="flow-sem-body">
                          {isDetailed ? (
                            sem.subjects && sem.subjects.length > 0 ? (
                              <div className="flow-subjects-grid">
                                {sem.subjects.map((sub) => {
                                  const gradeVal = sub.grade?.toUpperCase() || 'F';
                                  return (
                                    <div key={sub.id} className="flow-subject-item-card">
                                      <div className="flow-sub-info">
                                        <span className="flow-sub-name" title={sub.name}>{sub.name || 'Untitled Subject'}</span>
                                        <span className="flow-sub-creds">{sub.credits} Credits</span>
                                      </div>
                                      <span className={`grade-badge-label grade-${gradeVal.toLowerCase()}`}>
                                        {gradeVal}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="flow-no-subjects">No subjects added for this semester.</p>
                            )
                          ) : (
                            <div className="flow-quick-mode-alert">
                              <p>Quick Entry Mode</p>
                              <span>GPA was entered manually for this semester. Subject-wise details are unavailable.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB CONTENT: VTOP IMPORTER */}
      {activeTab === 'vtop' && (
        <div className="vtop-importer-wrapper">
          {!vtopData ? (
            <div className="vtop-paste-card glass-panel animate-scale-in">
              <div className="vtop-paste-header">
                <Upload size={24} className="vtop-upload-icon" />
                <h3>Import Results from VTOP</h3>
                <p>
                  Copy the entire results table from the VTOP Grade History screen (including headers) and paste it below.
                </p>
              </div>

              <textarea 
                className="vtop-textarea"
                rows={8}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder='Import your grades in seconds:&#10; 
                • Open VTOP → Examination → Grade History
                • Copy your full "Effective Grades" table
                • Paste it here — we’ll handle the rest'
                />

              <div className="vtop-paste-actions">
                <button className="btn-primary vtop-import-btn" onClick={handleImportVTOP}>
                  Import Results
                </button>
              </div>
              <div className="vtop-hint-box">
                <Info size={14} className="vtop-hint-icon" />
                <span>We support raw pasted tables with columns separated by tabs or spaces. Malformed rows will be skipped safely.</span>
              </div>
            </div>
          ) : (
            <div className="vtop-dashboard-content animate-fade-in">
              {/* KPI Boards */}
              <div className="vtop-kpi-row">
                {/* CGPA radial gauge card */}
                {(() => {
                  const safeCgpa = typeof vtopData.cgpa === 'number' && !isNaN(vtopData.cgpa) ? vtopData.cgpa : 0;
                  const angle = 150 + (safeCgpa / 10) * 240;
                  const rad = (angle * Math.PI) / 180;
                  const dotCx = 50 + 44 * Math.cos(rad);
                  const dotCy = 50 + 44 * Math.sin(rad);

                  // Rating calculation
                  let ratingText = "Needs Improvement";
                  let RatingIcon = AlertTriangle;
                  let ratingThemeClass = "theme-amber";
                  if (safeCgpa >= 9) {
                    ratingText = "Outstanding";
                    RatingIcon = Star;
                    ratingThemeClass = "theme-emerald";
                  } else if (safeCgpa >= 8) {
                    ratingText = "Very Good";
                    RatingIcon = Star;
                    ratingThemeClass = "theme-purple";
                  } else if (safeCgpa >= 7) {
                    ratingText = "Good";
                    RatingIcon = ThumbsUp;
                    ratingThemeClass = "theme-cyan";
                  } else if (safeCgpa >= 6) {
                    ratingText = "Average";
                    RatingIcon = Info;
                    ratingThemeClass = "theme-slate";
                  }

                  // Difference vs original CGPA
                  const originalCGPA = vtopData.originalCgpa !== undefined ? vtopData.originalCgpa : safeCgpa;
                  const diff = safeCgpa - originalCGPA;

                  return (
                    <div className="vtop-kpi-card vtop-cgpa-card glass-panel">
                      <div className="cgpa-gauge-container">
                        <div className="cgpa-gauge-wrapper">
                          <svg className="cgpa-radial-svg" viewBox="0 0 100 100">
                            <defs>
                              <linearGradient id="cgpaGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#7c3aed" />
                                <stop offset="50%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#60a5fa" />
                              </linearGradient>
                            </defs>
                            {/* Background track */}
                            <circle 
                              cx="50" 
                              cy="50" 
                              r="44" 
                              fill="none" 
                              stroke="var(--cgpa-track-color, rgba(255, 255, 255, 0.08))" 
                              strokeWidth="6" 
                              strokeDasharray="184.3 276.5" 
                              strokeLinecap="round" 
                              transform="rotate(150 50 50)" 
                              className="cgpa-radial-track"
                            />
                            {/* Progress arc */}
                            <circle 
                              cx="50" 
                              cy="50" 
                              r="44" 
                              fill="none" 
                              stroke="url(#cgpaGradient)" 
                              strokeWidth="6" 
                              strokeDasharray={`${(safeCgpa / 10) * 184.3} 276.5`} 
                              strokeLinecap="round" 
                              transform="rotate(150 50 50)" 
                              className="cgpa-radial-progress"
                            />
                            {/* Interactive marker dot */}
                            <circle 
                              cx={dotCx} 
                              cy={dotCy} 
                              r="4.5" 
                              fill="#ffffff" 
                              stroke="#8b5cf6" 
                              strokeWidth="2.5" 
                              className="cgpa-radial-dot"
                            />
                          </svg>
                          <div className="cgpa-gauge-label">
                            <span className="cgpa-gauge-val">{safeCgpa.toFixed(2)}</span>
                            <span className="cgpa-gauge-title">CGPA</span>
                          </div>
                          
                          {/* Arc end labels */}
                          <span className="cgpa-label-zero">0</span>
                          <span className="cgpa-label-ten">10</span>
                        </div>

                        {/* CGPA Status Badge inside card */}
                        <div className={`cgpa-rating-badge ${ratingThemeClass}`}>
                          <RatingIcon size={12} className="rating-badge-icon" />
                          <span>{ratingText}</span>
                        </div>
                      </div>

                      {/* CGPA Comparison Update Pill */}
                      <div className="cgpa-comparison-section">
                        {diff > 0 ? (
                          <div className="cgpa-diff-pill is-positive">
                            <span>▲ {diff.toFixed(2)} vs original</span>
                          </div>
                        ) : diff < 0 ? (
                          <div className="cgpa-diff-pill is-negative">
                            <span>▼ {Math.abs(diff).toFixed(2)} vs original</span>
                          </div>
                        ) : (
                          <div className="cgpa-diff-pill is-neutral">
                            <span>• No change vs original</span>
                          </div>
                        )}
                        <span className="cgpa-last-updated">Last updated: Today</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Credits distribution details */}
                <div className="vtop-kpi-card vtop-credits-card glass-panel">
                  <div className="vtop-credits-card-inner">
                    <div className="vtop-credits-stats">
                      {/* Graded Credits */}
                      <div className="credits-stat-item-premium">
                        <div className="stat-icon-wrapper theme-purple">
                          <BookOpen size={18} />
                        </div>
                        <div className="stat-info-group">
                          <span className="credits-stat-lbl">Graded Credits</span>
                          <span className="credits-stat-val val-purple">{vtopData.gradedCredits || 0}</span>
                          <span className="credits-stat-pct">
                            {vtopData.totalCredits > 0 ? ((vtopData.gradedCredits / vtopData.totalCredits) * 100).toFixed(1) : 0}% of total
                          </span>
                        </div>
                      </div>

                      <div className="credits-divider-vertical" />

                      {/* Non-Graded Credits */}
                      <div className="credits-stat-item-premium">
                        <div className="stat-icon-wrapper theme-cyan">
                          <Award size={18} />
                        </div>
                        <div className="stat-info-group">
                          <span className="credits-stat-lbl">Non-Graded (NGCR)</span>
                          <span className="credits-stat-val val-cyan">{vtopData.ngcrCredits || 0}</span>
                          <span className="credits-stat-pct">
                            {vtopData.totalCredits > 0 ? ((vtopData.ngcrCredits / vtopData.totalCredits) * 100).toFixed(1) : 0}% of total
                          </span>
                        </div>
                      </div>

                      {vtopData.excludedCredits > 0 && (
                        <>
                          <div className="credits-divider-vertical" />

                          {/* Excluded Credits */}
                          <div className="credits-stat-item-premium">
                            <div className="stat-icon-wrapper theme-amber">
                              <AlertTriangle size={18} />
                            </div>
                            <div className="stat-info-group">
                              <span className="credits-stat-lbl">Excluded Credits</span>
                              <span className="credits-stat-val val-amber">{vtopData.excludedCredits}</span>
                              <span className="credits-stat-pct">
                                {vtopData.totalCredits > 0 ? ((vtopData.excludedCredits / vtopData.totalCredits) * 100).toFixed(1) : 0}% of total
                              </span>
                            </div>
                          </div>
                        </>
                      )}

                      <div className="credits-divider-vertical" />

                      {/* Total Credits */}
                      <div className="credits-stat-item-premium">
                        <div className="stat-icon-wrapper theme-slate">
                          <Layers size={18} />
                        </div>
                        <div className="stat-info-group">
                          <span className="credits-stat-lbl">Total Credits</span>
                          <span className="credits-stat-val val-white">{vtopData.totalCredits || 0}</span>
                          <span className="credits-stat-pct">100%</span>
                        </div>
                      </div>
                    </div>

                    <div className="vtop-credits-table-divider" />

                    <div className="vtop-credits-distribution-table">
                      <div className="dist-table-header">Category Course &amp; Credit Summary</div>
                      <div className="dist-table-grid">
                        {(() => {
                          const getCatTheme = (name) => {
                            const clean = name.trim().toUpperCase();
                            if (clean === 'FC') return 'cat-purple';
                            if (clean === 'BC') return 'cat-cyan';
                            if (clean === 'DC') return 'cat-emerald';
                            if (clean === 'DLEC') return 'cat-rose';
                            if (clean === 'OE') return 'cat-amber';
                            if (clean === 'NGCR') return 'cat-blue';
                            return 'cat-slate';
                          };

                          return Object.entries(vtopDistributions)
                            .filter(([_, stats]) => stats.count > 0)
                            .map(([cat, stats]) => {
                              const themeClass = getCatTheme(cat);
                              return (
                                <div key={cat} className={`dist-table-col ${themeClass}`}>
                                  <div className="dist-col-header">
                                    <span className="dist-col-lbl">{cat}</span>
                                    <span className="dist-col-dot" />
                                  </div>
                                  <span className="dist-col-val">
                                    {stats.credits} <span className="dist-col-unit">Credits</span>
                                  </span>
                                  <div className="dist-col-badge-wrapper">
                                    <span className="dist-col-badge">
                                      {stats.count} {stats.count === 1 ? 'course' : 'courses'}
                                    </span>
                                  </div>
                                </div>
                              );
                            });
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Distribution Analytics Tabs Panel */}
              <div className="vtop-analytics-section glass-panel">
                <div className="vtop-analytics-header">
                  <div className="vtop-analytics-header-left">
                    <div className="vtop-analytics-icon-wrapper">
                      <GraduationCap size={22} />
                    </div>
                    <h3 className="flow-section-title">Academic Analytics</h3>
                  </div>
                  <span className="flow-section-subtitle">Overview of your academic performance across all courses</span>
                </div>

                <div className="vtop-analytics-content">
                  <div className="vtop-dist-grid-compact animate-fade-in">
                    {Object.entries(vtopGradeDistributions).map(([grade, stats]) => {
                      const percentage = vtopData.totalCredits > 0 ? (stats.credits / vtopData.totalCredits) * 100 : 0;
                      return (
                        <div key={grade} className={`vtop-analytics-card-premium-mini theme-${grade.toLowerCase()} glass-panel`}>
                          <div className="vtop-analytics-card-badge-mini">
                            <Award size={10} />
                          </div>
                          <div className="vtop-analytics-card-main-mini">
                            <div className="vtop-analytics-card-left-mini">
                              <div className="vtop-analytics-card-circle-mini">
                                <span>{grade}</span>
                              </div>
                            </div>
                            <div className="vtop-analytics-card-right-mini">
                              <div className="vtop-analytics-card-stat-mini">
                                <span className="vtop-analytics-card-val-mini">{stats.credits}</span>
                                <span className="vtop-analytics-card-lbl-mini">Credits</span>
                              </div>
                              <div className="vtop-analytics-card-stat-mini">
                                <span className="vtop-analytics-card-val-mini">{stats.count}</span>
                                <span className="vtop-analytics-card-lbl-mini">{stats.count === 1 ? 'Subject' : 'Subjects'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="vtop-analytics-progress-wrapper-mini">
                            <div className="vtop-analytics-progress-bar-mini" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Subjects List */}
              <div className="vtop-subjects-list-section glass-panel">
                <div className="vtop-list-header" onClick={() => setIsSubjectsExpanded(!isSubjectsExpanded)}>
                  <div className="vtop-list-title-group">
                    <Activity size={18} className="vtop-title-icon" />
                    <span>Imported Course Log ({vtopData.subjects.length} Subjects)</span>
                  </div>
                  <button className="vtop-expand-btn">
                    {isSubjectsExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>

                {isSubjectsExpanded && (
                  <div className="vtop-list-expanded-content">
                    <div className="vtop-list-table-wrapper">
                      <table className="vtop-subjects-table">
                        <thead>
                          <tr>
                            <th style={{ width: '12%' }}>Code</th>
                            <th style={{ width: '38%' }}>Course Title</th>
                            <th style={{ width: '10%' }}>Credits</th>
                            <th style={{ width: '15%' }}>Category</th>
                            <th style={{ width: '15%' }}>Distribution</th>
                            <th className="text-center" style={{ width: '10%' }}>Grade</th>
                          </tr>
                          <tr className="vtop-filter-row">
                            <th colSpan={2}>
                              <div className="vtop-search-wrapper">
                                <Search size={14} className="vtop-search-icon" />
                                <input 
                                  type="text"
                                  placeholder="Search code or title..."
                                  value={vtopSearch}
                                  onChange={(e) => setVtopSearch(e.target.value)}
                                  className="vtop-filter-search"
                                />
                              </div>
                            </th>
                            <th>
                              <select 
                                value={vtopCreditFilter}
                                onChange={(e) => setVtopCreditFilter(e.target.value)}
                                className="vtop-filter-select"
                              >
                                <option value="all">Credits</option>
                                {uniqueCredits.map(c => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                            </th>
                            <th>
                              <select 
                                value={vtopCategoryFilter}
                                onChange={(e) => setVtopCategoryFilter(e.target.value)}
                                className="vtop-filter-select"
                              >
                                <option value="all">Category</option>
                                <option value="graded">Graded</option>
                                <option value="ngcr">Not Graded</option>
                                <option value="excluded">Force-Excluded</option>
                              </select>
                            </th>
                            <th>
                              <select 
                                value={vtopDistFilter}
                                onChange={(e) => setVtopDistFilter(e.target.value)}
                                className="vtop-filter-select"
                              >
                                <option value="all">Distribution</option>
                                {uniqueDistributions.map(d => (
                                  <option key={d} value={d}>{d}</option>
                                ))}
                              </select>
                            </th>
                            <th className="text-center">
                              <select 
                                value={vtopGradeFilter}
                                onChange={(e) => setVtopGradeFilter(e.target.value)}
                                className="vtop-filter-select"
                              >
                                <option value="all">Grade</option>
                                {uniqueGrades.map(g => (
                                  <option key={g} value={g}>{g}</option>
                                ))}
                              </select>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredVtopSubjects.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="vtop-empty-filter-cell">
                                <div className="vtop-empty-filter-content">
                                  <Search size={28} className="empty-search-icon" />
                                  <p>No subjects match the selected filters.</p>
                                  <button 
                                    className="btn-clear-filters"
                                    onClick={() => {
                                      setVtopSearch('');
                                      setVtopCategoryFilter('all');
                                      setVtopDistFilter('all');
                                      setVtopGradeFilter('all');
                                      setVtopCreditFilter('all');
                                    }}
                                  >
                                    Reset Filters
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            filteredVtopSubjects.map((sub, idx) => {
                              const isNgcr = sub.category === 'ngcr';
                              const isExcluded = sub.category === 'excluded';
                              
                              return (
                                <tr 
                                  key={idx} 
                                  className={`vtop-subject-row ${isNgcr || isExcluded ? 'row-ngcr-grade' : ''}`}
                                >
                                  <td className="vtop-cell-code">{sub.code}</td>
                                  <td className="vtop-cell-title">
                                    <div className="title-text-group">
                                      <span className="sub-title-main">{sub.title}</span>
                                      <span className="sub-type-badge">{sub.type}</span>
                                    </div>
                                  </td>
                                  <td>{sub.credits}</td>
                                  <td>
                                    {isExcluded ? (
                                      <span className="vtop-badge-category category-excluded">Force-Excluded</span>
                                    ) : isNgcr ? (
                                      <button
                                        type="button"
                                        onClick={() => handleToggleCategory(sub.originalIndex)}
                                        className="vtop-category-toggle-btn is-ngcr"
                                        title="Click to toggle CGPA calculation inclusion"
                                      >
                                        Not Graded
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => handleToggleCategory(sub.originalIndex)}
                                        className="vtop-category-toggle-btn is-graded"
                                        title="Click to toggle CGPA calculation inclusion"
                                      >
                                        Graded
                                      </button>
                                    )}
                                  </td>
                                  <td className="vtop-cell-dist">
                                    <span className="vtop-dist-label">{sub.distribution}</span>
                                  </td>
                                  <td className="text-center">
                                    <div className="grade-badge-cell-group">
                                      <select
                                        value={sub.grade}
                                        onChange={(e) => handleGradeChange(sub.originalIndex, e.target.value)}
                                        className={`vtop-grade-select grade-${sub.grade.toLowerCase()}`}
                                        title="Click to change grade"
                                      >
                                        {!['S', 'A', 'B', 'C', 'D', 'E', 'F', 'P'].includes(sub.grade) && (
                                          <option value={sub.grade}>{sub.grade}</option>
                                        )}
                                        <option value="S">S</option>
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="C">C</option>
                                        <option value="D">D</option>
                                        <option value="E">E</option>
                                        <option value="F">F</option>
                                        <option value="P">P</option>
                                      </select>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
