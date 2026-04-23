import { requireAuth, getSessionResult, clearAuth } from '/src/api.js';
import { pageHeader, defaultActions } from '/src/components/header.js';

export function initResultPage() {
  // 헤더 주입 — logoutBtn이 DOM에 생겨야 아래 이벤트 연결 가능
  const slot = document.getElementById('headerSlot');
  if (slot) {
    slot.outerHTML = pageHeader({
      title: '퀴즈 결과',
      actionsHtml: defaultActions(),
    });
  }

  requireAuth();

  const sessionId = sessionStorage.getItem('resultSessionId');
  if (!sessionId) {
    location.href = '/pages/category.html';
  }

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      clearAuth();
      location.href = '/index.html';
    }
  });

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  async function renderResult() {
    try {
      const data = await getSessionResult(sessionId);

      const score = Math.round((data.score / data.totalQuizzes) * 100);
      const wrongCount = data.totalQuizzes - data.score;
      const completedAt = data.completedAt
        ? new Date(data.completedAt).toLocaleString('ko-KR')
        : '';

      const main = document.querySelector('main .space-y-8');

      main.innerHTML = `
        <!-- Score -->
        <div class="text-center space-y-4">
          <div class="inline-flex items-center justify-center w-32 h-32 border-4 border-black rounded-full">
            <span class="text-4xl font-bold">${score}점</span>
          </div>
          <div>
            <h3 class="text-xl font-medium">${data.category.toUpperCase()} 퀴즈 완료!</h3>
            ${completedAt ? `<p class="text-sm text-black/40 mt-2">완료 시간: ${completedAt}</p>` : ''}
          </div>
          <a href="/pages/category.html" class="block w-full bg-black text-white py-4 rounded-lg hover:bg-black/90 transition-colors text-center">다시 풀기</a>
        </div>

        <!-- Summary -->
        <div class="grid grid-cols-2 gap-4">
          <div class="p-6 border border-black/10 rounded-lg text-center space-y-2">
            <div class="text-2xl font-bold text-green-600">${data.score}</div>
            <div class="text-sm text-black/60">맞은 문제</div>
          </div>
          <div class="p-6 border border-black/10 rounded-lg text-center space-y-2">
            <div class="text-2xl font-bold text-red-600">${wrongCount}</div>
            <div class="text-sm text-black/60">틀린 문제</div>
          </div>
        </div>

        <!-- Question Results -->
        <div class="space-y-3">
          <h4 class="font-medium">문제별 결과</h4>
          <div class="space-y-2">
            ${data.answers.map((answer, index) => {
              const isCorrect = answer.correct;
              const isSkipped = answer.skipped;
              const isOpen = !isCorrect;

              const borderColor = isCorrect ? 'border-black/10' : 'border-red-300';
              const headerBg = isCorrect ? '' : 'bg-red-50';
              const detailBg = isCorrect ? 'bg-black/5' : 'bg-white';
              const detailBorder = isCorrect ? 'border-black/10' : 'border-red-300';
              const explanationBorder = isCorrect ? 'border-black/10' : 'border-red-200';

              const icon = isCorrect
                ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" class="flex-shrink-0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`
                : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" class="flex-shrink-0"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;

              return `
                <div class="border ${borderColor} rounded-lg overflow-hidden">
                  <button class="answer-toggle w-full flex items-center gap-3 p-4 text-left ${headerBg}">
                    ${icon}
                    <div class="flex-1 min-w-0">
                      <span class="text-sm text-black/40">문제 ${index + 1}</span>
                      <span class="text-base font-medium ml-2">${escapeHtml(answer.title)}</span>
                    </div>
                    <svg class="flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  <div class="answer-detail border-t ${detailBorder} ${detailBg} p-4 space-y-3 ${isOpen ? '' : 'hidden'}">
                    <p class="text-base text-black">${escapeHtml(answer.question)}</p>
                    <div class="space-y-2">
                      ${isSkipped
                        ? `<div class="flex items-center gap-2">
                             <span class="text-sm text-black/60 w-8 flex-shrink-0">선택</span>
                             <span class="text-base text-blue-700">스킵함</span>
                           </div>`
                        : !isCorrect && answer.selectedIndex !== null
                        ? `<div class="flex items-center gap-2">
                             <span class="text-sm text-black/60 w-8 flex-shrink-0">선택</span>
                             <span class="text-base text-red-500">${escapeHtml(answer.options[answer.selectedIndex])}</span>
                           </div>`
                        : ''
                      }
                      <div class="flex items-center gap-2">
                        <span class="text-sm text-black/60 w-8 flex-shrink-0">정답</span>
                        <span class="text-base text-green-600 font-medium">${escapeHtml(answer.options[answer.answer])}</span>
                      </div>
                    </div>
                    <div class="pt-1 pl-3 border-l-2 ${explanationBorder}">
                      <p class="text-sm text-black/60 mb-1">해설</p>
                      <p class="text-base text-black/80">${escapeHtml(answer.explanation)}</p>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;

      // 접기/펼치기 이벤트
      document.querySelectorAll('.answer-toggle').forEach((btn) => {
        btn.addEventListener('click', () => {
          const detail = btn.nextElementSibling;
          const arrow = btn.querySelector('svg.transition-transform');
          detail.classList.toggle('hidden');
          arrow.classList.toggle('rotate-180');
        });
      });

      sessionStorage.removeItem('resultSessionId');

    } catch (err) {
      document.querySelector('main .space-y-8').innerHTML = `
        <div class="text-center space-y-4">
          <p class="text-black/60">결과를 불러오는 데 실패했습니다.</p>
          <a href="/pages/category.html" class="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-black/90 transition-colors">카테고리로 돌아가기</a>
        </div>
      `;
    }
  }

  renderResult();
}