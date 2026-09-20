// Shared runtime for the card collection. Every card imports lit through this
// module so all cards resolve to one module instance and one network request.
import {
  LitElement,
  html,
} from "https://unpkg.com/lit-element@3.3.3/lit-element.js?module";

export {
  LitElement,
  html,
  css,
  svg,
} from "https://unpkg.com/lit-element@3.3.3/lit-element.js?module";

export const VERSION = "3.0.0";

export function fireEvent(node, type, detail) {
  node.dispatchEvent(
    new CustomEvent(type, {
      detail,
      bubbles: true,
      composed: true,
    })
  );
}

// Per-instance suffix for SVG <defs> ids (gradients, filters). Ids are global
// within a document fragment, so two cards on one dashboard must not collide.
export function uniqueId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2)}`;
}

export function registerCard(entry) {
  window.customCards = window.customCards || [];
  window.customCards.push(entry);
}

export function getState(hass, entityId) {
  if (!entityId || !hass) return undefined;
  return hass.states[entityId];
}

export function getNumber(hass, entityId) {
  const state = getState(hass, entityId);
  if (!state) return null;
  const value = parseFloat(state.state);
  return Number.isFinite(value) ? value : null;
}

export function getUnit(hass, entityId, override, fallback) {
  const state = getState(hass, entityId);
  return (
    override ||
    (state && state.attributes && state.attributes.unit_of_measurement) ||
    fallback ||
    ""
  );
}

export function valueLevel(value, warningThreshold, dangerThreshold) {
  if (value === null) return "normal";
  const hasDanger =
    dangerThreshold !== undefined && dangerThreshold !== null && dangerThreshold !== "";
  const hasWarning =
    warningThreshold !== undefined && warningThreshold !== null && warningThreshold !== "";
  if (hasDanger && value >= Number(dangerThreshold)) return "danger";
  if (hasWarning && value >= Number(warningThreshold)) return "warning";
  return "normal";
}

// Returns "" for the normal level unless the card explicitly configures
// color_normal, so the stylesheet's own colour stays in charge by default.
export function levelColor(config, level) {
  if (level === "danger") return config.color_danger || "#ff4136";
  if (level === "warning") return config.color_warning || "#ffa600";
  return config.color_normal || "";
}

// ha-form wrapper shared by every card's GUI editor. Subclasses supply only a
// schema and a label map.
export class BaseCardEditor extends LitElement {
  static get properties() {
    return {
      hass: { attribute: false },
      _config: { attribute: false },
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
}

export function defineEditor(tag, schema, labels) {
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
