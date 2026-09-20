// Collection entry point. Registering this single Lovelace resource makes every
// card in the collection available. Each card module registers itself on import.
import { VERSION } from "./shared.js";

import "./wind-dir-card.js";
import "./sensor-ex-card.js";
import "./power-distribution-ex-card.js";

console.info(
  `%c SVG CARDS %c ${VERSION} `,
  "color: white; background: #1f6feb; font-weight: 700;",
  "color: #1f6feb; background: white; font-weight: 700;"
);
