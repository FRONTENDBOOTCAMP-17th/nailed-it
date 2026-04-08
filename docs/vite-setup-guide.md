# Vite + Tailwind CSS 프로젝트 설정 가이드

이 문서는 빈 프로젝트를 **Vite + Tailwind CSS** 프로젝트로 변환하면서 변경된 내용을 한 줄 한 줄 설명합니다.

---

## 변경된 파일 목록

| 파일 | 변경 내용 |
|------|----------|
| `package.json` | 새로 생성 - 프로젝트 정보와 필요한 도구 목록 |
| `vite.config.js` | 새로 생성 - Vite 설정 파일 |
| `index.html` | 수정 - HTML 기본 구조 작성 |
| `js/main.js` | 수정 - CSS 파일 연결 |
| `css/style.css` | 수정 - Tailwind CSS 불러오기 |

---

## 1. package.json

`package.json`은 프로젝트의 **신분증** 같은 파일입니다. 프로젝트 이름, 버전, 그리고 어떤 도구(패키지)를 사용하는지 적어둡니다.

```json
{
  "name": "nailed-it",
  "version": "1.0.0",
  "description": "Nail your frontend skills with quizzes.",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.2.2",
    "tailwindcss": "^4.2.2",
    "vite": "^8.0.7"
  }
}
```

### 한 줄씩 살펴보기

- **`"name": "nailed-it"`** - 프로젝트 이름입니다.
- **`"version": "1.0.0"`** - 프로젝트 버전입니다. 처음 만들었으니 1.0.0이에요.
- **`"description"`** - 프로젝트를 한 줄로 설명합니다.
- **`"type": "module"`** - JavaScript에서 `import`/`export` 문법을 사용하겠다는 뜻입니다. 이걸 안 쓰면 `require()` 같은 옛날 문법만 쓸 수 있어요.
- **`"scripts"`** - 자주 쓰는 명령어에 별명을 붙여둔 곳입니다.
  - `"dev": "vite"` → `npm run dev`를 치면 개발 서버가 켜집니다.
  - `"build": "vite build"` → `npm run build`를 치면 배포용 파일이 만들어집니다.
  - `"preview": "vite preview"` → `npm run preview`를 치면 빌드된 결과물을 미리 볼 수 있습니다.
- **`"devDependencies"`** - 개발할 때만 필요한 도구 목록입니다.
  - `vite` - 번들러(빌드 도구)입니다. 코드를 묶어서 브라우저가 이해할 수 있게 만들어줍니다.
  - `tailwindcss` - CSS를 클래스 이름만으로 빠르게 작성할 수 있게 해주는 도구입니다.
  - `@tailwindcss/vite` - Tailwind CSS를 Vite에서 사용할 수 있게 연결해주는 플러그인입니다.

---

## 2. vite.config.js

Vite가 어떻게 동작할지 설정하는 파일입니다.

```js
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss()],
});
```

### 한 줄씩 살펴보기

- **`import tailwindcss from '@tailwindcss/vite'`** - Tailwind CSS Vite 플러그인을 가져옵니다.
- **`import { defineConfig } from 'vite'`** - Vite의 설정 함수를 가져옵니다. 이 함수를 쓰면 에디터에서 자동완성이 됩니다.
- **`export default defineConfig({ ... })`** - 설정 객체를 내보냅니다. Vite가 이 파일을 읽어서 설정을 적용합니다.
- **`plugins: [tailwindcss()]`** - Vite에게 "Tailwind CSS 플러그인을 사용해줘"라고 알려줍니다. 플러그인은 배열(`[]`) 안에 넣습니다.

---

## 3. index.html

프로젝트의 **시작점(entry point)** 입니다. 브라우저가 가장 먼저 읽는 파일이에요.

```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>NAILED IT</title>
  </head>
  <body>
    <h1 class="text-3xl font-bold">NAILED IT</h1>
    <script type="module" src="/js/main.js"></script>
  </body>
</html>
```

### 한 줄씩 살펴보기

- **`<!DOCTYPE html>`** - "이 문서는 HTML5입니다"라고 브라우저에게 알려줍니다.
- **`<html lang="ko">`** - HTML 문서의 시작입니다. `lang="ko"`는 이 페이지가 한국어라는 뜻이에요.
- **`<meta charset="UTF-8" />`** - 한글이 깨지지 않게 문자 인코딩을 UTF-8로 설정합니다.
- **`<meta name="viewport" ...>`** - 모바일에서도 화면이 제대로 보이게 해주는 설정입니다.
- **`<title>NAILED IT</title>`** - 브라우저 탭에 표시될 제목입니다.
- **`<h1 class="text-3xl font-bold">NAILED IT</h1>`** - 큰 제목을 하나 넣었습니다. `text-3xl`과 `font-bold`는 Tailwind CSS 클래스입니다.
  - `text-3xl` → 글자 크기를 크게
  - `font-bold` → 글자를 굵게
- **`<script type="module" src="/js/main.js"></script>`** - JavaScript 파일을 연결합니다.
  - `type="module"` → ES Module 방식으로 불러옵니다. 이걸 써야 `import` 문법이 작동해요.
  - Vite는 이 `<script>` 태그를 보고 JavaScript를 처리합니다.

> **Vite에서 중요한 점**: 일반 HTML 프로젝트에서는 `<link>` 태그로 CSS를 연결하지만, Vite 프로젝트에서는 JavaScript에서 CSS를 `import` 합니다. 그래야 Vite가 CSS도 함께 처리할 수 있어요.

---

## 4. js/main.js

JavaScript 파일입니다. 지금은 CSS를 연결하는 역할만 합니다.

```js
import '../css/style.css';
```

### 한 줄씩 살펴보기

- **`import '../css/style.css'`** - CSS 파일을 JavaScript에서 불러옵니다.
  - `..`는 "한 단계 위 폴더"라는 뜻입니다. `js/` 폴더 기준으로 한 단계 위로 가면 프로젝트 루트이고, 거기서 `css/style.css`를 찾습니다.
  - JavaScript에서 CSS를 import하는 게 어색할 수 있지만, Vite가 이걸 자동으로 처리해서 HTML에 CSS를 넣어줍니다.
  - 나중에 여기에 JavaScript 코드를 추가하면 됩니다.

---

## 5. css/style.css

스타일시트 파일입니다. Tailwind CSS를 불러옵니다.

```css
@import 'tailwindcss';
```

### 한 줄씩 살펴보기

- **`@import 'tailwindcss'`** - Tailwind CSS의 모든 기능을 이 파일에 불러옵니다.
  - 이 한 줄만 있으면 `text-3xl`, `font-bold`, `bg-blue-500` 같은 Tailwind 클래스를 HTML에서 바로 사용할 수 있습니다.
  - 나중에 이 파일 아래에 직접 만든 CSS를 추가할 수도 있습니다.

---

## 프로젝트 실행 방법

```bash
# 1. 의존성 설치 (처음 한 번만)
npm install

# 2. 개발 서버 시작
npm run dev
```

`npm run dev`를 실행하면 터미널에 `http://localhost:5173` 같은 주소가 나옵니다. 이 주소를 브라우저에 입력하면 화면을 볼 수 있어요.

코드를 수정하고 저장하면 브라우저가 **자동으로 새로고침** 됩니다. 이것을 **HMR(Hot Module Replacement)** 이라고 해요.

---

## 파일 구조 한눈에 보기

```
nailed-it/
├── css/
│   └── style.css          ← Tailwind CSS를 불러오는 스타일 파일
├── js/
│   └── main.js            ← CSS를 import하고, JS 코드를 작성하는 파일
├── docs/
│   └── vite-setup-guide.md ← 지금 읽고 있는 이 문서
├── index.html             ← 브라우저가 가장 먼저 읽는 파일 (시작점)
├── package.json           ← 프로젝트 정보와 도구 목록
├── vite.config.js         ← Vite 설정 파일
└── node_modules/          ← npm install로 설치된 도구들 (직접 수정 X)
```

---

## 자주 쓰는 명령어 정리

| 명령어 | 설명 |
|--------|------|
| `npm install` | `package.json`에 적힌 도구들을 설치합니다 |
| `npm run dev` | 개발 서버를 시작합니다 (코드 수정 시 자동 반영) |
| `npm run build` | 배포용 파일을 `dist/` 폴더에 생성합니다 |
| `npm run preview` | 빌드 결과물을 로컬에서 미리 봅니다 |
