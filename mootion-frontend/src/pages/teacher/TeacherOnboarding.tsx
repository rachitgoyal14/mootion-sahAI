import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, School, GraduationCap, BookOpen, Globe, CheckCircle2 } from 'lucide-react';
import { api } from '../../api';
import { Language } from '../../types';

interface TeacherOnboardingProps {
  onOnboardingComplete: (user: any) => void;
}

export const TeacherOnboarding: React.FC<TeacherOnboardingProps> = ({ onOnboardingComplete }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [schoolName, setSchoolName] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [language, setLanguage] = useState<Language>('english');

  const grades = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const subjects = ['Physics', 'Mathematics', 'Chemistry', 'Biology', 'Computer Science'];

  const toggleGrade = (grade: string) => {
    setSelectedGrades(prev => 
      prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]
    );
  };

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  };

  const nextStep = () => {
    if (step === 1 && !schoolName && !schoolCode) return;
    if (step === 2 && selectedGrades.length === 0) return;
    if (step === 3 && selectedSubjects.length === 0) return;
    
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Step 4 complete -> Proceed to NCERT confirmation
      setStep(5);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCompleteOnboarding = async (loadNcert: boolean) => {
    setLoading(true);
    try {
      // 1. Set language preference
      await api.setTeacherPreferences(language);

      // 2. Create class profiles for every grade + subject combination in the backend
      // Extract numeric string from Grade (e.g. "Class 8" -> "8")
      for (const gradeLabel of selectedGrades) {
        const gradeVal = gradeLabel.replace('Class ', '');
        for (const subjectVal of selectedSubjects) {
          const classInfo = await api.createClass(gradeVal, subjectVal);
          
          if (loadNcert) {
            // Bootstrap curriculum tree automatically
            const currRes = await api.bootstrapCurriculum(classInfo.class_id);
            // Bootstrap chapters from curriculum in backend
            if (currRes && currRes.curriculum_id) {
              await api.bootstrapChapters(classInfo.class_id, currRes.curriculum_id);
            }
          }
        }
      }

      // 3. Mark complete in backend
      await api.completeTeacherOnboarding(loadNcert);

      // 4. Reload user profile to update state
      const updatedUser = await api.getCurrentUser();
      onOnboardingComplete(updatedUser);

      // Navigate to Home screen
      navigate('/teacher/home');
    } catch (e) {
      console.error('Failed to complete onboarding', e);
      alert('An error occurred during curriculum bootstrapping. Moving to homepage...');
      navigate('/teacher/home');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-[#07070c] relative z-10">
      <div className="grid-overlay" />
      <div className="ambient-light" />
      <div className="ambient-light-bottom" />

      <div className="w-full max-w-xl glass-panel p-8 flex flex-col relative">
        {/* Step Indicator */}
        {step <= 4 && (
          <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(s => (
                <div 
                  key={s} 
                  className={`h-1.5 w-8 rounded-full transition-all duration-300 ${
                    s === step ? 'bg-violet-500 w-12' : s < step ? 'bg-violet-600/50' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Step {step} of 4
            </span>
          </div>
        )}

        {/* STEP 1: SCHOOL SELECTION */}
        {step === 1 && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-violet-600/10 border border-violet-500/20 text-violet-400 rounded-xl">
                <School size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-200 font-heading">Select your School</h2>
                <p className="text-slate-400 text-xs mt-0.5">Enter details to align with your school roster</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">School Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Kendriya Vidyalaya No. 1"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="flex items-center justify-center my-1 text-slate-600 text-xs font-bold uppercase">
                <span>- or -</span>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">School Code</label>
                <input 
                  type="text"
                  placeholder="e.g. KV10459"
                  value={schoolCode}
                  onChange={(e) => setSchoolCode(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: GRADES MULTI-SELECT */}
        {step === 2 && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-violet-600/10 border border-violet-500/20 text-violet-400 rounded-xl">
                <GraduationCap size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-200 font-heading">Grades You Teach</h2>
                <p className="text-slate-400 text-xs mt-0.5">Choose multiple classes to set up content roadmaps</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              {grades.map(grade => {
                const selected = selectedGrades.includes(grade);
                return (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => toggleGrade(grade)}
                    className={`py-3 px-4 border rounded-xl font-semibold text-sm transition-all flex items-center justify-between ${
                      selected 
                        ? 'bg-violet-600/20 border-violet-500 text-violet-200 shadow-md shadow-violet-600/10'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span>{grade}</span>
                    {selected && <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: SUBJECTS MULTI-SELECT */}
        {step === 3 && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-violet-600/10 border border-violet-500/20 text-violet-400 rounded-xl">
                <BookOpen size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-200 font-heading">Select Subjects</h2>
                <p className="text-slate-400 text-xs mt-0.5">Select subjects you want to configure for the classes</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {subjects.map(sub => {
                const selected = selectedSubjects.includes(sub);
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => toggleSubject(sub)}
                    className={`py-3 px-4 border rounded-xl font-semibold text-sm transition-all flex items-center justify-between ${
                      selected 
                        ? 'bg-violet-600/20 border-violet-500 text-violet-200 shadow-md shadow-violet-600/10'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span>{sub}</span>
                    {selected && <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: PREFERRED LANGUAGE */}
        {step === 4 && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-violet-600/10 border border-violet-500/20 text-violet-400 rounded-xl">
                <Globe size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-200 font-heading">Preferred Language</h2>
                <p className="text-slate-400 text-xs mt-0.5">Determines the auto-generated syllabus language</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              {(['english', 'hindi', 'gujarati'] as const).map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`py-4 px-3 border rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-2 ${
                    language === lang 
                      ? 'bg-violet-600/20 border-violet-500 text-violet-200 shadow-md shadow-violet-600/10'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="text-lg">
                    {lang === 'english' ? '🇬🇧' : lang === 'hindi' ? '🇮🇳' : '🇮🇳'}
                  </span>
                  <span>{lang}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: NCERT SYLLABUS CONFIRMATION */}
        {step === 5 && (
          <div className="flex flex-col gap-6 items-center text-center animate-fade-in py-4">
            <div className="w-16 h-16 rounded-full bg-violet-600/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-2 animate-bounce">
              <GraduationCap size={32} />
            </div>

            <h2 className="text-2xl font-extrabold text-slate-200 font-heading">Load NCERT Syllabus?</h2>
            <p className="text-slate-400 text-sm max-w-sm">
              We recommend loading the NCERT syllabus. This auto-populates the complete chapter structure for every grade and subject combination.
            </p>

            {loading ? (
              <div className="flex flex-col items-center gap-3 mt-4">
                <span className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider animate-pulse">
                  Bootstrapping syllabus & chapter structures...
                </span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm mt-6">
                <button
                  onClick={() => handleCompleteOnboarding(false)}
                  className="btn-secondary flex-1 py-3 text-sm"
                >
                  No, Manual Setup
                </button>
                <button
                  onClick={() => handleCompleteOnboarding(true)}
                  className="btn-primary flex-1 py-3 text-sm"
                >
                  <CheckCircle2 size={16} />
                  <span>Yes, Load NCERT</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Action Controls */}
        {step <= 4 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="btn-secondary text-sm disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <button
              onClick={nextStep}
              disabled={
                (step === 1 && !schoolName && !schoolCode) ||
                (step === 2 && selectedGrades.length === 0) ||
                (step === 3 && selectedSubjects.length === 0)
              }
              className="btn-primary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
