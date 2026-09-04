# 개인 기술 블로그 + 포트폴리오

Jekyll + GitHub Pages 로 만든 정적 블로그입니다.
GitHub 에 `push` 하면 자동으로 빌드·배포됩니다.

---

## 1. GitHub 에 올리기 (최초 1회)

### 1-1. GitHub 에서 저장소 만들기

1. https://github.com/new 접속
2. **Repository name** 에 `본인아이디.github.io` 입력
   - 예: 아이디가 `byungil` 이면 → `byungil.github.io`
   - 이 이름으로 만들면 주소가 `https://byungil.github.io` 가 됩니다
3. **Public** 선택
4. README / .gitignore / license 는 **체크하지 않음** (이미 있음)
5. **Create repository** 클릭

### 1-2. 로컬에서 push

```bash
cd C:/업무/blog

git init
git add .
git commit -m "블로그 첫 배포"
git branch -M main
git remote add origin https://github.com/본인아이디/본인아이디.github.io.git
git push -u origin main
```

> 처음 push 할 때 로그인 창이 뜨면 GitHub 계정으로 로그인하면 됩니다.

### 1-3. Pages 켜기

1. 저장소 → **Settings** → 왼쪽 메뉴 **Pages**
2. **Source** 를 `Deploy from a branch` 로
3. **Branch** 를 `main` / `/ (root)` 로 지정 후 **Save**
4. 1~2분 뒤 `https://본인아이디.github.io` 접속

---

## 2. 설정 바꾸기

`_config.yml` 파일 상단만 고치면 사이트 전체에 반영됩니다.

```yaml
title: "블로그 이름"
url: "https://본인아이디.github.io"   # ← 반드시 본인 아이디로
social:
  github: "본인아이디"
```

> `_config.yml` 을 수정하면 로컬 서버는 **재시작**해야 반영됩니다.

---

## 3. 새 글 쓰기

`_posts/` 폴더에 `YYYY-MM-DD-제목.md` 형식으로 파일을 만듭니다.

```markdown
---
layout: post
title: "글 제목"
date: 2026-09-10 09:00:00 +0900
categories: [Snowflake]
tags: [SQL, 데이터]
summary: "목록에 보일 한 줄 요약"
---

여기부터 본문을 Markdown 으로 씁니다.
```

저장하고 push 하면 끝입니다.

```bash
git add .
git commit -m "새 글 추가"
git push
```

---

## 4. 포트폴리오 수정

`_data/projects.yml` 파일에 항목을 추가/수정하면
`/portfolio/` 페이지와 홈 화면에 자동 반영됩니다.

```yaml
- name: "프로젝트 이름"
  period: "2026.01 – 2026.06"
  role: "담당 역할"
  description: >-
    프로젝트 설명
  highlights:
    - "성과 1"
    - "성과 2"
  stack: ["Snowflake", "Python"]
  link: "https://github.com/..."
```

---

## 5. (선택) 로컬에서 미리보기

push 없이 컴퓨터에서 바로 확인하고 싶을 때만 필요합니다.
**Ruby 설치가 필요합니다.**

1. https://rubyinstaller.org/downloads/ 에서
   `Ruby+Devkit 3.x (x64)` 설치 → 설치 마지막 단계 옵션은 기본값으로 진행
2. 터미널을 새로 열고:

```bash
cd C:/업무/blog
gem install bundler
bundle install
bundle exec jekyll serve --livereload
```

3. 브라우저에서 http://localhost:4000 접속

파일을 저장하면 자동으로 새로고침됩니다. (`_config.yml` 제외)

---

## 폴더 구조

```
blog/
├── _config.yml          사이트 설정 ★ 여기부터 수정
├── _posts/              블로그 글 (YYYY-MM-DD-제목.md)
├── _data/projects.yml   포트폴리오 항목
├── _layouts/            페이지 뼈대 (default / page / post)
├── _includes/           머리말·꼬리말 등 조각
├── assets/css/main.css  디자인 ★ 색상은 파일 맨 위 :root 에서
├── assets/img/          이미지 넣는 곳
├── index.html           홈
├── blog.html            글 목록
├── portfolio.html       포트폴리오
├── about.md             소개
└── 404.html
```
