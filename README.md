# SVG Cards

[![GitHub release](https://img.shields.io/github/v/release/vitska/ha-wind-dir-card)](https://github.com/vitska/ha-wind-dir-card/releases)
[![HACS Custom](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)

A collection of Home Assistant Lovelace cards drawn entirely in SVG, so they
scale cleanly to whatever tile they're given and expose a large set of styling
options.

| Card | Type | What it does |
| ---- | ---- | ------------ |
| [Wind Direction Card](#wind-direction-card) | `custom:wind-dir-card` | Compass dial with wind direction, average-direction sector, speed and gusts |
| [Sensor Ex Card](#sensor-ex-card) | `custom:sensor-ex-card` | Sensor readout with label, value, unit and a history graph |

Registering the single `ha-cards.js` resource makes every card in the
collection available.

## Install

### Via HACS (custom repository)

1. HACS → Frontend → menu (⋮) → **Custom repositories**.
2. Add this repository's URL, category **Lovelace**.
3. Install "SVG Cards", then reload your browser.

### HACS update

1. HACS → Frontend → **SVG Cards** → menu (⋮) → **Redownload**
   (or use the update notification/badge HACS shows when a new release is
   available).
2. Reload the dashboard with a hard refresh (Ctrl+Shift+R / Cmd+Shift+R) so
   the browser picks up the new resource instead of a cached copy.
3. If it still looks unchanged, restart Home Assistant or use Settings →
   General → hamburger menu → **Clear cache and reload**.

### Manual

1. Copy `ha-cards.js`, `shared.js` and every `*-card.js` file into
   `<config>/www/`, keeping them all in the same directory (the cards import
   `shared.js` by relative path).
2. In Settings → Dashboards → Resources, add:
   - URL: `/local/ha-cards.js`
   - Type: JavaScript Module
3. Reload the dashboard.

Open the browser console after loading — the collection logs an `SVG CARDS`
banner with its version, which is the quickest way to confirm which build is
actually running.

### Manual update

If you installed manually (not via HACS), pull in new versions like this:

1. Download the latest `.js` files from this repo (or `git pull` if you
   cloned it) and overwrite the copies in `<config>/www/`.
2. Bump the cache-busting version so browsers/HA actually fetch the new files
   instead of cached copies: in Settings → Dashboards → Resources, edit the
   `/local/ha-cards.js` resource and add/update a `?v=` query string,
   e.g. `/local/ha-cards.js?v=2` (increment it on every update).
3. Reload the dashboard with a hard refresh (Ctrl+Shift+R / Cmd+Shift+R) so
   the browser doesn't serve the old cached module.
4. If the card still shows old behavior, restart Home Assistant or clear the
   frontend cache (Settings → General → hamburger menu → **Clear cache and
   reload**) to force a full reload of custom card resources.

## Wind Direction Card

`custom:wind-dir-card` — an SVG compass showing:

- momentary wind direction (arrow)
- average wind direction sector (translucent arc overlay)
- cardinal directions (N/E/S/W) with a tick ring
- momentary wind speed (center readout)
- wind gusts (secondary readout)

The card resizes to fill whatever tile it's given (e.g. one column of a
`horizontal-stack`) while staying square.

![Wind direction card screenshot](screenshot.png)

Shown here in a dashboard alongside other sensor cards:

![Wind direction card in a dashboard](screenshot-dashboard.png)

### Configuration

The card has a visual editor: add it via the dashboard's "Add Card" picker
(search for "Wind Direction Card") or edit an existing card and switch to the
"UI" tab — no YAML required, though YAML editing is still fully supported.

| Option                      | Required | Description                                                              |
| ---------------------------- | -------- | ------------------------------------------------------------------------- |
| `type`                        | yes      | `custom:wind-dir-card`                                                    |
| `wind_direction_entity`       | yes      | Entity with momentary wind direction in degrees (0–360)                   |
| `wind_speed_entity`           | yes      | Entity with momentary wind speed                                          |
| `wind_gust_entity`            | no       | Entity with wind gust speed, shown as a secondary readout                 |
| `wind_direction_avg_entity`   | no       | Entity with average wind direction in degrees, drives the sector overlay  |
| `sector_width`                | no       | Width in degrees of the average-direction sector arc (default `60`)       |
| `sector_color`                | no       | CSS color for the sector overlay (default `red`)                          |
| `sector_opacity`              | no       | Opacity (0–1) of the average-direction sector overlay (default `0.35`)    |
| `scale_color`                 | no       | CSS color for the tick ring, cardinal labels and north marker (default `white`) |
| `arrow_color`                 | no       | CSS color for the direction arrow (default `white`)                       |
| `speed_unit`                  | no       | Overrides the unit shown for speed/gust (default: entity's own unit)      |
| `show_speed_unit`             | no       | Show/hide the unit text under the speed value (default `false`)           |
| `show_gust_unit`              | no       | Show/hide the unit text next to the gust value (default `false`)          |
| `speed_precision`             | no       | Decimal places shown for the speed readout (default `1`)                  |
| `gust_precision`              | no       | Decimal places shown for the gust readout (default `1`)                   |
| `speed_font_size`             | no       | Font size in px for the center speed value (default `40`)                 |
| `gust_font_size`              | no       | Font size in px for the gust label (default `30`)                         |
| `arrow_size`                  | no       | Scale factor for the direction arrow's length/thickness (default `1.25`)  |
| `arrow_type`                  | no       | Arrow shape: `arrow` (shaft + head + tail circle, default), `needle` (diamond), or `line` (shaft + small head) |
| `arrow_shadow`                | no       | Add a drop shadow under the direction arrow/needle for depth (default `true`) |
| `arrow_shadow_color`          | no       | CSS color for the arrow shadow (default `black`)                          |
| `arrow_shadow_offset`         | no       | Vertical offset in px for the arrow shadow (default `2`)                  |
| `color_normal`                | no       | CSS color for speed/gust values below any warning threshold (default `white`) |
| `color_warning`               | no       | CSS color for speed/gust values at/above their warning threshold (default `yellow`) |
| `color_danger`                | no       | CSS color for speed/gust values at/above their danger threshold (default `red`) |
| `speed_warning_threshold`     | no       | Speed value at/above which the speed readout switches to `color_warning` (default `3`) |
| `speed_danger_threshold`      | no       | Speed value at/above which the speed readout switches to `color_danger` (default `4`) |
| `gust_warning_threshold`      | no       | Gust value at/above which the gust readout switches to `color_warning` (default `3`) |
| `gust_danger_threshold`       | no       | Gust value at/above which the gust readout switches to `color_danger` (default `4`) |
| `center_bg_color`             | no       | CSS color for the round gradient background behind the speed value, rendered above the arrow (default `#222222`) |
| `center_bg_opacity`           | no       | Opacity (0–1) at the center of that gradient, fading to transparent at its edge (default `0.9`) |
| `padding`                     | no       | Padding in px around the dial inside the tile (default `0`, fills the tile edge-to-edge) |
| `name`                        | no       | Optional card header/title                                                |

### Example

Just the entities are required — every styling option above already has a
sensible default (red sector, white scale/arrow, black arrow shadow, dial
filling the tile edge-to-edge, warning/danger thresholds at 3/4, etc.):

```yaml
type: horizontal-stack
cards:
  - type: custom:wind-dir-card
    wind_direction_entity: sensor.roof_wt32_s1_wind_station_wind_direction
    wind_direction_avg_entity: sensor.roof_wt32_s1_wind_station_wind_direction_avg_60s
    wind_speed_entity: sensor.roof_wt32_s1_wind_station_wind_speed
    wind_gust_entity: sensor.roof_wt32_s1_wind_station_wind_gust_30s
```

Override any option to taste, e.g. back to a plain white-on-dark look with
larger padding and no arrow shadow:

```yaml
type: horizontal-stack
cards:
  - type: custom:wind-dir-card
    name: Wind
    wind_direction_entity: sensor.wind_direction
    wind_direction_avg_entity: sensor.wind_direction_avg
    wind_speed_entity: sensor.wind_speed
    wind_gust_entity: sensor.wind_gust
    sector_color: "#58a6ff"
    padding: 8
    arrow_shadow: false
    show_speed_unit: true
    show_gust_unit: true
```

### Notes

- If an entity is `unavailable`/`unknown`, the affected part of the dial is
  hidden and the card dims slightly instead of erroring.
- Colors are pulled from your active HA theme (`--primary-text-color`,
  `--card-background-color`, etc.) with sensible dark-theme fallbacks, so the
  card looks reasonable in both light and dark themes without configuration.

## Sensor Ex Card

`custom:sensor-ex-card` — the equivalent of Home Assistant's built-in sensor
card, drawn in SVG so every part is styleable:

- label (entity name, or your own)
- entity icon
- large value with its unit
- filled area or line graph of the entity's recorder history

Text and graph are drawn at the card's real pixel size, so nothing is stretched
or distorted whatever tile shape it lands in. With `padding: 0` (the default)
the graph runs edge to edge.

### Configuration

Only `entity` is required. The card has a visual editor, same as the compass.

| Option              | Required | Description                                                                 |
| ------------------- | -------- | --------------------------------------------------------------------------- |
| `type`               | yes      | `custom:sensor-ex-card`                                                      |
| `entity`             | yes      | The sensor entity to display                                                 |
| `name`               | no       | Label text (default: the entity's friendly name)                             |
| `icon`               | no       | Icon override (default: the entity's own icon)                               |
| `unit`               | no       | Unit override (default: the entity's `unit_of_measurement`)                  |
| `value_precision`    | no       | Decimal places for the value (default `1`)                                   |
| `show_label`         | no       | Show the label; when hidden, the value moves up into its place (default `true`) |
| `show_value`         | no       | Show the value (default `true`)                                              |
| `show_unit`          | no       | Show the unit next to the value (default `true`)                             |
| `show_icon`          | no       | Show the icon (default `true`)                                               |
| `show_graph`         | no       | Show the history graph (default `true`)                                      |
| `label_color`        | no       | CSS color for the label (default: theme secondary text color)                |
| `value_color`        | no       | CSS color for the value (default: theme primary text color)                  |
| `unit_color`         | no       | CSS color for the unit (default: theme secondary text color)                 |
| `icon_color`         | no       | CSS color for the icon (default: theme icon color)                           |
| `label_font_size`    | no       | Label font size in px (default `18`)                                         |
| `value_font_size`    | no       | Value font size in px (default `40`)                                         |
| `unit_font_size`     | no       | Unit font size in px (default `14`)                                          |
| `icon_size`          | no       | Icon size in px (default `24`)                                               |
| `color_normal`       | no       | Value color below any threshold (default: theme primary text color)          |
| `color_warning`      | no       | Value color at/above `warning_threshold` (default `#ffa600`)                 |
| `color_danger`       | no       | Value color at/above `danger_threshold` (default `#ff4136`)                  |
| `warning_threshold`  | no       | Value at/above which the readout turns `color_warning`                       |
| `danger_threshold`   | no       | Value at/above which the readout turns `color_danger`                        |
| `hours_to_show`      | no       | Hours of history to graph (default `24`)                                     |
| `graph_type`         | no       | `area` (line + gradient fill, default) or `line`                             |
| `line_color`         | no       | CSS color for the graph line (default: theme accent color)                   |
| `line_width`         | no       | Graph line width in px (default `2`)                                         |
| `fill_color`         | no       | CSS color for the area fill (default: the line color)                        |
| `fill_opacity`       | no       | Opacity at the top of the fill gradient, fading to 0 (default `0.3`)         |
| `graph_height`       | no       | Graph height as a fraction of the card, 0–1 (default `0.45`)                 |
| `y_min` / `y_max`    | no       | Fixed Y axis bounds (default: auto-scaled to the data)                       |
| `card_height`        | no       | Minimum card height in px (default `120`)                                    |
| `padding`            | no       | Padding around the contents in px (default `0`, fills the tile edge-to-edge) |
| `refresh_interval`   | no       | How often to refetch history, in seconds (default `300`)                     |

### Example

```yaml
type: horizontal-stack
cards:
  - type: custom:sensor-ex-card
    entity: sensor.outside_temperature
  - type: custom:sensor-ex-card
    entity: sensor.pressure
    name: Pressure
    hours_to_show: 48
    graph_type: line
    line_color: "#9e9e9e"
    value_precision: 0
    warning_threshold: 1020
    danger_threshold: 1030
```

### Notes

- The graph comes from the recorder, so an entity excluded from recorder has
  nothing to plot. The value and label still render.
- History is fetched over the WebSocket API and refreshed on
  `refresh_interval`; the live state is appended so the line always runs to
  "now". If the request fails the card drops the graph rather than erroring.
- Long windows are downsampled to 100 points by bucket averaging, so a 30-day
  graph stays as cheap to draw as a 1-hour one.

## Repo layout

Plain ES modules, no build step — HACS downloads every `.js` file from the
repo root into the same directory, so relative imports between them resolve.

| File | Purpose |
| ---- | ------- |
| `ha-cards.js` | Collection entry point: imports every card, logs the version banner |
| `shared.js` | lit re-export plus helpers shared by all cards (entity readers, threshold colours, `ha-form` editor base, unique SVG ids) |
| `wind-dir-card.js` | Wind Direction Card; also works standalone as its own resource |
| `sensor-ex-card.js` | Sensor Ex Card |

To add a card: create `<name>-card.js`, have it register its element and call
`registerCard(...)` from `shared.js`, then add one `import` line to
`ha-cards.js`.
