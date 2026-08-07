import { Link } from "react-router-dom";
import type { SectionMeta } from "../data/sections";
import "./SectionPage.css";

type SectionPageProps = {
  section: SectionMeta;
};

export default function SectionPage({ section }: SectionPageProps) {
  return (
    <main className="section-page">
      <Link to="/" className="section-page__back" aria-label="Back to bubbles">
        ← bubbles
      </Link>
      <h1 className="section-page__title bubble-text bubble-text--page">
        {section.title}
      </h1>
      <div className="section-page__body">
        {section.placeholder.map((line) => (
          <p key={line} className="section-page__line">
            {line}
          </p>
        ))}
        <div className="section-page__scribbles" aria-hidden>
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
    </main>
  );
}
