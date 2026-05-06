/**
 * Penalize inaccurate payload loading compared to the flight plan
 */
import { PirepState } from '../defs'
import { Meta, Rule, RuleValue } from '../types/rule'
import { Telemetry, Pirep } from '../types/types'

export default class InaccurateLoadingRule implements Rule {
  meta: Meta = {
    id: 'INACCURATE_LOADING',
    name: 'Inaccurate loading',
    enabled: true,
    message: 'Inaccurate loading',
    states: [PirepState.Pushback],
    repeatable: false,
    cooldown: 60,
    max_count: 3,
    points: -10,
    delay_time: 10,
  }

  violated(pirep: Pirep, data: Telemetry): RuleValue {
    const sbWeights = pirep.flightPlan?.simBriefFlightPlan?.weights
    const fpPayload = sbWeights ? sbWeights.payload : 0
    const acPayload =
      data.payloadWeight.Kilograms != 0
        ? data.payloadWeight.Kilograms
        : 0

    Acars.AddPirepLogOnce(
      'LOADING_DEBUG',
      `Loading debug: hasFlightPlan=${!!pirep.flightPlan}, simbriefId=${pirep.flightPlan?.simbriefId ?? 'null'}, hasSimBriefFP=${!!pirep.flightPlan?.simBriefFlightPlan}, fpPayload=${fpPayload}, acPayload=${acPayload}`,
    )

    if (fpPayload == 0 || acPayload == 0) {
      return
    }

    const violated = Acars.NumberOverPercent(fpPayload, acPayload, 10)

    if (violated) {
      return [
        `Payload not accurate. Planned payload: ${fpPayload}, actual payload: ${acPayload}.`,
      ]
    }
  }
}
