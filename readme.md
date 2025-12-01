# ProCV

ProCV est une application de génération de CV intelligente utilisant l'IA pour adapter votre CV aux offres d'emploi.

## Fonctionnalités

- **IA Générative** : Créez ou optimisez un CV à partir d'une description de poste.
- **Éditeur Complet** : Édition manuelle facile avec prévisualisation en temps réel.
- **Templates** : Plusieurs modèles modernes et classiques (12+ designs).
- **Export** : PDF haute qualité et format Word (DOCX).
- **Bilingue** : Français (défaut) et Anglais.
- **Thèmes** : Mode Clair (défaut) et Sombre.
- **Avis** : Système d'avis utilisateurs avec upload d'images.
- **Authentification** : Gestion utilisateurs via Supabase (Email/Mot de passe).

## Installation de la Base de Données

1. Allez sur votre tableau de bord Supabase.
2. Ouvrez l'éditeur SQL.
3. Copiez et collez le contenu du fichier `database.txt`.
4. Exécutez le script.

## Configuration du Stockage (Storage)

1. Allez dans l'onglet **Storage** de Supabase.
2. Créez un nouveau Bucket public nommé `public-files`.
3. Ajoutez des politiques (Policies) pour permettre la lecture (SELECT) publique et l'upload (INSERT) pour tous (ou utilisateurs authentifiés).

## Déploiement sur Vercel (Variables d'environnement)

Pour que l'IA fonctionne en production :

1. Déployez votre projet sur Vercel.
2. Allez dans le tableau de bord de votre projet Vercel -> **Settings** -> **Environment Variables**.
3. Ajoutez la variable suivante :
   - **Key** : `API_KEY` (ou `VITE_API_KEY` si vous utilisez Vite)
   - **Value** : Votre clé API Google Gemini.

Si vous avez une page blanche au démarrage, assurez-vous que les variables sont bien définies. L'application contient un correctif automatique (`window.process`) pour éviter les plantages si les variables ne sont pas injectées correctement lors du build.

## Configuration Locale

Créez un fichier `.env` à la racine :
```
API_KEY=votre_cle_api_ici
```
