/**
 * Award a bonus for accurate payload loading within tolerance of the flight plan
 */
import { PirepState } from '../defs'
import { Meta, Rule, RuleValue } from '../types/rule'
import { Telemetry, Pirep } from '../types/types'

export default class PayloadRule implements Rule {
  meta: Meta = {
    id: 'ACCURATE_LOADING_BONUS',
    name: 'Accurate loading bonus',
    enabled: true,
    message: 'Accurate loading bonus',
    states: [PirepState.Pushback],
    repeatable: false,
    cooldown: 60,
    max_count: 3,
    points: 10,
    delay_time: 10,
  }

  violated(pirep: Pirep, data: Telemetry, previousData?: Telemetry): RuleValue {
    const sbWeights = pirep.flightPlan?.simBriefFlightPlan?.weights
    const fpPayload = sbWeights ? sbWeights.payload : 0
    const acPayload =
      data.payloadWeight.Kilograms != 0
        ? data.payloadWeight.Kilograms
        : 0

    Acars.AddPirepLogOnce(
      'LOADING_BONUS_DEBUG',
      `Loading debug: hasFlightPlan=${!!pirep.flightPlan}, simbriefId=${pirep.flightPlan?.simbriefId ?? 'null'}, hasSimBriefFP=${!!pirep.flightPlan?.simBriefFlightPlan}, fpPayload=${fpPayload}, cargoKg=${pirep.flightPlan?.cargoWeight?.Kilograms ?? 'null'}, paxCount=${pirep.flightPlan?.passengersCount ?? 'null'}, acPayload=${acPayload}`,
    )

    if (fpPayload == 0 || acPayload == 0) {
      return
    }

    const violated = Acars.NumberWithinPercent(acPayload, fpPayload, 15)

    if (violated) {
      return [
        `Bonus for accurate loading! Planned payload: ${fpPayload}, actual payload: ${acPayload}. Bonus: +`,
      ]
    }
  }
}
