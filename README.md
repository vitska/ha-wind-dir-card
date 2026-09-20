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

1. Copy `ha-cards.js` from the repo root into `<config>/www/ha-cards.js`.
   That one file contains every card — it has no other dependencies.
2. In Settings → Dashboards → Resources, add:
   - URL: `/local/ha-cards.js`
   - Type: JavaScript Module
3. Reload the dashboard.

If you only want a single card, `wind-dir-card.js` and `sensor-ex-card.js` are
also self-contained and can be used instead.

Open the browser console after loading — the collection logs an `SVG CARDS`
banner with its version, which is the quickest way to confirm which build is
actually running.

### Manual update

If you installed manually (not via HACS), pull in new versions like this:

1. Download the latest `ha-cards.js` from this repo (or `git pull` if you
   cloned it) and overwrite the copy in `<config>/www/`.
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
| `show_trend`         | no       | Show the trend arrow next to the value (default `true`)                      |
| `trend_hours`        | no       | Window of history the trend is measured over, in hours (default `1`)         |
| `trend_threshold`    | no       | Deadband — a change smaller than this counts as flat (default `0`)           |
| `trend_color_up`     | no       | Color of the rising arrow (default `#ff6b6b`)                                |
| `trend_color_down`   | no       | Color of the falling arrow (default `#58a6ff`)                               |
| `trend_color_flat`   | no       | Color of the flat marker (default: theme secondary text color)               |
| `trend_font_size`    | no       | Trend arrow size in px (default: same as `unit_font_size`)                   |
| `trend_up_symbol`    | no       | Symbol for a rising trend (default `▲`)                                      |
| `trend_down_symbol`  | no       | Symbol for a falling trend (default `▼`)                                     |
| `trend_flat_symbol`  | no       | Symbol for no significant change (default `–`)                               |
| `label_color`        | no       | CSS color for the label (default: theme secondary text color)                |
| `value_color`        | no       | CSS color for the value (default: theme primary text color)                  |
| `unit_color`         | no       | CSS color for the unit (default: theme secondary text color)                 |
| `icon_color`         | no       | CSS color for the icon (default: theme icon color)                           |
| `label_font_size`    | no       | Label font size in px (default `18`)                                         |
| `value_font_size`    | no       | Value font size in px (default `40`)                                         |
| `unit_font_size`     | no       | Unit font size in px (default `14`)                                          |
| `icon_size`          | no       | Icon size in px (default `24`)                                               |
| `color_normal`       | no       | Value color below any threshold (default: falls back to `value_color`)       |
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
| `card_height`        | no       | Fixed card height in px. Unset (default) fills the tile, which in a stack means matching the tallest sibling |
| `padding`            | no       | Padding around the contents in px (default `0`, fills the tile edge-to-edge) |
| `refresh_interval`   | no       | How often to refetch history, in seconds (default `300`)                     |

### Examples

**Minimal** — everything else is inferred from the entity (label from its
friendly name, unit from `unit_of_measurement`, icon from the entity, 24h of
history):

```yaml
type: custom:sensor-ex-card
entity: sensor.outside_temperature
```

**A grid of sensors.** Each card fills its own tile, and `padding: 0` (the
default) runs the graphs edge to edge:

```yaml
type: grid
columns: 3
square: false
cards:
  - type: custom:sensor-ex-card
    entity: sensor.outside_temperature
    name: Temp
  - type: custom:sensor-ex-card
    entity: sensor.pressure
    name: Pressure
    value_precision: 1
    graph_type: line
  - type: custom:sensor-ex-card
    entity: sensor.living_room_temperature
    name: TIS1
```

**Threshold colours** — the value turns amber at/above `warning_threshold` and
red at/above `danger_threshold`, while the graph keeps its own colour:

```yaml
type: custom:sensor-ex-card
entity: sensor.cpu_temperature
name: CPU
value_precision: 0
warning_threshold: 70
danger_threshold: 85
color_warning: yellow
color_danger: red
```

**Compact readout** — no graph, no icon, and with the label hidden the value
moves up to fill its slot, so a short card stays balanced:

```yaml
type: custom:sensor-ex-card
entity: sensor.humidity
show_label: false
show_icon: false
show_graph: false
card_height: 70
value_font_size: 48
```

**Trend arrow.** Shown next to the value by default, derived from the same
history the graph uses. It compares the mean of the newer half of
`trend_hours` against the older half, so a noisy sensor doesn't flip the arrow
on every update. Use `trend_threshold` to widen the deadband, and note the
defaults read as "warmer/cooler" (red up, blue down) — swap them for anything
where rising is good:

```yaml
type: custom:sensor-ex-card
entity: sensor.battery_level
trend_hours: 6
trend_threshold: 0.5
trend_color_up: "#51cf66"
trend_color_down: "#ff6b6b"
trend_up_symbol: "↑"
trend_down_symbol: "↓"
trend_font_size: 18
```

Nothing is drawn when there's less than two points of history in the window,
so an entity the recorder doesn't keep won't show a misleading flat marker.
Turn it off entirely with `show_trend: false`.

**Controlling the height.** By default the card fills its tile, so in a
`horizontal-stack` next to a tall card (like the compass) it stretches to match
it. Set `card_height` to pin it instead:

```yaml
type: horizontal-stack
cards:
  - type: custom:wind-dir-card
    wind_direction_entity: sensor.wind_direction
    wind_speed_entity: sensor.wind_speed
  - type: grid
    columns: 2
    square: false
    cards:
      - type: custom:sensor-ex-card
        entity: sensor.outside_temperature
        card_height: 100
      - type: custom:sensor-ex-card
        entity: sensor.pressure
        card_height: 100
```

Shrinking the cards leaves empty space in the row, because the compass still
sets the row height. To close the gap, shorten the whole row rather than the
sensor cards — the compass is square, so its height follows its width; give it
a narrower column (for example put the stack in a `grid` and let the compass
take one column of three) and everything shrinks together.

**Sparkline only** — hide the readout and let the graph fill the whole tile:

```yaml
type: custom:sensor-ex-card
entity: sensor.power_usage
show_label: false
show_value: false
show_icon: false
graph_height: 1
card_height: 90
hours_to_show: 6
line_color: "#ffa600"
fill_opacity: 0.45
```

**Fully styled** — matching the dark look of the Wind Direction Card defaults:

```yaml
type: custom:sensor-ex-card
entity: sensor.outside_temperature
name: Outside
label_color: "#9e9e9e"
value_color: white
unit_color: "#9e9e9e"
icon_color: white
label_font_size: 16
value_font_size: 44
unit_font_size: 16
line_color: "#58a6ff"
fill_color: "#58a6ff"
fill_opacity: 0.4
line_width: 2.5
graph_height: 0.5
hours_to_show: 48
y_min: -10
y_max: 35
padding: 8
```

**Alongside the Wind Direction Card**, since both come from this collection:

```yaml
type: horizontal-stack
cards:
  - type: custom:wind-dir-card
    wind_direction_entity: sensor.wind_direction
    wind_direction_avg_entity: sensor.wind_direction_avg
    wind_speed_entity: sensor.wind_speed
    wind_gust_entity: sensor.wind_gust
  - type: custom:sensor-ex-card
    entity: sensor.outside_temperature
    name: Temp
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

Sources live in `src/` as plain ES modules. `build.sh` bundles them into
**self-contained** files at the repo root — those are what ships.

| Source | Purpose |
| ------ | ------- |
| `src/ha-cards.js` | Collection entry point: imports every card, logs the version banner |
| `src/shared.js` | lit re-export plus helpers shared by all cards (entity readers, threshold colours, `ha-form` editor base, unique SVG ids) |
| `src/wind-dir-card.js` | Wind Direction Card |
| `src/sensor-ex-card.js` | Sensor Ex Card |

| Built artifact | Contains |
| -------------- | -------- |
| `ha-cards.js` | Every card — the file to install |
| `wind-dir-card.js` | Just the compass, standalone |
| `sensor-ex-card.js` | Just the sensor card, standalone |

Each artifact bundles the shared code, so its only remaining import is lit from
the CDN. That matters because HACS copies `.js` files into
`www/community/<repo>/` and a card that did `import "./shared.js"` at runtime
would fail completely if that one file didn't arrive — taking every card in it
down with it. Loading more than one artifact is harmless: registration is
guarded, so nothing double-registers or gets listed twice in the card picker.

### Building

```bash
./build.sh
```

Needs node; esbuild is fetched on demand via `npx`, so there is nothing to
install and no `node_modules` in the repo. Rerun it after editing anything in
`src/` and commit the regenerated root files.

To add a card: create `src/<name>-card.js`, have it register its element and
call `registerCard(...)` from `shared.js`, add one `import` line to
`src/ha-cards.js`, then add it to the `ENTRIES` list in `build.sh` if it should
also ship standalone.
