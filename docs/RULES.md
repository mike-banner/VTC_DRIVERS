# 🛡️ RÈGLES SACRÉES — Invariants & Sécurité Front

Ces règles ne doivent être **sous aucun prétexte** modifiées ou violées par un agent ou un développeur.

## 🔒 1. Sécurité & Supabase

> [!WARNING]
> Le site chauffeur est une **vitrine passive** avec un tunnel de commande. Il ne dispose d'aucun droit d'écriture direct sur les données sensibles.

- **Écritures Directes Interdites** : Pas d'insertion ou de mise à jour directe dans les tables de production (`bookings`, `transactions`, `users`, `pricing_rules`) depuis le client.
- **Passerelle Edge API** : Toute action de modification (création de réservation temporaire, demande de devis) doit impérativement passer par des appels d'Edge Functions Supabase ou des routes API Backoffice sécurisées.
- **Filtrage Tenant** : Chaque requête de lecture (ex: afficher les véhicules actifs d'un chauffeur) doit contenir le filtre `tenant_id` résolu par le middleware.

## 💳 2. Transactionnel & Stripe

- **Aucun Calcul Financier Côté Client** : Le calcul du montant final envoyé à Stripe ne doit **jamais** être effectué par le frontend. C'est l'Edge Function du Backoffice qui calcule le montant exact à partir des règles en base de données et génère l'URL Stripe Checkout.
- **Statut de Réservation** : Le frontend ne peut pas modifier le statut d'un booking (ex: passer de `pending` à `confirmed`). Cette mise à jour est réservée aux Webhooks Stripe ou aux actions admin côté Backoffice.

## 📝 3. Formulaires & Validation (Zod)

- **Date Picker** : Bloquer obligatoirement les dates passées. Appliquer un délai de prévenance minimal (ex: réservation impossible à moins de 2 heures du départ).
- **Validation Stricte** :
  - Validation typée de tous les formulaires via Zod.
  - Formatage standardisé des numéros de téléphone (E.164).
  - Validation d'emails valide et vérification des champs requis avant soumission.
