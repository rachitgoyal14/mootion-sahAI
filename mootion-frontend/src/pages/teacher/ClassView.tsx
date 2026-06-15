import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Sparkles, RefreshCw, 
  Map, BarChart3, Users, HelpCircle, AlertCircle, CheckCircle2, Clock, Calendar, X 
} from 'lucide-react';
import { ReactFlow, Background, Controls, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { api } from '../../api';
import { ChapterInfo, ClassInfo, ClassAnalytics, DoubtEntry } from '../../types';

export const ClassView: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  
  // Navigation layout: 'roadmap' (default) or 'dashboard'
  const [viewMode, setViewMode] = useState<'roadmap' | 'dashboard'>('roadmap');
  
  // Data States
  const [chapters, setChapters] = useState<ChapterInfo[]>([]);
  const [curriculum, setCurriculum] = useState<any | null>(null);
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [classAnalytics, setClassAnalytics] = useState<ClassAnalytics | null>(null);
  const [doubts, setDoubts] = useState<DoubtEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Assignment states
  const [selectedChapter, setSelectedChapter] = useState<ChapterInfo | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState<string[]>(['explain_it', 'predict_it', 'quiz']);
  const [deadline, setDeadline] = useState(() =>
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [instructionsNote, setInstructionsNote] = useState('');
  const [submittingAssignment, setSubmittingAssignment] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);

  useEffect(() => {
    if (!classId) return;

    async function loadData() {
      try {
        const classes = await api.getTeacherClasses();
        const found = classes.find(c => c.class_id === classId);
        if (found) {
          setClassInfo(found);
        }

        const chs = await api.getChapters(classId!);
        const sorted = chs.sort((a, b) => a.sequence_number - b.sequence_number);
        setChapters(sorted);

        // Fetch curriculum details if available
        try {
          const curricula = await api.getCurricula(classId!);
          if (curricula && curricula.length > 0) {
            const activeCurr = curricula.find(c => c.status === 'active') || curricula[0];
            const currDetails = await api.getCurriculumDetails(classId!, activeCurr.curriculum_id);
            setCurriculum(currDetails);
          }
        } catch (currErr) {
          console.warn('Failed to load curriculum details', currErr);
        }

        // Pre-fetch Analytics & Doubts for Dashboard
        const analyticsData = await api.getClassAnalytics(classId!);
        setClassAnalytics(analyticsData);

        const doubtList = await api.getDoubts();
        setDoubts(doubtList.filter(d => d.status === 'pending').slice(0, 3));
      } catch (e) {
        console.error('Failed to load class view data', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [classId]);

  const handleBootstrapCurriculum = async () => {
    if (!classId) return;
    setBootstrapping(true);
    try {
      const currRes = await api.bootstrapCurriculum(classId);
      if (currRes && currRes.curriculum_id) {
        await api.bootstrapChapters(classId, currRes.curriculum_id);
        
        // Fetch the detailed curriculum we just bootstrapped
        try {
          const currDetails = await api.getCurriculumDetails(classId, currRes.curriculum_id);
          setCurriculum(currDetails);
        } catch (currErr) {
          console.warn('Failed to load curriculum details after bootstrap', currErr);
        }

        const chs = await api.getChapters(classId);
        const sorted = chs.sort((a, b) => a.sequence_number - b.sequence_number);
        setChapters(sorted);
      } else {
        alert('Failed to get curriculum ID from backend.');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to bootstrap curriculum: backend missing or database issue.');
    } finally {
      setBootstrapping(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unset': return '#64748b'; // Slate/Grey
      case 'generated': return '#f59e0b'; // Amber/Orange
      case 'active': return '#10b981'; // Emerald/Green
      case 'data_ready': return '#06b6d4'; // Cyan
      default: return '#64748b';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'unset': return 'Unassigned';
      case 'generated': return 'Assigned Topic';
      case 'active': return 'Completed by Class';
      case 'data_ready': return 'Live';
      default: return 'Unassigned';
    }
  };

  // Convert chapters and curriculum tree to React Flow nodes and edges (Hierarchical layout)
  const flowNodes: Node[] = [];
  const flowEdges: Edge[] = [];

  if (classInfo) {
    if (curriculum && curriculum.curriculum_data && curriculum.curriculum_data.root) {
      const rootNode = curriculum.curriculum_data.root;
      const units = rootNode.children || [];
      const totalUnits = units.length;
      
      // Center the root node relative to all columns
      const columnSpacing = 280;
      const totalWidth = (totalUnits - 1) * columnSpacing;
      const rootX = totalWidth / 2 + 100;
      const rootY = 20;

      flowNodes.push({
        id: 'root-class',
        type: 'default',
        data: { 
          label: (
            <div className="text-center font-bold font-heading p-1">
              <span className="text-[9px] uppercase tracking-widest text-violet-400 font-bold">Primary Topic</span>
              <div className="text-sm text-white mt-0.5 font-extrabold">{classInfo.subject} Overview</div>
            </div>
          )
        },
        position: { x: rootX, y: rootY },
        style: {
          background: 'rgba(139, 92, 246, 0.12)',
          border: '2px solid #8b5cf6',
          borderRadius: '12px',
          color: '#fff',
          width: 200,
          boxShadow: '0 0 15px rgba(139, 92, 246, 0.2)',
        }
      });

      // Layout units horizontally and their topics vertically under them
      units.forEach((unitNode: any, unitIdx: number) => {
        const unitX = unitIdx * columnSpacing + 110;
        const unitY = 180;
        
        // Match unit node to DB chapter by checking source_node_id
        const ch = chapters.find(c => c.source_node_id === unitNode.id);
        const unitTargetId = ch ? ch.chapter_id : unitNode.id;

        flowNodes.push({
          id: unitTargetId,
          type: 'default',
          data: {
            label: (
              <div className="text-left font-medium p-1 relative group">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[8px] font-mono text-slate-500 font-bold uppercase">Topic {unitIdx + 1}</span>
                  <span 
                    className="w-2.5 h-2.5 rounded-full shadow-sm animate-pulse" 
                    style={{ backgroundColor: getStatusColor(ch ? ch.status : 'unset') }} 
                  />
                </div>
                <div className="text-xs font-bold text-slate-200 mt-1.5 font-heading truncate w-36">
                  {unitNode.title}
                </div>
                <div className="text-[8px] text-slate-400 font-bold uppercase mt-1">
                  {getStatusLabel(ch ? ch.status : 'unset')}
                </div>
                {!ch || ch.status === 'unset' ? (
                  <div className="mt-2 pt-1.5 border-t border-slate-800 text-center">
                    <span className="text-[9px] text-violet-400 font-extrabold uppercase hover:underline">
                      Assign to Class
                    </span>
                  </div>
                ) : (
                  <div className="mt-2 pt-1.5 border-t border-slate-800 text-center flex justify-between items-center text-[9px] text-slate-400">
                    <span>8 Activities</span>
                    <span className="text-emerald-400 font-bold">Active</span>
                  </div>
                )}
              </div>
            )
          },
          position: { x: unitX, y: unitY },
          style: {
            background: 'rgba(15, 23, 42, 0.9)',
            border: `2px solid ${getStatusColor(ch ? ch.status : 'unset')}`,
            borderRadius: '10px',
            color: '#fff',
            width: 180,
            cursor: ch ? 'pointer' : 'default',
            boxShadow: ch && ch.status !== 'unset' ? `0 0 10px ${getStatusColor(ch.status)}20` : 'none',
          }
        });

        // Connect root class to the unit
        flowEdges.push({
          id: `root-to-${unitTargetId}`,
          source: 'root-class',
          target: unitTargetId,
          animated: ch ? ch.status !== 'unset' : false,
          style: { stroke: '#8b5cf6', strokeWidth: 1.5 }
        });

        // Layout topics vertically under each unit column
        const topics = unitNode.children || [];
        topics.forEach((topicNode: any, topicIdx: number) => {
          const topicX = unitX + 10; // align centered: width 160 under width 180
          const topicY = unitY + 150 + topicIdx * 120;

          flowNodes.push({
            id: topicNode.id,
            type: 'default',
            data: {
              label: (
                <div className="text-left p-1.5">
                  <span className="text-[7px] font-mono text-slate-500 font-bold uppercase">Concept</span>
                  <div className="text-[11px] font-semibold text-slate-300 mt-0.5 leading-snug">
                    {topicNode.title}
                  </div>
                </div>
              )
            },
            position: { x: topicX, y: topicY },
            style: {
              background: 'rgba(15, 23, 42, 0.4)',
              border: `1px dashed ${ch ? getStatusColor(ch.status) : '#334155'}`,
              borderRadius: '8px',
              color: '#fff',
              width: 160,
              cursor: 'default',
            }
          });

          // Connect unit -> topic 1 -> topic 2 sequentially to show learning pathway
          const sourceId = topicIdx === 0 ? unitTargetId : topics[topicIdx - 1].id;
          flowEdges.push({
            id: `edge-${sourceId}-to-${topicNode.id}`,
            source: sourceId,
            target: topicNode.id,
            animated: ch ? ch.status === 'active' : false,
            style: { 
              stroke: ch ? getStatusColor(ch.status) : '#334155', 
              strokeWidth: 1.2,
              strokeDasharray: ch && ch.status === 'unset' ? '3' : 'none'
            }
          });
        });
      });
    } else {
      // Fallback: flat list layout if curriculum details are not loaded yet
      flowNodes.push({
        id: 'root-class',
        type: 'default',
        data: { 
          label: (
            <div className="text-center font-bold font-heading p-1">
              <span className="text-[9px] uppercase tracking-widest text-violet-400 font-bold">Primary Topic</span>
              <div className="text-sm text-white mt-0.5 font-extrabold">{classInfo.subject} Overview</div>
            </div>
          )
        },
        position: { x: 350, y: 20 },
        style: {
          background: 'rgba(139, 92, 246, 0.12)',
          border: '2px solid #8b5cf6',
          borderRadius: '12px',
          color: '#fff',
          width: 200,
          boxShadow: '0 0 15px rgba(139, 92, 246, 0.2)',
        }
      });

      chapters.forEach((ch, idx) => {
        const colsCount = Math.min(3, chapters.length);
        const colIdx = idx % colsCount;
        const rowIdx = Math.floor(idx / colsCount);
        
        const xPos = colIdx * 280 + 100;
        const yPos = rowIdx * 180 + 180;

        flowNodes.push({
          id: ch.chapter_id,
          type: 'default',
          data: {
            label: (
              <div className="text-left font-medium p-1 relative group">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[8px] font-mono text-slate-500 font-bold uppercase">Topic {idx + 1}</span>
                  <span 
                    className="w-2 h-2 rounded-full shadow-sm animate-pulse" 
                    style={{ backgroundColor: getStatusColor(ch.status) }} 
                  />
                </div>
                <div className="text-xs font-bold text-slate-200 mt-1.5 font-heading truncate w-36">
                  {ch.title}
                </div>
                <div className="text-[8px] text-slate-400 font-bold uppercase mt-1">
                  {getStatusLabel(ch.status)}
                </div>
                {ch.status === 'unset' ? (
                  <div className="mt-2 pt-1.5 border-t border-slate-800 text-center">
                    <span className="text-[9px] text-violet-400 font-extrabold uppercase hover:underline">
                      Assign to Class
                    </span>
                  </div>
                ) : (
                  <div className="mt-2 pt-1.5 border-t border-slate-800 text-center flex justify-between items-center text-[9px] text-slate-400">
                    <span>8 Activities</span>
                    <span className="text-emerald-400 font-bold">Active</span>
                  </div>
                )}
              </div>
            )
          },
          position: { x: xPos, y: yPos },
          style: {
            background: 'rgba(15, 23, 42, 0.9)',
            border: `2px solid ${getStatusColor(ch.status)}`,
            borderRadius: '10px',
            color: '#fff',
            width: 180,
            cursor: 'pointer',
            boxShadow: ch.status !== 'unset' ? `0 0 10px ${getStatusColor(ch.status)}20` : 'none',
          }
        });

        if (rowIdx === 0) {
          flowEdges.push({
            id: `root-to-${ch.chapter_id}`,
            source: 'root-class',
            target: ch.chapter_id,
            animated: true,
            style: { stroke: '#8b5cf6', strokeWidth: 1.5 }
          });
        } else {
          const parentChapter = chapters[idx - colsCount];
          if (parentChapter) {
            flowEdges.push({
              id: `edge-${parentChapter.chapter_id}-to-${ch.chapter_id}`,
              source: parentChapter.chapter_id,
              target: ch.chapter_id,
              animated: ch.status !== 'unset',
              style: { 
                stroke: getStatusColor(ch.status), 
                strokeWidth: 1.5,
                strokeDasharray: ch.status === 'unset' ? '4' : 'none'
              }
            });
          }
        }
      });
    }
  }

  const handleNodeClick = (_event: unknown, node: Node) => {
    if (node.id === 'root-class') return;
    const ch = chapters.find(c => c.chapter_id === node.id);
    if (ch) {
      setSelectedChapter(ch);
      setAssignOpen(true);
    }
  };

  const handleAssignSubmit = async () => {
    if (!classId || !selectedChapter || selectedActivities.length === 0) return;
    setSubmittingAssignment(true);

    try {
      // Call backend to create assignments
      for (const actType of selectedActivities) {
        await api.createAssignment(classId, {
          chapter_id: selectedChapter.chapter_id,
          assignment_type: actType,
          title: `${selectedChapter.title} - ${actType.replace('_', ' ').toUpperCase()}`,
          instructions: instructionsNote || `Please complete the ${actType} assignment.`
        });
      }

      // Force-update chapter status locally to refresh roadmap state
      setChapters(prev => prev.map(c => c.chapter_id === selectedChapter.chapter_id ? { ...c, status: 'active' } : c));
      setAssignOpen(false);
      setSelectedChapter(null);
    } catch (e) {
      console.error(e);
      alert('Failed to assign topic. Please try again.');
    } finally {
      setSubmittingAssignment(false);
    }
  };

  const toggleActivity = (type: string) => {
    setSelectedActivities(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#07070c] relative z-10">
        <span className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
        <span className="text-xs text-slate-500 mt-3 font-bold uppercase tracking-wider animate-pulse">Loading Roadmap Data...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#07070c] relative z-10 p-6 md:p-8 min-h-screen text-slate-100">
      <div className="grid-overlay" />
      <div className="ambient-light" />

      {/* Header and Back navigation */}
      <div className="flex flex-col gap-4 mb-6 shrink-0">
        <button
          onClick={() => navigate('/teacher/home')}
          className="text-slate-400 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 self-start transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Classes</span>
        </button>

        {classInfo && (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest bg-violet-600/10 px-3 py-1 rounded-full border border-violet-500/20">
                Class Code: {classInfo.class_code}
              </span>
              <h1 className="text-3xl font-extrabold text-slate-200 mt-2 font-heading">
                Class {classInfo.grade} — {classInfo.subject}
              </h1>
            </div>
            
            {/* View Mode Toggle Buttons */}
            <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-stretch sm:self-auto">
              <button
                onClick={() => setViewMode('roadmap')}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  viewMode === 'roadmap' 
                    ? 'bg-violet-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Map size={14} /> Roadmap Graph
              </button>
              <button
                onClick={() => setViewMode('dashboard')}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  viewMode === 'dashboard' 
                    ? 'bg-violet-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BarChart3 size={14} /> Dashboard View
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Chapters content area */}
      <div className="flex-1 min-h-0 flex flex-col relative">
        {viewMode === 'roadmap' ? (
          chapters.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center border border-slate-900 rounded-2xl bg-slate-950/40 backdrop-blur-sm min-h-[500px] text-center p-8 gap-4">
              <div className="w-14 h-14 rounded-full bg-violet-600/10 border border-violet-500/20 text-violet-400 flex items-center justify-center flex-shrink-0 animate-bounce">
                <Map size={24} />
              </div>
              <h3 className="font-extrabold text-slate-200 text-lg font-heading">No Curriculum Chapters Bootstrapped</h3>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed font-semibold">
                No chapters generated yet. The NCERT syllabus curriculum is not bootstrapped in the database.
              </p>
              <button
                onClick={handleBootstrapCurriculum}
                disabled={bootstrapping}
                className="btn-primary py-2.5 px-6 text-xs font-bold flex items-center gap-1.5"
              >
                {bootstrapping ? (
                  <RefreshCw size={13} className="animate-spin" />
                ) : (
                  <Sparkles size={13} />
                )}
                <span>{bootstrapping ? "Bootstrapping Syllabus..." : "Bootstrap NCERT Syllabus"}</span>
              </button>
            </div>
          ) : (
            /* REACT FLOW ROADMAP GRAPH */
            <div className="w-full border border-slate-900 rounded-2xl overflow-hidden bg-slate-950/40 backdrop-blur-sm h-[650px] relative">
              <ReactFlow
                nodes={flowNodes}
                edges={flowEdges}
                onNodeClick={handleNodeClick}
                fitView
              >
                <Background color="#1e293b" gap={16} />
                <Controls />
              </ReactFlow>

              {/* Custom Legend at Bottom Right */}
              <div className="absolute bottom-4 right-4 bg-slate-950/90 border border-slate-800 p-4 rounded-xl flex flex-col gap-2 z-10 text-[11px] font-bold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                  <span>Completed by Class</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                  <span>Assigned Topic</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#64748b]" />
                  <span>Unassigned</span>
                </div>
              </div>
            </div>
          )
        ) : (
          /* CLASS ANALYTICS DASHBOARD VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-16">
            
            {/* Left Columns (Class Completion + Student List) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Class Completion Card */}
              <div className="glass-panel p-6 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Class Completion</h3>
                  <span className="text-4xl font-extrabold font-heading text-violet-400">
                    {classAnalytics?.task_completion_rate !== undefined ? `${classAnalytics.task_completion_rate}%` : 'No Data Available'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">Progress across all assigned modules and chapter tasks.</p>
                <div className="w-full bg-slate-950 h-3 rounded-full border border-slate-800 overflow-hidden relative">
                  <div 
                    className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)] transition-all duration-500"
                    style={{ width: `${classAnalytics?.task_completion_rate || 0}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase mt-1">
                  <span>0% Started</span>
                  <span>{classAnalytics?.task_completion_rate || 0}% Completed</span>
                  <span>100% Mastered</span>
                </div>
              </div>

              {/* Student Progress List Card */}
              <div className="glass-panel p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-violet-400" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Student Progress List</h3>
                  </div>
                  <span className="text-[9px] font-bold text-rose-450 uppercase tracking-widest bg-rose-500/10 px-2.5 py-0.5 rounded border border-rose-500/25">
                    Backend Missing
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="p-3.5 bg-slate-900/40 rounded-xl border border-slate-800/80 text-xs text-slate-400 leading-relaxed font-semibold">
                    Note: Roster database endpoint is currently missing in the backend API. Showing active students from the Class Analytics Overview logs:
                  </div>

                  {classAnalytics?.recent_activities && classAnalytics.recent_activities.length > 0 ? (
                    classAnalytics.recent_activities.map((act, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-900/30 rounded-xl border border-slate-800/40 hover:border-slate-800 transition-colors">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-slate-200">{act.student_name}</span>
                          <span className="text-[10px] text-slate-450 font-medium">Topic: {act.chapter_title} ({act.activity_type.replace('_', ' ').toUpperCase()})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`status-pill text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            act.score >= 2 
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                              : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                          }`}>
                            Score: {act.score}/3
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                            <Clock size={11} /> {act.date}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 bg-slate-950/20 border border-slate-800 rounded-xl text-center text-xs text-slate-550 italic font-semibold">
                      No Student Activity Data Available (No submissions logged yet).
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column (Doubts + Support alerts) */}
            <div className="flex flex-col gap-6">
              {/* Most Common Doubts Card */}
              <div className="glass-panel p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <HelpCircle size={16} className="text-violet-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Most Common Doubts</h3>
                </div>

                <div className="flex flex-col gap-3">
                  {doubts.length > 0 ? (
                    doubts.map(d => (
                      <div key={d.doubt_id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 hover:border-slate-800 flex flex-col gap-1.5 transition-colors">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-extrabold text-violet-400 uppercase tracking-wide">{d.student_name}</span>
                          <span className="text-[9px] text-slate-500 font-mono">{new Date(d.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-slate-300 italic leading-relaxed">
                          "{d.text}"
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 bg-slate-950/20 border border-slate-800 rounded-xl text-center text-xs text-slate-550 italic font-semibold">
                      No doubts logged yet (No active student doubts).
                    </div>
                  )}
                </div>
              </div>

              {/* Needs Support Widget */}
              <div className="glass-panel p-6 flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="text-rose-450" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Needs Support</h3>
                  </div>
                  <span className="text-[9px] font-bold text-rose-450 uppercase tracking-widest bg-rose-500/10 px-2.5 py-0.5 rounded border border-rose-500/25">
                    Backend Missing
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="p-8 bg-slate-950/20 border border-slate-800 rounded-xl text-center text-xs text-slate-550 italic font-semibold">
                    Needs Support analytics endpoint is not implemented in the backend API.
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ASSIGN TOPIC MODAL */}
      {assignOpen && selectedChapter && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setAssignOpen(false)} />
          
          <div className="glass-panel p-8 max-w-lg w-full relative z-10 animate-scale-up border border-slate-800 bg-[#0c0c14] shadow-2xl flex flex-col gap-6">
            <button 
              onClick={() => setAssignOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold tracking-tight text-slate-100 font-heading">
                Assign Topic
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Configure learning details and assign tasks for **{selectedChapter.title}**
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {/* Class Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Class / Section</label>
                <input 
                  type="text" 
                  value={classInfo ? `Class ${classInfo.grade} — ${classInfo.subject}` : ''} 
                  disabled 
                  className="form-input bg-slate-950 border-slate-800 text-slate-400"
                />
              </div>

              {/* Goal Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Learning Goal</label>
                <select className="form-input bg-slate-950 border-slate-800 text-slate-200">
                  <option value="understanding">Conceptual Understanding</option>
                  <option value="solving">Mathematical & Formula Problem Solving</option>
                  <option value="applications">Real-world Connection & Applications</option>
                </select>
              </div>

              {/* Activities Checkboxes */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Activities to Include</label>
                
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'explain_it', label: 'Storyboard (Visual)' },
                    { id: 'predict_it', label: 'Playground (Interactive)' },
                    { id: 'quiz', label: 'Prove It (Quiz)' },
                    { id: 'spot_it', label: 'Spot the Mistake' },
                    { id: 'connect_it', label: 'Wrong One (Concept Relationship)' },
                  ].map(act => {
                    const active = selectedActivities.includes(act.id);
                    return (
                      <button
                        key={act.id}
                        type="button"
                        onClick={() => toggleActivity(act.id)}
                        className={`text-[10px] font-bold px-3.5 py-1.5 rounded-lg border transition-all ${
                          active 
                            ? 'bg-violet-600 text-white border-violet-500/40 shadow-sm' 
                            : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        {act.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Due Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 flex items-center gap-1">
                  <Calendar size={12} /> Due Date
                </label>
                <input 
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="form-input bg-slate-950 border-slate-800 text-slate-200"
                />
              </div>

              {/* Instructions text */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Teacher Notes / Instructions</label>
                <textarea 
                  placeholder="Paste special notes, context, or instructions here..."
                  value={instructionsNote}
                  onChange={(e) => setInstructionsNote(e.target.value)}
                  rows={2}
                  className="form-input bg-slate-950 border-slate-800 text-slate-200 resize-none text-xs"
                />
              </div>
            </div>

            <button
              onClick={handleAssignSubmit}
              disabled={submittingAssignment || selectedActivities.length === 0}
              className="btn-primary w-full py-3 mt-2 font-bold"
            >
              {submittingAssignment ? (
                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Assign to Class</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
