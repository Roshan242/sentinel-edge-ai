export type ThreatLevel = 1 | 2 | 3

export type RiskLevelLabel = 'Low' | 'Medium' | 'High' | 'Critical'

export type SecurityEventInsights = {
  anomalyScore: number // 0-100
  threatLevel: ThreatLevel // 1..3
  riskLevel: {
    label: RiskLevelLabel
    // matches existing UI badge tone vocabulary
    tone: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  }
}

const clamp01to100 = (n: unknown): number => {
  const v = Number(n)
  if (!Number.isFinite(v)) return 0
  return Math.max(0, Math.min(100, v))
}

export const threatLevelFromAnomalyScore = (anomalyScoreRaw: unknown): ThreatLevel => {
  const anomalyScore = clamp01to100(anomalyScoreRaw)
  if (anomalyScore <= 30) return 1
  if (anomalyScore <= 60) return 2
  return 3
}

export const riskLabelFromAnomalyScore = (anomalyScoreRaw: unknown): RiskLevelLabel => {
  const anomalyScore = clamp01to100(anomalyScoreRaw)
  if (anomalyScore <= 30) return 'Low'
  if (anomalyScore <= 60) return 'Medium'
  if (anomalyScore <= 80) return 'High'
  return 'Critical'
}

export const riskToneFromAnomalyScore = (anomalyScoreRaw: unknown): 'success' | 'warning' | 'danger' | 'info' | 'neutral' => {
  const label = riskLabelFromAnomalyScore(anomalyScoreRaw)
  switch (label) {
    case 'Low':
      return 'success'
    case 'Medium':
      return 'warning'
    case 'High':
      return 'info'
    case 'Critical':
      return 'danger'
    default:
      return 'neutral'
  }
}

export const computeSecurityEventInsights = (params: {
  anomalyScore: unknown
}): SecurityEventInsights => {
  const anomalyScore = clamp01to100(params.anomalyScore)
  const threatLevel = threatLevelFromAnomalyScore(anomalyScore)
  const riskLabel = riskLabelFromAnomalyScore(anomalyScore)
  const riskTone = riskToneFromAnomalyScore(anomalyScore)

  return {
    anomalyScore,
    threatLevel,
    riskLevel: {
      label: riskLabel,
      tone: riskTone,
    },
  }
}

