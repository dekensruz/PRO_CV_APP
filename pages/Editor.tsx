
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { generateResumeFromJobDescription, generateCoverLetter } from '../services/geminiService';
import { useAuth, useApp } from '../App';
import { ResumeData, TemplateType, DesignSettings } from '../types';
import { INITIAL_RESUME_STATE, TRANSLATIONS, DEFAULT_DESIGN } from '../constants';
import ResumePreview from '../components/ResumePreview';
import { 
  Save, ArrowLeft, Wand2, Download, Eye, Layout, Plus, Trash, AlertTriangle, Mail, Loader2, Upload, Edit, CheckSquare, Palette, Type, AlignJustify, Circle
} from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { Packer, Document, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, TabStopType, TabStopPosition } from 'docx';
import saveAs from 'file-saver';

const COLORS = ['#0ea5e9', '#2563eb', '#4f46e5', '#7c3aed', '#db2777', '#e11d48', '#ea580c', '#059669', '#0d9488', '#1f2937'];

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
  const [aiStatus, setAiStatus] = useState<string>('');
  const [activeTab, setActiveTab] = useState('personal');
  
  // AI Modal States
  const [showAiModal, setShowAiModal] = useState(false);
  const [includeCoverLetter, setIncludeCoverLetter] = useState(false);
  
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  
  // Mobile View State
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  
  // Scaling State
  const [previewScale, setPreviewScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const lastSavedState = useRef<string>('');
  const [jobDescription, setJobDescription] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [title, setTitle] = useState('Mon CV');
  const previewRef = useRef<HTMLDivElement>(null);

  // --- RESPONSIVE SCALING LOGIC ---
  useLayoutEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // 210mm is approx 794px at 96 DPI.
        const targetWidth = 840; // A4 + some padding
        const newScale = Math.min((containerWidth - 32) / targetWidth, 1);
        setPreviewScale(newScale > 0 ? newScale : 0.5);
      }
    };
    handleResize();
    const observer = new ResizeObserver(() => window.requestAnimationFrame(handleResize));
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [mobileView]);

  useEffect(() => {
    if (location.state && location.state.template) {
      setTemplate(location.state.template);
    }
  }, [location.state]);

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

  useEffect(() => {
    const initializeEditor = async () => {
        if (id) {
            await loadResume(id);
        } else {
            const draft = localStorage.getItem('procv-draft-new');
            if (draft) {
                try {
                    const parsed = JSON.parse(draft);
                    if (window.confirm("Un brouillon non sauvegardé a été trouvé. Voulez-vous le restaurer ?")) {
                        setResumeData(parsed.data);
                        setTitle(parsed.title || 'Mon CV');
                        setTemplate(parsed.template || 'modern');
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
              personalInfo: { ...prev.personalInfo, fullName: user.user_metadata.full_name },
              design: DEFAULT_DESIGN
          }));
          setCandidateName(user.user_metadata.full_name);
      }
      lastSavedState.current = JSON.stringify({ 
          data: { ...INITIAL_RESUME_STATE, design: DEFAULT_DESIGN, personalInfo: { ...INITIAL_RESUME_STATE.personalInfo, fullName: user?.user_metadata?.full_name || '' }}, 
          title: 'Mon CV', 
          template: 'modern' 
      });
  };

  useEffect(() => {
      if (loading) return;
      const currentState = { data: resumeData, title, template };
      const currentStateString = JSON.stringify(currentState);
      
      if (lastSavedState.current && currentStateString !== lastSavedState.current) {
          setUnsavedChanges(true);
          const key = id ? `procv-draft-${id}` : 'procv-draft-new';
          localStorage.setItem(key, JSON.stringify({ ...currentState, timestamp: Date.now() }));
      } else {
          setUnsavedChanges(false);
      }
  }, [resumeData, title, template, id, loading]);

  const loadResume = async (resumeId: string) => {
    setLoading(true);
    const { data, error } = await supabase.from('resumes').select('*').eq('id', resumeId).single();
    if (data && !error) {
      setResumeData({...data.content, design: data.content.design || DEFAULT_DESIGN});
      setTitle(data.title);
      setTemplate(data.template_id as TemplateType);
      setCandidateName(data.content.personalInfo.fullName || '');
      lastSavedState.current = JSON.stringify({ data: {...data.content, design: data.content.design || DEFAULT_DESIGN}, title: data.title, template: data.template_id });
      setUnsavedChanges(false);
    }
    setLoading(false);
  };

  const saveResume = async () => {
    if (!user) return;
    setLoading(true);
    const payload = { user_id: user.id, title, content: resumeData, template_id: template, updated_at: new Date().toISOString() };
    let error, savedId = id;

    if (id) {
      ({ error } = await supabase.from('resumes').update(payload).eq('id', id));
      if (!error) localStorage.removeItem(`procv-draft-${id}`);
    } else {
      const { data, error: insertError } = await supabase.from('resumes').insert(payload).select().single();
      error = insertError;
      if (data) {
          savedId = data.id;
          localStorage.removeItem('procv-draft-new');
          navigate(`/editor/${data.id}`, { replace: true });
      }
    }
    if (error) alert("Erreur sauvegarde.");
    else {
        lastSavedState.current = JSON.stringify({ data: resumeData, title, template });
        setUnsavedChanges(false);
    }
    setLoading(false);
    return savedId;
  };

  const handleCoverLetterClick = async () => {
      let currentResumeId = id;
      if (unsavedChanges || !id) {
          currentResumeId = await saveResume();
          if (!currentResumeId) return;
      }

      setCheckingLetter(true);
      const { data: existingLetters } = await supabase.from('cover_letters').select('id').eq('resume_id', currentResumeId).limit(1);
      setCheckingLetter(false);

      if (existingLetters && existingLetters.length > 0) {
          navigate(`/cover-letter/${existingLetters[0].id}`);
      } else {
          const confirmCreate = window.confirm("Créer une lettre de motivation associée ?");
          if (confirmCreate && user) {
              const newLetterData = {
                  ...INITIAL_RESUME_STATE,
                  personalInfo: { ...resumeData.personalInfo },
                  recipientInfo: { managerName: "Responsable du recrutement", company: "Entreprise", address: "" },
                  content: { subject: `Candidature: ${resumeData.personalInfo.jobTitle}`, opening: "Madame, Monsieur,", body: ["(Générez le contenu avec l'IA)"], closing: "Cordialement," },
                  signature: { type: 'text', text: resumeData.personalInfo.fullName, imageUrl: '' },
                  design: resumeData.design || DEFAULT_DESIGN
              };
              const { data: newLetter } = await supabase.from('cover_letters').insert({
                  user_id: user.id, title: `Lettre - ${resumeData.personalInfo.jobTitle}`, content: newLetterData, template_id: template, resume_id: currentResumeId
              }).select().single();
              if (newLetter) navigate(`/cover-letter/${newLetter.id}`);
          }
      }
  };

  const handleAiGeneration = async () => {
    if (!candidateName.trim()) { alert("Nom obligatoire"); return; }
    setAiLoading(true);
    setAiStatus('Analyse de l\'offre et rédaction du CV...');
    
    try {
      const newResume = await generateResumeFromJobDescription(jobDescription, candidateName, resumeData, language);
      
      if (newResume) {
        const updatedResumeData = { 
            ...resumeData, 
            ...newResume, 
            personalInfo: { 
                ...resumeData.personalInfo, 
                ...newResume.personalInfo,
                fullName: candidateName 
            },
            design: resumeData.design || DEFAULT_DESIGN 
        };

        setResumeData(updatedResumeData);
        
        let savedResumeId = id;
        if (user) {
            const payload = {
                user_id: user.id,
                title: title || 'CV Généré',
                content: updatedResumeData,
                template_id: template,
                updated_at: new Date().toISOString()
            };

            if (id) {
                await supabase.from('resumes').update(payload).eq('id', id);
            } else {
                const { data: insertedResume } = await supabase.from('resumes').insert(payload).select().single();
                if (insertedResume) {
                    savedResumeId = insertedResume.id;
                    navigate(`/editor/${insertedResume.id}`, { replace: true });
                }
            }
        }
        
        if (includeCoverLetter && user && savedResumeId) {
            setAiStatus('Rédaction de la lettre de motivation...');
            
            const newLetter = await generateCoverLetter(jobDescription, updatedResumeData, language);
            
            if (newLetter) {
                const { data: savedLetter } = await supabase.from('cover_letters').insert({
                    user_id: user.id,
                    title: `Lettre - ${updatedResumeData.personalInfo.jobTitle || 'Nouvelle'}`,
                    content: { ...newLetter, design: updatedResumeData.design },
                    template_id: template,
                    resume_id: savedResumeId
                }).select().single();

                setShowAiModal(false);
                setAiStatus('');
                setAiLoading(false);

                if (window.confirm("CV et Lettre de motivation générés et sauvegardés ! Ouvrir la lettre maintenant ?")) {
                    if (savedLetter) navigate(`/cover-letter/${savedLetter.id}`);
                }
                return; 
            }
        }
        
        setUnsavedChanges(false);
        lastSavedState.current = JSON.stringify({ data: updatedResumeData, title, template });
        setShowAiModal(false);
        alert("CV généré et sauvegardé avec succès !");
      }
    } catch (e) { console.error(e); alert("Une erreur est survenue lors de la génération."); } 
    finally { 
        setAiLoading(false); 
        setAiStatus('');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const fileName = `resume-photos/${Math.random()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('public-files').upload(fileName, file);
    if (!error) {
        const { data } = supabase.storage.from('public-files').getPublicUrl(fileName);
        updatePersonalInfo('photoUrl', data.publicUrl);
    }
  };

  // --- EXPORT PDF ROBUST FIX (CLONE & CAPTURE) ---
  const exportPDF = async (forceOnePage = false) => {
    if (!previewRef.current) return;
    setLoading(true);

    try {
        const element = previewRef.current;
        await document.fonts.ready;

        const clone = element.cloneNode(true) as HTMLElement;
        const a4WidthPx = 794; 
        
        // Remove the Page Break Marker from the clone
        const pageMarker = clone.querySelector('.page-break-marker');
        if (pageMarker) {
            pageMarker.remove();
        }

        clone.style.position = 'fixed';
        clone.style.top = '0px'; 
        clone.style.left = '0px';
        clone.style.zIndex = '-9999';
        clone.style.width = `${a4WidthPx}px`;
        clone.style.height = 'auto'; 
        clone.style.minHeight = '1123px';
        clone.style.transform = 'none'; 
        clone.style.margin = '0';
        clone.style.padding = '0'; 
        clone.style.backgroundColor = '#ffffff'; 
        
        document.body.appendChild(clone);

        const images = Array.from(clone.getElementsByTagName('img'));
        await Promise.all(images.map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve; 
            });
        }));

        await new Promise(resolve => setTimeout(resolve, 500));

        // switched to toPng with higher pixelRatio for better quality text
        const dataUrl = await toPng(clone, {
            quality: 1.0,
            pixelRatio: 3, // Increased for sharpness
            backgroundColor: '#ffffff',
            width: a4WidthPx,
            height: clone.scrollHeight,
            cacheBust: true,
            filter: (node) => {
              if (node.tagName === 'LINK' && (node as HTMLLinkElement).href.includes('fonts.googleapis')) {
                return false;
              }
              return true;
            },
        });

        document.body.removeChild(clone);
        
        if (!dataUrl || dataUrl.length < 1000) {
            throw new Error("Generation failed - Image data too short.");
        }

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
        });

        const pdfWidth = 210;
        const pdfHeight = 297;
        
        const imgProps = pdf.getImageProperties(dataUrl);
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

        // Auto-Fit logic: If selected, force image into one page
        if (forceOnePage) {
            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, Math.min(imgHeight, pdfHeight), undefined, 'FAST');
        } else {
             if (imgHeight <= pdfHeight + 5) {
                 pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, imgHeight, undefined, 'FAST'); 
            } else {
                 let heightLeft = imgHeight;
                 let position = 0;
                 let page = 0;
                 
                 pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
                 heightLeft -= pdfHeight;

                 while (heightLeft > 0) {
                    page++;
                    position = - (page * pdfHeight); 
                    pdf.addPage();
                    pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
                    heightLeft -= pdfHeight;
                 }
            }
        }

        pdf.save(`${title.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
        console.error("Export failed", err);
        alert("Erreur export PDF. Veuillez réessayer.");
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
               text: resumeData.personalInfo.fullName.toUpperCase(), 
               heading: HeadingLevel.TITLE, 
               alignment: AlignmentType.CENTER,
               spacing: { after: 100 }
           }),
           new Paragraph({ 
               text: resumeData.personalInfo.jobTitle, 
               alignment: AlignmentType.CENTER,
               run: { size: 24, bold: true, color: "555555" },
               spacing: { after: 200 }
           }),
           new Paragraph({ 
               alignment: AlignmentType.CENTER,
               children: [
                   new TextRun(resumeData.personalInfo.email),
                   new TextRun(" | "),
                   new TextRun(resumeData.personalInfo.phone),
                   new TextRun(" | "),
                   new TextRun(resumeData.personalInfo.address)
               ],
               spacing: { after: 400 }
           }),
           ...(resumeData.personalInfo.summary ? [
                new Paragraph({ 
                    text: "PROFIL PROFESSIONNEL", 
                    heading: HeadingLevel.HEADING_1, 
                    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "auto" } } 
                }),
                new Paragraph({ 
                    text: resumeData.personalInfo.summary,
                    alignment: AlignmentType.JUSTIFIED,
                    spacing: { after: 300 }
                })
           ] : []),
           new Paragraph({ 
               text: "EXPÉRIENCE PROFESSIONNELLE", 
               heading: HeadingLevel.HEADING_1, 
               border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "auto" } },
               spacing: { before: 400 }
           }),
           ...resumeData.experience.flatMap(exp => [
               new Paragraph({ 
                   children: [
                       new TextRun({ text: exp.position, bold: true, size: 24 }),
                       new TextRun({ text: "\t" }),
                       new TextRun({ text: `${exp.startDate} - ${exp.endDate}`, italics: true })
                   ],
                   tabStops: [
                       { type: TabStopType.RIGHT, position: TabStopPosition.MAX }
                   ],
                   heading: HeadingLevel.HEADING_2
               }),
               new Paragraph({ 
                   text: exp.company, 
                   run: { italics: true, bold: true, color: "444444" },
                   spacing: { after: 100 } 
               }),
               new Paragraph({ 
                   text: exp.description,
                   alignment: AlignmentType.JUSTIFIED,
                   spacing: { after: 300 }
               }),
           ]),
           new Paragraph({ 
               text: "FORMATION", 
               heading: HeadingLevel.HEADING_1, 
               border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "auto" } },
               spacing: { before: 400 }
           }),
           ...resumeData.education.flatMap(edu => [
               new Paragraph({ 
                   children: [
                       new TextRun({ text: edu.institution, bold: true, size: 24 }),
                       new TextRun({ text: "\t" }),
                       new TextRun({ text: `${edu.startDate} - ${edu.endDate}`, italics: true })
                   ],
                   tabStops: [
                       { type: TabStopType.RIGHT, position: TabStopPosition.MAX }
                   ],
                   heading: HeadingLevel.HEADING_2
               }),
               new Paragraph({ 
                   text: `${edu.degree} - ${edu.field}`,
                   spacing: { after: 300 }
               }),
           ]),
           new Paragraph({ 
               text: "COMPÉTENCES", 
               heading: HeadingLevel.HEADING_1, 
               border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "auto" } },
               spacing: { before: 400 }
           }),
           new Paragraph({ 
               text: resumeData.skills.join(" • "),
               spacing: { after: 200 }
           })
        ]
      }]
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${title}.docx`);
  };

  const updatePersonalInfo = (f: string, v: string) => setResumeData(p => ({...p, personalInfo: {...p.personalInfo, [f]: v}}));
  const updateExperience = (i: number, f: string, v: any) => { const n = [...resumeData.experience]; n[i] = {...n[i], [f]: v}; setResumeData(p => ({...p, experience: n})); };
  const addExperience = () => setResumeData(p => ({...p, experience: [...p.experience, { id: crypto.randomUUID(), company: '', position: '', startDate: '', endDate: '', current: false, description: '' }]}));
  const updateEducation = (i: number, f: string, v: any) => { const n = [...resumeData.education]; n[i] = {...n[i], [f]: v}; setResumeData(p => ({...p, education: n})); };
  const addEducation = () => setResumeData(p => ({...p, education: [...p.education, { id: crypto.randomUUID(), institution: '', degree: '', field: '', startDate: '', endDate: '', current: false }]}));
  const updateDesign = (f: keyof DesignSettings, v: string) => setResumeData(p => ({...p, design: {...(p.design || DEFAULT_DESIGN), [f]: v}}));
  const goBack = () => unsavedChanges && !window.confirm("Modifications non sauvegardées. Quitter ?") ? null : navigate('/dashboard');

  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-900 overflow-hidden">
      {/* Navbar */}
      <div className="h-14 md:h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-2 md:px-4 z-20 shadow-sm shrink-0">
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          <button onClick={goBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full shrink-0"><ArrowLeft className="w-5 h-5" /></button>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-transparent font-semibold text-base md:text-lg focus:outline-none border-b border-transparent focus:border-primary-500 w-full md:max-w-[200px] truncate" />
          {unsavedChanges && !loading && <span className="hidden md:flex text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full items-center gap-1 animate-pulse"><AlertTriangle className="w-3 h-3" /> Non sauvegardé</span>}
        </div>
        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          <button onClick={handleCoverLetterClick} disabled={checkingLetter} className="flex items-center gap-2 px-2 md:px-3 py-1.5 bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 rounded-lg text-xs md:text-sm font-medium hover:bg-pink-200 transition-colors disabled:opacity-50">
             {checkingLetter ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />} <span className="hidden md:inline">Lettre</span>
          </button>
          <button onClick={() => setShowTemplateModal(true)} className="flex items-center gap-2 px-2 md:px-3 py-1.5 bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 rounded-lg text-xs md:text-sm font-medium hover:bg-slate-200"><Layout className="w-4 h-4"/><span className="hidden md:inline">{t.buttons.changeTemplate}</span></button>
          <button onClick={() => setShowAiModal(true)} className="flex items-center gap-2 px-2 md:px-3 py-1.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-lg text-xs md:text-sm font-medium hover:bg-indigo-200"><Wand2 className="w-4 h-4"/><span className="hidden md:inline">{t.buttons.generateAI}</span></button>
          <div className="h-6 w-px bg-slate-300 dark:bg-slate-600 mx-1"></div>
          <button onClick={exportDOCX} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-blue-600 font-bold text-xs border border-current">W</button>
          <button onClick={() => {
              if (window.confirm("Voulez-vous adapter le contenu à une seule page ? (Auto-Fit)")) {
                  exportPDF(true);
              } else {
                  exportPDF(false);
              }
          }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-red-600" title="Export PDF (Click for Auto-Fit option)">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
          </button>
          <button onClick={saveResume} disabled={loading} className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium ml-1 shadow-sm transition-all ${unsavedChanges ? 'bg-amber-600 text-white' : 'bg-primary-600 text-white'}`}><Save className="w-4 h-4" /><span className="hidden md:inline">{t.buttons.save}</span></button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Editor Column */}
        <div className={`w-full md:w-5/12 lg:w-5/12 overflow-y-auto p-4 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-full ${mobileView === 'preview' ? 'hidden md:block' : 'block'}`}>
             <div className="flex space-x-1 mb-6 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg overflow-x-auto no-scrollbar">
                {['personal', 'experience', 'education', 'skills', 'design'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 md:px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${activeTab === tab ? 'bg-white dark:bg-slate-800 shadow text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}>{t.tabs[tab as keyof typeof t.tabs]}</button>
                ))}
            </div>
            {/* Form Inputs */}
            {activeTab === 'personal' && (
                <div className="space-y-4 pb-20 md:pb-0">
                    <InputField label={t.labels.fullName} value={resumeData.personalInfo.fullName} onChange={v => updatePersonalInfo('fullName', v)} />
                    <InputField label={t.labels.jobTitle} value={resumeData.personalInfo.jobTitle} onChange={v => updatePersonalInfo('jobTitle', v)} />
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Email" value={resumeData.personalInfo.email} onChange={v => updatePersonalInfo('email', v)} />
                        <InputField label="Phone" value={resumeData.personalInfo.phone} onChange={v => updatePersonalInfo('phone', v)} />
                    </div>
                    <InputField label="Address" value={resumeData.personalInfo.address} onChange={v => updatePersonalInfo('address', v)} />
                    <TextAreaField label={t.labels.summary} value={resumeData.personalInfo.summary} onChange={v => updatePersonalInfo('summary', v)} />
                    <div className="mt-4"><label className="text-xs font-semibold text-slate-500 uppercase">Photo</label><div className="flex items-center gap-2 mt-1"><label className="cursor-pointer bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2"><Upload className="w-4 h-4"/> Choisir<input type="file" accept="image/*" className="hidden" onChange={handleImageUpload}/></label></div></div>
                </div>
            )}
             {activeTab === 'experience' && (
                <div className="space-y-6 pb-20 md:pb-0">
                    {resumeData.experience.map((exp, idx) => (
                        <div key={exp.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/30 relative">
                             <button onClick={() => { const n = resumeData.experience.filter((_, i) => i !== idx); setResumeData(p => ({...p, experience: n})); }} className="absolute top-2 right-2 text-slate-400 hover:text-red-500"><Trash className="w-4 h-4" /></button>
                             <div className="grid grid-cols-2 gap-4 mb-2">
                                <InputField label="Company" value={exp.company} onChange={v => updateExperience(idx, 'company', v)} />
                                <InputField label="Position" value={exp.position} onChange={v => updateExperience(idx, 'position', v)} />
                             </div>
                             <div className="grid grid-cols-2 gap-4 mb-2">
                                <InputField label="Start" value={exp.startDate} onChange={v => updateExperience(idx, 'startDate', v)} />
                                <InputField label="End" value={exp.endDate} onChange={v => updateExperience(idx, 'endDate', v)} />
                             </div>
                             <TextAreaField label="Description" value={exp.description} onChange={v => updateExperience(idx, 'description', v)} />
                        </div>
                    ))}
                    <button onClick={addExperience} className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-primary-500 flex items-center justify-center gap-2"><Plus className="w-4 h-4"/> Ajouter</button>
                </div>
             )}
             {activeTab === 'education' && (
                <div className="space-y-6 pb-20 md:pb-0">
                    {resumeData.education.map((edu, idx) => (
                        <div key={edu.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/30 relative">
                             <button onClick={() => { const n = resumeData.education.filter((_, i) => i !== idx); setResumeData(p => ({...p, education: n})); }} className="absolute top-2 right-2 text-slate-400 hover:text-red-500"><Trash className="w-4 h-4" /></button>
                             <InputField label="Institution" value={edu.institution} onChange={v => updateEducation(idx, 'institution', v)} />
                             <div className="grid grid-cols-2 gap-4 my-2">
                                <InputField label="Degree" value={edu.degree} onChange={v => updateEducation(idx, 'degree', v)} />
                                <InputField label="Field" value={edu.field} onChange={v => updateEducation(idx, 'field', v)} />
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                <InputField label="Start" value={edu.startDate} onChange={v => updateEducation(idx, 'startDate', v)} />
                                <InputField label="End" value={edu.endDate} onChange={v => updateEducation(idx, 'endDate', v)} />
                             </div>
                        </div>
                    ))}
                    <button onClick={addEducation} className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-primary-500 flex items-center justify-center gap-2"><Plus className="w-4 h-4"/> Ajouter</button>
                </div>
             )}
             {activeTab === 'skills' && (
                 <div className="pb-20 md:pb-0">
                     <TextAreaField label="Compétences (séparées par des virgules)" value={resumeData.skills.join(', ')} onChange={v => setResumeData(p => ({...p, skills: v.split(',').map(s => s.trim())}))} />
                 </div>
             )}
             {activeTab === 'design' && (
                <div className="space-y-8 pb-20 md:pb-0">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-3"><Palette className="w-4 h-4"/> Couleur Principale</label>
                        <div className="flex flex-wrap gap-2">
                            {COLORS.map(c => (
                                <button 
                                    key={c} 
                                    onClick={() => updateDesign('color', c)} 
                                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${resumeData.design?.color === c ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent'}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>
                    
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-3"><Type className="w-4 h-4"/> Police</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['sans', 'serif', 'mono'].map(f => (
                                <button 
                                    key={f}
                                    onClick={() => updateDesign('font', f)}
                                    className={`py-2 px-3 border rounded-lg text-sm capitalize ${resumeData.design?.font === f ? 'bg-primary-100 border-primary-500 text-primary-700' : 'border-slate-200 dark:border-slate-700'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-3"><Circle className="w-4 h-4"/> Formes</label>
                        <div className="grid grid-cols-3 gap-2">
                             {['none', 'medium', 'full'].map(r => (
                                <button 
                                    key={r}
                                    onClick={() => updateDesign('borderRadius', r)}
                                    className={`py-2 px-3 border rounded-lg text-sm capitalize ${resumeData.design?.borderRadius === r ? 'bg-primary-100 border-primary-500 text-primary-700' : 'border-slate-200 dark:border-slate-700'}`}
                                >
                                    {r === 'none' ? 'Carré' : r === 'medium' ? 'Arrondi' : 'Rond'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-3"><AlignJustify className="w-4 h-4"/> Espacement</label>
                        <div className="grid grid-cols-3 gap-2">
                             {['compact', 'normal', 'spacious'].map(s => (
                                <button 
                                    key={s}
                                    onClick={() => updateDesign('spacing', s)}
                                    className={`py-2 px-3 border rounded-lg text-sm capitalize ${resumeData.design?.spacing === s ? 'bg-primary-100 border-primary-500 text-primary-700' : 'border-slate-200 dark:border-slate-700'}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Taille du Texte</label>
                         <div className="grid grid-cols-3 gap-2">
                             {['small', 'medium', 'large'].map(s => (
                                <button 
                                    key={s}
                                    onClick={() => updateDesign('fontSize', s)}
                                    className={`py-2 px-3 border rounded-lg text-sm capitalize ${resumeData.design?.fontSize === s ? 'bg-primary-100 border-primary-500 text-primary-700' : 'border-slate-200 dark:border-slate-700'}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
             )}
        </div>

        {/* Preview Column */}
        <div ref={containerRef} className={`w-full md:w-7/12 lg:w-7/12 bg-slate-200 dark:bg-slate-950 overflow-y-auto relative flex flex-col items-center py-8 ${mobileView === 'editor' ? 'hidden md:flex' : 'flex'}`}>
             <div 
                style={{ 
                    width: `${794 * previewScale}px`, 
                    height: `${1123 * previewScale}px` 
                }} 
                className="relative shadow-2xl transition-all duration-200 ease-out shrink-0"
             >
                 <div 
                    className="origin-top-left bg-white"
                    style={{ 
                        transform: `scale(${previewScale})`,
                        width: '794px',
                        minHeight: '1123px'
                    }}
                 >
                    <div ref={previewRef} className="w-full h-full relative">
                        {/* Page Break Indicator for Visual Feedback */}
                        <div className="absolute top-[1123px] left-0 w-full border-b-2 border-dashed border-red-500 z-50 pointer-events-none opacity-50 flex items-end justify-end page-break-marker">
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-t">Fin de Page A4 (Ne sera pas imprimé)</span>
                        </div>
                        <ResumePreview data={resumeData} template={template} />
                    </div>
                 </div>
             </div>
             <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur text-white px-3 py-1 rounded-full text-xs pointer-events-none z-10">
                 Zoom: {Math.round(previewScale * 100)}%
             </div>
        </div>

        <div className="md:hidden fixed bottom-6 right-6 z-50">
            <button onClick={() => setMobileView(mobileView === 'editor' ? 'preview' : 'editor')} className="w-14 h-14 bg-primary-600 text-white rounded-full shadow-xl flex items-center justify-center">{mobileView === 'editor' ? <Eye className="w-6 h-6" /> : <Edit className="w-6 h-6" />}</button>
        </div>
      </div>
      
      {showAiModal && <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 md:pt-0 md:items-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl w-full max-w-lg shadow-2xl relative">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-600"><Wand2 className="w-5 h-5"/> Générer avec IA</h3>
                
                <div className="mb-4">
                     <label className="text-sm font-semibold text-slate-500 mb-1 block">Votre Nom</label>
                     <input 
                        className="w-full p-3 border rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" 
                        placeholder="Ex: Dekens Ruzuba" 
                        value={candidateName} 
                        onChange={e => setCandidateName(e.target.value)} 
                     />
                </div>

                <div className="mb-4">
                     <label className="text-sm font-semibold text-slate-500 mb-1 block">Offre d'emploi</label>
                     <textarea 
                        className="w-full p-3 border rounded-lg h-32 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none resize-none" 
                        placeholder="Collez la description du poste ici..." 
                        value={jobDescription} 
                        onChange={e => setJobDescription(e.target.value)}
                        autoFocus
                     />
                </div>
                
                <div className="mb-6" onClick={() => setIncludeCoverLetter(!includeCoverLetter)}>
                    <div className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${includeCoverLetter ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-400'}`}>
                            {includeCoverLetter && <CheckSquare className="w-3.5 h-3.5" />}
                        </div>
                        <span className="text-sm font-medium select-none">Générer aussi une lettre de motivation</span>
                    </div>
                </div>
                
                {aiLoading && aiStatus && (
                    <div className="mb-4 text-center text-sm font-medium text-indigo-600 animate-pulse">
                        {aiStatus}
                    </div>
                )}

                <div className="flex justify-end gap-3">
                    <button onClick={() => setShowAiModal(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">Annuler</button>
                    <button 
                        onClick={handleAiGeneration} 
                        disabled={aiLoading} 
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 font-medium disabled:opacity-50"
                    >
                        {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                        {aiLoading ? 'Génération...' : 'Générer'}
                    </button>
                </div>
            </div>
      </div>}
      
      {showTemplateModal && <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-800 p-6 rounded-xl w-full max-w-4xl h-[80vh] flex flex-col">
               <div className="flex justify-between mb-4"><h3 className="text-xl font-bold">Modèles</h3><button onClick={() => setShowTemplateModal(false)}>X</button></div>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 overflow-y-auto">
                   {['modern', 'classic', 'minimalist', 'executive', 'creative', 'tech', 'glitch', 'swiss', 'neo', 'bold', 'symmetry', 'elegant'].map(t => (
                       <button key={t} onClick={() => { setTemplate(t as TemplateType); setShowTemplateModal(false); }} className={`p-4 border rounded ${template === t ? 'border-primary-500 bg-primary-50' : ''} uppercase font-bold text-xs`}>{t}</button>
                   ))}
               </div>
           </div>
      </div>}
    </div>
  );
};

const InputField = ({ label, value, onChange, type="text" }: any) => <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-slate-500 uppercase">{label}</label><input type={type} value={value||''} onChange={e=>onChange(e.target.value)} className="px-3 py-2 border rounded-lg bg-transparent"/></div>;
const TextAreaField = ({ label, value, onChange }: any) => <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-slate-500 uppercase">{label}</label><textarea rows={4} value={value||''} onChange={e=>onChange(e.target.value)} className="px-3 py-2 border rounded-lg bg-transparent resize-none"/></div>;

export default Editor;
