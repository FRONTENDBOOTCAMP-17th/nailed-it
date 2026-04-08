# 🖥 NAILED IT — API 요구사항 명세서

> 바닐라 JS (Vite + Tailwind CSS) + REST API · 역할 분리 (관리자 · 일반 유저) 프로젝트

---

## 1. 프로젝트 개요

HTML · CSS · JavaScript 개념을 퀴즈로 학습하는 웹 애플리케이션
관리자(연수)가 문제를 등록·수정·삭제하고, 일반 유저는 카테고리별로 퀴즈를 풀고 정답과 해설을 확인하는 구조입니다.

| 구분 | 관리자 계정                     | 일반 유저                 |
| ---- | ------------------------------- | ------------------------- |
| 권한 | 퀴즈 등록 · 수정 · 삭제         | 카테고리별 퀴즈 목록 조회 |
|      | 카테고리 지정 (HTML · CSS · JS) | 퀴즈 풀기 + 즉시 채점     |
|      | 정답 및 해설 등록               | 정답 · 해설 확인          |
|      | 전체 퀴즈 관리 페이지 접근      |                           |

---

## 2. 공통 기술 규약

| 항목         | 내용                                                                   |
| ------------ | ---------------------------------------------------------------------- |
| Base URL     | `https://api.nailedit.com` (미정 · 추후 확인 필요)                     |
| Content-Type | `application/json`                                                     |
| 인증 방식    | JWT Bearer Token — `Authorization: Bearer {token}` (localStorage 저장) |
| 관리자 판별  | 로그인 응답의 `role` 필드가 `"admin"`이면 관리자 메뉴로 이동           |
| 관리자 계정  | ID: `nailed.it` / PW: `admin520!` (서버 세팅 후 삭제 예정)             |
| 날짜 형식    | ISO 8601 (예: `2026-04-07T12:00:00Z`)                                  |

---

## 3. 인증 API (Auth)

### 3-1. 회원가입

```
POST /auth/signup
인증: 불필요
```

**Request Body**

| 필드         | 타입    | 필수 | 유효성 검사 및 제약 조건                                     | 비고                                |
| ------------ | ------- | ---- | ------------------------------------------------------------ | ----------------------------------- |
| name         | string  | ✅   | 한글 또는 영문 실명만 허용 / 특수문자 · 숫자 불가            | 본인 실명 필수                      |
| nickname     | string  | ✅   | 1~10자 / 특수문자 `- _ .` 만 허용 / 중복 불가                | 서비스 내 식별자                    |
| email        | string  | ✅   | 이메일 형식 준수 / 중복 불가                                 | 로그인 ID로 사용                    |
| password     | string  | ✅   | 최소 8자 이상 / 영문 · 숫자 · 특수문자 각 1개 이상 필수 포함 | 보안을 위한 암호화 저장             |
| phone        | string  | ❌   | 숫자만 허용 (최대 11자)                                      | 프론트에서 하이픈(`-`) 제거 처리    |
| terms_agreed | boolean | ✅   | 반드시 `true`                                                | 이용약관 및 개인정보 처리 방침 동의 |

**Response (201)**

| 필드      | 타입   | 설명             |
| --------- | ------ | ---------------- |
| id        | number | 생성된 사용자 ID |
| name      | string | 실명             |
| nickname  | string | 닉네임           |
| email     | string | 이메일           |
| createdAt | string | 가입 일시        |

> ⚠️ 이미 존재하는 이메일 또는 닉네임으로 가입 시 `409 Conflict` 반환

---

### 3-2. 로그인 — 사용자

```
POST /auth/login
인증: 불필요
```

**Request Body**

| 필드        | 타입    | 필수 | 유효성 검사 및 제약 조건 | 비고                          |
| ----------- | ------- | ---- | ------------------------ | ----------------------------- |
| email       | string  | ✅   | 이메일 형식 준수         | 로그인 ID                     |
| password    | string  | ✅   | 필수 입력                |                               |
| remember_me | boolean | ❌   | 기본값 `false`           | 체크 시 로그인 유지 기간 연장 |

**Response (200)**

| 필드          | 타입   | 설명                           |
| ------------- | ------ | ------------------------------ |
| token         | string | JWT 토큰 (localStorage에 저장) |
| user.id       | number | 사용자 ID                      |
| user.nickname | string | 닉네임                         |
| user.role     | string | `"user"`                       |

> 📌 로그인 완료 후 홈 화면으로 이동합니다.

---

### 3-3. 로그인 — 관리자

```
POST /auth/admin/login
인증: 불필요
```

**Request Body**

| 필드        | 타입    | 필수 | 유효성 검사 및 제약 조건    | 비고                          |
| ----------- | ------- | ---- | --------------------------- | ----------------------------- |
| username    | string  | ✅   | 사전 지정된 관리자 ID       | `nailed.it`                   |
| password    | string  | ✅   | 사전 지정된 관리자 비밀번호 | `admin520!`                   |
| remember_me | boolean | ❌   | 기본값 `false`              | 체크 시 로그인 유지 기간 연장 |

**Response (200)**

| 필드          | 타입   | 설명                           |
| ------------- | ------ | ------------------------------ |
| token         | string | JWT 토큰 (localStorage에 저장) |
| user.id       | number | 관리자 ID                      |
| user.username | string | 관리자 아이디 (`nailed.it`)    |
| user.role     | string | `"admin"`                      |

> 📌 로그인 완료 후 문제 관리(목록) 페이지로 이동합니다.
> ⚠️ username 또는 password 불일치 시 `401 Unauthorized` 반환

---

### 3-4. 로그아웃

```
POST /auth/logout
인증: 필요 (JWT)
```

**Request Body:** 없음

**Response (200)**

| 필드    | 타입   | 설명                    |
| ------- | ------ | ----------------------- |
| message | string | `"로그아웃 되었습니다"` |

> 📌 클라이언트에서 localStorage의 토큰을 삭제하여 처리합니다.

---

## 4. 사용자 API (Users)

### 4-1. 내 정보 조회

```
GET /users/me
인증: 필요 (JWT)
```

로그인 직후 호출하여 `role` 값으로 관리자 여부를 판별합니다.

**Request Body:** 없음

**Response (200)**

| 필드     | 타입   | 설명                    |
| -------- | ------ | ----------------------- |
| id       | number | 사용자 ID               |
| name     | string | 실명                    |
| nickname | string | 닉네임                  |
| email    | string | 이메일                  |
| role     | string | `"admin"` 또는 `"user"` |

---

## 5. 퀴즈 API (Posts)

### 5-1. 퀴즈 목록 조회 — 사용자

```
GET /posts?category=html&page=1&limit=10
인증: 필요 (JWT)
```

**Query Parameters**

| 파라미터 | 타입   | 필수 | 설명                                              |
| -------- | ------ | ---- | ------------------------------------------------- |
| category | string | ❌   | `"html"` · `"css"` · `"js"` 중 하나 (없으면 전체) |
| page     | number | ❌   | 페이지 번호 (기본값: 1)                           |
| limit    | number | ❌   | 페이지당 개수 (기본값: 10)                        |

**Response (200)**

| 필드             | 타입   | 설명                                   |
| ---------------- | ------ | -------------------------------------- |
| posts[]          | array  | 퀴즈 목록                              |
| posts[].id       | number | 퀴즈 ID                                |
| posts[].title    | string | 퀴즈 제목                              |
| posts[].category | string | 카테고리 (`"html"` · `"css"` · `"js"`) |
| total            | number | 전체 퀴즈 수                           |
| page             | number | 현재 페이지                            |

> 📌 사용자에게는 `status` · `answer` · `explanation` 를 반환하지 않습니다.

---

### 5-2. 퀴즈 목록 조회 — 관리자

```
GET /admin/posts?category=html&page=1&limit=10
인증: 필요 (JWT · 관리자만)
```

**Query Parameters**

| 파라미터 | 타입   | 필수 | 설명                                              |
| -------- | ------ | ---- | ------------------------------------------------- |
| category | string | ❌   | `"html"` · `"css"` · `"js"` 중 하나 (없으면 전체) |
| page     | number | ❌   | 페이지 번호 (기본값: 1)                           |
| limit    | number | ❌   | 페이지당 개수 (기본값: 10)                        |

**Response (200)**

| 필드              | 타입   | 설명                                   |
| ----------------- | ------ | -------------------------------------- |
| posts[]           | array  | 퀴즈 목록                              |
| posts[].id        | number | 퀴즈 ID                                |
| posts[].title     | string | 퀴즈 제목                              |
| posts[].category  | string | 카테고리 (`"html"` · `"css"` · `"js"`) |
| posts[].status    | string | `"published"` 또는 `"draft"`           |
| posts[].createdAt | string | 등록 일시 (예: `2026-04-08`)           |
| total             | number | 전체 퀴즈 수                           |
| page              | number | 현재 페이지                            |

---

### 5-3. 퀴즈 상세 조회 — 사용자

```
GET /posts/:id
인증: 필요 (JWT)
```

> 📌 정답(`answer`)과 해설(`explanation`)은 처음부터 응답에 포함되지만, 프론트엔드에서 보기 선택 전까지 화면에 표시하지 않습니다. 보기를 선택하면 즉시 잠금 처리되며 변경 불가합니다.
> 📌 결과 페이지의 해설 확인은 오답·스킵 문제 ID 목록으로 이 API를 반복 호출하여 `answer`와 `explanation` 필드를 활용합니다. 별도 결과 API는 없습니다.

**Request Body:** 없음

**Response (200)**

| 필드        | 타입     | 설명                     |
| ----------- | -------- | ------------------------ |
| id          | number   | 퀴즈 ID                  |
| title       | string   | 퀴즈 제목                |
| category    | string   | 카테고리                 |
| question    | string   | 문제 내용                |
| options     | string[] | 보기 배열 (4개)          |
| answer      | number   | 정답 인덱스 (0부터 시작) |
| explanation | string   | 해설                     |

---

### 5-4. 퀴즈 상세 조회 — 관리자

```
GET /admin/posts/:id
인증: 필요 (JWT · 관리자만)
```

**Request Body:** 없음

**Response (200)**

| 필드        | 타입     | 설명                         |
| ----------- | -------- | ---------------------------- |
| id          | number   | 퀴즈 ID                      |
| title       | string   | 퀴즈 제목                    |
| category    | string   | 카테고리                     |
| question    | string   | 문제 내용                    |
| options     | string[] | 보기 배열 (4개)              |
| answer      | number   | 정답 인덱스 (0부터 시작)     |
| explanation | string   | 해설                         |
| status      | string   | `"published"` 또는 `"draft"` |
| createdAt   | string   | 등록 일시                    |

---

### 5-5. 퀴즈 임시저장 — Draft 생성 (관리자 전용)

```
POST /posts/draft
인증: 필요 (JWT · 관리자만)
```

문제를 바로 발행하지 않고 임시저장 상태로 저장합니다.

**Request Body**

| 필드        | 타입     | 필수 | 설명                                |
| ----------- | -------- | ---- | ----------------------------------- |
| title       | string   | ✅   | 퀴즈 제목                           |
| category    | string   | ✅   | `"html"` · `"css"` · `"js"` 중 하나 |
| question    | string   | ✅   | 문제 내용                           |
| options     | string[] | ✅   | 보기 배열 (4개)                     |
| answer      | number   | ✅   | 정답 인덱스 (0부터 시작)            |
| explanation | string   | ✅   | 해설                                |

**Response (201)**

| 필드      | 타입   | 설명           |
| --------- | ------ | -------------- |
| id        | number | 생성된 퀴즈 ID |
| status    | string | `"draft"`      |
| createdAt | string | 생성 일시      |

> ⚠️ 관리자 계정이 아닌 경우 `403 Forbidden` 반환

---

### 5-6. 퀴즈 등록 — 즉시 발행 (관리자 전용)

```
POST /posts
인증: 필요 (JWT · 관리자만)
```

문제를 바로 발행 상태로 등록합니다.

**Request Body**

| 필드        | 타입     | 필수 | 설명                                |
| ----------- | -------- | ---- | ----------------------------------- |
| title       | string   | ✅   | 퀴즈 제목                           |
| category    | string   | ✅   | `"html"` · `"css"` · `"js"` 중 하나 |
| question    | string   | ✅   | 문제 내용                           |
| options     | string[] | ✅   | 보기 배열 (4개)                     |
| answer      | number   | ✅   | 정답 인덱스 (0부터 시작)            |
| explanation | string   | ✅   | 해설                                |

**Response (201)**

| 필드      | 타입   | 설명           |
| --------- | ------ | -------------- |
| id        | number | 생성된 퀴즈 ID |
| status    | string | `"published"`  |
| createdAt | string | 생성 일시      |

> ⚠️ 관리자 계정이 아닌 경우 `403 Forbidden` 반환

---

### 5-7. Draft → 발행 (관리자 전용)

```
PUT /posts/:id/publish
인증: 필요 (JWT · 관리자만)
```

임시저장 상태의 퀴즈를 발행합니다.

**Request Body:** 없음

**Response (200)**

| 필드        | 타입   | 설명          |
| ----------- | ------ | ------------- |
| id          | number | 퀴즈 ID       |
| status      | string | `"published"` |
| publishedAt | string | 발행 일시     |

> ⚠️ 관리자 계정이 아닌 경우 `403 Forbidden` 반환

---

### 5-8. 퀴즈 수정 (관리자 전용)

```
PUT /posts/:id
인증: 필요 (JWT · 관리자만)
```

**Request Body** (변경할 필드만 포함)

| 필드        | 타입     | 필수 | 설명               |
| ----------- | -------- | ---- | ------------------ |
| title       | string   | ❌   | 수정할 제목        |
| category    | string   | ❌   | 수정할 카테고리    |
| question    | string   | ❌   | 수정할 문제 내용   |
| options     | string[] | ❌   | 수정할 보기 배열   |
| answer      | number   | ❌   | 수정할 정답 인덱스 |
| explanation | string   | ❌   | 수정할 해설        |

**Response (200)**

| 필드      | 타입   | 설명        |
| --------- | ------ | ----------- |
| id        | number | 퀴즈 ID     |
| title     | string | 수정된 제목 |
| updatedAt | string | 수정 일시   |

> ⚠️ 관리자 계정이 아닌 경우 `403 Forbidden` 반환

---

### 5-9. 퀴즈 삭제 (관리자 전용)

```
DELETE /posts/:id
인증: 필요 (JWT · 관리자만)
```

> 📌 프론트엔드에서 삭제 버튼 클릭 시 확인 모달을 먼저 띄운 후, 사용자가 최종 확인했을 때만 이 API를 호출합니다. API 자체는 호출 즉시 삭제 처리됩니다.

**Request Body:** 없음

**Response (200)**

| 필드    | 타입   | 설명                      |
| ------- | ------ | ------------------------- |
| message | string | `"퀴즈가 삭제되었습니다"` |

> ⚠️ 관리자 계정이 아닌 경우 `403 Forbidden` 반환

---

## 6. 공통 에러 응답 코드

모든 에러 응답은 아래 형태로 반환됩니다.

```json
{ "error": "에러 메시지" }
```

| 코드  | 상태                  | 설명                     | 발생 예시                   |
| ----- | --------------------- | ------------------------ | --------------------------- |
| `400` | Bad Request           | 요청 형식 오류           | 필수 필드 누락              |
| `401` | Unauthorized          | 인증 토큰 없음 또는 만료 | Authorization 헤더 미포함   |
| `403` | Forbidden             | 권한 없음                | 일반 유저가 관리자 API 호출 |
| `404` | Not Found             | 리소스 없음              | 잘못된 퀴즈 ID              |
| `409` | Conflict              | 중복 리소스              | 이미 존재하는 이메일로 가입 |
| `500` | Internal Server Error | 서버 내부 오류           | 예상치 못한 서버 예외       |

---

_— END OF DOCUMENT —_
