import { LazyVideo } from "@/components/LazyVideo";
import { withBrandWords } from "@/components/BrandWord";
import type { StoryBeat as StoryBeatType } from "@/lib/ueber-mich";

// A story-beat body is plain text; blank lines separate paragraphs.
// On a petrol-dark beat (onDark) the ink switches to the on-petrol palette.
function renderBody(body: string, onDark: boolean) {
  const bodyColor = onDark ? "text-gletscher" : "text-tinte";
  return body.split(/\n{2,}/).map((para, i) => (
    <p key={i} className={`${i === 0 ? "mt-4" : "mt-3"} max-w-xl text-pretty ${bodyColor}`}>
      {withBrandWords(para)}
    </p>
  ));
}

export function StoryBeat({ beat, onDark = false }: { beat: StoryBeatType; onDark?: boolean }) {
  const headingId = `beat-${beat.slug}`;
  const hasVideo = beat.video !== false;
  const headingColor = onDark ? "text-papier" : "text-tiefes-wasser";

  const text = (
    <>
      <h2
        id={headingId}
        className={`text-balance text-2xl font-semibold tracking-tight ${headingColor} md:text-3xl`}
      >
        {beat.heading}
      </h2>
      {renderBody(beat.body, onDark)}
    </>
  );

  // A beat without a video renders as a single, readable text column.
  if (!hasVideo) {
    return <div className="max-w-2xl">{text}</div>;
  }

  // DOM order is always video-then-text (mobile-consistent); `side` flips
  // the column order on desktop only.
  const videoFirst = beat.side === "left";

  return (
    <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
      <div className={videoFirst ? "md:order-1" : "md:order-2"}>
        <LazyVideo
          mp4={`/video/${beat.slug}.mp4`}
          webm={`/video/${beat.slug}.webm`}
          poster={`/video/${beat.slug}-poster.jpg`}
          aspect="aspect-video"
          className={`w-full rounded-2xl object-cover shadow-deepwater${onDark ? " ring-1 ring-gletscher/15" : ""}`}
        />
      </div>
      <div className={videoFirst ? "md:order-2" : "md:order-1"}>{text}</div>
    </div>
  );
}
