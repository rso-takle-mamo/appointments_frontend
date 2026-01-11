const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ''

export const getApiBaseUrl = () => {
  const baseUrl = API_BASE_URL || ''

  if (!baseUrl) {
    return ''
  }

  if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) {
    return baseUrl
  }

  if (baseUrl.startsWith('localhost') || baseUrl.startsWith('127.0.0.1')) {
    return `http://${baseUrl}`
  }

  return `https://${baseUrl}`
}
