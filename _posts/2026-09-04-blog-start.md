---
layout: post
title: "블로그를 시작하며 — 글 쓰는 방법 정리"
date: 2026-09-04 10:00:00 +0900
categories: [기술, Jekyll]
tags: [Jekyll, GitHub Pages, 블로그]
summary: "Jekyll + GitHub Pages 로 블로그를 열었습니다. 앞으로 글을 어떻게 추가하면 되는지 정리해둡니다."
---

Jekyll 과 GitHub Pages 로 블로그를 열었습니다.
앞으로 글을 어떻게 추가하는지 잊지 않으려고 사용법부터 정리해둡니다.

## 새 글 쓰는 법 (3단계)

### 1. `_posts/` 폴더에 파일 만들기

파일 이름은 **반드시** `YYYY-MM-DD-제목.md` 형식이어야 합니다.
날짜가 없거나 형식이 틀리면 Jekyll 이 글로 인식하지 않습니다.

```
_posts/2026-09-10-snowflake-cost-tuning.md
```

파일 이름의 `제목` 부분이 그대로 주소가 됩니다.
한글보다는 영어 소문자와 하이픈을 쓰는 편이 주소가 깔끔합니다.

### 2. 맨 위에 Front Matter 넣기

파일 최상단에 `---` 로 감싼 블록을 넣습니다. 이게 글의 메타데이터입니다.

```yaml
---
layout: post
title: "Snowflake 쿼리 비용 줄이기"
date: 2026-09-10 09:00:00 +0900
categories: [Snowflake]
tags: [비용최적화, SQL]
summary: "목록에 보일 한 줄 요약"
---
```

| 항목 | 설명 |
|---|---|
| `title` | 글 제목. 콜론(`:`)이 들어가면 따옴표로 감싸주세요 |
| `date` | 작성 시각. 미래 날짜면 사이트에 안 보입니다 |
| `categories` | 큰 분류. 목록 페이지에서 묶입니다 |
| `tags` | 세부 키워드. 여러 개 가능 |
| `summary` | 카드/목록에 보일 요약. 생략하면 본문 앞부분이 쓰입니다 |

### 3. 본문 쓰고 push

Front Matter 아래부터는 그냥 Markdown 으로 쓰면 됩니다.

```bash
git add .
git commit -m "새 글: Snowflake 쿼리 비용 줄이기"
git push
```

push 하고 **1~2분** 기다리면 사이트에 반영됩니다.

## 자주 쓰는 Markdown

### 코드 블록

언어 이름을 붙이면 문법 강조가 됩니다.

```sql
select
    warehouse_name,
    sum(credits_used) as credits
from snowflake.account_usage.warehouse_metering_history
where start_time >= dateadd(day, -30, current_timestamp())
group by 1
order by 2 desc;
```

### 인용

> 인용문은 이렇게 표시됩니다.
> 중요한 문장을 강조할 때 쓰기 좋습니다.

### 이미지

이미지는 `assets/img/` 폴더에 넣고 이렇게 참조합니다.

```markdown
![설명](/assets/img/screenshot.png)
```

### 표

```markdown
| 항목 | 값 |
|---|---|
| 처리량 | 1.2M rows |
```

## 앞으로 쓸 것들

- Snowflake 운영하면서 겪은 문제와 해결
- 데이터 파이프라인 설계 기록
- AI 를 실무에 붙여본 경험

꾸준히 남겨보겠습니다.
