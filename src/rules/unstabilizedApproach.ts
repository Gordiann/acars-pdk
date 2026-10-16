/**
 * Penalize an unstabilized approach below the 1000ft AGL gate.
 *
 * At/below the gate the aircraft should be in landing configuration and
 * stable: gear down, flaps extended, a controlled sink rate and a sensible
 * approach speed. Any criterion that is still unmet once below the gate
 * (and has persisted for a few seconds, to ignore transients) is reported.
 */
import { PirepState } from '../defs'
import { Meta, Rule, RuleValue } from '../types/rule'
import { Telemetry, Pirep } from '../types/types'

/** The stabilized-approach gate, in feet AGL */
const GATE_ALTITUDE = 1000
/** Stop evaluating once in the flare/landing regime */
const MIN_ALTITUDE = 50
/** Maximum acceptable sink rate at the gate, fpm */
const MAX_DESCENT_RATE = 1200
/** Maximum acceptable approach speed, knots */
const MAX_APPROACH_SPEED = 180

export default class UnstabilizedApproachRule implements Rule {
  meta: Meta = {
    id: 'UNSTABILIZED_APPROACH',
    name: 'Unstabilized approach',
    enabled: true,
    message: 'Approach not stabilized below 1000ft AGL',
    states: [PirepState.Approach, PirepState.Final],
    repeatable: true,
    cooldown: 15,
    max_count: 5,
    points: -10,
  }

  violated(pirep: Pirep, data: Telemetry, previousData?: Telemetry): RuleValue {
    const alt = data.groundAltitude.Feet

    // Only evaluate within the gate band, while airborne
    if (data.onGround || alt >= GATE_ALTITUDE || alt < MIN_ALTITUDE) return

    return Acars.ViolatedAfterDelay('unstabilized_approach', 5000, () => {
      const reasons: string[] = []

      if (data.gearUp) {
        reasons.push('gear not down')
      }

      if (data.flaps == 0) {
        reasons.push('no landing flaps set')
      }

      const descentRate = Math.abs(Math.min(data.verticalSpeed.FeetPerMinute, 0))
      if (descentRate > MAX_DESCENT_RATE) {
        reasons.push(`sink rate ${descentRate.toFixed(0)} fpm (max ${MAX_DESCENT_RATE})`)
      }

      const speed = data.indicatedAirspeed.Knots
      if (speed > MAX_APPROACH_SPEED) {
        reasons.push(`speed ${speed.toFixed(0)} kt (max ${MAX_APPROACH_SPEED})`)
      }

      if (reasons.length == 0) return false

      return [`Unstabilized approach at ${alt.toFixed(0)}ft AGL: ${reasons.join(', ')}`]
    })
  }
}
