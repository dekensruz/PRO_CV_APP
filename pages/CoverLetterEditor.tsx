
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { generateCoverLetter } from '../services/geminiService';
import { useAuth, useApp } from '../App';
import { CoverLetterData, TemplateType, ResumeData } from '../types';
import { INITIAL_COVER_LETTER_STATE, INITIAL_RESUME_STATE, TRANSLATIONS } from '../constants';
import CoverLetterPreview from '../components/CoverLetterPreview';
import { Save, ArrowLeft, Download, Upload, Eraser, Pen, Type, Loader2, Layout, Check, Eye, Edit, Wand2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, AlignmentType } from 'docx';
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
  
  // AI States
  const [showAiModal, setShowAiModal] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  
  // Mobile View State ('editor' or 'preview')
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');

  // Canvas Logic
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (id) loadLetter(id);
    else if (user?.user_metadata?.full_name) {
        // Initialize user name if new
        setData(prev => ({
            ...prev, 
            personalInfo: { ...prev.personalInfo, fullName: user.user_metadata.full_name }
        }));
    }
  }, [id, user]);

  const loadLetter = async (letterId: string) => {
    setLoading(true);
    const { data: letter, error } = await supabase.from('cover_letters').select('*').eq('id', letterId).single();
    if (letter && !error) {
        setData(letter.content);
        setTitle(letter.title);
        setTemplate(letter.template_id || 'modern');
    }
    setLoading(false);
  };

  const saveLetter = async () => {
      if (!user) return;
      setLoading(true);
      
      const payload = {
          user_id: user.id,
          title,
          content: data,
          template_id: template,
          updated_at: new Date().toISOString()
      };

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
          // Construct a temporary resume object with current contact info to give context to AI
          const tempResumeData: ResumeData = {
              ...INITIAL_RESUME_STATE,
              personalInfo: {
                  ...INITIAL_RESUME_STATE.personalInfo,
                  fullName: data.personalInfo.fullName,
                  email: data.personalInfo.email,
                  phone: data.personalInfo.phone,
                  address: data.personalInfo.address,
                  // If we wanted, we could fetch the linked resume here, but keeping it simple for "just paste job"
              }
          };

          const result = await generateCoverLetter(jobDescription, tempResumeData, language);
          
          if (result) {
              setData(prev => ({
                  ...prev,
                  recipientInfo: result.recipientInfo,
                  content: result.content
              }));
              setShowAiModal(false);
              setJobDescription('');
          }
      } catch (e) {
          console.error(e);
          alert("Erreur lors de la génération.");
      } finally {
          setAiLoading(false);
      }
  };

  // --- Canvas Handlers (Fixed Coordinates Logic) ---
  const getMousePos = (canvas: HTMLCanvasElement, evt: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      let clientX, clientY;
      if ('touches' in evt) {
          clientX = evt.touches[0].clientX;
          clientY = evt.touches[0].clientY;
      } else {
          clientX = (evt as MouseEvent).clientX;
          clientY = (evt as MouseEvent).clientY;
      }

      return {
          x: (clientX - rect.left) * scaleX,
          y: (clientY - rect.top) * scaleY
      };
  };

  const startDrawing = (e: any) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      if (e.type === 'touchstart') e.preventDefault();

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const pos = getMousePos(canvas, e.nativeEvent ? e.nativeEvent : e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#000';
      setIsDrawing(true);
  };

  const draw = (e: any) => {
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      if (e.type === 'touchmove') e.preventDefault();

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const pos = getMousePos(canvas, e.nativeEvent ? e.nativeEvent : e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
  };

  const stopDrawing = () => {
      if (isDrawing) {
          setIsDrawing(false);
          const canvas = canvasRef.current;
          if (canvas) {
               const dataUrl = canvas.toDataURL();
               setData(prev => ({ ...prev, signature: { ...prev.signature, type: 'draw', imageUrl: dataUrl } }));
          }
      }
  };

  const clearCanvas = () => {
      const canvas = canvasRef.current;
      if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx?.clearRect(0, 0, canvas.width, canvas.height);
          setData(prev => ({ ...prev, signature: { ...prev.signature, imageUrl: '' } }));
      }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || !e.target.files[0]) return;
      const file = e.target.files[0];
      const fileName = `signatures/${Date.now()}_${file.name}`;
      
      const { data: uploadData, error } = await supabase.storage.from('public-files').upload(fileName, file);
      if (!error) {
          const { data: urlData } = supabase.storage.from('public-files').getPublicUrl(fileName);
          setData(prev => ({ ...prev, signature: { ...prev.signature, type: 'image', imageUrl: urlData.publicUrl } }));
      }
  };

  const exportPDF = async () => {
      const element = document.getElementById('cl-preview');
      if (!element) return;
      
      setLoading(true);
      try {
          const canvas = await html2canvas(element, { scale: 2 });
          const imgData = canvas.toDataURL('image/jpeg', 0.95);
          const pdf = new jsPDF('p', 'mm', 'a4');
          pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
          pdf.save(`${title}.pdf`);
      } catch(e) { console.error(e); }
      setLoading(false);
  };

  const exportDOCX = async () => {
      const doc = new Document({
          sections: [{
              properties: {},
              children: [
                  new Paragraph({ text: data.personalInfo.fullName, heading: "Heading1" }),
                  new Paragraph({ text: `${data.personalInfo.email} | ${data.personalInfo.phone}` }),
                  new Paragraph({ text: data.personalInfo.address }),
                  new Paragraph({ text: "" }),
                  new Paragraph({ text: new Date().toLocaleDateString(), alignment: AlignmentType.RIGHT }),
                  new Paragraph({ text: data.recipientInfo.managerName, alignment: AlignmentType.RIGHT }),
                  new Paragraph({ text: data.recipientInfo.company, alignment: AlignmentType.RIGHT }),
                  new Paragraph({ text: data.recipientInfo.address, alignment: AlignmentType.RIGHT }),
                  new Paragraph({ text: "" }),
                  new Paragraph({ text: `Objet: ${data.content.subject}`, bold: true }),
                  new Paragraph({ text: "" }),
                  new Paragraph({ text: data.content.opening }),
                  new Paragraph({ text: "" }),
                  ...data.content.body.map(p => new Paragraph({ text: p, spacing: { after: 200 } })),
                  new Paragraph({ text: "" }),
                  new Paragraph({ text: data.content.closing }),
                  new Paragraph({ text: "" }),
                  new Paragraph({ text: "Cordialement," }),
                  new Paragraph({ text: "" }),
                  new Paragraph({ text: data.personalInfo.fullName, bold: true }),
              ]
          }]
      });
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${title}.docx`);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-900">
        <div className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4">
             <div className="flex items-center gap-4">
                 <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft className="w-5 h-5" /></button>
                 <input 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-transparent font-bold text-lg focus:outline-none border-b border-transparent focus:border-primary-500 w-full md:max-w-[200px] truncate"
                 />
             </div>
             <div className="flex items-center gap-2">
                 <button 
                    onClick={() => setShowTemplateModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors mr-2"
                  >
                    <Layout className="w-4 h-4" />
                    <span className="hidden md:inline">Modèle</span>
                 </button>

                 <button 
                    onClick={() => setShowAiModal(true)}
                    className="flex items-center gap-2 px-2 md:px-3 py-1.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-lg text-xs md:text-sm font-medium hover:bg-indigo-200 transition-colors mr-2"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span className="hidden md:inline">{t.buttons.generateAI}</span>
                 </button>

                 <button onClick={exportDOCX} className="p-2 hover:bg-slate-100 rounded text-blue-600 font-bold border border-transparent hover:border-slate-200" title="Word">W</button>
                 <button onClick={exportPDF} className="p-2 hover:bg-slate-100 rounded text-red-600" title="PDF"><Download className="w-5 h-5" /></button>
                 <button onClick={saveLetter} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
                     {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                     <span className="hidden sm:inline">Sauvegarder</span>
                 </button>
             </div>
        </div>

        <div className="flex flex-1 overflow-hidden relative">
             {/* Editor Panel */}
             <div className={`w-full md:w-5/12 p-6 bg-white dark:bg-slate-800 overflow-y-auto border-r border-slate-200 h-full ${mobileView === 'preview' ? 'hidden md:block' : 'block'}`}>
                 <div className="flex space-x-2 mb-6 border-b pb-2">
                     <TabButton active={activeTab === 'content'} onClick={() => setActiveTab('content')} label="Contenu" />
                     <TabButton active={activeTab === 'recipient'} onClick={() => setActiveTab('recipient')} label="Destinataire" />
                     <TabButton active={activeTab === 'signature'} onClick={() => setActiveTab('signature')} label="Signature" />
                 </div>

                 {activeTab === 'content' && (
                     <div className="space-y-4">
                         <div className="space-y-1">
                             <label className="text-xs font-bold uppercase text-slate-500">Objet</label>
                             <input className="w-full p-2 border rounded" value={data.content.subject} onChange={e => setData({...data, content: {...data.content, subject: e.target.value}})} />
                         </div>
                         <div className="space-y-1">
                             <label className="text-xs font-bold uppercase text-slate-500">Salutation</label>
                             <input className="w-full p-2 border rounded" value={data.content.opening} onChange={e => setData({...data, content: {...data.content, opening: e.target.value}})} />
                         </div>
                         <div className="space-y-1">
                             <label className="text-xs font-bold uppercase text-slate-500">Corps (Paragraphes)</label>
                             {data.content.body.map((para, i) => (
                                 <textarea key={i} rows={4} className="w-full p-2 border rounded mb-2" value={para} onChange={e => {
                                     const newBody = [...data.content.body];
                                     newBody[i] = e.target.value;
                                     setData({...data, content: {...data.content, body: newBody}});
                                 }} />
                             ))}
                             <button onClick={() => setData({...data, content: {...data.content, body: [...data.content.body, '']}})} className="text-sm text-primary-600 hover:underline">+ Ajouter un paragraphe</button>
                         </div>
                         <div className="space-y-1">
                             <label className="text-xs font-bold uppercase text-slate-500">Formule de politesse</label>
                             <input className="w-full p-2 border rounded" value={data.content.closing} onChange={e => setData({...data, content: {...data.content, closing: e.target.value}})} />
                         </div>
                     </div>
                 )}

                 {activeTab === 'recipient' && (
                     <div className="space-y-4">
                         <div className="space-y-1">
                             <label className="text-xs font-bold uppercase text-slate-500">Nom du responsable</label>
                             <input className="w-full p-2 border rounded" value={data.recipientInfo.managerName} onChange={e => setData({...data, recipientInfo: {...data.recipientInfo, managerName: e.target.value}})} />
                         </div>
                         <div className="space-y-1">
                             <label className="text-xs font-bold uppercase text-slate-500">Entreprise</label>
                             <input className="w-full p-2 border rounded" value={data.recipientInfo.company} onChange={e => setData({...data, recipientInfo: {...data.recipientInfo, company: e.target.value}})} />
                         </div>
                         <div className="space-y-1">
                             <label className="text-xs font-bold uppercase text-slate-500">Adresse</label>
                             <textarea rows={3} className="w-full p-2 border rounded" value={data.recipientInfo.address} onChange={e => setData({...data, recipientInfo: {...data.recipientInfo, address: e.target.value}})} />
                         </div>
                     </div>
                 )}

                 {activeTab === 'signature' && (
                     <div className="space-y-6">
                         <div className="flex gap-4 mb-4">
                             <button onClick={() => setData(d => ({...d, signature: {...d.signature, type: 'text'}}))} className={`p-3 border rounded flex flex-col items-center gap-2 ${data.signature.type === 'text' ? 'border-primary-500 bg-primary-50' : ''}`}>
                                 <Type className="w-6 h-6" /> Text
                             </button>
                             <button onClick={() => setData(d => ({...d, signature: {...d.signature, type: 'draw'}}))} className={`p-3 border rounded flex flex-col items-center gap-2 ${data.signature.type === 'draw' ? 'border-primary-500 bg-primary-50' : ''}`}>
                                 <Pen className="w-6 h-6" /> Dessiner
                             </button>
                             <button onClick={() => setData(d => ({...d, signature: {...d.signature, type: 'image'}}))} className={`p-3 border rounded flex flex-col items-center gap-2 ${data.signature.type === 'image' ? 'border-primary-500 bg-primary-50' : ''}`}>
                                 <Upload className="w-6 h-6" /> Upload
                             </button>
                         </div>

                         {data.signature.type === 'text' && (
                             <input className="w-full p-2 border rounded font-cursive" value={data.signature.text} onChange={e => setData(d => ({...d, signature: {...d.signature, text: e.target.value}}))} placeholder="Votre nom" />
                         )}

                         {data.signature.type === 'draw' && (
                             <div className="border border-slate-300 rounded p-2 bg-white">
                                 <canvas 
                                     ref={canvasRef}
                                     width={400} 
                                     height={150} 
                                     className="border border-dashed border-slate-200 w-full touch-none cursor-crosshair"
                                     onMouseDown={startDrawing}
                                     onMouseMove={draw}
                                     onMouseUp={stopDrawing}
                                     onMouseLeave={stopDrawing}
                                     onTouchStart={startDrawing}
                                     onTouchMove={draw}
                                     onTouchEnd={stopDrawing}
                                 />
                                 <button onClick={clearCanvas} className="mt-2 text-sm text-red-500 flex items-center gap-1"><Eraser className="w-4 h-4"/> Effacer</button>
                             </div>
                         )}

                         {data.signature.type === 'image' && (
                             <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full" />
                         )}
                     </div>
                 )}
             </div>

             {/* Preview Panel */}
             <div className={`flex-1 bg-slate-200 dark:bg-slate-950 p-4 md:p-8 overflow-y-auto flex flex-col items-center h-full relative ${mobileView === 'editor' ? 'hidden md:flex' : 'flex'}`}>
                 <div id="cl-preview" className="origin-top transition-transform duration-300 scale-[0.45] sm:scale-50 md:scale-75 lg:scale-[0.85] xl:scale-90 shadow-2xl">
                     <CoverLetterPreview data={data} template={template} />
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

        {/* Template Modal */}
        {showTemplateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl p-6 h-[80vh] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">Choisir un modèle de lettre</h3>
                        <button onClick={() => setShowTemplateModal(false)}><span className="text-2xl">&times;</span></button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 overflow-y-auto p-2">
                        {[
                            {id: 'modern', name: 'Standard (Moderne)', color: 'bg-slate-800'},
                            {id: 'classic', name: 'Classique (Serif)', color: 'bg-white border'},
                            {id: 'minimalist', name: 'Minimaliste', color: 'bg-indigo-50'},
                            {id: 'creative', name: 'Créatif', color: 'bg-pink-50'},
                            {id: 'tech', name: 'Tech / Bold', color: 'bg-gray-900'},
                            {id: 'executive', name: 'Executive', color: 'bg-yellow-50'},
                        ].map(tmp => (
                            <div 
                                key={tmp.id} 
                                onClick={() => { setTemplate(tmp.id as TemplateType); setShowTemplateModal(false); }}
                                className={`cursor-pointer group relative rounded-lg overflow-hidden border-2 transition-all ${template === tmp.id ? 'border-primary-500 ring-2 ring-primary-200' : 'border-transparent hover:border-slate-300'}`}
                            >
                                <div className={`aspect-[210/297] ${tmp.color} flex flex-col p-4 shadow-sm`}>
                                    <div className="w-1/2 h-2 bg-current opacity-20 mb-2 rounded"></div>
                                    <div className="w-full h-1 bg-current opacity-10 mb-1 rounded"></div>
                                    <div className="flex-1 w-full bg-current opacity-5 rounded mt-4"></div>
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

        {/* AI Modal for Cover Letter */}
        {showAiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600">
                    <Wand2 className="w-5 h-5 text-indigo-500" />
                    {t.aiLetterModal.title}
                </h3>
                
                <div className="space-y-4 mb-4">
                     <p className="text-sm text-slate-500 dark:text-slate-400">
                         {t.aiLetterModal.placeholder}
                     </p>
                     <div className="space-y-1">
                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Collez la description du poste ici..."
                            className="w-full h-48 p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 resize-none focus:ring-2 focus:ring-primary-500 outline-none"
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
                        disabled={aiLoading || !jobDescription}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                    >
                        {aiLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Génération...
                            </>
                        ) : t.aiLetterModal.button}
                    </button>
                </div>
            </div>
          </div>
        )}
    </div>
  );
};

const TabButton = ({ active, onClick, label }: any) => (
    <button onClick={onClick} className={`px-4 py-2 rounded text-sm font-medium transition-colors ${active ? 'bg-primary-100 text-primary-700' : 'text-slate-500 hover:bg-slate-100'}`}>
        {label}
    </button>
);

export default CoverLetterEditor;
