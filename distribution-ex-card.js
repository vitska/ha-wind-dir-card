// Generated from src/distribution-ex-card.js by build.sh - do not edit directly.

// src/shared.js
import {
  LitElement,
  html
} from "https://unpkg.com/lit-element@3.3.3/lit-element.js?module";
import {
  LitElement as LitElement2,
  html as html2,
  css,
  svg
} from "https://unpkg.com/lit-element@3.3.3/lit-element.js?module";
function fireEvent(node, type, detail) {
  node.dispatchEvent(
    new CustomEvent(type, {
      detail,
      bubbles: true,
      composed: true
    })
  );
}
function uniqueId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2)}`;
}
function registerCard(entry) {
  window.customCards = window.customCards || [];
  window.customCards.push(entry);
}
function getState(hass, entityId) {
  if (!entityId || !hass) return void 0;
  return hass.states[entityId];
}
function getNumber(hass, entityId) {
  const state = getState(hass, entityId);
  if (!state) return null;
  const value = parseFloat(state.state);
  return Number.isFinite(value) ? value : null;
}
function getUnit(hass, entityId, override, fallback) {
  const state = getState(hass, entityId);
  return override || state && state.attributes && state.attributes.unit_of_measurement || fallback || "";
}
var BaseCardEditor = class extends LitElement {
  static get properties() {
    return {
      hass: { attribute: false },
      _config: { attribute: false }
    };
  }
  static get schema() {
    return [];
  }
  static get labels() {
    return {};
  }
  setConfig(config) {
    this._config = { ...config };
  }
  _computeLabel = (schema) => this.constructor.labels[schema.name] || schema.name;
  _valueChanged(ev) {
    fireEvent(this, "config-changed", { config: ev.detail.value });
  }
  render() {
    if (!this.hass || !this._config) {
      return html``;
    }
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${this.constructor.schema}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }
};
function defineEditor(tag, schema, labels) {
  if (customElements.get(tag)) return;
  customElements.define(
    tag,
    class extends BaseCardEditor {
      static get schema() {
        return schema;
      }
      static get labels() {
        return labels;
      }
    }
  );
}

// src/distribution-ex-card.js
var DEFAULT_WIDTH = 320;
var DEFAULT_HEIGHT = 260;
var NODE_DEFAULTS = {
  solar: { icon: "mdi:solar-power", color: "#ff9800", name: "Solar" },
  grid: { icon: "mdi:transmission-tower", color: "#488fc2", name: "Grid" },
  battery: { icon: "mdi:battery", color: "#4caf50", name: "Battery" },
  home: { icon: "mdi:home", color: "#9e9e9e", name: "Home" }
};
var EDITOR_SCHEMA = [
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
    selector: { number: { min: 0, max: 3, step: 1, mode: "box" } }
  },
  {
    name: "label_font_size",
    selector: { number: { min: 6, max: 40, step: 1, mode: "box" } }
  },
  {
    name: "value_font_size",
    selector: { number: { min: 6, max: 48, step: 1, mode: "box" } }
  },
  {
    name: "icon_size",
    selector: { number: { min: 8, max: 64, step: 1, mode: "box" } }
  },
  {
    name: "node_size",
    selector: { number: { min: 10, max: 80, step: 1, mode: "box" } }
  },
  {
    name: "node_stroke_width",
    selector: { number: { min: 0, max: 10, step: 0.5, mode: "box" } }
  },
  { name: "node_fill_color", selector: { text: {} } },
  { name: "line_color", selector: { text: {} } },
  {
    name: "line_width",
    selector: { number: { min: 0.5, max: 12, step: 0.5, mode: "box" } }
  },
  {
    name: "inactive_opacity",
    selector: { number: { min: 0, max: 1, step: 0.05, mode: "box" } }
  },
  { name: "show_flow", selector: { boolean: {} } },
  {
    name: "flow_speed",
    selector: { number: { min: 0.1, max: 5, step: 0.1, mode: "box" } }
  },
  {
    name: "dot_size",
    selector: { number: { min: 1, max: 12, step: 0.5, mode: "box" } }
  },
  {
    name: "dot_count",
    selector: { number: { min: 1, max: 6, step: 1, mode: "box" } }
  },
  {
    name: "min_flow",
    selector: { number: { min: 0, max: 1e4, step: 0.1, mode: "box" } }
  },
  {
    name: "card_height",
    selector: { number: { min: 80, max: 800, step: 10, mode: "box" } }
  },
  {
    name: "padding",
    selector: { number: { min: 0, max: 64, step: 1, mode: "box" } }
  }
];
var EDITOR_LABELS = {
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
  flow_speed: "Flow animation speed multiplier",
  dot_size: "Flow dot radius (px)",
  dot_count: "Flow dots per line",
  min_flow: "Ignore flows smaller than this",
  card_height: "Card height (px, unset = fill the tile)",
  padding: "Padding around contents (px)"
};
defineEditor("distribution-ex-card-editor", EDITOR_SCHEMA, EDITOR_LABELS);
var DistributionExCard = class extends LitElement2 {
  static get properties() {
    return {
      hass: { attribute: false },
      config: { attribute: false },
      _width: { attribute: false },
      _height: { attribute: false }
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
      grid_entity: "sensor.grid_power"
    };
  }
  static getConfigElement() {
    return document.createElement("distribution-ex-card-editor");
  }
  setConfig(config) {
    if (!config.solar_entity && !config.grid_entity && !config.grid_import_entity && !config.grid_export_entity && !config.battery_entity && !config.home_entity) {
      throw new Error("at least one entity is required");
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
      flow_speed: 1,
      dot_size: 3.5,
      dot_count: 2,
      min_flow: 0,
      padding: 8,
      ...config
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
      this._resizeObserver = void 0;
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
  // Grid and battery can be given either as one signed entity or as a separate
  // pair. Returns magnitudes so the renderer never deals with signs.
  _splitSigned(signedEntity, positiveEntity, negativeEntity, invert) {
    if (positiveEntity || negativeEntity) {
      return {
        positive: Math.max(0, getNumber(this.hass, positiveEntity) || 0),
        negative: Math.max(0, getNumber(this.hass, negativeEntity) || 0),
        present: Boolean(positiveEntity || negativeEntity)
      };
    }
    let value = getNumber(this.hass, signedEntity);
    if (value === null) return { positive: 0, negative: 0, present: false };
    if (invert) value = -value;
    return {
      positive: Math.max(0, value),
      negative: Math.max(0, -value),
      present: true
    };
  }
  _flows() {
    const config = this.config;
    const solar = Math.max(0, getNumber(this.hass, config.solar_entity) || 0);
    const grid = this._splitSigned(
      config.grid_entity,
      config.grid_import_entity,
      config.grid_export_entity,
      config.grid_invert
    );
    const battery = this._splitSigned(
      config.battery_entity,
      config.battery_discharge_entity,
      config.battery_charge_entity,
      config.battery_invert
    );
    const solarToGrid = grid.negative;
    const solarToBattery = battery.negative;
    const solarToHome = Math.max(0, solar - solarToGrid - solarToBattery);
    const gridToHome = grid.positive;
    const batteryToHome = battery.positive;
    const homeEntity = getNumber(this.hass, config.home_entity);
    const home = homeEntity !== null ? homeEntity : solarToHome + gridToHome + batteryToHome;
    return {
      present: {
        solar: Boolean(config.solar_entity),
        grid: grid.present,
        battery: battery.present,
        home: true
      },
      totals: { solar, grid: grid.positive - grid.negative, battery: battery.positive - battery.negative, home },
      lines: [
        { id: "solar-home", from: "solar", to: "home", value: solarToHome },
        { id: "solar-grid", from: "solar", to: "grid", value: solarToGrid },
        { id: "solar-battery", from: "solar", to: "battery", value: solarToBattery },
        { id: "grid-home", from: "grid", to: "home", value: gridToHome },
        { id: "battery-home", from: "battery", to: "home", value: batteryToHome }
      ]
    };
  }
  _nodeColor(node) {
    return this.config[`${node}_color`] || NODE_DEFAULTS[node].color;
  }
  _geometry(present) {
    const config = this.config;
    const padding = Number(config.padding) || 0;
    const r = Number(config.node_size) || 26;
    const valueFontSize = Number(config.value_font_size) || 14;
    const labelFontSize = Number(config.label_font_size) || 12;
    const textBlock = (config.show_values === false ? 0 : valueFontSize * 1.2) + (config.show_labels === false ? 0 : labelFontSize * 1.2);
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
        home: { x: cx, y: homeY }
      }
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
  _renderLine(line, geo, maxValue) {
    const config = this.config;
    const path = this._linePath(line, geo);
    if (!path) return svg``;
    const pathId = `${this._uid}-${line.id}`;
    const minFlow = Math.abs(Number(config.min_flow) || 0);
    const active = line.value > minFlow;
    const color = config.line_color || this._nodeColor(line.from);
    const lineWidth = Number(config.line_width) || 2;
    const inactiveOpacity = Number.isFinite(Number(config.inactive_opacity)) ? Number(config.inactive_opacity) : 0.25;
    let dots = svg``;
    if (active && config.show_flow !== false) {
      const duration = this._dotDuration(line.value, maxValue);
      const count = Math.max(1, Math.round(Number(config.dot_count) || 2));
      const dotSize = Number(config.dot_size) || 3.5;
      dots = svg`${Array.from({ length: count }, (_, i) => {
        const begin = -(duration / count * i);
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
    `;
  }
  _renderNode(node, geo, value, unit) {
    const config = this.config;
    const pos = geo.nodes[node];
    const color = this._nodeColor(node);
    const precision = Math.max(0, Number(config.value_precision) || 0);
    const strokeWidth = Number.isFinite(Number(config.node_stroke_width)) ? Number(config.node_stroke_width) : 2;
    const valueY = pos.y + geo.r + geo.valueFontSize;
    const labelY = valueY + (config.show_values === false ? 0 : geo.labelFontSize * 1.15);
    return svg`
      <circle
        cx=${pos.x}
        cy=${pos.y}
        r=${geo.r}
        fill=${config.node_fill_color || "none"}
        stroke=${color}
        stroke-width=${strokeWidth}
      />
      ${config.show_values === false ? svg`` : svg`
          <text
            class="value"
            x=${pos.x}
            y=${valueY}
            text-anchor="middle"
            style="font-size: ${geo.valueFontSize}px; fill: ${color}"
          >${value === null ? "--" : value.toFixed(precision)}${unit ? ` ${unit}` : ""}</text>
        `}
      ${config.show_labels === false ? svg`` : svg`
          <text
            class="label"
            x=${pos.x}
            y=${labelY}
            text-anchor="middle"
            style="font-size: ${geo.labelFontSize}px"
          >${config[`${node}_name`] || NODE_DEFAULTS[node].name}</text>
        `}
    `;
  }
  render() {
    if (!this.config || !this.hass) {
      return html2``;
    }
    const flows = this._flows();
    const geo = this._geometry(flows.present);
    const nodes = Object.keys(NODE_DEFAULTS).filter((n) => flows.present[n]);
    const lines = flows.lines.filter(
      (l) => flows.present[l.from] && flows.present[l.to]
    );
    const maxValue = lines.reduce((max, l) => Math.max(max, l.value), 0);
    const unit = this.config.unit || getUnit(
      this.hass,
      this.config.solar_entity || this.config.grid_entity || this.config.grid_import_entity || this.config.battery_entity || this.config.home_entity,
      void 0,
      ""
    );
    const iconSize = Number(this.config.icon_size) || 24;
    return html2`
      <ha-card>
        <div
          class="root"
          style=${Number(this.config.card_height) > 0 ? "" : `min-height: ${DEFAULT_HEIGHT}px`}
        >
          <svg viewBox="0 0 ${this._width} ${this._height}">
            ${lines.map((line) => this._renderLine(line, geo, maxValue))}
            ${nodes.map(
      (node) => this._renderNode(node, geo, flows.totals[node], unit)
    )}
          </svg>
          ${this.config.show_icons === false ? "" : nodes.map(
      (node) => html2`
                  <div
                    class="icon"
                    style="left: ${geo.nodes[node].x}px; top: ${geo.nodes[node].y}px; --mdc-icon-size: ${iconSize}px; color: ${this._nodeColor(
        node
      )}"
                  >
                    <ha-icon
                      .icon=${this.config[`${node}_icon`] || NODE_DEFAULTS[node].icon}
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
    `;
  }
};
if (!customElements.get("distribution-ex-card")) {
  customElements.define("distribution-ex-card", DistributionExCard);
  registerCard({
    type: "distribution-ex-card",
    name: "Distribution Ex Card",
    description: "SVG energy distribution card: solar, grid, battery and home joined by animated power flow lines.",
    preview: true
  });
}
