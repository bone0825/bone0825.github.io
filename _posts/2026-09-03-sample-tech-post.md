---
layout: post
title: "Snowflake 웨어하우스 비용, 어디서 새는지 찾기"
date: 2026-09-03 14:00:00 +0900
categories: [Snowflake]
tags: [비용최적화, SQL, 데이터엔지니어링]
summary: "ACCOUNT_USAGE 뷰만 잘 봐도 크레딧이 어디서 소모되는지 대부분 파악됩니다. (이 글은 예시입니다 — 삭제하고 직접 써보세요)"
---

> 이 글은 레이아웃 확인용 **예시 글**입니다.
> 내용을 확인한 뒤 `_posts/2026-09-03-sample-tech-post.md` 파일을 삭제하세요.

크레딧 사용량이 갑자기 늘었을 때 가장 먼저 볼 곳은
`SNOWFLAKE.ACCOUNT_USAGE` 스키마입니다.

## 1. 웨어하우스별 소모량 확인

```sql
select
    warehouse_name,
    round(sum(credits_used), 1) as credits,
    count(*)                    as run_count
from snowflake.account_usage.warehouse_metering_history
where start_time >= dateadd(day, -30, current_timestamp())
group by warehouse_name
order by credits desc;
```

여기서 상위 1~2개 웨어하우스가 전체의 대부분을 차지하는 경우가 많습니다.
범인이 좁혀지면 그 웨어하우스만 파고들면 됩니다.

## 2. 비싼 쿼리 추려내기

```sql
select
    query_id,
    left(query_text, 80) as query_preview,
    user_name,
    warehouse_name,
    round(total_elapsed_time / 1000, 1) as elapsed_sec,
    bytes_scanned
from snowflake.account_usage.query_history
where start_time >= dateadd(day, -7, current_timestamp())
  and warehouse_name = 'ANALYTICS_WH'
order by total_elapsed_time desc
limit 20;
```

경험상 여기 걸리는 쿼리는 대체로 세 부류입니다.

| 유형 | 증상 | 조치 |
|---|---|---|
| 풀스캔 | `bytes_scanned` 가 유독 큼 | 클러스터링 키 / 파티션 조건 추가 |
| 반복 실행 | 같은 쿼리가 수백 번 | 결과 캐싱 또는 테이블화 |
| 과대 웨어하우스 | 짧은 쿼리에 큰 WH | 워크로드별 WH 분리 |

## 3. 자동 종료 설정 확인

의외로 여기서 새는 경우가 많습니다.

```sql
show warehouses;
-- auto_suspend 컬럼이 null 이거나 너무 크면 유휴 시간에도 크레딧이 소모됩니다
```

```sql
alter warehouse analytics_wh set auto_suspend = 60;
```

## 정리

- 큰 그림 → 웨어하우스별 크레딧
- 좁히기 → 쿼리별 실행 시간·스캔량
- 기본기 → `auto_suspend`, 워크로드 분리

대부분의 비용 문제는 이 세 단계에서 원인이 드러납니다.
