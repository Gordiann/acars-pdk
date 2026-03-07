/**
 * Penalize bank angle > 35 degrees for more than 3 seconds
 */
import { PirepState } from '../defs'
import { Meta, Rule, RuleValue } from '../types/rule'
import { Telemetry, Pirep } from '../types/types'

export default class ExcessiveBankAngleRule implements Rule {
  meta: Meta = {
    id: 'EXCESSIVE_BANK_ANGLE',
    name: 'Excessive bank angle',
    enabled: true,
    message: 'Bank angle exceeded 35 degrees for more than 3 seconds',
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
    return Acars.ViolatedAfterDelay('excessive_bank', 3000, () =>
      Math.abs(data.bank) > 35 ? true : false,
    )
  }
}
