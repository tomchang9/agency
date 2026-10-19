/** Parse API `result_data` (object or JSON string). */
export function parseSessionResultData(raw: unknown): Record<string, unknown> | null {
  if (raw == null) return null
  if (typeof raw === 'object' && !Array.isArray(raw)) return raw as Record<string, unknown>
  if (typeof raw === 'string') {
    try {
      const j = JSON.parse(raw) as unknown
      if (j && typeof j === 'object' && !Array.isArray(j)) return j as Record<string, unknown>
    } catch {
      return null
    }
  }
  return null
}

/** Coerce API dice cell (number, numeric string, etc.) to integer or null. */
function coerceDiceFace(v: unknown): number | null {
  if (v == null || v === '') return null
  if (typeof v === 'number' && Number.isFinite(v)) return Math.trunc(v)
  if (typeof v === 'string') {
    const n = Number(String(v).trim())
    return Number.isFinite(n) ? Math.trunc(n) : null
  }
  return null
}

/**
 * Three dice 1..6 from columns or `result_data.dice` (matches backend
 * GameSessionModel::extractTaixiuDiceFromSession).
 */
export function extractTaixiuDiceTriplet(s: {
  dice_1?: unknown
  dice_2?: unknown
  dice_3?: unknown
  result_data?: unknown
}): [number, number, number] | null {
  const a = coerceDiceFace(s.dice_1)
  const b = coerceDiceFace(s.dice_2)
  const c = coerceDiceFace(s.dice_3)
  if (a != null && b != null && c != null) {
    return [a, b, c]
  }
  const rd = parseSessionResultData(s.result_data)
  const dice = rd?.dice
  if (Array.isArray(dice) && dice.length >= 3) {
    const x = coerceDiceFace(dice[0])
    const y = coerceDiceFace(dice[1])
    const z = coerceDiceFace(dice[2])
    if (x != null && y != null && z != null) {
      return [x, y, z]
    }
  }
  return null
}

export function formatTaiXiuSessionResultDisplay(s: {
  status: string
  dice_1?: unknown
  dice_2?: unknown
  dice_3?: unknown
  result_data?: unknown
}): string {
  if (s.status === 'cancelled' || s.status === 'rollback') return '—'
  const triplet = extractTaixiuDiceTriplet(s)
  if (!triplet) return 'Chờ'
  const sum = triplet[0] + triplet[1] + triplet[2]
  const side = sum >= 11 ? 'Tài' : 'Xỉu'
  return `${triplet.join(' · ')} (${side})`
}

export function formatChickenSessionResultDisplay(s: { status: string; result_data?: unknown }): string {
  if (s.status === 'cancelled' || s.status === 'rollback') return '—'
  const rd = parseSessionResultData(s.result_data)
  const w = rd?.winner
  if (typeof w !== 'string' || w.trim() === '') return 'Chờ'
  const key = w.toLowerCase().trim()
  const map: Record<string, string> = {
    a_win: 'Meron',
    meron: 'Meron',
    team_a: 'Meron',
    b_win: 'Wala',
    wala: 'Wala',
    team_b: 'Wala',
    draw: 'Hòa',
    hoa: 'Hòa',
  }
  return map[key] ?? w
}
