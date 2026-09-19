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
const TAIL_CIRCLE_R = 4.5;

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
      sector_width: 30,
      speed_precision: 0,
      gust_precision: 0,
      padding: 8,
      ...config,
    };
  }

  getCardSize() {
    return 4;
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

  _renderTicks() {
    const ticks = [];
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
        />
      `);
    }
    return ticks;
  }

  _renderCardinalLabels() {
    const labels = [
      { deg: 0, text: "N" },
      { deg: 90, text: "E" },
      { deg: 180, text: "S" },
      { deg: 270, text: "W" },
    ];
    return labels.map(({ deg, text }) => {
      const [x, y] = polar(deg, CARDINAL_LABEL_R);
      return svg`
        <text x=${x} y=${y} class="cardinal-label" text-anchor="middle" dominant-baseline="central">
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
    return svg`
      <path
        d=${arcPath(start, end, SECTOR_INNER, SECTOR_OUTER)}
        class="sector"
        style=${color ? `fill: ${color}` : ""}
      />
    `;
  }

  _renderArrow(directionDeg) {
    if (directionDeg === null) {
      return svg``;
    }
    const tipX = CENTER;
    const tipY = CENTER - ARROW_HEAD_R;
    const tailX = CENTER;
    const tailY = CENTER + ARROW_TAIL_R;
    const headBaseY = CENTER - (ARROW_HEAD_R - ARROW_HEAD_SIZE);
    return svg`
      <g class="arrow" transform="rotate(${directionDeg} ${CENTER} ${CENTER})">
        <line x1=${tailX} y1=${tailY} x2=${CENTER} y2=${headBaseY} class="arrow-shaft" />
        <polygon
          points="${CENTER},${tipY} ${CENTER - ARROW_HEAD_SIZE},${headBaseY} ${CENTER + ARROW_HEAD_SIZE},${headBaseY}"
          class="arrow-head"
        />
        <circle cx=${tailX} cy=${tailY} r=${TAIL_CIRCLE_R} class="arrow-tail" />
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

    const unavailable = direction === null && speed === null;

    return html`
      <ha-card .header=${this.config.name}>
        <div class="card-content" style="padding: ${padding}px">
          <div class="dial-wrapper ${unavailable ? "unavailable" : ""}">
            <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">
              <circle cx=${CENTER} cy=${CENTER} r=${RING_OUTER} class="ring-bg" />
              ${this._renderTicks()}
              ${this._renderCardinalLabels()}
              ${this._renderSector(avgDirection)}
              <polygon
                points="${CENTER - 4},${CENTER - RING_OUTER - 2} ${CENTER + 4},${CENTER - RING_OUTER - 2} ${CENTER},${CENTER - RING_OUTER + 6}"
                class="north-marker"
              />
              <circle cx=${CENTER} cy=${CENTER} r=${CENTER_CIRCLE_R} class="center-circle" />
              ${this._renderArrow(direction)}
              <text x=${CENTER} y=${CENTER - 6} text-anchor="middle" class="speed-value">
                ${speed !== null ? speed.toFixed(speedPrecision) : "--"}
              </text>
              <text x=${CENTER} y=${CENTER + 16} text-anchor="middle" class="speed-unit">
                ${speed !== null ? speedUnit : ""}
              </text>
              ${gust !== null
                ? svg`
                  <text x=${CENTER} y=${CENTER + 34} text-anchor="middle" class="gust-value">
                    gusts ${gust.toFixed(gustPrecision)} ${gustUnit}
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
      .center-circle {
        fill: var(--secondary-background-color, #2a2a2a);
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
        fill: none;
        stroke: var(--primary-text-color, #fff);
        stroke-width: 2.5;
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
