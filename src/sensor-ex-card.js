import {
  LitElement,
  html,
  css,
  svg,
  defineEditor,
  getNumber,
  getState,
  getUnit,
  levelColor,
  registerCard,
  uniqueId,
  valueLevel,
} from "./shared.js";

const DEFAULT_WIDTH = 300;
const DEFAULT_HEIGHT = 120;
// Sparkline detail beyond this is invisible, and recorder can return thousands
// of points for a long window.
const MAX_POINTS = 100;
// Cap height of the usual UI faces, as a fraction of the em size. Used to put
// glyph tops at a known y when positioning off the alphabetic baseline.
const CAP_RATIO = 0.72;

const EDITOR_SCHEMA = [
  { name: "entity", selector: { entity: {} } },
  { name: "name", selector: { text: {} } },
  { name: "icon", selector: { icon: {} } },
  { name: "unit", selector: { text: {} } },
  {
    name: "value_precision",
    selector: { number: { min: 0, max: 3, step: 1, mode: "box" } },
  },
  { name: "show_label", selector: { boolean: {} } },
  { name: "show_value", selector: { boolean: {} } },
  { name: "show_unit", selector: { boolean: {} } },
  { name: "show_icon", selector: { boolean: {} } },
  { name: "show_graph", selector: { boolean: {} } },
  { name: "show_trend", selector: { boolean: {} } },
  {
    name: "trend_hours",
    selector: { number: { min: 0.1, max: 168, step: 0.1, mode: "box" } },
  },
  {
    name: "trend_threshold",
    selector: { number: { min: 0, max: 10000, step: 0.1, mode: "box" } },
  },
  { name: "trend_color_up", selector: { text: {} } },
  { name: "trend_color_down", selector: { text: {} } },
  { name: "trend_color_flat", selector: { text: {} } },
  {
    name: "trend_font_size",
    selector: { number: { min: 6, max: 60, step: 1, mode: "box" } },
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
    selector: { number: { min: 6, max: 60, step: 1, mode: "box" } },
  },
  {
    name: "value_font_size",
    selector: { number: { min: 8, max: 120, step: 1, mode: "box" } },
  },
  { name: "value_font_weight", selector: { text: {} } },
  {
    name: "value_margin",
    selector: { "number": { "min": -40, "max": 60, "step": 1, "mode": "box" } },
  },
  {
    name: "decimal_font_size_percent",
    selector: { "number": { "min": 10, "max": 100, "step": 5, "mode": "box" } },
  },
  {
    name: "unit_font_size",
    selector: { number: { min: 6, max: 60, step: 1, mode: "box" } },
  },
  {
    name: "icon_size",
    selector: { number: { min: 8, max: 96, step: 1, mode: "box" } },
  },
  { name: "color_normal", selector: { text: {} } },
  { name: "color_warning", selector: { text: {} } },
  { name: "color_danger", selector: { text: {} } },
  {
    name: "warning_threshold",
    selector: { number: { min: -1000, max: 10000, step: 0.1, mode: "box" } },
  },
  {
    name: "danger_threshold",
    selector: { number: { min: -1000, max: 10000, step: 0.1, mode: "box" } },
  },
  {
    name: "hours_to_show",
    selector: { number: { min: 1, max: 720, step: 1, mode: "box" } },
  },
  {
    name: "graph_type",
    selector: {
      select: {
        mode: "dropdown",
        options: [
          { value: "area", label: "Area (line + fill)" },
          { value: "line", label: "Line only" },
        ],
      },
    },
  },
  { name: "line_color", selector: { text: {} } },
  {
    name: "line_width",
    selector: { number: { min: 0.5, max: 10, step: 0.5, mode: "box" } },
  },
  { name: "fill_color", selector: { text: {} } },
  {
    name: "fill_opacity",
    selector: { number: { min: 0, max: 1, step: 0.05, mode: "box" } },
  },
  {
    name: "graph_height",
    selector: { number: { min: 0.1, max: 1, step: 0.05, mode: "box" } },
  },
  {
    name: "y_min",
    selector: { number: { min: -10000, max: 10000, step: 0.1, mode: "box" } },
  },
  {
    name: "y_max",
    selector: { number: { min: -10000, max: 10000, step: 0.1, mode: "box" } },
  },
  {
    name: "card_height",
    selector: { number: { min: 40, max: 600, step: 1, mode: "box" } },
  },
  {
    name: "padding",
    selector: { number: { min: 0, max: 64, step: 1, mode: "box" } },
  },
  {
    name: "refresh_interval",
    selector: { number: { min: 10, max: 3600, step: 10, mode: "box" } },
  },
];

const EDITOR_LABELS = {
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
  refresh_interval: "History refresh interval (seconds)",
};

defineEditor("sensor-ex-card-editor", EDITOR_SCHEMA, EDITOR_LABELS);

function downsample(points, limit) {
  if (points.length <= limit) return points;
  // Average within buckets rather than striding, so spikes don't disappear
  // purely based on where the stride lands.
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

class SensorExCard extends LitElement {
  static get properties() {
    return {
      hass: { attribute: false },
      config: { attribute: false },
      _history: { attribute: false },
      _width: { attribute: false },
      _height: { attribute: false },
    };
  }

  constructor() {
    super();
    this._history = [];
    this._width = DEFAULT_WIDTH;
    this._height = DEFAULT_HEIGHT;
    this._gradientId = uniqueId("sxc-graph-fill");
  }

  static getStubConfig(hass) {
    const states = (hass && hass.states) || {};
    const entity =
      Object.keys(states).find(
        (id) =>
          id.startsWith("sensor.") &&
          states[id].attributes &&
          states[id].attributes.unit_of_measurement
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
      trend_up_symbol: "▲",
      trend_down_symbol: "▼",
      trend_flat_symbol: "–",
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
      ...config,
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
      this._resizeObserver = undefined;
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
    // Set on the host: an explicit cross-size stops a flex/grid parent from
    // stretching the card, which styling ha-card alone cannot do.
    const fixedHeight = this._fixedHeight();
    this.style.height = fixedHeight ? `${fixedHeight}px` : "";
    // Refetch only when the query itself changes, otherwise every state update
    // would trigger a round trip.
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
    this._refreshTimer = setInterval(() => this._fetchHistory(), seconds * 1000);
  }

  _stopRefresh() {
    if (this._refreshTimer) {
      clearInterval(this._refreshTimer);
      this._refreshTimer = undefined;
    }
  }

  async _fetchHistory() {
    const entityId = this.config && this.config.entity;
    if (!this.hass || !entityId || typeof this.hass.callWS !== "function") return;
    const hours = Number(this.config.hours_to_show) || 24;
    const end = new Date();
    const start = new Date(end.getTime() - hours * 3600 * 1000);
    try {
      const result = await this.hass.callWS({
        type: "history/history_during_period",
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        entity_ids: [entityId],
        minimal_response: true,
        no_attributes: true,
      });
      const raw = (result && result[entityId]) || [];
      this._history = raw
        .map((point) => ({
          // Compressed responses use lu/s; older/full ones last_changed/state.
          t:
            typeof point.lu === "number"
              ? point.lu * 1000
              : Date.parse(point.last_updated || point.last_changed),
          v: parseFloat(point.s !== undefined ? point.s : point.state),
        }))
        .filter((point) => Number.isFinite(point.t) && Number.isFinite(point.v));
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
      if (!last || now - last.t > 1000) {
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
    const cutoff = Date.now() - hours * 3600 * 1000;
    const points = this._series().filter((p) => p.t >= cutoff);
    if (points.length < 2) return null;

    const mid = Math.floor(points.length / 2);
    const mean = (arr) => arr.reduce((sum, p) => sum + p.v, 0) / arr.length;
    const delta = mean(points.slice(mid)) - mean(points.slice(0, mid));
    const deadband = Math.abs(Number(this.config.trend_threshold) || 0);
    if (Math.abs(delta) <= deadband) return { direction: "flat", delta };
    return { direction: delta > 0 ? "up" : "down", delta };
  }

  // Splits "19.9" into "19" and ".9" so the fraction can be set smaller. The
  // separator travels with the fraction, and a value without one (or the "--"
  // placeholder) comes back whole.
  _valueParts(text) {
    const at = text.indexOf(".");
    return at === -1
      ? { whole: text, fraction: "" }
      : { whole: text.slice(0, at), fraction: text.slice(at) };
  }

  _trendSymbol(direction) {
    if (direction === "up") return this.config.trend_up_symbol || "▲";
    if (direction === "down") return this.config.trend_down_symbol || "▼";
    return this.config.trend_flat_symbol || "–";
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
      // Flat series: centre it instead of dividing by zero.
      min -= 1;
      max += 1;
    }

    const tMin = points[0].t;
    const tMax = points[points.length - 1].t;
    const tSpan = tMax - tMin || 1;
    const lineWidth = Number(this.config.line_width) || 2;
    // Inset by half the stroke so the line isn't clipped at the edges.
    const inset = lineWidth / 2;
    const top = rect.top + inset;
    const bottom = rect.bottom - inset;

    const coords = points.map((p) => ({
      x: rect.left + ((p.t - tMin) / tSpan) * (rect.right - rect.left),
      y: bottom - ((p.v - min) / (max - min)) * (bottom - top),
    }));

    const line = coords
      .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`)
      .join(" ");

    const lineColor = this.config.line_color || "";
    const fillColor = this.config.fill_color || this.config.line_color || "";
    const fillOpacity = Number.isFinite(Number(this.config.fill_opacity))
      ? Number(this.config.fill_opacity)
      : 0.3;

    const area =
      this.config.graph_type === "line"
        ? svg``
        : svg`
            <defs>
              <linearGradient id=${this._gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color=${fillColor || "currentColor"} stop-opacity=${fillOpacity} />
                <stop offset="100%" stop-color=${fillColor || "currentColor"} stop-opacity="0" />
              </linearGradient>
            </defs>
            <path
              class="area"
              d="${line} L ${coords[coords.length - 1].x.toFixed(2)} ${rect.bottom} L ${coords[0].x.toFixed(2)} ${rect.bottom} Z"
              fill="url(#${this._gradientId})"
              style=${fillColor ? `color: ${fillColor}` : ""}
            />
          `;

    return svg`
      ${area}
      <path
        class="line"
        d=${line}
        style="stroke-width: ${lineWidth}${lineColor ? `; stroke: ${lineColor}` : ""}"
      />
    `;
  }

  render() {
    if (!this.config || !this.hass) {
      return html``;
    }

    const stateObj = getState(this.hass, this.config.entity);
    const value = getNumber(this.hass, this.config.entity);
    const unit = getUnit(this.hass, this.config.entity, this.config.unit);
    const precision = Math.max(0, Number(this.config.value_precision) || 0);
    const padding = Number.isFinite(Number(this.config.padding))
      ? Number(this.config.padding)
      : 0;
    const fixedHeight = this._fixedHeight();

    const label =
      this.config.name ||
      (stateObj && stateObj.attributes && stateObj.attributes.friendly_name) ||
      this.config.entity;

    const level = valueLevel(
      value,
      this.config.warning_threshold,
      this.config.danger_threshold
    );
    const valueColor = levelColor(this.config, level) || this.config.value_color || "";

    const labelFontSize = Number(this.config.label_font_size) || 18;
    const valueFontSize = Number(this.config.value_font_size) || 40;
    const unitFontSize = Number(this.config.unit_font_size) || 14;
    const trendFontSize = Number(this.config.trend_font_size) || unitFontSize;
    const trend = this.config.show_trend === false ? null : this._trend();
    const decimalPercent = Number(this.config.decimal_font_size_percent);
    const decimalFontSize =
      Number.isFinite(decimalPercent) && decimalPercent > 0
        ? (valueFontSize * decimalPercent) / 100
        : valueFontSize;
    const valueParts = this._valueParts(
      value !== null ? value.toFixed(precision) : "--"
    );
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
      bottom,
    };

    // <text y> is the alphabetic baseline, so the glyph tops land CAP_RATIO em
    // above it. Keeping the alphabetic baseline (rather than a top-edge one) is
    // what lets the unit and trend sit on the value's baseline instead of
    // floating at its top. With the label hidden the value takes over its slot.
    const showLabel = this.config.show_label !== false;
    const margin = Number.isFinite(Number(this.config.value_margin))
      ? Number(this.config.value_margin)
      : 0;
    const textTop = top + margin;
    const labelY = textTop + labelFontSize * CAP_RATIO;
    const valueTop = showLabel ? textTop + labelFontSize * 1.05 : textTop;
    const valueY = valueTop + valueFontSize * CAP_RATIO;

    return html`
      <ha-card>
        <div
          class="root"
          style="${fixedHeight ? "" : `min-height: ${DEFAULT_HEIGHT}px;`} --sxc-value-weight: ${this.config.value_font_weight || "normal"}"
        >
          <svg viewBox="0 0 ${width} ${height}" width=${width} height=${height}>
            ${showGraph ? this._renderGraph(graphRect) : svg``}
            ${!showLabel
              ? svg``
              : svg`
                <text
                  class="label"
                  x=${left}
                  y=${labelY}
                  style="font-size: ${labelFontSize}px${this.config.label_color ? `; fill: ${this.config.label_color}` : ""}"
                >${label}</text>
              `}
            ${this.config.show_value === false
              ? svg``
              : svg`
                <text class="value" x=${left} y=${valueY}>
                  <tspan
                    style="font-size: ${valueFontSize}px${valueColor ? `; fill: ${valueColor}` : ""}"
                  >${valueParts.whole}</tspan>
                  ${valueParts.fraction
                    ? svg`<tspan
                        class="decimal"
                        style="font-size: ${decimalFontSize}px${valueColor ? `; fill: ${valueColor}` : ""}"
                      >${valueParts.fraction}</tspan>`
                    : svg``}
                  ${this.config.show_unit === false || !unit
                    ? svg``
                    : svg`<tspan
                        class="unit"
                        dx="4"
                        style="font-size: ${unitFontSize}px${this.config.unit_color ? `; fill: ${this.config.unit_color}` : ""}"
                      >${unit}</tspan>`}
                  ${!trend
                    ? svg``
                    : svg`<tspan
                        class="trend"
                        dx="6"
                        style="font-size: ${trendFontSize}px${this._trendColor(trend.direction) ? `; fill: ${this._trendColor(trend.direction)}` : ""}"
                      >${this._trendSymbol(trend.direction)}</tspan>`}
                </text>
              `}
          </svg>
          ${this.config.show_icon === false
            ? ""
            : html`
                <div
                  class="icon"
                  style="top: ${top}px; right: ${padding}px; --mdc-icon-size: ${iconSize}px${this.config.icon_color ? `; color: ${this.config.icon_color}` : ""}"
                >
                  ${this.config.icon
                    ? html`<ha-icon .icon=${this.config.icon}></ha-icon>`
                    : html`<ha-state-icon
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
}

if (!customElements.get("sensor-ex-card")) {
  customElements.define("sensor-ex-card", SensorExCard);
  registerCard({
    type: "sensor-ex-card",
    name: "Sensor Ex Card",
    description:
      "SVG sensor card with label, value, unit and a recorder history graph, with extensive styling options.",
    preview: true,
  });
}
