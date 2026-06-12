const readGreeting = (hey: boolean) => {
  if (hey) return 'ok'

  return 'no'
}

const readCompactStatus = (active: boolean) => {
  if (active) return 'active'

  return 'paused'
}

const readCompactGreeting = (text: string | undefined) => {
  if (text) return 'ok'

  return 'no'
}

export { readCompactGreeting, readCompactStatus, readGreeting }
