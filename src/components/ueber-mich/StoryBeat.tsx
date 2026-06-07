import { LazyVideo } from "@/components/LazyVideo";
import { withBrandWords } from "@/components/BrandWord";
import type { StoryBeat as StoryBeatType } from "@/lib/ueber-mich";

// A story-beat body is plain text; blank lines separate paragraphs.
function renderBody(body: string) {
  return body.split(/\n{2,}/).map((para, i) => (
    <p key={i} className={`${i === 0 ? "mt-4" : "mt-3"} max-w-xl text-pretty text-tinte`}>
      {withBrandWords(para)}
    </p>
  ));
}

export function StoryBeat({
  beat,
  index,
}: {
  beat: StoryBeatType;
  index: number;
}) {
  const number = String(index + 1).padStart(2, "0");
  const headingId = `beat-${beat.slug}`;
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
          className="w-full rounded-2xl object-cover shadow-deepwater"
        />
      </div>
      <div className={videoFirst ? "md:order-2" : "md:order-1"}>
        <div className="flex items-baseline gap-3">
          <span aria-hidden="true" className="font-serif text-xl italic text-vrelo-petrol">
            {number}
          </span>
          <h2
            id={headingId}
            className="text-balance text-2xl font-semibold tracking-tight text-tiefes-wasser md:text-3xl"
          >
            {beat.heading}
          </h2>
        </div>
        {renderBody(beat.body)}
      </div>
    </div>
  );
}
