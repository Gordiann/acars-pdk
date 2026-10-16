/**
 * Small geo helpers shared by rules that need to corroborate a sim-reported
 * airport/runway ICAO against the aircraft's actual position. `data.runway.icao`
 * can be stale or wrong — e.g. in MSFS 2020 it may report the departure airport
 * when the destination isn't cleanly present in the sim navdata — so rules fall
 * back to a distance check against known airport coordinates.
 */
import { Coords } from '../types/types'

/** Build a Coords from a lat/lon pair, or undefined if either is missing. */
export function toCoords(
  lat?: number | null,
  lon?: number | null,
): Coords | undefined {
  if (lat == null || lon == null) return undefined
  return { lat, lon }
}

/** Great-circle distance between two coordinates, in nautical miles. */
export function distanceNm(a: Coords, b: Coords): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const earthRadiusNm = 3440.065

  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2

  return earthRadiusNm * 2 * Math.asin(Math.min(1, Math.sqrt(h)))
}

/** True if `here` is within `maxNm` of any candidate coordinate. */
export function isNearAnyCoords(
  here: Coords | undefined,
  targets: (Coords | undefined)[],
  maxNm: number,
): boolean {
  if (!here) return false
  return targets.some((t) => t != null && distanceNm(here, t) <= maxNm)
}
