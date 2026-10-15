import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

// Mise en page commune à toutes les pages : en-tête, contenu, pied de page.

export const metadata: Metadata = {
  title: {
    default: "Canif, la boîte à outils des ateliers",
    template: "%s | Canif",
  },
  description:
    "Outils gratuits pour préparer, animer et restituer un atelier. Sans publicité, sans compte pour les participants.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <header className="entete">
          <div className="conteneur entete-contenu">
            <Link href="/" className="logo">
              Canif
            </Link>
            <span className="entete-slogan">La boîte à outils des ateliers</span>
          </div>
        </header>

        <main className="conteneur">{children}</main>

        <footer className="pied">
          <div className="conteneur">
            <p>Gratuit, sans publicité, sans compte pour les participants.</p>
            <p className="discret">Canif est un nom de travail. Site en construction.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
