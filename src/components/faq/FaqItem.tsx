export function FaqItem({
  question,
  answer,
  onDark = false,
}: {
  question: string;
  answer: string;
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
  const answerColor = onDark ? "text-gletscher" : "text-tinte";
  return (
    <details className={`group border-b ${border} py-4`}>
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
      <p className={`mt-3 max-w-2xl text-pretty leading-relaxed ${answerColor}`}>{answer}</p>
    </details>
  );
}
