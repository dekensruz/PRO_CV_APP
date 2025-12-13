
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { useAuth, useApp } from '../App';
import { TRANSLATIONS } from '../constants';
import { Plus, FileText, Trash2, Edit, Loader2, Mail, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import ResumePreview from '../components/ResumePreview';
import CoverLetterPreview from '../components/CoverLetterPreview';

const Dashboard = () => {
  const { user } = useAuth();
  const { language } = useApp();
  const t = TRANSLATIONS[language];
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<any[]>([]);
  const [coverLetters, setCoverLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'resumes' | 'coverLetters'>('resumes');

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: resumesData } = await supabase.from('resumes').select('*').order('updated_at', { ascending: false });
      const { data: lettersData } = await supabase.from('cover_letters').select('*').order('updated_at', { ascending: false });

      setResumes(resumesData || []);
      setCoverLetters(lettersData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNew = async () => {
    if (activeTab === 'resumes') {
        navigate('/editor');
    } else {
        navigate('/cover-letter');
    }
  };

  const deleteItem = async (id: string, table: 'resumes' | 'cover_letters', e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Êtes-vous sûr ? / Are you sure?')) return;
    
    try {
      await supabase.from(table).delete().eq('id', id);
      if (table === 'resumes') {
          setResumes(resumes.filter(r => r.id !== id));
      } else {
          setCoverLetters(coverLetters.filter(l => l.id !== id));
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header with Home Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
            <button 
                onClick={() => navigate('/')} 
                className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow text-slate-600 dark:text-slate-300 transition-all border border-slate-200 dark:border-slate-700"
                title={t.nav.home}
            >
                <Home className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold">{t.nav.dashboard}</h1>
        </div>

        <button
          onClick={createNew}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">
              {activeTab === 'resumes' ? 'Créer un CV' : 'Créer une Lettre'}
          </span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 mb-8 border-b border-slate-200 dark:border-slate-700">
          <button 
            onClick={() => setActiveTab('resumes')}
            className={`pb-4 px-2 font-medium text-lg transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'resumes' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
              <FileText className="w-5 h-5" />
              {t.nav.resumes}
              <span className="ml-1 text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-400">{resumes.length}</span>
          </button>
          <button 
            onClick={() => setActiveTab('coverLetters')}
            className={`pb-4 px-2 font-medium text-lg transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'coverLetters' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
              <Mail className="w-5 h-5" />
              {t.nav.coverLetters}
              <span className="ml-1 text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-400">{coverLetters.length}</span>
          </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Create New Card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 hover:text-primary-600 hover:border-primary-500 cursor-pointer transition-all bg-slate-50 dark:bg-slate-800/50 group h-[400px]"
            onClick={createNew}
          >
            <div className="p-4 rounded-full bg-slate-200 dark:bg-slate-700 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors mb-4">
              <Plus className="w-8 h-8" />
            </div>
            <span className="font-medium text-lg">
                {activeTab === 'resumes' ? 'Nouveau CV' : 'Nouvelle Lettre'}
            </span>
          </motion.div>

          {/* Items Cards */}
          {(activeTab === 'resumes' ? resumes : coverLetters).map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => navigate(activeTab === 'resumes' ? `/editor/${item.id}` : `/cover-letter/${item.id}`)}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-2xl hover:border-primary-500 transition-all cursor-pointer group h-[400px] flex flex-col relative"
            >
              <div className="flex-1 bg-slate-100 dark:bg-slate-700 overflow-hidden relative">
                  {/* Miniature / Thumbnail Scaling */}
                  <div className="w-[210mm] min-h-[297mm] absolute top-0 left-0 origin-top-left transform scale-[0.35] pointer-events-none select-none bg-white">
                      {activeTab === 'resumes' ? (
                          <ResumePreview data={item.content} template={item.template_id || 'modern'} />
                      ) : (
                          <CoverLetterPreview data={item.content} template={item.template_id || 'modern'} />
                      )}
                  </div>
                  
                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10" />
              </div>
              
              <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 z-20 relative">
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0 mr-2">
                      <h3 className="font-bold truncate text-slate-900 dark:text-slate-100">{item.title || 'Sans titre'}</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Modifié le {new Date(item.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                              e.stopPropagation();
                              navigate(activeTab === 'resumes' ? `/editor/${item.id}` : `/cover-letter/${item.id}`);
                          }}
                          className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                          title="Éditer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => deleteItem(item.id, activeTab === 'resumes' ? 'resumes' : 'cover_letters', e)}
                          className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </div>
              </div>
            </motion.div>
          ))}
          
          {/* Empty State Message */}
          {(activeTab === 'resumes' ? resumes : coverLetters).length === 0 && (
             <div className="col-span-1 sm:col-span-2 lg:col-span-2 flex items-center justify-center text-slate-400 italic">
                 Vous n'avez pas encore de {activeTab === 'resumes' ? 'CV' : 'lettre de motivation'}. Cliquez sur "+" pour commencer.
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
