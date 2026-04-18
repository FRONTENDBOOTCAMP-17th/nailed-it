import { requireAuth, getQuiz, submitAnswer } from '/src/api.js';
<<<<<<< HEAD
import { icon } from '/src/components/icon.js';

// 헤더 주입 — exitBtn이 DOM에 생겨야 아래 이벤트 연결 가능
const slot = document.getElementById('headerSlot');
if (slot) {
  slot.outerHTML = `
    <header class="px-6 py-4 border-b border-black/10">
      <div class="max-w-md mx-auto flex items-center justify-between">
        <div class="flex items-center gap-4">
          <a href="/pages/category.html" aria-label="이전 페이지로"
             class="p-2 -ml-2 hover:bg-black/5 rounded-lg transition-colors">
            ${icon('arrow-left', 20)}
          </a>
          <h2 class="font-medium" id="categoryTitle"></h2>
        </div>
        <button id="exitBtn" type="button" aria-label="퀴즈 종료"
                class="p-2 hover:bg-black/5 rounded-lg transition-colors">
          ${icon('close', 20)}
        </button>
      </div>
    </header>
  `;
}
=======
>>>>>>> 0b85812 (feat: add and connect JavaScript files)

requireAuth();

// sessionStorage에서 세션 정보 가져오기
const sessionData = sessionStorage.getItem('quizSession');
if (!sessionData) {
  location.href = '/pages/category.html';
}

const { sessionId, quizIds, category } = JSON.parse(sessionData);

let currentIndex = 0;
let questions = [];
let selectedAnswer = null;
let showResult = false;

<<<<<<< HEAD
// headerTitle은 이제 id로 찾아야 함 (헤더가 동적으로 생성됨)
const headerTitle = document.getElementById('categoryTitle');
=======
const headerTitle = document.querySelector('h2');
>>>>>>> 0b85812 (feat: add and connect JavaScript files)
const progressBar = document.querySelector('.h-full.bg-black');
const questionNumberEl = document.querySelector('.text-sm.text-black\\/40');
const difficultyEl = document.querySelector('.text-xs.rounded');
const questionTitleEl = document.querySelector('.text-sm.font-medium.text-black\\/60');
const questionContentEl = document.querySelector('.text-xl');
const optionsList = document.getElementById('optionsList');
const resultArea = document.getElementById('resultArea');
const resultMessage = document.getElementById('resultMessage');
const explanationText = document.getElementById('explanationText');
const errorMessage = document.getElementById('errorMessage');
const beforeSubmit = document.getElementById('beforeSubmit');
const afterSubmit = document.getElementById('afterSubmit');
const skipBtn = document.getElementById('skipBtn');
const submitBtn = document.getElementById('submitBtn');
const nextBtn = document.getElementById('nextBtn');
const exitBtn = document.getElementById('exitBtn');

const difficultyMap = {
  easy: { label: '쉬움', class: 'bg-green-100 text-green-700' },
  medium: { label: '보통', class: 'bg-yellow-100 text-yellow-700' },
  hard: { label: '어려움', class: 'bg-red-100 text-red-700' },
};

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// 헤더 카테고리 표시
if (headerTitle) headerTitle.textContent = `${category.toUpperCase()} 퀴즈`;

// 문제 불러오기
async function loadQuestions() {
  try {
    const promises = quizIds.map((id) => getQuiz(id));
    questions = await Promise.all(promises);
    renderQuestion();
  } catch (err) {
    showError('문제를 불러오는 데 실패했습니다.');
  }
}

// 문제 렌더링
function renderQuestion() {
  const q = questions[currentIndex];

  const progress = ((currentIndex + 1) / questions.length) * 100;
  if (progressBar) progressBar.style.width = `${progress}%`;

  if (questionNumberEl) questionNumberEl.textContent = `문제 ${currentIndex + 1} / ${questions.length}`;
  if (difficultyEl) {
    const d = difficultyMap[q.difficulty] || difficultyMap.easy;
    difficultyEl.textContent = d.label;
    difficultyEl.className = `text-xs rounded px-2 py-1 ${d.class}`;
  }

  if (questionTitleEl) questionTitleEl.textContent = q.title;
  if (questionContentEl) questionContentEl.textContent = q.question;

  optionsList.innerHTML = q.options.map((option, index) => `
    <button
      class="option-btn w-full p-4 border border-black/10 rounded-lg text-left transition-all hover:bg-black/5"
      data-index="${index}"
    >
      <div class="flex items-center gap-3">
        <div class="w-6 h-6 rounded-full border-2 border-black/20 flex items-center justify-center flex-shrink-0"></div>
        <span>${escapeHtml(option)}</span>
      </div>
    </button>
  `).join('');

  optionsList.querySelectorAll('.option-btn').forEach((btn) => {
    btn.addEventListener('click', () => selectAnswer(parseInt(btn.dataset.index)));
  });

  selectedAnswer = null;
  showResult = false;
  resultArea.classList.add('hidden');
  beforeSubmit.classList.remove('hidden');
  afterSubmit.classList.add('hidden');
  submitBtn.disabled = true;
  submitBtn.className = 'flex-1 py-4 rounded-lg transition-colors bg-black/10 text-black/40 cursor-not-allowed';
  skipBtn.disabled = false;
  hideError();
}

// 보기 선택
function selectAnswer(index) {
  if (showResult) return;
  selectedAnswer = index;

  optionsList.querySelectorAll('.option-btn').forEach((btn) => {
    const btnIndex = parseInt(btn.dataset.index);
    const dot = btn.querySelector('.w-6');

    if (btnIndex === index) {
      btn.className = 'option-btn w-full p-4 border border-black bg-black text-white rounded-lg text-left transition-all';
      dot.innerHTML = '<div class="w-3 h-3 rounded-full bg-white"></div>';
    } else {
      btn.className = 'option-btn w-full p-4 border border-black/10 rounded-lg text-left transition-all hover:bg-black/5';
      dot.innerHTML = '';
    }
  });

  submitBtn.disabled = false;
  submitBtn.className = 'flex-1 py-4 rounded-lg transition-colors bg-black text-white hover:bg-black/90';
}

// 답안 제출
async function handleSubmit(skipped = false) {
  showResult = true;
  submitBtn.disabled = true;
  skipBtn.disabled = true;

  try {
    const selected = skipped ? null : selectedAnswer;
    const result = await submitAnswer(sessionId, questions[currentIndex].id, selected);

    optionsList.querySelectorAll('.option-btn').forEach((btn) => {
      const btnIndex = parseInt(btn.dataset.index);
      const dot = btn.querySelector('.w-6');

      if (btnIndex === result.answer) {
        btn.className = 'option-btn w-full p-4 border border-green-600 bg-green-50 rounded-lg text-left transition-all';
        dot.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
      } else if (!skipped && btnIndex === selectedAnswer && !result.correct) {
        btn.className = 'option-btn w-full p-4 border border-red-600 bg-red-50 rounded-lg text-left transition-all';
        dot.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
      }
    });

    resultArea.classList.remove('hidden');
    if (result.correct) {
      resultMessage.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span class="font-medium text-green-700">정답입니다!</span>`;
    } else if (result.skipped) {
      resultMessage.innerHTML = `<span class="font-medium text-black/60">스킵했습니다</span>`;
    } else {
      resultMessage.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg><span class="font-medium text-red-700">틀렸습니다</span>`;
    }
    explanationText.textContent = result.explanation;

    beforeSubmit.classList.add('hidden');
    afterSubmit.classList.remove('hidden');
    nextBtn.textContent = currentIndex === questions.length - 1 ? '결과 확인하기' : '다음 문제';

  } catch (err) {
    showError(err.message || '답안 제출에 실패했습니다.');
    showResult = false;
    submitBtn.disabled = false;
    skipBtn.disabled = false;
  }
}

// 다음 문제
function handleNext() {
  if (currentIndex < questions.length - 1) {
    currentIndex++;
    renderQuestion();
  } else {
    sessionStorage.removeItem('quizSession');
    sessionStorage.setItem('resultSessionId', sessionId);
    location.href = '/pages/result.html';
  }
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
}

function hideError() {
  errorMessage.classList.add('hidden');
}

submitBtn.addEventListener('click', () => handleSubmit(false));
skipBtn.addEventListener('click', () => handleSubmit(true));
nextBtn.addEventListener('click', handleNext);
exitBtn.addEventListener('click', () => {
  if (confirm('퀴즈를 종료하시겠습니까? 진행 상황은 저장되지 않습니다.')) {
    sessionStorage.removeItem('quizSession');
    location.href = '/pages/category.html';
  }
});

loadQuestions();