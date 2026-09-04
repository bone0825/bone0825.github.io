// 글 페이지 보조 기능: 목차 자동 생성 + 코드블록 복사 버튼
// 빌드 도구 없이 브라우저에서만 동작합니다.

(function () {
  'use strict';

  /* ---------- 1. 목차 자동 생성 ---------- */
  function buildToc() {
    var mount = document.querySelector('[data-toc]');
    var prose = document.querySelector('.post .prose');
    if (!mount || !prose) return;

    var heads = prose.querySelectorAll('h2, h3');
    if (heads.length < 2) { mount.remove(); return; }   // 제목 1개 이하면 목차 무의미

    var list = document.createElement('ul');
    list.className = 'toc-list';

    Array.prototype.forEach.call(heads, function (h, i) {
      if (!h.id) {
        // kramdown 이 id 를 안 붙인 경우 대비
        h.id = 'h-' + i + '-' + (h.textContent || '').trim()
          .toLowerCase().replace(/[^\w가-힣]+/g, '-').replace(/^-+|-+$/g, '');
      }
      var li = document.createElement('li');
      li.className = 'toc-item toc-' + h.tagName.toLowerCase();
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent;
      li.appendChild(a);
      list.appendChild(li);
    });

    mount.appendChild(list);

    /* 스크롤에 따라 현재 위치 표시 */
    var links = mount.querySelectorAll('a');
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        Array.prototype.forEach.call(links, function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-70px 0px -70% 0px' });

    Array.prototype.forEach.call(heads, function (h) { observer.observe(h); });
  }

  /* ---------- 2. 코드블록 복사 버튼 ---------- */
  function addCopyButtons() {
    var blocks = document.querySelectorAll('.prose div.highlighter-rouge, .prose pre');
    Array.prototype.forEach.call(blocks, function (block) {
      // pre 가 highlighter-rouge 안에 있으면 바깥 것만 처리 (중복 방지)
      if (block.tagName === 'PRE' && block.closest('.highlighter-rouge')) return;

      var pre = block.tagName === 'PRE' ? block : block.querySelector('pre');
      if (!pre) return;

      var wrap = document.createElement('div');
      wrap.className = 'code-wrap';
      block.parentNode.insertBefore(wrap, block);
      wrap.appendChild(block);

      var btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.type = 'button';
      btn.textContent = '복사';
      btn.setAttribute('aria-label', '코드 복사');

      btn.addEventListener('click', function () {
        var text = pre.innerText;
        var done = function () {
          btn.textContent = '복사됨';
          btn.classList.add('copied');
          setTimeout(function () {
            btn.textContent = '복사';
            btn.classList.remove('copied');
          }, 1600);
        };
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(done);
        } else {
          // http://localhost 외 비보안 컨텍스트 대비
          var ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); done(); } catch (e) { /* 무시 */ }
          document.body.removeChild(ta);
        }
      });

      wrap.appendChild(btn);
    });
  }

  /* ---------- 3. "새 글 쓰기" 링크에 오늘 날짜 + 템플릿 채우기 ---------- */
  function setupNewPost() {
    var a = document.getElementById('new-post');
    if (!a) return;

    var repo = a.dataset.repo, branch = a.dataset.branch || 'main';
    var d = new Date();
    var p = function (n) { return String(n).padStart(2, '0'); };
    var ymd = d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
    var hm  = p(d.getHours()) + ':' + p(d.getMinutes());

    // slug 는 GitHub 편집기에서 고쳐 쓰지만, 안 고치고 커밋해도 주소가
    // /posts/ 로 깨지지 않도록 기본값을 넣어둡니다. (실제로 그런 일이 있었음)
    var filename = '_posts/' + ymd + '-new-post.md';

    // 시각을 '지금'으로 넣습니다. 미래 날짜면 Jekyll 이 글을 건너뛰기 때문입니다.
    var template = [
      '---',
      'layout: post',
      'title: "제목"',
      'date: ' + ymd + ' ' + hm + ':00 +0900',
      'categories: [기술, Snowflake]',
      'tags: [태그1, 태그2]',
      'summary: "목록에 보일 한 줄 요약"',
      '---',
      '',
      '여기부터 본문.',
      '',
      '## 소제목',
      '',
      '내용을 씁니다.',
      ''
    ].join('\n');

    a.href = 'https://github.com/' + repo + '/new/' + branch +
             '?filename=' + encodeURIComponent(filename) +
             '&value=' + encodeURIComponent(template);
  }

  function init() { buildToc(); addCopyButtons(); setupNewPost(); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
