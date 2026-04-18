import { getUser, isAdmin, clearAuth } from '/src/api.js';

const user = getUser();
const actionButtons = document.querySelector('.space-y-3.pt-4');

function render() {
  if (!user) {
    // 비로그인 상태 → 기본 버튼 유지
    return;
  }

  if (isAdmin()) {
    // 관리자 로그인 상태
    actionButtons.innerHTML = `
      <a href="/pages/admin/quiz-list.html" class="block w-full bg-black text-white py-4 rounded-lg hover:bg-black/90 transition-colors text-center">
        문제 관리 시작하기
      </a>
      <button id="logoutBtn" class="block w-full border border-black/20 text-black py-4 rounded-lg hover:bg-black/5 transition-colors text-center w-full">
        로그아웃
      </button>
    `;
  } else {
    // 일반 유저 로그인 상태
    const nicknameEl = document.querySelector('header span');
    if (nicknameEl) nicknameEl.textContent = `${user.nickname}님`;

    actionButtons.innerHTML = `
      <a href="/pages/category.html" class="block w-full bg-black text-white py-4 rounded-lg hover:bg-black/90 transition-colors text-center">
        퀴즈 시작하기
      </a>
      <button id="logoutBtn" class="block w-full border border-black/20 text-black py-4 rounded-lg hover:bg-black/5 transition-colors text-center w-full">
        로그아웃
      </button>
    `;
  }

  document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      clearAuth();
      location.reload();
    }
  });
}

render();