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
const DEFAULT_BAR_LENGTH = 180;

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

// Shading down the barrel: brightest a third of the way across, falling off to
// near-transparent at both edges, which is what reads as a rounded surface.
// Every stop is the segment's own palette colour - only the opacity varies, so
// the card behind shows through and the hue is never altered.
const BARREL_STOPS = [
  { offset: "0%", opacity: 0.3 },
  { offset: "30%", opacity: 0.88 },
  { offset: "62%", opacity: 0.66 },
  { offset: "100%", opacity: 0.26 },
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
  {
    name: "segment_style",
    selector: {
      select: {
        mode: "dropdown",
        options: [
          { value: "barrel", label: "Barrel (shaded, semi-transparent)" },
          { value: "flat", label: "Flat" },
        ],
      },
    },
  },
  {
    name: "segment_opacity",
    selector: { "number": { "min": 0.1, "max": 1, "step": 0.05, "mode": "box" } },
  },
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
          { value: "both", label: "Value and percentage" },
        ],
      },
    },
  },
  {
    name: "value_font_size",
    selector: { number: { min: 6, max: 40, step: 1, mode: "box" } },
  },
  { name: "value_color", selector: { text: {} } },
  {
    name: "unit_font_size",
    selector: { "number": { "min": 4, "max": 40, "step": 1, "mode": "box" } },
  },
  {
    name: "name_column_width",
    selector: { "number": { "min": 0, "max": 200, "step": 2, "mode": "box" } },
  },
  {
    name: "aside_font_size",
    selector: { "number": { "min": 6, "max": 48, "step": 1, "mode": "box" } },
  },
  { name: "show_leaders", selector: { boolean: {} } },
  { name: "leader_color", selector: { text: {} } },
  {
    name: "leader_width",
    selector: { "number": { "min": 0.5, "max": 6, "step": 0.5, "mode": "box" } },
  },
  {
    name: "leader_length",
    selector: { "number": { "min": 0, "max": 80, "step": 1, "mode": "box" } },
  },
  {
    name: "min_label_percent",
    selector: { number: { min: 0, max: 50, step: 1, mode: "box" } },
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
          { value: "top", label: "Top (beside the title)" },
        ],
      },
    },
  },
  {
    name: "total_font_size",
    selector: { number: { min: 6, max: 48, step: 1, mode: "box" } },
  },
  { name: "total_color", selector: { text: {} } },
  { name: "show_segment_names", selector: { boolean: {} } },
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
  { name: "title_bold", selector: { boolean: {} } },
  { name: "title_italic", selector: { boolean: {} } },
  {
    name: "title_position",
    selector: {
      select: {
        mode: "dropdown",
        options: [
          { value: "top", label: "Top" },
          { value: "bottom", label: "Bottom" },
        ],
      },
    },
  },
  {
    name: "title_padding",
    selector: { "number": { "min": 0, "max": 40, "step": 1, "mode": "box" } },
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
  segment_style: "Segment shading",
  segment_opacity: "Segment opacity (scales the shading)",
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
  title_bold: "Bold title",
  title_italic: "Italic title",
  title_position: "Title placement",
  title_padding: "Space around the title (px)",
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
      _barHeight: { attribute: false },
    };
  }

  constructor() {
    super();
    this._hidden = [];
    this._width = DEFAULT_WIDTH;
    this._barHeight = DEFAULT_BAR_LENGTH;
    this._clipId = uniqueId("dex-clip");
    this._segmentId = uniqueId("dex-seg");
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
      segment_style: "barrel",
      segment_opacity: 1,
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
      title_position: "top",
      title_padding: 0,
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
    const unit =
      config.unit ||
      (items.find((i) => !i.hidden && i.unit) || items.find((i) => i.unit) || {}).unit ||
      "";
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
      >${parts.value}</tspan>${parts.unit
        ? svg`<tspan class="aside-unit" dx="3" style="font-size: ${unitSize}px">${parts.unit}</tspan>`
        : svg``}`;
  }

  _segmentFill(index) {
    return this.config.segment_style === "flat"
      ? null
      : `${this._segmentId}-${index}`;
  }

  // One gradient per segment, since each carries its own colour. Both bars use
  // objectBoundingBox units and every segment spans the bar's full thickness,
  // so a single set of offsets shades them all identically across that axis.
  _barrelDefs(visible, vertical) {
    if (this.config.segment_style === "flat") return svg``;
    const scale = Number.isFinite(Number(this.config.segment_opacity))
      ? Math.max(0, Math.min(1, Number(this.config.segment_opacity)))
      : 1;
    return svg`${visible.map(
      (item, index) => svg`
        <linearGradient
          id=${`${this._segmentId}-${index}`}
          x1="0" y1="0"
          x2=${vertical ? "1" : "0"} y2=${vertical ? "0" : "1"}
        >
          ${BARREL_STOPS.map(
            (stop) => svg`<stop
              offset=${stop.offset}
              stop-color=${item.color}
              stop-opacity=${stop.opacity * scale}
            />`
          )}
        </linearGradient>
      `
    )}`;
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
    const unit =
      config.unit ||
      (items.find((i) => !i.hidden && i.unit) || items.find((i) => i.unit) || {}).unit ||
      "";
    return `${total.toFixed(decimals)}${unit ? ` ${unit}` : ""}`;
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
    const visible = items.filter((i) => !i.hidden && i.magnitude > 0);
    const mode = this._labelMode();
    const valueFontSize = Number(config.value_font_size) || 11;
    const minLabel = Number.isFinite(Number(config.min_label_percent))
      ? Number(config.min_label_percent)
      : 8;

    if (!vertical) {
      return this._renderHorizontal({
        length: this._width, thickness, radius, gap, visible, total, mode,
        valueFontSize, minLabel,
      });
    }
    return this._renderVertical({
      thickness, radius, gap, visible, items, total, mode, valueFontSize, minLabel,
    });
  }

  // The bar hugs the left edge; each slice is called out to a label column on
  // the right by a bracket, and the total hangs off the bottom of the bar on
  // its own leader so it reads as the sum of what sits above it.
  _renderVertical({ thickness, radius, gap, visible, items, total, mode, valueFontSize, minLabel }) {
    const config = this.config;
    const asideFontSize = Number(config.aside_font_size) || 16;
    const showLeaders = config.show_leaders !== false;
    const leaderLength = Number.isFinite(Number(config.leader_length))
      ? Number(config.leader_length)
      : 12;
    // Rods read as part of the readout they point at, so they take the value's
    // colour unless told otherwise.
    const leaderColor =
      config.leader_color || config.value_color || "var(--primary-text-color, #fff)";
    const leaderWidth = Number(config.leader_width) || 1;

    const bracketX1 = thickness + 3;
    const bracketX2 = bracketX1 + (showLeaders ? 5 : 0);
    const labelX = bracketX2 + (showLeaders ? leaderLength : 6) + 4;

    // Names and values get their own columns, so the values - and the total -
    // line up however long the names are. The column is measured from the text
    // that will actually be written in it, rather than reserved at a fixed
    // width, so it collapses to nothing when there are no names and does not
    // push the values away from the bar.
    const namesShown = config.show_segment_names !== false;
    const written = [
      ...(namesShown ? visible.map((item) => item.name) : []),
      config.total_label,
    ].filter((text) => text !== undefined && text !== null && text !== "");
    const longest = written.reduce(
      (max, text) => Math.max(max, String(text).length),
      0
    );
    const nameColumn = Number.isFinite(Number(config.name_column_width))
      ? Number(config.name_column_width)
      // ~0.58em per character is close enough for the UI faces in play; the
      // column only has to clear the name, not fit it exactly.
      : longest
        ? longest * asideFontSize * 0.58 + 8
        : 0;
    const valueX = labelX + nameColumn;
    // A rod has to stop just before whatever is actually written on its row.
    // Aiming at labelX left a gap the width of the name column whenever that
    // column was reserved but the row had no name in it.
    const textX = namesShown ? labelX : valueX;

    const width = this._width;
    const height = this._barHeight;
    // Reserve a row under the bar for the total, so its leader has somewhere
    // to land instead of overlapping the last slice.
    const totalRow = config.show_total ? asideFontSize * 1.9 : 0;
    const length = Math.max(10, height - totalRow);
    const totalY = length + totalRow / 2;

    const flatOpacity = Number.isFinite(Number(config.segment_opacity))
      ? Number(config.segment_opacity)
      : 1;
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
        item, start, drawn,
        percent: share * 100,
        valueText: this._formatValue(item),
        percentText: `${(share * 100).toFixed(0)}%`,
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
          ${this._barrelDefs(visible, true)}
        </defs>
        <g clip-path="url(#${this._clipId})">
          <rect
            x="0" y="0" width=${thickness} height=${length}
            fill=${config.bar_bg_color || "var(--divider-color, rgba(127,127,127,0.25))"}
          />
          ${segments.map(({ item, start, drawn }, index) => svg`
            <rect
              class="segment"
              x="0" y=${start} width=${thickness} height=${drawn}
              fill=${this._segmentFill(index) ? `url(#${this._segmentFill(index)})` : item.color}
              fill-opacity=${this._segmentFill(index) ? 1 : flatOpacity}
              @click=${() => this._moreInfo(item.entity)}
            ><title>${item.name}: ${this._formatValue(item)}</title></rect>
          `)}
        </g>
        ${config.show_values === false
          ? svg``
          : segments.map(({ item, start, drawn, percent, valueText, percentText }) => {
              if (percent < minLabel || drawn <= 0) return svg``;
              const mid = start + drawn / 2;
              return svg`
                ${hasInside && drawn >= valueFontSize * 1.3
                  ? svg`
                    <text
                      class="segment-label"
                      x=${thickness / 2} y=${mid}
                      text-anchor="middle" dominant-baseline="central"
                      style="font-size: ${valueFontSize}px${config.value_color ? `; fill: ${config.value_color}` : ""}"
                    >${percentText}</text>
                  `
                  : svg``}
                ${hasAside && showLeaders
                  ? svg`
                    <path
                      class="leader"
                      d="M ${bracketX1} ${start} L ${bracketX2} ${start} L ${bracketX2} ${start + drawn} L ${bracketX1} ${start + drawn} M ${bracketX2} ${mid} L ${textX - 4} ${mid}"
                      fill="none"
                      stroke=${leaderColor}
                      stroke-width=${leaderWidth}
                    />
                  `
                  : svg``}
                ${hasAside
                  ? svg`
                    ${namesShown
                      ? svg`
                        <text
                          class="aside-name"
                          x=${labelX} y=${mid}
                          text-anchor="start" dominant-baseline="central"
                          style="font-size: ${asideFontSize}px"
                          @click=${() => this._moreInfo(item.entity)}
                        >${item.name}</text>
                      `
                      : svg``}
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
                  `
                  : svg``}
              `;
            })}
        ${config.show_total
          ? svg`
            ${showLeaders
              ? svg`
                <path
                  class="leader"
                  d="M ${bracketX2} ${length} L ${bracketX2} ${totalY} L ${
                    (config.total_label ? labelX : valueX) - 4
                  } ${totalY}"
                  fill="none"
                  stroke=${leaderColor}
                  stroke-width=${leaderWidth}
                />
              `
              : svg``}
            ${config.total_label
              ? svg`
                <text
                  class="aside-name total-aside"
                  x=${labelX} y=${totalY}
                  text-anchor="start" dominant-baseline="central"
                  style="font-size: ${asideFontSize}px"
                >${config.total_label}</text>
              `
              : svg``}
            <text
              class="segment-aside total-aside"
              x=${valueX} y=${totalY}
              text-anchor="start" dominant-baseline="central"
            >${this._valueTspans(
              this._totalParts(items, total),
              asideFontSize,
              config.total_color ? `; fill: ${config.total_color}` : ""
            )}</text>
          `
          : svg``}
      </svg>
    `;
  }

  _renderHorizontal({ length, thickness, radius, gap, visible, total, mode, valueFontSize, minLabel }) {
    const config = this.config;
    const width = length;
    const height = thickness;
    const flatOpacity = Number.isFinite(Number(config.segment_opacity))
      ? Number(config.segment_opacity)
      : 1;

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
          ${this._barrelDefs(visible, false)}
        </defs>
        <g clip-path="url(#${this._clipId})">
          <rect
            x="0" y="0" width=${width} height=${height}
            fill=${config.bar_bg_color || "var(--divider-color, rgba(127,127,127,0.25))"}
          />
          ${segments.map(({ item, start, drawn }, index) => svg`
            <rect
              class="segment"
              x=${start} y="0" width=${drawn} height=${height}
              fill=${this._segmentFill(index) ? `url(#${this._segmentFill(index)})` : item.color}
              fill-opacity=${this._segmentFill(index) ? 1 : flatOpacity}
              @click=${() => this._moreInfo(item.entity)}
            ><title>${item.name}: ${this._formatValue(item)}</title></rect>
          `)}
        </g>
        ${config.show_values === false
          ? svg``
          : segments.map(({ start, drawn, percent, percentText, parts }) => {
              if (percent < minLabel || drawn <= 0) return svg``;
              const unitSize = this._unitFontSize(valueFontSize);
              const colour = config.value_color ? `; fill: ${config.value_color}` : "";
              return svg`
                <text
                  class="segment-label"
                  x=${start + drawn / 2} y=${height / 2}
                  text-anchor="middle" dominant-baseline="central"
                  style="font-size: ${valueFontSize}px${colour}"
                >${mode === "percent"
                  ? svg`${percentText}`
                  : svg`<tspan style="font-size: ${valueFontSize}px">${parts.value}</tspan>${parts.unit
                      ? svg`<tspan dx="3" style="font-size: ${unitSize}px">${parts.unit}</tspan>`
                      : svg``}${mode === "both"
                      ? svg`<tspan dx="4" style="font-size: ${unitSize}px">\u00b7 ${percentText}</tspan>`
                      : svg``}`}</text>
              `;
            })}
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

    // Built once and placed either above everything or below it, so the two
    // positions cannot drift apart in styling.
    const titleAtTop = config.title_position !== "bottom";
    const titlePadding = Number.isFinite(Number(config.title_padding))
      ? Number(config.title_padding)
      : 0;
    const titleEl = config.title
      ? html`<div
          class="title"
          style="font-size: ${Number(config.title_font_size) || 16}px; font-weight: ${
            config.title_bold ? 700 : 500
          }; font-style: ${config.title_italic ? "italic" : "normal"}; padding: ${titlePadding}px${
            config.title_color ? `; color: ${config.title_color}` : ""
          }"
        >${config.title}</div>`
      : "";

    return html`
      <ha-card>
        <div class="root" style="padding: ${padding}px">
          ${(config.title && titleAtTop) ||
          (config.show_total && config.total_position === "top")
            ? html`<div class="header">
                ${config.title && titleAtTop ? titleEl : html`<span></span>`}
                ${config.show_total && config.total_position === "top"
                  ? html`<div
                      class="total"
                      style="font-size: ${Number(config.total_font_size) || 16}px${config.total_color ? `; color: ${config.total_color}` : ""}"
                    >
                      ${config.total_label
                        ? html`<span class="total-label">${config.total_label}</span>`
                        : ""}
                      <span class="total-value">${this._formatTotal(items, total)}</span>
                    </div>`
                  : ""}
              </div>`
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
                          : html`<span class="legend-value"
                              >${this._valueParts(item).value}${this._valueParts(item).unit
                                ? html`<span
                                    class="legend-unit"
                                    style="font-size: ${this._unitFontSize(legendFontSize)}px"
                                    >${this._valueParts(item).unit}</span
                                  >`
                                : ""}</span
                            >`}
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
          ${config.show_total &&
          config.total_position !== "top" &&
          config.orientation !== "vertical"
            ? html`<div
                class="total total-bottom"
                style="font-size: ${Number(config.total_font_size) || 16}px${config.total_color ? `; color: ${config.total_color}` : ""}"
              >
                ${config.total_label
                  ? html`<span class="total-label">${config.total_label}</span>`
                  : ""}
                <span class="total-value">${this._formatTotal(items, total)}</span>
              </div>`
            : ""}
          ${config.title && !titleAtTop ? titleEl : ""}
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
