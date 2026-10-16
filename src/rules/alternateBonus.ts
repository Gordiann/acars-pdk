/**
 * Award a bonus when the pilot lands at the alternate airport
 */
import { PirepState } from '../defs'
import { Meta, Rule, RuleValue } from '../types/rule'
import { Telemetry, Pirep, Coords } from '../types/types'
import { isNearAnyCoords, toCoords } from '../util/geo'

/**
 * How close (nautical miles) the touchdown point must be to the alternate for
 * us to award the bonus even when the detected arrival ICAO doesn't match.
 */
const MAX_LANDING_DISTANCE_NM = 5

export default class AlternateBonusRule implements Rule {
  meta: Meta = {
    id: 'ALTERNATE_BONUS',
    name: 'Land at alternate',
    enabled: true,
    message: 'Land at alternate',
    states: [PirepState.Landed, PirepState.OnBlock],
    repeatable: false,
    cooldown: 60,
    max_count: 3,
    points: 50,
    delay_time: 10,
  }

  violated(pirep: Pirep, data: Telemetry): RuleValue {
    const actDest = pirep.arrivalAirport?.icao
    if (!actDest) return

    const alternates = new Set<string>()

    // Alternate from bid
    if (pirep.flight?.altIcao) alternates.add(pirep.flight.altIcao)

    // Alternate from flight plan
    if (pirep.flightPlan?.altIcao) alternates.add(pirep.flightPlan.altIcao)

    // SimBrief alternate
    const sbAltn = pirep.flightPlan?.simBriefFlightPlan?.alternate?.icaoCode
    if (sbAltn) alternates.add(sbAltn)

    if (alternates.size === 0) return

    // The detected arrival ICAO can be stale/wrong (e.g. in MSFS 2020 it may
    // report the departure airport when the airport isn't cleanly in the sim
    // navdata). If the ICAO doesn't match, fall back to the actual touchdown
    // position before deciding the pilot did not land at the alternate.
    if (
      !alternates.has(actDest) &&
      !isNearAnyCoords(data.location, this.alternateCoords(pirep), MAX_LANDING_DISTANCE_NM)
    ) {
      return
    }

    return [
      `Alternate airport bonus! Alternate=${actDest}. Bonus: +`,
    ]
  }

  /** Coordinates of the alternate airport(s) we can resolve. */
  private alternateCoords(pirep: Pirep): (Coords | undefined)[] {
    const sb = pirep.flightPlan?.simBriefFlightPlan
    // Only SimBrief carries alternate coordinates; a bid/flight-plan alternate
    // known only by ICAO string can't be position-verified.
    return [toCoords(sb?.alternate?.latitude, sb?.alternate?.longitude)]
  }
}
