# 개인 기술 블로그 + 포트폴리오

Jekyll + GitHub Pages 로 만든 정적 블로그입니다.
GitHub 에 `push` 하면 자동으로 빌드·배포됩니다.

---

## 1. GitHub 에 올리기 (최초 1회)

### 1-1. GitHub 에서 저장소 만들기

1. https://github.com/new 접속
2. **Repository name** 에 정확히 `bone0825.github.io` 입력
   - 이 이름이어야 주소가 `https://bone0825.github.io` 가 됩니다
   - 오타가 있으면 Pages 가 동작하지 않습니다
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
git remote add origin https://github.com/bone0825/bone0825.github.io.git
git push -u origin main
```

> 처음 push 할 때 로그인 창이 뜨면 GitHub 계정으로 로그인하면 됩니다.

### 1-3. Pages 켜기

1. 저장소 → **Settings** → 왼쪽 메뉴 **Pages**
2. **Source** 를 `Deploy from a branch` 로
3. **Branch** 를 `main` / `/ (root)` 로 지정 후 **Save**
4. 1~2분 뒤 `https://bone0825.github.io` 접속

---

## 2. 설정 바꾸기

`_config.yml` 파일 상단만 고치면 사이트 전체에 반영됩니다.

```yaml
title: "블로그 이름"
url: "https://bone0825.github.io"
social:
  github: "bone0825"
```

> `_config.yml` 을 수정하면 로컬 서버는 **재시작**해야 반영됩니다.

---

## 3-A. 웹에서 글 쓰기 (터미널 없이) ★ 제일 편함

컴퓨터에 아무것도 설치돼 있지 않아도 됩니다. **폰에서도 됩니다.**

### 새 글

1. 블로그의 **[글] 메뉴** → **✏️ 새 글 쓰기** 버튼
2. GitHub 편집기가 열리고 **front matter 템플릿이 이미 채워져 있습니다**
   (날짜·시각은 버튼을 누른 시점으로 자동 입력)
3. ⚠️ **파일명 칸의 `new-post` 를 반드시 영문 slug 로 바꾸세요**
   → `_posts/2026-09-04-new-post.md` → `_posts/2026-09-04-snowflake-cost.md`
   - 이 이름이 그대로 주소가 됩니다 (`/posts/snowflake-cost/`)
   - **한 번 발행한 뒤에는 바꾸지 마세요.** 주소가 깨집니다
4. 본문 작성 → 아래 **Commit changes** 클릭
5. 1~2분 뒤 사이트에 반영

### 기존 글 수정

글을 열고 맨 아래 **✏️ 이 글 수정** 클릭 → 그 글 파일이 GitHub 편집기로 바로 열립니다.

### 여러 파일을 한 번에 고치려면

저장소 페이지에서 키보드 **`.`(마침표)** 를 누르면 `github.dev` 로 바뀌면서
브라우저에 VS Code 가 열립니다. 파일 트리·검색·다중 편집이 다 됩니다. 설치 불필요.

> 웹 편집의 한계: **결과 화면을 미리 못 봅니다.** Markdown 원문만 보이고,
> 커밋 후 1~2분 기다려야 실제 모습을 확인할 수 있습니다.
> 결과를 보면서 쓰고 싶으면 아래 5번(로컬 미리보기)을 쓰세요.

---

## 3. 새 글 쓰기 (로컬)

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
