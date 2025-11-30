
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { generateResumeFromJobDescription } from '../services/geminiService';
import { useAuth, useApp } from '../App';
import { ResumeData, ExperienceItem, EducationItem, TemplateType } from '../types';
import { INITIAL_RESUME_STATE, TRANSLATIONS } from '../constants';
import ResumePreview from '../components/ResumePreview';
import { 
  Save, ArrowLeft, Wand2, Download, Eye, Layout, Plus, Trash, ChevronDown, ChevronUp, User 
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Packer, Document, Paragraph, TextRun, HeadingLevel } from 'docx';
import saveAs from 'file-saver';

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { language } = useApp();
  const t = TRANSLATIONS[language].editor;

  const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_RESUME_STATE);
  const [template, setTemplate] = useState<TemplateType>('modern');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [showAiModal, setShowAiModal] = useState(false);
  
  // AI Generation State
  const [jobDescription, setJobDescription] = useState('');
  const [candidateName, setCandidateName] = useState('');
  
  const [title, setTitle] = useState('Mon CV');
  const previewRef = useRef<HTMLDivElement>(null);

  // Handle template selection from Landing Page
  useEffect(() => {
    if (location.state && location.state.template) {
      setTemplate(location.state.template);
    }
  }, [location.state]);

  useEffect(() => {
    if (id) {
      loadResume(id);
    } else if (user?.user_metadata?.full_name) {
        // Pre-fill name from auth if available
        setResumeData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, fullName: user.user_metadata.full_name }
        }));
        setCandidateName(user.user_metadata.full_name);
    }
  }, [id, user]);

  const loadResume = async (resumeId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .single();

    if (data && !error) {
      setResumeData(data.content);
      setTitle(data.title);
      setTemplate(data.template_id as TemplateType);
      setCandidateName(data.content.personalInfo.fullName || '');
    }
    setLoading(false);
  };

  const saveResume = async () => {
    if (!user) return;
    setLoading(true);

    const payload = {
      user_id: user.id,
      title,
      content: resumeData,
      template_id: template,
      updated_at: new Date().toISOString()
    };

    let error;
    if (id) {
      ({ error } = await supabase.from('resumes').update(payload).eq('id', id));
    } else {
      const { data, error: insertError } = await supabase.from('resumes').insert(payload).select().single();
      error = insertError;
      if (data) navigate(`/editor/${data.id}`, { replace: true });
    }

    if (error) console.error(error);
    setLoading(false);
  };

  const handleAiGeneration = async () => {
    if (!candidateName.trim()) {
        alert("Le nom est obligatoire.");
        return;
    }
    setAiLoading(true);
    try {
      // We pass the collected candidate name to the service
      const newResume = await generateResumeFromJobDescription(jobDescription, candidateName, resumeData, language);
      if (newResume) {
        setResumeData(prev => ({ ...prev, ...newResume }));
        setShowAiModal(false);
      }
    } catch (e) {
      alert("Error generating resume. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  // --- Export Logic ---
  
  const exportPDF = async () => {
    if (!previewRef.current) return;
    const element = previewRef.current;
    
    try {
        setLoading(true);
        // Optimization options for PDF
        const canvas = await html2canvas(element, { 
          scale: 2, // Slightly lower scale for size optimization (was 2, can go to 1.5 if still large)
          useCORS: true,
          logging: false,
          allowTaint: true,
          backgroundColor: '#ffffff', // Force white background to prevent transparency overlap issues
        });
        
        // Use JPEG instead of PNG for smaller file size
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${title.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
        console.error("Export failed", err);
        alert("Export failed. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  const exportDOCX = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: resumeData.personalInfo.fullName,
            heading: HeadingLevel.TITLE,
          }),
          new Paragraph({
            text: resumeData.personalInfo.email + " | " + resumeData.personalInfo.phone,
          }),
           new Paragraph({ text: "" }), // Spacing
           new Paragraph({
            text: "Experience",
            heading: HeadingLevel.HEADING_1,
          }),
          ...resumeData.experience.flatMap(exp => [
             new Paragraph({
                children: [
                    new TextRun({ text: exp.position, bold: true }),
                    new TextRun({ text: ` at ${exp.company}` }),
                ]
             }),
             new Paragraph({ text: `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}` }),
             new Paragraph({ text: exp.description }),
             new Paragraph({ text: "" }),
          ]),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${title}.docx`);
  };

  // --- Form Handlers ---

  const updatePersonalInfo = (field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const updateExperience = (idx: number, field: string, value: any) => {
    const newExp = [...resumeData.experience];
    newExp[idx] = { ...newExp[idx], [field]: value };
    setResumeData(prev => ({ ...prev, experience: newExp }));
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        id: crypto.randomUUID(),
        company: '', position: '', startDate: '', endDate: '', current: false, description: ''
      }]
    }));
  };

  const updateEducation = (idx: number, field: string, value: any) => {
    const newEdu = [...resumeData.education];
    newEdu[idx] = { ...newEdu[idx], [field]: value };
    setResumeData(prev => ({ ...prev, education: newEdu }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, {
        id: crypto.randomUUID(),
        institution: '', degree: '', field: '', startDate: '', endDate: '', current: false
      }]
    }));
  };

  const updateSkill = (idx: number, value: string) => {
    const newSkills = [...resumeData.skills];
    newSkills[idx] = value;
    setResumeData(prev => ({ ...prev, skills: newSkills }));
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-900 overflow-hidden">
      {/* Top Bar */}
      <div className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 z-20 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent font-semibold text-lg focus:outline-none border-b border-transparent focus:border-primary-500 max-w-[150px] sm:max-w-[200px]"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-lg text-xs sm:text-sm font-medium hover:bg-indigo-200 transition-colors"
          >
            <Wand2 className="w-4 h-4" />
            <span className="hidden sm:inline">{t.buttons.generateAI}</span>
          </button>
          
          <div className="h-6 w-px bg-slate-300 dark:bg-slate-600 mx-2" />

          <button onClick={exportDOCX} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-blue-600" title="Export Word">
            <span className="font-bold text-xs border border-current px-1 rounded">W</span>
          </button>
          <button onClick={exportPDF} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-red-600" title="Export PDF">
             {loading ? <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div> : <Download className="w-5 h-5" />}
          </button>
          
          <button 
            onClick={saveResume}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs sm:text-sm font-medium ml-2 shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">{t.buttons.save}</span>
          </button>
        </div>
      </div>

      {/* Main Content Split View */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        
        {/* Editor Panel (Left) */}
        <div className="w-full md:w-1/2 lg:w-5/12 overflow-y-auto p-4 md:p-6 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-1/2 md:h-full">
            <div className="flex space-x-1 mb-6 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg overflow-x-auto">
                {['personal', 'experience', 'education', 'skills'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab ? 'bg-white dark:bg-slate-800 shadow text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {t.tabs[tab as keyof typeof t.tabs]}
                    </button>
                ))}
            </div>

            {activeTab === 'personal' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                    <InputField label={t.labels.fullName} value={resumeData.personalInfo.fullName} onChange={v => updatePersonalInfo('fullName', v)} />
                    <InputField label={t.labels.jobTitle} value={resumeData.personalInfo.jobTitle} onChange={v => updatePersonalInfo('jobTitle', v)} />
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Email" value={resumeData.personalInfo.email} onChange={v => updatePersonalInfo('email', v)} />
                        <InputField label="Phone" value={resumeData.personalInfo.phone} onChange={v => updatePersonalInfo('phone', v)} />
                    </div>
                    <InputField label="Address" value={resumeData.personalInfo.address} onChange={v => updatePersonalInfo('address', v)} />
                    <TextAreaField label={t.labels.summary} value={resumeData.personalInfo.summary} onChange={v => updatePersonalInfo('summary', v)} />
                </div>
            )}

            {activeTab === 'experience' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                    {resumeData.experience.map((exp, idx) => (
                        <div key={exp.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/30 relative group">
                            <button 
                                onClick={() => {
                                    const newExp = resumeData.experience.filter((_, i) => i !== idx);
                                    setResumeData(prev => ({...prev, experience: newExp}));
                                }}
                                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                            >
                                <Trash className="w-4 h-4" />
                            </button>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <InputField label="Company" value={exp.company} onChange={v => updateExperience(idx, 'company', v)} />
                                <InputField label="Position" value={exp.position} onChange={v => updateExperience(idx, 'position', v)} />
                                <InputField label="Start" type="text" placeholder="MM/YYYY" value={exp.startDate} onChange={v => updateExperience(idx, 'startDate', v)} />
                                <InputField label="End" type="text" placeholder="MM/YYYY" value={exp.endDate} onChange={v => updateExperience(idx, 'endDate', v)} />
                            </div>
                            <TextAreaField label="Description" value={exp.description} onChange={v => updateExperience(idx, 'description', v)} />
                        </div>
                    ))}
                    <button onClick={addExperience} className="w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-500 hover:border-primary-500 hover:text-primary-500 flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" /> {t.buttons.add}
                    </button>
                </div>
            )}

             {activeTab === 'education' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                    {resumeData.education.map((edu, idx) => (
                        <div key={edu.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/30 relative group">
                            <button 
                                onClick={() => {
                                    const newEdu = resumeData.education.filter((_, i) => i !== idx);
                                    setResumeData(prev => ({...prev, education: newEdu}));
                                }}
                                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                            >
                                <Trash className="w-4 h-4" />
                            </button>
                            <div className="grid grid-cols-1 gap-4 mb-4">
                                <InputField label="Institution" value={edu.institution} onChange={v => updateEducation(idx, 'institution', v)} />
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="Degree" value={edu.degree} onChange={v => updateEducation(idx, 'degree', v)} />
                                    <InputField label="Field" value={edu.field} onChange={v => updateEducation(idx, 'field', v)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="Start" value={edu.startDate} onChange={v => updateEducation(idx, 'startDate', v)} />
                                    <InputField label="End" value={edu.endDate} onChange={v => updateEducation(idx, 'endDate', v)} />
                                </div>
                            </div>
                        </div>
                    ))}
                    <button onClick={addEducation} className="w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-500 hover:border-primary-500 hover:text-primary-500 flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" /> {t.buttons.add}
                    </button>
                </div>
            )}

            {activeTab === 'skills' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {resumeData.skills.map((skill, idx) => (
                            <div key={idx} className="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full flex items-center gap-2">
                                <span>{skill}</span>
                                <button onClick={() => {
                                    const newSkills = resumeData.skills.filter((_, i) => i !== idx);
                                    setResumeData(prev => ({...prev, skills: newSkills}));
                                }} className="hover:text-red-500"><Trash className="w-3 h-3" /></button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input 
                            id="newSkill"
                            className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent" 
                            placeholder="Add a skill..."
                            onKeyDown={(e) => {
                                if(e.key === 'Enter') {
                                    const val = e.currentTarget.value.trim();
                                    if(val) {
                                        setResumeData(prev => ({...prev, skills: [...prev.skills, val]}));
                                        e.currentTarget.value = '';
                                    }
                                }
                            }}
                        />
                        <button 
                            onClick={() => {
                                const el = document.getElementById('newSkill') as HTMLInputElement;
                                if(el && el.value.trim()) {
                                    setResumeData(prev => ({...prev, skills: [...prev.skills, el.value.trim()]}));
                                    el.value = '';
                                }
                            }}
                            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>

        {/* Preview Panel (Right) */}
        <div className="w-full md:w-1/2 lg:w-7/12 bg-slate-200 dark:bg-slate-950 p-4 md:p-8 overflow-y-auto flex flex-col items-center h-1/2 md:h-full">
             <div className="mb-4 flex gap-2 p-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                {(['modern', 'classic', 'minimalist'] as TemplateType[]).map(t => (
                    <button
                        key={t}
                        onClick={() => setTemplate(t)}
                        className={`px-3 py-1 rounded text-sm capitalize ${template === t ? 'bg-primary-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    >
                        {t}
                    </button>
                ))}
             </div>
            
             <div className="shadow-2xl origin-top transition-transform duration-300 scale-50 md:scale-75 lg:scale-[0.85] xl:scale-90">
                <ResumePreview ref={previewRef} data={resumeData} template={template} />
             </div>
        </div>
      </div>

      {/* AI Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600">
                <Wand2 className="w-5 h-5 text-indigo-500" />
                {t.aiModal.title}
            </h3>
            
            <div className="space-y-4 mb-4">
                 {/* Name Field - Mandatory */}
                 <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Nom complet <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                         <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={candidateName}
                            onChange={(e) => setCandidateName(e.target.value)}
                            placeholder="Ex: Dekens Ruzuba"
                            className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Le reste des informations (email, téléphone, etc.) pourra être ajouté plus tard.</p>
                 </div>

                 {/* Job Description - Mandatory */}
                 <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Offre d'emploi <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder={t.aiModal.placeholder}
                        className="w-full h-32 p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 resize-none focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                 </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button 
                    onClick={() => setShowAiModal(false)}
                    className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                    Annuler
                </button>
                <button 
                    onClick={handleAiGeneration}
                    disabled={aiLoading || !jobDescription || !candidateName}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                >
                    {aiLoading ? t.aiModal.processing : t.aiModal.button}
                    {aiLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// UI Helpers
const InputField = ({ label, value, onChange, type = "text", placeholder }: any) => (
    <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
        <input 
            type={type}
            value={value || ''} 
            onChange={e => onChange(e.target.value)} 
            placeholder={placeholder}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none transition-shadow"
        />
    </div>
);

const TextAreaField = ({ label, value, onChange }: any) => (
     <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
        <textarea 
            rows={4}
            value={value || ''} 
            onChange={e => onChange(e.target.value)} 
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none transition-shadow resize-none"
        />
    </div>
);

export default Editor;
