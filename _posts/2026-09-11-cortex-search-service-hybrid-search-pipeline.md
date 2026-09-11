---
layout: post
title: "Cortex Search Service — 하이브리드 검색 파이프라인의 구성 요소와 동작 원리"
date: 2026-09-11 15:30:00 +0900
categories: [기술, Snowflake]
tags: [Cortex Search, RAG, Embedding, Vector Search, BM25, Reranking, Cortex Agent]
summary: "Snowflake Cortex Search Service의 구조를 임베딩 → 벡터 검색(ANN) → 키워드 검색(BM25) → 리랭킹 → RAG 순서로 풀어 쓴 학습 보고서입니다. 비전공자도 읽을 수 있도록 각 기술을 별도 Deep Dive 장으로 분리하고, 제품 기능·모델 선택·비용·코드 해설을 뒤에 붙였습니다."
---

Cortex Search Service를 팀 내 비개발 직군에게 설명해야 할 일이 있어, 기술 문서를 **대학 신입생이 읽어도 막히지 않는 수준**으로 다시 썼습니다.
결과물은 다이어그램 30여 개가 포함된 독립 HTML 보고서라 블로그 본문에 그대로 옮기기엔 길어서, 파일을 따로 두고 이 글에서는 구성과 핵심만 정리합니다.

<p style="margin:20px 0;">
  <a href="/assets/reports/cortex-search-service-deep-dive.html" target="_blank" rel="noopener"
     style="display:inline-block;padding:12px 20px;border-radius:8px;background:#29B5E8;color:#fff;font-weight:700;text-decoration:none;">
    전체 보고서 열기 (새 탭) →
  </a>
</p>

## 보고서 구성

기술 원리를 먼저, 제품을 나중에 배치했습니다. Cortex Search가 "무엇을 자동화해 주는지"는 그 안에서 돌아가는 원리를 알아야 실감이 나기 때문입니다.

| Part | 장 | 내용 |
|---|---|---|
| 0 시작하기 전에 | 0 | 읽는 순서, 기본 용어 16개 (Row/컬럼, SQL, 토큰, 벡터, API/SDK/JSON, Warehouse/Credit 등) |
| I 기술 원리 Deep Dive | 1~7 | 검색의 두 방식 → Embedding → Vector Search & ANN → Keyword Search & BM25 → Hybrid Search → Semantic Reranking → RAG |
| II 제품 이해 | 8~15 | Overview, Architecture, Core Features, Embedding Models, Multi-Index, Use Cases, Cortex Agents, Cost Model |
| III 실습과 정리 | 16~18 | 코드 6개 한 줄씩 해설, 요약 + 용어 사전 45개, 더 깊이 탐구할 주제 6건 |

각 장은 **TL;DR(한 줄 요약) → "쉽게 말하면"(비유) → 상세 설명 → 용어 카드** 순서로 통일했습니다.

## 핵심 내용 요약

### 하이브리드 검색은 세 단계다

Cortex Search의 검색 한 번은 아래 세 단계가 자동으로 실행되는 것입니다.

1. **Vector Search** — 검색어를 임베딩 모델로 벡터로 바꾸고, ANN 인덱스에서 뜻이 가까운 문서를 찾습니다. "인터넷 장애"로 "네트워크 다운"을 찾아내는 쪽입니다.
2. **Keyword Search** — 역색인(Inverted Index)에서 검색어 단어가 실제로 등장하는 문서를 찾고 BM25로 점수를 매깁니다. 제품 코드나 고유명사처럼 글자가 정확히 맞아야 하는 쪽입니다.
3. **Semantic Reranking** — 두 결과를 합친 후보 수십 건을 Cross-Encoder가 검색어와 한 쌍으로 다시 읽고 최종 순위를 정합니다.

1·2는 각각 Recall과 Precision을 담당하고, 3이 둘의 결과를 정밀하게 다듬습니다. 이 구조를 사용자가 직접 조립하지 않아도 되는 것이 Cortex Search의 핵심 가치입니다.

### 비유로 잡은 개념들

보고서에서 각 기술에 붙인 비유입니다. 설명할 때 이 한 줄만 먼저 던지면 이후 설명이 훨씬 잘 붙었습니다.

| 기술 | 비유 |
|---|---|
| Embedding | 문장마다 "뜻의 지도" 좌표를 붙이는 일. 뜻이 비슷하면 좌표가 가깝다 |
| ANN | 전국 카페 거리를 다 계산하는 대신, 내 구역 근처만 뒤지는 것 |
| 역색인 / BM25 | 책 뒤 "찾아보기" + 어느 페이지가 더 관련 깊은지 점수 |
| Precision / Recall | 낚시 그물 — 잡은 것 중 원하는 물고기 비율 / 바다의 원하는 물고기 중 건진 비율 |
| Reranking | 서류 심사로 20명을 고른 뒤, 그 20명만 면접 |
| RAG | 기억만으로 보는 시험(LLM) vs 오픈북 시험(RAG) |
| Incremental Refresh | 사전을 다시 찍을 때 바뀐 페이지만 갈아 끼우기 |

### 운영에서 실제로 중요했던 것

- **임베딩 모델은 생성 후 변경 불가.** 한국어 데이터면 다국어 모델(`snowflake-arctic-embed-l-v2.0`)을 처음부터 골라야 합니다. 기본값(`m-v1.5`)은 영어 전용입니다.
- **청크는 512 토큰 이하.** 긴 컨텍스트 모델이 있어도 문단 단위로 잘라야 검색·RAG 품질이 좋습니다. `SPLIT_TEXT_RECURSIVE_CHARACTER`로 자릅니다.
- **Primary Key 설정 = 증분 임베딩.** 바뀐 Row만 재임베딩되므로 임베딩 토큰 비용이 크게 줄어듭니다.
- **Serving Compute는 검색이 없어도 과금.** `AUTO_SUSPEND`(최소 1,800초)를 켜두는 것이 가장 큰 절감 포인트입니다.
- 필터는 `ATTRIBUTES`로 지정한 컬럼만 가능하고, 순위 규칙은 `scoring_config`(가중치·Numeric Boost·Time Decay·Reranker 끄기)로 조정합니다.

### 원본 문서에서 정리한 부분

이전에 작성해 둔 기술 보고서를 재구성하면서 함께 손본 것들입니다.

- LLM 호출 함수명이 `SNOWFLAKE.CORTEX.COMPLETE`와 `AI_COMPLETE`로 혼용되어 있어 `AI_COMPLETE`로 통일 (구 이름도 동작함을 병기)
- Multi-Index 예시가 한국어 데이터인데 영어 전용 모델을 쓰고 있어 다국어 모델로 교체
- 비용 비율 도넛 차트(35/30/25/10%)는 공식 수치가 아니라 예시 값임을 명시
- 소제목 번호가 장 번호와 어긋나 있던 것(4.x, 10.x) 정리

## 본문 미리보기

아래는 보고서를 그대로 삽입한 것입니다. 다크 테마로 만들어져 있어 새 탭으로 여는 것이 읽기 편합니다.

<iframe src="/assets/reports/cortex-search-service-deep-dive.html"
        title="Snowflake Cortex Search Service - 처음부터 이해하는 Deep Dive"
        loading="lazy"
        style="width:100%;height:80vh;border:1px solid #d0d7de;border-radius:10px;background:#0f172a;"></iframe>

## 참고

- [Cortex Search Overview](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-search/cortex-search-overview)
- [Query a Cortex Search Service](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-search/query-cortex-search-service)
- [CREATE CORTEX SEARCH SERVICE](https://docs.snowflake.com/en/sql-reference/sql/create-cortex-search-service)
- [Use Cortex Search with Cortex Agents](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-search/cortex-search-agents)
- [Mar 12, 2026: Recent Cortex Search Updates (GA)](https://docs.snowflake.com/en/release-notes/2026/other/2026-03-12-recent-cortex-search)
