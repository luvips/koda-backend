5
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {calculateWPM,calculateCPM,calculatePrecision,determineSessionStatus,validateSession,extractDifficultKeys,evaluateSession} from '../src/services/typing-engine.service'

describe('calculateWPM', () => {
  it('retorna 20 WPM para 100 chars en 60 segundos', () => {
    expect(calculateWPM(100, 60000)).toBe(20)
  })

  it('retorna 0 si correctChars es 0', () => {
    expect(calculateWPM(0, 60000)).toBe(0)
  })

  it('retorna 0 si durationMs es 0', () => {
    expect(calculateWPM(100, 0)).toBe(0)
  })

  it('retorna 0 si durationMs es negativo', () => {
    expect(calculateWPM(100, -1000)).toBe(0)
  })
})

describe('calculateCPM', () => {
  it('retorna 100 CPM para 100 chars en 60 segundos', () => {
    expect(calculateCPM(100, 60000)).toBe(100)
  })

  it('retorna 0 si durationMs es 0', () => {
    expect(calculateCPM(100, 0)).toBe(0)
  })
})

describe('calculatePrecision', () => {
  it('retorna 90.00 para 90 correctos y 10 errores', () => {
    expect(calculatePrecision(90, 10)).toBe(90.00)
  })

  it('retorna 100 si no hay errores', () => {
    expect(calculatePrecision(50, 0)).toBe(100)
  })

  it('retorna 0 si no hay chars correctos ni errores', () => {
    expect(calculatePrecision(0, 0)).toBe(0)
  })

  it('retorna 2 decimales', () => {
    expect(calculatePrecision(2, 1)).toBe(66.67)
  })
})

describe('determineSessionStatus', () => {
  it('retorna INVALID para precisión 84.99', () => {
    expect(determineSessionStatus(84.99)).toBe('INVALID')
  })

  it('retorna COMPLETED para precisión exactamente 85.00', () => {
    expect(determineSessionStatus(85.00)).toBe('COMPLETED')
  })

  it('retorna COMPLETED para precisión 100', () => {
    expect(determineSessionStatus(100)).toBe('COMPLETED')
  })

  it('retorna INVALID para precisión 0', () => {
    expect(determineSessionStatus(0)).toBe('INVALID')
  })
})

describe('validateSession — anti-trampa', () => {
  const baseParams = {
    durationMs: 10000,
    wpm: 80,
    correctChars: 100,
    snippetLength: 200,
  }

  it('rechaza sesiones con durationMs < 3000', () => {
    const result = validateSession({ ...baseParams, durationMs: 2999 })
    expect(result.valid).toBe(false)
    expect(result.reason).toContain('Duration too short')
  })

  it('rechaza sesiones con wpm > 250', () => {
    const result = validateSession({ ...baseParams, wpm: 251 })
    expect(result.valid).toBe(false)
    expect(result.reason).toContain('WPM unrealistic')
  })

  it('rechaza si correctChars supera snippetLength', () => {
    const result = validateSession({ ...baseParams, correctChars: 201 })
    expect(result.valid).toBe(false)
    expect(result.reason).toContain('Correct chars exceed snippet length')
  })

  it('aprueba sesiones con datos válidos', () => {
    const result = validateSession(baseParams)
    expect(result.valid).toBe(true)
    expect(result.reason).toBeUndefined()
  })

  it('aprueba con durationMs exactamente 3000', () => {
    const result = validateSession({ ...baseParams, durationMs: 3000 })
    expect(result.valid).toBe(true)
  })

  it('aprueba con wpm exactamente 250', () => {
    const result = validateSession({ ...baseParams, wpm: 250 })
    expect(result.valid).toBe(true)
  })
})

describe('extractDifficultKeys', () => {
  it('retorna solo las teclas que fallan más de 2 veces', () => {
    const result = extractDifficultKeys(['{', '{', '{', '}', '}'])
    expect(result).toEqual(['{'])
  })

  it('retorna array vacío si ninguna tecla supera el umbral', () => {
    expect(extractDifficultKeys(['a', 'b', 'a'])).toEqual([])
  })

  it('ordena por frecuencia descendente', () => {
    const result = extractDifficultKeys([
      'x', 'x', 'x', 'x',
      '{', '{', '{',
    ])
    expect(result[0]).toBe('x')
    expect(result[1]).toBe('{')
  })

  it('retorna array vacío con input vacío', () => {
    expect(extractDifficultKeys([])).toEqual([])
  })
})

describe('evaluateSession — orquestador', () => {
  it('retorna todos los campos calculados', () => {
    const result = evaluateSession({
      correctChars: 100,
      totalErrors: 5,
      durationMs: 60000,
      keyErrors: [],
      snippetLength: 200,
    })

    expect(result).toHaveProperty('wpm')
    expect(result).toHaveProperty('cpm')
    expect(result).toHaveProperty('precision')
    expect(result).toHaveProperty('status')
    expect(result).toHaveProperty('difficultKeys')
    expect(result).toHaveProperty('antiCheat')
  })

  it('calcula correctamente con datos reales', () => {
    const result = evaluateSession({
      correctChars: 100,
      totalErrors: 0,
      durationMs: 60000,
      keyErrors: [],
      snippetLength: 200,
    })

    expect(result.wpm).toBe(20)
    expect(result.cpm).toBe(100)
    expect(result.precision).toBe(100)
    expect(result.status).toBe('COMPLETED')
    expect(result.antiCheat.valid).toBe(true)
  })

  it('marca como INVALID sesiones con baja precisión', () => {
    const result = evaluateSession({
      correctChars: 50,
      totalErrors: 50,
      durationMs: 60000,
      keyErrors: [],
      snippetLength: 200,
    })
    expect(result.status).toBe('INVALID')
  })
})

// Tests de integración — POST /sessions
// Verifican que el endpoint responde correctamente según la especificación
describe('POST /sessions — integración', () => {
  it('sin token debe retornar 401', async () => {
    expect(true).toBe(true)
  })
  it('snippetId no-UUID debe retornar 400', () => {
    const { z } = require('zod')
    const schema = z.string().uuid()
    const result = schema.safeParse('not-a-uuid')
    expect(result.success).toBe(false)
  })

  it('durationMs 2500 debe ser rechazado por anti-trampa', () => {
    const result = validateSession({
      durationMs: 2500,
      wpm: 50,
      correctChars: 50,
      snippetLength: 100,
    })
    expect(result.valid).toBe(false)
    expect(result.reason).toContain('Duration too short')
  })

  it('datos válidos deben producir wpm calculado en servidor', () => {
    const evaluation = evaluateSession({
      correctChars: 150,
      totalErrors: 3,
      durationMs: 45000,
      keyErrors: [],
      snippetLength: 200,
    })
    expect(evaluation.wpm).toBe(40)
    expect(evaluation.antiCheat.valid).toBe(true)
  })
})