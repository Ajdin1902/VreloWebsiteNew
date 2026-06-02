import { Hero } from "@/components/Hero";
import { Problem } from "@/components/home/Problem";
import { WasIchBaue } from "@/components/home/WasIchBaue";
import { GeschichteTeaser } from "@/components/home/GeschichteTeaser";
import { Steps } from "@/components/home/Steps";
import { Proof } from "@/components/home/Proof";
import { MerakClose } from "@/components/home/MerakClose";

export default function Home() {
  return (
    <>
      <Hero />
      <Problem />
      <WasIchBaue />
      <GeschichteTeaser />
      <Steps />
      <Proof />
      <MerakClose />
    </>
  );
}
