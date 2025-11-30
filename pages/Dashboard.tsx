import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { useAuth, useApp } from '../App';
import { TRANSLATIONS } from '../constants';
import { Plus, FileText, Trash2, Edit, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();
  const { language } = useApp();
  const t = TRANSLATIONS[language];
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchResumes();
  }, [user]);

  const fetchResumes = async () => {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setResumes(data || []);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewResume = async () => {
    navigate('/editor');
  };

  const deleteResume = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Êtes-vous sûr ? / Are you sure?')) return;
    
    try {
      await supabase.from('resumes').delete().eq('id', id);
      setResumes(resumes.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t.nav.dashboard}</h1>
        <button
          onClick={createNewResume}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">{t.nav.create}</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create New Card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 hover:text-primary-600 hover:border-primary-500 cursor-pointer transition-all bg-slate-50 dark:bg-slate-800/50 group h-64"
            onClick={createNewResume}
          >
            <div className="p-4 rounded-full bg-slate-200 dark:bg-slate-700 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors mb-4">
              <Plus className="w-8 h-8" />
            </div>
            <span className="font-medium">{t.nav.create}</span>
          </motion.div>

          {/* Resume Cards */}
          {resumes.map((resume, idx) => (
            <motion.div
              key={resume.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => navigate(`/editor/${resume.id}`)}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all cursor-pointer group h-64 flex flex-col"
            >
              <div className="flex-1 bg-slate-100 dark:bg-slate-900/50 p-6 flex flex-col items-center justify-center relative overflow-hidden">
                <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-semibold flex items-center gap-2">
                        <Edit className="w-4 h-4" /> Éditer
                    </span>
                </div>
              </div>
              <div className="p-4 flex justify-between items-center border-t border-slate-100 dark:border-slate-700">
                <div>
                  <h3 className="font-semibold truncate max-w-[150px]">{resume.title || 'Sans titre'}</h3>
                  <p className="text-xs text-slate-500">
                    {new Date(resume.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => deleteResume(resume.id, e)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;