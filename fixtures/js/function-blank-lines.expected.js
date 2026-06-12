const readTotal = active => {
  const base = 1
  const bonus = active ? 2 : 0
  return base + bonus
}

const readBlockStatus = active => {
  const labels = []

  if (active) {
    const value = 'status'
    labels.push(value)
  }

  return labels.join(':')
}

const readCompactStatus = status => {
  const fallback = 'paused'
  if (status === 'active') return 'enabled'
  return fallback
}

export { readBlockStatus, readCompactStatus, readTotal }
