
# ProCV - Générateur de CV Intelligent par IA

Une application web complète pour créer, générer et gérer des CVs professionnels, alimentée par l'intelligence artificielle de Google Gemini et le backend Supabase.

## 🚀 Fonctionnalités Principales

### 🧠 Intelligence Artificielle (Gemini 2.5)
- **Génération Contextuelle** : Crée un CV complet à partir d'une simple description de poste.
- **Optimisation** : Adapte votre expérience existante aux mots-clés de l'offre.
- **Mode Bilingue** : Génération en Français ou Anglais.

### 🎨 Éditeur & Design
- **12+ Modèles Exclusifs** : 
  - *Classiques* : Modern, Classic, Minimalist.
  - *Pro* : Executive, Compact, Timeline.
  - *Créatifs* : Creative, Left Border, Double.
  - *Spéciaux* : Tech (Style code), Glitch (Cyberpunk), Swiss (Typographie suisse).
- **Éditeur Responsive** : 
  - **Desktop** : Vue partagée (Éditeur à gauche, Aperçu à droite).
  - **Mobile** : Système d'onglets intelligent avec bouton flottant pour basculer entre édition et aperçu.
- **Upload Photo** : Gestion d'image de profil intégrée avec stockage Cloud.

### 💾 Gestion des Données
- **Sauvegarde Automatique** : Système hybride (Local Storage + Base de données) pour ne jamais perdre vos modifications.
- **Export PDF Pro** : Moteur de rendu optimisé (A4 strict, haute résolution, pas de coupure de texte).
- **Export Word** : Génération de fichiers `.docx` éditables.
- **Tableau de Bord** : Gestion de multiples versions de CV.

### 🔐 Authentification & Social
- Connexion Email/Mot de passe sécurisée.
- Profil utilisateur personnalisable.
- Système d'avis clients avec notation et upload d'avatar.

## 🛠 Tech Stack

- **Frontend** : React 19, TypeScript, Tailwind CSS.
- **Animations** : Framer Motion.
- **Backend** : Supabase (Auth, Database, Storage, Realtime).
- **AI** : Google GenAI SDK.
- **Outils** : Vite, Lucide React, html2canvas, jsPDF, docx.

## ⚙️ Guide d'Installation

### 1. Configuration Supabase

L'application nécessite une base de données PostgreSQL hébergée sur Supabase.

1. Créez un projet sur [Supabase](https://supabase.com).
2. Allez dans la section **SQL Editor**.
3. Copiez l'intégralité du contenu du fichier `database.txt` fourni dans ce projet.
4. Exécutez le script. Cela va :
   - Créer les tables (`profiles`, `resumes`, `reviews`).
   - Configurer la sécurité (RLS Policies).
   - Créer les Triggers pour la mise à jour automatique des dates (`updated_at`).
   - Créer le Bucket de stockage `public-files` pour les images.

### 2. Variables d'Environnement

Pour que l'IA fonctionne, vous devez configurer la clé API Google Gemini.

**En Local (.env) :**
```bash
API_KEY=votre_cle_api_gemini
```

**Sur Vercel (Production) :**
Allez dans **Settings > Environment Variables** et ajoutez :
- **Name**: `API_KEY`
- **Value**: `votre_cle_api_gemini_ici`

> **Note** : Les URLs et Clés Supabase sont actuellement définies dans `constants.ts` pour la démonstration. Pour une production stricte, déplacez-les également dans les variables d'environnement.

## 🐛 Dépannage Courant

- **Page Blanche sur Vercel** : L'application inclut un polyfill (`window.process`) dans `index.html` pour éviter les crashs si les variables d'environnement ne sont pas accessibles immédiatement.
- **Modifications perdues** : Assurez-vous d'avoir exécuté la partie du script SQL concernant les `Triggers` (`handle_updated_at`).
- **Export PDF décalé** : L'export utilise un conteneur isolé. Si vous avez des soucis, vérifiez que vous n'utilisez pas d'extensions de navigateur qui modifient le CSS (Dark Reader, etc.).

## 👤 Auteur

Développé par **Dekens Ruzuba**.
[Voir le Portfolio](http://portfoliodek.netlify.app/)
