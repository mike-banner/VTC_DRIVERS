import { defineMiddleware } from "astro:middleware";
import { supabase } from "./core/supabase";

export const onRequest = defineMiddleware(async (context, next) => {
  // Optionnel : On peut aussi résoudre le tenant ici pour qu'il soit
  // disponible partout, même dans les pages de /src/pages/

  const tenantId = import.meta.env.PUBLIC_TENANT_ID;
  console.log("[Middleware] Resolving Tenant ID:", tenantId);

  if (tenantId && !context.locals.tenant) {
    try {
      const { data: tenantData, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("id", tenantId)
        .single();

      if (tenantData) {
        console.log("[Middleware] Tenant found:", tenantData.name);
        context.locals.tenant = tenantData;
      } else {
        console.warn(
          "[Middleware] Tenant NOT found for ID:",
          tenantId,
          error?.message,
        );
        // Fallback pour éviter le crash layout
        context.locals.tenant = {
          id: tenantId,
          name: "Elite Lyon", // Fallback text
          primary_domain: "localhost:4321",
          theme: "luxury",
          platform_fee_rate: 0.1,
          created_at: new Date().toISOString(),
        };
      }
    } catch (e) {
      console.error("[Middleware] Critical Error during tenant resolution:", e);
    }
  }

  return next();
});
