# Treasure Hunt — Phase 1 POC

Solo GeoGuessr-style treasure hunt: Mapillary street view, sequential clues, Interact to collect.

## Apps

| App | Role | Default URL |
|-----|------|-------------|
| `apps/py-geo` | Hardcoded map packs | http://localhost:8000 |
| `apps/nest-api` | In-memory game sessions | http://localhost:3000/api |
| `apps/web-ui` | Angular + Mapillary UI | http://localhost:4200 |

## Prerequisites

1. **Mapillary client access token** — create an app at [Mapillary developers](https://www.mapillary.com/dashboard/developers) and paste the token into [`apps/web-ui/src/app/environment.ts`](apps/web-ui/src/app/environment.ts) (`mapillaryAccessToken`).
2. Python 3.10–3.11 for `py-geo` (Poetry).

## Run (three terminals)

```sh
# 1) Map packs
npx nx serve apps/py-geo

# 2) Game API (optional: PY_GEO_URL=http://localhost:8000)
npx nx serve nest-api

# 3) UI
npx nx serve web-ui
```

Open http://localhost:4200 → **Start game** → read the puzzle → walk with Mapillary arrows to the matching place → **Interact** → collect clues → claim treasure.

### Puzzle testing (answer locations on real Mapillary coverage)

Verified against Mapillary images + map features in the Catalina demo area.
Interact succeeds if you are within **25 m** of the feature **or** standing on an accepted panorama (`imageId`).

| Puzzle | Answer | Feature lat/lng | Key imageId |
|--------|--------|-----------------|-------------|
| Find the red octagon… | Stop sign | 33.344887, -118.32671 | `170278004982541` |
| Seek the metal bin… | Trash can | 33.344673, -118.32679 | `509992236687312` |
| Shopfront notice… | Store sign | 33.344547, -118.3267 | `223885939068053` |

Start image: `1182252392217616` at `33.344816956699, -118.32687565137`.

Nest logs each Interact with distance + `byImage` / `byDistance` — check the `nest-api` terminal when debugging.

## Env knobs

- `apps/web-ui/src/app/environment.ts` — `mapillaryAccessToken`, `nestApiUrl`, `defaultMapId`
- `PY_GEO_URL` (nest-api) — defaults to `http://localhost:8000`
- `PORT` (nest-api) — defaults to `3000`

Map pack `catalina-poc` lives in [`apps/py-geo/apps/py_geo/map_packs.py`](apps/py-geo/apps/py_geo/map_packs.py).
