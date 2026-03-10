import { defineMiddleware } from "astro:middleware";
import { supabase } from "./lib/supabase";

export const onRequest = defineMiddleware(async (context, next) => {
  const host = context.url.host;

  // Simulation ou appel DB pour récupérer le tenant
  const { data: tenant } = await supabase
    .from("tenants")
    .select("*")
    .eq("primary_domain", host)
    .single();

  if (!tenant) {
    return new Response("Plateforme VTC - Domaine non enregistré", {
      status: 404,
    });
  }

  // On stocke les infos pour les utiliser dans les pages .astro
  context.locals.tenant = tenant;

  return next();
});
