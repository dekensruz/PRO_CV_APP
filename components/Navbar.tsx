import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useApp } from '../App';
import { TRANSLATIONS } from '../constants';
import { Sun, Moon, Languages, LogOut, User, Menu, X, Mail, Chrome, Loader2, Check, Lock, UserPlus, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut } = useAuth();
  const { language, setLanguage, theme, toggleTheme } = useApp();
  const t = TRANSLATIONS[language].nav;
  const tAuth = TRANSLATIONS[language].auth;
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Login/Signup State
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  // Password Visibility
  const [showPassword, setShowPassword] = useState(false);

  const handleScroll = (id: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMessage(null);

    if (!email || !password) return;
    
    if (isSignUp) {
        if (!fullName) {
            setAuthMessage({ type: 'error', text: "Le nom complet est requis." });
            return;
        }
        if (password !== confirmPassword) {
            setAuthMessage({ type: 'error', text: "Les mots de passe ne correspondent pas." });
            return;
        }
        if (password.length < 6) {
             setAuthMessage({ type: 'error', text: "Le mot de passe doit contenir au moins 6 caractères." });
             return;
        }
    }

    setIsEmailLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUpWithEmail(email, password, fullName);
        if (error) {
          setAuthMessage({ type: 'error', text: error.message });
        } else {
          setAuthMessage({ type: 'success', text: tAuth.successSignup });
          // Optional: Switch to login or close modal if auto-login
        }
      } else {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          setAuthMessage({ type: 'error', text: error.message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect' : error.message });
        } else {
          setShowLoginModal(false);
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setAuthMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsEmailLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setAuthMessage(null);
    setIsSignUp(false);
    setShowPassword(false);
  };

  // Listen for event to open auth modal from other components (like Landing Page)
  useEffect(() => {
    const handleOpenAuth = (e: any) => {
        resetForm();
        if (e.detail?.mode === 'signup') {
            setIsSignUp(true);
        }
        setShowLoginModal(true);
    };
    window.addEventListener('open-auth-modal', handleOpenAuth);
    return () => window.removeEventListener('open-auth-modal', handleOpenAuth);
  }, []);

  return (
    <>
      <nav className="fixed top-0 w-full z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <img className="h-8 w-auto md:h-10" src="https://i.ibb.co/NnYwxp20/pro-cv-logo.png" alt="ProCV" />
              <span className="ml-2 text-lg md:text-xl font-bold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
                ProCV
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-6">
              <button onClick={() => handleScroll('features')} className="text-sm font-medium hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                {t.features}
              </button>
              <button onClick={() => handleScroll('templates')} className="text-sm font-medium hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                {t.templates}
              </button>
              
              <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-2"></div>

              <button 
                onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Change Language"
              >
                <div className="flex items-center space-x-1 font-medium text-sm">
                  <Languages className="w-4 h-4" />
                  <span>{language.toUpperCase()}</span>
                </div>
              </button>

              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              {user ? (
                <div className="flex items-center space-x-4">
                  <Link to="/dashboard" className="text-sm font-medium hover:text-primary-600 transition-colors">
                    {t.dashboard}
                  </Link>
                  <div className="flex items-center space-x-2">
                    <img 
                      src={user.user_metadata.avatar_url || "https://ui-avatars.com/api/?name=User"} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700"
                    />
                    <button 
                      onClick={signOut}
                      className="flex items-center space-x-1 text-sm font-medium text-red-500 hover:text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => { resetForm(); setShowLoginModal(true); }}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary-500/30 flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  {t.login}
                </button>
              )}
            </div>

            {/* Mobile Header Controls */}
            <div className="md:hidden flex items-center gap-1">
               {/* Language Mobile */}
              <button 
                onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className="text-xs font-bold">{language.toUpperCase()}</span>
              </button>

              {/* Theme Mobile */}
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              {/* Menu Toggle */}
              <button onClick={() => setIsOpen(!isOpen)} className="p-2 ml-1 text-slate-700 dark:text-slate-200">
                  {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 space-y-4 shadow-xl">
              <button onClick={() => handleScroll('features')} className="block w-full text-left py-2 font-medium">{t.features}</button>
              <button onClick={() => handleScroll('templates')} className="block w-full text-left py-2 font-medium">{t.templates}</button>
              
              <div className="border-t border-slate-200 dark:border-slate-800 my-2"></div>
              
              {user ? (
                  <>
                      <Link to="/dashboard" className="block w-full py-2 font-medium text-primary-600">{t.dashboard}</Link>
                      <button onClick={signOut} className="block w-full text-left py-2 text-red-500 flex items-center gap-2">
                          <LogOut className="w-4 h-4" /> {t.logout}
                      </button>
                  </>
               ) : (
                  <button onClick={() => { setIsOpen(false); resetForm(); setShowLoginModal(true); }} className="w-full bg-primary-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2">
                      <User className="w-4 h-4" /> {t.login}
                  </button>
               )}
          </div>
        )}
      </nav>

      {/* Login/Signup Modal */}
      <AnimatePresence>
        {showLoginModal && !user && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowLoginModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 to-indigo-600" />
              <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600">
                  {isSignUp ? tAuth.signup : tAuth.login}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                  {tAuth.subtitle}
                </p>
              </div>

              {authMessage && (
                <div className={`mb-6 p-4 rounded-lg text-sm flex items-start gap-2 ${
                  authMessage.type === 'success' 
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                    : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                }`}>
                  {authMessage.type === 'success' ? <Check className="w-5 h-5 shrink-0" /> : <X className="w-5 h-5 shrink-0" />}
                  <span>{authMessage.text}</span>
                </div>
              )}

              <div className="space-y-4">
                <button 
                  onClick={signInWithGoogle}
                  className="w-full flex items-center justify-center gap-3 py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors font-medium text-slate-700 dark:text-slate-200"
                >
                  <Chrome className="w-5 h-5 text-red-500" />
                  {tAuth.google}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-slate-800 text-slate-500">{tAuth.or}</span>
                  </div>
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-4">
                  {isSignUp && (
                     <div className="space-y-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{tAuth.name}</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input 
                            type="text" 
                            required={isSignUp}
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            placeholder="Ex: Dekens Ruzuba"
                          />
                        </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{tAuth.email}</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        placeholder="vous@exemple.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{tAuth.password}</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        placeholder="••••••••"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {isSignUp && (
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirmer mot de passe</label>
                        <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                            type={showPassword ? "text" : "password"}
                            required={isSignUp}
                            minLength={6}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-10 pr-12 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            placeholder="••••••••"
                        />
                        </div>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={isEmailLoading}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isEmailLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? <UserPlus className="w-5 h-5" /> : <Mail className="w-5 h-5" />)}
                    {isSignUp ? tAuth.signup : tAuth.login}
                  </button>
                </form>

                <div className="text-center pt-2">
                  <button 
                    onClick={() => { setIsSignUp(!isSignUp); setAuthMessage(null); setPassword(''); setConfirmPassword(''); }}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {isSignUp ? tAuth.hasAccount : tAuth.noAccount} {isSignUp ? tAuth.login : tAuth.signup}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;