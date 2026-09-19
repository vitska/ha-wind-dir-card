# Wind Direction Card

A Home Assistant Lovelace custom card that draws an SVG compass showing:

- momentary wind direction (arrow)
- average wind direction sector (translucent arc overlay)
- cardinal directions (N/E/S/W) with a tick ring
- momentary wind speed (center readout)
- wind gusts (secondary readout)

The card resizes to fill whatever tile it's given (e.g. one column of a
`horizontal-stack`) while staying square.

## Install

### Via HACS (custom repository)

1. HACS → Frontend → menu (⋮) → **Custom repositories**.
2. Add this repository's URL, category **Lovelace**.
3. Install "Wind Direction Card", then reload your browser.

### Manual

1. Copy `wind-dir-card.js` into `<config>/www/wind-dir-card.js`.
2. In Settings → Dashboards → Resources, add:
   - URL: `/local/wind-dir-card.js`
   - Type: JavaScript Module
3. Reload the dashboard.

## Configuration

| Option                      | Required | Description                                                              |
| ---------------------------- | -------- | ------------------------------------------------------------------------- |
| `type`                        | yes      | `custom:wind-dir-card`                                                    |
| `wind_direction_entity`       | yes      | Entity with momentary wind direction in degrees (0–360)                   |
| `wind_speed_entity`           | yes      | Entity with momentary wind speed                                          |
| `wind_gust_entity`            | no       | Entity with wind gust speed, shown as a secondary readout                 |
| `wind_direction_avg_entity`   | no       | Entity with average wind direction in degrees, drives the sector overlay  |
| `sector_width`                | no       | Width in degrees of the average-direction sector arc (default `30`)       |
| `sector_color`                | no       | CSS color for the sector overlay (default: theme accent color)            |
| `speed_unit`                  | no       | Overrides the unit shown for speed/gust (default: entity's own unit)      |
| `speed_precision`             | no       | Decimal places shown for the speed readout (default `0`)                  |
| `gust_precision`              | no       | Decimal places shown for the gust readout (default `0`)                   |
| `padding`                     | no       | Padding in px around the dial inside the tile (default `8`). `0` makes the dial fill the tile edge-to-edge |
| `name`                        | no       | Optional card header/title                                                |

## Example

```yaml
type: horizontal-stack
cards:
  - type: custom:wind-dir-card
    name: Wind
    wind_direction_entity: sensor.wind_direction
    wind_direction_avg_entity: sensor.wind_direction_avg
    wind_speed_entity: sensor.wind_speed
    wind_gust_entity: sensor.wind_gust
    sector_width: 30
    sector_color: "#58a6ff"
    speed_precision: 1
    gust_precision: 0
    padding: 0
  - type: custom:wind-dir-card
    name: Wind (roof station)
    wind_direction_entity: sensor.roof_wind_direction
    wind_speed_entity: sensor.roof_wind_speed
```

## Notes

- If an entity is `unavailable`/`unknown`, the affected part of the dial is
  hidden and the card dims slightly instead of erroring.
- Colors are pulled from your active HA theme (`--primary-text-color`,
  `--card-background-color`, etc.) with sensible dark-theme fallbacks, so the
  card looks reasonable in both light and dark themes without configuration.
