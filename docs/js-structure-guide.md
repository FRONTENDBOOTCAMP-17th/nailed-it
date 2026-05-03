# JavaScript 파일 구조화 가이드

> "코드가 길어지면 어디에 뭐가 있는지 모르겠어요..." 라는 고민을 해결하는 가이드입니다.

---

## 목차

1. [왜 파일을 나눠야 할까?](#1-왜-파일을-나눠야-할까)
2. [폴더 구조 한눈에 보기](#2-폴더-구조-한눈에-보기)
3. [각 폴더의 역할](#3-각-폴더의-역할)
4. [실전 예제: 퀴즈 앱으로 배우기](#4-실전-예제-퀴즈-앱으로-배우기)
5. [import/export 사용법](#5-importexport-사용법)
6. [파일을 나누는 기준](#6-파일을-나누는-기준)
7. [자주 하는 실수와 해결법](#7-자주-하는-실수와-해결법)
8. [단계별 실습](#8-단계별-실습)

---

## 1. 왜 파일을 나눠야 할까?

### 파일 하나에 모든 코드를 넣으면 생기는 문제

상상해보세요. 서랍 하나에 양말, 속옷, 티셔츠, 바지를 전부 넣어두면 어떻게 될까요?

```
🗄️ 서랍 하나 = main.js 하나

양말 어디 갔지...? → 함수 어디 갔지...?
바지 꺼내다 양말이 같이 나옴 → 코드 수정하다 다른 기능이 망가짐
서랍이 꽉 차서 안 닫힘 → 파일이 1000줄이 넘어서 스크롤 지옥
```

### 파일을 나누면 좋은 점

```
🗄️ 서랍을 여러 개로 = 파일을 여러 개로

양말 서랍 → quiz 관련 코드
바지 서랍 → UI 관련 코드  
속옷 서랍 → 데이터 관련 코드

✅ 찾기 쉽다
✅ 하나만 수정해도 다른 건 안전하다
✅ 팀원이 동시에 다른 파일을 작업할 수 있다
```

---

## 2. 폴더 구조 한눈에 보기

우리 NAILED IT 프로젝트에 맞는 폴더 구조입니다:

```
nailed-it/
├── index.html              ← 브라우저가 가장 먼저 읽는 파일
├── css/
│   └── style.css           ← Tailwind CSS + 커스텀 스타일
├── js/
│   ├── main.js             ← 🚀 시작점! 여기서 모든 것이 시작됩니다
│   ├── components/         ← 🧩 화면에 보이는 것들 (UI 조각)
│   │   ├── QuizCard.js     ←   퀴즈 카드 UI
│   │   ├── Timer.js        ←   타이머 UI
│   │   └── ScoreBoard.js   ←   점수판 UI
│   ├── data/               ← 📦 퀴즈 문제 데이터
│   │   ├── htmlQuiz.js     ←   HTML 관련 퀴즈 데이터
│   │   ├── cssQuiz.js      ←   CSS 관련 퀴즈 데이터
│   │   └── jsQuiz.js       ←   JavaScript 관련 퀴즈 데이터
│   ├── utils/              ← 🔧 어디서든 쓸 수 있는 도우미 함수
│   │   ├── shuffle.js      ←   배열 섞기 함수
│   │   └── storage.js      ←   로컬스토리지 저장/불러오기
│   └── pages/              ← 📄 페이지 단위 코드
│       ├── home.js         ←   홈 화면
│       └── quiz.js         ←   퀴즈 풀기 화면
├── assets/                 ← 🖼️ 이미지, 아이콘 등
│   └── images/
├── package.json
└── vite.config.js
```

> **핵심 규칙**: 폴더 이름만 봐도 "아, 여기에는 이런 코드가 있겠구나!" 하고 알 수 있어야 합니다.

---

## 3. 각 폴더의 역할

### `js/main.js` - 시작점 (Entry Point)

앱이 처음 실행될 때 불리는 파일입니다. **교통 경찰관** 같은 역할이에요.

```js
// js/main.js
import '../css/style.css';

// 다른 파일들을 불러와서 앱을 시작합니다
import { initHomePage } from './pages/home.js';

// 앱 시작!
initHomePage();
```

**main.js의 규칙**:
- 직접 많은 코드를 쓰지 않습니다
- 다른 파일들을 `import`해서 연결하는 역할만 합니다
- "앱이 시작되면 뭘 해야 하지?" 에 대한 답만 적습니다

---

### `js/components/` - UI 조각들

**화면에 보이는 것**을 만드는 코드를 넣는 곳입니다. 레고 블록처럼 하나하나가 독립적인 UI 조각이에요.

```js
// js/components/QuizCard.js

/**
 * 퀴즈 카드 하나를 만들어서 돌려줍니다.
 * 
 * @param {Object} quiz - 퀴즈 데이터
 * @param {string} quiz.question - 문제
 * @param {string[]} quiz.choices - 선택지 배열
 * @returns {HTMLElement} 퀴즈 카드 요소
 */
export function createQuizCard(quiz) {
  const card = document.createElement('div');
  card.className = 'bg-white rounded-lg shadow-md p-6';

  // 문제 표시
  const question = document.createElement('h2');
  question.className = 'text-xl font-bold mb-4';
  question.textContent = quiz.question;
  card.appendChild(question);

  // 선택지 표시
  quiz.choices.forEach((choice, index) => {
    const button = document.createElement('button');
    button.className = 'block w-full text-left p-3 mb-2 rounded border hover:bg-blue-50';
    button.textContent = `${index + 1}. ${choice}`;
    card.appendChild(button);
  });

  return card;
}
```

**components 폴더 규칙**:
- 파일 이름은 **대문자로 시작** (예: `QuizCard.js`, `Timer.js`)
- 한 파일에 하나의 UI 조각만 만듭니다
- 데이터를 직접 가져오지 않고, **매개변수(parameter)로 받습니다**

---

### `js/data/` - 데이터 저장소

퀴즈 문제, 정답 등 **데이터**를 저장하는 곳입니다. 냉장고에 재료를 보관하는 것과 같아요.

```js
// js/data/htmlQuiz.js

export const htmlQuizzes = [
  {
    id: 1,
    question: 'HTML에서 가장 큰 제목 태그는?',
    choices: ['<h6>', '<h1>', '<header>', '<title>'],
    answer: 1,        // choices[1] = '<h1>'이 정답
    explanation: 'h1이 가장 큰 제목이고, h6이 가장 작은 제목입니다.',
  },
  {
    id: 2,
    question: '이미지를 삽입하는 태그는?',
    choices: ['<picture>', '<img>', '<image>', '<photo>'],
    answer: 1,
    explanation: '<img> 태그는 src 속성으로 이미지 경로를 지정합니다.',
  },
];
```

**data 폴더 규칙**:
- 파일 이름은 **소문자**로 시작 (예: `htmlQuiz.js`)
- **순수한 데이터만** 넣습니다 (함수나 DOM 조작 코드 X)
- 데이터가 많아지면 주제별로 파일을 나눕니다

---

### `js/utils/` - 도우미 함수들

여러 곳에서 **재사용**하는 작은 함수들을 모아두는 곳입니다. 공구함 같은 역할이에요.

```js
// js/utils/shuffle.js

/**
 * 배열을 랜덤하게 섞어줍니다.
 * 퀴즈 선택지 순서를 매번 다르게 하고 싶을 때 사용합니다.
 * 
 * @param {Array} array - 섞고 싶은 배열
 * @returns {Array} 섞인 새 배열
 */
export function shuffle(array) {
  const shuffled = [...array]; // 원본은 건드리지 않고 복사본을 만듭니다

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}
```

```js
// js/utils/storage.js

/**
 * 로컬스토리지에 데이터를 저장합니다.
 * 브라우저를 닫아도 데이터가 남아있어요.
 * 
 * @param {string} key - 저장할 이름표
 * @param {*} value - 저장할 데이터
 */
export function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/**
 * 로컬스토리지에서 데이터를 불러옵니다.
 * 
 * @param {string} key - 불러올 이름표
 * @returns {*} 저장된 데이터, 없으면 null
 */
export function loadData(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}
```

**utils 폴더 규칙**:
- 파일 이름은 **소문자**로 시작 (예: `shuffle.js`)
- 한 파일에 **관련된 함수들만** 모읍니다
- DOM을 직접 조작하지 않습니다 (화면 관련 코드는 components에!)
- 어디서든 가져다 쓸 수 있는 **범용 함수**만 넣습니다

---

### `js/pages/` - 페이지 단위 코드

하나의 화면(페이지)을 구성하는 코드입니다. components와 data를 **조합**하는 역할이에요.

```js
// js/pages/quiz.js
import { htmlQuizzes } from '../data/htmlQuiz.js';
import { createQuizCard } from '../components/QuizCard.js';
import { shuffle } from '../utils/shuffle.js';

/**
 * 퀴즈 페이지를 초기화합니다.
 * 데이터를 가져오고, UI를 만들어서, 화면에 보여줍니다.
 */
export function initQuizPage() {
  const container = document.querySelector('#app');
  
  // 1. 데이터 준비
  const quizzes = shuffle(htmlQuizzes);
  
  // 2. UI 만들기
  const card = createQuizCard(quizzes[0]);
  
  // 3. 화면에 표시
  container.appendChild(card);
}
```

**pages 폴더 규칙**:
- 파일 이름은 **소문자**로 시작 (예: `home.js`, `quiz.js`)
- 다른 폴더의 코드를 `import`해서 **조립**합니다
- "이 페이지에서는 뭐가 보여야 하지?" 에 대한 답을 적습니다

---

### `assets/` - 정적 파일

이미지, 폰트, 아이콘 같은 파일을 저장하는 곳입니다.

```
assets/
├── images/
│   ├── logo.png
│   └── quiz-bg.jpg
└── icons/
    ├── correct.svg
    └── wrong.svg
```

> **참고**: JavaScript 파일에서 이미지를 불러올 때는 이렇게 합니다:
> ```js
> import logoUrl from '../assets/images/logo.png';
> img.src = logoUrl;
> ```

---

## 4. 실전 예제: 퀴즈 앱으로 배우기

우리 NAILED IT 프로젝트로 파일을 나누는 과정을 따라가 봅시다.

### Before: main.js 하나에 다 때려넣은 상태 (나쁜 예)

```js
// js/main.js - 😱 이러지 마세요!
import '../css/style.css';

// 데이터도 여기에...
const quizzes = [
  { question: 'HTML에서 가장 큰 제목 태그는?', choices: ['h6', 'h1', 'header', 'title'], answer: 1 },
  { question: '이미지를 삽입하는 태그는?', choices: ['picture', 'img', 'image', 'photo'], answer: 1 },
];

// 배열 섞는 함수도 여기에...
function shuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 점수 저장도 여기에...
function saveScore(score) {
  localStorage.setItem('score', JSON.stringify(score));
}

// UI 만드는 것도 여기에...
function createQuizCard(quiz) {
  const card = document.createElement('div');
  card.className = 'bg-white rounded-lg shadow-md p-6';
  // ... 50줄 더 ...
  return card;
}

// 페이지 초기화도 여기에...
function init() {
  const shuffled = shuffle(quizzes);
  const card = createQuizCard(shuffled[0]);
  document.body.appendChild(card);
}

init();
```

**문제점**:
- 파일이 계속 길어집니다 (100줄 → 500줄 → 1000줄...)
- 퀴즈 데이터를 수정하려면 함수들 사이를 헤집어야 합니다
- 팀원이 동시에 같은 파일을 수정하면 충돌이 납니다

---

### After: 역할별로 나눈 상태 (좋은 예)

**Step 1** - 데이터를 분리합니다:

```js
// js/data/htmlQuiz.js
export const htmlQuizzes = [
  { id: 1, question: 'HTML에서 가장 큰 제목 태그는?', choices: ['h6', 'h1', 'header', 'title'], answer: 1 },
  { id: 2, question: '이미지를 삽입하는 태그는?', choices: ['picture', 'img', 'image', 'photo'], answer: 1 },
];
```

**Step 2** - 도우미 함수를 분리합니다:

```js
// js/utils/shuffle.js
export function shuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```

```js
// js/utils/storage.js
export function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadData(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}
```

**Step 3** - UI 컴포넌트를 분리합니다:

```js
// js/components/QuizCard.js
export function createQuizCard(quiz) {
  const card = document.createElement('div');
  card.className = 'bg-white rounded-lg shadow-md p-6';
  // ... 카드 UI 만드는 코드 ...
  return card;
}
```

**Step 4** - 페이지에서 조립합니다:

```js
// js/pages/quiz.js
import { htmlQuizzes } from '../data/htmlQuiz.js';
import { createQuizCard } from '../components/QuizCard.js';
import { shuffle } from '../utils/shuffle.js';

export function initQuizPage() {
  const quizzes = shuffle(htmlQuizzes);
  const card = createQuizCard(quizzes[0]);
  document.querySelector('#app').appendChild(card);
}
```

**Step 5** - main.js는 시작만 합니다:

```js
// js/main.js
import '../css/style.css';
import { initQuizPage } from './pages/quiz.js';

initQuizPage();
```

> **결과**: 각 파일이 20~50줄 정도로 짧고, 파일 이름만 봐도 뭘 하는 코드인지 알 수 있습니다!

---

## 5. import/export 사용법

파일을 나누면 파일 사이에 코드를 주고받아야 합니다. 이때 `import`와 `export`를 사용합니다.

### 기본 개념

```
내보내기(export)             가져오기(import)
   보내는 쪽                    받는 쪽

 ┌──────────┐              ┌──────────┐
 │ shuffle.js│  ──────────→ │  quiz.js  │
 │           │   shuffle    │           │
 │ export    │   함수를     │ import    │
 │ function  │   보냅니다   │ {shuffle} │
 │ shuffle() │              │ from ...  │
 └──────────┘              └──────────┘
```

### Named Export (이름 붙여 내보내기) - 가장 많이 쓰는 방법

```js
// ✅ 내보내는 파일: js/utils/shuffle.js
export function shuffle(array) {
  // ...
}

export function getRandomItem(array) {
  // ...
}
```

```js
// ✅ 가져오는 파일: js/pages/quiz.js

// 하나만 가져오기
import { shuffle } from '../utils/shuffle.js';

// 여러 개 가져오기
import { shuffle, getRandomItem } from '../utils/shuffle.js';
```

**핵심**: 내보낸 이름 그대로 `{ }` 안에 써야 합니다.

### Default Export (기본 내보내기) - 파일 하나에 하나만

```js
// ✅ 내보내는 파일: js/data/htmlQuiz.js
const htmlQuizzes = [
  // ...
];

export default htmlQuizzes;
```

```js
// ✅ 가져오는 파일: js/pages/quiz.js
import htmlQuizzes from '../data/htmlQuiz.js';  // { } 없이!
```

**핵심**: `default`로 내보내면 가져올 때 `{ }` 없이 쓰고, 이름을 바꿀 수도 있습니다.

### 어떤 걸 써야 할까?

| 상황 | 추천 방식 |
|------|----------|
| 한 파일에서 여러 함수를 내보낼 때 | Named Export |
| 한 파일에서 하나만 내보낼 때 | 둘 다 OK (Named Export 추천) |
| 데이터 배열/객체를 내보낼 때 | 둘 다 OK |

> **초보자 팁**: 헷갈리면 **Named Export만 쓰세요**. 일관성이 있어서 실수가 적습니다.

### 경로 작성법

```js
// 현재 파일: js/pages/quiz.js

import { shuffle } from '../utils/shuffle.js';
//                      ^^
//                      ..은 "한 단계 위 폴더"라는 뜻

// 경로 따라가기:
// js/pages/quiz.js → (.. = js/) → js/utils/shuffle.js
```

```
js/
├── pages/
│   └── quiz.js      ← 현재 파일 위치
├── utils/
│   └── shuffle.js   ← 여기를 가져오고 싶다!
├── components/
│   └── QuizCard.js
└── data/
    └── htmlQuiz.js

quiz.js에서 각 파일로 가는 경로:
  shuffle.js  → '../utils/shuffle.js'     (한 단계 위 → utils 폴더)
  QuizCard.js → '../components/QuizCard.js' (한 단계 위 → components 폴더)
  htmlQuiz.js → '../data/htmlQuiz.js'      (한 단계 위 → data 폴더)
```

---

## 6. 파일을 나누는 기준

"이 코드, 새 파일로 빼야 하나?" 고민될 때 아래 질문을 해보세요:

### 체크리스트

```
□ 이 코드가 50줄 이상인가?
  → 분리를 고려하세요

□ 이 함수를 다른 곳에서도 쓸 수 있는가?
  → utils/에 분리하세요

□ 이 데이터를 수정할 일이 자주 있는가?
  → data/에 분리하세요

□ 이 코드가 화면에 무언가를 그리는가?
  → components/에 분리하세요

□ 이 코드가 페이지 전체를 세팅하는가?
  → pages/에 분리하세요
```

### 이름 짓기 규칙

| 폴더 | 파일 이름 규칙 | 예시 |
|------|--------------|------|
| `components/` | **대문자**로 시작 (PascalCase) | `QuizCard.js`, `Timer.js` |
| `data/` | **소문자**로 시작 (camelCase) | `htmlQuiz.js`, `cssQuiz.js` |
| `utils/` | **소문자**로 시작 (camelCase) | `shuffle.js`, `storage.js` |
| `pages/` | **소문자**로 시작 (camelCase) | `home.js`, `quiz.js` |

> **왜 components만 대문자?** UI 컴포넌트는 "화면에 보이는 독립적인 조각"이라는 특별한 의미가 있습니다. 대문자로 시작하면 "이건 UI 조각이구나!" 하고 바로 알 수 있어요. 이것은 React 같은 프레임워크에서도 사용하는 규칙이라 미리 익혀두면 좋습니다.

---

## 7. 자주 하는 실수와 해결법

### 실수 1: 순환 참조 (파일끼리 서로 가져오기)

```js
// ❌ a.js가 b.js를 가져오고, b.js가 a.js를 가져오면 오류!
// a.js
import { something } from './b.js';

// b.js
import { other } from './a.js';  // 💥 순환 참조!
```

**해결법**: 화살표를 그려보세요. A → B → A 처럼 원이 그려지면 안 됩니다.

```
✅ 올바른 방향 (한 방향으로만 흐른다):

  main.js → pages/quiz.js → components/QuizCard.js
                           → data/htmlQuiz.js
                           → utils/shuffle.js
```

### 실수 2: import 경로 오타

```js
// ❌ 이런 오타를 조심하세요
import { shuffle } from './util/shuffle.js';    // utils인데 util이라 씀
import { shuffle } from '../utils/Shuffle.js';  // 대소문자 틀림
import { shuffle } from '../utils/shuffle';     // .js 확장자 빠짐 (Vite에서는 보통 OK)
```

**해결법**: 에러가 나면 먼저 **경로와 파일 이름**을 확인하세요.

### 실수 3: export를 안 하고 import하기

```js
// ❌ quiz.js에서 export를 안 했어요
const quizzes = [...];
// export가 없다!

// ❌ 다른 파일에서 가져오려고 하면 undefined
import { quizzes } from './data/quiz.js';  // undefined!
```

**해결법**: 내보내려는 변수/함수 앞에 반드시 `export`를 붙이세요.

### 실수 4: Named vs Default import 혼동

```js
// 내보내는 파일
export function shuffle(array) { ... }           // Named export

// ❌ 틀린 가져오기
import shuffle from '../utils/shuffle.js';        // default로 가져옴 → undefined

// ✅ 맞는 가져오기
import { shuffle } from '../utils/shuffle.js';    // named로 가져옴 → OK!
```

---

## 8. 단계별 실습

지금 바로 따라해볼 수 있는 실습입니다.

### 실습 1: 첫 번째 파일 분리하기

**목표**: 퀴즈 데이터를 별도 파일로 분리합니다.

```bash
# 1. data 폴더 만들기
mkdir -p js/data
```

```js
// 2. js/data/htmlQuiz.js 파일 만들기
export const htmlQuizzes = [
  {
    id: 1,
    question: 'HTML의 약자는?',
    choices: [
      'Hyper Text Markup Language',
      'High Tech Modern Language',
      'Hyper Transfer Markup Language',
      'Home Tool Markup Language',
    ],
    answer: 0,
  },
];
```

```js
// 3. js/main.js에서 가져오기
import '../css/style.css';
import { htmlQuizzes } from './data/htmlQuiz.js';

console.log(htmlQuizzes); // 브라우저 콘솔에서 확인!
```

```bash
# 4. 개발 서버에서 확인하기
npm run dev
# 브라우저 개발자 도구(F12) → Console 탭에서 데이터가 보이면 성공!
```

### 실습 2: 유틸 함수 분리하기

**목표**: shuffle 함수를 만들어 utils 폴더에 넣습니다.

```bash
# 1. utils 폴더 만들기
mkdir -p js/utils
```

```js
// 2. js/utils/shuffle.js 파일 만들기
export function shuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```

```js
// 3. js/main.js에서 데이터와 함수를 함께 사용하기
import '../css/style.css';
import { htmlQuizzes } from './data/htmlQuiz.js';
import { shuffle } from './utils/shuffle.js';

const shuffled = shuffle(htmlQuizzes);
console.log('원본:', htmlQuizzes);
console.log('섞은 결과:', shuffled);
```

### 실습 3: UI 컴포넌트 분리하기

**목표**: 퀴즈 카드를 화면에 보여주는 컴포넌트를 만듭니다.

```bash
# 1. components 폴더 만들기
mkdir -p js/components
```

```js
// 2. js/components/QuizCard.js 파일 만들기
export function createQuizCard(quiz) {
  const card = document.createElement('div');
  card.className = 'max-w-lg mx-auto mt-10 bg-white rounded-lg shadow-md p-6';

  const question = document.createElement('h2');
  question.className = 'text-xl font-bold mb-4';
  question.textContent = quiz.question;
  card.appendChild(question);

  quiz.choices.forEach((choice, index) => {
    const button = document.createElement('button');
    button.className = 'block w-full text-left p-3 mb-2 rounded border hover:bg-blue-50';
    button.textContent = `${index + 1}. ${choice}`;
    card.appendChild(button);
  });

  return card;
}
```

```js
// 3. js/main.js에서 전부 조합하기
import '../css/style.css';
import { htmlQuizzes } from './data/htmlQuiz.js';
import { createQuizCard } from './components/QuizCard.js';
import { shuffle } from './utils/shuffle.js';

const quizzes = shuffle(htmlQuizzes);
const card = createQuizCard(quizzes[0]);
document.body.appendChild(card);
```

---

## 정리: 핵심만 기억하세요

```
📁 js/
├── main.js          → 시작점. 다른 파일을 연결만 한다
├── components/      → 화면에 보이는 UI 조각
├── data/            → 데이터 (퀴즈 문제 등)
├── utils/           → 재사용하는 도우미 함수
└── pages/           → 페이지 단위로 조립하는 코드
```

| 원칙 | 설명 |
|------|------|
| **한 파일, 한 역할** | 하나의 파일은 하나의 일만 합니다 |
| **이름만 봐도 알게** | 파일 이름으로 내용을 짐작할 수 있어야 합니다 |
| **한 방향 흐름** | main → pages → components/data/utils 방향으로 |
| **처음부터 완벽할 필요 없어요** | 먼저 동작하게 만들고, 나중에 분리해도 됩니다 |

> **가장 중요한 것**: 처음부터 완벽한 구조를 만들려고 하지 마세요. 코드가 길어지고 불편해질 때 파일을 나누면 됩니다. 파일 하나가 50줄이 넘기 시작하면 "이걸 나눌 수 있을까?" 하고 생각해보세요.
