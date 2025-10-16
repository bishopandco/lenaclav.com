import type { Component } from "vue";

import WelcomeSlide from "./WelcomeSlide.vue";
import VisionSlide from "./VisionSlide.vue";
import BuildSlide from "./BuildSlide.vue";
import CollaborateSlide from "./CollaborateSlide.vue";
import LaunchSlide from "./LaunchSlide.vue";

export type SlideDefinition = {
  id: string;
  kicker: string;
  component: Component;
};

export const slideDefinitions: SlideDefinition[] = [
  { id: "welcome", kicker: "lenaclav.com", component: WelcomeSlide },
  { id: "vision", kicker: "Vision", component: VisionSlide },
  { id: "build", kicker: "Build", component: BuildSlide },
  { id: "collaborate", kicker: "Collaborate", component: CollaborateSlide },
  { id: "launch", kicker: "Launch", component: LaunchSlide },
];
