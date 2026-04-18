import { requireAuth, getUser, getCategories, getSessionHistory, clearAuth } from '/src/api.js';
<<<<<<< HEAD
import { pageHeader, historyActions } from '/src/components/header.js';

// 헤더 주입 — logoutBtn이 DOM에 생겨야 아래 이벤트 연결 가능
const slot = document.getElementById('headerSlot');
if (slot) {
  slot.outerHTML = pageHeader({
    title: '퀴즈 히스토리',
    backHref: '/pages/category.html',
    actionsHtml: historyActions(),
    maxWidth: 'max-w-4xl',
  });
}
=======
>>>>>>> 0b85812 (feat: add and connect JavaScript files)

requireAuth();

const user = getUser();

// 유저 닉네임 표시
const userInfoEl = document.querySelector('.text-center p');
if (userInfoEl && user) {
  userInfoEl.innerHTML = `<span class="font-medium text-black">${user.nickname}</span>님의 퀴즈 기록`;
}

// 로그아웃
document.getElementById('logoutBtn').addEventListener('click', () => {
  if (confirm('로그아웃 하시겠습니까?')) {
    clearAuth();
    location.href = '/index.html';
  }
});

let selectedCategory = '전체';
let categories = [];

function getScoreColor(score, total) {
  const pct = (score / total) * 100;
  if (pct >= 80) return 'text-green-600';
  if (pct >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function renderFilterButtons() {
  const filterArea = document.getElementById('filterArea');
  const allCategories = ['전체', ...categories.map((c) => c.label)];

  filterArea.innerHTML = allCategories.map((cat) => `
    <button
      class="filter-btn px-4 py-2 rounded-lg transition-colors ${cat === selectedCategory ? 'bg-black text-white' : 'border border-black/20 hover:bg-black/5'}"
      data-category="${cat}"
    >
      ${cat}
    </button>
  `).join('');

  filterArea.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedCategory = btn.dataset.category;
      renderFilterButtons();
      fetchHistory();
    });
  });
}

async function fetchHistory() {
  const sessionList = document.getElementById('sessionList');
  const totalCount = document.getElementById('totalCount');

  sessionList.innerHTML = '<div class="text-center py-12 text-black/40">기록을 불러오는 중...</div>';

  try {
    const params = { page: 1, limit: 100 };

    if (selectedCategory !== '전체') {
      const category = categories.find((c) => c.label === selectedCategory);
      if (category) params.category = category.name;
    }

    const data = await getSessionHistory(params);
    const sessions = data.sessions;

    if (sessions.length === 0) {
      sessionList.innerHTML = `
        <div class="text-center py-12 space-y-4">
          <p class="text-black/40">아직 퀴즈를 풀지 않았습니다.</p>
          <a href="/pages/category.html" class="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-black/90 transition-colors">퀴즈 시작하기</a>
        </div>`;
      totalCount.textContent = '';
      return;
    }

    sessionList.innerHTML = sessions.map((session) => `
      <a
        href="/pages/result.html"
        class="block w-full p-6 border border-black/10 rounded-lg hover:bg-black/5 transition-colors"
        data-session-id="${session.sessionId}"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 space-y-3">
            <div class="flex items-center gap-3">
              <span class="px-3 py-1 text-sm border border-black/10 rounded">${session.category.toUpperCase()}</span>
              ${session.completedAt
                ? `<span class="text-sm text-black/40">${formatDate(session.completedAt)}</span>`
                : `<span class="text-sm text-yellow-600">진행 중</span>`
              }
            </div>
            <div class="flex items-center gap-6">
              <div class="flex items-center gap-2">
                <span class="text-2xl font-bold ${getScoreColor(session.score, session.totalQuizzes)}">${session.score}</span>
                <span class="text-black/60">/ ${session.totalQuizzes}</span>
              </div>
              <div class="text-sm text-black/60">점수: ${Math.round((session.score / session.totalQuizzes) * 100)}점</div>
            </div>
          </div>
          <div class="text-sm text-black/40">세션 #${session.sessionId}</div>
        </div>
      </a>
    `).join('');

    // 세션 클릭 시 결과 페이지로 이동
    sessionList.querySelectorAll('a[data-session-id]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.setItem('resultSessionId', link.dataset.sessionId);
        location.href = '/pages/result.html';
      });
    });

    totalCount.textContent = `총 ${data.total}개의 기록`;

  } catch (err) {
    sessionList.innerHTML = '<div class="text-center py-12 text-red-500">기록을 불러오는 데 실패했습니다.</div>';
  }
}

async function init() {
  try {
    const data = await getCategories();
    categories = data.categories;
  } catch (err) {
    categories = [];
  }
  renderFilterButtons();
  fetchHistory();
}

init();