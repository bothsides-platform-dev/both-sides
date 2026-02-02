/**
 * 언어 감지 유틸리티
 * 한국어와 영어만 허용하는 필터링 함수
 */

/**
 * 문자열이 한국어를 포함하는지 확인
 */
function hasKorean(text: string): boolean {
  // 한글 유니코드 범위: AC00-D7AF (완성형 한글)
  // 추가로 3130-318F (한글 자음/모음)도 포함
  return /[\uAC00-\uD7AF\u3130-\u318F]/.test(text);
}

/**
 * 문자열이 영어를 포함하는지 확인
 */
function hasEnglish(text: string): boolean {
  // 영문 알파벳 (대소문자)
  return /[a-zA-Z]/.test(text);
}

/**
 * 문자열이 한국어 또는 영어만 포함하는지 확인
 * 숫자, 공백, 일반 구두점은 허용
 * 
 * @param text - 확인할 문자열
 * @returns 한국어나 영어만 포함하면 true, 다른 언어가 있으면 false
 */
export function isKoreanOrEnglishOnly(text: string): boolean {
  // 한국어나 영어가 하나라도 있는지 확인
  const hasKoreanOrEnglish = hasKorean(text) || hasEnglish(text);
  
  if (!hasKoreanOrEnglish) {
    return false;
  }
  
  // 한국어, 영어, 숫자, 공백, 일반 구두점을 제외한 문자가 있는지 확인
  // 중국어, 일본어 등 다른 언어 문자가 있으면 제외
  // 허용되는 구두점: 마침표(.), 쉼표(,), 느낌표(!), 물음표(?), 하이픈(-), 
  // 작은따옴표('), 큰따옴표("), 괄호(()), 슬래시(/), 앰퍼샌드(&), 콜론(:)
  const allowedPattern = /^[\uAC00-\uD7AF\u3130-\u318Fa-zA-Z0-9\s.,!?'"\(\)/&:-]+$/;
  
  return allowedPattern.test(text);
}
