type Payload = {
  readonly value: string
}

function ReadPayload(payload: Payload) {
  if (payload.value) {
    return payload.value as string
  } else {
    return 'fallback'
  }
}

class BadService {
  private readonly value = 'demo'

  protected static readonly TOKEN = 'token'

  protected readValue() {
    return this.value
  }
}

export { BadService, ReadPayload }
export type { Payload }
