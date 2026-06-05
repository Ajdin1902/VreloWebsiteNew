// src/components/JsonLd.tsx
export function JsonLd({ data }: { data: object }) {
  // Escape "<" so a literal "</script>" in any field cannot break out of the
  // script tag. "<" parses back to "<", so consumers see the same data.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
  );
}
