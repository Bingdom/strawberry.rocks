import {
  GlowEffect,
  Hero,
  Spacer,
  FeaturesSection,
  SponsorsSection,
} from "@strawberry-graphql/styleguide";

import { fetchSponsorsForHomepage } from "~/lib/api";
import { fetchDownloads } from "~/lib/api/pypi";

export default async function HomePage() {
  const sponsors = await fetchSponsorsForHomepage();
  const downloads = await fetchDownloads();

  return (
    <>
      <GlowEffect />
      <Spacer size={80} />

      <Hero />

      <Spacer size={128} />

      <FeaturesSection />

      <Spacer size={128} />

      <SponsorsSection
        sponsors={sponsors}
        downloads={downloads}
        logoOverrides={{
          xoflare: {
            darkMode: "/images/sponsor-overrides/exoflare-white.png",
            lightMode: "/images/sponsor-overrides/exoflare-black.png",
          },
          "moving-content": {
            darkMode: "/images/sponsor-overrides/moving-content.png",
            lightMode: "/images/sponsor-overrides/moving-content.png",
          },
          cinder: {
            darkMode: "/images/sponsor-overrides/cinder-white.png",
            lightMode: "/images/sponsor-overrides/cinder-black.png",
          },
        }}
      />

      <Spacer size={128} />
    </>
  );
}
