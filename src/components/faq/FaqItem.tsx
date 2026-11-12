export function FaqItem({
  id,
  question,
  answer,
  onDark = false,
}: {
  id?: string;
  question: string;
  /** A list renders as bullets (FAQ); a string stays one paragraph (parked /makler). */
  answer: string | readonly string[];
  onDark?: boolean;
}) {
  // On a petrol band the accordion adopts the on-dark palette (papier question,
  // gletscher answer, honig marker + focus ring).
  const border = onDark ? "border-gletscher/20" : "border-faden";
  const summaryColor = onDark ? "text-papier" : "text-tiefes-wasser";
  const hover = onDark ? "hover:text-honig" : "hover:text-vrelo-petrol";
  const ringOffset = onDark
    ? "focus-visible:ring-offset-vrelo-petrol"
    : "focus-visible:ring-offset-papier";
  const ring = onDark ? "focus-visible:ring-honig" : "focus-visible:ring-vrelo-petrol";
  const marker = onDark ? "text-honig" : "text-vrelo-petrol";
  const bullet = onDark ? "marker:text-honig" : "marker:text-vrelo-petrol";
  const answerColor = onDark ? "text-gletscher" : "text-tinte";
  return (
    // scroll-mt on the element carrying the id (sticky header, see CLAUDE.md gotchas).
    <details id={id} className={`group scroll-mt-24 border-b ${border} py-3`}>
      <summary
        className={`flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium ${summaryColor} transition-colors ${hover} [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${ringOffset} ${ring}`}
      >
        <span>{question}</span>
        <span
          aria-hidden="true"
          className={`shrink-0 text-xl leading-none ${marker} transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-open:rotate-45`}
        >
          +
        </span>
      </summary>
      {typeof answer === "string" ? (
        <p className={`mt-3 max-w-2xl text-pretty leading-relaxed ${answerColor}`}>{answer}</p>
      ) : (
        <ul className={`mt-2 flex max-w-2xl list-disc flex-col gap-1 pl-5 text-pretty leading-relaxed ${bullet} ${answerColor}`}>
          {answer.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </details>
  );
}
