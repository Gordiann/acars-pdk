/**
 * Penalize Mach > 0.88 for more than 20 seconds
 */
import { PirepState } from '../defs'
import { Meta, Rule, RuleValue } from '../types/rule'
import { Telemetry, Pirep } from '../types/types'

export default class ExcessiveMachRule implements Rule {
  meta: Meta = {
    id: 'EXCESSIVE_MACH',
    name: 'Excessive Mach speed',
    enabled: true,
    message: 'Mach exceeded 0.88 for more than 20 seconds',
    states: [PirepState.Enroute, PirepState.InitialClimb],
    repeatable: true,
    cooldown: 60,
    max_count: 5,
    points: -5,
  }

  violated(pirep: Pirep, data: Telemetry, previousData?: Telemetry): RuleValue {
    return Acars.ViolatedAfterDelay('excessive_mach', 20000, () =>
      data.indicatedAirspeed.Mach > 0.88 ? true : false,
    )
  }
}
