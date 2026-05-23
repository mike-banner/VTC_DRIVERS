# 🗄️ ARCHITECTURE SUPABASE — Multi-Tenant & RLS

Spécifications d'intégration et d'isolation des bases de données.

## 🔌 1. Supabase Client & Configuration

- **Fichier Source** : `src/core/supabase.ts`
- **Variables requis (.env)** :
  - `PUBLIC_SUPABASE_URL` : Point d'accès de l'instance.
  - `PUBLIC_SUPABASE_ANON_KEY` : Clé publique anon (soumise aux règles RLS).

## 🏢 2. Résolution du Tenant (Multi-Tenant)

- **Fichier Source** : `src/core/tenant.ts`
- **Fonctionnement** : La fonction `resolveTenant(host)` interroge la table `tenants` sur la colonne `primary_domain`.
- **Stratégie à Grande Échelle** : Se référer à l' [ADR 0002](file:///home/mike/projects/vtc/vtc-drivers/docs/adr/0002-resolution-domaine-multi-tenant.md) pour les détails opérationnels sans domaine en dev/preview et le passage à 10 000+ sites.
- **Règle d'Isolation** :
  - Tous les composants Astro récupèrent les données filtrées par l'identifiant du tenant résolu (`tenant_id`).
  - **Exemple de filtre obligatoire** :
    ```typescript
    const { data } = await supabase
      .from("vehicles")
      .select("*")
      .eq("tenant_id", tenantId);
    ```

## 🛡️ 3. Modèle RLS & Droits d'Accès

Le site public possède des droits limités pour éviter toute compromission de données :

| Table / Service | Type d'accès Front | Canal de communication |
| :--- | :--- | :--- |
| `tenants` | Lecture (Public) | Direct SDK Supabase |
| `vehicles` | Lecture (Public) | Direct SDK Supabase |
| `pricing_rules` | Lecture (Public) | Direct SDK Supabase |
| `local_pages` | Lecture (Public) | Direct SDK Supabase |
| `bookings` | **Écriture interdite** | Doit passer par l'Edge Function du Backoffice |
| `transactions` | **Interdit total** | Non accessible depuis le front |

## ⚙️ 4. Edge Functions Partagées (Backoffice API)

Le frontend interagit avec des endpoints Deno hébergés côté backend :
- `calculate-price` : Estime le montant de la course en fonction des points A et B et des tarifs du tenant.
- `create-booking-session` : Insère la réservation temporaire et génère la session Stripe Checkout sécurisée.
