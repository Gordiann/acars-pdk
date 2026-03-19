/**
 * Penalize excessive pitch at liftoff based on aircraft-specific tail strike limits
 */
import { PirepState } from '../defs'
import { Meta, Rule, RuleValue } from '../types/rule'
import { Telemetry, Pirep } from '../types/types'

const PITCH_LIMITS: Record<string, number> = {
  A319: 15,
  A320: 13,
  A321: 11,
  A300: 14,
  A330: 10,
  A340: 10,
  A350: 11,
  A380: 11,
  B737: 11,
  B747: 13,
  B757: 11,
  B767: 10,
  B777: 11,
  B787: 10,
  ATR72: 8,
  DHC6: 15,
  DHC8: 10,
  MD11: 10,
  MD88: 12,
}

const PREFIX_MAP: [string, string][] = [
  ['A319', 'A319'],
  ['A320', 'A320'],
  ['A20N', 'A320'],
  ['A321', 'A321'],
  ['A21N', 'A321'],
  ['A30', 'A300'],
  ['A33', 'A330'],
  ['A34', 'A340'],
  ['A35', 'A350'],
  ['A38', 'A380'],
  ['B73', 'B737'],
  ['B37', 'B737'],
  ['B38', 'B737'],
  ['B39', 'B737'],
  ['B74', 'B747'],
  ['B75', 'B757'],
  ['B76', 'B767'],
  ['B77', 'B777'],
  ['B78', 'B787'],
  ['AT7', 'ATR72'],
  ['DHC6', 'DHC6'],
  ['DH6', 'DHC6'],
  ['DHC8', 'DHC8'],
  ['DH8', 'DHC8'],
  ['MD11', 'MD11'],
  ['MD88', 'MD88'],
]

const DEFAULT_PITCH_LIMIT = 15

function getMaxPitch(icao: string): number {
  const upper = icao.toUpperCase()
  if (PITCH_LIMITS[upper] !== undefined) return PITCH_LIMITS[upper]

  for (const [prefix, key] of PREFIX_MAP) {
    if (upper.startsWith(prefix)) return PITCH_LIMITS[key]
  }

  return DEFAULT_PITCH_LIMIT
}

export default class PitchAtTakeoffRule implements Rule {
  meta: Meta = {
    id: 'PITCH_AT_TAKEOFF',
    name: 'Excessive pitch at takeoff',
    enabled: true,
    message: 'Excessive pitch at liftoff',
    states: [PirepState.Takeoff],
    repeatable: false,
    points: -5,
  }

  violated(pirep: Pirep, data: Telemetry, previousData?: Telemetry): RuleValue {
    if (data.onGround == false && previousData?.onGround == true) {
      const icao = pirep.aircraft?.icao?.toUpperCase() ?? ''
      const maxPitch = getMaxPitch(icao)
      if (data.pitch > maxPitch) {
        const label = icao || 'unknown'
        return [
          `Pitch at liftoff was ${data.pitch.toFixed(1)} degrees (max ${maxPitch} for ${label})`,
        ]
      }
    }
  }
}
