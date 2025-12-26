# 🏡 Site Web Cottage - Parentis-en-Born

Site web de location de vacances à Parentis-en-Born dans les Landes, entre lac et océan Atlantique.

## 🌍 Démo en Ligne

🔗 **[Voir le site en ligne](https://maxpoirette.github.io/SiteWebCottage/)**

## ✨ Fonctionnalités

- 🌐 **Multilingue** : 5 langues disponibles (Français, Anglais, Espagnol, Néerlandais, Allemand)
- 📱 **Responsive** : Compatible desktop, tablette et mobile
- 🎨 **Design moderne** : Interface élégante avec animations fluides
- 🗺️ **Navigation intuitive** : Scroll fluide vers les différentes sections
- 📧 **Formulaire de contact** : Pour les demandes de réservation
- 🔗 **Intégration Airbnb** : Lien vers le futur compte Airbnb
# 🏡 Site Web Cottage - Parentis-en-Born

Site statique pour la location de vacances à Parentis‑en‑Born (Landes). Le projet a été refactoré : le contenu multilingue est externalisé dans `locales/` et les ressources (images, textes courts) sont paramétrées via `locales/site-vars.json` pour un maintien plus simple.

## 🌍 Démo

🔗 **[Voir le site en ligne](https://maxpoirette.github.io/SiteWebCottage/)**

## Principaux changements récents

- Externalisation des contenus par langue : `locales/<code>.html` (ex : `fr.html`, `en.html`, `nl.html`, `de.html`, `es.html`).
- Variables centralisées : `locales/site-vars.json` contient les chemins d'images et petits textes modifiables (`{{IMG_*}}`, `{{AIRBNB_TEXT}}`, `{{YEAR}}`).
- Le `index.html` charge dynamiquement la locale via `fetch` et remplace les tokens.
- Les images sont dans `photos/` et référencées depuis `site-vars.json`.

## Fichiers importants

- `index.html` : page principale, loader des locales et JS de navigation
- `locales/` : dossier contenant un fichier HTML par langue (fr,en,es,nl,de)
- `locales/site-vars.json` : variables centralisées (images, year, airbnb text)
- `photos/` : images (ex : `biscarrosse-plage-768x506.webp`)

## Tokens disponibles dans les fichiers `locales/*.html`

- `{{IMG_OCEAN}}` — image de l'Océan
- `{{IMG_LAC}}` — image du Lac
- `{{IMG_FORET}}` — image de la Forêt
- `{{AIRBNB_TEXT}}` — texte du lien Airbnb
- `{{YEAR}}` — année affichée en footer

Remplacez ces tokens dans les fichiers `locales/*.html` si besoin, ou modifiez `locales/site-vars.json` pour changer images/textes sans toucher les fichiers de contenu.

## Développement / Debug

Important : l'application charge les fragments de `locales/` via `fetch`. Ouvrir `index.html` en `file://` entraîne des échecs de chargement. Lancez un serveur local pour le développement :

```bash
cd /Users/Maxime/Desktop/SiteWebCottage/SiteWebCottage
python3 -m http.server 8000
# puis ouvrez http://localhost:8000
```

Alternatives : `http-server` (npm) ou l'extension Live Server de VS Code.

### Cache
Le loader utilise `fetch(..., {cache: 'no-cache'})` par défaut pour éviter des problèmes de cache côté navigateur. En développement vous pouvez aussi désactiver le cache dans l'onglet Réseau des DevTools.

## Ajouter / Mettre à jour une langue

1. Créer `locales/xx.html` (où `xx` est le code langue).
2. Utiliser les mêmes `id` de sections (`#accueil`, `#residence`, `#logement`, `#contact`) dans le fichier.
3. Utiliser les tokens `{{IMG_OCEAN}}`, `{{IMG_LAC}}`, `{{IMG_FORET}}` pour les images.
4. Ajouter l'option correspondante dans le sélecteur de langue dans `index.html` si nécessaire.

## Modifier les images / textes centralisés

Éditez `locales/site-vars.json`. Exemple :

```json
{
	"images": {
		"OCEAN": "photos/biscarrosse-plage-768x506.webp",
		"LAC": "photos/parentis-en-born-landes-1617x1080.webp",
		"FORET": "photos/foret-landes-640x360.webp"
	},
	"airbnb_text": "📍 Réserver via Airbnb (bientôt)",
	"year": "2024"
}
```

Après modification, rechargez la page (ou utilisez la console DevTools pour forcer le reload).

## Bonnes pratiques

- Servez toujours le site via HTTP pendant le développement.
- Modifiez les textes dans `locales/*.html` et les ressources dans `locales/site-vars.json` pour minimiser l'impact des changements.

## Contact

**Propriétaire** : Max Poirette  
**Email** : [Votre email]  
**GitHub** : [@maxpoirette](https://github.com/maxpoirette)  
**Projet** : [SiteWebCottage](https://github.com/maxpoirette/SiteWebCottage)


