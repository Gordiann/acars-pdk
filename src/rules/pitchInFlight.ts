/**
 * Penalize excessive pitch in flight (> 20 degrees)
 */
import { PirepState } from '../defs'
import { Meta, Rule, RuleValue } from '../types/rule'
import { Telemetry, Pirep } from '../types/types'

export default class PitchInFlightRule implements Rule {
  meta: Meta = {
    id: 'PITCH_IN_FLIGHT',
    name: 'Excessive pitch in flight',
    enabled: true,
    message: 'Pitch exceeded 20 degrees in flight',
    states: [
      PirepState.InitialClimb,
      PirepState.Enroute,
      PirepState.Approach,
      PirepState.Final,
    ],
    repeatable: true,
    cooldown: 30,
    max_count: 5,
    points: -5,
  }

  violated(pirep: Pirep, data: Telemetry, previousData?: Telemetry): RuleValue {
    if (Math.abs(data.pitch) > 20) {
      return [`Pitch was ${data.pitch.toFixed(1)} degrees (max ±20)`]
    }
  }
}
