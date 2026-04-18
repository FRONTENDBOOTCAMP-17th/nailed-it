import { icon } from "./icon.js";

/**
 * 공통 페이지 헤더 HTML 문자열 반환
 * @param {Object} options
 * @param {string} options.title             헤더 제목
 * @param {string} [options.backHref]        뒤로가기 링크. 없으면 뒤로가기 버튼 미표시
 * @param {string} [options.actionsHtml=""]  오른쪽 버튼 영역 HTML
 * @param {string} [options.maxWidth="max-w-md"]  최대 너비 클래스 (history는 max-w-4xl)
 */
export function pageHeader({
  title,
  backHref,
  actionsHtml = "",
  maxWidth = "max-w-md",
}) {
  const backBtn = backHref
    ? `<a href="${backHref}" aria-label="이전 페이지로"
           class="p-2 -ml-2 hover:bg-black/5 rounded-lg transition-colors">
          ${icon("arrow-left", 20)}
        </a>`
    : "";

  return `
    <header class="px-6 py-4 border-b border-black/10">
      <div class="${maxWidth} mx-auto flex items-center justify-between">
        <div class="flex items-center gap-4">
          ${backBtn}
          <h2 class="font-medium">${title}</h2>
        </div>
        ${actionsHtml
          ? `<div class="flex items-center gap-2">${actionsHtml}</div>`
          : ""}
      </div>
    </header>
  `;
}

/**
 * 홈 + 히스토리 + 로그아웃 버튼 HTML (category, result 페이지용)
 */
export function defaultActions() {
  return `
    <a href="/index.html" aria-label="홈으로"
       class="p-2 hover:bg-black/5 rounded-lg transition-colors">
      ${icon("home", 20)}
    </a>
    <a href="/pages/history.html" aria-label="풀이 기록"
       class="p-2 hover:bg-black/5 rounded-lg transition-colors">
      ${icon("history", 20)}
    </a>
    <button id="logoutBtn" type="button" aria-label="로그아웃"
            class="p-2 hover:bg-black/5 rounded-lg transition-colors">
      ${icon("logout", 20)}
    </button>
  `;
}

/**
 * 홈 + 로그아웃 버튼 HTML (history 페이지용)
 */
export function historyActions() {
  return `
    <a href="/index.html" aria-label="홈으로"
       class="p-2 hover:bg-black/5 rounded-lg transition-colors">
      ${icon("home", 20)}
    </a>
    <button id="logoutBtn" type="button" aria-label="로그아웃"
            class="p-2 hover:bg-black/5 rounded-lg transition-colors">
      ${icon("logout", 20)}
    </button>
  `;
}