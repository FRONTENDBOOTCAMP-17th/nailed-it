import { requireAdmin, getCategories, getAdminQuizzes, clearAuth } from '/src/api.js';

export function initQuizListPage() {
  requireAdmin();

  // 로그아웃
  document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      clearAuth();
      location.href = '/index.html';
    }
  });

  let selectedCategory = '전체';
  let categories = [];

  const tableBody = document.getElementById('tableBody');
  const statsEl = document.getElementById('stats');

  const difficultyMap = {
    easy: { label: '쉬움', class: 'bg-green-100 text-green-700' },
    medium: { label: '보통', class: 'bg-yellow-100 text-yellow-700' },
    hard: { label: '어려움', class: 'bg-red-100 text-red-700' },
  };

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
        fetchQuizzes();
      });
    });
  }

  async function fetchQuizzes() {
    tableBody.innerHTML = '<div class="px-6 py-12 text-center text-black/40">문제를 불러오는 중...</div>';

    try {
      const params = { page: 1, limit: 100 };

      if (selectedCategory !== '전체') {
        const category = categories.find((c) => c.label === selectedCategory);
        if (category) params.category = category.name;
      }

      const data = await getAdminQuizzes(params);
      const quizzes = data.quizzes;

      if (quizzes.length === 0) {
        tableBody.innerHTML = '<div class="px-6 py-12 text-center text-black/40">등록된 문제가 없습니다.</div>';
        statsEl.textContent = '';
        return;
      }

      tableBody.innerHTML = quizzes.map((quiz, index) => {
        const d = difficultyMap[quiz.difficulty] || difficultyMap.easy;
        const date = quiz.createdAt?.split('T')[0];
        return `
          <a
            class="w-full grid grid-cols-12 gap-4 px-6 py-4 text-left hover:bg-black/5 transition-colors block cursor-pointer"
            data-quiz-id="${quiz.id}"
          >
            <div class="col-span-1 text-black/60">${index + 1}</div>
            <div class="col-span-2">
              <span class="px-2 py-1 text-xs border border-black/10 rounded">${quiz.category.toUpperCase()}</span>
            </div>
            <div class="col-span-5 truncate">${quiz.title}</div>
            <div class="col-span-2">
              <span class="px-2 py-1 text-xs rounded ${d.class}">${d.label}</span>
            </div>
            <div class="col-span-2 text-black/60 text-sm">${date}</div>
          </a>
        `;
      }).join('');

      // 문제 클릭 시 상세 페이지로 이동
      tableBody.querySelectorAll('a[data-quiz-id]').forEach((link) => {
        link.addEventListener('click', () => {
          sessionStorage.setItem('adminQuizId', link.dataset.quizId);
          location.href = '/pages/admin/quiz-detail.html';
        });
      });

      // 통계
      const total = data.total;
      const categoryStats = categories.map((c) => {
        const count = quizzes.filter((q) => q.category === c.name).length;
        return `| ${c.label}: ${count}개`;
      }).join(' ');
      statsEl.innerHTML = `<span>전체 문제: ${total}개</span> ${categoryStats}`;

    } catch (err) {
      tableBody.innerHTML = '<div class="px-6 py-12 text-center text-red-500">문제를 불러오는 데 실패했습니다.</div>';
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
    fetchQuizzes();
  }

  init();
}