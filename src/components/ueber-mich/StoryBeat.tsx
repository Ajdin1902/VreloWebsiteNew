import { LazyVideo } from "@/components/LazyVideo";
import type { StoryBeat as StoryBeatType } from "@/lib/ueber-mich";

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
          className="w-full rounded-2xl object-cover"
        />
      </div>
      <div className={videoFirst ? "md:order-2" : "md:order-1"}>
        <p aria-hidden="true" className="font-serif text-lg italic text-vrelo-petrol">
          {number}
        </p>
        <p className="mt-2 text-sm font-medium uppercase tracking-wider text-stumm">
          {beat.eyebrow}
        </p>
        <h2
          id={headingId}
          className="mt-2 text-2xl font-semibold text-tiefes-wasser md:text-3xl"
        >
          {beat.heading}
        </h2>
        <p className="mt-4 max-w-xl text-tinte">{beat.body}</p>
      </div>
    </div>
  );
}
