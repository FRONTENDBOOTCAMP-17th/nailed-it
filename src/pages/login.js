import { login, saveAuth } from '/src/api.js';
import { pageHeader } from '/src/components/header.js';

const slot = document.getElementById('headerSlot');
if (slot) {
  slot.outerHTML = pageHeader({ title: '로그인', backHref: '/index.html' });
}

const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submitBtn');
const errorMessage = document.getElementById('errorMessage');

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
}

function hideError() {
  errorMessage.classList.add('hidden');
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.textContent = isLoading ? '로그인 중...' : '로그인';
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError();

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    showError('이메일과 비밀번호를 입력해주세요.');
    return;
  }

  setLoading(true);

  try {
    const data = await login(email, password);

    saveAuth(data);

    if (data.role === 'admin') {
      location.href = '/index.html';
    } else {
      location.href = '/pages/category.html';
    }

  } catch (err) {
    showError(err.message || '로그인에 실패했습니다.');
  } finally {
    setLoading(false);
  }
});

// 비밀번호 찾기
document.getElementById('forgotPasswordBtn')?.addEventListener('click', () => {
  alert('비밀번호 찾기 기능은 추후 구현 예정입니다.');
});