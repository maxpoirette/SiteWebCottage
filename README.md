# 🏡 Site Web Cottage - Parentis-en-Born

Site statique pour la location de vacances à Parentis‑en‑Born (Landes). Le projet a été refactoré : le contenu multilingue est externalisé dans `locales/` et les ressources (images, textes courts) sont paramétrées via `locales/site-vars.json` pour un maintien plus simple.

## ✨ Fonctionnalités

- 🌐 **Multilingue** : 5 langues disponibles (Français, Anglais, Espagnol, Néerlandais, Allemand)
- 📱 **Responsive** : Compatible desktop, tablette et mobile
- 🎨 **Design moderne** : Interface élégante avec animations fluides
- 🗺️ **Navigation intuitive** : Scroll fluide vers les différentes sections
- 🔍 **Agrandissement des photos** : Ouverture des images en grand au clic avec fermeture par overlay ou touche Échap
- 📧 **Formulaire de contact** : Pour les demandes de réservation
- 🔗 **Intégration Airbnb** : Lien vers le futur compte Airbnb

## 🌍 Démo

🔗 **[Voir le site en ligne](https://maxpoirette.github.io/SiteWebCottage/)**

## Principaux changements récents

- Externalisation des contenus par langue : `locales/<code>.html` (ex : `fr.html`, `en.html`, `nl.html`, `de.html`, `es.html`).
- Variables centralisées : `locales/site-vars.json` contient les chemins d'images et petits textes modifiables (`{{IMG_*}}`, `{{AIRBNB_TEXT}}`, `{{YEAR}}`).
- Le `index.html` charge dynamiquement la locale via `fetch` et remplace les tokens.
- Les images sont dans `photos/` et référencées depuis `site-vars.json`.
- La section `Services et équipements` est distincte du logement et doit conserver le même id de navigation dans toutes les langues : `#services-equipements`.

## Répertoire des fichiers

Pour la liste complète des fichiers et leurs descriptions, voir [REPOSITORY.md](REPOSITORY.md).

## Développement / Debug

Important : l'application charge les fragments de `locales/` via `fetch`. Ouvrir `index.html` en `file://` entraîne des échecs de chargement. Lancez un serveur local pour le développement :

```bash
cd /chemin/vers/SiteWebCottage
python3 -m http.server 8000
# puis ouvrez http://localhost:8000
```

Alternatives : `http-server` (npm) ou l'extension Live Server de VS Code.

### Cache
Le loader utilise `fetch(..., {cache: 'no-cache'})` par défaut pour éviter des problèmes de cache côté navigateur. En développement vous pouvez aussi désactiver le cache dans l'onglet Réseau des DevTools.

## Ajouter / Mettre à jour une langue

1. Créer `locales/xx.html` (où `xx` est le code langue).
2. Utiliser les mêmes `id` de sections que les locales existantes : `#bienvenue`, `#region`, `#residence`, `#logement`, `#services-equipements`, `#contact`.
3. Conserver les mêmes ancres de navigation entre le menu et les sections, sinon le scroll interne ne fonctionnera pas.
4. Utiliser les tokens `{{IMG_OCEAN}}`, `{{IMG_LAC}}`, `{{IMG_FORET}}` et plus généralement les `{{IMG_*}}` définis dans `locales/site-vars.json`.
5. Ajouter l'option correspondante dans le sélecteur de langue dans `index.html` si nécessaire.

## Modifier les images / textes centralisés

Éditez `locales/site-vars.json`. Exemple :

```json
{
	"images": {
		"OCEAN": "photos/biscarrosse-plage.jpeg",
		"LAC": "photos/parentis-en-born-landes.jpeg",
		"FORET": "photos/foret-landes.jpeg",
		"BANNIERE": "photos/Banniere.png"
	},
	"airbnb_url": "https://www.airbnb.fr/...",
	"year": "2026"
}
```

Après modification, rechargez la page (ou utilisez la console DevTools pour forcer le reload).

## Bonnes pratiques

- Servez toujours le site via HTTP pendant le développement.
- Modifiez les textes dans `locales/*.html` et les ressources dans `locales/site-vars.json` pour minimiser l'impact des changements.
- Pour toute nouvelle section navigable, gardez le même `id` dans toutes les locales et ajoutez l'entrée correspondante dans chaque menu localisé.

## Mise à jour Git — Checklist rapide

Utilise ces commandes pour ne rien oublier lors d'une mise à jour vers `origin/main`.

- Se placer sur la branche principale et récupérer les dernières modifications :
```bash
git checkout main
git pull origin main
```

- Stager et committer les changements locaux :
```bash
git add .
git commit -m "Votre message de commit clair"
```

- Pousser sur GitHub :
```bash
git push origin main
```

- Exemple de commande groupée :
```bash
git add --all && git commit -m "Modification" || echo 'No changes to commit' && git push origin main
```
 
## Commit Checklist (préconisations automatisées)

Avant chaque commit, respecter la checklist ci-dessous :

- [ ] No server mode — tester via push sur GitHub Pages si le site est statique
- [ ] Pas de nouveaux `console.log` / instructions de debug dans le code
- [ ] Mettre à jour `README.md` et `RELEASE.md` pour toute *nouvelle fonctionnalité* (pas pour un fix)
- [ ] Mettre à jour `REPOSITORY.md` pour lister tout fichier ajouté pertinent
- [ ] Le message de commit suit la convention du projet (clair et descriptif)

Ces recommandations sont destinées à être affichées localement avant la confirmation d'un commit afin d'éviter les oublis courants.

## SEO / Indexation (résumé rapide)

Pour assurer une bonne indexation par Google une fois le site déployé sur `cottagedulac13.com`, voici les actions prioritaires :

- **Domaine canonique & HTTPS** : vérifier la configuration DNS (CNAME/A) et activer TLS/SSL pour `https://cottagedulac13.com`.
- **Sitemap** : soumettre `https://cottagedulac13.com/sitemap.xml` dans Google Search Console après déploiement.
- **Hreflang / Canonical** : les balises `hreflang` et `canonical` sont présentes dans `index.html` — vérifie les URLs si tu sers des pages séparées par langue.
- **Meta / Titles** : les titres et descriptions SEO sont externalisés dans `locales/labels/{lang}.json` et chargés dynamiquement ; garder une meta description de fallback dans le `<head>` est recommandé.
- **Robots.txt** : ne pas bloquer l'accès aux crawlers ; ajoute un `robots.txt` permissif avec le lien vers le sitemap si nécessaire.
- **Structured data** : ajouter/compléter `offers` et `aggregateRating` dans le JSON-LD lorsque tu as des prix/avis pour bénéficier d'un affichage enrichi.

Vérifications rapides après déploiement : hard-refresh, soumettre le sitemap à Search Console, demander l'indexation des pages prioritaires et surveiller la couverture (Coverage) pour corriger les erreurs éventuelles.

## Contact

**Propriétaire** : Max Poirette  
**Email** : [Votre email]  
**GitHub** : [@maxpoirette](https://github.com/maxpoirette)  
**Projet** : [SiteWebCottage](https://github.com/maxpoirette/SiteWebCottage)


