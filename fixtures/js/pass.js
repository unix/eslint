const NormalizeStatus = status => {
  if (status === 'active') return 'enabled'
  return 'paused'
}

const buildRecord = status => ({
  label: NormalizeStatus(status),
  status,
})

export { NormalizeStatus, buildRecord }
