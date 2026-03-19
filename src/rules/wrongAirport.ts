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
    states: [PirepState.Landed],
    repeatable: false,
    cooldown: 60,
    max_count: 1,
    points: -50,
  }

  violated(pirep: Pirep, data: Telemetry): RuleValue {
    const actDest = data.runway?.icao
    if (!actDest) return

    const allowed = new Set<string>()

    // Destination from bid/flight plan
    if (pirep.arrivalAirport?.icao) allowed.add(pirep.arrivalAirport.icao)

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
