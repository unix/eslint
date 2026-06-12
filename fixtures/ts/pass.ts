type AuditState = 'active' | 'paused'

type AuditPayload = {
  readonly id: string
  readonly state: AuditState
}

const NormalizeState = (state: AuditState) => {
  if (state === 'active') return 'enabled'
  return 'paused'
}

class AuditService {
  protected static readonly CACHE_KEY = 'audit-state'

  protected static NormalizePayload(payload: AuditPayload) {
    return {
      id: payload.id,
      label: NormalizeState(payload.state),
    }
  }

  private readonly payload: AuditPayload

  constructor(payload: AuditPayload) {
    this.payload = payload
  }

  protected normalizedPayload() {
    return AuditService.NormalizePayload(this.payload)
  }
}

export { AuditService, NormalizeState }
export type { AuditPayload, AuditState }
