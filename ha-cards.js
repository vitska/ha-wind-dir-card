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
var VERSION = "3.12.1";
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
var CAP_RATIO = 0.72;
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
  // Splits the plot along time into runs, each covering the stretch where the
  // reading sits in one value_format range, and each drawn in that range's
  // graph_color. Where a segment crosses a boundary it is cut at the exact
  // crossing rather than at the neighbouring sample, so a run starts and ends
  // on its threshold. Returns null when no rule sets a graph_color.
  _bandRuns(points, xOf, yOf, fallback) {
    const rules = Array.isArray(this.config.value_format) ? this.config.value_format : [];
    if (!rules.some((rule) => rule && rule.graph_color)) return null;
    if (points.length < 2) return null;
    const bounds = [
      ...new Set(
        rules.filter(Boolean).flatMap((rule) => [rule.value_from, rule.value_to]).map(Number).filter(Number.isFinite)
      )
    ];
    const colorAt = (value) => {
      const rule = this._matchFormat(value);
      return rule && rule.graph_color || fallback;
    };
    const runs = [];
    let previous = { x: xOf(points[0].t), y: yOf(points[0].v) };
    const add = (color, point) => {
      let run = runs[runs.length - 1];
      if (!run || run.color !== color) {
        run = { color, points: [previous] };
        runs.push(run);
      }
      run.points.push(point);
      previous = point;
    };
    for (let i = 0; i < points.length - 1; i += 1) {
      const a = points[i];
      const b = points[i + 1];
      const lo = Math.min(a.v, b.v);
      const hi = Math.max(a.v, b.v);
      const crossings = bounds.filter((v) => v > lo && v < hi).sort((m, n) => b.v >= a.v ? m - n : n - m);
      const xa = xOf(a.t);
      const xb = xOf(b.t);
      const stops = [a.v, ...crossings, b.v];
      for (let k = 0; k < stops.length - 1; k += 1) {
        const from = stops[k];
        const to = stops[k + 1];
        const color = colorAt((from + to) / 2);
        const t = b.v === a.v ? 1 : (to - a.v) / (b.v - a.v);
        add(color, { x: xa + t * (xb - xa), y: yOf(to) });
      }
    }
    return runs;
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
    const isArea = this.config.graph_type !== "line";
    const runs = this._bandRuns(
      points,
      (t) => rect.left + (t - tMin) / tSpan * (rect.right - rect.left),
      (v) => bottom - (v - min) / (max - min) * (bottom - top),
      lineColor || "var(--accent-color, #58a6ff)"
    );
    if (runs) {
      const pathOf = (pts) => pts.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`).join(" ");
      return svg`
        ${!isArea ? svg`` : runs.map(
        (run) => svg`
                <path
                  class="area"
                  d="${pathOf(run.points)} L ${run.points[run.points.length - 1].x.toFixed(2)} ${rect.bottom} L ${run.points[0].x.toFixed(2)} ${rect.bottom} Z"
                  fill=${run.color}
                  fill-opacity=${fillOpacity}
                />
              `
      )}
        ${runs.map(
        (run) => svg`
            <path
              class="line"
              d=${pathOf(run.points)}
              style="stroke-width: ${lineWidth}; stroke: ${run.color}"
            />
          `
      )}
      `;
    }
    const area = !isArea ? svg`` : svg`
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

// src/distribution-ex-card.js
var DEFAULT_WIDTH2 = 320;
var DEFAULT_BAR_LENGTH = 180;
var PALETTE_LIGHT = [
  "#2a78d6",
  "#eb6834",
  "#1baf7a",
  "#eda100",
  "#e87ba4",
  "#008300",
  "#4a3aa7",
  "#e34948"
];
var PALETTE_DARK = [
  "#3987e5",
  "#d95926",
  "#199e70",
  "#c98500",
  "#d55181",
  "#008300",
  "#9085e9",
  "#e66767"
];
var EDITOR_SCHEMA3 = [
  { name: "title", selector: { text: {} } },
  { name: "unit", selector: { text: {} } },
  {
    name: "decimals",
    selector: { number: { min: 0, max: 3, step: 1, mode: "box" } }
  },
  {
    name: "orientation",
    selector: {
      select: {
        mode: "dropdown",
        options: [
          { value: "horizontal", label: "Horizontal bar" },
          { value: "vertical", label: "Vertical bar" }
        ]
      }
    }
  },
  {
    name: "bar_height",
    selector: { number: { min: 4, max: 200, step: 1, mode: "box" } }
  },
  {
    name: "bar_radius",
    selector: { number: { min: 0, max: 40, step: 1, mode: "box" } }
  },
  {
    name: "bar_gap",
    selector: { number: { min: 0, max: 12, step: 0.5, mode: "box" } }
  },
  { name: "bar_bg_color", selector: { text: {} } },
  { name: "show_values", selector: { boolean: {} } },
  { name: "show_percent", selector: { boolean: {} } },
  {
    name: "segment_label",
    selector: {
      select: {
        mode: "dropdown",
        options: [
          { value: "value", label: "Value" },
          { value: "percent", label: "Percentage" },
          { value: "both", label: "Value and percentage" }
        ]
      }
    }
  },
  {
    name: "value_font_size",
    selector: { number: { min: 6, max: 40, step: 1, mode: "box" } }
  },
  { name: "value_color", selector: { text: {} } },
  {
    name: "unit_font_size",
    selector: { "number": { "min": 4, "max": 40, "step": 1, "mode": "box" } }
  },
  {
    name: "name_column_width",
    selector: { "number": { "min": 0, "max": 200, "step": 2, "mode": "box" } }
  },
  {
    name: "aside_font_size",
    selector: { "number": { "min": 6, "max": 48, "step": 1, "mode": "box" } }
  },
  { name: "show_leaders", selector: { boolean: {} } },
  { name: "leader_color", selector: { text: {} } },
  {
    name: "leader_width",
    selector: { "number": { "min": 0.5, "max": 6, "step": 0.5, "mode": "box" } }
  },
  {
    name: "leader_length",
    selector: { "number": { "min": 0, "max": 80, "step": 1, "mode": "box" } }
  },
  {
    name: "min_label_percent",
    selector: { number: { min: 0, max: 50, step: 1, mode: "box" } }
  },
  { name: "show_total", selector: { boolean: {} } },
  { name: "total_label", selector: { text: {} } },
  {
    name: "total_position",
    selector: {
      select: {
        mode: "dropdown",
        options: [
          { value: "bottom", label: "Bottom (below the legend)" },
          { value: "top", label: "Top (beside the title)" }
        ]
      }
    }
  },
  {
    name: "total_font_size",
    selector: { number: { min: 6, max: 48, step: 1, mode: "box" } }
  },
  { name: "total_color", selector: { text: {} } },
  { name: "show_segment_names", selector: { boolean: {} } },
  { name: "show_legend", selector: { boolean: {} } },
  { name: "show_legend_values", selector: { boolean: {} } },
  { name: "show_legend_percent", selector: { boolean: {} } },
  {
    name: "legend_font_size",
    selector: { number: { min: 6, max: 32, step: 1, mode: "box" } }
  },
  { name: "legend_color", selector: { text: {} } },
  {
    name: "legend_swatch_size",
    selector: { number: { min: 4, max: 32, step: 1, mode: "box" } }
  },
  { name: "title_color", selector: { text: {} } },
  {
    name: "title_font_size",
    selector: { number: { min: 6, max: 40, step: 1, mode: "box" } }
  },
  {
    name: "card_height",
    selector: { number: { min: 40, max: 800, step: 10, mode: "box" } }
  },
  {
    name: "padding",
    selector: { number: { min: 0, max: 64, step: 1, mode: "box" } }
  }
];
var EDITOR_LABELS3 = {
  title: "Card title",
  unit: "Unit override (default: each entity's own unit)",
  decimals: "Value decimal places",
  orientation: "Bar orientation",
  bar_height: "Bar thickness (px)",
  bar_radius: "Bar corner radius (px)",
  bar_gap: "Gap between segments (px)",
  bar_bg_color: "Bar background color",
  show_values: "Show labels on the segments",
  show_percent: "Segment labels show % instead of the value",
  segment_label: "What the segment labels show",
  value_font_size: "Segment label font size (px)",
  value_color: "Segment label color",
  unit_font_size: "Unit font size (px, defaults to the value's size)",
  name_column_width: "Width of the name column beside a vertical bar (px)",
  aside_font_size: "Font size of the labels beside a vertical bar (px)",
  show_leaders: "Draw leader lines from a vertical bar to its labels",
  leader_color: "Leader line color",
  leader_width: "Leader line width (px)",
  leader_length: "Distance from the bar to its labels (px)",
  min_label_percent: "Hide segment labels below this % of the bar",
  show_total: "Show the total",
  total_label: "Total label",
  total_position: "Where the total goes",
  total_font_size: "Total font size (px)",
  total_color: "Total color",
  show_segment_names: "Include names in the labels beside a vertical bar",
  show_legend: "Show legend",
  show_legend_values: "Show values in the legend",
  show_legend_percent: "Show percentages in the legend",
  legend_font_size: "Legend font size (px)",
  legend_color: "Legend text color",
  legend_swatch_size: "Legend swatch size (px)",
  title_color: "Title color",
  title_font_size: "Title font size (px)",
  card_height: "Card height (px, unset = fits its content)",
  padding: "Padding around contents (px)"
};
defineEditor("distribution-ex-card-editor", EDITOR_SCHEMA3, EDITOR_LABELS3);
var DistributionExCard = class extends LitElement2 {
  static get properties() {
    return {
      hass: { attribute: false },
      config: { attribute: false },
      _hidden: { attribute: false },
      _width: { attribute: false },
      _barHeight: { attribute: false }
    };
  }
  constructor() {
    super();
    this._hidden = [];
    this._width = DEFAULT_WIDTH2;
    this._barHeight = DEFAULT_BAR_LENGTH;
    this._clipId = uniqueId("dex-clip");
  }
  static getStubConfig(hass) {
    const states = hass && hass.states || {};
    const entities = Object.keys(states).filter(
      (id) => id.startsWith("sensor.") && states[id].attributes && states[id].attributes.unit_of_measurement && Number.isFinite(parseFloat(states[id].state))
    ).slice(0, 3).map((entity) => ({ entity }));
    return {
      type: "custom:distribution-ex-card",
      entities: entities.length ? entities : [{ entity: "sensor.power" }]
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
      orientation: "horizontal",
      bar_height: 28,
      bar_radius: 4,
      bar_gap: 2,
      show_values: false,
      show_percent: false,
      value_font_size: 11,
      aside_font_size: 16,
      show_leaders: true,
      leader_width: 1,
      leader_length: 12,
      min_label_percent: 8,
      show_total: false,
      total_label: "Total",
      total_position: "bottom",
      total_font_size: 16,
      show_segment_names: true,
      show_legend: true,
      show_legend_values: true,
      show_legend_percent: false,
      legend_font_size: 13,
      legend_swatch_size: 10,
      title_font_size: 16,
      padding: 12,
      ...config
    };
    this._hidden = (config.entities || []).map((raw, index) => ({ raw, index })).filter(({ raw }) => raw && raw.hidden).map(({ index }) => index);
  }
  getCardSize() {
    return 3;
  }
  firstUpdated() {
    const bar = this.renderRoot.querySelector(".bar-wrap");
    if (bar) {
      this._resizeObserver = new ResizeObserver(() => this._measure());
      this._resizeObserver.observe(bar);
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
    const bar = this.renderRoot.querySelector(".bar-wrap");
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    if (rect.width > 0) this._width = rect.width;
    if (rect.height > 0) this._barHeight = rect.height;
  }
  _palette() {
    const custom = this.config.colors;
    if (Array.isArray(custom) && custom.length) return custom;
    const dark = Boolean(this.hass && this.hass.themes && this.hass.themes.darkMode);
    return dark ? PALETTE_DARK : PALETTE_LIGHT;
  }
  _items() {
    const config = this.config;
    const palette = this._palette();
    return (config.entities || []).map((raw, index) => {
      const item = typeof raw === "string" ? { entity: raw } : raw || {};
      const stateObj = getState(this.hass, item.entity);
      let value = getNumber(this.hass, item.entity);
      const magnitude = value === null ? 0 : Math.abs(value);
      return {
        index,
        entity: item.entity,
        value,
        magnitude,
        available: value !== null,
        hidden: this._hidden.includes(index),
        name: item.name || stateObj && stateObj.attributes && stateObj.attributes.friendly_name || item.entity,
        // Colour follows the entity's position in the list, never its rank, so
        // hiding a segment never repaints the survivors.
        color: item.color || palette[index % palette.length],
        decimals: Number.isFinite(Number(item.decimals)) ? Number(item.decimals) : Math.max(0, Number(config.decimals) || 0),
        unit: item.unit || config.unit || getUnit(this.hass, item.entity, void 0, ""),
        displayAbs: item.display_abs !== false
      };
    });
  }
  // Split so the unit can take its own size. _formatValue stays whole for
  // tooltips and the legend's plain text.
  _valueParts(item) {
    if (!item.available) return { value: "--", unit: "" };
    const shown = item.displayAbs ? Math.abs(item.value) : item.value;
    return { value: shown.toFixed(item.decimals), unit: item.unit || "" };
  }
  _totalParts(items, total) {
    const config = this.config;
    const decimals = Math.max(0, Number(config.decimals) || 0);
    const unit = config.unit || (items.find((i) => !i.hidden && i.unit) || items.find((i) => i.unit) || {}).unit || "";
    return { value: total.toFixed(decimals), unit };
  }
  _unitFontSize(valueFontSize) {
    const size = Number(this.config.unit_font_size);
    return Number.isFinite(size) && size > 0 ? size : valueFontSize;
  }
  // value and unit as two tspans, so the unit can be sized independently while
  // still flowing straight after the number.
  _valueTspans(parts, valueFontSize, extraStyle) {
    const unitSize = this._unitFontSize(valueFontSize);
    return svg`<tspan
        class="aside-value"
        style="font-size: ${valueFontSize}px${extraStyle || ""}"
      >${parts.value}</tspan>${parts.unit ? svg`<tspan class="aside-unit" dx="3" style="font-size: ${unitSize}px">${parts.unit}</tspan>` : svg``}`;
  }
  _formatValue(item) {
    if (!item.available) return "--";
    const shown = item.displayAbs ? Math.abs(item.value) : item.value;
    return `${shown.toFixed(item.decimals)}${item.unit ? ` ${item.unit}` : ""}`;
  }
  // segment_label supersedes the older show_percent flag, which stays
  // supported so existing configs keep working.
  _labelMode() {
    const mode = this.config.segment_label;
    if (mode === "value" || mode === "percent" || mode === "both") return mode;
    return this.config.show_percent ? "percent" : "value";
  }
  // The total follows whatever is currently visible, so hiding a slice in the
  // legend updates it too.
  _formatTotal(items, total) {
    const config = this.config;
    const decimals = Math.max(0, Number(config.decimals) || 0);
    const unit = config.unit || (items.find((i) => !i.hidden && i.unit) || items.find((i) => i.unit) || {}).unit || "";
    return `${total.toFixed(decimals)}${unit ? ` ${unit}` : ""}`;
  }
  _toggle(index) {
    this._hidden = this._hidden.includes(index) ? this._hidden.filter((i) => i !== index) : [...this._hidden, index];
  }
  _moreInfo(entityId) {
    if (!entityId) return;
    fireEvent(this, "hass-more-info", { entityId });
  }
  _renderBar(items, total) {
    const config = this.config;
    const vertical = config.orientation === "vertical";
    const thickness = Number(config.bar_height) || 28;
    const radius = Math.min(
      Number.isFinite(Number(config.bar_radius)) ? Number(config.bar_radius) : 4,
      thickness / 2
    );
    const gap = Number.isFinite(Number(config.bar_gap)) ? Number(config.bar_gap) : 2;
    const visible = items.filter((i) => !i.hidden && i.magnitude > 0);
    const mode = this._labelMode();
    const valueFontSize = Number(config.value_font_size) || 11;
    const minLabel = Number.isFinite(Number(config.min_label_percent)) ? Number(config.min_label_percent) : 8;
    if (!vertical) {
      return this._renderHorizontal({
        length: this._width,
        thickness,
        radius,
        gap,
        visible,
        total,
        mode,
        valueFontSize,
        minLabel
      });
    }
    return this._renderVertical({
      thickness,
      radius,
      gap,
      visible,
      items,
      total,
      mode,
      valueFontSize,
      minLabel
    });
  }
  // The bar hugs the left edge; each slice is called out to a label column on
  // the right by a bracket, and the total hangs off the bottom of the bar on
  // its own leader so it reads as the sum of what sits above it.
  _renderVertical({ thickness, radius, gap, visible, items, total, mode, valueFontSize, minLabel }) {
    const config = this.config;
    const asideFontSize = Number(config.aside_font_size) || 16;
    const showLeaders = config.show_leaders !== false;
    const leaderLength = Number.isFinite(Number(config.leader_length)) ? Number(config.leader_length) : 12;
    const leaderColor = config.leader_color || config.value_color || "var(--primary-text-color, #fff)";
    const leaderWidth = Number(config.leader_width) || 1;
    const bracketX1 = thickness + 3;
    const bracketX2 = bracketX1 + (showLeaders ? 5 : 0);
    const labelX = bracketX2 + (showLeaders ? leaderLength : 6) + 4;
    const namesShown = config.show_segment_names !== false;
    const written = [
      ...namesShown ? visible.map((item) => item.name) : [],
      config.total_label
    ].filter((text) => text !== void 0 && text !== null && text !== "");
    const longest = written.reduce(
      (max, text) => Math.max(max, String(text).length),
      0
    );
    const nameColumn = Number.isFinite(Number(config.name_column_width)) ? Number(config.name_column_width) : longest ? longest * asideFontSize * 0.58 + 8 : 0;
    const valueX = labelX + nameColumn;
    const textX = namesShown ? labelX : valueX;
    const width = this._width;
    const height = this._barHeight;
    const totalRow = config.show_total ? asideFontSize * 1.9 : 0;
    const length = Math.max(10, height - totalRow);
    const totalY = length + totalRow / 2;
    const hasAside = mode !== "percent";
    const hasInside = mode !== "value";
    const showName = config.show_segment_names !== false;
    let offset = 0;
    const segments = visible.map((item) => {
      const share = total > 0 ? item.magnitude / total : 0;
      const size = share * length;
      const start = offset;
      offset += size;
      const drawn = Math.max(0, size - (visible.length > 1 ? gap : 0));
      return {
        item,
        start,
        drawn,
        percent: share * 100,
        valueText: this._formatValue(item),
        percentText: `${(share * 100).toFixed(0)}%`
      };
    });
    return svg`
      <svg
        viewBox="0 0 ${width} ${height}"
        width=${width}
        height=${height}
        role="img"
        aria-label=${config.title || "Distribution"}
      >
        <defs>
          <clipPath id=${this._clipId}>
            <rect x="0" y="0" width=${thickness} height=${length} rx=${radius} ry=${radius} />
          </clipPath>
        </defs>
        <g clip-path="url(#${this._clipId})">
          <rect
            x="0" y="0" width=${thickness} height=${length}
            fill=${config.bar_bg_color || "var(--divider-color, rgba(127,127,127,0.25))"}
          />
          ${segments.map(({ item, start, drawn }) => svg`
            <rect
              class="segment"
              x="0" y=${start} width=${thickness} height=${drawn}
              fill=${item.color}
              @click=${() => this._moreInfo(item.entity)}
            ><title>${item.name}: ${this._formatValue(item)}</title></rect>
          `)}
        </g>
        ${config.show_values === false ? svg`` : segments.map(({ item, start, drawn, percent, valueText, percentText }) => {
      if (percent < minLabel || drawn <= 0) return svg``;
      const mid = start + drawn / 2;
      return svg`
                ${hasInside && drawn >= valueFontSize * 1.3 ? svg`
                    <text
                      class="segment-label"
                      x=${thickness / 2} y=${mid}
                      text-anchor="middle" dominant-baseline="central"
                      style="font-size: ${valueFontSize}px${config.value_color ? `; fill: ${config.value_color}` : ""}"
                    >${percentText}</text>
                  ` : svg``}
                ${hasAside && showLeaders ? svg`
                    <path
                      class="leader"
                      d="M ${bracketX1} ${start} L ${bracketX2} ${start} L ${bracketX2} ${start + drawn} L ${bracketX1} ${start + drawn} M ${bracketX2} ${mid} L ${textX - 4} ${mid}"
                      fill="none"
                      stroke=${leaderColor}
                      stroke-width=${leaderWidth}
                    />
                  ` : svg``}
                ${hasAside ? svg`
                    ${namesShown ? svg`
                        <text
                          class="aside-name"
                          x=${labelX} y=${mid}
                          text-anchor="start" dominant-baseline="central"
                          style="font-size: ${asideFontSize}px"
                          @click=${() => this._moreInfo(item.entity)}
                        >${item.name}</text>
                      ` : svg``}
                    <text
                      class="segment-aside"
                      x=${valueX} y=${mid}
                      text-anchor="start" dominant-baseline="central"
                      @click=${() => this._moreInfo(item.entity)}
                    >${this._valueTspans(
        this._valueParts(item),
        asideFontSize,
        config.value_color ? `; fill: ${config.value_color}` : ""
      )}</text>
                  ` : svg``}
              `;
    })}
        ${config.show_total ? svg`
            ${showLeaders ? svg`
                <path
                  class="leader"
                  d="M ${bracketX2} ${length} L ${bracketX2} ${totalY} L ${(config.total_label ? labelX : valueX) - 4} ${totalY}"
                  fill="none"
                  stroke=${leaderColor}
                  stroke-width=${leaderWidth}
                />
              ` : svg``}
            ${config.total_label ? svg`
                <text
                  class="aside-name total-aside"
                  x=${labelX} y=${totalY}
                  text-anchor="start" dominant-baseline="central"
                  style="font-size: ${asideFontSize}px"
                >${config.total_label}</text>
              ` : svg``}
            <text
              class="segment-aside total-aside"
              x=${valueX} y=${totalY}
              text-anchor="start" dominant-baseline="central"
            >${this._valueTspans(
      this._totalParts(items, total),
      asideFontSize,
      config.total_color ? `; fill: ${config.total_color}` : ""
    )}</text>
          ` : svg``}
      </svg>
    `;
  }
  _renderHorizontal({ length, thickness, radius, gap, visible, total, mode, valueFontSize, minLabel }) {
    const config = this.config;
    const width = length;
    const height = thickness;
    let offset = 0;
    const segments = visible.map((item) => {
      const share = total > 0 ? item.magnitude / total : 0;
      const size = share * length;
      const start = offset;
      offset += size;
      const drawn = Math.max(0, size - (visible.length > 1 ? gap : 0));
      const percent = share * 100;
      const percentText = `${percent.toFixed(0)}%`;
      return { item, start, drawn, percent, percentText, parts: this._valueParts(item) };
    });
    return svg`
      <svg
        viewBox="0 0 ${width} ${height}"
        width=${width}
        height=${height}
        role="img"
        aria-label=${config.title || "Distribution"}
      >
        <defs>
          <clipPath id=${this._clipId}>
            <rect x="0" y="0" width=${width} height=${height} rx=${radius} ry=${radius} />
          </clipPath>
        </defs>
        <g clip-path="url(#${this._clipId})">
          <rect
            x="0" y="0" width=${width} height=${height}
            fill=${config.bar_bg_color || "var(--divider-color, rgba(127,127,127,0.25))"}
          />
          ${segments.map(({ item, start, drawn }) => svg`
            <rect
              class="segment"
              x=${start} y="0" width=${drawn} height=${height}
              fill=${item.color}
              @click=${() => this._moreInfo(item.entity)}
            ><title>${item.name}: ${this._formatValue(item)}</title></rect>
          `)}
        </g>
        ${config.show_values === false ? svg`` : segments.map(({ start, drawn, percent, percentText, parts }) => {
      if (percent < minLabel || drawn <= 0) return svg``;
      const unitSize = this._unitFontSize(valueFontSize);
      const colour = config.value_color ? `; fill: ${config.value_color}` : "";
      return svg`
                <text
                  class="segment-label"
                  x=${start + drawn / 2} y=${height / 2}
                  text-anchor="middle" dominant-baseline="central"
                  style="font-size: ${valueFontSize}px${colour}"
                >${mode === "percent" ? svg`${percentText}` : svg`<tspan style="font-size: ${valueFontSize}px">${parts.value}</tspan>${parts.unit ? svg`<tspan dx="3" style="font-size: ${unitSize}px">${parts.unit}</tspan>` : svg``}${mode === "both" ? svg`<tspan dx="4" style="font-size: ${unitSize}px">\u00b7 ${percentText}</tspan>` : svg``}`}</text>
              `;
    })}
      </svg>
    `;
  }
  render() {
    if (!this.config || !this.hass) {
      return html2``;
    }
    const config = this.config;
    const items = this._items();
    const total = items.filter((i) => !i.hidden).reduce((sum, i) => sum + i.magnitude, 0);
    const padding = Number.isFinite(Number(config.padding)) ? Number(config.padding) : 12;
    const legendFontSize = Number(config.legend_font_size) || 13;
    const swatch = Number(config.legend_swatch_size) || 10;
    return html2`
      <ha-card>
        <div class="root" style="padding: ${padding}px">
          ${config.title || config.show_total && config.total_position === "top" ? html2`<div class="header">
                ${config.title ? html2`<div
                      class="title"
                      style="font-size: ${Number(config.title_font_size) || 16}px${config.title_color ? `; color: ${config.title_color}` : ""}"
                    >${config.title}</div>` : html2`<span></span>`}
                ${config.show_total && config.total_position === "top" ? html2`<div
                      class="total"
                      style="font-size: ${Number(config.total_font_size) || 16}px${config.total_color ? `; color: ${config.total_color}` : ""}"
                    >
                      ${config.total_label ? html2`<span class="total-label">${config.total_label}</span>` : ""}
                      <span class="total-value">${this._formatTotal(items, total)}</span>
                    </div>` : ""}
              </div>` : ""}
          <div class="bar-wrap ${config.orientation === "vertical" ? "vertical" : ""}">
            ${this._renderBar(items, total)}
          </div>
          ${config.show_legend === false ? "" : html2`
                <div
                  class="legend"
                  style="font-size: ${legendFontSize}px${config.legend_color ? `; color: ${config.legend_color}` : ""}"
                >
                  ${items.map(
      (item) => html2`
                      <button
                        class="legend-item ${item.hidden ? "off" : ""}"
                        @click=${() => this._toggle(item.index)}
                        title=${item.hidden ? "Show" : "Hide"}
                      >
                        <span
                          class="swatch"
                          style="background: ${item.color}; width: ${swatch}px; height: ${swatch}px"
                        ></span>
                        <span class="legend-name">${item.name}</span>
                        ${config.show_legend_values === false ? "" : html2`<span class="legend-value"
                              >${this._valueParts(item).value}${this._valueParts(item).unit ? html2`<span
                                    class="legend-unit"
                                    style="font-size: ${this._unitFontSize(legendFontSize)}px"
                                    >${this._valueParts(item).unit}</span
                                  >` : ""}</span
                            >`}
                        ${config.show_legend_percent && total > 0 ? html2`<span class="legend-value"
                              >${(item.magnitude / total * 100).toFixed(0)}%</span
                            >` : ""}
                      </button>
                    `
    )}
                </div>
              `}
          ${config.show_total && config.total_position !== "top" && config.orientation !== "vertical" ? html2`<div
                class="total total-bottom"
                style="font-size: ${Number(config.total_font_size) || 16}px${config.total_color ? `; color: ${config.total_color}` : ""}"
              >
                ${config.total_label ? html2`<span class="total-label">${config.total_label}</span>` : ""}
                <span class="total-value">${this._formatTotal(items, total)}</span>
              </div>` : ""}
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
      }
      .root {
        box-sizing: border-box;
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 12px;
      }
      .title {
        color: var(--primary-text-color, #fff);
        font-weight: 500;
      }
      .total {
        color: var(--primary-text-color, #fff);
        white-space: nowrap;
      }
      .total-label {
        color: var(--secondary-text-color, #9e9e9e);
        margin-right: 6px;
      }
      /* A rule and a spread-out label/value read as a sum line, rather than as
         one more unexplained number floating near the title. */
      .total-bottom {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 12px;
        margin-top: auto;
        padding-top: 8px;
        border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
      }
      .total-value {
        font-weight: 700;
      }
      .bar-wrap {
        width: 100%;
      }
      .bar-wrap svg {
        display: block;
        width: 100%;
        height: auto;
      }
      .bar-wrap.vertical {
        flex: 1;
        min-height: 0;
      }
      .bar-wrap.vertical svg {
        width: 100%;
        height: 100%;
      }
      .segment {
        cursor: pointer;
      }
      /* Labels wear a text token, not the series colour - the segment fill
         beside them already carries identity. */
      .segment-label {
        fill: #fff;
        font-weight: 600;
        pointer-events: none;
      }
      .segment-aside {
        cursor: pointer;
      }
      .aside-name {
        fill: var(--secondary-text-color, #9e9e9e);
        cursor: pointer;
      }
      .aside-value {
        fill: var(--primary-text-color, #fff);
        font-weight: 600;
      }
      .aside-percent {
        fill: var(--secondary-text-color, #9e9e9e);
      }
      .legend {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 14px;
        color: var(--secondary-text-color, #9e9e9e);
      }
      .legend-item {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: none;
        border: none;
        padding: 2px 0;
        margin: 0;
        font: inherit;
        color: inherit;
        cursor: pointer;
      }
      .legend-item.off {
        opacity: 0.4;
      }
      .legend-item.off .legend-name {
        text-decoration: line-through;
      }
      .swatch {
        display: inline-block;
        border-radius: 2px;
        flex: none;
      }
      .legend-value {
        color: var(--primary-text-color, #fff);
        font-weight: 600;
      }
      .legend-unit {
        margin-left: 3px;
        font-weight: 400;
      }
      .aside-unit {
        fill: var(--primary-text-color, #fff);
        font-weight: 400;
      }
    `;
  }
};
if (!customElements.get("distribution-ex-card")) {
  customElements.define("distribution-ex-card", DistributionExCard);
  registerCard({
    type: "distribution-ex-card",
    name: "Distribution Ex Card",
    description: "Compare numeric entities as a segmented bar with a toggleable legend, drawn in SVG.",
    preview: true
  });
}

// src/ha-cards.js
console.info(
  `%c SVG CARDS %c ${VERSION} `,
  "color: white; background: #1f6feb; font-weight: 700;",
  "color: #1f6feb; background: white; font-weight: 700;"
);
