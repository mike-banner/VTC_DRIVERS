# 📓 ARCHITECTURAL DECISION RECORDS (ADR)

Index des choix d'architecture structurels impactant le projet vitrine.

## 📐 Format standard d'un ADR

Chaque nouvel ADR doit être consigné dans ce dossier sous la forme `XXXX-titre-de-la-decision.md` avec la structure suivante :

```markdown
# ADR XXXX : [Titre descriptif]

- **Date** : AAAA-MM-JJ
- **Statut** : [Proposé | Accepté | Remplacé]
- **Auteur** : [Nom]

## Contexte
[Quel problème cherche-t-on à résoudre ? Quelles contraintes avons-nous ?]

## Décision
[Quelle solution est retenue et pourquoi ?]

## Conséquences
[Qu'est-ce que cela change ? Quels sont les compromis ou dettes introduites ?]
```

## 🗂️ Liste des Décisions (ADR Index)

| ID | Titre | Statut | Date |
| :--- | :--- | :--- | :--- |
| `0001` | Isolation des tunnels et calculs côté Backoffice | **Accepté** | 2026-05-22 |

---

### ADR 0001 : Isolation des tunnels et calculs côté Backoffice

- **Date** : 2026-05-22
- **Statut** : Accepté
- **Auteur** : Mike

#### Contexte
Le site vitrine est déployé sur Cloudflare Pages et accessible publiquement par des utilisateurs anonymes. Intégrer des calculs financiers de prix ou de commissions côté client expose le service à des manipulations de tarifs lors des requêtes Stripe.

#### Décision
Toutes les règles de prix et de génération de session de checkout Stripe sont déléguées aux Edge Functions du Backoffice. Le frontend Astro n'effectue aucun calcul critique et se contente d'afficher les résultats renvoyés par l'API.

#### Conséquences
- Sécurité accrue face à la fraude de tarification.
- Le frontend reste extrêmement léger et concentré sur l'UI/UX.
- Nécessite une connexion réseau stable vers le Backoffice lors des étapes de commande.
