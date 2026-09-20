import {
  LitElement,
  html,
  css,
  svg,
  defineEditor,
  getNumber,
  getUnit,
  registerCard,
  uniqueId,
} from "./shared.js";

const DEFAULT_WIDTH = 320;
const DEFAULT_HEIGHT = 260;

const NODE_DEFAULTS = {
  solar: { icon: "mdi:solar-power", color: "#ff9800", name: "Solar" },
  grid: { icon: "mdi:transmission-tower", color: "#488fc2", name: "Grid" },
  battery: { icon: "mdi:battery", color: "#4caf50", name: "Battery" },
  home: { icon: "mdi:home", color: "#9e9e9e", name: "Home" },
};

// Which node each role hangs off, and whether it is one direction of a flow
// (so a name on it labels the line) or the node itself (so a name renames it).
const ROLES = {
  solar: { node: "solar", directional: false },
  home: { node: "home", directional: false },
  grid: { node: "grid", directional: false, signed: ["grid_import", "grid_export"] },
  battery: {
    node: "battery",
    directional: false,
    signed: ["battery_discharge", "battery_charge"],
  },
  grid_import: { node: "grid", directional: true },
  grid_export: { node: "grid", directional: true },
  battery_charge: { node: "battery", directional: true },
  battery_discharge: { node: "battery", directional: true },
};

// Order matters: discharge must beat charge, and export must beat both import
// and the bare grid pattern, since each contains the other's keywords.
const ROLE_PATTERNS = [
  ["battery_discharge", /discharg|bat\w*[_ -]?out/],
  ["battery_charge", /charg|bat\w*[_ -]?in\b/],
  ["grid_export", /export|sell|feed[_ -]?in|to[_ -]?grid|delivery/],
  ["grid_import", /import|buy|from[_ -]?grid|purchas/],
  // "pv" needs explicit separators: \b won't fire in sensor.pv_power, since
  // underscore counts as a word character.
  ["solar", /solar|(?:^|[^a-z])pv(?:[^a-z]|$)|photovolt|produc|yield/],
  ["battery", /batt/],
  ["grid", /grid|mains|utility/],
  ["home", /home|house|load|consum|usage/],
];

function inferRole(entityId, name) {
  const haystack = `${entityId || ""} ${name || ""}`.toLowerCase();
  for (const [role, pattern] of ROLE_PATTERNS) {
    if (pattern.test(haystack)) return role;
  }
  return null;
}

const EDITOR_SCHEMA = [
  { name: "solar_entity", selector: { entity: {} } },
  { name: "grid_entity", selector: { entity: {} } },
  { name: "grid_import_entity", selector: { entity: {} } },
  { name: "grid_export_entity", selector: { entity: {} } },
  { name: "grid_invert", selector: { boolean: {} } },
  { name: "battery_entity", selector: { entity: {} } },
  { name: "battery_charge_entity", selector: { entity: {} } },
  { name: "battery_discharge_entity", selector: { entity: {} } },
  { name: "battery_invert", selector: { boolean: {} } },
  { name: "home_entity", selector: { entity: {} } },

  { name: "solar_name", selector: { text: {} } },
  { name: "grid_name", selector: { text: {} } },
  { name: "battery_name", selector: { text: {} } },
  { name: "home_name", selector: { text: {} } },

  { name: "solar_icon", selector: { icon: {} } },
  { name: "grid_icon", selector: { icon: {} } },
  { name: "battery_icon", selector: { icon: {} } },
  { name: "home_icon", selector: { icon: {} } },

  { name: "solar_color", selector: { text: {} } },
  { name: "grid_color", selector: { text: {} } },
  { name: "battery_color", selector: { text: {} } },
  { name: "home_color", selector: { text: {} } },

  { name: "show_labels", selector: { boolean: {} } },
  { name: "show_values", selector: { boolean: {} } },
  { name: "show_icons", selector: { boolean: {} } },
  { name: "unit", selector: { text: {} } },
  {
    name: "value_precision",
    selector: { number: { min: 0, max: 3, step: 1, mode: "box" } },
  },
  {
    name: "label_font_size",
    selector: { number: { min: 6, max: 40, step: 1, mode: "box" } },
  },
  {
    name: "value_font_size",
    selector: { number: { min: 6, max: 48, step: 1, mode: "box" } },
  },
  {
    name: "icon_size",
    selector: { number: { min: 8, max: 64, step: 1, mode: "box" } },
  },
  {
    name: "node_size",
    selector: { number: { min: 10, max: 80, step: 1, mode: "box" } },
  },
  {
    name: "node_stroke_width",
    selector: { number: { min: 0, max: 10, step: 0.5, mode: "box" } },
  },
  { name: "node_fill_color", selector: { text: {} } },

  { name: "line_color", selector: { text: {} } },
  {
    name: "line_width",
    selector: { number: { min: 0.5, max: 12, step: 0.5, mode: "box" } },
  },
  {
    name: "inactive_opacity",
    selector: { number: { min: 0, max: 1, step: 0.05, mode: "box" } },
  },

  { name: "show_flow", selector: { boolean: {} } },
  { name: "show_flow_labels", selector: { boolean: {} } },
  {
    name: "flow_label_font_size",
    selector: { number: { min: 6, max: 32, step: 1, mode: "box" } },
  },
  {
    name: "flow_speed",
    selector: { number: { min: 0.1, max: 5, step: 0.1, mode: "box" } },
  },
  {
    name: "dot_size",
    selector: { number: { min: 1, max: 12, step: 0.5, mode: "box" } },
  },
  {
    name: "dot_count",
    selector: { number: { min: 1, max: 6, step: 1, mode: "box" } },
  },
  {
    name: "min_flow",
    selector: { number: { min: 0, max: 10000, step: 0.1, mode: "box" } },
  },

  {
    name: "card_height",
    selector: { number: { min: 80, max: 800, step: 10, mode: "box" } },
  },
  {
    name: "padding",
    selector: { number: { min: 0, max: 64, step: 1, mode: "box" } },
  },
];

const EDITOR_LABELS = {
  solar_entity: "Solar production entity",
  grid_entity: "Grid entity (signed: + import, - export)",
  grid_import_entity: "Grid import entity (instead of a signed entity)",
  grid_export_entity: "Grid export entity (instead of a signed entity)",
  grid_invert: "Invert grid sign (+ means export)",
  battery_entity: "Battery entity (signed: + discharge, - charge)",
  battery_charge_entity: "Battery charge entity (instead of a signed entity)",
  battery_discharge_entity: "Battery discharge entity (instead of a signed entity)",
  battery_invert: "Invert battery sign (+ means charge)",
  home_entity: "Home consumption entity (computed from the others if unset)",
  solar_name: "Solar label",
  grid_name: "Grid label",
  battery_name: "Battery label",
  home_name: "Home label",
  solar_icon: "Solar icon",
  grid_icon: "Grid icon",
  battery_icon: "Battery icon",
  home_icon: "Home icon",
  solar_color: "Solar color",
  grid_color: "Grid color",
  battery_color: "Battery color",
  home_color: "Home color",
  show_labels: "Show node labels",
  show_values: "Show node values",
  show_icons: "Show node icons",
  unit: "Unit override (default: the entity's own unit)",
  value_precision: "Value decimal places",
  label_font_size: "Label font size (px)",
  value_font_size: "Value font size (px)",
  icon_size: "Icon size (px)",
  node_size: "Node circle radius (px)",
  node_stroke_width: "Node circle outline width (px)",
  node_fill_color: "Node circle fill (default: transparent)",
  line_color: "Flow line color (default: the source node's color)",
  line_width: "Flow line width (px)",
  inactive_opacity: "Opacity of lines carrying no flow (0-1)",
  show_flow: "Animate flowing dots",
  show_flow_labels: "Show per-flow labels (names from the entities list)",
  flow_label_font_size: "Flow label font size (px)",
  flow_speed: "Flow animation speed multiplier",
  dot_size: "Flow dot radius (px)",
  dot_count: "Flow dots per line",
  min_flow: "Ignore flows smaller than this",
  card_height: "Card height (px, unset = fill the tile)",
  padding: "Padding around contents (px)",
};

defineEditor("distribution-ex-card-editor", EDITOR_SCHEMA, EDITOR_LABELS);

class DistributionExCard extends LitElement {
  static get properties() {
    return {
      hass: { attribute: false },
      config: { attribute: false },
      _width: { attribute: false },
      _height: { attribute: false },
    };
  }

  constructor() {
    super();
    this._width = DEFAULT_WIDTH;
    this._height = DEFAULT_HEIGHT;
    this._uid = uniqueId("dxc");
  }

  static getStubConfig() {
    return {
      type: "custom:distribution-ex-card",
      solar_entity: "sensor.solar_power",
      grid_entity: "sensor.grid_power",
    };
  }

  static getConfigElement() {
    return document.createElement("distribution-ex-card-editor");
  }

  setConfig(config) {
    const hasList = Array.isArray(config.entities) && config.entities.length > 0;
    const hasFixed = [
      "solar_entity",
      "grid_entity",
      "grid_import_entity",
      "grid_export_entity",
      "battery_entity",
      "battery_charge_entity",
      "battery_discharge_entity",
      "home_entity",
    ].some((key) => config[key]);
    if (!hasList && !hasFixed) {
      throw new Error("define entities: or at least one *_entity option");
    }
    this.config = {
      show_labels: true,
      show_values: true,
      show_icons: true,
      value_precision: 1,
      label_font_size: 12,
      value_font_size: 14,
      icon_size: 24,
      node_size: 26,
      node_stroke_width: 2,
      line_width: 2,
      inactive_opacity: 0.25,
      show_flow: true,
      show_flow_labels: true,
      flow_label_font_size: 11,
      flow_speed: 1,
      dot_size: 3.5,
      dot_count: 2,
      min_flow: 0,
      padding: 8,
      ...config,
    };
  }

  getCardSize() {
    return 5;
  }

  firstUpdated() {
    const root = this.renderRoot.querySelector(".root");
    if (root) {
      this._resizeObserver = new ResizeObserver(() => this._measure());
      this._resizeObserver.observe(root);
      this._measure();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = undefined;
    }
  }

  updated() {
    if (!this.config) return;
    const height = Number(this.config.card_height);
    this.style.height = Number.isFinite(height) && height > 0 ? `${height}px` : "";
  }

  _measure() {
    const root = this.renderRoot.querySelector(".root");
    if (!root) return;
    const rect = root.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      this._width = rect.width;
      this._height = rect.height;
    }
  }

  // Folds both config styles - the `entities:` list and the fixed *_entity
  // options - into one set of role totals, so the renderer never has to care
  // which was used. Entities sharing a role are summed.
  _collectRoles() {
    const roles = {};
    Object.keys(ROLES).forEach((role) => {
      if (!ROLES[role].signed) roles[role] = { value: 0, present: false, meta: {} };
    });
    const nodeMeta = { solar: {}, grid: {}, battery: {}, home: {} };

    const add = (role, value, meta) => {
      const slot = roles[role];
      if (!slot) return;
      slot.present = true;
      slot.value += Math.max(0, value);
      if (meta && ROLES[role] && ROLES[role].directional) {
        // A name on one direction labels that flow line.
        if (meta.name && !slot.meta.name) slot.meta.name = meta.name;
        if (meta.color && !slot.meta.color) slot.meta.color = meta.color;
      }
    };

    const addNodeMeta = (node, meta) => {
      if (!meta || !nodeMeta[node]) return;
      ["name", "color", "icon"].forEach((key) => {
        if (meta[key] && !nodeMeta[node][key]) nodeMeta[node][key] = meta[key];
      });
    };

    // A signed reading splits into its two directions; the name belongs to the
    // node, since one entity covers both ways.
    const addSigned = (role, value, meta) => {
      const [positive, negative] = ROLES[role].signed;
      add(positive, Math.max(0, value));
      add(negative, Math.max(0, -value));
      addNodeMeta(ROLES[role].node, meta);
    };

    const ingest = (entityId, role, meta) => {
      if (!entityId || !role || !ROLES[role]) return;
      let value = getNumber(this.hass, entityId);
      if (value === null) value = 0;
      if (meta && meta.invert) value = -value;
      if (ROLES[role].signed) {
        addSigned(role, value, meta);
      } else {
        add(role, value, meta);
        if (!ROLES[role].directional) addNodeMeta(ROLES[role].node, meta);
      }
    };

    const list = Array.isArray(this.config.entities) ? this.config.entities : [];
    list.forEach((raw) => {
      const item = typeof raw === "string" ? { entity: raw } : raw || {};
      ingest(item.entity, item.role || inferRole(item.entity, item.name), item);
    });

    const config = this.config;
    ingest(config.solar_entity, "solar");
    ingest(config.grid_import_entity, "grid_import");
    ingest(config.grid_export_entity, "grid_export");
    ingest(config.grid_entity, "grid", { invert: config.grid_invert });
    ingest(config.battery_charge_entity, "battery_charge");
    ingest(config.battery_discharge_entity, "battery_discharge");
    ingest(config.battery_entity, "battery", { invert: config.battery_invert });
    ingest(config.home_entity, "home");

    return { roles, nodeMeta };
  }

  // Values all share one unit, taken from the first entity that declares one.
  _resolveUnit() {
    const list = Array.isArray(this.config.entities) ? this.config.entities : [];
    const candidates = [
      ...list.map((raw) => (typeof raw === "string" ? raw : raw && raw.entity)),
      this.config.solar_entity,
      this.config.grid_entity,
      this.config.grid_import_entity,
      this.config.grid_export_entity,
      this.config.battery_entity,
      this.config.battery_charge_entity,
      this.config.battery_discharge_entity,
      this.config.home_entity,
    ];
    for (const entityId of candidates) {
      const unit = entityId ? getUnit(this.hass, entityId, undefined, "") : "";
      if (unit) return unit;
    }
    return "";
  }

  _flows() {
    const { roles, nodeMeta } = this._collectRoles();

    // Export and battery charging are served from solar first, so whatever is
    // left of production is what actually reaches the house.
    const solar = roles.solar.value;
    const solarToGrid = roles.grid_export.value;
    const solarToBattery = roles.battery_charge.value;
    const solarToHome = Math.max(0, solar - solarToGrid - solarToBattery);
    const gridToHome = roles.grid_import.value;
    const batteryToHome = roles.battery_discharge.value;

    const home = roles.home.present
      ? roles.home.value
      : solarToHome + gridToHome + batteryToHome;

    const line = (id, from, to, value, role) => ({
      id,
      from,
      to,
      value,
      label: roles[role].meta.name,
      color: roles[role].meta.color,
    });

    return {
      nodeMeta,
      present: {
        solar: roles.solar.present,
        grid: roles.grid_import.present || roles.grid_export.present,
        battery:
          roles.battery_charge.present || roles.battery_discharge.present,
        home: true,
      },
      totals: {
        solar,
        grid: gridToHome - solarToGrid,
        battery: batteryToHome - solarToBattery,
        home,
      },
      lines: [
        line("solar-home", "solar", "home", solarToHome, "solar"),
        line("solar-grid", "solar", "grid", solarToGrid, "grid_export"),
        line("solar-battery", "solar", "battery", solarToBattery, "battery_charge"),
        line("grid-home", "grid", "home", gridToHome, "grid_import"),
        line("battery-home", "battery", "home", batteryToHome, "battery_discharge"),
      ],
    };
  }

  _nodeProp(node, key, nodeMeta) {
    return (
      this.config[`${node}_${key}`] ||
      (nodeMeta && nodeMeta[node] && nodeMeta[node][key]) ||
      NODE_DEFAULTS[node][key]
    );
  }

  _nodeColor(node, nodeMeta) {
    return this._nodeProp(node, "color", nodeMeta);
  }

  _geometry(present) {
    const config = this.config;
    const padding = Number(config.padding) || 0;
    const r = Number(config.node_size) || 26;
    const valueFontSize = Number(config.value_font_size) || 14;
    const labelFontSize = Number(config.label_font_size) || 12;
    const textBlock =
      (config.show_values === false ? 0 : valueFontSize * 1.2) +
      (config.show_labels === false ? 0 : labelFontSize * 1.2);

    const width = this._width;
    const height = this._height;
    const cx = width / 2;
    const solarY = padding + r;
    const homeY = height - padding - r - textBlock;
    const midY = present.solar ? (solarY + homeY) / 2 : solarY + r;

    return {
      r,
      padding,
      textBlock,
      valueFontSize,
      labelFontSize,
      nodes: {
        solar: { x: cx, y: solarY },
        grid: { x: padding + r, y: midY },
        battery: { x: width - padding - r, y: midY },
        home: { x: cx, y: homeY },
      },
    };
  }

  _linePath(line, geo) {
    const { nodes, r } = geo;
    const from = nodes[line.from];
    const to = nodes[line.to];
    switch (line.id) {
      case "solar-home":
        return `M ${from.x} ${from.y + r} L ${to.x} ${to.y - r}`;
      case "solar-grid":
        return `M ${from.x - r} ${from.y} Q ${to.x} ${from.y} ${to.x} ${to.y - r}`;
      case "solar-battery":
        return `M ${from.x + r} ${from.y} Q ${to.x} ${from.y} ${to.x} ${to.y - r}`;
      case "grid-home":
        return `M ${from.x} ${from.y + r} Q ${from.x} ${to.y} ${to.x - r} ${to.y}`;
      case "battery-home":
        return `M ${from.x} ${from.y + r} Q ${from.x} ${to.y} ${to.x + r} ${to.y}`;
      default:
        return "";
    }
  }

  // Dots move faster the more power a line carries, relative to the busiest
  // line. Durations are rounded so a re-render on an unrelated state change
  // doesn't retime (and so restart) a running animation.
  _dotDuration(value, maxValue) {
    const speed = Number(this.config.flow_speed) || 1;
    const share = maxValue > 0 ? Math.min(1, value / maxValue) : 0;
    const seconds = (6 - 4 * share) / speed;
    return Math.max(0.4, Math.round(seconds * 4) / 4);
  }

  // Midpoint of the same curve _linePath builds, for placing the flow label.
  // Evaluating the Bezier is cheaper and more reliable than measuring the DOM
  // path, which isn't laid out yet at render time.
  _lineMidpoint(line, geo) {
    const { nodes, r } = geo;
    const from = nodes[line.from];
    const to = nodes[line.to];
    const quad = (p0, p1, p2) => 0.25 * p0 + 0.5 * p1 + 0.25 * p2;
    switch (line.id) {
      case "solar-home":
        return { x: from.x, y: (from.y + r + (to.y - r)) / 2 };
      case "solar-grid":
        return {
          x: quad(from.x - r, to.x, to.x),
          y: quad(from.y, from.y, to.y - r),
        };
      case "solar-battery":
        return {
          x: quad(from.x + r, to.x, to.x),
          y: quad(from.y, from.y, to.y - r),
        };
      case "grid-home":
        return {
          x: quad(from.x, from.x, to.x - r),
          y: quad(from.y + r, to.y, to.y),
        };
      case "battery-home":
        return {
          x: quad(from.x, from.x, to.x + r),
          y: quad(from.y + r, to.y, to.y),
        };
      default:
        return { x: 0, y: 0 };
    }
  }

  _renderLine(line, geo, maxValue, nodeMeta) {
    const config = this.config;
    const path = this._linePath(line, geo);
    if (!path) return svg``;

    const pathId = `${this._uid}-${line.id}`;
    const minFlow = Math.abs(Number(config.min_flow) || 0);
    const active = line.value > minFlow;
    const color = line.color || config.line_color || this._nodeColor(line.from, nodeMeta);
    const lineWidth = Number(config.line_width) || 2;
    const inactiveOpacity = Number.isFinite(Number(config.inactive_opacity))
      ? Number(config.inactive_opacity)
      : 0.25;

    let dots = svg``;
    if (active && config.show_flow !== false) {
      const duration = this._dotDuration(line.value, maxValue);
      const count = Math.max(1, Math.round(Number(config.dot_count) || 2));
      const dotSize = Number(config.dot_size) || 3.5;
      dots = svg`${Array.from({ length: count }, (_, i) => {
        // Negative begin staggers the dots along a line already in motion.
        const begin = -((duration / count) * i);
        return svg`
          <circle r=${dotSize} fill=${color}>
            <animateMotion
              dur="${duration}s"
              begin="${begin}s"
              repeatCount="indefinite"
              calcMode="linear"
              keyPoints="0;1"
              keyTimes="0;1"
            >
              <mpath href="#${pathId}" />
            </animateMotion>
          </circle>
        `;
      })}`;
    }

    let label = svg``;
    if (line.label && config.show_flow_labels !== false) {
      const mid = this._lineMidpoint(line, geo);
      const fontSize = Number(config.flow_label_font_size) || 11;
      label = svg`
        <text
          class="flow-label"
          x=${mid.x}
          y=${mid.y}
          text-anchor="middle"
          style="font-size: ${fontSize}px; fill: ${color}"
          opacity=${active ? 1 : inactiveOpacity}
        >${line.label}</text>
      `;
    }

    return svg`
      <path
        id=${pathId}
        d=${path}
        fill="none"
        stroke=${color}
        stroke-width=${lineWidth}
        stroke-linecap="round"
        opacity=${active ? 1 : inactiveOpacity}
      />
      ${dots}
      ${label}
    `;
  }

  _renderNode(node, geo, value, unit, nodeMeta) {
    const config = this.config;
    const pos = geo.nodes[node];
    const color = this._nodeColor(node, nodeMeta);
    const precision = Math.max(0, Number(config.value_precision) || 0);
    const strokeWidth = Number.isFinite(Number(config.node_stroke_width))
      ? Number(config.node_stroke_width)
      : 2;

    const valueY = pos.y + geo.r + geo.valueFontSize;
    const labelY =
      valueY + (config.show_values === false ? 0 : geo.labelFontSize * 1.15);

    return svg`
      <circle
        cx=${pos.x}
        cy=${pos.y}
        r=${geo.r}
        fill=${config.node_fill_color || "none"}
        stroke=${color}
        stroke-width=${strokeWidth}
      />
      ${config.show_values === false
        ? svg``
        : svg`
          <text
            class="value"
            x=${pos.x}
            y=${valueY}
            text-anchor="middle"
            style="font-size: ${geo.valueFontSize}px; fill: ${color}"
          >${value === null ? "--" : value.toFixed(precision)}${unit ? ` ${unit}` : ""}</text>
        `}
      ${config.show_labels === false
        ? svg``
        : svg`
          <text
            class="label"
            x=${pos.x}
            y=${labelY}
            text-anchor="middle"
            style="font-size: ${geo.labelFontSize}px"
          >${this._nodeProp(node, "name", nodeMeta)}</text>
        `}
    `;
  }

  render() {
    if (!this.config || !this.hass) {
      return html``;
    }

    const flows = this._flows();
    const geo = this._geometry(flows.present);
    const nodes = Object.keys(NODE_DEFAULTS).filter((n) => flows.present[n]);
    const lines = flows.lines.filter(
      (l) => flows.present[l.from] && flows.present[l.to]
    );
    const maxValue = lines.reduce((max, l) => Math.max(max, l.value), 0);

    const unit = this.config.unit || this._resolveUnit();

    const iconSize = Number(this.config.icon_size) || 24;

    return html`
      <ha-card>
        <div
          class="root"
          style=${Number(this.config.card_height) > 0
            ? ""
            : `min-height: ${DEFAULT_HEIGHT}px`}
        >
          <svg viewBox="0 0 ${this._width} ${this._height}">
            ${lines.map((line) =>
              this._renderLine(line, geo, maxValue, flows.nodeMeta)
            )}
            ${nodes.map((node) =>
              this._renderNode(node, geo, flows.totals[node], unit, flows.nodeMeta)
            )}
          </svg>
          ${this.config.show_icons === false
            ? ""
            : nodes.map(
                (node) => html`
                  <div
                    class="icon"
                    style="left: ${geo.nodes[node].x}px; top: ${geo.nodes[node]
                      .y}px; --mdc-icon-size: ${iconSize}px; color: ${this._nodeColor(
                      node,
                      flows.nodeMeta
                    )}"
                  >
                    <ha-icon
                      .icon=${this._nodeProp(node, "icon", flows.nodeMeta)}
                    ></ha-icon>
                  </div>
                `
              )}
        </div>
      </ha-card>
    `;
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }
      ha-card {
        height: 100%;
        box-sizing: border-box;
        padding: 0;
        overflow: hidden;
      }
      .root {
        position: relative;
        width: 100%;
        height: 100%;
      }
      svg {
        display: block;
        width: 100%;
        height: 100%;
      }
      .icon {
        position: absolute;
        transform: translate(-50%, -50%);
        line-height: 0;
        pointer-events: none;
      }
      .value {
        font-weight: 700;
      }
      .label {
        fill: var(--secondary-text-color, #9e9e9e);
      }
      .flow-label {
        font-weight: 600;
      }
    `;
  }
}

if (!customElements.get("distribution-ex-card")) {
  customElements.define("distribution-ex-card", DistributionExCard);
  registerCard({
    type: "distribution-ex-card",
    name: "Distribution Ex Card",
    description:
      "SVG energy distribution card: solar, grid, battery and home joined by animated power flow lines.",
    preview: true,
  });
}
