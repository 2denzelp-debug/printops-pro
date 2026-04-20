export const PLANS = {
  TRIAL:      { name: 'Trial',      maxUsers: 1,   features: ['core'] as string[] },
  SOLO:       { name: 'Solo',       maxUsers: 1,   features: ['core', 'shipments', 'ai_basic'] as string[] },
  TEAM:       { name: 'Team',       maxUsers: 5,   features: ['core', 'shipments', 'ai_full', 'inbox', 'shopify'] as string[] },
  STUDIO:     { name: 'Studio',     maxUsers: 15,  features: ['core', 'shipments', 'ai_full', 'inbox', 'shopify', 'graphic', 'employees', 'finance'] as string[] },
  AGENCY:     { name: 'Agenzia',    maxUsers: 50,  features: ['all'] as string[] },
  ENTERPRISE: { name: 'Enterprise', maxUsers: 100, features: ['all'] as string[] },
} as const

export type PlanKey = keyof typeof PLANS

export function hasFeature(plan: PlanKey, feature: string): boolean {
  const p = PLANS[plan]
  if (p.features.includes('all')) return true
  return p.features.includes(feature)
}

// Prezzi in centesimi (€)
export const PLAN_PRICES: Record<string, { monthly: number; annual: number; stripeMonthlyId: string; stripeAnnualId: string }> = {
  SOLO:       { monthly: 4900, annual: 3900, stripeMonthlyId: 'price_solo_monthly', stripeAnnualId: 'price_solo_annual' },
  TEAM:       { monthly: 9900, annual: 7900, stripeMonthlyId: 'price_team_monthly', stripeAnnualId: 'price_team_annual' },
  STUDIO:     { monthly: 19900, annual: 15900, stripeMonthlyId: 'price_studio_monthly', stripeAnnualId: 'price_studio_annual' },
  AGENCY:     { monthly: 39900, annual: 31900, stripeMonthlyId: 'price_agency_monthly', stripeAnnualId: 'price_agency_annual' },
  ENTERPRISE: { monthly: 69900, annual: 55900, stripeMonthlyId: 'price_enterprise_monthly', stripeAnnualId: 'price_enterprise_annual' },
}
