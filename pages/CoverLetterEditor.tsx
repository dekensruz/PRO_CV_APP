
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { generateCoverLetter } from '../services/geminiService';
import { useAuth, useApp } from '../App';
import { CoverLetterData, TemplateType, ResumeData, DesignSettings } from '../types';
import { INITIAL_COVER_LETTER_STATE, INITIAL_RESUME_STATE, TRANSLATIONS, DEFAULT_DESIGN } from '../constants';
import CoverLetterPreview from '../components/CoverLetterPreview';
import { Save, ArrowLeft, Download, Upload, Eraser, Pen, Type, Loader2, Layout, Wand2, Eye, Edit, Palette, AlignJustify, Circle, CheckSquare } from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, AlignmentType, TextRun, HeadingLevel } from 'docx';
import saveAs from 'file-saver';

const COLORS = ['#0ea5e9', '#2563eb', '#4f46e5', '#7c3aed', '#db2777', '#e11d48', '#ea580c', '#059669', '#0d9488', '#1f2937'];

const CoverLetterEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useApp();
  const t = TRANSLATIONS[language].editor;
  
  const [data, setData] = useState<CoverLetterData>(INITIAL_COVER_LETTER_STATE);
  const [title, setTitle] = useState('Ma Lettre');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'recipient' | 'signature' | 'design'>('content');
  const [template, setTemplate] = useState<TemplateType>('modern');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');

  // Scaling
  const [previewScale, setPreviewScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // --- RESPONSIVE SCALING ---
  useLayoutEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const targetWidth = 840; // 794 + buffer
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
    if (id) loadLetter(id);
    else if (user?.user_metadata?.full_name) {
        setData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, fullName: user.user_metadata.full_name }, design: DEFAULT_DESIGN }));
    }
  }, [id, user]);

  const loadLetter = async (letterId: string) => {
    setLoading(true);
    const { data: letter } = await supabase.from('cover_letters').select('*').eq('id', letterId).single();
    if (letter) {
        setData({...letter.content, design: letter.content.design || DEFAULT_DESIGN});
        setTitle(letter.title);
        setTemplate(letter.template_id || 'modern');
    }
    setLoading(false);
  };

  const saveLetter = async () => {
      if (!user) return;
      setLoading(true);
      const payload = { user_id: user.id, title, content: data, template_id: template, updated_at: new Date().toISOString() };

      if (id) {
          await supabase.from('cover_letters').update(payload).eq('id', id);
      } else {
          const { data: newLetter } = await supabase.from('cover_letters').insert(payload).select().single();
          if (newLetter) navigate(`/cover-letter/${newLetter.id}`, { replace: true });
      }
      setLoading(false);
  };

  const handleAiGeneration = async () => {
      if (!jobDescription.trim()) return;
      setAiLoading(true);
      try {
          const tempResumeData: ResumeData = { ...INITIAL_RESUME_STATE, personalInfo: { ...INITIAL_RESUME_STATE.personalInfo, fullName: data.personalInfo.fullName, email: data.personalInfo.email, phone: data.personalInfo.phone, address: data.personalInfo.address } };
          const result = await generateCoverLetter(jobDescription, tempResumeData, language);
          if (result) {
              setData(prev => ({ ...prev, recipientInfo: result.recipientInfo, content: result.content }));
              setShowAiModal(false);
              setJobDescription('');
          }
      } catch (e) { console.error(e); alert("Erreur génération"); } 
      finally { setAiLoading(false); }
  };

  // --- Export PDF ROBUST FIX (CLONE & CAPTURE) ---
  const exportPDF = async (forceOnePage = false) => {
      if (!previewRef.current) return;
      setLoading(true);
      
      try {
          const element = previewRef.current;
          await document.fonts.ready;

          // 1. Clone element to avoid interference from scaling/responsive layout
          const clone = element.cloneNode(true) as HTMLElement;

          // Remove the Page Break Marker from the clone
          const pageMarker = clone.querySelector('.page-break-marker');
          if (pageMarker) {
              pageMarker.remove();
          }

          // 2. Position clone off-screen but strictly sized A4
          const a4WidthPx = 794;
          clone.style.position = 'fixed';
          clone.style.top = '0px'; 
          clone.style.left = '0px';
          clone.style.zIndex = '-9999';
          clone.style.width = `${a4WidthPx}px`;
          clone.style.height = 'auto';
          clone.style.minHeight = '1123px';
          clone.style.transform = 'none'; // Ensure no scale
          clone.style.margin = '0';
          clone.style.padding = '0';
          clone.style.backgroundColor = '#ffffff'; // Force white background

          // 3. Append to body
          document.body.appendChild(clone);

          // 4. Wait for any images in the clone
          const images = Array.from(clone.getElementsByTagName('img'));
          await Promise.all(images.map(img => {
              if (img.complete) return Promise.resolve();
              return new Promise(resolve => {
                  img.onload = resolve;
                  img.onerror = resolve; 
              });
          }));

          // Allow layout to settle
          await new Promise(resolve => setTimeout(resolve, 500));

          // 5. Capture AS PNG (Higher Quality)
          const dataUrl = await toPng(clone, { 
              quality: 1.0, 
              pixelRatio: 3, // Increased for sharpness
              backgroundColor: '#ffffff',
              cacheBust: true,
              width: a4WidthPx,
              height: clone.scrollHeight,
              filter: (node) => {
                if (node.tagName === 'LINK' && (node as HTMLLinkElement).href.includes('fonts.googleapis')) {
                  return false;
                }
                return true;
              }
          });
          
          // 6. Cleanup
          document.body.removeChild(clone);

          if (!dataUrl || dataUrl.length < 1000) {
              throw new Error("Export failed - Image data invalid.");
          }

          const pdf = new jsPDF('p', 'mm', 'a4', true);
          const pdfWidth = 210;
          const pdfHeight = 297;
          
          const imgProps = pdf.getImageProperties(dataUrl);
          const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
          
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
          
          pdf.save(`${title}.pdf`);
      } catch(e) { console.error(e); alert("Erreur d'exportation PDF"); } 
      finally { 
          setLoading(false); 
      }
  };

  const exportDOCX = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
            // Header (Personal Info) - Left Aligned
            new Paragraph({ text: data.personalInfo.fullName, heading: HeadingLevel.HEADING_1 }),
            new Paragraph({ text: data.personalInfo.address }),
            new Paragraph({ text: `${data.personalInfo.email} | ${data.personalInfo.phone}`, spacing: { after: 400 } }),

            // Date - Right Aligned
            new Paragraph({ 
                text: new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }), 
                alignment: AlignmentType.RIGHT, 
                spacing: { after: 400 } 
            }),

            // Recipient Info - Left Aligned
            new Paragraph({ text: data.recipientInfo.managerName, bold: true }),
            new Paragraph({ text: data.recipientInfo.company, bold: true }),
            new Paragraph({ text: data.recipientInfo.address, spacing: { after: 400 } }),

            // Object Line
            new Paragraph({ 
                children: [
                    new TextRun({ text: "Objet : ", bold: true }),
                    new TextRun({ text: data.content.subject })
                ], 
                spacing: { after: 300 } 
            }),

            // Opening
            new Paragraph({ text: data.content.opening, spacing: { after: 200 } }),

            // Body Paragraphs - Justified
            ...data.content.body.map(p => new Paragraph({ text: p, alignment: AlignmentType.JUSTIFIED, spacing: { after: 200 } })),

            // Closing
            new Paragraph({ text: data.content.closing, spacing: { before: 200, after: 400 } }),

            // Signature
            new Paragraph({ text: "Cordialement,", spacing: { after: 200 } }),
            new Paragraph({ 
                text: data.signature.text || data.personalInfo.fullName, 
                bold: true 
            }),
        ]
      }]
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${title}.docx`);
  };

  const getMousePos = (canvas: HTMLCanvasElement, evt: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      let clientX, clientY;
      if ('touches' in evt) { clientX = evt.touches[0].clientX; clientY = evt.touches[0].clientY; } 
      else { clientX = (evt as MouseEvent).clientX; clientY = (evt as MouseEvent).clientY; }
      return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };
  const startDrawing = (e: any) => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx || !canvasRef.current) return;
      if (e.type === 'touchstart') e.preventDefault();
      const pos = getMousePos(canvasRef.current, e.nativeEvent ? e.nativeEvent : e);
      ctx.beginPath(); ctx.moveTo(pos.x, pos.y); ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#000';
      setIsDrawing(true);
  };
  const draw = (e: any) => {
      if (!isDrawing || !canvasRef.current) return;
      if (e.type === 'touchmove') e.preventDefault();
      const ctx = canvasRef.current.getContext('2d');
      const pos = getMousePos(canvasRef.current, e.nativeEvent ? e.nativeEvent : e);
      ctx?.lineTo(pos.x, pos.y); ctx?.stroke();
  };
  const stopDrawing = () => {
      if (isDrawing && canvasRef.current) {
          setIsDrawing(false);
          setData(prev => ({ ...prev, signature: { ...prev.signature, type: 'draw', imageUrl: canvasRef.current!.toDataURL() } }));
      }
  };
  const clearCanvas = () => { canvasRef.current?.getContext('2d')?.clearRect(0, 0, 400, 150); setData(p => ({ ...p, signature: { ...p.signature, imageUrl: '' } })); };
  const handleImageUpload = async (e: any) => {
      if (!e.target.files?.[0]) return;
      const file = e.target.files[0];
      const fileName = `signatures/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from('public-files').upload(fileName, file);
      if (!error) {
          const { data } = supabase.storage.from('public-files').getPublicUrl(fileName);
          setData(p => ({ ...p, signature: { ...p.signature, type: 'image', imageUrl: data.publicUrl } }));
      }
  };
  const updateDesign = (f: keyof DesignSettings, v: string) => setData(p => ({...p, design: {...(p.design || DEFAULT_DESIGN), [f]: v}}));

  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-900">
        <div className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4">
             <div className="flex items-center gap-4">
                 <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft className="w-5 h-5" /></button>
                 <input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-transparent font-bold text-lg focus:outline-none border-b border-transparent focus:border-primary-500 w-full md:max-w-[200px] truncate" />
             </div>
             <div className="flex items-center gap-2">
                 <button onClick={() => setShowTemplateModal(true)} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-sm font-medium hover:bg-slate-200 mr-2"><Layout className="w-4 h-4" /><span className="hidden md:inline">Modèle</span></button>
                 <button onClick={() => setShowAiModal(true)} className="flex items-center gap-2 px-2 md:px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs md:text-sm font-medium hover:bg-indigo-200 mr-2"><Wand2 className="w-4 h-4" /><span className="hidden md:inline">IA</span></button>
                 <button onClick={exportDOCX} className="p-2 hover:bg-slate-100 rounded text-blue-600 font-bold" title="Word">W</button>
                 <button onClick={() => {
                     if (window.confirm("Voulez-vous adapter le contenu à une seule page ? (Auto-Fit)")) {
                        exportPDF(true);
                     } else {
                        exportPDF(false);
                     }
                 }} className="p-2 hover:bg-slate-100 rounded text-red-600" title="PDF (Auto-fit)"><Download className="w-5 h-5" /></button>
                 <button onClick={saveLetter} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}<span className="hidden sm:inline">Sauvegarder</span></button>
             </div>
        </div>

        <div className="flex flex-1 overflow-hidden relative">
             <div className={`w-full md:w-5/12 p-6 bg-white dark:bg-slate-800 overflow-y-auto border-r border-slate-200 h-full ${mobileView === 'preview' ? 'hidden md:block' : 'block'}`}>
                 <div className="flex space-x-1 mb-6 border-b pb-2 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg overflow-x-auto">
                     {['content', 'recipient', 'signature', 'design'].map(tab => (
                         <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 py-2 rounded text-sm font-medium transition-colors ${activeTab === tab ? 'bg-white shadow text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
                     ))}
                 </div>
                 {activeTab === 'content' && (
                     <div className="space-y-4">
                         <div className="space-y-1"><label className="text-xs font-bold uppercase text-slate-500">Objet</label><input className="w-full p-2 border rounded" value={data.content.subject} onChange={e => setData({...data, content: {...data.content, subject: e.target.value}})} /></div>
                         <div className="space-y-1"><label className="text-xs font-bold uppercase text-slate-500">Salutation</label><input className="w-full p-2 border rounded" value={data.content.opening} onChange={e => setData({...data, content: {...data.content, opening: e.target.value}})} /></div>
                         <div className="space-y-1"><label className="text-xs font-bold uppercase text-slate-500">Corps</label>{data.content.body.map((para, i) => (<textarea key={i} rows={4} className="w-full p-2 border rounded mb-2" value={para} onChange={e => { const newBody = [...data.content.body]; newBody[i] = e.target.value; setData({...data, content: {...data.content, body: newBody}}); }} />))}<button onClick={() => setData({...data, content: {...data.content, body: [...data.content.body, '']}})} className="text-sm text-primary-600 hover:underline">+ Paragraphe</button></div>
                         <div className="space-y-1"><label className="text-xs font-bold uppercase text-slate-500">Fin</label><input className="w-full p-2 border rounded" value={data.content.closing} onChange={e => setData({...data, content: {...data.content, closing: e.target.value}})} /></div>
                     </div>
                 )}
                 {activeTab === 'recipient' && (
                     <div className="space-y-4">
                         <div className="space-y-1"><label className="text-xs font-bold uppercase text-slate-500">Nom Responsable</label><input className="w-full p-2 border rounded" value={data.recipientInfo.managerName} onChange={e => setData({...data, recipientInfo: {...data.recipientInfo, managerName: e.target.value}})} /></div>
                         <div className="space-y-1"><label className="text-xs font-bold uppercase text-slate-500">Entreprise</label><input className="w-full p-2 border rounded" value={data.recipientInfo.company} onChange={e => setData({...data, recipientInfo: {...data.recipientInfo, company: e.target.value}})} /></div>
                         <div className="space-y-1"><label className="text-xs font-bold uppercase text-slate-500">Adresse</label><textarea rows={3} className="w-full p-2 border rounded" value={data.recipientInfo.address} onChange={e => setData({...data, recipientInfo: {...data.recipientInfo, address: e.target.value}})} /></div>
                     </div>
                 )}
                 {activeTab === 'signature' && (
                     <div className="space-y-6">
                         <div className="flex gap-4 mb-4">
                             {['text', 'draw', 'image'].map(t => (
                                 <button key={t} onClick={() => setData(d => ({...d, signature: {...d.signature, type: t as any}}))} className={`p-3 border rounded flex flex-col items-center gap-2 ${data.signature.type === t ? 'border-primary-500 bg-primary-50' : ''}`}>{t === 'text' ? <Type /> : t === 'draw' ? <Pen /> : <Upload />}</button>
                             ))}
                         </div>
                         {data.signature.type === 'text' && <input className="w-full p-2 border rounded font-cursive" value={data.signature.text} onChange={e => setData(d => ({...d, signature: {...d.signature, text: e.target.value}}))} placeholder="Votre nom" />}
                         {data.signature.type === 'draw' && (
                             <div className="border border-slate-300 rounded p-2 bg-white">
                                 <canvas ref={canvasRef} width={400} height={150} className="border border-dashed border-slate-200 w-full touch-none cursor-crosshair" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} />
                                 <button onClick={clearCanvas} className="mt-2 text-sm text-red-500 flex items-center gap-1"><Eraser className="w-4 h-4"/> Effacer</button>
                             </div>
                         )}
                         {data.signature.type === 'image' && <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full" />}
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
                                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${data.design?.color === c ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent'}`}
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
                                        className={`py-2 px-3 border rounded-lg text-sm capitalize ${data.design?.font === f ? 'bg-primary-100 border-primary-500 text-primary-700' : 'border-slate-200 dark:border-slate-700'}`}
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
                                        className={`py-2 px-3 border rounded-lg text-sm capitalize ${data.design?.borderRadius === r ? 'bg-primary-100 border-primary-500 text-primary-700' : 'border-slate-200 dark:border-slate-700'}`}
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
                                        className={`py-2 px-3 border rounded-lg text-sm capitalize ${data.design?.spacing === s ? 'bg-primary-100 border-primary-500 text-primary-700' : 'border-slate-200 dark:border-slate-700'}`}
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
                                        className={`py-2 px-3 border rounded-lg text-sm capitalize ${data.design?.fontSize === s ? 'bg-primary-100 border-primary-500 text-primary-700' : 'border-slate-200 dark:border-slate-700'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                 )}
             </div>

             {/* Preview Panel */}
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
                            {/* Visual Limit Indicator */}
                            <div className="absolute top-[1123px] left-0 w-full border-b-2 border-dashed border-red-500 z-50 pointer-events-none opacity-50 flex items-end justify-end page-break-marker">
                                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-t">Fin de Page A4 (Ne sera pas imprimé)</span>
                            </div>
                            <CoverLetterPreview data={data} template={template} />
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
        
        {/* Modals reuse */}
        {showTemplateModal && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl w-full max-w-4xl h-[80vh] flex flex-col">
                    <div className="flex justify-between mb-4"><h3 className="text-xl font-bold">Modèles</h3><button onClick={() => setShowTemplateModal(false)}>X</button></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 overflow-y-auto">
                        {['modern', 'classic', 'minimalist', 'creative', 'tech', 'executive', 'neo', 'bold', 'symmetry', 'elegant'].map(t => (
                            <button key={t} onClick={() => { setTemplate(t as TemplateType); setShowTemplateModal(false); }} className={`p-4 border rounded ${template === t ? 'border-primary-500 bg-primary-50' : ''} uppercase font-bold text-xs`}>{t}</button>
                        ))}
                    </div>
                </div>
            </div>
        )}
        {showAiModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-600"><Wand2 className="w-5 h-5" />{t.aiLetterModal.title}</h3>
                <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Collez l'offre ici..." className="w-full h-48 p-3 border rounded-lg bg-slate-50 resize-none mb-4" />
                <div className="flex justify-end gap-3">
                    <button onClick={() => setShowAiModal(false)} className="px-4 py-2 text-slate-500">Annuler</button>
                    <button onClick={handleAiGeneration} disabled={aiLoading || !jobDescription} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">{aiLoading ? '...' : t.aiLetterModal.button}</button>
                </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default CoverLetterEditor;
