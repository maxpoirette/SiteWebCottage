# Référentiel des fichiers — SiteWebCottage

Généré : 2026-01-02

Ce document présente l'arborescence principale du projet et une courte description des éléments importants.

## Racine

- `index.html` — Page principale. Charge dynamiquement les fragments de langues depuis `locales/` et contient les sections `#accueil`, `#residence`, `#logement`, `#contact`.
- `README.md` — Documentation du projet, instructions de développement et section "SEO / Indexation".
- `RELEASE.md` — Notes de release et historique des changements.
- `sitemap.xml` — Plan du site pour les moteurs de recherche.
- `.gitignore`
- `Old_CNAME.backup`
- `favicon.ico`

## assets/

- `assets/styles/cards.css` — Styles pour les cartes de résidence.

## locales/

- `fr.html`, `en.html`, `es.html`, `nl.html`, `de.html` — Fragments HTML par langue injectés dans `index.html`.
- `merci.html` — Fragment minimal pour l'iframe de FormSubmit (fallback).
- `merci_fr.json`, `merci_en.json`, `merci_es.json`, `merci_nl.json`, `merci_de.json` — Textes localisés pour le modal de remerciement.
- `site-vars.json` — Variables centralisées (images, `contact_email`, `year`, `airbnb_ical`, etc.).
- `contact-init.js` — Initialisation du formulaire de contact et logique d'envoi vers l'iframe sandbox.
- `airbnb-calendar.js` — Parser iCal et rendu calendrier (disponibilités).
- `airbnb.ics` — Fichier iCal local utilisé pour tests hors-serveur (optionnel).
- `labels/` — Titres/descriptions SEO et labels par langue (chargés dynamiquement) : `fr.json`, `en.json`, `es.json`, `nl.json`, `de.json`.
- `i18n-extract-plan.md` — Plan de migration des chaînes i18n.
- `seo-meta-suggestions.md` — Recommandations SEO pour les métadonnées par langue.
- `todo.json` — Notes et tâches liées aux localisations.

## photos/

- `Banniere.png`
- `biscarrosse-plage.jpeg`
- `parentis-en-born-landes.jpeg`
- `foret-landes.jpeg`
- `vue-lac.jpg`
- `piscine-ext.jpg`
- `piscine-int.jpg`
- `nature.jpg`

## tools/

- `tools/make_favicon.py` — Génération de `favicon.ico` depuis une image source.

## Remarques générales

- Architecture : site statique optimisé pour GitHub Pages ; le contenu multilingue est maintenu dans `locales/` pour faciliter les modifications sans toucher `index.html`.
- SEO : ajout de `sitemap.xml`, balises `canonical`/`hreflang` et d'un JSON-LD minimal `LodgingBusiness`. Les titres/descriptions par langue sont externalisés sous `locales/labels/` et chargés dynamiquement.
- Calendar / Airbnb : intégration iCal côté client avec parser robuste (gestion des lignes pliées, paramètres DTSTAMP/DTSTART/DTEND, DTEND exclusif pour calcul nuits). Le script normalise les chemins pour fonctionner sur GitHub Pages.
- Robustesse : `MutationObserver` et initialisations asynchrones pour ré-exécuter les widgets après injection des fragments de langue.

## Actions recommandées

- Tester le site localement via un serveur HTTP (ex. `python3 -m http.server`) pour valider les `fetch` et le rendu du calendrier.
- Déployer sur GitHub Pages et vérifier que `sitemap.xml` est accessible puis le soumettre à Google Search Console.
- Migrer progressivement les labels restants (ex. `calendar_labels`) vers `locales/labels/{lang}.json` puis supprimer les doublons dans `site-vars.json` après validation.

Fichier généré automatiquement — modifiez si vous souhaitez ajouter des descriptions supplémentaires ou détailler des fichiers spécifiques.
# Référentiel des fichiers — SiteWebCottage

Généré : 2026-01-02

Ce document présente l'arborescence principale du projet et une courte description des éléments importants.

.
├── index.html — Page principale. Charge dynamiquement les fragments de langues depuis `locales/` et contient les sections `#accueil`, `#residence`, `#logement`, `#contact`.
├── README.md — Documentation du projet, instructions de développement et section "SEO / Indexation".
├── RELEASE.md — Notes de release et historique des changements.
├── sitemap.xml — Plan du site pour les moteurs de recherche.
├── .gitignore
├── Old_CNAME.backup
├── favicon.ico
+
├── assets/
│   └── styles/
│       └── cards.css — Styles pour les cartes de résidence.
|
├── locales/
│   ├── fr.html, en.html, es.html, nl.html, de.html — Fragments HTML par langue injectés dans `index.html`.
│   ├── merci.html — Fragment minimal pour l'iframe de FormSubmit (fallback).
│   ├── merci_fr.json, merci_en.json, merci_es.json, merci_nl.json, merci_de.json — Textes localisés pour le modal de remerciement.
│   ├── site-vars.json — Variables centralisées (images, `contact_email`, `year`, `airbnb_ical`, etc.).
│   ├── contact-init.js — Initialisation du formulaire de contact et logique d'envoi vers l'iframe sandbox.
│   ├── airbnb-calendar.js — Parser iCal et rendu calendrier (disponibilités).
│   ├── airbnb.ics — Fichier iCal local utilisé pour tests hors-serveur (optionnel).
│   ├── labels/
│   │   ├── fr.json, en.json, es.json, nl.json, de.json — Titres/descriptions SEO et labels par langue (chargés dynamiquement).
│   ├── i18n-extract-plan.md — Plan de migration des chaînes i18n.
│   ├── seo-meta-suggestions.md — Recommandations SEO pour les métadonnées par langue.
│   └── todo.json — Notes et tâches liées aux localisations.
|
├── photos/
│   ├── Banniere.png
│   ├── biscarrosse-plage.jpeg
│   ├── parentis-en-born-landes.jpeg
│   ├── foret-landes.jpeg
│   ├── vue-lac.jpg
│   ├── piscine-ext.jpg
│   ├── piscine-int.jpg
│   └── nature.jpg
|
└── tools/
    └── make_favicon.py — Génération de `favicon.ico` depuis une image source.

Remarques générales

- Architecture : site statique optimisé pour GitHub Pages ; le contenu multilingue est maintenu dans `locales/` pour faciliter les modifications sans toucher `index.html`.
- SEO : ajout de `sitemap.xml`, balises `canonical`/`hreflang` et d'un JSON-LD minimal `LodgingBusiness`. Les titres/descriptions par langue sont externalisés sous `locales/labels/` et chargés dynamiquement.
- Calendar / Airbnb : intégration iCal côté client avec parser robuste (gestion des lignes pliées, paramètres DTSTAMP/DTSTART/DTEND, DTEND exclusif pour calcul nuits). Le script normalise les chemins pour fonctionner sur GitHub Pages.
- Robustesse : `MutationObserver` et initialisations asynchrones pour ré-exécuter les widgets après injection des fragments de langue.

Actions recommandées

- Tester le site localement via un serveur HTTP (ex. `python3 -m http.server`) pour valider les `fetch` et le rendu du calendrier.
- Déployer sur GitHub Pages et vérifier que `sitemap.xml` est accessible puis le soumettre à Google Search Console.
- Migrer progressivement les labels restants (ex. `calendar_labels`) vers `locales/labels/{lang}.json` puis supprimer les doublons dans `site-vars.json` après validation.

Fichier généré automatiquement — modifiez si vous souhaitez ajouter des descriptions supplémentaires ou détailler des fichiers spécifiques.
