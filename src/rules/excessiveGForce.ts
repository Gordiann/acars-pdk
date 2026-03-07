/**
 * Penalize excessive G-force (> 2.5 or < -1.0)
 */
import { PirepState } from '../defs'
import { Meta, Rule, RuleValue } from '../types/rule'
import { Telemetry, Pirep } from '../types/types'

export default class ExcessiveGForceRule implements Rule {
  meta: Meta = {
    id: 'EXCESSIVE_G_FORCE',
    name: 'Excessive G-force',
    enabled: true,
    message: 'G-force exceeded safe limits',
    states: [
      PirepState.Takeoff,
      PirepState.InitialClimb,
      PirepState.Enroute,
      PirepState.Approach,
      PirepState.Final,
    ],
    repeatable: true,
    cooldown: 30,
    max_count: 10,
    points: -5,
  }

  violated(pirep: Pirep, data: Telemetry, previousData?: Telemetry): RuleValue {
    if (data.gForce > 2.5 || data.gForce < -1.0) {
      return [`G-force was ${data.gForce.toFixed(2)} (limits: -1.0 to 2.5)`]
    }
  }
}
