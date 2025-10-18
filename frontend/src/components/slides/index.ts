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
  { id: "events", kicker: "Events", component: SlideOne },
  { id: "contact", kicker: "Contact", component: SlideTwo },
  { id: "merch", kicker: "Merch", component: SlideThree },
];
