/**
 * Penalize landing on nose gear (pitch < 0 at touchdown)
 */
import { PirepState } from '../defs'
import { Meta, Rule, RuleValue } from '../types/rule'
import { Telemetry, Pirep } from '../types/types'

export default class NoseGearLandingRule implements Rule {
  meta: Meta = {
    id: 'NOSE_GEAR_LANDING',
    name: 'Nose gear landing',
    enabled: true,
    message: 'Landed on nose gear',
    states: [PirepState.Landed],
    repeatable: false,
    points: -5,
  }

  violated(pirep: Pirep, data: Telemetry, previousData?: Telemetry): RuleValue {
    if (data.onGround == true && previousData?.onGround == false && data.pitch < 0) {
      return [`Nose gear landing detected (pitch ${data.pitch.toFixed(1)} degrees)`]
    }
  }
}
