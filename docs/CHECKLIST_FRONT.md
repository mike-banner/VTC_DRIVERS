# 🌐 SITE CHAUFFEUR CHECKLIST (Repo 2)

Ce dépôt contient le site public, le tunnel de réservation et la conversion client.

> [!IMPORTANT]
> **RÈGLE D'ARCHITECTURE CRITIQUE** : Aucune logique critique ou financière n'est hébergée ici. Tout est délégué au Backoffice. Se référer à [docs/RULES.md](file:///home/mike/projects/vtc/vtc-drivers/docs/RULES.md) pour les invariants de sécurité.

---

## 🏠 1️⃣ Pages Minimum

- [x] **Home** : Présentation et arguments de vente.
- [ ] **Services** : Pages de détails pour chaque type de prestation.
- [x] **Transfert** : Tunnel dédié (Terminé). Voir [docs/BUSINESS_FLOWS.md](file:///home/mike/projects/vtc/vtc-drivers/docs/BUSINESS_FLOWS.md).
- [ ] **Mise à Disposition** : Tunnel horaire (À faire).
- [ ] **Longue Distance** : Tunnel spécifique (À faire).
- [ ] **Business / Event** : Formulaire de contact / devis (À faire).
- [x] **Confirmation** : Récapitulatif avant paiement.
- [x] **Post-Paiement** : Pages Succès et Échec (Redirection Stripe).
- [ ] **Légal** : Mentions légales, CGV, Politique remboursement/no-show.

## 📝 2️⃣ Formulaire de Réservation

- [ ] **Validation Zod** : Validation stricte des champs client (Zod).
- [x] **Date Picker** : Blocage des dates passées et délais minimums.
- [x] **Calcul Prix** : Appel à l'Edge Function pour estimation dynamique.
- [x] **Soumission** : Création du booking temporaire via API Backoffice.
- [x] **Hand-off** : Redirection sécurisée vers Stripe Checkout.

## 🔄 3️⃣ Parcours Client (Emails)

- [ ] **Email Auto-Répondeur** : Confirmation de réception immédiate.
- [ ] **Email Confirmation Paiement** : Reçu et détails de la course.
- [ ] **Email Dispatch Chauffeur** : Notification de réservation (Côté Admin).
- [ ] **Email Rappel Client** : SMS/Email à H-24 et H-2.

## 📈 4️⃣ Conversion & Tracking

- [ ] **Tracking GTM/Pixel** : Paiement réussi, Abandon, Envoi formulaire.
- [ ] **SEO** : Optimisation meta-tags et performance. Voir [docs/SEO.md](file:///home/mike/projects/vtc/vtc-drivers/docs/SEO.md).

## ⚙️ 5️⃣ Stabilité Front

- [ ] **Error Boundaries** : Gestion propre des échecs API.
- [ ] **Loading States** : Squelettes de chargement et feedback visuel.
- [ ] **Retry Logic** : Tentatives automatiques sur les appels API instables.

