// Generated from src/ha-cards.js by build.sh - do not edit directly.

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
var VERSION = "2.7.0";
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

// src/wind-dir-card.js
var CENTER = 100;
var RING_OUTER = 92;
var TICK_MINOR_INNER = 82;
var TICK_MAJOR_INNER = 72;
var CARDINAL_LABEL_R = 62;
var SECTOR_INNER = 58;
var SECTOR_OUTER = 78;
var CENTER_CIRCLE_R = 54;
var ARROW_HEAD_R = 80;
var ARROW_TAIL_R = 32;
var ARROW_HEAD_SIZE = 9;
function toRad(deg) {
  return (deg - 90) * Math.PI / 180;
}
function polar(deg, r) {
  const rad = toRad(deg);
  return [CENTER + r * Math.cos(rad), CENTER + r * Math.sin(rad)];
}
function arcPath(startDeg, endDeg, rInner, rOuter) {
  const large = (endDeg - startDeg + 360) % 360 > 180 ? 1 : 0;
  const [x1, y1] = polar(startDeg, rOuter);
  const [x2, y2] = polar(endDeg, rOuter);
  const [x3, y3] = polar(endDeg, rInner);
  const [x4, y4] = polar(startDeg, rInner);
  return [
    `M ${x1} ${y1}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${x4} ${y4}`,
    "Z"
  ].join(" ");
}
function normalizeDeg(deg) {
  return (deg % 360 + 360) % 360;
}
var EDITOR_SCHEMA = [
  { name: "name", selector: { text: {} } },
  { name: "wind_direction_entity", selector: { entity: {} } },
  { name: "wind_speed_entity", selector: { entity: {} } },
  { name: "wind_gust_entity", selector: { entity: {} } },
  { name: "wind_direction_avg_entity", selector: { entity: {} } },
  {
    name: "sector_width",
    selector: { number: { min: 0, max: 180, step: 1, mode: "box" } }
  },
  { name: "sector_color", selector: { text: {} } },
  {
    name: "sector_opacity",
    selector: { number: { min: 0, max: 1, step: 0.05, mode: "box" } }
  },
  { name: "scale_color", selector: { text: {} } },
  { name: "arrow_color", selector: { text: {} } },
  { name: "speed_unit", selector: { text: {} } },
  {
    name: "show_speed_unit",
    selector: { boolean: {} }
  },
  {
    name: "speed_precision",
    selector: { number: { min: 0, max: 3, step: 1, mode: "box" } }
  },
  {
    name: "gust_precision",
    selector: { number: { min: 0, max: 3, step: 1, mode: "box" } }
  },
  {
    name: "speed_font_size",
    selector: { number: { min: 8, max: 60, step: 1, mode: "box" } }
  },
  {
    name: "gust_font_size",
    selector: { number: { min: 6, max: 40, step: 1, mode: "box" } }
  },
  { name: "center_bg_color", selector: { text: {} } },
  {
    name: "center_bg_opacity",
    selector: { number: { min: 0, max: 1, step: 0.05, mode: "box" } }
  },
  {
    name: "show_gust_unit",
    selector: { boolean: {} }
  },
  {
    name: "arrow_size",
    selector: { number: { min: 0.5, max: 1.5, step: 0.05, mode: "box" } }
  },
  {
    name: "arrow_type",
    selector: {
      select: {
        mode: "dropdown",
        options: [
          { value: "arrow", label: "Arrow (shaft + head + tail circle)" },
          { value: "needle", label: "Needle (diamond)" },
          { value: "line", label: "Line (shaft + small head)" }
        ]
      }
    }
  },
  {
    name: "arrow_shadow",
    selector: { boolean: {} }
  },
  { name: "arrow_shadow_color", selector: { text: {} } },
  {
    name: "arrow_shadow_offset",
    selector: { number: { min: -10, max: 10, step: 0.5, mode: "box" } }
  },
  { name: "color_normal", selector: { text: {} } },
  { name: "color_warning", selector: { text: {} } },
  { name: "color_danger", selector: { text: {} } },
  {
    name: "speed_warning_threshold",
    selector: { number: { min: 0, max: 500, step: 0.1, mode: "box" } }
  },
  {
    name: "speed_danger_threshold",
    selector: { number: { min: 0, max: 500, step: 0.1, mode: "box" } }
  },
  {
    name: "gust_warning_threshold",
    selector: { number: { min: 0, max: 500, step: 0.1, mode: "box" } }
  },
  {
    name: "gust_danger_threshold",
    selector: { number: { min: 0, max: 500, step: 0.1, mode: "box" } }
  },
  {
    name: "padding",
    selector: { number: { min: 0, max: 64, step: 1, mode: "box" } }
  }
];
var EDITOR_LABELS = {
  name: "Card name",
  wind_direction_entity: "Wind direction entity",
  wind_speed_entity: "Wind speed entity",
  wind_gust_entity: "Wind gust entity (optional)",
  wind_direction_avg_entity: "Average wind direction entity (optional)",
  sector_width: "Average direction sector width (degrees)",
  sector_color: "Sector overlay color (CSS color, optional)",
  sector_opacity: "Sector overlay opacity (0-1)",
  scale_color: "Scale/ticks color (CSS color, optional)",
  arrow_color: "Direction arrow color (CSS color, optional)",
  speed_unit: "Speed/gust unit override (optional)",
  show_speed_unit: "Show speed unit",
  speed_precision: "Speed decimal places",
  gust_precision: "Gust decimal places",
  speed_font_size: "Speed value font size (px)",
  gust_font_size: "Gust label font size (px)",
  center_bg_color: "Center background color (CSS color, optional)",
  center_bg_opacity: "Center background opacity (0-1)",
  show_gust_unit: "Show gust unit",
  arrow_size: "Arrow size (scale, 1 = default)",
  arrow_type: "Arrow type",
  arrow_shadow: "Show arrow drop shadow",
  arrow_shadow_color: "Arrow shadow color (CSS color, optional)",
  arrow_shadow_offset: "Arrow shadow vertical offset (px)",
  color_normal: "Normal value color (CSS color, optional)",
  color_warning: "Warning value color (default orange)",
  color_danger: "Danger value color (default red)",
  speed_warning_threshold: "Speed warning threshold (optional)",
  speed_danger_threshold: "Speed danger threshold (optional)",
  gust_warning_threshold: "Gust warning threshold (optional)",
  gust_danger_threshold: "Gust danger threshold (optional)",
  padding: "Padding around dial (px, 0 = fill tile)"
};
defineEditor("wind-dir-card-editor", EDITOR_SCHEMA, EDITOR_LABELS);
var WindDirCard = class extends LitElement2 {
  static get properties() {
    return {
      hass: { attribute: false },
      config: { attribute: false }
    };
  }
  static getStubConfig(hass) {
    const states = hass && hass.states || {};
    const ids = Object.keys(states);
    const find = (needles) => ids.find((id) => needles.every((n) => id.toLowerCase().includes(n)));
    return {
      type: "custom:wind-dir-card",
      wind_direction_entity: find(["wind", "direction"]) && !find(["wind", "direction", "avg"]) ? find(["wind", "direction"]) : "sensor.wind_direction",
      wind_speed_entity: find(["wind", "speed"]) || "sensor.wind_speed",
      wind_gust_entity: find(["wind", "gust"]) || "sensor.wind_gust",
      wind_direction_avg_entity: find(["wind", "direction", "avg"]) || "sensor.wind_direction_avg",
      name: "Wind"
    };
  }
  setConfig(config) {
    if (!config.wind_direction_entity) {
      throw new Error("wind_direction_entity is required");
    }
    if (!config.wind_speed_entity) {
      throw new Error("wind_speed_entity is required");
    }
    this.config = {
      sector_width: 60,
      sector_opacity: 0.35,
      speed_precision: 1,
      gust_precision: 1,
      sector_color: "red",
      scale_color: "white",
      arrow_color: "white",
      color_normal: "white",
      color_warning: "yellow",
      color_danger: "red",
      speed_warning_threshold: 3,
      speed_danger_threshold: 4,
      gust_warning_threshold: 3,
      gust_danger_threshold: 4,
      show_speed_unit: false,
      show_gust_unit: false,
      speed_font_size: 40,
      gust_font_size: 30,
      center_bg_color: "#222222",
      center_bg_opacity: 0.9,
      arrow_size: 1.25,
      arrow_type: "arrow",
      arrow_shadow: true,
      arrow_shadow_offset: 2,
      arrow_shadow_color: "black",
      padding: 0,
      ...config
    };
  }
  constructor() {
    super();
    this._gradientId = uniqueId("wdc-center-gradient");
    this._shadowId = uniqueId("wdc-arrow-shadow");
  }
  getCardSize() {
    return 4;
  }
  static getConfigElement() {
    return document.createElement("wind-dir-card-editor");
  }
  firstUpdated() {
    this._resizeObserver = new ResizeObserver(() => this._syncSquare());
    const wrapper = this.renderRoot.querySelector(".dial-wrapper");
    if (wrapper) {
      this._resizeObserver.observe(wrapper);
      this._syncSquare();
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }
  }
  _syncSquare() {
    const wrapper = this.renderRoot.querySelector(".dial-wrapper");
    if (!wrapper) return;
    const supportsAspectRatio = typeof CSS !== "undefined" && CSS.supports && CSS.supports("aspect-ratio: 1 / 1");
    if (supportsAspectRatio) {
      wrapper.style.height = "";
      return;
    }
    wrapper.style.height = `${wrapper.offsetWidth}px`;
  }
  _getState(entityId) {
    return getState(this.hass, entityId);
  }
  _getNumber(entityId) {
    return getNumber(this.hass, entityId);
  }
  _getUnit(entityId, fallback) {
    return getUnit(this.hass, entityId, this.config.speed_unit, fallback);
  }
  _valueLevel(value, warningThreshold, dangerThreshold) {
    return valueLevel(value, warningThreshold, dangerThreshold);
  }
  _levelColor(level) {
    return levelColor(this.config, level);
  }
  _renderTicks(scaleColor) {
    const ticks = [];
    const style = scaleColor ? `stroke: ${scaleColor}` : "";
    for (let deg = 0; deg < 360; deg += 5) {
      const isCardinal = deg % 90 === 0;
      const isMajor = deg % 30 === 0;
      const inner = isCardinal || isMajor ? TICK_MAJOR_INNER : TICK_MINOR_INNER;
      const [x1, y1] = polar(deg, inner);
      const [x2, y2] = polar(deg, RING_OUTER);
      ticks.push(svg`
        <line
          x1=${x1} y1=${y1} x2=${x2} y2=${y2}
          class=${isCardinal ? "tick tick--cardinal" : isMajor ? "tick tick--major" : "tick tick--minor"}
          style=${style}
        />
      `);
    }
    return ticks;
  }
  _renderCardinalLabels(scaleColor) {
    const labels = [
      { deg: 0, text: "N" },
      { deg: 90, text: "E" },
      { deg: 180, text: "S" },
      { deg: 270, text: "W" }
    ];
    const style = scaleColor ? `fill: ${scaleColor}` : "";
    return labels.map(({ deg, text }) => {
      const [x, y] = polar(deg, CARDINAL_LABEL_R);
      return svg`
        <text x=${x} y=${y} class="cardinal-label" text-anchor="middle" dominant-baseline="central" style=${style}>
          ${text}
        </text>
      `;
    });
  }
  _renderSector(avgDeg) {
    if (avgDeg === null) return svg``;
    const width = Number(this.config.sector_width) || 30;
    const start = normalizeDeg(avgDeg - width / 2);
    const end = normalizeDeg(avgDeg + width / 2);
    const color = this.config.sector_color;
    const opacity = Number.isFinite(Number(this.config.sector_opacity)) ? Number(this.config.sector_opacity) : 0.35;
    const style = [color ? `fill: ${color}` : "", `opacity: ${opacity}`].filter(Boolean).join("; ");
    return svg`
      <path
        d=${arcPath(start, end, SECTOR_INNER, SECTOR_OUTER)}
        class="sector"
        style=${style}
      />
    `;
  }
  _renderArrow(directionDeg, arrowColor, arrowSize, arrowType, arrowShadow) {
    if (directionDeg === null) {
      return svg``;
    }
    const scale = Number.isFinite(arrowSize) && arrowSize > 0 ? arrowSize : 1;
    const headR = Math.min(RING_OUTER - 4, ARROW_HEAD_R * scale);
    const headSize = ARROW_HEAD_SIZE * scale;
    const shaftWidth = 3 * scale;
    const tailCircleR = headSize;
    const tailR = headR - tailCircleR;
    const shortTailR = ARROW_TAIL_R * scale;
    const tipY = CENTER - headR;
    const tailY = CENTER + tailR;
    const shortTailY = CENTER + shortTailR;
    const headBaseY = CENTER - (headR - headSize);
    const strokeStyle = arrowColor ? `stroke: ${arrowColor}` : "";
    const fillStyle = arrowColor ? `fill: ${arrowColor}` : "";
    let shape;
    if (arrowType === "needle") {
      const widthAtCenter = headSize * 1.4;
      shape = svg`
        <polygon
          points="${CENTER},${tipY} ${CENTER + widthAtCenter},${CENTER} ${CENTER},${CENTER + shortTailR * 0.6} ${CENTER - widthAtCenter},${CENTER}"
          class="arrow-head"
          style=${fillStyle}
        />
      `;
    } else if (arrowType === "line") {
      shape = svg`
        <line x1=${CENTER} y1=${shortTailY} x2=${CENTER} y2=${headBaseY} class="arrow-shaft" style="${strokeStyle}; stroke-width: ${shaftWidth}" />
        <polygon
          points="${CENTER},${tipY} ${CENTER - headSize},${headBaseY} ${CENTER + headSize},${headBaseY}"
          class="arrow-head"
          style=${fillStyle}
        />
      `;
    } else {
      shape = svg`
        <line x1=${CENTER} y1=${tailY} x2=${CENTER} y2=${headBaseY} class="arrow-shaft" style="${strokeStyle}; stroke-width: ${shaftWidth}" />
        <polygon
          points="${CENTER},${tipY} ${CENTER - headSize},${headBaseY} ${CENTER + headSize},${headBaseY}"
          class="arrow-head"
          style=${fillStyle}
        />
        <circle cx=${CENTER} cy=${tailY} r=${tailCircleR} class="arrow-tail" style=${fillStyle} />
      `;
    }
    return svg`
      <g filter=${arrowShadow ? `url(#${this._shadowId})` : ""}>
        <g class="arrow" transform="rotate(${directionDeg} ${CENTER} ${CENTER})">
          ${shape}
        </g>
      </g>
    `;
  }
  render() {
    if (!this.config || !this.hass) {
      return html2``;
    }
    const direction = this._getNumber(this.config.wind_direction_entity);
    const avgDirection = this.config.wind_direction_avg_entity ? this._getNumber(this.config.wind_direction_avg_entity) : null;
    const speed = this._getNumber(this.config.wind_speed_entity);
    const gust = this.config.wind_gust_entity ? this._getNumber(this.config.wind_gust_entity) : null;
    const speedUnit = this._getUnit(this.config.wind_speed_entity);
    const gustUnit = this._getUnit(this.config.wind_gust_entity, speedUnit);
    const speedPrecision = Math.max(0, Number(this.config.speed_precision) || 0);
    const gustPrecision = Math.max(0, Number(this.config.gust_precision) || 0);
    const padding = Number.isFinite(Number(this.config.padding)) ? Number(this.config.padding) : 8;
    const scaleColor = this.config.scale_color || "";
    const arrowColor = this.config.arrow_color || "";
    const arrowSize = Number(this.config.arrow_size) || 1;
    const arrowType = this.config.arrow_type || "arrow";
    const arrowShadow = this.config.arrow_shadow === true;
    const arrowShadowColor = this.config.arrow_shadow_color || "#000";
    const arrowShadowOffset = Number.isFinite(Number(this.config.arrow_shadow_offset)) ? Number(this.config.arrow_shadow_offset) : 1.5;
    const showSpeedUnit = this.config.show_speed_unit !== false;
    const showGustUnit = this.config.show_gust_unit !== false;
    const speedFontSize = Number(this.config.speed_font_size) || 32;
    const gustFontSize = Number(this.config.gust_font_size) || 10;
    const centerBgColor = this.config.center_bg_color || "var(--secondary-background-color, #2a2a2a)";
    const centerBgOpacity = Number.isFinite(Number(this.config.center_bg_opacity)) ? Number(this.config.center_bg_opacity) : 0.55;
    const speedColor = this._levelColor(
      this._valueLevel(speed, this.config.speed_warning_threshold, this.config.speed_danger_threshold)
    );
    const gustColor = this._levelColor(
      this._valueLevel(gust, this.config.gust_warning_threshold, this.config.gust_danger_threshold)
    );
    const unavailable = direction === null && speed === null;
    return html2`
      <ha-card .header=${this.config.name}>
        <div class="card-content" style="padding: ${padding}px">
          <div class="dial-wrapper ${unavailable ? "unavailable" : ""}">
            <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">
              <defs>
                <radialGradient id=${this._gradientId} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color=${centerBgColor} stop-opacity=${centerBgOpacity} />
                  <stop offset="85%" stop-color=${centerBgColor} stop-opacity=${centerBgOpacity} />
                  <stop offset="100%" stop-color=${centerBgColor} stop-opacity="0" />
                </radialGradient>
                <filter id=${this._shadowId} x="-60%" y="-60%" width="220%" height="220%">
                  <feDropShadow
                    dx="0"
                    dy=${arrowShadowOffset}
                    stdDeviation="1.8"
                    flood-color=${arrowShadowColor}
                    flood-opacity="0.5"
                  />
                </filter>
              </defs>
              <circle cx=${CENTER} cy=${CENTER} r=${RING_OUTER} class="ring-bg" />
              ${this._renderSector(avgDirection)}
              ${this._renderTicks(scaleColor)}
              ${this._renderCardinalLabels(scaleColor)}
              <polygon
                points="${CENTER - 4},${CENTER - RING_OUTER - 2} ${CENTER + 4},${CENTER - RING_OUTER - 2} ${CENTER},${CENTER - RING_OUTER + 6}"
                class="north-marker"
                style=${scaleColor ? `fill: ${scaleColor}` : ""}
              />
              ${this._renderArrow(direction, arrowColor, arrowSize, arrowType, arrowShadow)}
              <circle
                cx=${CENTER}
                cy=${CENTER}
                r=${CENTER_CIRCLE_R}
                class="center-circle"
                fill="url(#${this._gradientId})"
              />
              <text
                x=${CENTER}
                y=${CENTER - 6}
                text-anchor="middle"
                class="speed-value"
                style="font-size: ${speedFontSize}px${speedColor ? `; fill: ${speedColor}` : ""}"
              >
                ${speed !== null ? speed.toFixed(speedPrecision) : "--"}
              </text>
              ${showSpeedUnit && speed !== null ? svg`
                  <text x=${CENTER} y=${CENTER + 16} text-anchor="middle" class="speed-unit">
                    ${speedUnit}
                  </text>
                ` : svg``}
              ${gust !== null ? svg`
                  <text
                    x=${CENTER}
                    y=${CENTER + 34}
                    text-anchor="middle"
                    class="gust-value"
                    style="font-size: ${gustFontSize}px${gustColor ? `; fill: ${gustColor}` : ""}"
                  >
                    ${gust.toFixed(gustPrecision)}${showGustUnit ? ` ${gustUnit}` : ""}
                  </text>
                ` : svg``}
            </svg>
          </div>
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
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        padding: 0;
      }
      .card-content {
        flex: 1;
        display: flex;
        box-sizing: border-box;
        min-height: 0;
        min-width: 0;
      }
      .dial-wrapper {
        position: relative;
        width: 100%;
        max-width: 100%;
        aspect-ratio: 1 / 1;
        margin: 0 auto;
        flex: 1;
        min-height: 0;
      }
      .dial-wrapper.unavailable {
        opacity: 0.5;
      }
      svg {
        width: 100%;
        height: 100%;
        display: block;
      }
      .ring-bg {
        fill: var(--card-background-color, #1c1c1c);
        stroke: var(--divider-color, #3a3a3a);
        stroke-width: 1;
      }
      .tick {
        stroke: var(--secondary-text-color, #8a8a8a);
      }
      .tick--minor {
        stroke-width: 1;
        opacity: 0.5;
      }
      .tick--major {
        stroke-width: 1.5;
        opacity: 0.8;
      }
      .tick--cardinal {
        stroke: var(--primary-text-color, #fff);
        stroke-width: 2;
      }
      .cardinal-label {
        fill: var(--primary-text-color, #fff);
        font-size: 14px;
        font-weight: 600;
      }
      .north-marker {
        fill: var(--secondary-text-color, #8a8a8a);
      }
      .sector {
        fill: var(--accent-color, #58a6ff);
        opacity: 0.35;
      }
      .arrow-shaft {
        stroke: var(--primary-text-color, #fff);
        stroke-width: 3;
        stroke-linecap: round;
      }
      .arrow-head {
        fill: var(--primary-text-color, #fff);
      }
      .arrow-tail {
        fill: var(--primary-text-color, #fff);
      }
      .arrow {
        transition: transform 0.5s ease;
      }
      .sector {
        transition: transform 0.5s ease;
      }
      .speed-value {
        fill: var(--primary-text-color, #fff);
        font-size: 32px;
        font-weight: 700;
      }
      .speed-unit {
        fill: var(--secondary-text-color, #b0b0b0);
        font-size: 13px;
      }
      .gust-value {
        fill: var(--secondary-text-color, #b0b0b0);
        font-size: 10px;
      }
    `;
  }
};
if (!customElements.get("wind-dir-card")) {
  customElements.define("wind-dir-card", WindDirCard);
  registerCard({
    type: "wind-dir-card",
    name: "Wind Direction Card",
    description: "SVG compass showing momentary wind direction, average direction sector, speed and gusts.",
    preview: true
  });
}

// src/sensor-ex-card.js
var DEFAULT_WIDTH = 300;
var DEFAULT_HEIGHT = 120;
var MAX_POINTS = 100;
var EDITOR_SCHEMA2 = [
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
var EDITOR_LABELS2 = {
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
defineEditor("sensor-ex-card-editor", EDITOR_SCHEMA2, EDITOR_LABELS2);
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
    const area = this.config.graph_type === "line" ? svg`` : svg`
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
    const valueColor = levelColor(this.config, level) || this.config.value_color || "";
    const labelFontSize = Number(this.config.label_font_size) || 18;
    const valueFontSize = Number(this.config.value_font_size) || 40;
    const unitFontSize = Number(this.config.unit_font_size) || 14;
    const trendFontSize = Number(this.config.trend_font_size) || unitFontSize;
    const trend = this.config.show_trend === false ? null : this._trend();
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
    const labelY = top + labelFontSize * 0.8;
    const valueTop = showLabel ? top + labelFontSize * 1.1 : top;
    const valueY = valueTop + valueFontSize * 0.8;
    return html2`
      <ha-card>
        <div class="root" style=${fixedHeight ? "" : `min-height: ${DEFAULT_HEIGHT}px`}>
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
                <text class="value" x=${left} y=${valueY}>
                  <tspan
                    style="font-size: ${valueFontSize}px${valueColor ? `; fill: ${valueColor}` : ""}"
                  >${value !== null ? value.toFixed(precision) : "--"}</tspan>
                  ${this.config.show_unit === false || !unit ? svg`` : svg`<tspan
                        class="unit"
                        dx="4"
                        style="font-size: ${unitFontSize}px${this.config.unit_color ? `; fill: ${this.config.unit_color}` : ""}"
                      >${unit}</tspan>`}
                  ${!trend ? svg`` : svg`<tspan
                        class="trend"
                        dx="6"
                        style="font-size: ${trendFontSize}px${this._trendColor(trend.direction) ? `; fill: ${this._trendColor(trend.direction)}` : ""}"
                      >${this._trendSymbol(trend.direction)}</tspan>`}
                </text>
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
      }
      .icon {
        position: absolute;
        color: var(--state-icon-color, var(--secondary-text-color, #9e9e9e));
        line-height: 0;
      }
      .label {
        fill: var(--secondary-text-color, #9e9e9e);
      }
      .value {
        fill: var(--primary-text-color, #fff);
        font-weight: 700;
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

// src/distribution-ex-card.js
var DEFAULT_WIDTH2 = 320;
var DEFAULT_HEIGHT2 = 260;
var NODE_DEFAULTS = {
  solar: { icon: "mdi:solar-power", color: "#ff9800", name: "Solar" },
  grid: { icon: "mdi:transmission-tower", color: "#488fc2", name: "Grid" },
  battery: { icon: "mdi:battery", color: "#4caf50", name: "Battery" },
  home: { icon: "mdi:home", color: "#9e9e9e", name: "Home" }
};
var ROLES = {
  solar: { node: "solar", directional: false },
  home: { node: "home", directional: false },
  grid: { node: "grid", directional: false, signed: ["grid_import", "grid_export"] },
  battery: {
    node: "battery",
    directional: false,
    signed: ["battery_discharge", "battery_charge"]
  },
  grid_import: { node: "grid", directional: true },
  grid_export: { node: "grid", directional: true },
  battery_charge: { node: "battery", directional: true },
  battery_discharge: { node: "battery", directional: true }
};
var ROLE_PATTERNS = [
  ["battery_discharge", /discharg|bat\w*[_ -]?out/],
  ["battery_charge", /charg|bat\w*[_ -]?in\b/],
  ["grid_export", /export|sell|feed[_ -]?in|to[_ -]?grid|delivery/],
  ["grid_import", /import|buy|from[_ -]?grid|purchas/],
  // "pv" needs explicit separators: \b won't fire in sensor.pv_power, since
  // underscore counts as a word character.
  ["solar", /solar|(?:^|[^a-z])pv(?:[^a-z]|$)|photovolt|produc|yield/],
  ["battery", /batt/],
  ["grid", /grid|mains|utility/],
  ["home", /home|house|load|consum|usage/]
];
function inferRole(entityId, name) {
  const haystack = `${entityId || ""} ${name || ""}`.toLowerCase();
  for (const [role, pattern] of ROLE_PATTERNS) {
    if (pattern.test(haystack)) return role;
  }
  return null;
}
var EDITOR_SCHEMA3 = [
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
  { name: "show_flow_labels", selector: { boolean: {} } },
  {
    name: "flow_label_font_size",
    selector: { number: { min: 6, max: 32, step: 1, mode: "box" } }
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
var EDITOR_LABELS3 = {
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
  padding: "Padding around contents (px)"
};
defineEditor("distribution-ex-card-editor", EDITOR_SCHEMA3, EDITOR_LABELS3);
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
    this._width = DEFAULT_WIDTH2;
    this._height = DEFAULT_HEIGHT2;
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
    const hasList = Array.isArray(config.entities) && config.entities.length > 0;
    const hasFixed = [
      "solar_entity",
      "grid_entity",
      "grid_import_entity",
      "grid_export_entity",
      "battery_entity",
      "battery_charge_entity",
      "battery_discharge_entity",
      "home_entity"
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
      ...list.map((raw) => typeof raw === "string" ? raw : raw && raw.entity),
      this.config.solar_entity,
      this.config.grid_entity,
      this.config.grid_import_entity,
      this.config.grid_export_entity,
      this.config.battery_entity,
      this.config.battery_charge_entity,
      this.config.battery_discharge_entity,
      this.config.home_entity
    ];
    for (const entityId of candidates) {
      const unit = entityId ? getUnit(this.hass, entityId, void 0, "") : "";
      if (unit) return unit;
    }
    return "";
  }
  _flows() {
    const { roles, nodeMeta } = this._collectRoles();
    const solar = roles.solar.value;
    const solarToGrid = roles.grid_export.value;
    const solarToBattery = roles.battery_charge.value;
    const solarToHome = Math.max(0, solar - solarToGrid - solarToBattery);
    const gridToHome = roles.grid_import.value;
    const batteryToHome = roles.battery_discharge.value;
    const home = roles.home.present ? roles.home.value : solarToHome + gridToHome + batteryToHome;
    const line = (id, from, to, value, role) => ({
      id,
      from,
      to,
      value,
      label: roles[role].meta.name,
      color: roles[role].meta.color
    });
    return {
      nodeMeta,
      present: {
        solar: roles.solar.present,
        grid: roles.grid_import.present || roles.grid_export.present,
        battery: roles.battery_charge.present || roles.battery_discharge.present,
        home: true
      },
      totals: {
        solar,
        grid: gridToHome - solarToGrid,
        battery: batteryToHome - solarToBattery,
        home
      },
      lines: [
        line("solar-home", "solar", "home", solarToHome, "solar"),
        line("solar-grid", "solar", "grid", solarToGrid, "grid_export"),
        line("solar-battery", "solar", "battery", solarToBattery, "battery_charge"),
        line("grid-home", "grid", "home", gridToHome, "grid_import"),
        line("battery-home", "battery", "home", batteryToHome, "battery_discharge")
      ]
    };
  }
  _nodeProp(node, key, nodeMeta) {
    return this.config[`${node}_${key}`] || nodeMeta && nodeMeta[node] && nodeMeta[node][key] || NODE_DEFAULTS[node][key];
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
          y: quad(from.y, from.y, to.y - r)
        };
      case "solar-battery":
        return {
          x: quad(from.x + r, to.x, to.x),
          y: quad(from.y, from.y, to.y - r)
        };
      case "grid-home":
        return {
          x: quad(from.x, from.x, to.x - r),
          y: quad(from.y + r, to.y, to.y)
        };
      case "battery-home":
        return {
          x: quad(from.x, from.x, to.x + r),
          y: quad(from.y + r, to.y, to.y)
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
          >${this._nodeProp(node, "name", nodeMeta)}</text>
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
    const unit = this.config.unit || this._resolveUnit();
    const iconSize = Number(this.config.icon_size) || 24;
    return html2`
      <ha-card>
        <div
          class="root"
          style=${Number(this.config.card_height) > 0 ? "" : `min-height: ${DEFAULT_HEIGHT2}px`}
        >
          <svg viewBox="0 0 ${this._width} ${this._height}">
            ${lines.map(
      (line) => this._renderLine(line, geo, maxValue, flows.nodeMeta)
    )}
            ${nodes.map(
      (node) => this._renderNode(node, geo, flows.totals[node], unit, flows.nodeMeta)
    )}
          </svg>
          ${this.config.show_icons === false ? "" : nodes.map(
      (node) => html2`
                  <div
                    class="icon"
                    style="left: ${geo.nodes[node].x}px; top: ${geo.nodes[node].y}px; --mdc-icon-size: ${iconSize}px; color: ${this._nodeColor(
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

// src/ha-cards.js
console.info(
  `%c SVG CARDS %c ${VERSION} `,
  "color: white; background: #1f6feb; font-weight: 700;",
  "color: #1f6feb; background: white; font-weight: 700;"
);
