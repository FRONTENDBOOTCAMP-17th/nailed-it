# 2026-04-16 코드 리뷰

## 리뷰 범위

- `index.html`
- `pages/login.html`
- `pages/signup.html`
- `pages/category.html`
- `pages/history.html`
- `pages/quiz.html`
- `pages/result.html`
- `pages/admin/quiz-list.html`
- `pages/admin/quiz-form.html`
- `pages/admin/quiz-edit.html`
- `pages/admin/quiz-detail.html`
- `src/main.js`
- `src/api.js`
- `src/pages/*.js`
- `vite.config.js`
- `README.md`

## 먼저 칭찬할 점

- 화면 흐름을 사용자 페이지와 관리자 페이지로 나눠서 잡은 점은 좋습니다.
- CSS를 크게 늘리지 않고 Tailwind CSS로 UI를 구성하려는 방향도 좋습니다.
- `pages/`, `pages/admin/`, `src/pages/`처럼 폴더를 나누려는 시도는 응집도를 높이는 출발점입니다.

하지만 현재 상태는 "화면 시안이 많이 추가된 단계"에 가깝습니다. 실제 서비스 코드로 보려면 먼저 고쳐야 할 문제가 있습니다.

---

## 중요도 높음

### 1. 현재 상태로는 빌드가 실패합니다

**위치**

- `vite.config.js:13-21`

**문제 설명**

- 실제 파일명은 `pages/category.html`, `pages/admin/quiz-list.html`, `pages/admin/quiz-form.html`, `pages/admin/quiz-detail.html`, `pages/admin/quiz-edit.html`입니다.
- 그런데 `vite.config.js`는 아직 예전 이름인 `pages/categories.html`, `pages/admin/question-list.html`, `pages/admin/question-new.html`, `pages/admin/question-detail.html`, `pages/admin/question-edit.html`를 바라보고 있습니다.
- 그래서 `npm run build`를 실행하면 엔트리 파일을 찾지 못해 바로 실패합니다.

**재현 결과**

```bash
npm run build
```

- `Cannot resolve entry module pages/categories.html`
- `Cannot resolve entry module pages/admin/question-list.html`
- `Cannot resolve entry module pages/admin/question-new.html`
- `Cannot resolve entry module pages/admin/question-detail.html`
- `Cannot resolve entry module pages/admin/question-edit.html`

**왜 문제인가요?**

- 빌드가 안 되면 배포가 불가능합니다.
- 팀원이 코드를 받아도 "실행은 되는데 배포만 안 되는 문제"가 아니라, 아예 결과물을 만들 수 없는 상태입니다.
- 초보 개발자는 HTML만 있으면 되는 줄 알기 쉬운데, Vite는 `vite.config.js`의 입력 경로가 정확해야 합니다.

**리뷰 의견**

- 파일명을 바꿨다면, 그 파일을 참조하는 설정도 반드시 같이 바꿔야 합니다.
- "파일 이동/이름 변경"은 화면 파일 하나만 고치는 일이 아니라, 링크와 빌드 설정까지 묶어서 보는 습관이 필요합니다.

---

### 2. 페이지 이동 링크가 여러 곳에서 깨져 있습니다

**위치**

- `pages/login.html:16`
- `pages/category.html:17-18`
- `pages/category.html:28`
- `pages/history.html:17`
- `pages/history.html:27`
- `pages/quiz.html:17`
- `pages/result.html:43`
- `pages/result.html:49`
- `pages/admin/quiz-list.html:37`
- `pages/admin/quiz-form.html:17`
- `pages/admin/quiz-form.html:147`
- `pages/admin/quiz-edit.html:17`
- `pages/admin/quiz-edit.html:62`
- `pages/admin/quiz-detail.html:17`
- `pages/admin/quiz-detail.html:59`
- `pages/admin/quiz-detail.html:64`

**문제 설명**

- `pages/login.html`에서 뒤로가기가 `index.html`을 가리키는데, 현재 파일은 `pages/` 폴더 안에 있으므로 실제로는 `pages/index.html`을 찾게 됩니다.
- `pages/category.html`, `pages/history.html`, `pages/result.html`, `pages/quiz.html`도 같은 문제가 있습니다.
- 또 `category.html`로 파일명이 바뀌었는데 여전히 `categories.html`로 링크하는 곳이 있습니다.
- 관리자 페이지는 `quiz-*.html` 파일이 실제 이름인데, 링크는 아직 `question-*.html`을 사용하고 있습니다.

**왜 문제인가요?**

- 사용자는 버튼을 눌렀을 때 404 화면을 보게 됩니다.
- "화면은 있어 보이는데 이동이 안 되는 상태"는 초보 프로젝트에서 가장 혼란을 크게 만드는 문제입니다.
- 한 파일 이름을 바꾸면 여러 페이지가 같이 영향을 받기 때문에, 결합도가 높아진 부분이 바로 드러납니다.

**리뷰 의견**

- 경로는 절대 대충 쓰면 안 됩니다.
- `pages/` 안에 있는 파일에서 루트의 `index.html`로 가려면 `../index.html`처럼 상대 경로를 정확히 써야 합니다.
- 자주 쓰는 경로는 상수로 관리하거나, 최소한 페이지 구조를 바꿀 때 링크 검사를 같이 해야 합니다.

---

### 3. JavaScript 파일 구조는 생겼지만 실제 동작은 연결되지 않았습니다

**위치**

- `src/main.js:1`
- `src/api.js`
- `src/pages/login.js`
- `src/pages/signup.js`
- `src/pages/category.js`
- `src/pages/history.js`
- `src/pages/quiz.js`
- `src/pages/result.js`
- `src/pages/admin/quiz-list.js`
- `src/pages/admin/quiz-form.js`
- `src/pages/admin/quiz-edit.js`
- `src/pages/admin/quiz-detail.js`
- `pages/login.html:30-75`
- `pages/signup.html:30-81`
- `pages/category.html:71-145`
- `pages/quiz.html:45-75`
- `pages/admin/quiz-list.html:73-83`

**문제 설명**

- `src/main.js`는 현재 `import "./style.css";` 한 줄만 있습니다.
- 페이지별 JavaScript 파일과 `src/api.js`는 모두 비어 있습니다.
- 그런데 HTML에는 로그인 폼, 회원가입 폼, 카테고리 선택 버튼, 로그아웃 버튼, 문제 목록 영역, 제출 버튼이 모두 들어 있습니다.

**왜 문제인가요?**

- 지금 코드는 "동작하는 페이지"가 아니라 "동작할 것처럼 보이는 화면"입니다.
- 버튼과 폼이 존재하면 사용자는 당연히 동작을 기대합니다.
- 초보 개발자에게 특히 중요한 점은, HTML과 JavaScript의 역할을 나누되 둘 중 하나만 만들고 끝내면 안 된다는 것입니다.

**리뷰 의견**

- 페이지별 파일을 만든 방향은 좋지만, 각 파일이 자기 책임을 가져야 합니다.
- 예를 들어 `login.js`는 로그인 폼 이벤트만, `category.js`는 카테고리 클릭만, `quiz-list.js`는 문제 목록 렌더링만 맡는 구조여야 응집도가 높아집니다.
- 지금처럼 파일은 나뉘었지만 비어 있으면 구조만 있고 기능은 없는 상태입니다.

---

### 4. 관리자 페이지와 사용자 페이지 곳곳에 "이름 변경 전 흔적"이 남아 있어 결합도가 높습니다

**위치**

- `vite.config.js:13-21`
- `pages/result.html:43`
- `pages/history.html:17`
- `pages/quiz.html:17`
- `pages/admin/quiz-list.html:37`
- `pages/admin/quiz-form.html:17`
- `pages/admin/quiz-edit.html:17`
- `pages/admin/quiz-detail.html:17`
- `README.md:41-76`

**문제 설명**

- 파일명은 `category.html`, `quiz-list.html`, `quiz-form.html`으로 바뀌었는데, 설정 파일과 문서, 링크에는 이전 이름이 섞여 있습니다.
- `README.md`도 실제 구조와 다르게 `src/pages/` 아래에 HTML이 있는 것처럼 적혀 있고, `src/js/` 구조도 현재 저장소와 맞지 않습니다.

**왜 문제인가요?**

- 팀원이 문서를 보고 폴더를 찾으면 실제 구조와 다르기 때문에 바로 혼란이 생깁니다.
- 한 번의 이름 변경이 너무 많은 파일에 흩어져 있으면, 구조가 서로 단단히 묶여 있다는 뜻입니다.
- 이런 상태는 수정할 때 빠뜨리는 파일이 계속 생깁니다.

**리뷰 의견**

- 파일명, 링크, 빌드 설정, README는 같이 움직여야 합니다.
- "한 군데 바꾸면 끝"이 아니라 "그 이름을 참조하는 모든 곳"을 한 번에 확인하는 습관이 필요합니다.

---

## 중요도 중간

### 5. 기본 HTML 폼 품질이 부족해서 브라우저가 도와줄 수 있는 부분을 놓치고 있습니다

**위치**

- `pages/login.html:34-45`
- `pages/signup.html:34-69`
- `pages/admin/quiz-form.html:46-139`

**문제 설명**

- 여러 `label`에 `for`가 없습니다.
- 입력 요소에 `name`, `required`, `autocomplete`가 빠져 있습니다.
- 회원가입, 로그인, 문제 등록은 모두 폼인데 브라우저 기본 검증을 거의 활용하지 않고 있습니다.

**왜 문제인가요?**

- 키보드 사용성과 접근성이 떨어집니다.
- JavaScript가 없더라도 브라우저가 기본으로 잡아줄 수 있는 검증을 놓치게 됩니다.
- 초보 단계에서는 브라우저 기본 기능을 잘 쓰는 것이 오히려 코드를 단순하게 만듭니다.

**리뷰 의견**

- HTML만으로 해결할 수 있는 문제는 HTML에서 먼저 해결하는 습관이 좋습니다.
- 이것은 CSS를 줄이는 것과 비슷하게, JavaScript도 꼭 필요한 만큼만 쓰게 해줍니다.

---

### 6. 인라인 이벤트와 반복 마크업이 커질수록 결합도가 올라갑니다

**위치**

- `pages/login.html:67-69`
- `pages/admin/quiz-list.html:50-57`
- `pages/category.html:74-143`

**문제 설명**

- 로그인 페이지에는 `onclick="alert(...)"`가 들어 있습니다.
- 관리자 목록 페이지도 `onclick="filterCategory(...)"`를 HTML에 직접 넣었습니다.
- 카테고리 카드 마크업은 거의 같은 구조가 3번 반복됩니다.

**왜 문제인가요?**

- HTML 안에 동작 코드를 넣으면 구조와 동작이 섞입니다.
- 같은 카드 구조가 계속 반복되면 수정할 때 세 군데를 같이 고쳐야 합니다.
- 이런 방식은 파일이 커질수록 응집도는 떨어지고 결합도는 올라갑니다.

**리뷰 의견**

- 이벤트 연결은 JavaScript에서 `addEventListener`로 처리하는 편이 좋습니다.
- 반복 UI는 Tailwind를 유지한 채로 JavaScript 배열과 템플릿 함수로 렌더링하면 됩니다.
- CSS를 늘리는 대신, "반복되는 HTML을 줄이는 방향"으로 생각해야 합니다.

---

## 우선순위 제안

1. `vite.config.js`의 엔트리 경로를 실제 파일명과 맞춥니다.
2. 모든 페이지 링크를 실제 폴더 구조에 맞게 다시 확인합니다.
3. `main.js`에서 현재 페이지를 판단하고, 페이지별 JS를 초기화하는 구조를 만듭니다.
4. 로그인, 회원가입, 카테고리, 퀴즈, 관리자 목록처럼 핵심 흐름부터 동작을 붙입니다.
5. `label`, `for`, `name`, `required`, `autocomplete`를 먼저 채웁니다.
6. 인라인 이벤트를 제거하고, 반복 UI를 데이터 기반으로 렌더링합니다.
7. README를 실제 구조와 맞게 고칩니다.

## 한 줄 총평

방향은 나쁘지 않지만, 지금은 "파일이 많아진 것"에 비해 "실제로 연결된 기능"이 부족합니다. 먼저 빌드와 링크부터 살리고, 그다음 페이지별 JavaScript 책임을 분리하면 응집도는 높아지고 결합도는 확실히 낮아질 수 있습니다.
