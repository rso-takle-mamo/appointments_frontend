import { toast } from 'sonner'

export const showToast = {
  success: (message: string) => {
    toast.success(message)
  },

  error: (message: string, error?: any) => {
    toast.error(message)
  },

  info: (message: string) => {
    toast.info(message)
  },

  warning: (message: string) => {
    toast.warning(message)
  },

  loading: (message: string) => {
    return toast.loading(message)
  },
}

// Common toast messages
export const toastMessages = {
  login: {
    success: 'Logged in successfully!',
    error: 'Login failed. Please check your credentials.',
  },
  logout: {
    success: 'Logged out successfully',
  },
  network: {
    error: 'Network error. Please check your connection.',
  },
  session: {
    expired: 'Session expired. Please log in again.',
  },
  api: {
    error: 'Request failed. Please try again.',
    unauthorized: 'You are not authorized to perform this action.',
    forbidden: "You don't have permission to access this resource.",
    notFound: 'The requested resource was not found.',
    serverError: 'Server error. Please try again later.',
  },
}
