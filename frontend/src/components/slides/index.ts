import type { Component } from "vue";

import SlideOne from "./SlideOne.vue";
import SlideTwo from "./SlideTwo.vue";
import SlideThree from "./SlideThree.vue";

export type SlideDefinition = {
  id: string;
  kicker: string;
  component: Component;
};

export const slideDefinitions: SlideDefinition[] = [
  { id: "slide-1", kicker: "Slide 1", component: SlideOne },
  { id: "slide-2", kicker: "Slide 2", component: SlideTwo },
  { id: "slide-3", kicker: "Slide 3", component: SlideThree },
];
