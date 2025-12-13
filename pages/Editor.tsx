
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { generateResumeFromJobDescription, generateCoverLetter } from '../services/geminiService';
import { useAuth, useApp } from '../App';
import { ResumeData, TemplateType } from '../types';
import { INITIAL_RESUME_STATE, TRANSLATIONS } from '../constants';
import ResumePreview from '../components/ResumePreview';
import { 
  Save, ArrowLeft, Wand2, Download, Eye, Layout, Plus, Trash, ChevronDown, ChevronUp, User, Upload, Image as ImageIcon, Check, RefreshCw, AlertTriangle, Edit, Mail, Loader2
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
  const [checkingLetter, setCheckingLetter] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [showAiModal, setShowAiModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  
  // Mobile View State ('editor' or 'preview')
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  
  // Ref to track the last saved state for comparison
  const lastSavedState = useRef<string>('');

  // AI Generation State
  const [jobDescription, setJobDescription] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [generateCL, setGenerateCL] = useState(false);
  
  const [title, setTitle] = useState('Mon CV');
  const previewRef = useRef<HTMLDivElement>(null);

  // Handle template selection from Landing Page
  useEffect(() => {
    if (location.state && location.state.template) {
      setTemplate(location.state.template);
    }
  }, [location.state]);

  // Protect against accidental closure
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [unsavedChanges]);

  // Initial Load
  useEffect(() => {
    const initializeEditor = async () => {
        if (id) {
            await loadResume(id);
        } else {
            // New Resume: Check for draft
            const draft = localStorage.getItem('procv-draft-new');
            if (draft) {
                try {
                    const parsed = JSON.parse(draft);
                    if (window.confirm("Un brouillon non sauvegardé a été trouvé. Voulez-vous le restaurer ?")) {
                        setResumeData(parsed.data);
                        setTitle(parsed.title || 'Mon CV');
                        setTemplate(parsed.template || 'modern');
                        // No lastSavedState for new draft, so unsavedChanges will become true naturally
                    } else {
                        localStorage.removeItem('procv-draft-new');
                        initializeNewProfile();
                    }
                } catch(e) {
                    initializeNewProfile();
                }
            } else {
                initializeNewProfile();
            }
        }
    };
    
    if (user) initializeEditor();
  }, [id, user]);

  const initializeNewProfile = () => {
      if (user?.user_metadata?.full_name) {
          setResumeData(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, fullName: user.user_metadata.full_name }
          }));
          setCandidateName(user.user_metadata.full_name);
      }
      // For new resume, initialize last saved state as the initial empty state + user name
      // This prevents "Unsaved" from appearing immediately unless user types
      lastSavedState.current = JSON.stringify({ 
          data: { ...INITIAL_RESUME_STATE, personalInfo: { ...INITIAL_RESUME_STATE.personalInfo, fullName: user?.user_metadata?.full_name || '' }}, 
          title: 'Mon CV', 
          template: 'modern' 
      });
  };

  // Check for changes (Auto-save Logic + Unsaved Indicator)
  useEffect(() => {
      if (loading) return;
      
      const currentState = {
          data: resumeData,
          title,
          template
      };
      const currentStateString = JSON.stringify(currentState);
      
      // Only flag as unsaved if it differs from what we loaded/saved
      if (lastSavedState.current && currentStateString !== lastSavedState.current) {
          setUnsavedChanges(true);
          
          // Local Storage Save
          const key = id ? `procv-draft-${id}` : 'procv-draft-new';
          localStorage.setItem(key, JSON.stringify({
              ...currentState,
              timestamp: Date.now()
          }));
      } else {
          setUnsavedChanges(false);
      }
  }, [resumeData, title, template, id, loading]);

  const loadResume = async (resumeId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .single();

    if (data && !error) {
      let content = data.content;
      let resumeTitle = data.title;
      let resumeTemplate = data.template_id as TemplateType;

      const draft = localStorage.getItem(`procv-draft-${resumeId}`);
      if (draft) {
          try {
              const parsed = JSON.parse(draft);
              if (JSON.stringify(parsed.data) !== JSON.stringify(content)) {
                  // Keep simple for now
              }
          } catch(e) {}
      }

      setResumeData(content);
      setTitle(resumeTitle);
      setTemplate(resumeTemplate);
      setCandidateName(content.personalInfo.fullName || '');
      
      // Update reference point
      lastSavedState.current = JSON.stringify({
          data: content,
          title: resumeTitle,
          template: resumeTemplate
      });
      setUnsavedChanges(false);
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
    let savedId = id;

    if (id) {
      ({ error } = await supabase.from('resumes').update(payload).eq('id', id));
      if (!error) {
          localStorage.removeItem(`procv-draft-${id}`);
      }
    } else {
      const { data, error: insertError } = await supabase.from('resumes').insert(payload).select().single();
      error = insertError;
      if (data) {
          savedId = data.id;
          localStorage.removeItem('procv-draft-new');
          navigate(`/editor/${data.id}`, { replace: true });
      }
    }

    if (error) {
        console.error(error);
        alert("Erreur lors de la sauvegarde. Veuillez réessayer.");
    } else {
        lastSavedState.current = JSON.stringify({
            data: resumeData,
            title,
            template
        });
        setUnsavedChanges(false);
    }
    setLoading(false);
    return savedId;
  };

  // Logic to navigate to or create a cover letter based on this resume
  const handleCoverLetterClick = async () => {
      // 1. Ensure Resume is Saved First
      let currentResumeId = id;
      if (unsavedChanges || !id) {
          currentResumeId = await saveResume();
          if (!currentResumeId) return; // Save failed
      }

      setCheckingLetter(true);

      // 2. Check if a linked letter already exists
      const { data: existingLetters } = await supabase
          .from('cover_letters')
          .select('id')
          .eq('resume_id', currentResumeId)
          .limit(1);

      setCheckingLetter(false);

      if (existingLetters && existingLetters.length > 0) {
          // Found: Navigate to it
          navigate(`/cover-letter/${existingLetters[0].id}`);
      } else {
          // Not Found: Ask to create
          const confirmCreate = window.confirm("Aucune lettre de motivation n'est associée à ce CV pour le moment. Voulez-vous en créer une maintenant ?");
          
          if (confirmCreate && user) {
              // Pre-fill cover letter data from resume
              const newLetterData = {
                  ...INITIAL_RESUME_STATE, // Fallback schema match
                  personalInfo: {
                      fullName: resumeData.personalInfo.fullName,
                      email: resumeData.personalInfo.email,
                      phone: resumeData.personalInfo.phone,
                      address: resumeData.personalInfo.address
                  },
                  recipientInfo: {
                      managerName: "Responsable du recrutement",
                      company: "Nom de l'entreprise",
                      address: ""
                  },
                  content: {
                      subject: `Candidature au poste de ${resumeData.personalInfo.jobTitle}`,
                      opening: "Madame, Monsieur,",
                      body: ["(Utilisez l'IA pour générer le contenu complet basé sur votre CV et une offre d'emploi)"],
                      closing: "Je reste à votre disposition..."
                  },
                  signature: { type: 'text', text: resumeData.personalInfo.fullName, imageUrl: '' }
              };

              setCheckingLetter(true);
              const { data: newLetter, error } = await supabase.from('cover_letters').insert({
                  user_id: user.id,
                  title: `Lettre - ${resumeData.personalInfo.jobTitle || 'Nouveau'}`,
                  content: newLetterData,
                  template_id: template, // Match resume template style
                  resume_id: currentResumeId // Link to CV
              }).select().single();
              setCheckingLetter(false);

              if (newLetter && !error) {
                  navigate(`/cover-letter/${newLetter.id}`);
              } else {
                  console.error(error);
                  alert("Erreur lors de la création de la lettre.");
              }
          }
      }
  };

  const handleAiGeneration = async () => {
    if (!candidateName.trim()) {
        alert("Le nom est obligatoire.");
        return;
    }
    setAiLoading(true);
    try {
      // 1. Generate Resume
      const newResume = await generateResumeFromJobDescription(jobDescription, candidateName, resumeData, language);
      if (newResume) {
        setResumeData(prev => ({ ...prev, ...newResume }));
        
        // 2. If requested, generate Cover Letter based on the new resume
        if (generateCL && user) {
            // Need to save resume first to get an ID for linking? 
            // For now, we generate content first, user saves later.
            // But if we want to save CL immediately, we need resume saved ideally.
            // Let's generate content only and let user save via the Editor.
            
            // To properly link, we should save the resume first.
            let savedResumeId = id;
            if(!id) {
               // Implicit save
               const { data: savedData } = await supabase.from('resumes').insert({
                   user_id: user.id,
                   title: `CV - ${newResume.personalInfo.jobTitle}`,
                   content: newResume,
                   template_id: template,
                   updated_at: new Date().toISOString()
               }).select().single();
               if(savedData) savedResumeId = savedData.id;
            }

            if(savedResumeId) {
                const coverLetter = await generateCoverLetter(jobDescription, {...resumeData, ...newResume}, language);
                if (coverLetter) {
                    const { data: newCL } = await supabase.from('cover_letters').insert({
                        user_id: user.id,
                        title: `Lettre pour ${newResume.personalInfo.jobTitle || 'Poste'}`,
                        content: coverLetter,
                        template_id: 'modern',
                        resume_id: savedResumeId
                    }).select().single();
                    
                    if (newCL) {
                        if (window.confirm("Le CV et la lettre de motivation ont été générés ! Voulez-vous voir la lettre maintenant ?")) {
                            navigate(`/cover-letter/${newCL.id}`);
                            return; 
                        } else {
                            // If they stay, make sure we navigate to the saved resume ID if it was new
                            if(!id) navigate(`/editor/${savedResumeId}`, { replace: true });
                        }
                    }
                }
            }
        }
        setShowAiModal(false);
      }
    } catch (e) {
      alert("Error generating content. Please try again.");
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `resume-photos/${fileName}`;

    try {
        setLoading(true);
        const { error: uploadError } = await supabase.storage
            .from('public-files')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('public-files').getPublicUrl(filePath);
        updatePersonalInfo('photoUrl', data.publicUrl);
    } catch (error) {
        console.error('Error uploading image:', error);
        alert('Error uploading image');
    } finally {
        setLoading(false);
    }
  };

  // --- Export Logic ---
  
  const exportPDF = async () => {
    if (!previewRef.current) return;
    if (unsavedChanges) await saveResume();
    
    const element = previewRef.current;
    const clone = element.cloneNode(true) as HTMLElement;
    
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '-10000px';
    container.style.left = '-10000px';
    container.style.width = '210mm'; 
    container.style.minHeight = '297mm'; 
    container.style.zIndex = '-1000';
    container.style.background = '#ffffff';
    
    clone.style.display = 'block';
    clone.style.transform = 'none';
    clone.style.width = '100%';
    clone.style.height = 'auto';
    clone.style.boxShadow = 'none';
    clone.style.margin = '0';
    
    container.appendChild(clone);
    document.body.appendChild(container);

    try {
        setLoading(true);
        const canvas = await html2canvas(container, { 
          scale: 2, 
          useCORS: true, 
          backgroundColor: '#ffffff',
          width: container.offsetWidth, 
          windowWidth: container.offsetWidth
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; 
        const pageHeight = 297; 
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        pdf.save(`${title.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
        console.error("Export failed", err);
        alert("Export failed. Please try again.");
    } finally {
        document.body.removeChild(container);
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
           new Paragraph({ text: "" }), 
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

  const goBack = () => {
    if (unsavedChanges) {
        if (window.confirm("Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter ?")) {
            navigate('/dashboard');
        }
    } else {
        navigate('/dashboard');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-900 overflow-hidden">
      {/* Top Bar */}
      <div className="h-14 md:h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-2 md:px-4 z-20 shadow-sm shrink-0">
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          <button onClick={goBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent font-semibold text-base md:text-lg focus:outline-none border-b border-transparent focus:border-primary-500 w-full md:max-w-[200px] truncate"
          />
          {unsavedChanges && !loading && (
              <span className="hidden md:flex text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full items-center gap-1 animate-pulse font-medium whitespace-nowrap">
                  <AlertTriangle className="w-3 h-3" /> Non sauvegardé
              </span>
          )}
        </div>
        
        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          {/* BOUTON VERS LETTRE DE MOTIVATION CORRIGÉ */}
          <button 
            onClick={handleCoverLetterClick}
            disabled={checkingLetter}
            className="flex items-center gap-2 px-2 md:px-3 py-1.5 bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 rounded-lg text-xs md:text-sm font-medium hover:bg-pink-200 transition-colors disabled:opacity-50"
          >
            {checkingLetter ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            <span className="hidden md:inline">Lettre associée</span>
          </button>

          <button 
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center gap-2 px-2 md:px-3 py-1.5 bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 rounded-lg text-xs md:text-sm font-medium hover:bg-slate-200 transition-colors"
          >
            <Layout className="w-4 h-4" />
            <span className="hidden md:inline">{t.buttons.changeTemplate}</span>
          </button>

          <button 
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-2 px-2 md:px-3 py-1.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-lg text-xs md:text-sm font-medium hover:bg-indigo-200 transition-colors"
          >
            <Wand2 className="w-4 h-4" />
            <span className="hidden md:inline">{t.buttons.generateAI}</span>
          </button>
          
          <div className="h-6 w-px bg-slate-300 dark:bg-slate-600 mx-1 md:mx-2" />

          <button onClick={exportDOCX} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-blue-600" title="Export Word">
            <span className="font-bold text-xs border border-current px-1 rounded">W</span>
          </button>
          <button onClick={exportPDF} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-red-600" title="Export PDF">
             {loading ? <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div> : <Download className="w-5 h-5" />}
          </button>
          
          <button 
            onClick={saveResume}
            disabled={loading}
            className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium ml-1 md:ml-2 shadow-sm disabled:opacity-70 transition-all ${unsavedChanges ? 'bg-amber-600 hover:bg-amber-700 text-white md:animate-bounce' : 'bg-primary-600 hover:bg-primary-700 text-white'}`}
          >
            <Save className="w-4 h-4" />
            <span className="hidden md:inline">{t.buttons.save}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        <div className={`w-full md:w-5/12 lg:w-5/12 overflow-y-auto p-4 md:p-6 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-full ${mobileView === 'preview' ? 'hidden md:block' : 'block'}`}>
            <div className="flex space-x-1 mb-6 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg overflow-x-auto no-scrollbar">
                {['personal', 'experience', 'education', 'skills'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 md:px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${activeTab === tab ? 'bg-white dark:bg-slate-800 shadow text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {t.tabs[tab as keyof typeof t.tabs]}
                    </button>
                ))}
            </div>

            {activeTab === 'personal' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300 pb-20 md:pb-0">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-600 relative group">
                            {resumeData.personalInfo.photoUrl ? (
                                <img src={resumeData.personalInfo.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-8 h-8 text-slate-400" />
                            )}
                            <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white">
                                <Upload className="w-6 h-6" />
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                        </div>
                        <div className="flex-1">
                             <label className="block text-sm font-medium mb-1">{t.labels.photo}</label>
                             <div className="text-xs text-slate-500">Formats: JPG, PNG. Max 2MB.</div>
                        </div>
                    </div>

                    <InputField label={t.labels.fullName} value={resumeData.personalInfo.fullName} onChange={v => updatePersonalInfo('fullName', v)} />
                    <InputField label={t.labels.jobTitle} value={resumeData.personalInfo.jobTitle} onChange={v => updatePersonalInfo('jobTitle', v)} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Email" value={resumeData.personalInfo.email} onChange={v => updatePersonalInfo('email', v)} />
                        <InputField label="Phone" value={resumeData.personalInfo.phone} onChange={v => updatePersonalInfo('phone', v)} />
                    </div>
                    <InputField label="Address" value={resumeData.personalInfo.address} onChange={v => updatePersonalInfo('address', v)} />
                    <TextAreaField label={t.labels.summary} value={resumeData.personalInfo.summary} onChange={v => updatePersonalInfo('summary', v)} />
                </div>
            )}

            {activeTab === 'experience' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300 pb-20 md:pb-0">
                    {resumeData.experience.map((exp, idx) => (
                        <div key={exp.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/30 relative group">
                            <button 
                                onClick={() => {
                                    const newExp = resumeData.experience.filter((_, i) => i !== idx);
                                    setResumeData(prev => ({...prev, experience: newExp}));
                                }}
                                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 opacity-100 transition-opacity"
                            >
                                <Trash className="w-4 h-4" />
                            </button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300 pb-20 md:pb-0">
                    {resumeData.education.map((edu, idx) => (
                        <div key={edu.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/30 relative group">
                            <button 
                                onClick={() => {
                                    const newEdu = resumeData.education.filter((_, i) => i !== idx);
                                    setResumeData(prev => ({...prev, education: newEdu}));
                                }}
                                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 opacity-100 transition-opacity"
                            >
                                <Trash className="w-4 h-4" />
                            </button>
                            <div className="grid grid-cols-1 gap-4 mb-4">
                                <InputField label="Institution" value={edu.institution} onChange={v => updateEducation(idx, 'institution', v)} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300 pb-20 md:pb-0">
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

        {/* Preview Panel */}
        <div className={`w-full md:w-7/12 lg:w-7/12 bg-slate-200 dark:bg-slate-950 p-4 md:p-8 overflow-y-auto flex flex-col items-center h-full relative ${mobileView === 'editor' ? 'hidden md:flex' : 'flex'}`}>
             <div className="shadow-2xl origin-top transition-transform duration-300 scale-[0.45] sm:scale-50 md:scale-75 lg:scale-[0.85] xl:scale-90">
                <ResumePreview ref={previewRef} data={resumeData} template={template} />
             </div>
        </div>

        {/* Mobile View Toggle */}
        <div className="md:hidden fixed bottom-6 right-6 z-50">
            <button 
                onClick={() => setMobileView(mobileView === 'editor' ? 'preview' : 'editor')}
                className="w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105"
            >
                {mobileView === 'editor' ? <Eye className="w-6 h-6" /> : <Edit className="w-6 h-6" />}
            </button>
        </div>
      </div>

      {/* AI Modal (Hidden code remains same) */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600">
                <Wand2 className="w-5 h-5 text-indigo-500" />
                {t.aiModal.title}
            </h3>
            
            <div className="space-y-4 mb-4">
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
                 </div>

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
                 
                 <div className="flex items-center gap-2 pt-2">
                     <input 
                        type="checkbox" 
                        id="genCL" 
                        checked={generateCL} 
                        onChange={e => setGenerateCL(e.target.checked)} 
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                     />
                     <label htmlFor="genCL" className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                         {t.aiModal.includeCoverLetter}
                     </label>
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

      {/* Template Modal (Hidden for brevity, same as previous) */}
      {showTemplateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-5xl p-6 h-[85vh] flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold">{t.templateModal.title}</h3>
                      <button onClick={() => setShowTemplateModal(false)}><span className="text-2xl">&times;</span></button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-y-auto p-2">
                       {[
                           {id: 'modern', name: 'Modern', color: 'bg-slate-800'},
                           {id: 'classic', name: 'Classic', color: 'bg-white border'},
                           {id: 'minimalist', name: 'Minimalist', color: 'bg-indigo-50'},
                           {id: 'executive', name: 'Executive', color: 'bg-slate-900 border-t-4 border-yellow-500'},
                           {id: 'creative', name: 'Creative', color: 'bg-pink-50'},
                           {id: 'tech', name: 'Tech', color: 'bg-gray-900 font-mono'},
                           {id: 'compact', name: 'Compact', color: 'bg-blue-50'},
                           {id: 'timeline', name: 'Timeline', color: 'bg-white border-l-4 border-blue-500'},
                           {id: 'leftborder', name: 'Left Border', color: 'bg-white border-l-8 border-slate-800'},
                           {id: 'glitch', name: 'Glitch', color: 'bg-black border border-green-500'},
                           {id: 'swiss', name: 'Swiss', color: 'bg-red-600'},
                           {id: 'double', name: 'Double', color: 'bg-white border-t-8 border-indigo-900'},
                       ].map(tmp => (
                           <div 
                                key={tmp.id} 
                                onClick={() => { setTemplate(tmp.id as TemplateType); setShowTemplateModal(false); }}
                                className={`cursor-pointer group relative rounded-lg overflow-hidden border-2 transition-all ${template === tmp.id ? 'border-primary-500 ring-2 ring-primary-200' : 'border-transparent hover:border-slate-300'}`}
                           >
                               <div className={`aspect-[210/297] ${tmp.color} flex flex-col p-4 shadow-sm`}>
                                   <div className="w-1/2 h-4 bg-current opacity-20 mb-2 rounded"></div>
                                   <div className="w-full h-1 bg-current opacity-10 mb-1 rounded"></div>
                                   <div className="w-full h-1 bg-current opacity-10 mb-4 rounded"></div>
                                   <div className="flex-1 w-full bg-current opacity-5 rounded"></div>
                               </div>
                               <div className="absolute inset-x-0 bottom-0 bg-white/90 dark:bg-slate-900/90 p-3 text-center font-medium translate-y-full group-hover:translate-y-0 transition-transform">
                                   {tmp.name}
                                </div>
                               {template === tmp.id && (
                                   <div className="absolute top-2 right-2 bg-primary-600 text-white p-1 rounded-full shadow-lg">
                                       <Check className="w-4 h-4" />
                                   </div>
                               )}
                           </div>
                       ))}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

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
