const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ''

export const getApiBaseUrl = () => {
  const baseUrl = API_BASE_URL || ''

  if (!baseUrl) {
    console.error('NEXT_PUBLIC_API_BASE_URL is not defined in environment variables')
    return ''
  }

  // In production (Vercel), use relative URLs so rewrites can proxy to HTTP backend
  if (process.env.NODE_ENV === 'production') {
    return ''
  }

  // Remove trailing slash to avoid double slashes with endpoints that start with /
  const cleanedUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl

  // In development, use the full URL
  if (cleanedUrl.startsWith('http://') || cleanedUrl.startsWith('https://')) {
    return cleanedUrl
  }

  if (cleanedUrl.startsWith('localhost') || cleanedUrl.startsWith('127.0.0.1')) {
    return `http://${cleanedUrl}`
  }

  return `https://${cleanedUrl}`
}
