import { requireAdmin, getAdminQuiz, deleteQuiz, clearAuth } from '/src/api.js';

requireAdmin();

// sessionStorage에서 quizId 가져오기
const quizId = sessionStorage.getItem('adminQuizId');
if (!quizId) {
  location.href = '/pages/admin/quiz-list.html';
}

// 로그아웃
document.getElementById('logoutBtn').addEventListener('click', () => {
  if (confirm('로그아웃 하시겠습니까?')) {
    clearAuth();
    location.href = '/index.html';
  }
});

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const difficultyMap = {
  easy: { label: '쉬움', class: 'bg-green-100 text-green-700' },
  medium: { label: '보통', class: 'bg-yellow-100 text-yellow-700' },
  hard: { label: '어려움', class: 'bg-red-100 text-red-700' },
};

async function renderQuizDetail() {
  const main = document.querySelector('main .space-y-8');

  try {
    const data = await getAdminQuiz(quizId);
    const d = difficultyMap[data.difficulty] || difficultyMap.easy;
    const date = data.createdAt?.split('T')[0];

    main.innerHTML = `
      <div class="space-y-6">

        <!-- 카테고리 / 난이도 / 생성일 -->
        <div class="flex items-center gap-4 text-sm flex-wrap">
          <span class="px-3 py-1 border border-black/10 rounded">${data.category.toUpperCase()}</span>
          <span class="px-3 py-1 rounded ${d.class}">${d.label}</span>
          <span class="text-black/40">생성일: ${date}</span>
        </div>

        <!-- 퀴즈 제목 -->
        <div class="space-y-2">
          <h3 class="text-sm font-medium text-black/60">퀴즈 제목</h3>
          <p class="text-lg font-medium">${escapeHtml(data.title)}</p>
        </div>

        <!-- 문제 내용 -->
        <div class="space-y-2">
          <h3 class="text-sm font-medium text-black/60">문제 내용</h3>
          <p class="text-lg">${escapeHtml(data.question)}</p>
        </div>

        <!-- 보기 -->
        <div class="space-y-2">
          <h3 class="text-sm font-medium text-black/60">보기</h3>
          <div class="space-y-2">
            ${data.options.map((option, index) => `
              <div class="p-4 border ${index === data.answer ? 'border-green-600 bg-green-50' : 'border-black/10'} rounded-lg">
                <div class="flex items-center gap-3">
                  <span class="text-sm text-black/60">${index + 1}.</span>
                  <span>${escapeHtml(option)}</span>
                  ${index === data.answer ? '<span class="ml-auto text-sm font-medium text-green-600">정답</span>' : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 해설 -->
        <div class="space-y-2">
          <h3 class="text-sm font-medium text-black/60">해설</h3>
          <div class="p-4 bg-black/5 rounded-lg">
            <p>${escapeHtml(data.explanation)}</p>
          </div>
        </div>

      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3">
        <a href="/pages/admin/quiz-list.html" class="flex-1 py-4 border border-black/20 rounded-lg hover:bg-black/5 transition-colors text-center">
          목록으로
        </a>
        <button
          id="editBtn"
          class="flex items-center justify-center gap-2 px-6 py-4 bg-black text-white rounded-lg hover:bg-black/90 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          수정
        </button>
        <button
          id="deleteBtn"
          class="flex items-center justify-center gap-2 px-6 py-4 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
            <path d="M10 11v6"></path>
            <path d="M14 11v6"></path>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
          </svg>
          삭제
        </button>
      </div>
    `;

    // 수정 버튼
    document.getElementById('editBtn').addEventListener('click', () => {
      location.href = '/pages/admin/quiz-edit.html';
    });

    // 삭제 버튼
    document.getElementById('deleteBtn').addEventListener('click', async () => {
      if (!confirm('정말로 이 문제를 삭제하시겠습니까?')) return;
      try {
        await deleteQuiz(quizId);
        sessionStorage.removeItem('adminQuizId');
        location.href = '/pages/admin/quiz-list.html';
      } catch (err) {
        alert(err.message || '문제 삭제에 실패했습니다.');
      }
    });

  } catch (err) {
    main.innerHTML = `
      <div class="text-center space-y-4">
        <p class="text-black/60">문제를 불러오는 데 실패했습니다.</p>
        <a href="/pages/admin/quiz-list.html" class="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-black/90 transition-colors">목록으로</a>
      </div>
    `;
  }
}

renderQuizDetail();