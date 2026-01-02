Proposition: Extraire les traductions (calendar_labels, airbnb_texts)

But
- Séparer les libellés de `locales/site-vars.json` en fichiers par langue pour faciliter maintenance, relecture et CI.

Structure proposée
- `locales/labels/fr.json`
- `locales/labels/en.json`
- `locales/labels/es.json`
- `locales/labels/nl.json`
- `locales/labels/de.json`

Contenu type (exemple: `locales/labels/fr.json`)
```
{
  "calendar_labels": {
    "loading": "Chargement du calendrier…",
    "refresh": "Actualiser",
    "no_reservations": "Aucune réservation affichée.",
    "reserved_title": "Périodes réservées",
    "view_listing": "Voir l'annonce Airbnb",
    "error_fetch": "Impossible de charger le calendrier.",
    "refreshing": "Actualisation…",
    "updated": "Sélection du mois",
    "refresh_error": "Erreur d'actualisation",
    "no_ical": "Aucun calendrier configuré."
  },
  "airbnb_text": "📍 Réserver dans Airbnb"
}
```

Changements code
- Ajouter un loader dans `locales/airbnb-calendar.js` qui:
  - détecte `lang` comme aujourd'hui
  - tente `fetch('labels/'+lang+'.json')`
  - si ok -> utilise ces labels
  - sinon -> fallback vers `site-vars.json` (sécurité)
  - cache en mémoire (option: localStorage)

Plan d'action
1. Générer automatiquement `locales/labels/*.json` depuis `site-vars.json` (safe).
2. Implémenter le loader dans `airbnb-calendar.js` avec fallback.
3. Mettre à jour autres consommateurs (`contact-init.js`) pour utiliser le loader.
4. Tester sur GitHub Pages, vérifier Network/Console.
5. Optionnel: supprimer `calendar_labels` / `airbnb_texts` de `site-vars.json` après validation.

Todo (persisté)
- Create labels files from `site-vars.json`
- Implement labels loader with caching and fallback
- Update consumers to use loader
- Test on GitHub Pages
- Remove old keys from `site-vars.json` (optional)

Notes
- Je conserve `site-vars.json` comme source de secours jusqu'à validation en prod.
