import { requireAdmin, getCategories, getAdminQuiz, updateQuiz, clearAuth } from '/src/api.js';

requireAdmin();

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

const form = document.getElementById('editQuestionForm');
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
  submitBtn.textContent = isLoading ? '수정 중...' : '수정 완료';
}

// 카테고리 + 기존 데이터 로드
async function loadData() {
  try {
    const [categoriesData, quizData] = await Promise.all([
      getCategories(),
      getAdminQuiz(quizId),
    ]);

    // 카테고리 렌더링
    const categorySelect = document.getElementById('category');
    categorySelect.innerHTML = categoriesData.categories.map((cat) =>
      `<option value="${cat.name}" ${cat.name === quizData.category ? 'selected' : ''}>${cat.label}</option>`
    ).join('');

    // 난이도
    document.getElementById('difficulty').value = quizData.difficulty;

    // 폼 채우기
    document.getElementById('title').value = quizData.title;
    document.getElementById('question').value = quizData.question;
    document.getElementById('option1').value = quizData.options[0] || '';
    document.getElementById('option2').value = quizData.options[1] || '';
    document.getElementById('option3').value = quizData.options[2] || '';
    document.getElementById('option4').value = quizData.options[3] || '';
    document.getElementById('explanation').value = quizData.explanation;

    // 정답 라디오 선택
    const answerRadio = document.querySelector(`input[name="answer"][value="${quizData.answer}"]`);
    if (answerRadio) answerRadio.checked = true;

  } catch (err) {
    showError('문제를 불러오는 데 실패했습니다.');
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError();

  const title = document.getElementById('title').value.trim();
  const category = document.getElementById('category').value;
  const difficulty = document.getElementById('difficulty').value;
  const question = document.getElementById('question').value.trim();
  const option1 = document.getElementById('option1').value.trim();
  const option2 = document.getElementById('option2').value.trim();
  const option3 = document.getElementById('option3').value.trim();
  const option4 = document.getElementById('option4').value.trim();
  const explanation = document.getElementById('explanation').value.trim();
  const answerRadio = document.querySelector('input[name="answer"]:checked');

  if (!title) return showError('퀴즈 제목을 입력해주세요.');
  if (!question) return showError('문제 내용을 입력해주세요.');
  if (!option1 || !option2 || !option3 || !option4) return showError('모든 보기를 입력해주세요.');
  if (!answerRadio) return showError('정답을 선택해주세요.');
  if (!explanation) return showError('해설을 입력해주세요.');

  setLoading(true);

  try {
    await updateQuiz(quizId, {
      title,
      category,
      question,
      options: [option1, option2, option3, option4],
      answer: parseInt(answerRadio.value),
      explanation,
      difficulty,
    });

    location.href = '/pages/admin/quiz-detail.html';

  } catch (err) {
    showError(err.message || '문제 수정에 실패했습니다.');
  } finally {
    setLoading(false);
  }
});

loadData();