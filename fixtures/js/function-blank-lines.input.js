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

export { readFallback, readImmediate, readStatus, readTotal }
