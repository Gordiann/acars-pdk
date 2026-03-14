/**
 * Award a bonus for landing below a vertical speed threshold
 */
import { PirepState } from '../defs'
import { Meta, Rule, RuleValue } from '../types/rule'
import { Telemetry, Pirep } from '../types/types'

export default class SmoothLandingRule implements Rule {
  meta: Meta = {
    id: 'SMOOTH_LANDING',
    name: 'Smooth landing',
    enabled: true,
    message: 'Smooth landing',
    states: [PirepState.TaxiIn, PirepState.Landed],
    repeatable: false,
    cooldown: 60,
    max_count: 3,
    points: 10,
    parameter: 150,
  }

  violated(pirep: Pirep, data: Telemetry, previousData?: Telemetry): RuleValue {
    const absRate = Math.abs(pirep.landingRate.FeetPerMinute)
    const absParam = Math.abs(this.meta.parameter)
    if (absRate > absParam) {
      return
    }
    return [`Smooth landing! Rate=${Math.round(absRate)}, threshold=${absParam}. Bonus: +`]
  }
}
