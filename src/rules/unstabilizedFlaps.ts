/**
 * Penalize flap changes below 1000ft AGL on approach
 */
import { PirepState } from '../defs'
import { Meta, Rule, RuleValue } from '../types/rule'
import { Telemetry, Pirep } from '../types/types'

export default class UnstabilizedFlapsRule implements Rule {
  meta: Meta = {
    id: 'UNSTABILIZED_FLAPS',
    name: 'Unstabilized flaps on approach',
    enabled: true,
    message: 'Flap configuration changed below 1000ft AGL',
    states: [PirepState.Approach, PirepState.Final],
    repeatable: true,
    cooldown: 10,
    max_count: 5,
    points: -5,
  }

  violated(pirep: Pirep, data: Telemetry, previousData?: Telemetry): RuleValue {
    if (
      previousData &&
      data.flaps != previousData.flaps &&
      data.groundAltitude.Feet < 1000 &&
      !data.onGround
    ) {
      return [
        `Flap change at ${data.groundAltitude.Feet.toFixed(0)}ft AGL (flaps ${previousData.flaps} → ${data.flaps})`,
      ]
    }
  }
}
