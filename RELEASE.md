# Release — 2025-12-28 (v2025.12.28)

Résumé : amélioration majeure du flux de contact et du comportement de la page de remerciement, ajout du favicon, ajout de photos et nettoyage des fichiers legacy.

Principaux changements

- Formulaires de contact
  - Injection dynamique de `contact_email` depuis `locales/site-vars.json`.
  - `contact-init.js` : interception globale des soumissions, retry/injection avant envoi, prévention des doubles-soumissions.
  - Forçage de la soumission vers un iframe caché sandboxé pour éviter les redirections de FormSubmit vers leur domaine.
  - Absolutisation de `_next` au runtime pour garantir le retour vers le domaine courant.

- Thank-you modal & localisation
  - Chargement dynamique des fichiers `locales/merci_*.json` et affichage du modal dans la bonne langue.
  - Détection de langue depuis `localStorage`, sélecteur, ou contenu visible.
  - Remplacement des anciennes pages `merci_*.html` par un mécanisme JSON/modal plus sûr.

- Assets & UI
  - Ajout de `favicon.ico` et lien dans `index.html`.
  - Ajout de photos dans `photos/` et mise à jour des variables dans `locales/site-vars.json`.
  - Extraction des styles de cartes dans `assets/styles/cards.css`.

- Nettoyages et robustesse
  - Suppression de fichiers legacy et debug logs.
  - Amélioration de la résolution de chemins pour GitHub Pages (retrait d'expositions globales inutiles).
  - Observation DOM pour supporter les changements de langage dynamiques et éviter les races.

Notes de migration / tests

- Vérifier que `locales/site-vars.json` contient bien la clé `contact_email`.
- Tester un envoi de formulaire en local via un serveur HTTP (voir README) : le modal de remerciement doit s'afficher et la page principale ne doit pas être redirigée vers FormSubmit.

Suggestions pour versioning

- Proposition de tag : `v2025.12.28` ou `v0.3.0` selon votre politique semver.

Crédits

- Auteur : Maxime Poirette
- Date : 2025-12-28
