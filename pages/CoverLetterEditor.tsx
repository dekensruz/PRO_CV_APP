
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { generateCoverLetter } from '../services/geminiService';
import { useAuth, useApp } from '../App';
import { CoverLetterData, TemplateType, ResumeData } from '../types';
import { INITIAL_COVER_LETTER_STATE, INITIAL_RESUME_STATE, TRANSLATIONS } from '../constants';
import CoverLetterPreview from '../components/CoverLetterPreview';
import { Save, ArrowLeft, Download, Upload, Eraser, Pen, Type, Loader2, Layout, Check, Eye, Edit, Wand2 } from 'lucide-react';
import { toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, AlignmentType, TextRun, HeadingLevel } from 'docx';
import saveAs from 'file-saver';

const CoverLetterEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useApp();
  const t = TRANSLATIONS[language].editor;
  
  const [data, setData] = useState<CoverLetterData>(INITIAL_COVER_LETTER_STATE);
  const [title, setTitle] = useState('Ma Lettre');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'recipient' | 'signature'>('content');
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
        setData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, fullName: user.user_metadata.full_name } }));
    }
  }, [id, user]);

  const loadLetter = async (letterId: string) => {
    setLoading(true);
    const { data: letter } = await supabase.from('cover_letters').select('*').eq('id', letterId).single();
    if (letter) {
        setData(letter.content);
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
  const exportPDF = async () => {
      if (!previewRef.current) return;
      setLoading(true);
      
      try {
          const element = previewRef.current;
          await document.fonts.ready;

          // 1. Clone element to avoid interference from scaling/responsive layout
          const clone = element.cloneNode(true) as HTMLElement;

          // 2. Position clone off-screen but strictly sized A4
          const a4WidthPx = 794;
          clone.style.position = 'fixed';
          clone.style.top = '0px'; // Changed from -10000px
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

          // 5. Capture AS JPEG
          const dataUrl = await toJpeg(clone, { 
              quality: 0.8, // Good compression
              pixelRatio: 2,
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
          
          // Use FAST compression
          if (imgHeight <= pdfHeight + 5) {
               pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfWidth, imgHeight, undefined, 'FAST');
          } else {
               let heightLeft = imgHeight;
               let position = 0;
               let page = 0;
               
               pdf.addImage(dataUrl, 'JPEG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
               heightLeft -= pdfHeight;

               while (heightLeft > 0) {
                  page++;
                  position = - (page * pdfHeight);
                  pdf.addPage();
                  pdf.addImage(dataUrl, 'JPEG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
                  heightLeft -= pdfHeight;
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
                  new Paragraph({ text: data.personalInfo.fullName, heading: HeadingLevel.HEADING_1 }),
                  new Paragraph({ text: `${data.personalInfo.address} | ${data.personalInfo.email} | ${data.personalInfo.phone}`, spacing: { after: 400 } }),
                  new Paragraph({ text: new Date().toLocaleDateString(), alignment: AlignmentType.RIGHT, spacing: { after: 200 } }),
                  new Paragraph({ text: data.recipientInfo.managerName, alignment: AlignmentType.RIGHT }),
                  new Paragraph({ text: data.recipientInfo.company, alignment: AlignmentType.RIGHT }),
                  new Paragraph({ text: data.recipientInfo.address, alignment: AlignmentType.RIGHT, spacing: { after: 400 } }),
                  new Paragraph({ text: `Objet: ${data.content.subject}`, bold: true, spacing: { after: 200 } }),
                  new Paragraph({ text: data.content.opening, spacing: { after: 200 } }),
                  ...data.content.body.map(p => new Paragraph({ text: p, spacing: { after: 200 } })),
                  new Paragraph({ text: data.content.closing, spacing: { after: 400 } }),
                  new Paragraph({ text: "Cordialement," }),
                  new Paragraph({ text: data.personalInfo.fullName, bold: true, spacing: { before: 400 } }),
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
                 <button onClick={exportPDF} className="p-2 hover:bg-slate-100 rounded text-red-600" title="PDF"><Download className="w-5 h-5" /></button>
                 <button onClick={saveLetter} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}<span className="hidden sm:inline">Sauvegarder</span></button>
             </div>
        </div>

        <div className="flex flex-1 overflow-hidden relative">
             <div className={`w-full md:w-5/12 p-6 bg-white dark:bg-slate-800 overflow-y-auto border-r border-slate-200 h-full ${mobileView === 'preview' ? 'hidden md:block' : 'block'}`}>
                 <div className="flex space-x-2 mb-6 border-b pb-2">
                     {['content', 'recipient', 'signature'].map(tab => (
                         <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 py-2 rounded text-sm font-medium transition-colors ${activeTab === tab ? 'bg-primary-100 text-primary-700' : 'text-slate-500 hover:bg-slate-100'}`}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
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
             </div>

             {/* Preview Panel - RESPONSIVE CONTAINER WITH DYNAMIC HEIGHT */}
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
                        <div ref={previewRef} className="w-full h-full">
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
                        {['modern', 'classic', 'minimalist', 'creative', 'tech', 'executive'].map(t => (
                            <button key={t} onClick={() => { setTemplate(t as TemplateType); setShowTemplateModal(false); }} className={`p-4 border rounded ${template === t ? 'border-primary-500 bg-primary-50' : ''}`}>{t}</button>
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

const InputField = ({ label, value, onChange, type="text" }: any) => <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-slate-500 uppercase">{label}</label><input type={type} value={value||''} onChange={e=>onChange(e.target.value)} className="px-3 py-2 border rounded-lg bg-transparent"/></div>;
const TextAreaField = ({ label, value, onChange }: any) => <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-slate-500 uppercase">{label}</label><textarea rows={4} value={value||''} onChange={e=>onChange(e.target.value)} className="px-3 py-2 border rounded-lg bg-transparent resize-none"/></div>;

export default CoverLetterEditor;
