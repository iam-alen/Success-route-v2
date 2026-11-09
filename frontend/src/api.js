const TOKEN_KEY = 'sr_token'
const USER_KEY = 'sr_user'

export const session = {
  token: () => localStorage.getItem(TOKEN_KEY),
  user: () => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY))
    } catch {
      return null
    }
  },
  save: ({ token, user }) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
}

async function request(path, { method = 'GET', body, isForm = false } = {}) {
  const headers = {}
  const token = session.token()
  if (token) headers.Authorization = `Bearer ${token}`
  if (body && !isForm) headers['Content-Type'] = 'application/json'

  let res
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers,
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    })
  } catch {
    throw new Error('Cannot reach the server. Is the backend running on port 5000?')
  }

  const data = await res.json().catch(() => ({}))
  if (res.status === 401 && token) {
    session.clear()
    window.location.href = '/signin'
  }
  if (!res.ok) {
    const err = new Error(data.error || 'Request failed')
    err.needsProfile = data.needsProfile
    throw err
  }
  return data
}

export const api = {
  register: (name, email, password) => request('/auth/register', { method: 'POST', body: { name, email, password } }),
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  getProfile: () => request('/profile'),
  saveProfile: (profile) => request('/profile', { method: 'PUT', body: profile }),
  roadmap: (role, refresh = false) => request('/roadmap', { method: 'POST', body: { role, refresh } }),
  getProgress: () => request('/progress'),
  saveProgress: (key, completed) => request('/progress', { method: 'PUT', body: { key, completed } }),
  recommendations: () => request('/recommendations', { method: 'POST', body: {} }),
  analyzeResume: (file, role) => {
    const form = new FormData()
    form.append('resume', file)
    form.append('role', role || '')
    return request('/resume/analyze', { method: 'POST', body: form, isForm: true })
  },
  optimizeResume: (resumeText, role, missingKeywords) =>
    request('/resume/optimize', { method: 'POST', body: { resumeText, role, missingKeywords } }),
}
