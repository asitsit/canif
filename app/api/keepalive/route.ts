// Route de maintien en vie de Supabase (second mécanisme, le premier étant
// .github/workflows/keepalive.yml).
//
// Vercel Cron l'appelle une fois par jour (voir vercel.json). Elle fait une
// vraie lecture dans la table public.keepalive, ce qui compte comme activité
// pour Supabase et évite la mise en pause du projet gratuit.
//
// Protection : si la variable CRON_SECRET est définie sur Vercel, Vercel
// l'envoie dans l'en-tête "Authorization: Bearer ..." et toute autre requête
// est refusée. Sans CRON_SECRET, la route reste ouverte (elle ne fait qu'une
// lecture d'une table publique), mais il est conseillé de la définir.

// Ne jamais mettre cette réponse en cache : chaque appel doit toucher la base.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // 1. Vérifier l'appelant (si un secret est configuré).
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ ok: false, erreur: "Non autorisé" }, { status: 401 });
  }

  // 2. Lire la configuration Supabase.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const cle = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !cle) {
    return Response.json({ ok: false, erreur: "Variables Supabase manquantes" }, { status: 500 });
  }

  // 3. Faire une petite lecture dans la base.
  try {
    const reponse = await fetch(`${url}/rest/v1/keepalive?select=id&limit=1`, {
      headers: { apikey: cle },
      cache: "no-store",
    });

    if (!reponse.ok) {
      // Le détail apparaît dans les journaux Vercel (conservés 1 heure sur Hobby).
      console.error("Ping Supabase en échec", reponse.status, await reponse.text());
      return Response.json({ ok: false, statut: reponse.status }, { status: 502 });
    }

    return Response.json({ ok: true, date: new Date().toISOString() });
  } catch (erreur) {
    console.error("Ping Supabase impossible", erreur);
    return Response.json({ ok: false, erreur: "Supabase injoignable" }, { status: 502 });
  }
}
