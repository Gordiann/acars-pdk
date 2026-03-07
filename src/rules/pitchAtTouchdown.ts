/**
 * Penalize excessive pitch at touchdown (> 8 degrees)
 */
import { PirepState } from '../defs'
import { Meta, Rule, RuleValue } from '../types/rule'
import { Telemetry, Pirep } from '../types/types'

export default class PitchAtTouchdownRule implements Rule {
  meta: Meta = {
    id: 'PITCH_AT_TOUCHDOWN',
    name: 'Excessive pitch at touchdown',
    enabled: true,
    message: 'Pitch exceeded 8 degrees at touchdown',
    states: [PirepState.Landed],
    repeatable: false,
    points: -5,
  }

  violated(pirep: Pirep, data: Telemetry, previousData?: Telemetry): RuleValue {
    if (data.onGround == true && previousData?.onGround == false && data.pitch > 8) {
      return [`Pitch at touchdown was ${data.pitch.toFixed(1)} degrees (max 8)`]
    }
  }
}
