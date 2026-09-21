// Generated from src/sensor-ex-card.js by build.sh - do not edit directly.

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
function valueLevel(value, warningThreshold, dangerThreshold) {
  if (value === null) return "normal";
  const hasDanger = dangerThreshold !== void 0 && dangerThreshold !== null && dangerThreshold !== "";
  const hasWarning = warningThreshold !== void 0 && warningThreshold !== null && warningThreshold !== "";
  if (hasDanger && value >= Number(dangerThreshold)) return "danger";
  if (hasWarning && value >= Number(warningThreshold)) return "warning";
  return "normal";
}
function levelColor(config, level) {
  if (level === "danger") return config.color_danger || "#ff4136";
  if (level === "warning") return config.color_warning || "#ffa600";
  return config.color_normal || "";
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

// src/sensor-ex-card.js
var DEFAULT_WIDTH = 300;
var DEFAULT_HEIGHT = 120;
var MAX_POINTS = 100;
var CAP_RATIO = 0.72;
var EDITOR_SCHEMA = [
  { name: "entity", selector: { entity: {} } },
  { name: "name", selector: { text: {} } },
  { name: "icon", selector: { icon: {} } },
  { name: "unit", selector: { text: {} } },
  {
    name: "value_precision",
    selector: { number: { min: 0, max: 3, step: 1, mode: "box" } }
  },
  { name: "show_label", selector: { boolean: {} } },
  { name: "show_value", selector: { boolean: {} } },
  { name: "show_unit", selector: { boolean: {} } },
  { name: "show_icon", selector: { boolean: {} } },
  { name: "show_graph", selector: { boolean: {} } },
  { name: "show_trend", selector: { boolean: {} } },
  {
    name: "trend_hours",
    selector: { number: { min: 0.1, max: 168, step: 0.1, mode: "box" } }
  },
  {
    name: "trend_threshold",
    selector: { number: { min: 0, max: 1e4, step: 0.1, mode: "box" } }
  },
  { name: "trend_color_up", selector: { text: {} } },
  { name: "trend_color_down", selector: { text: {} } },
  { name: "trend_color_flat", selector: { text: {} } },
  {
    name: "trend_font_size",
    selector: { number: { min: 6, max: 60, step: 1, mode: "box" } }
  },
  { name: "trend_up_symbol", selector: { text: {} } },
  { name: "trend_down_symbol", selector: { text: {} } },
  { name: "trend_flat_symbol", selector: { text: {} } },
  { name: "label_color", selector: { text: {} } },
  { name: "value_color", selector: { text: {} } },
  { name: "unit_color", selector: { text: {} } },
  { name: "icon_color", selector: { text: {} } },
  {
    name: "label_font_size",
    selector: { number: { min: 6, max: 60, step: 1, mode: "box" } }
  },
  {
    name: "value_font_size",
    selector: { number: { min: 8, max: 120, step: 1, mode: "box" } }
  },
  { name: "value_font_weight", selector: { text: {} } },
  {
    name: "value_margin",
    selector: { "number": { "min": -40, "max": 60, "step": 1, "mode": "box" } }
  },
  {
    name: "decimal_font_size_percent",
    selector: { "number": { "min": 10, "max": 100, "step": 5, "mode": "box" } }
  },
  {
    name: "unit_font_size",
    selector: { number: { min: 6, max: 60, step: 1, mode: "box" } }
  },
  {
    name: "icon_size",
    selector: { number: { min: 8, max: 96, step: 1, mode: "box" } }
  },
  { name: "color_normal", selector: { text: {} } },
  { name: "color_warning", selector: { text: {} } },
  { name: "color_danger", selector: { text: {} } },
  {
    name: "warning_threshold",
    selector: { number: { min: -1e3, max: 1e4, step: 0.1, mode: "box" } }
  },
  {
    name: "danger_threshold",
    selector: { number: { min: -1e3, max: 1e4, step: 0.1, mode: "box" } }
  },
  {
    name: "hours_to_show",
    selector: { number: { min: 1, max: 720, step: 1, mode: "box" } }
  },
  {
    name: "graph_type",
    selector: {
      select: {
        mode: "dropdown",
        options: [
          { value: "area", label: "Area (line + fill)" },
          { value: "line", label: "Line only" }
        ]
      }
    }
  },
  { name: "line_color", selector: { text: {} } },
  {
    name: "line_width",
    selector: { number: { min: 0.5, max: 10, step: 0.5, mode: "box" } }
  },
  { name: "fill_color", selector: { text: {} } },
  {
    name: "fill_opacity",
    selector: { number: { min: 0, max: 1, step: 0.05, mode: "box" } }
  },
  {
    name: "graph_height",
    selector: { number: { min: 0.1, max: 1, step: 0.05, mode: "box" } }
  },
  {
    name: "y_min",
    selector: { number: { min: -1e4, max: 1e4, step: 0.1, mode: "box" } }
  },
  {
    name: "y_max",
    selector: { number: { min: -1e4, max: 1e4, step: 0.1, mode: "box" } }
  },
  {
    name: "card_height",
    selector: { number: { min: 40, max: 600, step: 1, mode: "box" } }
  },
  {
    name: "padding",
    selector: { number: { min: 0, max: 64, step: 1, mode: "box" } }
  },
  {
    name: "refresh_interval",
    selector: { number: { min: 10, max: 3600, step: 10, mode: "box" } }
  }
];
var EDITOR_LABELS = {
  entity: "Entity",
  name: "Label (defaults to the entity name)",
  icon: "Icon (defaults to the entity icon)",
  unit: "Unit override (optional)",
  value_precision: "Value decimal places",
  show_label: "Show label",
  show_value: "Show value",
  show_unit: "Show unit",
  show_icon: "Show icon",
  show_graph: "Show graph",
  show_trend: "Show trend arrow",
  trend_hours: "Trend window (hours of history to compare)",
  trend_threshold: "Trend deadband (change below this counts as flat)",
  trend_color_up: "Rising trend color",
  trend_color_down: "Falling trend color",
  trend_color_flat: "Flat trend color",
  trend_font_size: "Trend arrow size (px)",
  trend_up_symbol: "Rising symbol",
  trend_down_symbol: "Falling symbol",
  trend_flat_symbol: "Flat symbol",
  label_color: "Label color (CSS color, optional)",
  value_color: "Value color (CSS color, optional)",
  unit_color: "Unit color (CSS color, optional)",
  icon_color: "Icon color (CSS color, optional)",
  label_font_size: "Label font size (px)",
  value_font_size: "Value font size (px)",
  value_font_weight: "Value font weight (default normal, as the built-in card)",
  value_margin: "Extra space above the text block (px)",
  decimal_font_size_percent: "Decimal size, as a % of the value font size",
  unit_font_size: "Unit font size (px)",
  icon_size: "Icon size (px)",
  color_normal: "Normal value color (CSS color, optional)",
  color_warning: "Warning value color (default orange)",
  color_danger: "Danger value color (default red)",
  warning_threshold: "Warning threshold (optional)",
  danger_threshold: "Danger threshold (optional)",
  hours_to_show: "Hours of history to graph",
  graph_type: "Graph type",
  line_color: "Graph line color (CSS color, optional)",
  line_width: "Graph line width (px)",
  fill_color: "Graph fill color (defaults to the line color)",
  fill_opacity: "Graph fill opacity (0-1)",
  graph_height: "Graph height (fraction of the card, 0-1)",
  y_min: "Y axis minimum (auto if unset)",
  y_max: "Y axis maximum (auto if unset)",
  card_height: "Card height (px, unset = fill the tile)",
  padding: "Padding around contents (px, 0 = fill tile)",
  refresh_interval: "History refresh interval (seconds)"
};
defineEditor("sensor-ex-card-editor", EDITOR_SCHEMA, EDITOR_LABELS);
function downsample(points, limit) {
  if (points.length <= limit) return points;
  const bucketSize = points.length / limit;
  const out = [];
  for (let i = 0; i < limit; i += 1) {
    const from = Math.floor(i * bucketSize);
    const to = Math.min(points.length, Math.floor((i + 1) * bucketSize));
    if (to <= from) continue;
    let sumT = 0;
    let sumV = 0;
    for (let j = from; j < to; j += 1) {
      sumT += points[j].t;
      sumV += points[j].v;
    }
    out.push({ t: sumT / (to - from), v: sumV / (to - from) });
  }
  return out;
}
var SensorExCard = class extends LitElement2 {
  static get properties() {
    return {
      hass: { attribute: false },
      config: { attribute: false },
      _history: { attribute: false },
      _width: { attribute: false },
      _height: { attribute: false }
    };
  }
  constructor() {
    super();
    this._history = [];
    this._width = DEFAULT_WIDTH;
    this._height = DEFAULT_HEIGHT;
    this._gradientId = uniqueId("sxc-graph-fill");
    this._lineBandId = uniqueId("sxc-graph-line-bands");
    this._areaBandId = uniqueId("sxc-graph-area-bands");
  }
  static getStubConfig(hass) {
    const states = hass && hass.states || {};
    const entity = Object.keys(states).find(
      (id) => id.startsWith("sensor.") && states[id].attributes && states[id].attributes.unit_of_measurement
    ) || "sensor.temperature";
    return { type: "custom:sensor-ex-card", entity };
  }
  static getConfigElement() {
    return document.createElement("sensor-ex-card-editor");
  }
  setConfig(config) {
    if (!config.entity) {
      throw new Error("entity is required");
    }
    this.config = {
      value_precision: 1,
      show_label: true,
      show_value: true,
      show_unit: true,
      show_icon: true,
      show_graph: true,
      show_trend: true,
      trend_hours: 1,
      trend_threshold: 0,
      trend_up_symbol: "\u25B2",
      trend_down_symbol: "\u25BC",
      trend_flat_symbol: "\u2013",
      label_font_size: 18,
      value_font_size: 40,
      unit_font_size: 14,
      decimal_font_size_percent: 100,
      value_margin: 0,
      icon_size: 24,
      hours_to_show: 24,
      graph_type: "area",
      line_width: 2,
      fill_opacity: 0.3,
      graph_height: 0.45,
      refresh_interval: 300,
      padding: 0,
      ...config
    };
  }
  getCardSize() {
    return 3;
  }
  firstUpdated() {
    const root = this.renderRoot.querySelector(".root");
    if (root) {
      this._resizeObserver = new ResizeObserver(() => this._measure());
      this._resizeObserver.observe(root);
      this._measure();
    }
    this._startRefresh();
  }
  connectedCallback() {
    super.connectedCallback();
    if (this.hasUpdated) {
      this._startRefresh();
      this._fetchHistory();
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this._stopRefresh();
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = void 0;
    }
  }
  // card_height pins the card's height. Without it the card fills whatever the
  // layout gives it, which in a stack means matching the tallest sibling.
  _fixedHeight() {
    const height = Number(this.config && this.config.card_height);
    return Number.isFinite(height) && height > 0 ? height : 0;
  }
  updated() {
    if (!this.hass || !this.config) return;
    const fixedHeight = this._fixedHeight();
    this.style.height = fixedHeight ? `${fixedHeight}px` : "";
    const key = `${this.config.entity}|${this.config.hours_to_show}`;
    if (key !== this._fetchKey) {
      this._fetchKey = key;
      this._fetchHistory();
    }
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
  _startRefresh() {
    this._stopRefresh();
    const seconds = Number(this.config && this.config.refresh_interval) || 300;
    this._refreshTimer = setInterval(() => this._fetchHistory(), seconds * 1e3);
  }
  _stopRefresh() {
    if (this._refreshTimer) {
      clearInterval(this._refreshTimer);
      this._refreshTimer = void 0;
    }
  }
  async _fetchHistory() {
    const entityId = this.config && this.config.entity;
    if (!this.hass || !entityId || typeof this.hass.callWS !== "function") return;
    const hours = Number(this.config.hours_to_show) || 24;
    const end = /* @__PURE__ */ new Date();
    const start = new Date(end.getTime() - hours * 3600 * 1e3);
    try {
      const result = await this.hass.callWS({
        type: "history/history_during_period",
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        entity_ids: [entityId],
        minimal_response: true,
        no_attributes: true
      });
      const raw = result && result[entityId] || [];
      this._history = raw.map((point) => ({
        // Compressed responses use lu/s; older/full ones last_changed/state.
        t: typeof point.lu === "number" ? point.lu * 1e3 : Date.parse(point.last_updated || point.last_changed),
        v: parseFloat(point.s !== void 0 ? point.s : point.state)
      })).filter((point) => Number.isFinite(point.t) && Number.isFinite(point.v));
    } catch (err) {
      this._history = [];
    }
  }
  // History stops at the last recorded change, so append live state to keep the
  // sparkline running to "now".
  _series() {
    const points = this._history.slice();
    const current = getNumber(this.hass, this.config.entity);
    if (current !== null) {
      const now = Date.now();
      const last = points[points.length - 1];
      if (!last || now - last.t > 1e3) {
        points.push({ t: now, v: current });
      }
    }
    return downsample(points, MAX_POINTS);
  }
  // Compares the mean of the newer half of the trend window against the older
  // half. Averaging both halves rather than diffing first/last keeps a noisy
  // sensor from flipping the arrow on every update. Returns null when there
  // isn't enough history to say anything, so nothing is drawn.
  _trend() {
    const hours = Number(this.config.trend_hours) || 1;
    const cutoff = Date.now() - hours * 3600 * 1e3;
    const points = this._series().filter((p) => p.t >= cutoff);
    if (points.length < 2) return null;
    const mid = Math.floor(points.length / 2);
    const mean = (arr) => arr.reduce((sum, p) => sum + p.v, 0) / arr.length;
    const delta = mean(points.slice(mid)) - mean(points.slice(0, mid));
    const deadband = Math.abs(Number(this.config.trend_threshold) || 0);
    if (Math.abs(delta) <= deadband) return { direction: "flat", delta };
    return { direction: delta > 0 ? "up" : "down", delta };
  }
  // Ranges are half-open - value_from <= value < value_to - so contiguous
  // rules like 0-10 and 10-20 cannot both claim 10. Either bound may be
  // omitted to leave that end open, and the first matching rule wins, so order
  // decides when rules do overlap.
  _matchFormat(value) {
    if (value === null) return null;
    const rules = Array.isArray(this.config.value_format) ? this.config.value_format : [];
    for (const rule of rules) {
      if (!rule) continue;
      const from = Number(rule.value_from);
      const to = Number(rule.value_to);
      const hasFrom = rule.value_from !== void 0 && rule.value_from !== null && rule.value_from !== "" && Number.isFinite(from);
      const hasTo = rule.value_to !== void 0 && rule.value_to !== null && rule.value_to !== "" && Number.isFinite(to);
      if (hasFrom && value < from) continue;
      if (hasTo && value >= to) continue;
      return rule;
    }
    return null;
  }
  // Colour stops for banding the graph by value. Because the y axis already
  // maps value to position, a vertical gradient with hard stops at each band
  // edge colours the line exactly where it crosses a threshold - no need to
  // cut the path into pieces. Returns null when no rule defines a graph_color.
  _graphBands(min, max, fallback) {
    const rules = Array.isArray(this.config.value_format) ? this.config.value_format : [];
    if (!rules.some((rule) => rule && rule.graph_color)) return null;
    if (!(max > min)) return null;
    const edges = /* @__PURE__ */ new Set([min, max]);
    rules.forEach((rule) => {
      if (!rule) return;
      [rule.value_from, rule.value_to].forEach((bound) => {
        const n = Number(bound);
        if (Number.isFinite(n) && n > min && n < max) edges.add(n);
      });
    });
    const sorted = [...edges].sort((a, b) => b - a);
    const stops = [];
    for (let i = 0; i < sorted.length - 1; i += 1) {
      const hi = sorted[i];
      const lo = sorted[i + 1];
      const rule = this._matchFormat((hi + lo) / 2);
      const color = rule && rule.graph_color || fallback;
      stops.push({ offset: (max - hi) / (max - min), color });
      stops.push({ offset: (max - lo) / (max - min), color });
    }
    return stops;
  }
  // Splits "19.9" into "19" and ".9" so the fraction can be set smaller. The
  // separator travels with the fraction, and a value without one (or the "--"
  // placeholder) comes back whole.
  _valueParts(text) {
    const at = text.indexOf(".");
    return at === -1 ? { whole: text, fraction: "" } : { whole: text.slice(0, at), fraction: text.slice(at) };
  }
  _trendSymbol(direction) {
    if (direction === "up") return this.config.trend_up_symbol || "\u25B2";
    if (direction === "down") return this.config.trend_down_symbol || "\u25BC";
    return this.config.trend_flat_symbol || "\u2013";
  }
  _trendColor(direction) {
    if (direction === "up") return this.config.trend_color_up || "#ff6b6b";
    if (direction === "down") return this.config.trend_color_down || "#58a6ff";
    return this.config.trend_color_flat || "";
  }
  _renderGraph(rect) {
    const points = this._series();
    if (points.length < 2) return svg``;
    const values = points.map((p) => p.v);
    const configMin = Number(this.config.y_min);
    const configMax = Number(this.config.y_max);
    let min = Number.isFinite(configMin) && this.config.y_min !== "" ? configMin : Math.min(...values);
    let max = Number.isFinite(configMax) && this.config.y_max !== "" ? configMax : Math.max(...values);
    if (max === min) {
      min -= 1;
      max += 1;
    }
    const tMin = points[0].t;
    const tMax = points[points.length - 1].t;
    const tSpan = tMax - tMin || 1;
    const lineWidth = Number(this.config.line_width) || 2;
    const inset = lineWidth / 2;
    const top = rect.top + inset;
    const bottom = rect.bottom - inset;
    const coords = points.map((p) => ({
      x: rect.left + (p.t - tMin) / tSpan * (rect.right - rect.left),
      y: bottom - (p.v - min) / (max - min) * (bottom - top)
    }));
    const line = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`).join(" ");
    const lineColor = this.config.line_color || "";
    const fillColor = this.config.fill_color || this.config.line_color || "";
    const fillOpacity = Number.isFinite(Number(this.config.fill_opacity)) ? Number(this.config.fill_opacity) : 0.3;
    const bands = this._graphBands(
      min,
      max,
      lineColor || "var(--accent-color, #58a6ff)"
    );
    const bandDefs = bands ? svg`
          <linearGradient
            id=${this._lineBandId}
            gradientUnits="userSpaceOnUse"
            x1="0" y1=${top} x2="0" y2=${bottom}
          >
            ${bands.map(
      (stop) => svg`<stop offset=${stop.offset} stop-color=${stop.color} />`
    )}
          </linearGradient>
          <linearGradient
            id=${this._areaBandId}
            gradientUnits="userSpaceOnUse"
            x1="0" y1=${top} x2="0" y2=${bottom}
          >
            ${bands.map(
      (stop) => svg`<stop
                offset=${stop.offset}
                stop-color=${stop.color}
                stop-opacity=${fillOpacity}
              />`
    )}
          </linearGradient>
        ` : svg``;
    const area = this.config.graph_type === "line" ? svg`` : svg`
            <path
              class="area"
              d="${line} L ${coords[coords.length - 1].x.toFixed(2)} ${rect.bottom} L ${coords[0].x.toFixed(2)} ${rect.bottom} Z"
              fill=${bands ? `url(#${this._areaBandId})` : `url(#${this._gradientId})`}
              style=${fillColor ? `color: ${fillColor}` : ""}
            />
          `;
    return svg`
      <defs>
        ${bandDefs}
        ${this.config.graph_type === "line" ? svg`` : svg`
            <linearGradient id=${this._gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color=${fillColor || "currentColor"} stop-opacity=${fillOpacity} />
              <stop offset="100%" stop-color=${fillColor || "currentColor"} stop-opacity="0" />
            </linearGradient>
          `}
      </defs>
      ${area}
      <path
        class="line"
        d=${line}
        style="stroke-width: ${lineWidth}${bands ? "" : lineColor ? `; stroke: ${lineColor}` : ""}"
        stroke=${bands ? `url(#${this._lineBandId})` : ""}
      />
    `;
  }
  render() {
    if (!this.config || !this.hass) {
      return html2``;
    }
    const stateObj = getState(this.hass, this.config.entity);
    const value = getNumber(this.hass, this.config.entity);
    const unit = getUnit(this.hass, this.config.entity, this.config.unit);
    const precision = Math.max(0, Number(this.config.value_precision) || 0);
    const padding = Number.isFinite(Number(this.config.padding)) ? Number(this.config.padding) : 0;
    const fixedHeight = this._fixedHeight();
    const label = this.config.name || stateObj && stateObj.attributes && stateObj.attributes.friendly_name || this.config.entity;
    const level = valueLevel(
      value,
      this.config.warning_threshold,
      this.config.danger_threshold
    );
    const format = this._matchFormat(value) || {};
    const valueColor = format.color || levelColor(this.config, level) || this.config.value_color || "";
    const labelFontSize = Number(this.config.label_font_size) || 18;
    const valueFontSize = Number(format.value_font_size) || Number(this.config.value_font_size) || 40;
    const unitFontSize = Number(this.config.unit_font_size) || 14;
    const trendFontSize = Number(this.config.trend_font_size) || unitFontSize;
    const trend = this.config.show_trend === false ? null : this._trend();
    const decimalPercent = Number(this.config.decimal_font_size_percent);
    const decimalFontSize = Number.isFinite(decimalPercent) && decimalPercent > 0 ? valueFontSize * decimalPercent / 100 : valueFontSize;
    const valueParts = this._valueParts(
      value !== null ? value.toFixed(precision) : "--"
    );
    const valueTspans = svg`<tspan style="font-size: ${valueFontSize}px${valueColor ? `; fill: ${valueColor}` : ""}">${valueParts.whole}</tspan>${valueParts.fraction ? svg`<tspan class="decimal" style="font-size: ${decimalFontSize}px${valueColor ? `; fill: ${valueColor}` : ""}">${valueParts.fraction}</tspan>` : svg``}${this.config.show_unit === false || !unit ? svg`` : svg`<tspan class="unit" dx="4" style="font-size: ${unitFontSize}px${this.config.unit_color ? `; fill: ${this.config.unit_color}` : ""}">${unit}</tspan>`}${!trend ? svg`` : svg`<tspan class="trend" dx="6" style="font-size: ${trendFontSize}px${this._trendColor(trend.direction) ? `; fill: ${this._trendColor(trend.direction)}` : ""}">${this._trendSymbol(trend.direction)}</tspan>`}`;
    const iconSize = Number(this.config.icon_size) || 24;
    const width = this._width;
    const height = this._height;
    const left = padding;
    const right = width - padding;
    const top = padding;
    const bottom = height - padding;
    const graphFraction = Math.min(
      1,
      Math.max(0.1, Number(this.config.graph_height) || 0.45)
    );
    const showGraph = this.config.show_graph !== false;
    const graphRect = {
      left,
      right,
      top: bottom - (bottom - top) * graphFraction,
      bottom
    };
    const showLabel = this.config.show_label !== false;
    const margin = Number.isFinite(Number(this.config.value_margin)) ? Number(this.config.value_margin) : 0;
    const textTop = top + margin;
    const labelY = textTop + labelFontSize * CAP_RATIO;
    const valueTop = showLabel ? textTop + labelFontSize * 1.05 : textTop;
    const valueY = valueTop + valueFontSize * CAP_RATIO;
    return html2`
      <ha-card style=${format.background ? `background: ${format.background}` : ""}>
        <div
          class="root"
          style="${fixedHeight ? "" : `min-height: ${DEFAULT_HEIGHT}px;`} --sxc-value-weight: ${this.config.value_font_weight || "normal"}"
        >
          <svg viewBox="0 0 ${width} ${height}" width=${width} height=${height}>
            ${showGraph ? this._renderGraph(graphRect) : svg``}
            ${!showLabel ? svg`` : svg`
                <text
                  class="label"
                  x=${left}
                  y=${labelY}
                  style="font-size: ${labelFontSize}px${this.config.label_color ? `; fill: ${this.config.label_color}` : ""}"
                >${label}</text>
              `}
            ${this.config.show_value === false ? svg`` : svg`
                <text class="value" x=${left} y=${valueY}>${valueTspans}</text>
              `}
          </svg>
          ${this.config.show_icon === false ? "" : html2`
                <div
                  class="icon"
                  style="top: ${top}px; right: ${padding}px; --mdc-icon-size: ${iconSize}px${this.config.icon_color ? `; color: ${this.config.icon_color}` : ""}"
                >
                  ${this.config.icon ? html2`<ha-icon .icon=${this.config.icon}></ha-icon>` : html2`<ha-state-icon
                        .hass=${this.hass}
                        .stateObj=${stateObj}
                      ></ha-state-icon>`}
                </div>
              `}
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
        /* Inherit the theme's face, so the card matches the built-in sensor
           card instead of falling back to the SVG default. */
        font-family: inherit;
      }
      .icon {
        position: absolute;
        color: var(--state-icon-color, var(--secondary-text-color, #9e9e9e));
        line-height: 0;
      }
      .label {
        fill: var(--secondary-text-color, #9e9e9e);
      }
      /* The built-in sensor card sets only a size on its value, so it renders
         at normal weight; matching that is what makes the two look alike. */
      .value {
        fill: var(--primary-text-color, #fff);
        font-weight: var(--sxc-value-weight, normal);
      }
      .unit {
        fill: var(--secondary-text-color, #9e9e9e);
        font-weight: 400;
      }
      .trend {
        fill: var(--secondary-text-color, #9e9e9e);
        font-weight: 400;
      }
      .line {
        fill: none;
        stroke: var(--accent-color, #58a6ff);
        stroke-linejoin: round;
        stroke-linecap: round;
      }
      .area {
        color: var(--accent-color, #58a6ff);
        stroke: none;
      }
    `;
  }
};
if (!customElements.get("sensor-ex-card")) {
  customElements.define("sensor-ex-card", SensorExCard);
  registerCard({
    type: "sensor-ex-card",
    name: "Sensor Ex Card",
    description: "SVG sensor card with label, value, unit and a recorder history graph, with extensive styling options.",
    preview: true
  });
}
