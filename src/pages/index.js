import { getUser, isAdmin, clearAuth } from '/src/api.js';
import { icon } from '/src/components/icon.js';

const user = getUser();
const actionButtons = document.querySelector('.space-y-3.pt-4');

// 카테고리 미리보기 카드 렌더링
const CATEGORIES = [
  { id: 'html',       label: 'HTML' },
  { id: 'css',        label: 'CSS' },
  { id: 'javascript', label: 'JavaScript' },
];

const preview = document.getElementById('categoryPreview');
if (preview) {
  preview.innerHTML = CATEGORIES.map(({ id, label }) => `
    <div class="border border-black/10 rounded-lg flex flex-col items-center justify-center gap-2 py-6 px-3">
      ${icon(id)}
      <span class="text-sm font-medium">${label}</span>
    </div>
  `).join('');
}

// 로그인 상태에 따라 버튼 렌더링
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