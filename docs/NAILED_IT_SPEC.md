# Nailed IT API 스펙

Base URL: `https://api.fullstackfamily.com`

---

## Auth (인증)

회원가입, 로그인, 로그아웃, 내 정보 조회

### POST /api/nailed-it/v1/auth/signup

**회원가입**

새로운 계정을 생성합니다. nickname은 1~10자, email은 이메일 형식, password는 8자 이상이어야 합니다.

- 인증: 불필요

**Request Body** (`application/json`)

| 필드       | 타입   | 필수 | 설명                 |
| ---------- | ------ | :--: | -------------------- |
| `nickname` | string |  O   | 닉네임 (1~10자)      |
| `email`    | string |  O   | 이메일 (이메일 형식) |
| `password` | string |  O   | 비밀번호 (8자 이상)  |

```json
{
  "nickname": "테스터",
  "email": "test@nailed.it",
  "password": "Test1234!"
}
```

**Response** (`201`)

```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다.",
  "data": {
    "id": 1,
    "nickname": "테스터",
    "email": "test@nailed.it",
    "createdAt": "2026-04-09T14:00:00"
  }
}
```

**Errors**

| 상태 | 메시지                                           |
| :--: | ------------------------------------------------ |
| 409  | 이미 존재하는 이메일입니다. (DUPLICATE_EMAIL)    |
| 409  | 이미 존재하는 닉네임입니다. (DUPLICATE_NICKNAME) |
| 400  | 입력값 유효성 검증 실패 (VALIDATION_ERROR)       |

---

### POST /api/nailed-it/v1/auth/login

**로그인**

이메일과 비밀번호로 로그인하여 JWT 토큰을 발급받습니다. 토큰 만료 시간은 24시간입니다.

- 인증: 불필요

**Request Body** (`application/json`)

| 필드       | 타입   | 필수 | 설명     |
| ---------- | ------ | :--: | -------- |
| `email`    | string |  O   | 이메일   |
| `password` | string |  O   | 비밀번호 |

```json
{
  "email": "admin@nailed.it",
  "password": "boss-520!"
}
```

**Response** (`200`)

```json
{
  "success": true,
  "message": "로그인에 성공했습니다.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "id": 1,
    "nickname": "Boss🐱",
    "role": "admin",
    "email": "admin@nailed.it"
  }
}
```

**Errors**

| 상태 | 메시지                                                          |
| :--: | --------------------------------------------------------------- |
| 401  | 이메일 또는 비밀번호가 올바르지 않습니다. (INVALID_CREDENTIALS) |

---

### POST /api/nailed-it/v1/auth/logout

**로그아웃**

로그아웃합니다. 서버는 200 응답만 반환하며, 실제 토큰 무효화는 프론트엔드에서 토큰 삭제로 처리합니다.

- 인증: 불필요

**Response** (`200`)

```json
{
  "success": true,
  "message": "로그아웃 되었습니다.",
  "data": null
}
```

---

### GET /api/nailed-it/v1/users/me

**내 정보 조회**

현재 로그인한 사용자의 정보를 조회합니다. JWT 토큰이 필요합니다.

- 인증: 필요 (`Authorization: Bearer <TOKEN>`)

**Response** (`200`)

```json
{
  "success": true,
  "message": "사용자 정보 조회에 성공했습니다.",
  "data": {
    "id": 1,
    "nickname": "Boss🐱",
    "email": "admin@nailed.it",
    "role": "admin"
  }
}
```

---

## Categories (카테고리)

퀴즈 카테고리 목록 조회

### GET /api/nailed-it/v1/categories

**카테고리 목록 조회**

HTML, CSS, JavaScript 등 퀴즈 카테고리 목록을 조회합니다.

- 인증: 필요 (`Authorization: Bearer <TOKEN>`)

**Response** (`200`)

```json
{
  "success": true,
  "message": "카테고리 목록 조회에 성공했습니다.",
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "html",
        "label": "HTML"
      },
      {
        "id": 2,
        "name": "css",
        "label": "CSS"
      },
      {
        "id": 3,
        "name": "js",
        "label": "JavaScript"
      }
    ]
  }
}
```

---

## Quizzes (퀴즈)

사용자용 퀴즈 조회 (정답/해설 미포함)

### GET /api/nailed-it/v1/quizzes/:id

**퀴즈 상세 조회**

퀴즈의 문제와 보기를 조회합니다. 정답(answer)과 해설(explanation)은 포함되지 않습니다.

- 인증: 필요 (`Authorization: Bearer <TOKEN>`)

**Path Parameters**

| 이름 | 타입   | 필수 | 설명    |
| ---- | ------ | :--: | ------- |
| `id` | number |  O   | 퀴즈 ID |

**Response** (`200`)

```json
{
  "success": true,
  "message": "퀴즈 조회에 성공했습니다.",
  "data": {
    "id": 3,
    "title": "블록 레벨 요소",
    "category": "html",
    "question": "다음 중 블록 레벨 요소가 아닌 것은?",
    "options": ["<div>", "<p>", "<span>", "<h1>"],
    "difficulty": "easy"
  }
}
```

**Errors**

| 상태 | 메시지                                    |
| :--: | ----------------------------------------- |
| 404  | 퀴즈를 찾을 수 없습니다. (QUIZ_NOT_FOUND) |

---

## Admin Quizzes (퀴즈 관리)

관리자 전용 퀴즈 CRUD

### GET /api/nailed-it/v1/admin/quizzes

**퀴즈 목록 조회**

관리자용 퀴즈 목록을 페이징하여 조회합니다. 카테고리로 필터링할 수 있습니다.

- 인증: 필요 (`Authorization: Bearer <TOKEN>`)

**Query Parameters**

| 이름       | 타입   | 필수 | 기본값 | 설명                          |
| ---------- | ------ | :--: | ------ | ----------------------------- |
| `category` | string |  X   | -      | 카테고리 필터 (html, css, js) |
| `page`     | number |  X   | 1      | 페이지 번호 (1부터 시작)      |
| `limit`    | number |  X   | 10     | 페이지당 항목 수              |

**Response** (`200`)

```json
{
  "success": true,
  "message": "퀴즈 목록 조회에 성공했습니다.",
  "data": {
    "quizzes": [
      {
        "id": 1,
        "title": "시맨틱 태그",
        "category": "html",
        "difficulty": "easy",
        "status": "published",
        "createdAt": "2026-04-09T14:00:00"
      },
      {
        "id": 2,
        "title": "Flexbox 정렬",
        "category": "css",
        "difficulty": "medium",
        "status": "published",
        "createdAt": "2026-04-09T14:05:00"
      }
    ],
    "total": 25,
    "page": 1
  },
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 25,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

### GET /api/nailed-it/v1/admin/quizzes/:id

**퀴즈 상세 조회 (정답 포함)**

관리자용 퀴즈 상세 조회입니다. 정답(answer)과 해설(explanation), 상태(status)가 포함됩니다.

- 인증: 필요 (`Authorization: Bearer <TOKEN>`)

**Path Parameters**

| 이름 | 타입   | 필수 | 설명    |
| ---- | ------ | :--: | ------- |
| `id` | number |  O   | 퀴즈 ID |

**Response** (`200`)

```json
{
  "success": true,
  "message": "퀴즈 조회에 성공했습니다.",
  "data": {
    "id": 3,
    "title": "블록 레벨 요소",
    "category": "html",
    "question": "다음 중 블록 레벨 요소가 아닌 것은?",
    "options": ["<div>", "<p>", "<span>", "<h1>"],
    "answer": 2,
    "explanation": "<span>은 인라인 요소입니다.",
    "difficulty": "easy",
    "status": "published",
    "createdAt": "2026-04-09T14:00:00",
    "updatedAt": "2026-04-09T14:00:00"
  }
}
```

**Errors**

| 상태 | 메시지                                    |
| :--: | ----------------------------------------- |
| 404  | 퀴즈를 찾을 수 없습니다. (QUIZ_NOT_FOUND) |

---

### POST /api/nailed-it/v1/admin/quizzes

**퀴즈 등록**

새로운 퀴즈를 등록합니다. 관리자 권한이 필요합니다.

- 인증: 필요 (`Authorization: Bearer <TOKEN>`)

**Request Body** (`application/json`)

| 필드          | 타입     | 필수 | 설명                        |
| ------------- | -------- | :--: | --------------------------- |
| `title`       | string   |  O   | 퀴즈 제목                   |
| `category`    | string   |  O   | 카테고리 (html, css, js)    |
| `question`    | string   |  O   | 문제 내용                   |
| `options`     | string[] |  O   | 보기 배열 (4개)             |
| `answer`      | number   |  O   | 정답 인덱스 (0~3)           |
| `explanation` | string   |  O   | 해설                        |
| `difficulty`  | string   |  O   | 난이도 (easy, medium, hard) |

```json
{
  "title": "블록 레벨 요소",
  "category": "html",
  "question": "다음 중 블록 레벨 요소가 아닌 것은?",
  "options": ["<div>", "<p>", "<span>", "<h1>"],
  "answer": 2,
  "explanation": "<span>은 인라인 요소입니다.",
  "difficulty": "easy"
}
```

**Response** (`201`)

```json
{
  "success": true,
  "message": "퀴즈가 등록되었습니다.",
  "data": {
    "id": 31,
    "title": "블록 레벨 요소",
    "category": "html",
    "question": "다음 중 블록 레벨 요소가 아닌 것은?",
    "options": ["<div>", "<p>", "<span>", "<h1>"],
    "answer": 2,
    "explanation": "<span>은 인라인 요소입니다.",
    "difficulty": "easy",
    "status": "published",
    "createdAt": "2026-04-09T15:00:00",
    "updatedAt": "2026-04-09T15:00:00"
  }
}
```

**Errors**

| 상태 | 메시지                                     |
| :--: | ------------------------------------------ |
| 400  | 입력값 유효성 검증 실패 (VALIDATION_ERROR) |
| 403  | 관리자 권한이 필요합니다. (FORBIDDEN)      |

---

### PATCH /api/nailed-it/v1/admin/quizzes/:id

**퀴즈 수정**

퀴즈를 수정합니다. 변경할 필드만 전송하면 됩니다 (부분 업데이트).

- 인증: 필요 (`Authorization: Bearer <TOKEN>`)

**Path Parameters**

| 이름 | 타입   | 필수 | 설명    |
| ---- | ------ | :--: | ------- |
| `id` | number |  O   | 퀴즈 ID |

**Request Body** (`application/json`)

| 필드          | 타입     | 필수 | 설명                        |
| ------------- | -------- | :--: | --------------------------- |
| `title`       | string   |  X   | 퀴즈 제목                   |
| `category`    | string   |  X   | 카테고리 (html, css, js)    |
| `question`    | string   |  X   | 문제 내용                   |
| `options`     | string[] |  X   | 보기 배열 (4개)             |
| `answer`      | number   |  X   | 정답 인덱스 (0~3)           |
| `explanation` | string   |  X   | 해설                        |
| `difficulty`  | string   |  X   | 난이도 (easy, medium, hard) |

```json
{
  "title": "블록 레벨 요소 (수정)",
  "difficulty": "medium"
}
```

**Response** (`200`)

```json
{
  "success": true,
  "message": "퀴즈가 수정되었습니다.",
  "data": {
    "id": 3,
    "title": "블록 레벨 요소 (수정)",
    "category": "html",
    "question": "다음 중 블록 레벨 요소가 아닌 것은?",
    "options": ["<div>", "<p>", "<span>", "<h1>"],
    "answer": 2,
    "explanation": "<span>은 인라인 요소입니다.",
    "difficulty": "medium",
    "status": "published",
    "createdAt": "2026-04-09T14:00:00",
    "updatedAt": "2026-04-09T15:30:00"
  }
}
```

**Errors**

| 상태 | 메시지                                    |
| :--: | ----------------------------------------- |
| 404  | 퀴즈를 찾을 수 없습니다. (QUIZ_NOT_FOUND) |
| 403  | 관리자 권한이 필요합니다. (FORBIDDEN)     |

---

### DELETE /api/nailed-it/v1/admin/quizzes/:id

**퀴즈 삭제**

퀴즈를 삭제합니다. 관리자 권한이 필요합니다.

- 인증: 필요 (`Authorization: Bearer <TOKEN>`)

**Path Parameters**

| 이름 | 타입   | 필수 | 설명    |
| ---- | ------ | :--: | ------- |
| `id` | number |  O   | 퀴즈 ID |

**Response** (`200`)

```json
{
  "success": true,
  "message": "퀴즈가 삭제되었습니다.",
  "data": null
}
```

**Errors**

| 상태 | 메시지                                    |
| :--: | ----------------------------------------- |
| 404  | 퀴즈를 찾을 수 없습니다. (QUIZ_NOT_FOUND) |
| 403  | 관리자 권한이 필요합니다. (FORBIDDEN)     |

---

## Sessions (퀴즈 세션)

세션 생성 (퀴즈 시작), 답안 제출, 결과 조회, 히스토리

### POST /api/nailed-it/v1/sessions

**세션 생성 (퀴즈 시작)**

카테고리를 선택하여 퀴즈 세션을 생성합니다. 해당 카테고리에서 최대 10문제가 배정됩니다.

- 인증: 필요 (`Authorization: Bearer <TOKEN>`)

**Request Body** (`application/json`)

| 필드       | 타입   | 필수 | 설명                     |
| ---------- | ------ | :--: | ------------------------ |
| `category` | string |  O   | 카테고리 (html, css, js) |

```json
{
  "category": "html"
}
```

**Response** (`201`)

```json
{
  "success": true,
  "message": "퀴즈 세션이 생성되었습니다.",
  "data": {
    "sessionId": 42,
    "category": "html",
    "quizIds": [3, 7, 12, 15, 21, 28, 33, 41, 45, 50],
    "totalQuizzes": 10,
    "createdAt": "2026-04-09T14:00:00"
  }
}
```

**Errors**

| 상태 | 메시지                                        |
| :--: | --------------------------------------------- |
| 404  | 해당 카테고리에 퀴즈가 없습니다. (NO_QUIZZES) |

---

### POST /api/nailed-it/v1/sessions/:sessionId/answers

**답안 제출 (즉시 채점)**

세션 내 퀴즈에 답안을 제출합니다. 즉시 채점되어 정답, 해설이 반환됩니다. selectedIndex를 null로 보내면 스킵 처리됩니다.

- 인증: 필요 (`Authorization: Bearer <TOKEN>`)

**Path Parameters**

| 이름        | 타입   | 필수 | 설명    |
| ----------- | ------ | :--: | ------- |
| `sessionId` | number |  O   | 세션 ID |

**Request Body** (`application/json`)

| 필드            | 타입   | 필수 | 설명    |
| --------------- | ------ | :--: | ------- | --------------------------------------- |
| `quizId`        | number |  O   | 퀴즈 ID |
| `selectedIndex` | number | null | O       | 선택한 보기 인덱스 (0~3, null이면 스킵) |

```json
{
  "quizId": 3,
  "selectedIndex": 2
}
```

**Response** (`200`)

```json
{
  "success": true,
  "message": "답안이 제출되었습니다.",
  "data": {
    "quizId": 3,
    "correct": true,
    "answer": 2,
    "explanation": "<span>은 인라인 요소입니다.",
    "skipped": false
  }
}
```

**Errors**

| 상태 | 메시지                                            |
| :--: | ------------------------------------------------- |
| 400  | 세션에 배정되지 않은 퀴즈입니다. (INVALID_QUIZ)   |
| 403  | 본인의 세션이 아닙니다. (FORBIDDEN)               |
| 409  | 이미 답안을 제출한 퀴즈입니다. (DUPLICATE_ANSWER) |

---

### GET /api/nailed-it/v1/sessions/:sessionId

**세션 결과 조회**

세션의 전체 결과를 조회합니다. 점수, 답안 목록, 각 문제의 정답/해설이 포함됩니다.

- 인증: 필요 (`Authorization: Bearer <TOKEN>`)

**Path Parameters**

| 이름        | 타입   | 필수 | 설명    |
| ----------- | ------ | :--: | ------- |
| `sessionId` | number |  O   | 세션 ID |

**Response** (`200`)

```json
{
  "success": true,
  "message": "세션 결과 조회에 성공했습니다.",
  "data": {
    "sessionId": 42,
    "category": "html",
    "score": 8,
    "totalQuizzes": 10,
    "completedAt": "2026-04-09T14:15:00",
    "createdAt": "2026-04-09T14:00:00",
    "answers": [
      {
        "quizId": 3,
        "title": "블록 레벨 요소",
        "question": "다음 중 블록 레벨 요소가 아닌 것은?",
        "options": ["<div>", "<p>", "<span>", "<h1>"],
        "selectedIndex": 2,
        "answer": 2,
        "correct": true,
        "skipped": false,
        "explanation": "<span>은 인라인 요소입니다."
      },
      {
        "quizId": 7,
        "title": "시맨틱 태그",
        "question": "다음 중 시맨틱 태그가 아닌 것은?",
        "options": ["<header>", "<nav>", "<div>", "<article>"],
        "selectedIndex": 0,
        "answer": 2,
        "correct": false,
        "skipped": false,
        "explanation": "<div>는 의미 없는 컨테이너 요소로, 시맨틱 태그가 아닙니다."
      }
    ]
  }
}
```

**Errors**

| 상태 | 메시지                                       |
| :--: | -------------------------------------------- |
| 403  | 본인의 세션이 아닙니다. (FORBIDDEN)          |
| 404  | 세션을 찾을 수 없습니다. (SESSION_NOT_FOUND) |

---

### GET /api/nailed-it/v1/sessions

**세션 히스토리**

내 퀴즈 풀이 기록을 페이징하여 조회합니다. 카테고리로 필터링할 수 있습니다.

- 인증: 필요 (`Authorization: Bearer <TOKEN>`)

**Query Parameters**

| 이름       | 타입   | 필수 | 기본값 | 설명                          |
| ---------- | ------ | :--: | ------ | ----------------------------- |
| `category` | string |  X   | -      | 카테고리 필터 (html, css, js) |
| `page`     | number |  X   | 1      | 페이지 번호 (1부터 시작)      |
| `limit`    | number |  X   | 10     | 페이지당 항목 수              |

**Response** (`200`)

```json
{
  "success": true,
  "message": "세션 히스토리 조회에 성공했습니다.",
  "data": {
    "sessions": [
      {
        "sessionId": 42,
        "category": "html",
        "score": 8,
        "totalQuizzes": 10,
        "completedAt": "2026-04-09T14:15:00",
        "createdAt": "2026-04-09T14:00:00"
      },
      {
        "sessionId": 41,
        "category": "css",
        "score": 6,
        "totalQuizzes": 10,
        "completedAt": "2026-04-08T16:30:00",
        "createdAt": "2026-04-08T16:10:00"
      }
    ],
    "total": 15,
    "page": 1
  },
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 15,
      "totalPages": 2,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---
