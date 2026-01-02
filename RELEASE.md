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

# Release — 2026-01-02 (v2026.01.02)

Résumé : i18n, SEO et amélioration du rendu du calendrier (ICS). Préparations pour déploiement sur le domaine canonique cottage13-domaine-du-lac.com.

Principaux changements

- Internationalisation & SEO
  - Externalisation des titres/descriptions SEO vers locales/labels/{fr,en,es,nl,de}.json.
  - index.html : loader asynchrone qui charge locales/labels/{lang}.json et met à jour document.title et meta[name=description] (cache en mémoire).
  - Ajout des balises canonical / hreflang et d'un JSON-LD LodgingBusiness minimal.
  - sitemap.xml ajouté à la racine et commité pour soumission à Google Search Console.

- Calendar & Airbnb integration
  - locales/airbnb-calendar.js : parsing iCal amélioré, résolution correcte des URLs .ics pour GitHub Pages, MutationObserver pour ré-initialiser après changement de langue.
  - UI : suppression de la liste "Périodes réservées", amélioration du sélecteur mois/année, affichage sur 3 mois centrés, corrections calcul nuits (DTEND exclusif).
  - Booking button : textes traduits par langue via airbnb_texts et bouton stylé via .airbnb-link. Suppression des boutons Airbnb dans la zone contact.

- Repository & documentation
  - Ajout de locales/labels/*.json, locales/i18n-extract-plan.md, locales/seo-meta-suggestions.md et mise à jour de README.md (section SEO / Indexation).
  - Ajout de sitemap.xml et autres notes pour la soumission au Search Console.

Notes de migration / tests

- Vérifier après déploiement sur https://cottage13-domaine-du-lac.com :
  - que sitemap.xml est accessible et soumis à Search Console;
  - que les balises canonical / hreflang sont correctes ;
  - que le calendrier charge l'ICS (200) et s'affiche pour chaque langue (changer la langue et recharger si nécessaire).

Prochaines étapes recommandées

- Générer des pages statiques par langue (index.fr.html, index.en.html, ...) si tu veux une indexation serveur-side par langue (je peux automatiser cela).
- Ajouter offers / aggregateRating au JSON-LD quand les prix/avis sont disponibles.

Crédits

- Auteur : Maxime Poirette
- Date : 2026-01-02
