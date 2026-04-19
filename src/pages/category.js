import { requireAuth, getUser, getCategories, createSession, clearAuth } from '/src/api.js';
import { pageHeader, defaultActions } from '/src/components/header.js';
import { icon } from '/src/components/icon.js';

const slot = document.getElementById('headerSlot');
if (slot) {
  slot.outerHTML = pageHeader({
    title: '카테고리 선택',
    backHref: '/index.html',
    actionsHtml: defaultActions(),
  });
}

requireAuth();

const user = getUser();

// 유저 닉네임 표시
const userInfoEl = document.querySelector('.text-center p');
if (userInfoEl && user) {
  userInfoEl.innerHTML = `<span class="font-medium text-black">${user.nickname}</span>님, 학습할 카테고리를 선택해주세요`;
}

// 로그아웃
document.getElementById('logoutBtn').addEventListener('click', async () => {
  if (confirm('로그아웃 하시겠습니까?')) {
    clearAuth();
    location.href = '/index.html';
  }
});

// 카테고리 아이콘 매핑
const icons = {
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline><line x1="12" y1="2" x2="12" y2="22"></line></svg>`,
  css: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="m5 12-3 3 3 3"></path><path d="m9 18 3-3-3-3"></path></svg>`,
  js: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"></path><path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"></path></svg>`,
};

// 카테고리 목록 렌더링
async function renderCategories() {
  const categoryList = document.getElementById('categoryList') || document.querySelector('.space-y-4');
  const errorMessage = document.getElementById('errorMessage');

  try {
    const data = await getCategories();
    const categories = data.categories;

    categoryList.innerHTML = categories.map((category) => `
      <button
        class="w-full p-6 border border-black/10 rounded-lg hover:bg-black/5 transition-colors text-left group"
        data-category="${category.name}"
      >
        <div class="flex items-start gap-4">
          <div class="p-3 border border-black/10 rounded-lg group-hover:bg-white transition-colors">
            ${icons[category.name] || icons.html}
          </div>
          <div class="flex-1 space-y-1">
            <div class="flex items-center justify-between">
              <h3 class="font-medium">${category.label}</h3>
              <span class="text-sm text-black/40">10문제</span>
            </div>
            <p class="text-sm text-black/60">${category.label} 기초를 학습합니다.</p>
          </div>
        </div>
      </button>
    `).join('');

    // 카테고리 클릭 이벤트
    categoryList.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => handleCategoryClick(btn.dataset.category));
    });

  } catch (err) {
    errorMessage.textContent = '카테고리를 불러오는 데 실패했습니다.';
    errorMessage.classList.remove('hidden');
  }
}

// 카테고리 선택 → 세션 생성 → 퀴즈 페이지 이동
async function handleCategoryClick(categoryName) {
  const errorMessage = document.getElementById('errorMessage');
  const infoText = document.querySelector('.text-black\\/40');

  errorMessage.classList.add('hidden');
  if (infoText) infoText.textContent = '퀴즈를 준비하는 중...';

  try {
    const data = await createSession(categoryName);

    // 세션 정보를 sessionStorage에 저장 후 퀴즈 페이지로 이동
    sessionStorage.setItem('quizSession', JSON.stringify({
      sessionId: data.sessionId,
      quizIds: data.quizIds,
      category: categoryName,
    }));

    location.href = '/pages/quiz.html';

  } catch (err) {
    errorMessage.textContent = err.message || '퀴즈를 시작하는 데 실패했습니다.';
    errorMessage.classList.remove('hidden');
    if (infoText) infoText.textContent = '각 카테고리당 10문제가 출제됩니다';
  }
}

renderCategories();