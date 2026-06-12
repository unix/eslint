const readTotal = active => {

  const base = 1

  const bonus = active ? 2 : 0


  return base + bonus

}

const readStatus = status => {
  if (status === 'active') return 'enabled'


  return 'paused'
}

const readFallback = status => {
  if (status) {
    const value = status


    return value

  }

  return 'paused'
}

const readImmediate = value => {
  const normalized = String(value)
  return normalized
}

const readBlockStatus = active => {
  const prefix = 'status'
  const labels = []


  if (active) {
    const value = prefix
    labels.push(value)
  }


  const suffix = 'done'
  return labels.join(':') || suffix
}

const readCompactBlock = suffix => {
  const prefix = 'status'
  const labels = []

  if (suffix) {
    labels.push(suffix)
  }

  const packed = `${prefix}:${suffix}`
  if (packed) {
    const value = packed
    labels.push(value)
  }
  return labels.join(':')
}

export {
  readBlockStatus,
  readCompactBlock,
  readFallback,
  readImmediate,
  readStatus,
  readTotal,
}
