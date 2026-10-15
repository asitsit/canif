import Link from "next/link";

// Page affichée quand une adresse n'existe pas.

export default function Introuvable() {
  return (
    <section className="page-outil">
      <h1>Page introuvable</h1>
      <p>Cette adresse ne correspond à aucun outil.</p>
      <p>
        <Link href="/">Voir tous les outils</Link>
      </p>
    </section>
  );
}
