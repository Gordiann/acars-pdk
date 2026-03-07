/**
 * Penalize flaps retracted to 0 below 800ft AGL
 */
import { PirepState } from '../defs'
import { Meta, Rule, RuleValue } from '../types/rule'
import { Telemetry, Pirep } from '../types/types'

export default class EarlyFlapRetractionRule implements Rule {
  meta: Meta = {
    id: 'EARLY_FLAP_RETRACTION',
    name: 'Early flap retraction',
    enabled: true,
    message: 'Flaps retracted below 800ft AGL',
    states: [PirepState.Takeoff, PirepState.InitialClimb],
    repeatable: false,
    points: -5,
  }

  violated(pirep: Pirep, data: Telemetry, previousData?: Telemetry): RuleValue {
    if (data.flaps == 0 && data.groundAltitude.Feet < 800 && !data.onGround) {
      return [
        `Flaps retracted at ${data.groundAltitude.Feet.toFixed(0)}ft AGL (min 800ft)`,
      ]
    }
  }
}
