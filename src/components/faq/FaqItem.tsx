export function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <details className="group border-b border-faden py-4">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium text-tiefes-wasser transition-colors hover:text-vrelo-petrol [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-papier focus-visible:ring-vrelo-petrol">
        <span>{question}</span>
        <span
          aria-hidden="true"
          className="shrink-0 text-xl leading-none text-vrelo-petrol transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-tinte">{answer}</p>
    </details>
  );
}
