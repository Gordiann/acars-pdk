/**
 * Award a bonus for flights exceeding a distance threshold
 */
import { PirepState } from '../defs'
import { Meta, Rule, RuleValue } from '../types/rule'
import { Telemetry, Pirep } from '../types/types'

export default class LongFlightRule implements Rule {
  meta: Meta = {
    id: 'LONG_FLIGHT',
    name: 'Long flight',
    enabled: true,
    message: 'Long flight',
    states: [PirepState.OnBlock],
    repeatable: false,
    cooldown: 60,
    max_count: 3,
    points: 10,
    delay_time: 10,
    parameter: 3000,
  }

  violated(pirep: Pirep, data: Telemetry, previousData?: Telemetry): RuleValue {
    const absDistance = Math.abs(pirep.actualDistance.Miles)
    const absParam = Math.abs(this.meta.parameter)
    if (absDistance < absParam) {
      return
    }
    
    return [
      `Long flight bonus! Distance traveled=${absDistance}, threshold=${absParam}. Bonus: +`,
    ]
  }
}
