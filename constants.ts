
import { ResumeData } from './types';

export const SUPABASE_URL = 'https://ygracycqoceujphospbq.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlncmFjeWNxb2NldWpwaG9zcGJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0ODc5NzcsImV4cCI6MjA4MDA2Mzk3N30.XRxi2X1UvY5EC-uBKK6-dGvNlwVaNCRWWkbCZvi3yqM';

export const INITIAL_RESUME_STATE: ResumeData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    photoUrl: '',
    jobTitle: '',
    summary: '',
    linkedin: '',
    website: ''
  },
  experience: [],
  education: [],
  skills: [],
  languages: []
};

export const TRANSLATIONS = {
  fr: {
    nav: {
      home: 'Accueil',
      features: 'Fonctionnalités',
      templates: 'Modèles',
      dashboard: 'Mes CVs',
      login: 'Connexion',
      logout: 'Déconnexion',
      create: 'Créer un CV'
    },
    auth: {
      title: 'Bienvenue sur ProCV',
      subtitle: 'Connectez-vous pour créer et sauvegarder vos CVs',
      login: 'Se connecter',
      signup: 'S\'inscrire',
      email: 'Adresse Email',
      password: 'Mot de passe',
      name: 'Nom complet',
      noAccount: 'Pas encore de compte ?',
      hasAccount: 'Déjà un compte ?',
      google: 'Continuer avec Google',
      or: 'Ou avec email',
      successSignup: 'Compte créé ! Veuillez vérifier votre email pour confirmer.',
      error: 'Une erreur est survenue.'
    },
    hero: {
      title: 'Créez le CV Parfait avec',
      subtitle: 'Générez des CV professionnels adaptés aux offres d\'emploi grâce à l\'intelligence artificielle. Exportez en PDF et Word.',
      cta: 'Commencer gratuitement',
      secondary: 'Voir les modèles',
      badge: 'Génération par IA v2.5',
      labels: ['Gratuit', 'Export PDF', 'IA Puissante']
    },
    features: {
      ai: {
        title: 'IA Puissante',
        desc: 'Analysez les offres d\'emploi et générez un contenu pertinent.'
      },
      templates: {
        title: 'Modèles Modernes',
        desc: 'Des designs élégants qui se démarquent des autres candidats.'
      },
      export: {
        title: 'Export Flexible',
        desc: 'Téléchargez en PDF haute qualité ou en Word éditable.'
      }
    },
    steps: {
      title: 'Comment ça marche ?',
      step1: 'Collez l\'offre',
      desc1: 'Copiez la description du poste visé.',
      step2: 'Laissez l\'IA agir',
      desc2: 'Notre IA rédige et optimise votre CV.',
      step3: 'Téléchargez',
      desc3: 'Exportez en PDF ou Word et postulez.'
    },
    testimonials: {
      title: 'Ce que disent nos utilisateurs',
      addReview: 'Laisser un avis',
      modal: {
        title: 'Partagez votre expérience',
        name: 'Votre nom',
        role: 'Votre rôle (ex: Développeur)',
        message: 'Votre avis',
        photo: 'Votre photo (optionnel)',
        rating: 'Note',
        submit: 'Envoyer l\'avis',
        cancel: 'Annuler',
        uploading: 'Envoi en cours...'
      }
    },
    footer: {
      rights: 'Tous droits réservés.',
      dev: 'Développé par',
      links: 'Liens',
      legal: 'Légal',
      privacy: 'Confidentialité',
      terms: 'Conditions'
    },
    editor: {
      tabs: {
        personal: 'Infos',
        experience: 'Expérience',
        education: 'Éducation',
        skills: 'Compétences',
        preview: 'Aperçu'
      },
      buttons: {
        generateAI: 'Générer avec IA',
        add: 'Ajouter',
        remove: 'Supprimer',
        save: 'Sauvegarder',
        exportPDF: 'PDF',
        exportDOCX: 'Word',
        back: 'Retour',
        changeTemplate: 'Changer de modèle'
      },
      labels: {
        fullName: 'Nom complet',
        jobTitle: 'Titre du poste',
        summary: 'Résumé professionnel',
        current: 'Poste actuel',
        description: 'Description',
        photo: 'Photo de profil'
      },
      aiModal: {
        title: 'Générer le contenu via IA',
        placeholder: 'Collez la description du poste ici...',
        processing: 'Génération en cours...',
        button: 'Générer le CV'
      },
      templateModal: {
        title: 'Choisir un modèle'
      }
    }
  },
  en: {
    nav: {
      home: 'Home',
      features: 'Features',
      templates: 'Templates',
      dashboard: 'My Resumes',
      login: 'Login',
      logout: 'Logout',
      create: 'Create Resume'
    },
    auth: {
      title: 'Welcome to ProCV',
      subtitle: 'Log in to create and save your resumes',
      login: 'Log In',
      signup: 'Sign Up',
      email: 'Email Address',
      password: 'Password',
      name: 'Full Name',
      noAccount: 'Don\'t have an account?',
      hasAccount: 'Already have an account?',
      google: 'Continue with Google',
      or: 'Or with email',
      successSignup: 'Account created! Please check your email to confirm.',
      error: 'An error occurred.'
    },
    hero: {
      title: 'Create the Perfect Resume with',
      subtitle: 'Generate professional resumes tailored to job descriptions using Artificial Intelligence. Export to PDF and Word.',
      cta: 'Start for Free',
      secondary: 'View Templates',
      badge: 'AI Generation v2.5',
      labels: ['Free', 'PDF Export', 'Powerful AI']
    },
    features: {
      ai: {
        title: 'Powerful AI',
        desc: 'Analyze job descriptions and generate relevant content.'
      },
      templates: {
        title: 'Modern Templates',
        desc: 'Elegant designs that stand out from other candidates.'
      },
      export: {
        title: 'Flexible Export',
        desc: 'Download in high-quality PDF or editable Word.'
      }
    },
    steps: {
      title: 'How it Works',
      step1: 'Paste Job',
      desc1: 'Copy the target job description.',
      step2: 'Let AI Work',
      desc2: 'Our AI writes and optimizes your resume.',
      step3: 'Download',
      desc3: 'Export to PDF or Word and apply.'
    },
    testimonials: {
      title: 'What our users say',
      addReview: 'Leave a Review',
      modal: {
        title: 'Share your experience',
        name: 'Your Name',
        role: 'Your Role (e.g., Developer)',
        message: 'Your Review',
        photo: 'Your Photo (optional)',
        rating: 'Rating',
        submit: 'Submit Review',
        cancel: 'Cancel',
        uploading: 'Uploading...'
      }
    },
    footer: {
      rights: 'All rights reserved.',
      dev: 'Developed by',
      links: 'Links',
      legal: 'Legal',
      privacy: 'Privacy',
      terms: 'Terms'
    },
    editor: {
      tabs: {
        personal: 'Info',
        experience: 'Experience',
        education: 'Education',
        skills: 'Skills',
        preview: 'Preview'
      },
      buttons: {
        generateAI: 'Generate with AI',
        add: 'Add',
        remove: 'Remove',
        save: 'Save',
        exportPDF: 'PDF',
        exportDOCX: 'Word',
        back: 'Back',
        changeTemplate: 'Change Template'
      },
      labels: {
        fullName: 'Full Name',
        jobTitle: 'Job Title',
        summary: 'Professional Summary',
        current: 'Current Position',
        description: 'Description',
        photo: 'Profile Photo'
      },
      aiModal: {
        title: 'Generate Content via AI',
        placeholder: 'Paste job description here...',
        processing: 'Generating...',
        button: 'Generate Resume'
      },
      templateModal: {
        title: 'Choose a Template'
      }
    }
  }
};
