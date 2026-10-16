/**
 * Penalize when the pilot lands at an airport not matching
 * the destination or any alternate from the flight plan / SimBrief
 */
import { PirepState } from '../defs'
import { Meta, Rule, RuleValue } from '../types/rule'
import { Telemetry, Pirep, Coords } from '../types/types'
import { isNearAnyCoords, toCoords } from '../util/geo'

/**
 * How close (nautical miles) the touchdown point must be to an expected
 * airport for us to treat the landing as correct even when the sim-reported
 * runway ICAO doesn't match.
 */
const MAX_LANDING_DISTANCE_NM = 5

export default class WrongAirportRule implements Rule {
  meta: Meta = {
    id: 'WRONG_AIRPORT',
    name: 'Wrong airport landing',
    enabled: true,
    message: 'Landed at wrong airport',
    states: [PirepState.TaxiIn, PirepState.OnBlock],
    repeatable: false,
    cooldown: 60,
    max_count: 1,
    points: -50,
  }

  violated(pirep: Pirep, data: Telemetry): RuleValue {
    const actDest = pirep.arrivalAirport?.icao

    // DEBUG: log what we actually receive so we can compare against the plan
    Acars.AddPirepLog(
      `[WRONG_AIRPORT debug] actDest=${JSON.stringify(actDest)} ` +
        `flight.arrivalIcao=${JSON.stringify(pirep.flight?.arrivalIcao)} ` +
        `flightPlan.arrivalAirport.icao=${JSON.stringify(pirep.flightPlan?.arrivalAirport?.icao)} ` +
        `flight.altIcao=${JSON.stringify(pirep.flight?.altIcao)} ` +
        `flightPlan.altIcao=${JSON.stringify(pirep.flightPlan?.altIcao)} ` +
        `sbDest=${JSON.stringify(pirep.flightPlan?.simBriefFlightPlan?.destination?.icaoCode)} ` +
        `sbAltn=${JSON.stringify(pirep.flightPlan?.simBriefFlightPlan?.alternate?.icaoCode)}`,
    )

    if (!actDest) return

    const allowed = new Set<string>()

    // Destination from bid
    if (pirep.flight?.arrivalIcao) allowed.add(pirep.flight.arrivalIcao)

    // Destination from flight plan
    if (pirep.flightPlan?.arrivalAirport?.icao) allowed.add(pirep.flightPlan.arrivalAirport.icao)

    // Alternate from bid
    if (pirep.flight?.altIcao) allowed.add(pirep.flight.altIcao)

    // Alternate from flight plan
    if (pirep.flightPlan?.altIcao) allowed.add(pirep.flightPlan.altIcao)

    // SimBrief destination
    const sbDest = pirep.flightPlan?.simBriefFlightPlan?.destination?.icaoCode
    if (sbDest) allowed.add(sbDest)

    // SimBrief alternate
    const sbAltn = pirep.flightPlan?.simBriefFlightPlan?.alternate?.icaoCode
    if (sbAltn) allowed.add(sbAltn)

    // No plan data — don't penalize
    if (allowed.size === 0) return

    if (allowed.has(actDest)) return

    // The sim-reported runway ICAO disagrees with the plan, but it can't be
    // trusted on its own. Corroborate with the actual touchdown position: if we
    // physically landed within range of an expected airport, it's a correct
    // landing and the ICAO reading was stale/wrong — don't penalize.
    //
    // Note: only airports we can resolve coordinates for are checked (flight
    // plan airport objects + SimBrief). An alternate known only by ICAO string
    // can't be position-verified, so a stale ICAO on such a diversion may still
    // be penalized.
    if (isNearAnyCoords(data.location, this.expectedAirportCoords(pirep), MAX_LANDING_DISTANCE_NM)) {
      return
    }

    const list = Array.from(allowed).join(', ')
    return [
      `Wrong airport! Landed at ${actDest}${this.formatLocation(data.location)}, allowed: ${list}. Penalty: `,
    ]
  }

  /** Coordinates of every destination/alternate airport we can resolve. */
  private expectedAirportCoords(pirep: Pirep): (Coords | undefined)[] {
    const sb = pirep.flightPlan?.simBriefFlightPlan
    return [
      // Destination / detected arrival airports from the flight plan
      pirep.flightPlan?.arrivalAirport?.location,
      pirep.arrivalAirport?.location,
      // SimBrief destination / alternate carry their own coordinates
      toCoords(sb?.destination?.latitude, sb?.destination?.longitude),
      toCoords(sb?.alternate?.latitude, sb?.alternate?.longitude),
    ]
  }

  /** Append the touchdown coordinates so auditors can verify the real location. */
  private formatLocation(here?: Coords): string {
    if (!here) return ''
    return ` (${here.lat.toFixed(4)}, ${here.lon.toFixed(4)})`
  }
}
