import { Difficulty, SessionStatus } from '../types'
export interface AntiCheatResult {
  valid: boolean
  reason?: string
}

export interface EvaluatedSession {
  wpm: number
  cpm: number
  precision: number
  status: SessionStatus
  difficultKeys: string[]
  antiCheat: AntiCheatResult
}

export function calculateWPM(correctChars: number, durationMs: number): number {
  if (durationMs <= 0 || correctChars <= 0) return 0
  return Math.round((correctChars / 5) / (durationMs / 60000))
}

export function calculateCPM(correctChars: number, durationMs: number): number {
  if (durationMs <= 0) return 0
  return Math.round(correctChars / (durationMs / 60000))
}

export function calculatePrecision(correctChars: number, totalErrors: number): number {
  const total = correctChars + totalErrors
  if (total === 0) return 0
  return Number(((correctChars / total) * 100).toFixed(2))
}

export function determineSessionStatus(precision: number): SessionStatus {
  return precision >= 85 ? 'COMPLETED' : 'INVALID'
}

export function calculateDifficulty(code: string): Difficulty {
  if (!code || code.length === 0) return 'EASY'
  const specialChars = (code.match(/[{}()[\];=><$@#!]/g) || []).length
  const ratio = (specialChars / code.length) * 100
  if (ratio < 15) return 'EASY'
  if (ratio <= 30) return 'MEDIUM'
  return 'HARD'
}

export function extractDifficultKeys(keyErrors: string[]): string[] {
  const frequency: Record<string, number> = {}
  for (const key of keyErrors) {
    frequency[key] = (frequency[key] ?? 0) + 1
  }

  return Object.entries(frequency)
    .filter(([, count]) => count > 2)
    .sort(([, a], [, b]) => b - a)
    .map(([key]) => key)
}

export function validateSession(params: {
  durationMs: number
  wpm: number
  correctChars: number
  snippetLength: number
}): AntiCheatResult {
  if (params.durationMs < 3000) {
    return { valid: false, reason: 'Duration too short (minimum 3 seconds)' }
  }
  if (params.wpm > 250) {
    return { valid: false, reason: 'WPM unrealistic (maximum 250)' }
  }
  if (params.correctChars > params.snippetLength) {
    return { valid: false, reason: 'Correct chars exceed snippet length' }
  }
  return { valid: true }
}

export function evaluateSession(input: {
  correctChars: number
  totalErrors: number
  durationMs: number
  keyErrors: string[]
  snippetLength: number
}): EvaluatedSession {
  const wpm = calculateWPM(input.correctChars, input.durationMs)
  const cpm = calculateCPM(input.correctChars, input.durationMs)
  const precision = calculatePrecision(input.correctChars, input.totalErrors)
  const status = determineSessionStatus(precision)
  const difficultKeys = extractDifficultKeys(input.keyErrors)

  const antiCheat = validateSession({
    durationMs: input.durationMs,
    wpm,
    correctChars: input.correctChars,
    snippetLength: input.snippetLength,
  })

  return { wpm, cpm, precision, status, difficultKeys, antiCheat }
}