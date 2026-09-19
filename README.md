# Wind Direction Card

[![GitHub release](https://img.shields.io/github/v/release/vitska/ha-wind-dir-card)](https://github.com/vitska/ha-wind-dir-card/releases)
[![HACS Custom](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)

A Home Assistant Lovelace custom card that draws an SVG compass showing:

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

## Install

### Via HACS (custom repository)

1. HACS → Frontend → menu (⋮) → **Custom repositories**.
2. Add this repository's URL, category **Lovelace**.
3. Install "Wind Direction Card", then reload your browser.

### HACS update

1. HACS → Frontend → **Wind Direction Card** → menu (⋮) → **Redownload**
   (or use the update notification/badge HACS shows when a new release is
   available).
2. Reload the dashboard with a hard refresh (Ctrl+Shift+R / Cmd+Shift+R) so
   the browser picks up the new resource instead of a cached copy.
3. If it still looks unchanged, restart Home Assistant or use Settings →
   General → hamburger menu → **Clear cache and reload**.

### Manual

1. Copy `wind-dir-card.js` into `<config>/www/wind-dir-card.js`.
2. In Settings → Dashboards → Resources, add:
   - URL: `/local/wind-dir-card.js`
   - Type: JavaScript Module
3. Reload the dashboard.

### Manual update

If you installed manually (not via HACS), pull in new versions like this:

1. Download the latest `wind-dir-card.js` from this repo (or `git pull` if you
   cloned it) and overwrite `<config>/www/wind-dir-card.js`.
2. Bump the cache-busting version so browsers/HA actually fetch the new file
   instead of a cached copy: in Settings → Dashboards → Resources, edit the
   `/local/wind-dir-card.js` resource and add/update a `?v=` query string,
   e.g. `/local/wind-dir-card.js?v=2` (increment it on every update).
3. Reload the dashboard with a hard refresh (Ctrl+Shift+R / Cmd+Shift+R) so
   the browser doesn't serve the old cached module.
4. If the card still shows old behavior, restart Home Assistant or clear the
   frontend cache (Settings → General → hamburger menu → **Clear cache and
   reload**) to force a full reload of custom card resources.

## Configuration

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

## Example

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

## Notes

- If an entity is `unavailable`/`unknown`, the affected part of the dial is
  hidden and the card dims slightly instead of erroring.
- Colors are pulled from your active HA theme (`--primary-text-color`,
  `--card-background-color`, etc.) with sensible dark-theme fallbacks, so the
  card looks reasonable in both light and dark themes without configuration.
