export const healthCheck = async () => {
  try {
    const response = await fetch('http://localhost:3000/status')

    const status = await response.json()

    if (!status.name) {
      console.log('sounder not configured')
      process.exit(1)
    }
  } catch (e) {
    console.log('Could not connect to sounder')
    process.exit(1)
  }

  process.exit(0)
}
