/**
 * Penalize excessive descent rate based on altitude bands
 */
import { PirepState } from '../defs'
import { Meta, Rule, RuleValue } from '../types/rule'
import { Telemetry, Pirep } from '../types/types'

export default class ExcessiveDescentRateRule implements Rule {
  meta: Meta = {
    id: 'EXCESSIVE_DESCENT_RATE',
    name: 'Excessive descent rate',
    enabled: true,
    message: 'Descent rate exceeded safe limits for altitude',
    states: [PirepState.Enroute, PirepState.Approach, PirepState.Final],
    repeatable: true,
    cooldown: 30,
    max_count: 10,
    points: -5,
  }

  violated(pirep: Pirep, data: Telemetry, previousData?: Telemetry): RuleValue {
    const alt = data.groundAltitude.Feet
    const vs = data.verticalSpeed.FeetPerMinute

    // Only check when actually descending
    if (vs >= 0) return

    const descentRate = Math.abs(vs)

    let maxRate = 0
    let band = ''

    if (alt >= 3000 && alt <= 10000) {
      maxRate = 3000
      band = '10000-3000ft'
    } else if (alt >= 2000 && alt < 3000) {
      maxRate = 2800
      band = '3000-2000ft'
    } else if (alt >= 1000 && alt < 2000) {
      maxRate = 2000
      band = '2000-1000ft'
    } else if (alt >= 500 && alt < 1000) {
      maxRate = 1100
      band = '1000-500ft'
    } else if (alt < 500) {
      maxRate = 1000
      band = 'below 500ft'
    }

    if (maxRate == 0) return

    return Acars.ViolatedAfterDelay('excessive_descent', 6000, () => {
      if (descentRate > maxRate) {
        return [
          `Descent rate ${descentRate.toFixed(0)} fpm exceeds ${maxRate} fpm limit at ${band}`,
        ]
      }
      return false
    })
  }
}
