# 📐 Architecture SaaS Multi-Tenant — Cadrage Projet VTC

> **Source de vérité architecturale.**
> Ce document définit les principes fondamentaux du projet.
> Tout développement doit être cohérent avec cette vision.

---

## 🎯 Vision

> **"Le Shopify des chauffeurs VTC — mais invisible."**

Chaque chauffeur a :

- Son **site**
- Son **domaine**
- Ses **clients**

...mais tourne sur **ton SaaS**.

---

## 1️⃣ Vue d'ensemble de l'infrastructure

```
                ┌───────────────────────────────┐
Users/Clients → │   Cloudflare (DNS + CDN)      │
                │   Multi-domain routing        │
                └───────────────┬───────────────┘
                                │ Host header
                                ▼
                      ┌──────────────────────┐
                      │ Astro Frontend       │
                      │ (1 codebase)         │
                      │ tenant resolver      │
                      │ theme loader         │
                      └─────────┬────────────┘
                                │
                                ▼
                        ┌───────────────┐
                        │ Supabase API  │
                        │ PostgREST     │
                        │ Auth          │
                        │ Edge Funcs    │
                        └──────┬────────┘
                               │
                               ▼
                       ┌────────────────┐
                       │ PostgreSQL     │
                       │ Multi-tenant   │
                       │ RLS isolation  │
                       └────────────────┘
                               │
                               ▼
                         ┌──────────┐
                         │ Stripe   │
                         │ Payments │
                         └──────────┘
```

---

## 2️⃣ Base de données — Structure logique

### `tenants`

Chaque chauffeur = un tenant.

```
tenants
--------
id                uuid        PK
name              text
primary_domain    text        UNIQUE
theme             text        (luxury | minimal | executive)
stripe_account_id text
platform_fee_rate numeric
created_at        timestamptz
```

---

### `profiles`

Utilisateur authentifié lié à un tenant.

```
profiles
--------
id             uuid   FK → auth.users.id
tenant_id      uuid   FK → tenants.id
tenant_role    enum   (owner | dispatcher | driver)
platform_role  enum   (admin | support | user)
created_at     timestamptz
```

---

### `onboarding`

Demande d'inscription chauffeur — phase pré-tenant.

```
onboarding
---------
id              uuid
profile_id      uuid   FK → profiles.id
status          enum   (pending | approved | rejected)
company_name    text
primary_domain  text
phone           text
created_at      timestamptz
validated_at    timestamptz
```

---

### `drivers`

```
drivers
-------
id              uuid
tenant_id       uuid   FK → tenants.id
first_name      text
last_name       text
phone           text
license_number  text
created_at      timestamptz
```

---

### `vehicles`

```
vehicles
--------
id          uuid
tenant_id   uuid   FK → tenants.id
driver_id   uuid   FK → drivers.id
brand       text
model       text
plate_number text
category    enum   (berline | van | premium | electric)
```

---

### `pricing_rules`

```
pricing_rules
-------------
id              uuid
tenant_id       uuid   FK → tenants.id
service_type    text
base_price      numeric
price_per_km    numeric
minimum_fare    numeric
active          boolean
```

---

### `bookings`

```
bookings
--------
id                  uuid
original_tenant_id  uuid   FK → tenants.id
current_tenant_id   uuid   FK → tenants.id
client_name         text
pickup_address      text
dropoff_address     text
pickup_time         timestamptz
total_amount        numeric
status              enum   (pending | paid | cancelled | completed)
payment_mode        enum   (stripe | cash | transfer)
created_at          timestamptz
```

> `original_tenant_id` vs `current_tenant_id` → permet le **partage de réservation** entre chauffeurs.

---

### `ledger` — Source de vérité financière

```
ledger
------
id             uuid
tenant_id      uuid   FK → tenants.id
booking_id     uuid   FK → bookings.id
movement_type  enum   (commission | payout | refund | fee)
direction      enum   (credit | debit)
amount         numeric
created_at     timestamptz
```

> Le ledger est **immuable**. Jamais de UPDATE. Toujours de nouveaux enregistrements.

---

## 3️⃣ Isolation Multi-Tenant (RLS)

Toutes les tables critiques ont un `tenant_id`.

**Politique RLS universelle :**

```sql
USING (
  tenant_id = (
    SELECT tenant_id
    FROM profiles
    WHERE id = auth.uid()
  )
)
```

**Résultat :**

```
chauffeur A  ≠  chauffeur B
→ isolation totale, garantie par la DB
```

---

## 4️⃣ Résolution du Tenant (Frontend)

```
request
  ↓
host header
  ↓
lookup tenants.primary_domain
  ↓
load tenant { id, theme, name }
```

**Exemple :**

```
elite-lyon.fr    →  tenant_id = 8c3b1a  →  theme = luxury
driver-paris.fr  →  tenant_id = 2f9d4e  →  theme = minimal
airport-vtc.com  →  tenant_id = 7b5c2a  →  theme = executive
```

---

## 5️⃣ Architecture Frontend (Astro)

```
src/
├── core/
│   ├── supabase.ts       # client Supabase
│   └── tenant.ts         # résolution tenant
│
├── components/
│   ├── BookingForm/
│   ├── Hero/
│   ├── Fleet/
│   ├── Pricing/
│   └── CTA/
│
├── themes/
│   ├── luxury/
│   ├── minimal/
│   └── executive/
│
├── pages/
│   ├── index.astro
│   ├── booking.astro
│   └── success.astro
│
└── admin/
    ├── onboarding.astro
    └── tenants.astro
```

**Principe :** Composants réutilisables + thèmes = N sites depuis 1 codebase.

---

## 6️⃣ Edge Functions — Logique Backend Critique

| Fonction                | Rôle                                           |
| ----------------------- | ---------------------------------------------- |
| `create-booking`        | Crée la réservation et l'enregistre en DB      |
| `create-payment-intent` | Génère le `PaymentIntent` Stripe               |
| `handle-stripe-webhook` | Traite les événements Stripe (paid, refunded…) |
| `approve-onboarding`    | Valide un chauffeur → crée tenant + owner      |
| `share-booking`         | Partage une réservation vers un autre tenant   |
| `accept-shared-booking` | Acceptation d'une réservation partagée         |
| `cancel-booking`        | Annulation + remboursement + ledger            |

> **Règle absolue** : Le frontend `call API → render UI`. Rien d'autre.

---

## 7️⃣ Flow Réservation

```
client visite site chauffeur
  ↓
booking form (frontend)
  ↓
edge function: create-booking
  ↓
edge function: create-payment-intent
  ↓
stripe checkout
  ↓
webhook stripe → handle-stripe-webhook
  ↓
bookings.status = paid
  ↓
ledger insert (commission + payout)
```

---

## 8️⃣ Flow Onboarding Chauffeur

```
signup (auth.users)
  ↓
onboarding form
  ↓
onboarding.status = pending
  ↓
admin review (backoffice)
  ↓
approve-onboarding → approve_onboarding_tx()
  ↓
CREATE tenant
  ↓
ASSIGN tenant_role = owner
```

---

## 9️⃣ Déploiement

```
GitHub
  ↓
Cloudflare Pages
  ↓
Astro build
  ↓
multi-domain routing
```

**DNS par chauffeur :**

```
son-domaine.fr
  ↓
CNAME → Cloudflare
```

---

## 🔟 Scalabilité

```
1  →  10 000 chauffeurs

=

1 frontend
1 backend
1 DB
```

**Si un tenant devient trop gros :**

```
tenant extraction
  →  DB dédiée
  →  Infra dédiée
```

Sans modifier le code.

---

## 1️⃣1️⃣ Modèle Économique

| Modèle                 | Description                                |
| ---------------------- | ------------------------------------------ |
| **Commission booking** | % prélevé sur chaque réservation complétée |
| **Subscription SaaS**  | Abonnement mensuel par tenant              |
| **Network fee**        | Frais fixe par transaction réseau          |

---

## ✅ Checklist de Conformité Architecturale

Avant toute implémentation, valider :

- [ ] La requête résout le `tenant_id` depuis le `host` header
- [ ] Toutes les queries filtrent par `tenant_id`
- [ ] La logique métier critique est dans une Edge Function
- [ ] Le frontend ne calcule rien de financier
- [ ] Les RLS sont définies sur toutes les tables impactées
- [ ] Aucune donnée cross-tenant n'est possible
- [ ] Le ledger est en insert-only (jamais de UPDATE sur les mouvements)
- [ ] Les webhooks Stripe sont vérifiés avec `stripe.webhooks.constructEvent`
