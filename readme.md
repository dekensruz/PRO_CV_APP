# ProCV

ProCV est une application de génération de CV intelligente utilisant l'IA pour adapter votre CV aux offres d'emploi.

## Fonctionnalités

- **IA Générative** : Créez ou optimisez un CV à partir d'une description de poste.
- **Éditeur Complet** : Édition manuelle facile avec prévisualisation en temps réel.
- **Templates** : Plusieurs modèles modernes et classiques.
- **Export** : PDF haute qualité et format Word (DOCX).
- **Bilingue** : Français (défaut) et Anglais.
- **Thèmes** : Mode Clair (défaut) et Sombre.
- **Avis** : Système d'avis utilisateurs avec upload d'images.
- **Authentification** : Gestion utilisateurs via Supabase.

## Installation de la Base de Données

1. Allez sur votre tableau de bord Supabase.
2. Ouvrez l'éditeur SQL.
3. Copiez et collez le contenu du fichier `database.txt`.
4. Exécutez le script.

## Configuration du Stockage (Storage)

1. Allez dans l'onglet **Storage** de Supabase.
2. Créez un nouveau Bucket public nommé `public-files`.
3. Ajoutez des politiques (Policies) pour permettre la lecture (SELECT) publique et l'upload (INSERT) pour tous (ou utilisateurs authentifiés).

## Configuration

L'application utilise les clés Supabase fournies. Assurez-vous que l'authentification Google est activée dans votre projet Supabase si vous souhaitez utiliser la connexion sociale.
La clé API IA doit être disponible dans `process.env.API_KEY`.
