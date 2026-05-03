# 🛠 NAILED-IT 리팩토링 가이드

> [`code-review.md`](./code-review.md) 에서 지적한 문제들을 **실제로 어떻게 고치는지** 단계별로 알려주는 문서예요.
> 이 문서는 초보자를 기준으로 작성했습니다. 이미 아는 부분은 건너뛰어도 됩니다.

## 🎯 이 문서의 사용법

1. 위에서부터 순서대로 따라가세요. 뒤쪽 단계는 앞쪽 단계가 끝나 있다고 가정해요.
2. 하나의 단계가 끝날 때마다 **작은 단위로 커밋**하세요. `git commit -m "refactor: 헤더 공통 컴포넌트로 추출"` 같은 식으로요. 문제가 생기면 한 커밋만 되돌리면 돼요.
3. CSS는 **어쩔 수 없을 때만 최소한**으로 사용합니다. 원칙적으로 **Tailwind 클래스로 해결**하는 것이 팀 규칙입니다.
4. 중간중간 `npm run dev` 를 돌려서 화면이 깨지지 않았는지 확인하세요.

---

## 📂 목표 폴더 구조

리팩토링이 끝나면 이런 모양이 될 거예요. 지금 당장 이 구조를 맞추지 않아도 되지만, **우리가 어디로 가고 있는지**를 알고 시작하면 훨씬 덜 헷갈립니다.

```
nailed-it/
├── index.html
├── src/
│   ├── pages/
│   │   ├── login.html
│   │   ├── signup.html
│   │   ├── admin-login.html
│   │   └── categories.html
│   ├── js/
│   │   ├── components/       ← 반복되는 HTML 조각을 만드는 함수들
│   │   │   ├── header.js
│   │   │   ├── icon.js
│   │   │   └── category-card.js
│   │   ├── pages/            ← 페이지별 로직 (폼 submit, 클릭 이벤트 등)
│   │   │   ├── login.js
│   │   │   ├── signup.js
│   │   │   ├── admin-login.js
│   │   │   └── categories.js
│   │   └── utils/            ← 공통 유틸 함수
│   │       └── validation.js
│   ├── main.js               ← index.html 전용
│   └── style.css             ← @import "tailwindcss"; 한 줄만
├── docs/
└── package.json
```

- `components/` 는 "**같은 UI 조각이 여러 페이지에 나올 때**" 쓰는 폴더예요. HTML을 함수로 만들어서 재사용합니다.
- `pages/` 는 "**이 페이지에서만 쓰는 로직**" 을 둡니다. 예: 로그인 폼 submit 처리.
- `utils/` 는 "**어느 페이지에서나 쓸 수 있는 작은 도구 함수**" 를 둡니다. 예: 이메일 형식 검증.

각 폴더는 **관련 있는 것들만 모여 있으니까 응집도가 높아지고**, 페이지는 자기가 쓸 것만 import 해서 쓰니까 **결합도가 낮아져요**.

---

## 1️⃣ [우선순위 1] 먼저 할 일: 접근성/속성 고치기 (파일 수정만, 구조 변경 없음)

이건 구조를 크게 바꾸지 않고도 **바로** 할 수 있는 수정이에요. 사용자에게 바로 효과가 오는 것부터 정리합시다.

### 1-1. `<label>` 에 `for` 속성 붙이기

**Before** (`login.html:33-38`):
```html
<div class="space-y-2">
  <label class="block text-sm">이메일</label>
  <input type="email" id="email"
    class="w-full px-4 py-3 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/20"
    placeholder="이메일을 입력하세요" />
</div>
```

**After**:
```html
<div class="space-y-2">
  <label for="email" class="block text-sm">이메일</label>
  <input type="email" id="email" name="email" required autocomplete="email"
    class="w-full px-4 py-3 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/20"
    placeholder="이메일을 입력하세요" />
</div>
```

**바뀐 점**
- `<label for="email">` → 라벨과 입력칸이 연결돼요. 스크린 리더가 "이메일, 편집 가능" 이라고 읽어줘요.
- `name="email"` → 폼 전송 시 서버가 `email` 이라는 이름으로 값을 받을 수 있어요.
- `required` → 빈 값으로 제출 버튼을 누르면 브라우저가 자동으로 막아줍니다. **JS 없이 공짜로 얻는 검증**이에요.
- `autocomplete="email"` → 브라우저가 저장된 이메일을 자동 제안해줍니다.

비밀번호 칸도 똑같이 해주세요. 비밀번호만 `autocomplete` 값이 다릅니다.

- **로그인 화면**: `autocomplete="current-password"`
- **회원가입 화면**: `autocomplete="new-password"`

> 💡 **왜 둘을 나누나요?** 브라우저는 "기존 비밀번호 입력"과 "새 비밀번호 생성"을 구분해야 합니다. `new-password` 면 브라우저가 "강력한 비밀번호 추천" 기능을 띄워주고, `current-password` 면 저장된 비밀번호를 자동 입력해줘요.

### 1-2. 아이콘 전용 버튼에 `aria-label` 붙이기

**Before** (`categories.html:45-52`):
```html
<button id="logoutBtn" class="p-2 hover:bg-black/5 rounded-lg transition-colors">
  <svg ...>...</svg>
</button>
```

**After**:
```html
<button id="logoutBtn" type="button" aria-label="로그아웃"
        class="p-2 hover:bg-black/5 rounded-lg transition-colors">
  <svg aria-hidden="true" ...>...</svg>
</button>
```

**포인트**
- `aria-label="로그아웃"` → 스크린 리더가 "로그아웃, 버튼" 이라고 읽어줘요.
- `aria-hidden="true"` → SVG는 **장식**이라는 걸 보조 기술에게 알려주는 거예요. 아이콘이 "그림" 역할만 하고 의미는 `aria-label` 이 담당하므로, SVG는 무시해도 된다고 말해 주는 거예요.
- `type="button"` → form 안에 있을 때 **실수로 폼이 submit 되는 걸 막아줘요**. `<button>` 의 기본 타입은 `submit` 이기 때문입니다.

뒤로가기 화살표 `<a>` 들에도 똑같이 적용하세요. 예: `aria-label="이전 페이지로"`.

### 1-3. 인라인 `onclick` 제거하기

**Before** (`login.html:67-70`):
```html
<button type="button" onclick="alert('비밀번호 찾기 기능은 추후 구현 예정입니다.')"
        class="text-black/60 hover:text-black transition-colors">
  비밀번호 찾기
</button>
```

**After (HTML)**:
```html
<button type="button" id="forgotPasswordBtn"
        class="text-black/60 hover:text-black transition-colors">
  비밀번호 찾기
</button>
```

**After (JS: `src/js/pages/login.js`)**:
```js
const forgotBtn = document.getElementById("forgotPasswordBtn");
if (forgotBtn) {
  forgotBtn.addEventListener("click", () => {
    alert("비밀번호 찾기 기능은 추후 구현 예정입니다.");
  });
}
```

**왜 이렇게 바꾸나요?**
- HTML은 "**구조**"만 담당합니다. 버튼이 어떻게 생겼는지, 어디 있는지.
- JS는 "**동작**"을 담당합니다. 클릭했을 때 뭐가 일어나는지.
- 이 둘을 분리하면 → HTML은 디자이너가 건드리기 쉽고, JS는 개발자가 건드리기 쉬운 상태가 돼요. **결합도가 낮아집니다.**

### 1-4. `<h1>` 하나만 두기

`index.html:16` 의 헤더 로고는 `<h1>` 이 아니라 `<a>` 나 `<span>` 으로 바꾸세요.

**Before** (`index.html:14-18`):
```html
<header class="px-6 py-4 border-b border-black/10">
  <div class="max-w-md mx-auto flex justify-between items-center">
    <h1 class="font-bold">NAILED-IT</h1>
  </div>
</header>
```

**After**:
```html
<header class="px-6 py-4 border-b border-black/10">
  <div class="max-w-md mx-auto flex justify-between items-center">
    <a href="/" class="font-bold">NAILED-IT</a>
  </div>
</header>
```

`<h1>` 은 본문의 **진짜 타이틀** 하나에만 써 주세요. 브랜드 로고는 링크/스팬이 더 자연스러워요.

---

## 2️⃣ [우선순위 2] 페이지별 JS 연결 구조 만들기

이제 `src/main.js` 가 하는 일이 너무 적으니까, **페이지별로 JS 파일을 분리**합시다.

### 2-1. 페이지별 JS 파일 만들기

```
src/js/pages/
├── login.js
├── signup.js
├── admin-login.js
└── categories.js
```

각 파일의 시작 모양은 이렇게 해 주세요.

**`src/js/pages/login.js`**
```js
import "../../style.css";

function init() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", handleSubmit);

  const forgotBtn = document.getElementById("forgotPasswordBtn");
  forgotBtn?.addEventListener("click", () => {
    alert("비밀번호 찾기 기능은 추후 구현 예정입니다.");
  });
}

function handleSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const email = formData.get("email");
  const password = formData.get("password");

  console.log("로그인 시도:", { email });
  // TODO: 실제 API 호출은 나중에 src/js/api/auth.js 에서 import 해서 연결
}

init();
```

**왜 이렇게 하나요?**
- `init()` 함수 하나만 보면 이 페이지가 **무슨 일을 하는지 한눈에** 보여요. → 응집도 ↑
- `handleSubmit` 같은 개별 함수는 **한 가지 일만** 합니다. → 응집도 ↑
- `form?.addEventListener(...)` 의 `?.` 는 "form 이 없으면 아무것도 안 함" 이라는 뜻이에요. 다른 페이지에서 이 스크립트가 잘못 로드돼도 에러가 안 나요.

### 2-2. HTML에서 올바른 JS 파일 불러오기

**Before** (모든 HTML):
```html
<script type="module" src="/src/main.js"></script>
```

**After** (`login.html`):
```html
<script type="module" src="/src/js/pages/login.js"></script>
```

각 HTML은 **자기 페이지용 JS** 만 불러옵니다. 이렇게 하면:
- 로그인 페이지에서 카테고리 코드가 실행되는 **이상한 상황**이 안 생겨요.
- 나중에 번들 크기가 커지면 Vite가 자동으로 페이지별로 쪼개서 최적화해 줍니다.

> 💡 **`main.js` 는 어떡하죠?** `index.html` 전용으로 남겨두거나, `src/js/pages/index.js` 로 옮기고 `main.js` 는 지워도 돼요. 선택의 문제입니다.

---

## 3️⃣ [우선순위 3] 반복되는 UI를 "컴포넌트 함수" 로 추출하기

이게 리팩토링의 **핵심**이에요. 지금 가장 문제인 부분을 고치는 단계입니다.

React 같은 라이브러리를 쓰지 않지만, **순수 JavaScript 함수**로도 충분히 컴포넌트를 만들 수 있어요. 핵심은 이거예요:

> "반복되는 HTML 조각을 **문자열을 돌려주는 함수**로 만든다."

### 3-1. 아이콘 컴포넌트 만들기

**`src/js/components/icon.js`**
```js
const ICONS = {
  "arrow-left": `
    <path d="m12 19-7-7 7-7"></path>
    <path d="M19 12H5"></path>
  `,
  home: `
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  `,
  history: `
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
    <path d="M3 3v5h5"></path>
    <path d="M12 7v5l4 2"></path>
  `,
  logout: `
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  `,
  html: `
    <polyline points="16 18 22 12 16 6"></polyline>
    <polyline points="8 6 2 12 8 18"></polyline>
    <line x1="12" y1="2" x2="12" y2="22"></line>
  `,
  css: `
    <path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"></path>
    <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
    <path d="m5 12-3 3 3 3"></path>
    <path d="m9 18 3-3-3-3"></path>
  `,
  javascript: `
    <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"></path>
    <path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"></path>
  `,
};

export function icon(name, size = 24) {
  const paths = ICONS[name];
  if (!paths) {
    console.warn(`[icon] 존재하지 않는 아이콘: ${name}`);
    return "";
  }
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"
         viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
         aria-hidden="true">
      ${paths}
    </svg>
  `;
}
```

이렇게 하면 앞으로 아이콘을 쓰고 싶을 때는 `icon("home")` 한 줄만 쓰면 돼요. SVG 전체를 복붙할 필요가 없습니다.

### 3-2. 헤더 컴포넌트 만들기

**`src/js/components/header.js`**
```js
import { icon } from "./icon.js";

/**
 * 공통 페이지 헤더를 만드는 함수
 * @param {Object} options
 * @param {string} options.title  가운데에 표시할 제목
 * @param {string} [options.backHref="index.html"] 뒤로가기 링크 주소
 * @param {string} [options.actionsHtml=""] 오른쪽에 넣을 버튼 HTML (선택)
 */
export function pageHeader({ title, backHref = "index.html", actionsHtml = "" }) {
  return `
    <header class="px-6 py-4 border-b border-black/10">
      <div class="max-w-md mx-auto flex items-center justify-between">
        <div class="flex items-center gap-4">
          <a href="${backHref}" aria-label="이전 페이지로"
             class="p-2 -ml-2 hover:bg-black/5 rounded-lg transition-colors">
            ${icon("arrow-left", 20)}
          </a>
          <h1 class="font-medium">${title}</h1>
        </div>
        ${actionsHtml ? `<div class="flex items-center gap-2">${actionsHtml}</div>` : ""}
      </div>
    </header>
  `;
}
```

### 3-3. HTML 파일에서 헤더를 "주입" 하기

HTML 파일에는 **빈 자리**만 남겨 둡니다.

**`login.html`** (Before에서 `<header>` 블록을 지우고 대신):
```html
<body>
  <div class="min-h-screen bg-white">
    <div id="headerSlot"></div>

    <main class="px-6 py-8">
      ...
    </main>
  </div>
  <script type="module" src="/src/js/pages/login.js"></script>
</body>
```

**`src/js/pages/login.js`**:
```js
import "../../style.css";
import { pageHeader } from "../components/header.js";

function mountHeader() {
  const slot = document.getElementById("headerSlot");
  if (slot) {
    slot.outerHTML = pageHeader({ title: "로그인" });
  }
}

function init() {
  mountHeader();
  // ... 폼 이벤트 연결
}

init();
```

**이게 왜 좋아요?**
- 이제 헤더 디자인을 바꾸고 싶으면 **`header.js` 한 파일만** 고치면 돼요. 4개의 HTML을 일일이 고칠 필요가 없습니다.
- 각 HTML은 자기 페이지의 **고유한 내용**만 담고 있어서, 읽기 쉬워집니다.

> ⚠️ **주의: XSS 문제**
> `innerHTML`/`outerHTML` 에 **사용자 입력값**을 그대로 넣으면 보안 사고(XSS)가 납니다. 지금처럼 "고정된 문자열"을 넣는 건 안전하지만, 나중에 "사용자 닉네임을 헤더에 표시" 같은 기능을 추가할 땐 `element.textContent = nickname` 을 쓰세요. `textContent` 는 HTML 태그로 해석되지 않아서 안전합니다.

### 3-4. 카테고리 카드 컴포넌트 만들기

**`src/js/components/category-card.js`**
```js
import { icon } from "./icon.js";

/**
 * @param {Object} category
 * @param {string} category.id     "html" | "css" | "javascript"
 * @param {string} category.title  화면에 보일 제목
 * @param {string} category.description 설명
 * @param {number} category.count  문제 수
 */
export function categoryCard(category) {
  return `
    <a href="quiz.html?category=${category.id}"
       class="block w-full p-6 border border-black/10 rounded-lg hover:bg-black/5 transition-colors text-left group">
      <div class="flex items-start gap-4">
        <div class="p-3 border border-black/10 rounded-lg group-hover:bg-white transition-colors">
          ${icon(category.id)}
        </div>
        <div class="flex-1 space-y-1">
          <div class="flex items-center justify-between">
            <h2 class="font-medium">${category.title}</h2>
            <span class="text-sm text-black/40">${category.count}문제</span>
          </div>
          <p class="text-sm text-black/60">${category.description}</p>
        </div>
      </div>
    </a>
  `;
}
```

**`src/js/pages/categories.js`**
```js
import "../../style.css";
import { pageHeader } from "../components/header.js";
import { icon } from "../components/icon.js";
import { categoryCard } from "../components/category-card.js";

const CATEGORIES = [
  { id: "html",       title: "HTML",       description: "HTML 기초를 학습합니다.",       count: 10 },
  { id: "css",        title: "CSS",        description: "CSS 기초를 학습합니다.",        count: 10 },
  { id: "javascript", title: "JavaScript", description: "JavaScript 기초를 학습합니다.", count: 10 },
];

function mountHeader() {
  const actionsHtml = `
    <a href="index.html" aria-label="홈으로" class="p-2 hover:bg-black/5 rounded-lg transition-colors">
      ${icon("home", 20)}
    </a>
    <a href="history.html" aria-label="풀이 기록" class="p-2 hover:bg-black/5 rounded-lg transition-colors">
      ${icon("history", 20)}
    </a>
    <button id="logoutBtn" type="button" aria-label="로그아웃" class="p-2 hover:bg-black/5 rounded-lg transition-colors">
      ${icon("logout", 20)}
    </button>
  `;
  document.getElementById("headerSlot").outerHTML =
    pageHeader({ title: "카테고리 선택", actionsHtml });
}

function mountCategories() {
  const list = document.getElementById("categoryList");
  if (!list) return;
  list.innerHTML = CATEGORIES.map(categoryCard).join("");
}

function bindEvents() {
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    // TODO: 로그아웃 처리
    location.href = "login.html";
  });
}

function init() {
  mountHeader();
  mountCategories();
  bindEvents();
}

init();
```

**여기서 보여드린 핵심 아이디어**
1. **데이터(`CATEGORIES`)와 화면(`categoryCard`)을 분리**했어요. 카테고리를 추가하려면 배열에 객체 하나만 추가하면 됩니다. HTML은 한 줄도 고칠 필요가 없어요.
2. `mountHeader`, `mountCategories`, `bindEvents` 처럼 **함수 하나가 한 가지 일**만 합니다. 이게 바로 "응집도 높은 함수" 예요.
3. 카테고리 버튼을 `<button>` → `<a href="quiz.html?category=html">` 로 바꿔서, **클릭하면 실제로 이동**하도록 만들었어요. 쿼리스트링(`?category=html`)으로 어떤 카테고리인지 다음 페이지에 전달됩니다.

**`categories.html`** 은 이제 이 모양이 됩니다.
```html
<body>
  <div class="min-h-screen bg-white">
    <div id="headerSlot"></div>

    <main class="px-6 py-8">
      <div class="max-w-md mx-auto space-y-6">
        <div class="text-center">
          <p class="text-black/60">학습할 카테고리를 선택해주세요</p>
        </div>
        <div id="errorMessage" class="text-sm text-red-500 text-center p-4 bg-red-50 rounded-lg hidden"></div>
        <div id="categoryList" class="space-y-4"></div>
        <div class="pt-4 text-center text-sm text-black/40">
          각 카테고리당 10문제가 출제됩니다
        </div>
      </div>
    </main>
  </div>
  <script type="module" src="/src/js/pages/categories.js"></script>
</body>
```

원래 159줄이던 파일이 **25줄 정도**로 줄어요. 같은 기능인데 읽기가 훨씬 쉬워졌죠.

---

## 4️⃣ [우선순위 4] 공통 유틸 함수 만들기

로그인과 회원가입 두 곳에서 이메일/비밀번호 검증이 필요합니다. 이런 건 `utils/validation.js` 한 파일에 모아요.

**`src/js/utils/validation.js`**
```js
export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isStrongPassword(value) {
  if (value.length < 8) return false;
  const hasLetter = /[A-Za-z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasSymbol = /[^A-Za-z0-9]/.test(value);
  return hasLetter && hasNumber && hasSymbol;
}

export function isValidNickname(value) {
  if (value.length < 1 || value.length > 10) return false;
  return /^[A-Za-z0-9가-힣\-_.]+$/.test(value);
}
```

**사용 예 (`src/js/pages/signup.js`)**:
```js
import { isValidEmail, isStrongPassword, isValidNickname } from "../utils/validation.js";

function handleSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const nickname = formData.get("nickname");
  const email = formData.get("email");
  const password = formData.get("password");

  if (!isValidNickname(nickname)) {
    return showError("닉네임은 1~10자이며 특수문자는 - _ . 만 사용할 수 있어요.");
  }
  if (!isValidEmail(email)) {
    return showError("올바른 이메일 형식이 아니에요.");
  }
  if (!isStrongPassword(password)) {
    return showError("비밀번호는 8자 이상, 영문·숫자·특수문자를 각 1개 이상 포함해야 해요.");
  }

  // TODO: API 호출
}

function showError(message) {
  const box = document.getElementById("errorMessage");
  box.textContent = message;
  box.classList.remove("hidden");
}
```

**여기서 중요한 원칙**
- 검증 함수는 **DOM에 손대지 않아요**. 순수하게 "값을 받아서 true/false 를 돌려주는" 함수예요. 이걸 **순수 함수** 라고 부릅니다.
- 에러 메시지를 화면에 띄우는 건 `showError` 가 담당합니다. **한 함수가 한 가지 일**만 해요.
- 두 가지 역할이 분리되어 있어서, 나중에 `isValidEmail` 함수를 테스트하기도 쉽고, 다른 페이지에서 재사용하기도 쉬워요. 이게 바로 **응집도 높고, 결합도 낮은 함수** 예요.

---

## 5️⃣ [우선순위 5] 파일 이동 & README 업데이트

마지막으로 README에 적힌 대로 HTML 파일을 `src/pages/` 로 이동시킵니다.

```bash
mkdir -p src/pages
git mv login.html src/pages/login.html
git mv signup.html src/pages/signup.html
git mv admin-login.html src/pages/admin-login.html
git mv categories.html src/pages/categories.html
```

> ⚠️ **주의**: `index.html` 은 **프로젝트 루트에 그대로** 두세요. Vite가 진입점으로 `index.html` 을 찾기 때문입니다.

파일을 옮기고 나면 **링크(`href`)도 함께 바꿔야 해요**. 예를 들어 `index.html` 에서:

```html
<!-- Before -->
<a href="login.html">퀴즈 시작하기</a>
<!-- After -->
<a href="src/pages/login.html">퀴즈 시작하기</a>
```

페이지끼리의 상대 경로도 다시 확인하세요. 예: `src/pages/login.html` 에서 `index.html` 로 돌아가려면 `../../index.html` 입니다.

### Vite 다중 진입점 설정 (선택)

`src/pages/` 아래의 HTML들을 Vite가 빌드 타겟으로 인식하게 하려면 `vite.config.js` 에 진입점을 명시하면 좋아요.

```js
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main:       resolve(__dirname, "index.html"),
        login:      resolve(__dirname, "src/pages/login.html"),
        signup:     resolve(__dirname, "src/pages/signup.html"),
        adminLogin: resolve(__dirname, "src/pages/admin-login.html"),
        categories: resolve(__dirname, "src/pages/categories.html"),
      },
    },
  },
});
```

### README 업데이트

README의 "Project Structure" 섹션을 **현재 실제 폴더와 일치**하도록 고쳐 주세요. 실제와 문서가 다르면 새로 합류한 사람이 혼란스러워합니다.

---

## 🎯 Tailwind 사용 원칙 (팀 규칙)

팀 규칙은 "**CSS 파일은 최소한, 스타일은 Tailwind 로**" 입니다. 이 규칙을 지키려면 다음을 주의하세요.

### ✅ 권장

- 모든 스타일은 HTML 의 `class` 속성에 Tailwind 유틸리티로 작성합니다.
- 긴 클래스 리스트가 여러 곳에서 반복되면, **CSS 파일을 만드는 게 아니라** 컴포넌트 함수(`src/js/components/*.js`) 로 추출합니다. → "스타일 재사용" 이 아니라 "**컴포넌트 재사용**" 으로 접근해요.
- 변수가 필요하면 Tailwind config 의 theme 확장을 사용합니다.

### ❌ 피하세요

- `src/style.css` 에 새 CSS 규칙을 추가하는 것. 정말 Tailwind 로 표현이 어려운 경우에만 최소한으로.
- HTML에 `style="..."` 인라인 스타일 작성.
- 새로운 `.css` 파일을 만드는 것.

### 어쩔 수 없이 커스텀 CSS 가 필요한 순간은?

정말 드물지만 있어요. 예를 들어:
- 써드파티 라이브러리의 내부 클래스에만 스타일을 먹여야 할 때
- CSS `@keyframes` 로 복잡한 애니메이션을 만들 때 (Tailwind `animate-*` 로 표현이 안 되는 경우)

그럴 땐 `src/style.css` 안에서 `@layer components` 안에 최소한으로 정의하세요.

```css
@import "tailwindcss";

@layer components {
  .quiz-fade-in {
    animation: fade-in 0.3s ease-out;
  }

  @keyframes fade-in {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
}
```

이렇게 `@layer components` 에 넣으면 Tailwind 가 자동으로 우선순위를 관리해줘서, 유틸리티 클래스와 충돌이 나지 않아요.

---

## 📋 단계별 체크리스트

아래 순서대로 하나씩 해보세요. 각 항목이 하나의 커밋 단위예요.

### Phase 1 — 바로 효과 있는 것부터 (1시간 안에 끝남)

- [ ] 모든 `<label>` 에 `for` 속성 추가
- [ ] 모든 `<input>` 에 `name`, `required`, 적절한 `autocomplete` 추가
- [ ] 아이콘 전용 버튼/링크에 `aria-label` 추가, SVG 에 `aria-hidden="true"` 추가
- [ ] `<button>` 기본 타입 문제 방지용 `type="button"` 명시
- [ ] `login.html` 의 `onclick` 인라인 핸들러 제거 → JS 로 이동
- [ ] `index.html` 에 `<h1>` 하나만 남기기

### Phase 2 — JS 구조 잡기 (2-3시간)

- [ ] `src/js/pages/` 폴더 생성 및 페이지별 JS 파일 뼈대 작성
- [ ] 각 HTML이 자기 전용 JS 파일을 불러오도록 `<script src>` 수정
- [ ] 로그인/회원가입/관리자 로그인 폼 submit 이벤트 연결 (지금은 `console.log` 만 찍어도 OK)

### Phase 3 — 컴포넌트 추출 (반나절)

- [ ] `src/js/components/icon.js` 만들기
- [ ] `src/js/components/header.js` 만들기
- [ ] `src/js/components/category-card.js` 만들기
- [ ] 모든 HTML 에서 헤더를 `<div id="headerSlot"></div>` 로 대체
- [ ] `categories.html` 에서 카테고리 카드 3개 → `<div id="categoryList"></div>` 로 대체
- [ ] 카테고리 클릭 시 이동할 `quiz.html` 연결 (임시 빈 페이지라도 OK)

### Phase 4 — 유틸 & 재사용 함수 (1시간)

- [ ] `src/js/utils/validation.js` 만들기
- [ ] 회원가입 폼에 검증 로직 연결
- [ ] `showError`/`hideError` 같은 공통 헬퍼 함수 정리

### Phase 5 — 폴더 정리 (30분)

- [ ] HTML 파일들을 `src/pages/` 로 이동
- [ ] 모든 `href` 경로 재확인
- [ ] `vite.config.js` 에 다중 진입점 설정
- [ ] README 의 Project Structure 업데이트

---

## 💡 자주 나올 질문

### Q. 왜 React 안 써요? 이러면 React 랑 똑같잖아요.
- 맞아요. 컴포넌트화는 프레임워크가 없어도 할 수 있는 **개념**이에요. 지금은 "바닐라 JS로 컴포넌트 개념을 몸에 익히는" 연습을 하는 거예요. 나중에 React 를 배울 때 "아, 내가 손으로 하던 일을 React 가 자동으로 해주는구나!" 라고 자연스럽게 이해하게 됩니다.

### Q. `innerHTML` / `outerHTML` 은 위험하다고 들었는데요?
- **고정된 문자열**을 넣는 건 안전합니다. **사용자 입력값**을 그대로 넣는 게 위험해요. 예:
  ```js
  // ❌ 위험: 닉네임에 <script> 가 들어오면 실행될 수 있음
  element.innerHTML = `<p>${userNickname}</p>`;

  // ✅ 안전
  const p = document.createElement("p");
  p.textContent = userNickname;
  element.appendChild(p);
  ```
- 컴포넌트 함수 안에서 "사용자 입력값"을 섞어야 한다면 `textContent` 를 쓰거나, `DOMPurify` 같은 라이브러리를 사용하세요.

### Q. 같은 CSS 클래스가 여러 컴포넌트에 반복되는 게 싫어요. CSS 파일로 빼고 싶어요.
- **빼지 마세요.** 팀 규칙은 Tailwind 우선이에요. "같은 클래스가 반복된다" 는 건 사실 "같은 컴포넌트가 여러 곳에 나타난다" 는 뜻이에요. 해결은 CSS 를 빼는 게 아니라 **컴포넌트 함수로 만드는 것**입니다. 그렇게 하면 Tailwind 클래스는 컴포넌트 함수 안에 한 번만 적히게 돼요.

### Q. 수정할 게 너무 많아 보여요. 다 해야 하나요?
- 아니에요. **Phase 1 만이라도 먼저** 하세요. Phase 1 은 구조 변경 없이도 할 수 있는 수정이라 위험하지 않고, 사용자에게 **바로 효과**가 있습니다. Phase 2 이후는 시간이 될 때 차근차근 하면 됩니다.

---

_작성일: 2026-04-14_
