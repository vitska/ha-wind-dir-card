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
var DEFAULT_WIDTH = 400;
var DEFAULT_HEIGHT = 260;
var PRESETS = {
  solar: { icon: "mdi:solar-power", color: "#ff9800", name: "Solar", side: "left" },
  wind: { icon: "mdi:wind-turbine", color: "#26a69a", name: "Wind", side: "left" },
  hydro: { icon: "mdi:hydro-power", color: "#42a5f5", name: "Hydro", side: "left" },
  grid: { icon: "mdi:transmission-tower", color: "#488fc2", name: "Grid", side: "left" },
  battery: { icon: "mdi:battery", color: "#4caf50", name: "Battery", side: "left" },
  producer: { icon: "mdi:flash", color: "#ffca28", name: "Producer", side: "left" },
  home: { icon: "mdi:home", color: "#9e9e9e", name: "Home", side: "right" },
  car_charger: { icon: "mdi:car-electric", color: "#ab47bc", name: "Car", side: "right" },
  heating: { icon: "mdi:radiator", color: "#ef5350", name: "Heating", side: "right" },
  pool: { icon: "mdi:pool", color: "#29b6f6", name: "Pool", side: "right" },
  consumer: { icon: "mdi:power-plug", color: "#9e9e9e", name: "Consumer", side: "right" }
};
var EDITOR_SCHEMA = [
  { name: "title", selector: { text: {} } },
  { name: "unit", selector: { text: {} } },
  {
    name: "decimals",
    selector: { number: { min: 0, max: 3, step: 1, mode: "box" } }
  },
  { name: "show_names", selector: { boolean: {} } },
  { name: "show_values", selector: { boolean: {} } },
  { name: "show_icons", selector: { boolean: {} } },
  { name: "show_arrows", selector: { boolean: {} } },
  { name: "name_color", selector: { text: {} } },
  { name: "value_color", selector: { text: {} } },
  { name: "title_color", selector: { text: {} } },
  {
    name: "name_font_size",
    selector: { number: { min: 6, max: 40, step: 1, mode: "box" } }
  },
  {
    name: "value_font_size",
    selector: { number: { min: 6, max: 48, step: 1, mode: "box" } }
  },
  {
    name: "title_font_size",
    selector: { number: { min: 6, max: 48, step: 1, mode: "box" } }
  },
  {
    name: "icon_size",
    selector: { number: { min: 8, max: 64, step: 1, mode: "box" } }
  },
  {
    name: "item_width",
    selector: { number: { min: 40, max: 240, step: 5, mode: "box" } }
  },
  { name: "arrow_color", selector: { text: {} } },
  {
    name: "arrow_width",
    selector: { number: { min: 0.5, max: 12, step: 0.5, mode: "box" } }
  },
  {
    name: "inactive_opacity",
    selector: { number: { min: 0, max: 1, step: 0.05, mode: "box" } }
  },
  {
    name: "animation",
    selector: {
      select: {
        mode: "dropdown",
        options: [
          { value: "slide", label: "Slide (moving dots)" },
          { value: "none", label: "None (static arrows)" }
        ]
      }
    }
  },
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
  { name: "bar_color", selector: { text: {} } },
  { name: "bar_bg_color", selector: { text: {} } },
  {
    name: "bar_width",
    selector: { number: { min: 2, max: 60, step: 1, mode: "box" } }
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
  title: "Card title",
  unit: "Unit override (default: each entity's own unit)",
  decimals: "Value decimal places",
  show_names: "Show item names",
  show_values: "Show item values",
  show_icons: "Show item icons",
  show_arrows: "Show arrows",
  name_color: "Item name color",
  value_color: "Item value color (default: the item's color)",
  title_color: "Title color",
  name_font_size: "Name font size (px)",
  value_font_size: "Value font size (px)",
  title_font_size: "Title font size (px)",
  icon_size: "Icon size (px)",
  item_width: "Item column width (px)",
  arrow_color: "Arrow color (default: the item's color)",
  arrow_width: "Arrow line width (px)",
  inactive_opacity: "Opacity of items below their threshold (0-1)",
  animation: "Arrow animation",
  flow_speed: "Animation speed multiplier",
  dot_size: "Flow dot radius (px)",
  dot_count: "Flow dots per arrow",
  bar_color: "Center bar fill color",
  bar_bg_color: "Center bar background color",
  bar_width: "Center bar width (px)",
  card_height: "Card height (px, unset = fill the tile)",
  padding: "Padding around contents (px)"
};
defineEditor("distribution-ex-card-editor", EDITOR_SCHEMA, EDITOR_LABELS);
function clampPercent(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}
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
    this._uid = uniqueId("dex");
  }
  static getStubConfig() {
    return {
      type: "custom:distribution-ex-card",
      entities: [
        { entity: "sensor.solar_power", preset: "solar" },
        { entity: "sensor.grid_power", preset: "grid" },
        { entity: "sensor.home_power", preset: "home" }
      ]
    };
  }
  static getConfigElement() {
    return document.createElement("distribution-ex-card-editor");
  }
  setConfig(config) {
    if (!Array.isArray(config.entities) || config.entities.length === 0) {
      throw new Error("entities must be a non-empty list");
    }
    this.config = {
      decimals: 1,
      show_names: true,
      show_values: true,
      show_icons: true,
      show_arrows: true,
      name_font_size: 12,
      value_font_size: 16,
      title_font_size: 16,
      icon_size: 24,
      item_width: 90,
      arrow_width: 2,
      inactive_opacity: 0.3,
      animation: "slide",
      flow_speed: 1,
      dot_size: 3,
      dot_count: 2,
      bar_width: 14,
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
  // One entry in `entities:` becomes one item: a value, a side, and everything
  // needed to draw it. Preset supplies the defaults; per-item keys override.
  _items() {
    const config = this.config;
    return (config.entities || []).map((raw, index) => {
      const item = typeof raw === "string" ? { entity: raw } : raw || {};
      const preset = PRESETS[item.preset] || {};
      const stateObj = getState(this.hass, item.entity);
      let value;
      if (item.attribute) {
        const attr = stateObj && stateObj.attributes ? parseFloat(stateObj.attributes[item.attribute]) : NaN;
        value = Number.isFinite(attr) ? attr : null;
      } else {
        value = getNumber(this.hass, item.entity);
      }
      if (value !== null && item.invert_value) value = -value;
      let side = item.side;
      if (!side && item.producer) side = "left";
      if (!side && item.consumer) side = "right";
      if (!side) side = preset.side || (index % 2 === 0 ? "left" : "right");
      const threshold = Number(item.threshold);
      const magnitude = value === null ? 0 : Math.abs(value);
      const active = value !== null && (Number.isFinite(threshold) ? magnitude > threshold : magnitude > 0);
      return {
        key: `${index}`,
        entity: item.entity,
        value,
        magnitude,
        active,
        side,
        name: item.name || preset.name || (stateObj && stateObj.attributes ? stateObj.attributes.friendly_name : "") || item.entity || "",
        icon: item.icon || preset.icon || "mdi:flash",
        color: item.color || preset.color || "#9e9e9e",
        arrowColor: item.arrow_color || item.color || preset.color,
        decimals: Number.isFinite(Number(item.decimals)) ? Number(item.decimals) : Math.max(0, Number(config.decimals) || 0),
        unit: item.unit || config.unit || getUnit(this.hass, item.entity, void 0, ""),
        displayAbs: item.display_abs !== false,
        invertArrow: Boolean(item.invert_arrow),
        hideArrows: Boolean(item.hide_arrows),
        calcExcluded: Boolean(item.calc_excluded),
        preset: item.preset || ""
      };
    });
  }
  // autarky: share of consumption covered without importing.
  // ratio:   share of production used at home rather than exported.
  // Grid is signed: positive imports, negative exports.
  _stats(items) {
    let consumption = 0;
    let production = 0;
    let gridImport = 0;
    let gridExport = 0;
    items.forEach((item) => {
      if (item.calcExcluded || item.value === null) return;
      if (item.preset === "grid") {
        gridImport += Math.max(0, item.value);
        gridExport += Math.max(0, -item.value);
        return;
      }
      if (item.side === "right") consumption += Math.abs(item.value);
      else production += Math.max(0, item.value);
    });
    return {
      consumption,
      production,
      gridImport,
      gridExport,
      autarky: consumption > 0 ? clampPercent((consumption - gridImport) / consumption * 100) : 0,
      ratio: production > 0 ? clampPercent((production - gridExport) / production * 100) : 0
    };
  }
  _barValue(bar, stats) {
    if (bar.entity) {
      const value = getNumber(this.hass, bar.entity);
      if (value === null) return 0;
      const lower = Number.isFinite(Number(bar.lower_bound)) ? Number(bar.lower_bound) : 0;
      const upper = Number.isFinite(Number(bar.upper_bound)) ? Number(bar.upper_bound) : 100;
      const span = upper - lower || 1;
      return clampPercent((value - lower) / span * 100);
    }
    if (bar.preset === "autarky") return stats.autarky;
    if (bar.preset === "ratio") return stats.ratio;
    return 0;
  }
  _formatValue(item) {
    if (item.value === null) return "--";
    const shown = item.displayAbs ? Math.abs(item.value) : item.value;
    return `${shown.toFixed(item.decimals)}${item.unit ? ` ${item.unit}` : ""}`;
  }
  _dotDuration(magnitude, maxMagnitude) {
    const speed = Number(this.config.flow_speed) || 1;
    const share = maxMagnitude > 0 ? Math.min(1, magnitude / maxMagnitude) : 0;
    const seconds = (5 - 3.5 * share) / speed;
    return Math.max(0.4, Math.round(seconds * 4) / 4);
  }
  _renderArrow(item, geo, y, maxMagnitude) {
    const config = this.config;
    if (config.show_arrows === false || item.hideArrows) return svg``;
    const [x1, x2] = item.side === "left" ? [geo.leftEdge, geo.centerLeft] : [geo.centerRight, geo.rightEdge];
    if (x2 - x1 < 6) return svg``;
    const color = item.arrowColor || item.color;
    const width = Number(config.arrow_width) || 2;
    const inactiveOpacity = Number.isFinite(Number(config.inactive_opacity)) ? Number(config.inactive_opacity) : 0.3;
    const pathId = `${this._uid}-arrow-${item.key}`;
    let forward = item.value === null ? true : item.value >= 0;
    if (item.invertArrow) forward = !forward;
    let dots = svg``;
    if (item.active && config.animation !== "none") {
      const duration = this._dotDuration(item.magnitude, maxMagnitude);
      const count = Math.max(1, Math.round(Number(config.dot_count) || 2));
      const dotSize = Number(config.dot_size) || 3;
      dots = svg`${Array.from({ length: count }, (_, i) => svg`
        <circle r=${dotSize} fill=${color}>
          <animateMotion
            dur="${duration}s"
            begin="${-(duration / count * i)}s"
            repeatCount="indefinite"
            calcMode="linear"
            keyPoints=${forward ? "0;1" : "1;0"}
            keyTimes="0;1"
          >
            <mpath href="#${pathId}" />
          </animateMotion>
        </circle>
      `)}`;
    }
    return svg`
      <path
        id=${pathId}
        d="M ${x1} ${y} L ${x2} ${y}"
        fill="none"
        stroke=${color}
        stroke-width=${width}
        stroke-linecap="round"
        opacity=${item.active ? 1 : inactiveOpacity}
      />
      ${dots}
    `;
  }
  _renderItem(item, geo, y) {
    const config = this.config;
    const x = item.side === "left" ? geo.leftCenter : geo.rightCenter;
    const inactiveOpacity = Number.isFinite(Number(config.inactive_opacity)) ? Number(config.inactive_opacity) : 0.3;
    const valueFontSize = Number(config.value_font_size) || 16;
    const nameFontSize = Number(config.name_font_size) || 12;
    const iconSize = Number(config.icon_size) || 24;
    const valueY = y - (config.show_icons === false ? 0 : iconSize / 2) + valueFontSize * 0.9;
    const nameY = valueY + nameFontSize * 1.2;
    return svg`
      <g opacity=${item.active ? 1 : inactiveOpacity}>
        ${config.show_values === false ? svg`` : svg`
            <text
              class="value"
              x=${x}
              y=${valueY}
              text-anchor="middle"
              style="font-size: ${valueFontSize}px; fill: ${config.value_color || item.color}"
            >${this._formatValue(item)}</text>
          `}
        ${config.show_names === false ? svg`` : svg`
            <text
              class="name"
              x=${x}
              y=${nameY}
              text-anchor="middle"
              style="font-size: ${nameFontSize}px${config.name_color ? `; fill: ${config.name_color}` : ""}"
            >${item.name}</text>
          `}
      </g>
    `;
  }
  _renderCenter(geo, stats) {
    const config = this.config;
    const center = config.center || {};
    const bars = center.type === "bars" && Array.isArray(center.bars) ? center.bars : [];
    if (center.type === "none" || bars.length === 0) return svg``;
    const barWidth = Number(config.bar_width) || 14;
    const nameFontSize = Number(config.name_font_size) || 12;
    const available = geo.centerRight - geo.centerLeft;
    const slot = available / bars.length;
    const top = geo.contentTop + nameFontSize * 1.4;
    const bottom = geo.contentBottom - nameFontSize * 1.4;
    const height = Math.max(10, bottom - top);
    return svg`${bars.map((bar, index) => {
      const percent = this._barValue(bar, stats);
      const x = geo.centerLeft + slot * (index + 0.5);
      const fillHeight = height * percent / 100;
      const color = bar.bar_color || config.bar_color || "#4caf50";
      const bgColor = bar.bar_bg_color || config.bar_bg_color || "rgba(127,127,127,0.25)";
      return svg`
        <rect
          x=${x - barWidth / 2} y=${top} width=${barWidth} height=${height}
          rx=${barWidth / 2} fill=${bgColor}
        />
        <rect
          x=${x - barWidth / 2} y=${top + height - fillHeight}
          width=${barWidth} height=${fillHeight}
          rx=${barWidth / 2} fill=${color}
        />
        <text
          class="name" x=${x} y=${top - nameFontSize * 0.4}
          text-anchor="middle" style="font-size: ${nameFontSize}px"
        >${Math.round(percent)}%</text>
        <text
          class="name" x=${x} y=${bottom + nameFontSize}
          text-anchor="middle" style="font-size: ${nameFontSize}px"
        >${bar.name || bar.preset || ""}</text>
      `;
    })}`;
  }
  _geometry(counts) {
    const config = this.config;
    const padding = Number(config.padding) || 0;
    const itemWidth = Math.min(
      Number(config.item_width) || 90,
      Math.max(40, (this._width - padding * 2) * 0.32)
    );
    const titleHeight = config.title ? (Number(config.title_font_size) || 16) * 1.6 : 0;
    const contentTop = padding + titleHeight;
    const contentBottom = this._height - padding;
    const rows = Math.max(1, counts.left, counts.right);
    const rowHeight = (contentBottom - contentTop) / rows;
    return {
      padding,
      itemWidth,
      contentTop,
      contentBottom,
      rowHeight,
      titleHeight,
      leftCenter: padding + itemWidth / 2,
      rightCenter: this._width - padding - itemWidth / 2,
      leftEdge: padding + itemWidth,
      rightEdge: this._width - padding - itemWidth,
      centerLeft: padding + itemWidth + 12,
      centerRight: this._width - padding - itemWidth - 12
    };
  }
  // Items are centred within their own column's rows, so a side with fewer
  // items still spreads evenly rather than bunching at the top.
  _rowY(geo, index, count) {
    const span = geo.contentBottom - geo.contentTop;
    const step = span / Math.max(1, count);
    return geo.contentTop + step * (index + 0.5);
  }
  render() {
    if (!this.config || !this.hass) {
      return html2``;
    }
    const items = this._items();
    const left = items.filter((i) => i.side === "left");
    const right = items.filter((i) => i.side === "right");
    const geo = this._geometry({ left: left.length, right: right.length });
    const stats = this._stats(items);
    const maxMagnitude = items.reduce((max, i) => Math.max(max, i.magnitude), 0);
    const iconSize = Number(this.config.icon_size) || 24;
    const placed = [
      ...left.map((item, i) => ({ item, y: this._rowY(geo, i, left.length) })),
      ...right.map((item, i) => ({ item, y: this._rowY(geo, i, right.length) }))
    ];
    return html2`
      <ha-card>
        <div
          class="root"
          style=${Number(this.config.card_height) > 0 ? "" : `min-height: ${DEFAULT_HEIGHT}px`}
        >
          <svg viewBox="0 0 ${this._width} ${this._height}">
            ${this.config.title ? svg`
                <text
                  class="title"
                  x=${this._width / 2}
                  y=${geo.padding + (Number(this.config.title_font_size) || 16)}
                  text-anchor="middle"
                  style="font-size: ${Number(this.config.title_font_size) || 16}px${this.config.title_color ? `; fill: ${this.config.title_color}` : ""}"
                >${this.config.title}</text>
              ` : svg``}
            ${placed.map(
      ({ item, y }) => this._renderArrow(item, geo, y, maxMagnitude)
    )}
            ${this._renderCenter(geo, stats)}
            ${placed.map(({ item, y }) => this._renderItem(item, geo, y))}
          </svg>
          ${this.config.show_icons === false ? "" : placed.map(
      ({ item, y }) => html2`
                  <div
                    class="icon"
                    style="left: ${item.side === "left" ? geo.leftCenter : geo.rightCenter}px; top: ${y - iconSize / 2}px; --mdc-icon-size: ${iconSize}px; color: ${item.color}; opacity: ${item.active ? 1 : Number(this.config.inactive_opacity) || 0.3}"
                  >
                    <ha-icon .icon=${item.icon}></ha-icon>
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
      .name {
        fill: var(--secondary-text-color, #9e9e9e);
      }
      .title {
        fill: var(--primary-text-color, #fff);
        font-weight: 700;
      }
    `;
  }
};
if (!customElements.get("distribution-ex-card")) {
  customElements.define("distribution-ex-card", DistributionExCard);
  registerCard({
    type: "distribution-ex-card",
    name: "Distribution Ex Card",
    description: "SVG power distribution: producers and consumers either side of a centre panel, with animated arrows.",
    preview: true
  });
}
