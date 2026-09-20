import {
  LitElement,
  html,
  css,
  svg,
  defineEditor,
  fireEvent,
  getNumber,
  getState,
  getUnit,
  registerCard,
  uniqueId,
} from "./shared.js";

const DEFAULT_WIDTH = 320;

// Validated categorical palette, fixed order, never cycled. Light and dark are
// the same eight hues stepped for their own surface, not an automatic flip.
// Both columns pass the lightness, chroma, CVD-separation and normal-vision
// checks on the adjacent pairlist that a segmented bar uses.
const PALETTE_LIGHT = [
  "#2a78d6", "#eb6834", "#1baf7a", "#eda100",
  "#e87ba4", "#008300", "#4a3aa7", "#e34948",
];
const PALETTE_DARK = [
  "#3987e5", "#d95926", "#199e70", "#c98500",
  "#d55181", "#008300", "#9085e9", "#e66767",
];

const EDITOR_SCHEMA = [
  { name: "title", selector: { text: {} } },
  { name: "unit", selector: { text: {} } },
  {
    name: "decimals",
    selector: { number: { min: 0, max: 3, step: 1, mode: "box" } },
  },
  {
    name: "orientation",
    selector: {
      select: {
        mode: "dropdown",
        options: [
          { value: "horizontal", label: "Horizontal bar" },
          { value: "vertical", label: "Vertical bar" },
        ],
      },
    },
  },
  {
    name: "bar_height",
    selector: { number: { min: 4, max: 200, step: 1, mode: "box" } },
  },
  {
    name: "bar_radius",
    selector: { number: { min: 0, max: 40, step: 1, mode: "box" } },
  },
  {
    name: "bar_gap",
    selector: { number: { min: 0, max: 12, step: 0.5, mode: "box" } },
  },
  { name: "bar_bg_color", selector: { text: {} } },
  { name: "show_values", selector: { boolean: {} } },
  { name: "show_percent", selector: { boolean: {} } },
  {
    name: "value_font_size",
    selector: { number: { min: 6, max: 40, step: 1, mode: "box" } },
  },
  { name: "value_color", selector: { text: {} } },
  {
    name: "min_label_percent",
    selector: { number: { min: 0, max: 50, step: 1, mode: "box" } },
  },
  { name: "show_legend", selector: { boolean: {} } },
  { name: "show_legend_values", selector: { boolean: {} } },
  { name: "show_legend_percent", selector: { boolean: {} } },
  {
    name: "legend_font_size",
    selector: { number: { min: 6, max: 32, step: 1, mode: "box" } },
  },
  { name: "legend_color", selector: { text: {} } },
  {
    name: "legend_swatch_size",
    selector: { number: { min: 4, max: 32, step: 1, mode: "box" } },
  },
  { name: "title_color", selector: { text: {} } },
  {
    name: "title_font_size",
    selector: { number: { min: 6, max: 40, step: 1, mode: "box" } },
  },
  {
    name: "card_height",
    selector: { number: { min: 40, max: 800, step: 10, mode: "box" } },
  },
  {
    name: "padding",
    selector: { number: { min: 0, max: 64, step: 1, mode: "box" } },
  },
];

const EDITOR_LABELS = {
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
  value_font_size: "Segment label font size (px)",
  value_color: "Segment label color",
  min_label_percent: "Hide segment labels below this % of the bar",
  show_legend: "Show legend",
  show_legend_values: "Show values in the legend",
  show_legend_percent: "Show percentages in the legend",
  legend_font_size: "Legend font size (px)",
  legend_color: "Legend text color",
  legend_swatch_size: "Legend swatch size (px)",
  title_color: "Title color",
  title_font_size: "Title font size (px)",
  card_height: "Card height (px, unset = fits its content)",
  padding: "Padding around contents (px)",
};

defineEditor("distribution-ex-card-editor", EDITOR_SCHEMA, EDITOR_LABELS);

class DistributionExCard extends LitElement {
  static get properties() {
    return {
      hass: { attribute: false },
      config: { attribute: false },
      _hidden: { attribute: false },
      _width: { attribute: false },
    };
  }

  constructor() {
    super();
    this._hidden = [];
    this._width = DEFAULT_WIDTH;
    this._clipId = uniqueId("dex-clip");
  }

  static getStubConfig(hass) {
    const states = (hass && hass.states) || {};
    const entities = Object.keys(states)
      .filter(
        (id) =>
          id.startsWith("sensor.") &&
          states[id].attributes &&
          states[id].attributes.unit_of_measurement &&
          Number.isFinite(parseFloat(states[id].state))
      )
      .slice(0, 3)
      .map((entity) => ({ entity }));
    return {
      type: "custom:distribution-ex-card",
      entities: entities.length ? entities : [{ entity: "sensor.power" }],
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
      min_label_percent: 8,
      show_legend: true,
      show_legend_values: true,
      show_legend_percent: false,
      legend_font_size: 13,
      legend_swatch_size: 10,
      title_font_size: 16,
      padding: 12,
      ...config,
    };
    this._hidden = (config.entities || [])
      .map((raw, index) => ({ raw, index }))
      .filter(({ raw }) => raw && raw.hidden)
      .map(({ index }) => index);
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
      this._resizeObserver = undefined;
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
      // A proportional bar can't show a negative slice, so take magnitude
      // unless the user explicitly wants the signed number in the labels.
      const magnitude = value === null ? 0 : Math.abs(value);

      return {
        index,
        entity: item.entity,
        value,
        magnitude,
        available: value !== null,
        hidden: this._hidden.includes(index),
        name:
          item.name ||
          (stateObj && stateObj.attributes && stateObj.attributes.friendly_name) ||
          item.entity,
        // Colour follows the entity's position in the list, never its rank, so
        // hiding a segment never repaints the survivors.
        color: item.color || palette[index % palette.length],
        decimals: Number.isFinite(Number(item.decimals))
          ? Number(item.decimals)
          : Math.max(0, Number(config.decimals) || 0),
        unit:
          item.unit || config.unit || getUnit(this.hass, item.entity, undefined, ""),
        displayAbs: item.display_abs !== false,
      };
    });
  }

  _formatValue(item) {
    if (!item.available) return "--";
    const shown = item.displayAbs ? Math.abs(item.value) : item.value;
    return `${shown.toFixed(item.decimals)}${item.unit ? ` ${item.unit}` : ""}`;
  }

  _toggle(index) {
    this._hidden = this._hidden.includes(index)
      ? this._hidden.filter((i) => i !== index)
      : [...this._hidden, index];
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
    const length = vertical ? Number(config.card_height) || 160 : this._width;

    const width = vertical ? thickness : length;
    const height = vertical ? length : thickness;
    const visible = items.filter((i) => !i.hidden && i.magnitude > 0);

    const valueFontSize = Number(config.value_font_size) || 11;
    const minLabel = Number.isFinite(Number(config.min_label_percent))
      ? Number(config.min_label_percent)
      : 8;

    let offset = 0;
    const segments = visible.map((item) => {
      const share = total > 0 ? item.magnitude / total : 0;
      const size = share * length;
      const start = offset;
      offset += size;
      // The gap is carved out of each segment rather than added between them,
      // so the segments still sum to exactly the bar's length.
      const drawn = Math.max(0, size - (visible.length > 1 ? gap : 0));
      const percent = share * 100;
      const label = config.show_percent
        ? `${percent.toFixed(0)}%`
        : this._formatValue(item);
      return { item, start, size, drawn, percent, label, valueFontSize, minLabel };
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
          ${segments.map(({ item, start, drawn }) =>
            vertical
              ? svg`
                <rect
                  class="segment"
                  x="0" y=${start} width=${width} height=${drawn}
                  fill=${item.color}
                  @click=${() => this._moreInfo(item.entity)}
                ><title>${item.name}: ${this._formatValue(item)}</title></rect>
              `
              : svg`
                <rect
                  class="segment"
                  x=${start} y="0" width=${drawn} height=${height}
                  fill=${item.color}
                  @click=${() => this._moreInfo(item.entity)}
                ><title>${item.name}: ${this._formatValue(item)}</title></rect>
              `
          )}
        </g>
        ${config.show_values === false
          ? svg``
          : segments.map(({ item, start, drawn, percent, label }) =>
              percent < minLabel || drawn <= 0
                ? svg``
                : svg`
                  <text
                    class="segment-label"
                    x=${vertical ? width / 2 : start + drawn / 2}
                    y=${vertical ? start + drawn / 2 : height / 2}
                    text-anchor="middle"
                    dominant-baseline="central"
                    style="font-size: ${valueFontSize}px${config.value_color ? `; fill: ${config.value_color}` : ""}"
                  >${label}</text>
                `
            )}
      </svg>
    `;
  }

  render() {
    if (!this.config || !this.hass) {
      return html``;
    }

    const config = this.config;
    const items = this._items();
    const total = items
      .filter((i) => !i.hidden)
      .reduce((sum, i) => sum + i.magnitude, 0);
    const padding = Number.isFinite(Number(config.padding)) ? Number(config.padding) : 12;
    const legendFontSize = Number(config.legend_font_size) || 13;
    const swatch = Number(config.legend_swatch_size) || 10;

    return html`
      <ha-card>
        <div class="root" style="padding: ${padding}px">
          ${config.title
            ? html`<div
                class="title"
                style="font-size: ${Number(config.title_font_size) || 16}px${config.title_color ? `; color: ${config.title_color}` : ""}"
              >${config.title}</div>`
            : ""}
          <div class="bar-wrap ${config.orientation === "vertical" ? "vertical" : ""}">
            ${this._renderBar(items, total)}
          </div>
          ${config.show_legend === false
            ? ""
            : html`
                <div
                  class="legend"
                  style="font-size: ${legendFontSize}px${config.legend_color ? `; color: ${config.legend_color}` : ""}"
                >
                  ${items.map(
                    (item) => html`
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
                        ${config.show_legend_values === false
                          ? ""
                          : html`<span class="legend-value">${this._formatValue(item)}</span>`}
                        ${config.show_legend_percent && total > 0
                          ? html`<span class="legend-value"
                              >${((item.magnitude / total) * 100).toFixed(0)}%</span
                            >`
                          : ""}
                      </button>
                    `
                  )}
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
      }
      .root {
        box-sizing: border-box;
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .title {
        color: var(--primary-text-color, #fff);
        font-weight: 500;
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
        display: flex;
        justify-content: center;
      }
      .bar-wrap.vertical svg {
        width: auto;
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
    `;
  }
}

if (!customElements.get("distribution-ex-card")) {
  customElements.define("distribution-ex-card", DistributionExCard);
  registerCard({
    type: "distribution-ex-card",
    name: "Distribution Ex Card",
    description:
      "Compare numeric entities as a segmented bar with a toggleable legend, drawn in SVG.",
    preview: true,
  });
}
