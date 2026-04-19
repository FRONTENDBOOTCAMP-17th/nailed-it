import { requireAdmin, getCategories, createQuiz, clearAuth } from '/src/api.js';

export function initQuizFormPage() {
  requireAdmin();

  // 로그아웃
  document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      clearAuth();
      location.href = '/index.html';
    }
  });

  const form = document.getElementById('newQuestionForm');
  const categorySelect = document.getElementById('category');
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
    submitBtn.textContent = isLoading ? '등록 중...' : '등록';
  }

  // 카테고리 동적 렌더링
  async function loadCategories() {
    try {
      const data = await getCategories();
      const categories = data.categories;

      categorySelect.innerHTML = categories.map((cat) =>
        `<option value="${cat.name}">${cat.label}</option>`
      ).join('');
    } catch (err) {
      showError('카테고리를 불러오는 데 실패했습니다.');
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
      await createQuiz({
        title,
        category,
        question,
        options: [option1, option2, option3, option4],
        answer: parseInt(answerRadio.value),
        explanation,
        difficulty,
      });

      location.href = '/pages/admin/quiz-list.html';

    } catch (err) {
      showError(err.message || '문제 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  });

  loadCategories();
}