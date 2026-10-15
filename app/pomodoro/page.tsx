import type { Metadata } from "next";
import EnteteOutil from "@/components/entete-outil";
import Pomodoro from "./pomodoro";

// C5 : Pomodoro. Tout se passe dans le navigateur.

export const metadata: Metadata = {
  title: "Pomodoro",
  description: "Minuteur Pomodoro : cycles de travail et de pause réglables, signal à chaque étape. Gratuit, sans compte.",
};

export default function PagePomodoro() {
  return (
    <article className="outil">
      <EnteteOutil slug="pomodoro" />
      <Pomodoro />
    </article>
  );
}
