import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT, JWTPayload } from './auth'
import { hasFeature, PlanKey } from './plans'
import prisma from './prisma'

export type ApiContext = JWTPayload & { orgPlan: PlanKey }
export type ApiHandler = (req: NextRequest, ctx: ApiContext) => Promise<NextResponse>

export function withAuth(handler: ApiHandler, options?: { feature?: string }) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const token = req.cookies.get('printops_token')?.value
      if (!token) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

      const payload = verifyJWT(token)

      const org = await prisma.organization.findUnique({
        where: { id: payload.orgId },
        select: { plan: true, planStatus: true, isActive: true },
      })
      if (!org || !org.isActive) {
        return NextResponse.json({ error: 'Organizzazione non trovata' }, { status: 404 })
      }
      if (org.planStatus === 'CANCELED' || org.planStatus === 'BLOCKED') {
        return NextResponse.json({ error: 'Abbonamento non attivo', upgrade: true }, { status: 403 })
      }

      const orgPlan = org.plan as PlanKey
      if (options?.feature && !hasFeature(orgPlan, options.feature)) {
        return NextResponse.json({ error: 'Funzione non disponibile nel tuo piano', upgrade: true }, { status: 403 })
      }

      return handler(req, { ...payload, orgPlan })
    } catch (err) {
      console.error('API error:', err)
      return NextResponse.json({ error: 'Errore di autenticazione' }, { status: 401 })
    }
  }
}

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status })
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export function paginate(items: unknown[], page: number, limit: number) {
  const total = (items as unknown[]).length
  const start = (page - 1) * limit
  return {
    data: (items as unknown[]).slice(start, start + limit),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  }
}
