import React, { useState, useMemo, useEffect } from 'react';
import { FlaskConical, Plus, Trash2, ArrowUp, ArrowDown, Minus, ArrowRight, Info, BookOpen, Layers, Star, Target, UploadCloud, Loader2, Sparkles, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { scanImageForSubjects } from '../utils/ocrParser';
import { parseVtopText, parseVtopTimetable, parseVTOPData } from '../utils/vtopParser';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import AnimatedNumber from './AnimatedNumber';
import './GradeSimulator.css';

const GRADE_MAP = { S: 10, A: 9, B: 8, C: 7, D: 6, E: 5, F: 0 };
const GRADE_OPTIONS = Object.keys(GRADE_MAP);

function createSubject(name = '', credits = 3, grade = 'B') {
  return { id: crypto.randomUUID(), name, credits, grade, simGrade: grade };
}

const computeGPA = (subjects, gradeField) => {
  let totalCredits = 0;
  let totalPoints = 0;
  subjects.forEach(s => {
    const c = Number(s.credits);
    const g = GRADE_MAP[s[gradeField]];
    if (c > 0 && g !== undefined) {
      totalCredits += c;
      totalPoints += c * g;
    }
  });
  return totalCredits === 0 ? 0 : totalPoints / totalCredits;
};

export default function GradeSimulator() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const { simulatorData, saveSimulatorData } = useAuth();

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isAutofillModalOpen, setIsAutofillModalOpen] = useState(false);
  const [autofillTab, setAutofillTab] = useState('timetable'); // 'timetable', 'vtop', or 'ocr'
  const [vtopText, setVtopText] = useState('');
  const [timetableText, setTimetableText] = useState('');
  const [replaceSubjects, setReplaceSubjects] = useState(true);

  const handleTimetableAutofill = () => {
    if (!timetableText.trim()) {
      toast.error("Please paste your VTOP registration or timetable text first!");
      return;
    }

    try {
      const isRegistrationText = /([A-Z]{4}\d{3}[A-Z])\s*-\s*(.+)/.test(timetableText);
      const parsed = isRegistrationText
        ? parseVTOPData(timetableText)
        : parseVtopTimetable(timetableText);

      if (parsed.length === 0) {
        toast.error("No valid subjects detected. Please make sure the format is correct.");
        return;
      }

      const newMapped = parsed.map(s => createSubject(s.name, Number(s.credits) || 3, s.grade || 'B'));

      if (replaceSubjects) {
        setSubjects(newMapped);
      } else {
        const existingNames = new Set(subjects.map(s => s.name.trim().toLowerCase()));
        const uniqueNew = [];
        newMapped.forEach(s => {
          if (!existingNames.has(s.name.trim().toLowerCase())) {
            existingNames.add(s.name.trim().toLowerCase());
            uniqueNew.push(s);
          }
        });
        setSubjects(prev => [...prev, ...uniqueNew]);
      }

      toast.success("Subjects loaded successfully 🚀");
      setIsAutofillModalOpen(false);
      setTimetableText('');
    } catch (err) {
      toast.error("Failed to parse VTOP text: " + err.message);
    }
  };

  const handleVtopAutofill = () => {
    if (!vtopText.trim()) {
      toast.error("Please paste your VTOP grade table first!");
      return;
    }

    try {
      const parsed = parseVtopText(vtopText);
      if (parsed.length === 0) {
        toast.error("No valid subjects detected. Please make sure the table format is correct and contains valid grades (S, A, B, C, D, E, F, N).");
        return;
      }

      const newMapped = parsed.map(s => {
        const g = (s.grade === 'N' || !s.grade) ? 'B' : s.grade;
        return createSubject(s.name, Number(s.credits) || 3, g);
      });

      if (replaceSubjects) {
        setSubjects(newMapped);
      } else {
        const existingNames = new Set(subjects.map(s => s.name.trim().toLowerCase()));
        const uniqueNew = [];
        newMapped.forEach(s => {
          if (!existingNames.has(s.name.trim().toLowerCase())) {
            existingNames.add(s.name.trim().toLowerCase());
            uniqueNew.push(s);
          }
        });
        setSubjects(prev => [...prev, ...uniqueNew]);
      }

      toast.success("Subjects auto-filled successfully 🚀");
      setIsAutofillModalOpen(false);
      setVtopText('');
    } catch (err) {
      toast.error("Failed to parse VTOP text: " + err.message);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    try {
      setIsScanning(true);
      setScanProgress(0);
      let allExtractedSubjects = [];
      const numFiles = files.length;
      for (let i = 0; i < numFiles; i++) {
        const file = files[i];
        const extracted = await scanImageForSubjects(file, (progress) => {
          setScanProgress(Math.round(((i * 100) + progress) / numFiles));
        });
        allExtractedSubjects.push(...extracted);
      }
      if (allExtractedSubjects.length > 0) {
        const newMapped = allExtractedSubjects.map(s => {
          const g = (s.grade === 'N' || !s.grade) ? 'B' : s.grade;
          return createSubject(s.name, Number(s.credits) || 3, g);
        });

        if (replaceSubjects) {
          setSubjects(newMapped);
        } else {
          const existingNames = new Set(subjects.map(s => s.name.trim().toLowerCase()));
          const uniqueNew = [];
          newMapped.forEach(s => {
            if (!existingNames.has(s.name.trim().toLowerCase())) {
              existingNames.add(s.name.trim().toLowerCase());
              uniqueNew.push(s);
            }
          });
          setSubjects(prev => [...prev, ...uniqueNew]);
        }
        toast.success("Image scan completed successfully 🚀");
      } else {
        toast.error("Could not detect any clear subjects or credits. Please ensure the screenshot contains formal core course codes and distinct credits clearly.");
      }
    } catch (err) {
      toast.error("Error scanning image: " + err.message);
    } finally {
      setIsScanning(false);
      setScanProgress(0);
      e.target.value = null;
    }
  };

  const [subjects, setSubjects] = useState(() => {
    // If simulatorData is already loaded in Context, use it
    if (simulatorData && Array.isArray(simulatorData) && simulatorData.length > 0) {
      return simulatorData;
    }
    // Check localStorage cache
    const cacheKey = localStorage.getItem('isGuest') === 'true'
      ? 'whatif_simulator_data_guest'
      : 'whatif_simulator_data';
    const local = localStorage.getItem(cacheKey);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse cached simulator data', e);
      }
    }
    return [
      createSubject('Subject 1', 4, 'B'),
      createSubject('Subject 2', 3, 'C'),
      createSubject('Subject 3', 3, 'A'),
      createSubject('Subject 4', 1, 'B'),
    ];
  });

  // Sync state if context loads simulatorData asynchronously
  useEffect(() => {
    if (simulatorData && Array.isArray(simulatorData) && simulatorData.length > 0) {
      setSubjects(simulatorData);
    }
  }, [simulatorData]);

  // Auto-save changes back to backend/localStorage whenever subjects state changes
  useEffect(() => {
    saveSimulatorData(subjects);
  }, [subjects, saveSimulatorData]);

  const addSubject = () => {
    setSubjects(prev => [...prev, createSubject(`Subject ${prev.length + 1}`)]);
  };

  const removeSubject = (id) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  const updateSubject = (id, field, value) => {
    setSubjects(prev => prev.map(s => {
      if (s.id !== id) return s;
      const updated = { ...s, [field]: value };
      if (field === 'grade') updated.simGrade = value;
      return updated;
    }));
  };

  const bumpSimGrade = (id, direction) => {
    setSubjects(prev => prev.map(s => {
      if (s.id !== id) return s;
      const idx = GRADE_OPTIONS.indexOf(s.simGrade);
      const newIdx = idx + direction; // -1 = up (S is 0), +1 = down
      if (newIdx < 0 || newIdx >= GRADE_OPTIONS.length) return s;
      return { ...s, simGrade: GRADE_OPTIONS[newIdx] };
    }));
  };

  const updateSimGrade = (id, newGrade) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, simGrade: newGrade } : s));
  };

  const originalGPA = useMemo(() => computeGPA(subjects, 'grade'), [subjects]);
  const simulatedGPA = useMemo(() => computeGPA(subjects, 'simGrade'), [subjects]);
  const delta = simulatedGPA - originalGPA;

  const totalCredits = useMemo(() => subjects.reduce((sum, s) => sum + Number(s.credits), 0), [subjects]);
  const totalPoints = useMemo(() => subjects.reduce((sum, s) => sum + (Number(s.credits) * (GRADE_MAP[s.simGrade] || 0)), 0), [subjects]);

  return (
    <div className={`simulator-container animate-fade-in ${isLight ? 'bg-gray-50' : ''}`} style={{ minHeight: '100%' }}>
      {/* Premium SaaS GPA Hero Card */}
      <div
        className={`relative overflow-hidden p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 ${isLight ? 'bg-white border border-gray-200 shadow-sm' : 'border border-white/10 bg-slate-950/40 backdrop-blur-xl shadow-2xl'
          }`}
        style={{
          background: isLight ? '#ffffff' : 'linear-gradient(135deg, rgba(15, 23, 42, 0.6), rgba(17, 24, 39, 0.8))',
          border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: isLight ? 'none' : 'blur(16px)',
          borderRadius: '16px',
          position: 'relative',
          overflow: 'hidden',
          padding: '24px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px'
        }}
      >
        {/* Soft gradient glow behind simulated GPA */}
        {!isLight && (
          <>
            <div className="absolute pointer-events-none" style={{ position: 'absolute', right: '-80px', top: '-80px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08), transparent 70%)', pointerEvents: 'none' }} />
            <div className="absolute pointer-events-none" style={{ position: 'absolute', left: '-80px', bottom: '-80px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08), transparent 70%)', pointerEvents: 'none' }} />
          </>
        )}

        {/* GPA Comparison Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto', width: '100%', alignItems: 'center', gap: '20px', zIndex: 10, position: 'relative' }}>

          {/* 1. Original GPA */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: isLight ? '#64748b' : '#94a3b8' }}>Original GPA</span>
            <div style={{ position: 'relative' }}>
              <AnimatedNumber
                value={originalGPA}
                decimals={4}
                splitDecimals={true}
                style={{ fontSize: '46px', fontWeight: 600, color: isLight ? '#0f172a' : '#ffffff', fontFamily: "'Space Grotesk', sans-serif" }}
              />
              <div style={{ height: '2px', width: '100%', background: isLight ? 'linear-gradient(to right, #2563eb, transparent)' : 'linear-gradient(to right, #3b82f6, transparent)', marginTop: '4px', borderRadius: '4px' }} className="animate-pulse" />
            </div>
          </div>

          {/* 2. Center Arrow */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', backgroundColor: isLight ? '#f8fafc' : 'rgba(30, 41, 59, 0.6)', borderRadius: '50%', border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.05)', color: isLight ? '#64748b' : '#94a3b8' }}>
            <ArrowRight size={20} style={{ color: isLight ? '#2563eb' : '#60a5fa' }} />
          </div>

          {/* 3. Simulated GPA (Shifted Left) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', marginLeft: '-12px' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: isLight ? '#64748b' : '#94a3b8' }}>Simulated GPA</span>
            <div style={{ position: 'relative' }}>
              <div className={`${isLight ? 'bg-gray-100/80 border border-gray-200' : 'bg-black/20 backdrop-blur-sm'} shadow-sm`} style={{ padding: '6px 16px', borderRadius: '10px' }}>
                <AnimatedNumber
                  value={simulatedGPA}
                  decimals={4}
                  splitDecimals={true}
                  style={{ fontSize: '46px', fontWeight: 600, color: isLight ? '#0f172a' : '#ffffff', fontFamily: "'Space Grotesk', sans-serif" }}
                />
              </div>
              <div style={{ height: '2px', width: '100%', background: isLight ? 'linear-gradient(to right, transparent, #059669)' : 'linear-gradient(to right, transparent, #34d399)', marginTop: '4px', borderRadius: '4px' }} className="animate-pulse" />
            </div>
          </div>

          {/* 4. Delta / Impact */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.1)', paddingLeft: '24px' }}>

            {/* Glowing Circular Progress Ring Around Delta - Increased Size & Prominence */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '76px', height: '76px', backgroundColor: isLight ? '#f8fafc' : 'rgba(15, 23, 42, 0.4)', borderRadius: '50%', border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.05)', boxShadow: delta !== 0 && !isLight ? `0 0 20px ${delta > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}` : 'none' }}>
              <svg style={{ position: 'absolute', width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke={isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)"} strokeWidth="3" />
                <circle cx="18" cy="18" r="15" fill="none"
                  stroke={delta >= 0 ? (isLight ? "#059669" : "#10b981") : (isLight ? "#dc2626" : "#ef4444")}
                  strokeWidth="3"
                  strokeDasharray="94.2"
                  strokeDashoffset={94.2 - Math.min(94.2, Math.max(0, Math.abs(delta) * 94.2))}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.8s ease', filter: isLight ? 'none' : `drop-shadow(0 0 4px ${delta >= 0 ? '#10b981' : '#ef4444'})` }} />
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", fontVariantNumeric: 'tabular-nums', letterSpacing: '0.02em', color: delta > 0 ? (isLight ? '#059669' : '#34d399') : delta < 0 ? (isLight ? '#dc2626' : '#f87171') : (isLight ? '#64748b' : '#94a3b8'), textShadow: !isLight && delta !== 0 ? `0 0 10px ${delta > 0 ? 'rgba(52, 211, 153, 0.4)' : 'rgba(248, 113, 113, 0.4)'}` : 'none' }}>
                  {delta > 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2)}
                </span>
                <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: isLight ? '#94a3b8' : '#64748b', marginTop: '-2px' }}>Delta</span>
              </div>
            </div>

            {/* Quality Info */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: isLight ? '#475569' : '#cbd5e1' }}>Status</span>
                <span style={{
                  padding: '2px 8px',
                  fontSize: '9px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  borderRadius: '9999px',
                  letterSpacing: '0.5px',
                  background: delta > 0 ? (isLight ? '#e6f4ea' : 'rgba(16, 185, 129, 0.15)') : delta < 0 ? (isLight ? '#fce8e6' : 'rgba(239, 68, 68, 0.15)') : (isLight ? '#f1f5f9' : 'rgba(100, 116, 139, 0.15)'),
                  color: delta > 0 ? (isLight ? '#137333' : '#34d399') : delta < 0 ? (isLight ? '#c5221f' : '#f87171') : (isLight ? '#475569' : '#94a3b8'),
                  border: delta > 0 ? (isLight ? '1px solid #137333' : '1px solid rgba(16, 185, 129, 0.3)') : delta < 0 ? (isLight ? '1px solid #c5221f' : '1px solid rgba(239, 68, 68, 0.3)') : (isLight ? '1px solid #cbd5e1' : '1px solid rgba(100, 116, 139, 0.3)')
                }}>
                  {delta > 0 ? 'Improving' : delta < 0 ? 'Declining' : 'Stable'}
                </span>
              </div>
              <p style={{ fontSize: '11px', maxWidth: '160px', margin: '4px 0 0 0', color: isLight ? '#64748b' : '#94a3b8', lineHeight: 1.3 }}>
                {delta > 0 ? "Your simulation is ahead of your current GPA!" : delta < 0 ? "Simulated grades are below your current GPA." : "No simulator changes detected."}
              </p>
            </div>
          </div>

        </div>

      </div>



      {/* Subjects Table */}
      <div
        className={`simulator-table-section ${isLight ? 'bg-white border border-gray-200 shadow-sm' : 'glass-panel'}`}
        style={{
          padding: 0,
          overflow: 'hidden',
          backgroundColor: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.02)',
          border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px'
        }}
      >
        <div className="section-header" style={{ 
          padding: '20px 24px', 
          borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <h2 className={isLight ? 'text-gray-900' : ''} style={{ margin: 0 }}>Grade Simulation</h2>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {isScanning ? (
              <div className="sem-action-btn sem-btn-auto" style={{ opacity: 0.6, cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 16px', borderRadius: '10px' }}>
                <Loader2 size={16} className="animate-spin" /> Scanning ({scanProgress}%)
              </div>
            ) : (
              <button 
                className="sem-action-btn sem-btn-auto" 
                onClick={() => setIsAutofillModalOpen(true)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  fontSize: '13px', 
                  padding: '8px 16px', 
                  borderRadius: '10px',
                  cursor: 'pointer',
                  border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255,255,255,0.08)',
                  background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.02)',
                  color: isLight ? '#475569' : '#e2e8f0'
                }}
              >
                <Sparkles size={16} /> Auto-Fill
              </button>
            )}
          </div>
        </div>

        <div className="sim-table-responsive" style={{ padding: '0 24px' }}>
          <table className="sim-table">
            <thead>
              <tr style={{ borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)' }}>
                <th className={isLight ? 'text-gray-500 font-medium' : ''}>Subject</th>
                <th className={isLight ? 'text-gray-500 font-medium' : ''}>Credits</th>
                <th className={isLight ? 'text-gray-500 font-medium' : ''}>Actual Grade</th>
                <th className={isLight ? 'text-gray-500 font-medium' : ''}>Simulated Grade</th>
                <th className={isLight ? 'text-gray-500 font-medium' : ''}>Impact</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {subjects
                .map((sub) => {
                  const actualPts = Number(sub.credits) * (GRADE_MAP[sub.grade] || 0);
                  const simPts = Number(sub.credits) * (GRADE_MAP[sub.simGrade] || 0);
                  const pointsChange = simPts - actualPts;
                  const gpaImpact = totalCredits > 0 ? (pointsChange / totalCredits) : 0;
                  const changed = sub.grade !== sub.simGrade;
                  return { ...sub, gpaImpact, changed, pointsChange };
                })
                .sort((a, b) => Math.abs(b.gpaImpact) - Math.abs(a.gpaImpact))
                .map((sub) => {
                  const changed = sub.changed;
                  const gpaImpact = sub.gpaImpact;

                  return (
                    <tr
                      key={sub.id}
                      className={`animate-fade-in premium-sim-row ${changed ? 'sim-row-changed' : ''}`}
                      style={{ borderBottom: isLight ? '1px solid #f1f5f9' : '1px solid rgba(255, 255, 255, 0.04)' }}
                    >
                      <td data-label="Subject Name">
                        <input
                          type="text"
                          className={`input-field ${isLight ? 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100' : ''}`}
                          value={sub.name}
                          onChange={(e) => updateSubject(sub.id, 'name', e.target.value)}
                          placeholder="Subject Name"
                          style={{
                            background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.02)',
                            border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.05)',
                            padding: '10px 14px',
                            fontSize: '14px',
                            borderRadius: '10px',
                            height: '42px',
                            width: '100%',
                            color: isLight ? '#0f172a' : '#e5e7eb'
                          }}
                        />
                      </td>
                      <td data-label="Credits">
                        <input
                          type="number"
                          className={`input-field ${isLight ? 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100' : ''}`}
                          min="0"
                          step="0.5"
                          value={sub.credits}
                          onChange={(e) => updateSubject(sub.id, 'credits', e.target.value ? Number(e.target.value) : "")}
                          style={{
                            padding: '10px 14px',
                            textAlign: 'center',
                            background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.02)',
                            border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.05)',
                            fontSize: '14px',
                            borderRadius: '10px',
                            height: '42px',
                            width: '100%',
                            color: isLight ? '#0f172a' : '#e5e7eb'
                          }}
                        />
                      </td>
                      <td data-label="Actual Grade">
                        <select
                          className={`input-field ${isLight ? 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100' : ''}`}
                          value={sub.grade}
                          onChange={(e) => updateSubject(sub.id, 'grade', e.target.value)}
                          style={{
                            background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.02)',
                            border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.05)',
                            padding: '10px 14px',
                            fontSize: '14px',
                            borderRadius: '10px',
                            height: '42px',
                            width: '100%',
                            color: isLight ? '#0f172a' : '#e5e7eb'
                          }}
                        >
                          {GRADE_OPTIONS.map(g => (
                            <option
                              key={g}
                              value={g}
                              className="bg-white text-gray-900 dark:bg-slate-900 dark:text-white/80 dark:hover:bg-indigo-500/20 dark:hover:text-white"
                              style={{
                                backgroundColor: isLight ? '#ffffff' : '#0f172a',
                                color: isLight ? '#0f172a' : '#ffffff'
                              }}
                            >
                              {g} ({GRADE_MAP[g]})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td data-label="Simulated Grade">
                        <div className="sim-grade-control flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            className={`sim-bump-btn sim-bump-btn-glow ${isLight ? 'bg-gray-100 border-gray-300 text-gray-700' : ''}`}
                            onClick={() => bumpSimGrade(sub.id, -1)}
                            disabled={GRADE_OPTIONS.indexOf(sub.simGrade) === 0}
                            title="Increase grade"
                            style={{
                              backgroundColor: isLight ? '#f1f5f9' : 'var(--bg-input)',
                              borderColor: isLight ? '#cbd5e1' : 'var(--card-border)',
                              color: isLight ? '#334155' : 'var(--text-muted)'
                            }}
                          >
                            <ArrowUp size={16} />
                          </button>
                          <select
                            className={`input-field sim-grade-select-glow ${changed ? (isLight ? 'changed text-indigo-600 font-bold' : 'changed text-indigo-400 font-bold') : ''
                              } ${isLight ? 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100' : ''}`}
                            value={sub.simGrade}
                            onChange={(e) => updateSimGrade(sub.id, e.target.value)}
                            style={{
                              minWidth: '100px',
                              padding: '10px 24px 10px 14px',
                              fontSize: '14px',
                              fontWeight: '700',
                              borderRadius: '10px',
                              height: '42px',
                              cursor: 'pointer',
                              textAlign: 'center',
                              boxShadow: changed ? (isLight ? '0 0 10px rgba(79, 70, 229, 0.15)' : '0 0 12px rgba(99, 102, 241, 0.25)') : 'none',
                              borderColor: changed ? (isLight ? '#4f46e5' : 'var(--primary)') : (isLight ? '#cbd5e1' : 'var(--card-border)'),
                              background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.02)',
                              color: isLight ? '#0f172a' : '#e5e7eb'
                            }}
                          >
                            {GRADE_OPTIONS.map(g => (
                              <option
                                key={g}
                                value={g}
                                className="bg-white text-gray-900 dark:bg-slate-900 dark:text-white/80 dark:hover:bg-indigo-500/20 dark:hover:text-white"
                                style={{
                                  backgroundColor: isLight ? '#ffffff' : '#0f172a',
                                  color: isLight ? '#0f172a' : '#ffffff'
                                }}
                              >
                                {g} ({GRADE_MAP[g]})
                              </option>
                            ))}
                          </select>
                          <button
                            className={`sim-bump-btn sim-bump-btn-glow ${isLight ? 'bg-gray-100 border-gray-300 text-gray-700' : ''}`}
                            onClick={() => bumpSimGrade(sub.id, 1)}
                            disabled={GRADE_OPTIONS.indexOf(sub.simGrade) === GRADE_OPTIONS.length - 1}
                            title="Decrease grade"
                            style={{
                              backgroundColor: isLight ? '#f1f5f9' : 'var(--bg-input)',
                              borderColor: isLight ? '#cbd5e1' : 'var(--card-border)',
                              color: isLight ? '#334155' : 'var(--text-muted)'
                            }}
                          >
                            <ArrowDown size={16} />
                          </button>
                        </div>
                      </td>
                      <td data-label="GPA Impact" className="sim-impact-td">
                        {changed ? (
                          <span
                            className={`sim-impact ${gpaImpact > 0 ? 'positive' : gpaImpact < 0 ? 'negative' : ''}`}
                            style={{
                              fontWeight: '700',
                              fontSize: '14px',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              whiteSpace: 'nowrap',
                              display: 'inline-block',
                              backgroundColor: gpaImpact > 0 ? (isLight ? '#e6f4ea' : 'rgba(16, 185, 129, 0.08)') : gpaImpact < 0 ? (isLight ? '#fce8e6' : 'rgba(239, 68, 68, 0.08)') : (isLight ? '#f1f5f9' : 'rgba(100, 116, 139, 0.08)'),
                              color: gpaImpact > 0 ? (isLight ? '#137333' : '#10b981') : gpaImpact < 0 ? (isLight ? '#c5221f' : '#ef4444') : (isLight ? '#64748b' : '#94a3b8'),
                              border: gpaImpact > 0 ? (isLight ? '1px solid #137333' : '1px solid rgba(16, 185, 129, 0.15)') : gpaImpact < 0 ? (isLight ? '1px solid #c5221f' : '1px solid rgba(239, 68, 68, 0.15)') : (isLight ? '1px solid #cbd5e1' : '1px solid rgba(100, 116, 139, 0.15)'),
                              textShadow: isLight ? 'none' : (gpaImpact > 0 ? '0 0 8px rgba(16, 185, 129, 0.4)' : gpaImpact < 0 ? '0 0 8px rgba(239, 68, 68, 0.4)' : 'none'),
                              boxShadow: isLight ? 'none' : (gpaImpact > 0 ? '0 0 8px rgba(16, 185, 129, 0.1)' : gpaImpact < 0 ? '0 0 8px rgba(239, 68, 68, 0.1)' : 'none')
                            }}
                          >
                            {gpaImpact > 0 ? `+${gpaImpact.toFixed(2)}` : gpaImpact.toFixed(2)}
                          </span>
                        ) : (
                          <span style={{ color: isLight ? '#94a3b8' : 'var(--text-muted)', fontSize: '12px', opacity: 0.4 }}>—</span>
                        )}
                      </td>
                      <td className="sim-delete-td">
                        <button className="delete-btn" onClick={() => removeSubject(sub.id)}>
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              {subjects.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-state">No subjects added. Click "Add Subject" to begin simulating.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Summary Bar */}
        <div className="sim-summary-container">
          {/* Action button at the top */}
          <div className="sim-summary-action-row">
            <button
              className="sim-add-btn-premium"
              onClick={addSubject}
            >
              <Plus size={18} /> Add Subject
            </button>
          </div>

          {/* 4 Stats Grid */}
          <div className="sim-summary-grid-premium">
            <div className="sim-summary-tile-premium">
              <BookOpen size={20} className="sim-tile-icon-premium" />
              <span className="sim-tile-value-premium">{totalCredits}</span>
              <span className="sim-tile-label-premium">Credits</span>
            </div>

            <div className="sim-summary-tile-premium">
              <Layers size={20} className="sim-tile-icon-premium" />
              <span className="sim-tile-value-premium">{subjects.length}</span>
              <span className="sim-tile-label-premium">Subjects</span>
            </div>

            <div className="sim-summary-tile-premium">
              <Star size={20} className="sim-tile-icon-premium" />
              <span className="sim-tile-value-premium">{totalPoints.toFixed(2)}</span>
              <span className="sim-tile-label-premium">Total Points</span>
            </div>

            <div className="sim-summary-tile-premium">
              <Target size={20} className="sim-tile-icon-premium highlight" />
              <span className="sim-tile-value-premium highlight">
                <AnimatedNumber value={simulatedGPA} decimals={4} style={{ fontFamily: "'Space Grotesk', sans-serif" }} />
              </span>
              <span className="sim-tile-label-premium highlight">GPA</span>
            </div>
          </div>
        </div>

        {/* Premium Inline Info Bar */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full border max-w-fit mx-auto mt-4 stagger-2 text-center ${isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/5 border-white/5 backdrop-blur-md'
            }`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '9999px',
            border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.05)',
            backgroundColor: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.02)',
            backdropFilter: isLight ? 'none' : 'blur(10px)',
            width: 'fit-content',
            margin: '16px auto 20px'
          }}
        >
          <Info size={14} className={isLight ? "text-blue-600" : "text-blue-400"} style={{ color: isLight ? '#2563eb' : '#60a5fa', flexShrink: 0 }} />
          <p className={`text-xs font-medium leading-none ${isLight ? 'text-gray-600' : 'text-slate-400'}`} style={{ fontSize: '12px', margin: 0, fontWeight: 500, lineHeight: 1.4 }}>
            Set your <strong className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500 font-bold" style={{ background: 'linear-gradient(to right, #2563eb, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700 }}>actual grades</strong> in the table, then adjust simulated grades to see the <strong className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500 font-bold" style={{ background: 'linear-gradient(to right, #059669, #0891b2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700 }}>GPA impact</strong> in real-time.
          </p>
        </div>

        </div>

      {/* ─── VTOP AUTOFILL MODAL ─── */}
      {isAutofillModalOpen && (
        <div className="autofill-modal-overlay" onClick={(e) => {
          if (e.target.className === 'autofill-modal-overlay') setIsAutofillModalOpen(false);
        }}>
          <div className="autofill-modal-card animate-scale-in">
            <div className="autofill-modal-header">
              <div className="autofill-modal-title-group">
                <Sparkles size={20} className="autofill-modal-icon" />
                <h3 className="autofill-modal-title">Auto-Fill Simulation Subjects</h3>
              </div>
              <button className="autofill-modal-close" onClick={() => setIsAutofillModalOpen(false)}>×</button>
            </div>

            <div className="autofill-modal-tabs">
              <button
                className={`autofill-tab ${autofillTab === 'timetable' ? 'active' : ''}`}
                onClick={() => setAutofillTab('timetable')}
              >
                Import Time Table
              </button>
              <button
                className={`autofill-tab ${autofillTab === 'vtop' ? 'active' : ''}`}
                onClick={() => setAutofillTab('vtop')}
              >
                Paste grade table
              </button>
              <button
                className={`autofill-tab ${autofillTab === 'ocr' ? 'active' : ''}`}
                onClick={() => setAutofillTab('ocr')}
              >
                Scan Screenshot
              </button>
            </div>

            <div className="autofill-modal-body">
              {autofillTab === 'vtop' ? (
                <div className="vtop-autofill-pane">
                  <p className="autofill-pane-desc">
                    Log in to VTOP, copy your entire grade table from Examination -&gt; Grades, and paste it below. (Reference format shown below)
                  </p>

                  <label className="vtop-textarea-label">Paste your VTOP Grade Table here</label>
                  <textarea
                    className="vtop-textarea"
                    placeholder="Paste your VTOP Grade Table here..."
                    value={vtopText}
                    onChange={(e) => setVtopText(e.target.value)}
                  />

                  <div className="vtop-example-table-container" style={{ marginTop: '16px' }}>
                    <table className="vtop-example-table">
                      <thead>
                        <tr>
                          <th rowSpan="2">Sl.No.</th>
                          <th rowSpan="2">Course Code</th>
                          <th rowSpan="2">Course Title</th>
                          <th rowSpan="2">Course Type</th>
                          <th colSpan="4" style={{ textAlign: 'center' }}>Credits</th>
                          <th rowSpan="2">Grading Type</th>
                          <th rowSpan="2">Grand Total</th>
                          <th rowSpan="2">Grade</th>
                          <th rowSpan="2">View Mark</th>
                        </tr>
                        <tr>
                          <th>L</th>
                          <th>P</th>
                          <th>J</th>
                          <th>C</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>1</td>
                          <td>BCSE101E</td>
                          <td>Computer Programming: Python</td>
                          <td>Embedded Theory and Lab</td>
                          <td>1.0</td>
                          <td>2.0</td>
                          <td>0.0</td>
                          <td>3.0</td>
                          <td>AG</td>
                          <td>93</td>
                          <td>S</td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>2</td>
                          <td>BEEE102L</td>
                          <td>Basic Electrical and Electronics Engineering</td>
                          <td>Theory Only</td>
                          <td>3.0</td>
                          <td>0.0</td>
                          <td>0.0</td>
                          <td>3.0</td>
                          <td>RG</td>
                          <td>85</td>
                          <td>A</td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>3</td>
                          <td>BEEE102P</td>
                          <td>Basic Electrical and Electronics Engineering Lab</td>
                          <td>Lab Only</td>
                          <td>0.0</td>
                          <td>1.0</td>
                          <td>0.0</td>
                          <td>1.0</td>
                          <td>AG</td>
                          <td>99</td>
                          <td>S</td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="autofill-options">
                    <label className="autofill-checkbox-label">
                      <input
                        type="checkbox"
                        checked={replaceSubjects}
                        onChange={(e) => setReplaceSubjects(e.target.checked)}
                      />
                      <span>Replace existing subjects (otherwise append)</span>
                    </label>
                  </div>
                  <button className="btn-primary vtop-submit-btn" onClick={handleVtopAutofill}>
                    Auto Fill Subjects
                  </button>
                </div>
              ) : autofillTab === 'timetable' ? (
                <div className="vtop-autofill-pane">
                  <p className="autofill-pane-desc">
                    Log in to VTOP, copy your course registration text or timetable, and paste it below. (Reference format shown below)
                  </p>

                  <label className="vtop-textarea-label">Paste VTOP Registration Text / Timetable here</label>
                  <textarea
                    className="vtop-textarea"
                    placeholder="Paste your VTOP Registration Text or Timetable here..."
                    value={timetableText}
                    onChange={(e) => setTimetableText(e.target.value)}
                  />

                  <div className="vtop-example-table-container" style={{ marginTop: '16px' }}>
                    <table className="vtop-example-table">
                      <thead>
                        <tr>
                          <th>Sl.No</th>
                          <th>Class Group</th>
                          <th>Course</th>
                          <th>Credits</th>
                          <th>Category</th>
                          <th>Course Option</th>
                          <th>Class Id</th>
                          <th>Slot/ Venue</th>
                          <th>Faculty Details</th>
                          <th>Registered / Updated Date & Time</th>
                          <th>Attendance Date/ Type</th>
                          <th>Status & Ref. No.</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>1</td>
                          <td>General Freshers</td>
                          <td>BCSE101E - Computer Programming: Python<br />( Embedded Theory )</td>
                          <td>1.0</td>
                          <td>Foundation Core</td>
                          <td>Regular</td>
                          <td>VL2024250107560</td>
                          <td>TCC2 -<br />PRP124</td>
                          <td>SELVA RANI B -<br />SCORE</td>
                          <td>28-Jul-2024 04:39</td>
                          <td>29-Jul-2024<br />- Manual</td>
                          <td>Registered and Approved</td>
                        </tr>
                        <tr>
                          <td>2</td>
                          <td>General Freshers</td>
                          <td>BCSE101E - Computer Programming: Python<br />( Embedded Lab )</td>
                          <td>2.0</td>
                          <td>Foundation Core</td>
                          <td>Regular</td>
                          <td>VL2024250107561</td>
                          <td>L9+L10+L13+L14 -<br />SJT218</td>
                          <td>SELVA RANI B -<br />SCORE</td>
                          <td>28-Jul-2024 04:39</td>
                          <td>29-Jul-2024<br />- Manual</td>
                          <td>Registered and Approved</td>
                        </tr>
                        <tr>
                          <td>3</td>
                          <td>General Freshers</td>
                          <td>BEEE102L - Basic Electrical and Electronics Engineering<br />( Theory Only )</td>
                          <td>3.0</td>
                          <td>Foundation Core</td>
                          <td>Regular</td>
                          <td>VL2024250106644</td>
                          <td>G2+TG2 -<br />PRP124</td>
                          <td>ARUN N -<br />SELECT</td>
                          <td>28-Jul-2024 04:39</td>
                          <td>29-Jul-2024<br />- Manual</td>
                          <td>Registered and Approved</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="autofill-options">
                    <label className="autofill-checkbox-label">
                      <input
                        type="checkbox"
                        checked={replaceSubjects}
                        onChange={(e) => setReplaceSubjects(e.target.checked)}
                      />
                      <span>Replace existing subjects (otherwise append)</span>
                    </label>
                  </div>
                  <button className="btn-primary vtop-submit-btn" onClick={handleTimetableAutofill}>
                    Auto Fill from VTOP
                  </button>
                </div>
              ) : (
                <div className="ocr-autofill-pane">
                  <p className="autofill-pane-desc">
                    <strong>Currently under development...</strong>Upload or drag screenshots of your VTOP grade page to automatically scan and import course codes, names, credits, and grades.
                  </p>
                  <div className="ocr-dropzone">
                    <input
                      type="file"
                      id="ocr-upload"
                      accept="image/*"
                      multiple
                      className="ocr-file-input"
                      onChange={(e) => {
                        handleImageUpload(e);
                        setIsAutofillModalOpen(false);
                      }}
                      disabled={isScanning}
                    />
                    <label htmlFor="ocr-upload" className="ocr-dropzone-label">
                      <UploadCloud size={40} className="ocr-dropzone-icon" />
                      <span className="ocr-dropzone-text">Click to choose image files</span>
                      <span className="ocr-dropzone-sub">Supports multiple screenshots</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
