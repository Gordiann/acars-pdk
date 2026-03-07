/**
 * Penalize flare lasting longer than 10 seconds (from 30ft AGL)
 */
import { PirepState } from '../defs'
import { Meta, Rule, RuleValue } from '../types/rule'
import { Telemetry, Pirep } from '../types/types'

export default class LongFlareRule implements Rule {
  meta: Meta = {
    id: 'LONG_FLARE',
    name: 'Long flare',
    enabled: true,
    message: 'Flare lasted longer than 10 seconds',
    states: [PirepState.Final, PirepState.Landed],
    repeatable: false,
    points: -5,
  }

  violated(pirep: Pirep, data: Telemetry, previousData?: Telemetry): RuleValue {
    if (
      data.groundAltitude.Feet <= 30 &&
      !data.onGround &&
      previousData &&
      previousData.groundAltitude.Feet > 30
    ) {
      Acars.StartTimer('long_flare')
    }

    if (data.onGround == true && Acars.IsTimeElapsed('long_flare', 10000)) {
      Acars.StopTimer('long_flare')
      return ['Flare lasted longer than 10 seconds']
    }
  }
}
