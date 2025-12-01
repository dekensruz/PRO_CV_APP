import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp, useAuth } from '../App';
import { TRANSLATIONS } from '../constants';
import { supabase } from '../services/supabaseClient';
import { Review } from '../types';
import { FileText, Wand2, Download, CheckCircle, ChevronRight, Star, Copy, Zap, PenTool, Upload, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const LandingPage = () => {
  const { language } = useApp();
  const { user } = useAuth();
  const t = TRANSLATIONS[language];
  const navigate = useNavigate();

  // Review State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', role: '', content: '', rating: 5, avatar_url: '' });
  const [reviewImage, setReviewImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false }).limit(3);
    if (data) setReviews(data);
  };

  const handleStart = () => {
    if (user) {
        navigate('/dashboard'); 
    } else {
        // Dispatch custom event to open auth modal in signup mode
        const event = new CustomEvent('open-auth-modal', { detail: { mode: 'signup' } });
        window.dispatchEvent(event);
    }
  };

  const scrollToTemplates = () => {
    document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleImageUpload = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('public-files')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('public-files').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const submitReview = async () => {
    try {
      setUploading(true);
      let avatarUrl = '';

      if (reviewImage) {
        avatarUrl = await handleImageUpload(reviewImage);
      } else {
          // Default avatars if no image
          avatarUrl = `https://ui-avatars.com/api/?name=${newReview.name}&background=random`;
      }

      await supabase.from('reviews').insert([{
        ...newReview,
        avatar_url: avatarUrl
      }]);

      setShowReviewModal(false);
      setNewReview({ name: '', role: '', content: '', rating: 5, avatar_url: '' });
      setReviewImage(null);
      fetchReviews(); // Refresh list
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative overflow-hidden w-full">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-20">
        <div className="flex-1 text-center md:text-left z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 text-sm font-medium mb-6 border border-primary-100 dark:border-primary-800">
              <Zap className="w-4 h-4 fill-current" />
              <span>{t.hero.badge}</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6">
              {t.hero.title} <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-purple-600 to-indigo-600 animate-gradient-x">
                ProCV
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto md:mx-0 leading-relaxed">
              {t.hero.subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button 
                onClick={handleStart}
                className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/30 transition-all hover:scale-105 flex items-center justify-center gap-2 group"
              >
                {t.hero.cta}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={scrollToTemplates}
                className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 rounded-xl font-semibold shadow-sm transition-all hover:-translate-y-0.5"
              >
                {t.hero.secondary}
              </button>
            </div>

            <div className="mt-8 flex items-center justify-center md:justify-start gap-6 text-sm text-slate-500 dark:text-slate-400">
                {t.hero.labels.map((label: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-500" /> {label}
                    </div>
                ))}
            </div>
          </motion.div>
        </div>

        {/* Phone Simulation */}
        <div className="flex-1 relative z-10 flex justify-center md:justify-end">
          <motion.div
            initial={{ opacity: 0, y: 50, rotate: -5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 1, type: "spring" }}
            className="relative"
          >
             <PhoneMockup />
          </motion.div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-24 bg-white dark:bg-slate-900/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4">{t.steps.title}</h2>
                <div className="h-1 w-20 bg-primary-500 mx-auto rounded-full" />
            </div>

            <div className="grid md:grid-cols-3 gap-12">
                <StepCard 
                    number="1"
                    icon={<Copy className="w-6 h-6 text-white" />}
                    title={t.steps.step1}
                    desc={t.steps.desc1}
                />
                <StepCard 
                    number="2"
                    icon={<Wand2 className="w-6 h-6 text-white" />}
                    title={t.steps.step2}
                    desc={t.steps.desc2}
                />
                <StepCard 
                    number="3"
                    icon={<Download className="w-6 h-6 text-white" />}
                    title={t.steps.step3}
                    desc={t.steps.desc3}
                />
            </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-50 dark:bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Wand2 className="w-8 h-8 text-primary-500" />}
              title={t.features.ai.title}
              desc={t.features.ai.desc}
              delay={0.1}
            />
            <FeatureCard 
              icon={<PenTool className="w-8 h-8 text-indigo-500" />}
              title={t.features.templates.title}
              desc={t.features.templates.desc}
              delay={0.2}
            />
            <FeatureCard 
              icon={<Download className="w-8 h-8 text-green-500" />}
              title={t.features.export.title}
              desc={t.features.export.desc}
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Templates Preview Section */}
      <section id="templates" className="py-24 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4">{t.features.templates.title}</h2>
                <p className="text-slate-600 dark:text-slate-400">{t.features.templates.desc}</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
                <TemplatePreviewCard 
                    name="Modern" 
                    color="bg-slate-800" 
                />
                <TemplatePreviewCard 
                    name="Classic" 
                    color="bg-white border-2 border-slate-200 text-slate-900" 
                    isLight 
                />
                <TemplatePreviewCard 
                    name="Minimalist" 
                    color="bg-indigo-50" 
                    isLight 
                />
                <TemplatePreviewCard 
                    name="Executive" 
                    color="bg-slate-900 border-t-8 border-gold-500" 
                />
                <TemplatePreviewCard 
                    name="Creative" 
                    color="bg-pink-50" 
                    isLight
                />
                <TemplatePreviewCard 
                    name="Tech" 
                    color="bg-gray-900 font-mono" 
                />
            </div>
            
            <div className="mt-12 text-center">
                 <button 
                    onClick={handleStart}
                    className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-bold shadow-lg transition-transform hover:scale-105"
                 >
                     Créer mon CV maintenant
                 </button>
            </div>
          </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-primary-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
              <h2 className="text-3xl font-bold text-white mb-12">{t.testimonials.title}</h2>
              
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                  {reviews.length > 0 ? reviews.map((review) => (
                      <TestimonialCard 
                        key={review.id}
                        quote={review.content}
                        author={review.name}
                        role={review.role}
                        img={review.avatar_url}
                        rating={review.rating}
                      />
                  )) : (
                      <>
                        <TestimonialCard 
                            quote="J'ai décroché mon entretien grâce à ProCV !"
                            author="Alex M."
                            role="Développeur Web"
                            img="https://randomuser.me/api/portraits/men/32.jpg"
                            rating={5}
                        />
                         <TestimonialCard 
                            quote="L'outil le plus simple pour faire un CV pro."
                            author="Sophie L."
                            role="Marketing Manager"
                            img="https://randomuser.me/api/portraits/women/44.jpg"
                            rating={5}
                        />
                         <TestimonialCard 
                            quote="Designs magnifiques et export parfait."
                            author="Jean D."
                            role="Architecte"
                            img="https://randomuser.me/api/portraits/men/44.jpg"
                            rating={4}
                        />
                      </>
                  )}
              </div>

              <button 
                onClick={() => setShowReviewModal(true)}
                className="bg-white text-primary-600 hover:bg-slate-50 font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105"
              >
                  {t.testimonials.addReview}
              </button>
          </div>
      </section>

      <Footer />

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
            >
                <button 
                    onClick={() => setShowReviewModal(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                    <X className="w-5 h-5" />
                </button>

                <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">{t.testimonials.modal.title}</h3>

                <div className="space-y-4">
                    <input 
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder={t.testimonials.modal.name}
                        value={newReview.name}
                        onChange={(e) => setNewReview({...newReview, name: e.target.value})}
                    />
                    <input 
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder={t.testimonials.modal.role}
                        value={newReview.role}
                        onChange={(e) => setNewReview({...newReview, role: e.target.value})}
                    />
                    <textarea 
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-primary-500 resize-none h-32"
                        placeholder={t.testimonials.modal.message}
                        value={newReview.content}
                        onChange={(e) => setNewReview({...newReview, content: e.target.value})}
                    />
                    
                    {/* Stars */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-500">{t.testimonials.modal.rating}:</span>
                        {[1,2,3,4,5].map((star) => (
                            <button key={star} onClick={() => setNewReview({...newReview, rating: star})}>
                                <Star className={`w-6 h-6 ${star <= newReview.rating ? 'text-yellow-400 fill-current' : 'text-slate-300'}`} />
                            </button>
                        ))}
                    </div>

                    {/* Image Upload */}
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-200 transition-colors text-sm">
                            <Upload className="w-4 h-4" />
                            {reviewImage ? reviewImage.name.substring(0, 15) + '...' : t.testimonials.modal.photo}
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                if (e.target.files && e.target.files[0]) setReviewImage(e.target.files[0]);
                            }} />
                        </label>
                    </div>

                    <button 
                        onClick={submitReview}
                        disabled={!newReview.name || !newReview.content || uploading}
                        className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" /> {t.testimonials.modal.uploading}
                            </>
                        ) : t.testimonials.modal.submit}
                    </button>
                </div>
            </motion.div>
        </div>
      )}
    </div>
  );
};

// --- Sub Components ---

const PhoneMockup = () => {
    return (
        <div className="relative mx-auto border-gray-900 dark:border-gray-800 bg-gray-900 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-2xl flex flex-col items-center select-none transform transition-transform hover:scale-[1.02]">
            <div className="h-[32px] w-[3px] bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg"></div>
            <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
            <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
            <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
            <div className="rounded-[2rem] overflow-hidden w-[272px] h-[572px] bg-white dark:bg-slate-900 relative">
                {/* Screen Content Simulation */}
                <div className="h-full w-full bg-slate-50 dark:bg-slate-800 overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="bg-primary-600 h-24 p-4 text-white pt-10 rounded-b-3xl shadow-lg relative z-10">
                         <div className="flex justify-between items-center">
                            <div className="w-8 h-8 rounded-full bg-white/20"></div>
                            <div className="text-sm font-bold">ProCV Editor</div>
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs">AI</div>
                         </div>
                    </div>
                    
                    {/* Floating Cards Animation */}
                    <div className="p-4 flex-1 space-y-4 overflow-hidden relative">
                         <motion.div 
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            className="bg-white dark:bg-slate-700 p-3 rounded-xl shadow-md border-l-4 border-indigo-500"
                         >
                             <div className="h-2 w-1/3 bg-slate-200 dark:bg-slate-600 rounded mb-2"></div>
                             <div className="h-2 w-3/4 bg-slate-100 dark:bg-slate-500 rounded"></div>
                         </motion.div>

                         <motion.div 
                            animate={{ y: [0, -15, 0] }}
                            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.5 }}
                            className="bg-white dark:bg-slate-700 p-3 rounded-xl shadow-md border-l-4 border-primary-500"
                         >
                             <div className="flex justify-between mb-2">
                                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-600 rounded"></div>
                                <div className="h-3 w-8 bg-green-100 dark:bg-green-900 rounded"></div>
                             </div>
                             <div className="space-y-1">
                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-500 rounded"></div>
                                <div className="h-1.5 w-5/6 bg-slate-100 dark:bg-slate-500 rounded"></div>
                                <div className="h-1.5 w-4/6 bg-slate-100 dark:bg-slate-500 rounded"></div>
                             </div>
                         </motion.div>
                    </div>

                    {/* Bottom Nav */}
                    <div className="h-16 bg-white dark:bg-slate-900 border-t dark:border-slate-700 flex justify-around items-center px-4">
                        <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50"></div>
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800"></div>
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="p-8 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all group"
  >
    <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg inline-block shadow-sm group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-slate-600 dark:text-slate-400">{desc}</p>
  </motion.div>
);

const StepCard = ({ number, icon, title, desc }: any) => (
    <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative flex flex-col items-center text-center p-6"
    >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg mb-6 rotate-3 hover:rotate-6 transition-transform">
            {icon}
        </div>
        <div className="absolute top-0 right-10 text-8xl font-bold text-slate-100 dark:text-slate-800 -z-10 font-sans">{number}</div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-slate-500">{desc}</p>
    </motion.div>
);

const TemplatePreviewCard = ({ name, color, isLight }: any) => (
    <div className="group">
        <div className={`h-80 w-full rounded-2xl shadow-xl overflow-hidden relative ${color} transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-2`}>
            {/* Fake Content */}
            <div className="p-6 h-full flex flex-col">
                <div className={`h-8 w-1/2 ${isLight ? 'bg-slate-200' : 'bg-white/20'} rounded mb-2`}></div>
                <div className={`h-4 w-1/3 ${isLight ? 'bg-slate-100' : 'bg-white/10'} rounded mb-8`}></div>
                
                <div className="space-y-3">
                    <div className={`h-2 w-full ${isLight ? 'bg-slate-100' : 'bg-white/10'} rounded`}></div>
                    <div className={`h-2 w-5/6 ${isLight ? 'bg-slate-100' : 'bg-white/10'} rounded`}></div>
                    <div className={`h-2 w-4/6 ${isLight ? 'bg-slate-100' : 'bg-white/10'} rounded`}></div>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-4">
                     <div className={`h-20 ${isLight ? 'bg-slate-100' : 'bg-white/5'} rounded-lg`}></div>
                     <div className={`h-20 ${isLight ? 'bg-slate-100' : 'bg-white/5'} rounded-lg`}></div>
                </div>
            </div>
            
             <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
        <h3 className="text-center mt-4 font-semibold text-lg text-slate-700 dark:text-slate-300">{name}</h3>
    </div>
);

const TestimonialCard = ({ quote, author, role, img, rating }: any) => (
    <div className="bg-white text-left p-8 rounded-2xl shadow-xl transform transition-all hover:-translate-y-1">
        <div className="flex gap-1 mb-4">
            {[1,2,3,4,5].map(i => <Star key={i} className={`w-4 h-4 ${i <= (rating || 5) ? 'text-yellow-400 fill-current' : 'text-slate-200'}`} />)}
        </div>
        <p className="text-slate-700 text-lg mb-6 italic">"{quote}"</p>
        <div className="flex items-center gap-4">
            <img src={img || `https://ui-avatars.com/api/?name=${author}`} alt={author} className="w-12 h-12 rounded-full object-cover border border-slate-100" />
            <div>
                <div className="font-bold text-slate-900">{author}</div>
                <div className="text-sm text-slate-500">{role}</div>
            </div>
        </div>
    </div>
);

export default LandingPage;