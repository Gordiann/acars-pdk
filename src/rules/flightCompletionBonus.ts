/**
 * Award a bonus for completing a flight — always granted upon landing
 */
import { PirepState } from '../defs'
import { Meta, Rule, RuleValue } from '../types/rule'
import { Telemetry, Pirep } from '../types/types'

export default class FlightCompletionBonusRule implements Rule {
  meta: Meta = {
    id: 'FLIGHT_COMPLETION_BONUS',
    name: 'Flight completion bonus',
    enabled: true,
    message: 'Flight completion bonus',
    states: [PirepState.TaxiIn, PirepState.Landed],
    repeatable: false,
    cooldown: 60,
    max_count: 1,
    points: 100,
  }

  violated(pirep: Pirep, data: Telemetry, previousData?: Telemetry): RuleValue {
    return ['Flight completed successfully! Bonus: +']
  }
}
