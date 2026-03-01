/**
 * Award a bonus when the pilot lands at the alternate airport
 */
import { PirepState } from '../defs'
import { Meta, Rule, RuleValue } from '../types/rule'
import { Telemetry, Pirep } from '../types/types'

export default class AlternateBonusRule implements Rule {
  meta: Meta = {
    id: 'ALTERNATE_BONUS',
    name: 'Land at alternate',
    enabled: true,
    message: 'Land at alternate',
    states: [PirepState.Landed],
    repeatable: false,
    cooldown: 60,
    max_count: 3,
    points: 50,
    delay_time: 10,
  }

  violated(pirep: Pirep, data: Telemetry): RuleValue {
    const actDest = data.runway?.icao
    if (actDest == undefined) return

    const alternates = new Set<string>()

    // Alternate from bid
    if (pirep.flight?.altIcao) alternates.add(pirep.flight.altIcao)

    // Alternate from flight plan
    if (pirep.flightPlan?.altIcao) alternates.add(pirep.flightPlan.altIcao)

    // SimBrief alternate
    const sbAltn = pirep.flightPlan?.simBriefFlightPlan?.alternate?.icaoCode
    if (sbAltn) alternates.add(sbAltn)

    if (alternates.size === 0) return

    if (!alternates.has(actDest)) return

    return [
      `Alternate airport bonus! Alternate=${actDest}. Bonus: +`,
    ]
  }
}
