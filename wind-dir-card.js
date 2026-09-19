import {
  LitElement,
  html,
  css,
  svg,
} from "https://unpkg.com/lit-element@3.3.3/lit-element.js?module";

const CENTER = 100;
const RING_OUTER = 92;
const TICK_MINOR_INNER = 82;
const TICK_MAJOR_INNER = 72;
const CARDINAL_LABEL_R = 62;
const SECTOR_INNER = 58;
const SECTOR_OUTER = 78;
const CENTER_CIRCLE_R = 54;
const ARROW_HEAD_R = 80;
const ARROW_TAIL_R = 32;
const ARROW_HEAD_SIZE = 9;

function toRad(deg) {
  return ((deg - 90) * Math.PI) / 180;
}

function polar(deg, r) {
  const rad = toRad(deg);
  return [CENTER + r * Math.cos(rad), CENTER + r * Math.sin(rad)];
}

function arcPath(startDeg, endDeg, rInner, rOuter) {
  const large = ((endDeg - startDeg + 360) % 360) > 180 ? 1 : 0;
  const [x1, y1] = polar(startDeg, rOuter);
  const [x2, y2] = polar(endDeg, rOuter);
  const [x3, y3] = polar(endDeg, rInner);
  const [x4, y4] = polar(startDeg, rInner);
  return [
    `M ${x1} ${y1}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${x4} ${y4}`,
    "Z",
  ].join(" ");
}

function normalizeDeg(deg) {
  return ((deg % 360) + 360) % 360;
}

function fireEvent(node, type, detail) {
  node.dispatchEvent(
    new CustomEvent(type, {
      detail,
      bubbles: true,
      composed: true,
    })
  );
}

const EDITOR_SCHEMA = [
  { name: "name", selector: { text: {} } },
  { name: "wind_direction_entity", selector: { entity: {} } },
  { name: "wind_speed_entity", selector: { entity: {} } },
  { name: "wind_gust_entity", selector: { entity: {} } },
  { name: "wind_direction_avg_entity", selector: { entity: {} } },
  {
    name: "sector_width",
    selector: { number: { min: 0, max: 180, step: 1, mode: "box" } },
  },
  { name: "sector_color", selector: { text: {} } },
  {
    name: "sector_opacity",
    selector: { number: { min: 0, max: 1, step: 0.05, mode: "box" } },
  },
  { name: "scale_color", selector: { text: {} } },
  { name: "arrow_color", selector: { text: {} } },
  { name: "speed_unit", selector: { text: {} } },
  {
    name: "show_speed_unit",
    selector: { boolean: {} },
  },
  {
    name: "speed_precision",
    selector: { number: { min: 0, max: 3, step: 1, mode: "box" } },
  },
  {
    name: "gust_precision",
    selector: { number: { min: 0, max: 3, step: 1, mode: "box" } },
  },
  {
    name: "speed_font_size",
    selector: { number: { min: 8, max: 60, step: 1, mode: "box" } },
  },
  {
    name: "gust_font_size",
    selector: { number: { min: 6, max: 40, step: 1, mode: "box" } },
  },
  { name: "center_bg_color", selector: { text: {} } },
  {
    name: "center_bg_opacity",
    selector: { number: { min: 0, max: 1, step: 0.05, mode: "box" } },
  },
  {
    name: "show_gust_unit",
    selector: { boolean: {} },
  },
  {
    name: "arrow_size",
    selector: { number: { min: 0.5, max: 1.5, step: 0.05, mode: "box" } },
  },
  {
    name: "arrow_type",
    selector: {
      select: {
        mode: "dropdown",
        options: [
          { value: "arrow", label: "Arrow (shaft + head + tail circle)" },
          { value: "needle", label: "Needle (diamond)" },
          { value: "line", label: "Line (shaft + small head)" },
        ],
      },
    },
  },
  {
    name: "arrow_shadow",
    selector: { boolean: {} },
  },
  { name: "arrow_shadow_color", selector: { text: {} } },
  {
    name: "arrow_shadow_offset",
    selector: { number: { min: -10, max: 10, step: 0.5, mode: "box" } },
  },
  { name: "color_normal", selector: { text: {} } },
  { name: "color_warning", selector: { text: {} } },
  { name: "color_danger", selector: { text: {} } },
  {
    name: "speed_warning_threshold",
    selector: { number: { min: 0, max: 500, step: 0.1, mode: "box" } },
  },
  {
    name: "speed_danger_threshold",
    selector: { number: { min: 0, max: 500, step: 0.1, mode: "box" } },
  },
  {
    name: "gust_warning_threshold",
    selector: { number: { min: 0, max: 500, step: 0.1, mode: "box" } },
  },
  {
    name: "gust_danger_threshold",
    selector: { number: { min: 0, max: 500, step: 0.1, mode: "box" } },
  },
  {
    name: "padding",
    selector: { number: { min: 0, max: 64, step: 1, mode: "box" } },
  },
];

const EDITOR_LABELS = {
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
  padding: "Padding around dial (px, 0 = fill tile)",
};

class WindDirCardEditor extends LitElement {
  static get properties() {
    return {
      hass: { attribute: false },
      _config: { attribute: false },
    };
  }

  setConfig(config) {
    this._config = { ...config };
  }

  _computeLabel = (schema) => EDITOR_LABELS[schema.name] || schema.name;

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
        .schema=${EDITOR_SCHEMA}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }
}

customElements.define("wind-dir-card-editor", WindDirCardEditor);

class WindDirCard extends LitElement {
  static get properties() {
    return {
      hass: { attribute: false },
      config: { attribute: false },
    };
  }

  static getStubConfig(hass) {
    const states = (hass && hass.states) || {};
    const ids = Object.keys(states);
    const find = (needles) =>
      ids.find((id) => needles.every((n) => id.toLowerCase().includes(n)));

    return {
      type: "custom:wind-dir-card",
      wind_direction_entity:
        find(["wind", "direction"]) && !find(["wind", "direction", "avg"])
          ? find(["wind", "direction"])
          : "sensor.wind_direction",
      wind_speed_entity: find(["wind", "speed"]) || "sensor.wind_speed",
      wind_gust_entity: find(["wind", "gust"]) || "sensor.wind_gust",
      wind_direction_avg_entity:
        find(["wind", "direction", "avg"]) || "sensor.wind_direction_avg",
      name: "Wind",
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
      ...config,
    };
  }

  constructor() {
    super();
    const uid = Math.random().toString(36).slice(2);
    this._gradientId = `wdc-center-gradient-${uid}`;
    this._shadowId = `wdc-arrow-shadow-${uid}`;
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
    // Fallback for engines that don't honor CSS aspect-ratio inside grid/flex.
    const supportsAspectRatio =
      typeof CSS !== "undefined" && CSS.supports && CSS.supports("aspect-ratio: 1 / 1");
    if (supportsAspectRatio) {
      wrapper.style.height = "";
      return;
    }
    wrapper.style.height = `${wrapper.offsetWidth}px`;
  }

  _getState(entityId) {
    if (!entityId || !this.hass) return undefined;
    return this.hass.states[entityId];
  }

  _getNumber(entityId) {
    const state = this._getState(entityId);
    if (!state) return null;
    const value = parseFloat(state.state);
    return Number.isFinite(value) ? value : null;
  }

  _getUnit(entityId, fallback) {
    const state = this._getState(entityId);
    return (
      this.config.speed_unit ||
      (state && state.attributes && state.attributes.unit_of_measurement) ||
      fallback ||
      ""
    );
  }

  _valueLevel(value, warningThreshold, dangerThreshold) {
    if (value === null) return "normal";
    const hasDanger =
      dangerThreshold !== undefined && dangerThreshold !== null && dangerThreshold !== "";
    const hasWarning =
      warningThreshold !== undefined && warningThreshold !== null && warningThreshold !== "";
    if (hasDanger && value >= Number(dangerThreshold)) return "danger";
    if (hasWarning && value >= Number(warningThreshold)) return "warning";
    return "normal";
  }

  _levelColor(level) {
    if (level === "danger") return this.config.color_danger || "#ff4136";
    if (level === "warning") return this.config.color_warning || "#ffa600";
    return this.config.color_normal || "";
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
      { deg: 270, text: "W" },
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
    const opacity = Number.isFinite(Number(this.config.sector_opacity))
      ? Number(this.config.sector_opacity)
      : 0.35;
    const style = [color ? `fill: ${color}` : "", `opacity: ${opacity}`]
      .filter(Boolean)
      .join("; ");
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
    // Symmetric needle: the tail dot's outer edge reaches the same distance
    // from the centre as the arrowhead's tip, which also keeps it clear of
    // the centre backdrop that is drawn over the arrow.
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

    // Filter lives on an outer group so the shadow offset stays in screen
    // space; on the rotating group it would swing around with the needle.
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
      return html``;
    }

    const direction = this._getNumber(this.config.wind_direction_entity);
    const avgDirection = this.config.wind_direction_avg_entity
      ? this._getNumber(this.config.wind_direction_avg_entity)
      : null;
    const speed = this._getNumber(this.config.wind_speed_entity);
    const gust = this.config.wind_gust_entity
      ? this._getNumber(this.config.wind_gust_entity)
      : null;
    const speedUnit = this._getUnit(this.config.wind_speed_entity);
    const gustUnit = this._getUnit(this.config.wind_gust_entity, speedUnit);
    const speedPrecision = Math.max(0, Number(this.config.speed_precision) || 0);
    const gustPrecision = Math.max(0, Number(this.config.gust_precision) || 0);
    const padding = Number.isFinite(Number(this.config.padding))
      ? Number(this.config.padding)
      : 8;
    const scaleColor = this.config.scale_color || "";
    const arrowColor = this.config.arrow_color || "";
    const arrowSize = Number(this.config.arrow_size) || 1;
    const arrowType = this.config.arrow_type || "arrow";
    const arrowShadow = this.config.arrow_shadow === true;
    const arrowShadowColor = this.config.arrow_shadow_color || "#000";
    const arrowShadowOffset = Number.isFinite(Number(this.config.arrow_shadow_offset))
      ? Number(this.config.arrow_shadow_offset)
      : 1.5;
    const showSpeedUnit = this.config.show_speed_unit !== false;
    const showGustUnit = this.config.show_gust_unit !== false;
    const speedFontSize = Number(this.config.speed_font_size) || 32;
    const gustFontSize = Number(this.config.gust_font_size) || 10;
    const centerBgColor =
      this.config.center_bg_color || "var(--secondary-background-color, #2a2a2a)";
    const centerBgOpacity = Number.isFinite(Number(this.config.center_bg_opacity))
      ? Number(this.config.center_bg_opacity)
      : 0.55;
    const speedColor = this._levelColor(
      this._valueLevel(speed, this.config.speed_warning_threshold, this.config.speed_danger_threshold)
    );
    const gustColor = this._levelColor(
      this._valueLevel(gust, this.config.gust_warning_threshold, this.config.gust_danger_threshold)
    );

    const unavailable = direction === null && speed === null;

    return html`
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
              <circle
                cx=${CENTER}
                cy=${CENTER}
                r=${CENTER_CIRCLE_R}
                class="center-circle"
                fill="url(#${this._gradientId})"
              />
              ${this._renderArrow(direction, arrowColor, arrowSize, arrowType, arrowShadow)}
              <text
                x=${CENTER}
                y=${CENTER - 6}
                text-anchor="middle"
                class="speed-value"
                style="font-size: ${speedFontSize}px${speedColor ? `; fill: ${speedColor}` : ""}"
              >
                ${speed !== null ? speed.toFixed(speedPrecision) : "--"}
              </text>
              ${showSpeedUnit && speed !== null
                ? svg`
                  <text x=${CENTER} y=${CENTER + 16} text-anchor="middle" class="speed-unit">
                    ${speedUnit}
                  </text>
                `
                : svg``}
              ${gust !== null
                ? svg`
                  <text
                    x=${CENTER}
                    y=${CENTER + 34}
                    text-anchor="middle"
                    class="gust-value"
                    style="font-size: ${gustFontSize}px${gustColor ? `; fill: ${gustColor}` : ""}"
                  >
                    ${gust.toFixed(gustPrecision)}${showGustUnit ? ` ${gustUnit}` : ""}
                  </text>
                `
                : svg``}
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
}

customElements.define("wind-dir-card", WindDirCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "wind-dir-card",
  name: "Wind Direction Card",
  description:
    "SVG compass showing momentary wind direction, average direction sector, speed and gusts.",
  preview: true,
});
