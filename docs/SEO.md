# 📈 STRATÉGIE SEO — Pages Locales & Invariants

Règles pour maximiser le référencement naturel local et éviter les régressions d'indexation.

## 🛡️ Invariants Techniques de Référencement

- **Balise H1 Unique** : Une seule balise `<h1>` par page. Pas de `<h1>` masqué ou imbriqué.
- **Balises Meta Recommandées** :
  - `<title>` : Unique et sous le format `[Service] [Ville] | [Nom de l'entreprise]` (max 60 caractères).
  - `<meta name="description">` : Unique, incitative (max 155 caractères).
  - `<link rel="canonical" href="...">` : Toujours renseigner l'URL absolue correcte.
- **Performance Lighthouse** : Conserver un score supérieur à **90** sur mobile et desktop (optimisation du chargement des images via le composant Astro `<Image />` et chargement asynchrone des scripts tiers).
- **IDs uniques et descriptifs** : Tous les éléments interactifs majeurs (boutons de réservation, inputs) doivent disposer d'un ID unique (`id="booking-submit-btn"`) pour les tests automatisés et l'analyse d'audience.

## 🗺️ Pages Locales Réseau (Routes)

Le projet intègre des landing pages optimisées par ville pour capter le trafic de recherche locale (ex: "Chauffeur privé Lyon", "VTC aéroport Paris").

- **Structure des Routes** : Définie dynamiquement via `src/pages/[...path].astro`.
- **Données de Content Local** : Résolues par la base de données via le tenant_id. Chaque ville ciblée par un chauffeur possède son propre enregistrement dans Supabase (table `local_pages`).

## 🧱 Données Structurées (Schema.org)

Chaque page vitrine doit injecter du JSON-LD :
- **Type LocalBusiness** ou **TaxiService**.
- Intégrer les avis clients, la zone géographique desservie (`areaServed`), et les coordonnées de contact (`telephone`, `email`).
