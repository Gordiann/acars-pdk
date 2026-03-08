/**
 * Penalize excessive pitch at liftoff (> 8.5 degrees)
 */
import { PirepState } from '../defs'
import { Meta, Rule, RuleValue } from '../types/rule'
import { Telemetry, Pirep } from '../types/types'

export default class PitchAtTakeoffRule implements Rule {
  meta: Meta = {
    id: 'PITCH_AT_TAKEOFF',
    name: 'Excessive pitch at takeoff',
    enabled: true,
    message: 'Pitch exceeded 15 degrees at liftoff',
    states: [PirepState.Takeoff],
    repeatable: false,
    points: -5,
  }

  violated(pirep: Pirep, data: Telemetry, previousData?: Telemetry): RuleValue {
    if (data.onGround == false && previousData?.onGround == true) {
      if (data.pitch > 15) {
        return [`Pitch at liftoff was ${data.pitch.toFixed(1)} degrees (max 15)`]
      }
    }
  }
}
