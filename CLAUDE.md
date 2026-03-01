# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **vmsACARS Plugin Development Kit (PDK)** — a TypeScript framework for building plugins for the vmsACARS flight simulation ACARS system. Plugins are written in TypeScript, transpiled to JavaScript, and distributed as ZIP files to pilots running vmsACARS.

## Build Commands

```shell
npm run build      # Compile TypeScript, lint, format, copy assets to dist/
npm run dev        # Watch mode — auto-builds and copies to ACARS profile directory
npm run dist       # Clean, build, then create distributable ZIP
npm run clean      # Remove dist/ and distribution ZIP
npm run lint       # ESLint with --fix
npm run format     # Prettier on src/**/*.{js,ts}
npm run tsbuild    # Direct TypeScript compilation only (no lint/format)
```

## Environment Setup

Copy `.env.example` to `.env` and set `ACARS_PROFILE_NAME`. The `dev` command uses `ACARS_SCRIPTS_PATH` to copy built files into the local vmsACARS config directory for testing.

## Code Style

- **No semicolons**, single quotes, trailing commas (Prettier config in package.json)
- 2-space indentation (ESLint enforced)
- Target: ES2023, Module: ES2022
- Use `==` instead of `===` for comparisons involving sim values — types from the simulator may not always match (e.g., `1` returned instead of `true`)

## Architecture — Three Plugin Types

All source lives in `src/`. Each plugin is a class that exports as default and follows a specific interface.

### 1. Aircraft Configurations (`src/aircraft/`)

Extend `AircraftConfig` abstract class from `src/interface/aircraft.ts`. Map simulator-specific variables (LVars, datarefs, offsets) to standardized aircraft features.

- **`meta`** — id, name, sim type (`AircraftConfigSimType`), enabled, priority (1-10; built-in defaults=1, aircraft-specific=2, custom should be 3+)
- **`features`** — `FeatureAddresses` dict mapping `AircraftFeature` enum to lookup addresses with `FeatureType`
- **`match(title, icao, config_path)`** — return boolean; all args are pre-lowercased
- **Feature methods** (e.g., `beaconLights(...)`) — receive looked-up values as args, return `FeatureState` (boolean | null)
- **`flapNames`** — optional dict mapping flap index to display name
- Set a feature to `false` to explicitly ignore it

### 2. Rules (`src/rules/`)

Implement the `Rule` interface from `src/types/rule.d.ts`. Evaluate flight violations and award/deduct points.

- **`meta`** — id, name, enabled, message, states (`PirepState[]`), repeatable, cooldown (seconds), max_count, points
- **`violated(pirep, data, previousData?)`** — returns `RuleValue`:
  - `undefined`/`false` = pass
  - `true` = violated (uses meta message/points)
  - `['message', points]` = violated with custom message/points
- **`completed?(points, count, pirep, data)`** — optional post-violation callback
- Check feature states via `data.features[AircraftFeature.X]`

### 3. Callback Scripts (`src/scripts/`)

Implement `CallbackHook` interface from `src/types/callback.d.ts`. Continuous monitoring hooks.

- **`setup()`** — called once at load; initialize state with `Acars.Set()`
- **`run(pirep, data, previousData?)`** — called every ~500ms during flight
- **`phaseChange(pirep, data, newPhase, oldPhase)`** — called on flight phase transitions; do not use timer functions here

### Global API (`Acars` namespace — `src/types/global.d.ts`)

Key methods: `Acars.Get/Set` (key-value storage), `Acars.SetPirepField`, `Acars.AddPirepLog/AddPirepLogOnce`, `Acars.PlayAudio` (from `src/sounds/`), `Acars.StartTimer/TimeElapsed/IsTimeElapsed/StopTimer`, `Acars.ViolatedAfterDelay`, `Acars.RunAfterDelay`, `Acars.NumberWithinPercent/NumberOverPercent`.

## Key Type Files

- `src/defs.ts` — All enums: `PirepState`, `AircraftFeature`, `FeatureType`, `AircraftConfigSimType`, `SimType`, `EngineType`, etc.
- `src/types/types.d.ts` — Core data interfaces: `Pirep`, `Telemetry`, `Airport`, `Runway`, `FlightPlan`, `SimBriefFlightPlan`, unit types (`Length`, `Speed`, `Mass`)
- `src/types/global.d.ts` — Global `Acars` and `console` namespace declarations
- `src/interface/aircraft.ts` — `AircraftConfig` abstract class, `FeatureAddresses`, `FlapNames`, `FeatureState`, `Priority` types

## Unit Types

Telemetry values like altitude, speed, and mass use unit wrapper types (from UnitsNet). Access specific units as properties: `data.groundAltitude.Feet`, `data.indicatedAirspeed.Knots`, `data.fuelQuantity.Kilograms`, `data.verticalSpeed.FeetPerMinute`.
