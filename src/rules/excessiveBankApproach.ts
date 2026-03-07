/**
 * Penalize excessive bank angle on approach based on altitude bands
 */
import { PirepState } from '../defs'
import { Meta, Rule, RuleValue } from '../types/rule'
import { Telemetry, Pirep } from '../types/types'

export default class ExcessiveBankApproachRule implements Rule {
  meta: Meta = {
    id: 'EXCESSIVE_BANK_APPROACH',
    name: 'Excessive bank on approach',
    enabled: true,
    message: 'Excessive bank angle on approach',
    states: [PirepState.Approach, PirepState.Final],
    repeatable: true,
    cooldown: 10,
    max_count: 5,
    points: -5,
  }

  violated(pirep: Pirep, data: Telemetry, previousData?: Telemetry): RuleValue {
    const alt = data.groundAltitude.Feet
    const absBank = Math.abs(data.bank)

    if (alt >= 300 && alt <= 1000) {
      return Acars.ViolatedAfterDelay('excessive_bank_approach_high', 3000, () =>
        absBank > 30
          ? [`Bank ${absBank.toFixed(1)}° exceeded 30° limit at ${alt.toFixed(0)}ft (1000-300ft band)`]
          : false,
      )
    }

    if (alt >= 50 && alt < 300) {
      return Acars.ViolatedAfterDelay('excessive_bank_approach_low', 3000, () =>
        absBank > 10
          ? [`Bank ${absBank.toFixed(1)}° exceeded 10° limit at ${alt.toFixed(0)}ft (300-50ft band)`]
          : false,
      )
    }
  }
}
