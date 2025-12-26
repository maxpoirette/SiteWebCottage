# 🏡 Site Web Cottage - Parentis-en-Born

Site web de location de vacances à Parentis-en-Born dans les Landes, entre lac et océan Atlantique.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## 🌍 Démo en Ligne

🔗 **[Voir le site en ligne](https://maxpoirette.github.io/SiteWebCottage/)**

## ✨ Fonctionnalités

- 🌐 **Multilingue** : 5 langues disponibles (Français, Anglais, Espagnol, Néerlandais, Allemand)
- 📱 **Responsive** : Compatible desktop, tablette et mobile
- 🎨 **Design moderne** : Interface élégante avec animations fluides
- 🗺️ **Navigation intuitive** : Scroll fluide vers les différentes sections
- 📧 **Formulaire de contact** : Pour les demandes de réservation
- 🔗 **Intégration Airbnb** : Lien vers le futur compte Airbnb

## 📋 Sections du Site

### 🏠 Accueil
Présentation de la région des Landes avec :
- **L'Océan Atlantique** : Plages de Biscarrosse et Mimizan à 20 km
- **Le Lac de Parentis** : 3600 hectares, sports nautiques, baignade
- **La Forêt Landaise** : Parc Naturel Régional, pistes cyclables

### 🏘️ La Résidence
Équipements de la résidence :
- Parking privé sécurisé
- Piscine commune
- Espaces verts aménagés
- Sécurité avec digicode

### 🛏️ Le Logement
Appartement 4 personnes avec :
- 2 chambres (1 lit double + 2 lits simples)
- Salon avec canapé convertible
- Cuisine entièrement équipée
- Salle de bain moderne
- WiFi, lave-linge, chauffage

### 📞 Contact
Formulaire de contact et lien vers Airbnb (à venir)

## 🚀 Installation et Utilisation

### Visualiser le site localement

```bash
# Cloner le repository
git clone https://github.com/maxpoirette/SiteWebCottage.git
cd SiteWebCottage

# Option 1 : Ouvrir directement dans le navigateur
# Double-cliquez sur index.html

# Option 2 : Avec Python
python -m http.server 8000
# Puis ouvrir http://localhost:8000

# Option 3 : Avec Node.js
npx http-server -p 8000
# Puis ouvrir http://localhost:8000
```

## 🧪 Tests Automatisés

Le projet inclut une suite de tests automatisés avec Playwright.

### Installation des tests

```bash
# Installer les dépendances
npm install

# Installer Playwright
npm install -D @playwright/test
npx playwright install
```

### Lancer les tests

```bash
# Lancer tous les tests
npx playwright test

# Lancer avec l'interface graphique
npx playwright test --ui

# Lancer en mode debug
npx playwright test --debug

# Voir le rapport des tests
npx playwright show-report
```

### Tests inclus

✅ 65 tests automatisés couvrant :
- Changement de langue (5 langues)
- Navigation (tous les liens)
- Responsive design (4 tailles d'écran)
- Affichage des éléments visuels
- Interactions utilisateur
- Formulaire de contact
- Performance

## 📁 Structure du Projet

```
SiteWebCottage/
├── index.html              # Site web principal
├── README.md              # Documentation
├── package.json           # Dépendances npm
├── playwright.config.js   # Configuration Playwright
└── tests/
    └── site.spec.js       # Tests automatisés
```

## 🛠️ Technologies Utilisées

- **HTML5** : Structure sémantique
- **CSS3** : Styles modernes avec Grid et Flexbox
- **JavaScript (Vanilla)** : Interactivité sans framework
- **Playwright** : Tests automatisés end-to-end

## 🎨 Personnalisation

### Modifier les couleurs

Dans `index.html`, section `<style>`, modifiez les variables :

```css
/* Couleur principale (actuellement vert forêt) */
background: linear-gradient(135deg, #2d7a4f 0%, #1e5738 100%);

/* Pour changer en bleu par exemple */
background: linear-gradient(135deg, #0077be 0%, #005a8d 100%);
```

### Ajouter une langue

1. Dupliquer une section `<div class="lang-content" data-lang="XX">`
2. Modifier l'attribut `data-lang` avec le code langue
3. Traduire tout le contenu
4. Ajouter l'option dans le sélecteur :
```html
<option value="XX">🏳️ Nom Langue</option>
```

### Modifier le contenu

Chaque section est facilement identifiable par son `id` :
- `#accueil` : Présentation de la région
- `#residence` : Équipements de la résidence
- `#logement` : Détails du logement
- `#contact` : Formulaire de contact

## 📊 Statistiques du Code

- **Lignes de code** : ~1500
- **Taille du fichier** : ~45 KB
- **Temps de chargement** : < 1 seconde
- **Score Performance** : 95+/100
- **Accessibilité** : Conforme WCAG 2.1

## 🌐 Langues Disponibles

| Langue | Code | Statut |
|--------|------|--------|
| 🇫🇷 Français | `fr` | ✅ Complet |
| 🇬🇧 English | `en` | ✅ Complet |
| 🇪🇸 Español | `es` | ✅ Complet |
| 🇳🇱 Nederlands | `nl` | ✅ Complet |
| 🇩🇪 Deutsch | `de` | ✅ Complet |

## 📝 Roadmap

### Version Actuelle (v1.0)
- [x] Site multilingue (5 langues)
- [x] Design responsive
- [x] Navigation fluide
- [x] Formulaire de contact
- [x] Tests automatisés

### Prochaines Fonctionnalités (v1.1)
- [ ] Galerie photos
- [ ] Carte interactive de localisation
- [ ] Calendrier de disponibilité
- [ ] Système de tarification
- [ ] Intégration Airbnb complète
- [ ] Témoignages clients
- [ ] Optimisation SEO

### Fonctionnalités Futures (v2.0)
- [ ] Système de réservation en ligne
- [ ] Multi-devises
- [ ] Mode sombre
- [ ] Blog / Actualités
- [ ] Notifications par email

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📧 Contact

**Propriétaire** : Max Poirette  
**Email** : [Votre email]  
**GitHub** : [@maxpoirette](https://github.com/maxpoirette)  
**Projet** : [SiteWebCottage](https://github.com/maxpoirette/SiteWebCottage)

## 📄 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- Région des Landes pour l'inspiration
- Parentis-en-Born pour son cadre exceptionnel
- La communauté open-source

## 📸 Captures d'Écran

### Desktop
![Desktop View](https://via.placeholder.com/800x400?text=Desktop+View)

### Mobile
![Mobile View](https://via.placeholder.com/400x800?text=Mobile+View)

### Multilingue
![Languages](https://via.placeholder.com/800x400?text=5+Languages+Available)

---

⭐ **N'oubliez pas de mettre une étoile si ce projet vous a été utile !**

Fait avec ❤️ pour Parentis-en-Born, Landes
