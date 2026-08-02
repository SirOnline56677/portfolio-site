"use client";

import { createContext, useContext } from "react";

export type ColumnConfig = {
  /** Travel direction. The two columns take opposite signs. */
  dir: 1 | -1;
  /** How many identical copies of the card set the track renders. */
  copies: number;
  /** Static phase offset in px, applied inside the modulo so it can't expose a gap. */
  offset?: number;
};

export type CarouselApi = {
  /** Register a column track with the shared engine. Returns an unregister fn. */
  register: (el: HTMLElement, cfg: ColumnConfig) => () => void;
};

export const CarouselContext = createContext<CarouselApi | null>(null);

export const useCarousel = () => useContext(CarouselContext);
