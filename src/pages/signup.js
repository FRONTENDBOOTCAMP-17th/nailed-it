import { signup } from '/src/api.js';

const signupForm = document.getElementById('signupForm');
const nicknameInput = document.getElementById('nickname');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const agreeTerms = document.getElementById('agreeTerms');
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
  submitBtn.textContent = isLoading ? '처리 중...' : '회원가입';
}

function validate(nickname, email, password) {
  if (!nickname || !email || !password) {
    return '필수 항목을 모두 입력해주세요.';
  }
  if (!agreeTerms.checked) {
    return '이용약관에 동의해주세요.';
  }
  if (nickname.length < 1 || nickname.length > 10) {
    return '닉네임은 1~10자 이내로 입력해주세요.';
  }
  if (!/^[a-zA-Z0-9가-힣\-_.]+$/.test(nickname)) {
    return '닉네임은 영문, 숫자, 한글, 특수문자(-_.)만 사용 가능합니다.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return '올바른 이메일 형식이 아닙니다.';
  }
  if (password.length < 8) {
    return '비밀번호는 최소 8자 이상이어야 합니다.';
  }
  if (!/[a-zA-Z]/.test(password)) {
    return '비밀번호는 영문을 포함해야 합니다.';
  }
  if (!/[0-9]/.test(password)) {
    return '비밀번호는 숫자를 포함해야 합니다.';
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return '비밀번호는 특수문자를 포함해야 합니다.';
  }
  return null;
}

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError();

  const nickname = nicknameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  const validationError = validate(nickname, email, password);
  if (validationError) {
    showError(validationError);
    return;
  }

  setLoading(true);

  try {
    await signup(nickname, email, password);
    location.href = '/pages/login.html';

  } catch (err) {
    showError(err.message || '회원가입에 실패했습니다.');
  } finally {
    setLoading(false);
  }
});