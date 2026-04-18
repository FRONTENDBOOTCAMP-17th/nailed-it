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
            ${icon(category.name) || icon('html')}
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