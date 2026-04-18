export const BASE_URL = 'https://api.fullstackfamily.com/api/nailed-it/v1';

export function getToken() {
  return localStorage.getItem('token');
}

export function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function isAdmin() {
  const user = getUser();
  return user?.role === 'admin';
}

export function requireAuth() {
  if (!getToken()) {
    location.href = '/pages/login.html';
  }
}

export function requireAdmin() {
  const user = getUser();
  if (!user || user.role !== 'admin') {
    location.href = '/pages/login.html';
  }
}

export function saveAuth(data) {
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify({
    id: data.id,
    nickname: data.nickname,
    email: data.email,
    role: data.role,
  }));
}

export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export async function request(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || '요청에 실패했습니다.');
  }

  return json.data;
}

// ── Auth ──────────────────────────────────────────
export const login = (email, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const signup = (nickname, email, password) =>
  request('/auth/signup', { method: 'POST', body: JSON.stringify({ nickname, email, password }) });

export const logout = () =>
  request('/auth/logout', { method: 'POST' });

export const getMe = () =>
  request('/users/me');

// ── Categories ────────────────────────────────────
export const getCategories = async () => {
  const data = await request('/categories');
  return { categories: data };
};

// ── Quizzes (사용자) ──────────────────────────────
export const getQuiz = (id) =>
  request(`/quizzes/${id}`);

// ── Admin Quizzes ─────────────────────────────────
export const getAdminQuizzes = (params = {}) =>
  request(`/admin/quizzes?${new URLSearchParams(params)}`);

export const getAdminQuiz = (id) =>
  request(`/admin/quizzes/${id}`);

export const createQuiz = (data) =>
  request('/admin/quizzes', { method: 'POST', body: JSON.stringify(data) });

export const updateQuiz = (id, data) =>
  request(`/admin/quizzes/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const deleteQuiz = (id) =>
  request(`/admin/quizzes/${id}`, { method: 'DELETE' });

// ── Sessions ──────────────────────────────────────
export const createSession = (category) =>
  request('/sessions', { method: 'POST', body: JSON.stringify({ category }) });

export const submitAnswer = (sessionId, quizId, selectedIndex) =>
  request(`/sessions/${sessionId}/answers`, { method: 'POST', body: JSON.stringify({ quizId, selectedIndex }) });

export const getSessionResult = (sessionId) =>
  request(`/sessions/${sessionId}`);

export const getSessionHistory = (params = {}) =>
  request(`/sessions?${new URLSearchParams(params)}`);
