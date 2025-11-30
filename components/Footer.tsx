import React from 'react';
import { useApp } from '../App';
import { TRANSLATIONS } from '../constants';
import { Github, Linkedin, Twitter, Heart } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Footer = () => {
  const { language } = useApp();
  const t = TRANSLATIONS[language].footer;
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const location = useLocation();

  const handleScroll = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
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
  };

  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4 cursor-pointer" onClick={() => navigate('/')}>
              <img className="h-8 w-auto mr-2" src="https://i.ibb.co/NnYwxp20/pro-cv-logo.png" alt="ProCV" />
              <span className="text-2xl font-bold text-white">ProCV</span>
            </div>
            <p className="text-slate-400 text-sm max-w-xs mb-6">
              L'outil ultime pour créer des CVs professionnels assistés par l'Intelligence Artificielle.
            </p>
            <div className="flex space-x-4">
              <SocialIcon icon={<Github className="w-5 h-5" />} href="#" />
              <SocialIcon icon={<Linkedin className="w-5 h-5" />} href="#" />
              <SocialIcon icon={<Twitter className="w-5 h-5" />} href="#" />
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">{t.links}</h3>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate('/')} className="hover:text-primary-400 transition-colors text-left">Accueil</button></li>
              <li><button onClick={(e) => handleScroll('features', e)} className="hover:text-primary-400 transition-colors text-left">Fonctionnalités</button></li>
              <li><button onClick={(e) => handleScroll('templates', e)} className="hover:text-primary-400 transition-colors text-left">Modèles</button></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">{t.legal}</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-primary-400 transition-colors">{t.privacy}</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">{t.terms}</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            &copy; {currentYear} ProCV. {t.rights}
          </p>
          
          <div className="flex items-center gap-1 text-sm font-medium bg-slate-800 px-4 py-2 rounded-full border border-slate-700">
            <span>{t.dev}</span>
            <a 
              href="http://portfoliodek.netlify.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-400 hover:text-primary-300 flex items-center gap-1 ml-1 transition-colors"
            >
              Dekens Ruzuba <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialIcon = ({ icon, href }: { icon: React.ReactNode, href: string }) => (
  <a 
    href={href} 
    className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all duration-300"
  >
    {icon}
  </a>
);

export default Footer;
