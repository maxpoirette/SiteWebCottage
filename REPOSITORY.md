# Référentiel des fichiers — SiteWebCottage

Généré : 2025-12-29

Ce fichier recense les fichiers et dossiers principaux du projet avec une brève description pour chaque élément.

## Racine

- `index.html` — Page principale. Charge dynamiquement les fragments de langues depuis `locales/`, contient les sections `#accueil`, `#residence`, `#logement`, `#contact`.
- `README.md` — Documentation du projet et instructions de développement.
- `RELEASE.md` — Notes de release (ex. 2025-12-28).
- `.gitignore` — Fichiers/dossiers ignorés par Git.
- `Old_CNAME.backup` — Backup du fichier CNAME (historique).
- `favicon.ico` — Icône du site servie depuis la racine.

## `assets/`

- `assets/styles/cards.css` — Styles CSS pour l'affichage des cartes de résidence.

## `locales/`

- `fr.html`, `en.html`, `es.html`, `nl.html`, `de.html` — Fragments HTML par langue utilisés par `index.html`.
- `merci.html` — Page/fragment minimal utilisé pour l'iframe de FormSubmit (fallback minimal).
- `merci_en.json`, `merci_es.json`, `merci_nl.json`, `merci_de.json`, `merci_fr.json` — Fichiers JSON contenant les textes localisés du modal de remerciement.
- `site-vars.json` — Variables centralisées (chemins d'images, `contact_email`, `year`, etc.).
- `contact-init.js` — Script d'initialisation du formulaire de contact : résolution de `site-vars.json`, injection de `contact_email`, gestion des soumissions vers un iframe sandbox, modal de remerciement, détection de langue et retry pour éviter les races.

## `photos/`

- `Banniere.png` — Image de bannière utilisée sur le site.
- `biscarrosse-plage.jpeg` — Photo plage / océan.
- `parentis-en-born-landes.jpeg` — Photo du lac / paysage local.
- `foret-landes.jpeg` — Photo forêt.
- `vue-lac.jpg` — Vue sur le lac.
- `piscine-ext.jpg`, `piscine-int.jpg` — Photos piscine extérieure/intérieure.
- `nature.jpg` — Photo diverse nature.

## `tools/`

- `tools/make_favicon.py` — Script Python pour générer `favicon.ico` à partir d'une image source.

## Remarques

- Les contenus multilingues sont maintenus dans `locales/` pour faciliter les modifications sans toucher `index.html`.
- `locales/site-vars.json` centralise les chemins d'images et textes courts (ex. `contact_email`) : vérifiez-le avant de tester le formulaire de contact.
- Pour le développement local, servir via HTTP (ex. `python3 -m http.server`) pour que les `fetch` fonctionnent.

- Pour les instructions détaillées pour le développement local, voir la section "Développement / Debug" de `README.md`.

---

Fichier généré automatiquement — modifiez si vous souhaitez ajouter des descriptions supplémentaires ou détailler des fichiers spécifiques.
