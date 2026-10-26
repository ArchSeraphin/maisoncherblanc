import { Fragment, type ReactNode } from "react";
import { analyserMarkdown, type Bloc, type EnLigne } from "@/lib/markdown";

/**
 * Rendu du Markdown restreint des articles (lib/markdown.ts) en éléments React :
 * aucun HTML brut, aucun `dangerouslySetInnerHTML`. Utilisable côté serveur
 * (page publique) comme côté client (aperçu de l'éditeur du BO).
 *
 *   <Markdown source={article.corps} className="prose" />
 */
export function Markdown({ source, className }: { source: string; className?: string }) {
  return <div className={className}>{analyserMarkdown(source).map(rendreBloc)}</div>;
}

function rendreEnLigne(n: EnLigne[]): ReactNode {
  return n.map((x, i) => {
    switch (x.t) {
      case "texte":
        return <Fragment key={i}>{x.v}</Fragment>;
      case "saut":
        return <br key={i} />;
      case "gras":
        return <strong key={i}>{rendreEnLigne(x.enfants)}</strong>;
      case "italique":
        return <em key={i}>{rendreEnLigne(x.enfants)}</em>;
      case "lien":
        return x.externe ? (
          <a key={i} href={x.href} rel="noopener noreferrer" target="_blank">
            {rendreEnLigne(x.enfants)}
          </a>
        ) : (
          <a key={i} href={x.href}>
            {rendreEnLigne(x.enfants)}
          </a>
        );
    }
  });
}

function rendreBloc(b: Bloc, i: number): ReactNode {
  switch (b.t) {
    case "p":
      return <p key={i}>{rendreEnLigne(b.enfants)}</p>;
    case "h2":
      return <h2 key={i}>{rendreEnLigne(b.enfants)}</h2>;
    case "h3":
      return <h3 key={i}>{rendreEnLigne(b.enfants)}</h3>;
    case "citation":
      return <blockquote key={i}>{rendreEnLigne(b.enfants)}</blockquote>;
    case "ul":
      return (
        <ul key={i}>
          {b.items.map((it, j) => (
            <li key={j}>{rendreEnLigne(it)}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol key={i}>
          {b.items.map((it, j) => (
            <li key={j}>{rendreEnLigne(it)}</li>
          ))}
        </ol>
      );
  }
}
