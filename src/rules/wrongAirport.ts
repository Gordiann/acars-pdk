/**
 * Penalize when the pilot lands at an airport not matching
 * the destination or any alternate from the flight plan / SimBrief
 */
import { PirepState } from '../defs'
import { Meta, Rule, RuleValue } from '../types/rule'
import { Telemetry, Pirep } from '../types/types'

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

    const list = Array.from(allowed).join(', ')
    return [
      `Wrong airport! Landed at ${actDest}, allowed: ${list}. Penalty: `,
    ]
  }
}
