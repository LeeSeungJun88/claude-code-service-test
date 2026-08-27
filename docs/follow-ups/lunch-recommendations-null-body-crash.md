# POST /api/lunch-recommendations에 JSON null 본문을 보내면 처리되지 않은 예외가 난다

**Symptom**: 요청 본문으로 유효한 JSON 값인 `null`을 보내면 사용자 친화적인
400 응답 대신 처리되지 않은 예외로 500 에러가 난다.

**Observed evidence**: `implement` 단계의 `code-review low` 패스에서 발견.
`app/api/lunch-recommendations/route.ts`의 `const { latitude, longitude } = body;`
줄에서, `request.json()`이 `null`을 성공적으로 파싱해 앞의 try/catch를
통과한 뒤 `body`가 `null`인 채로 구조분해할당되면서 TypeError가 던져진다.
실제 클라이언트(`components/lunch-recommendation/lunch-recommendation-section.tsx`)는
항상 `{ latitude, longitude }` 형태의 유효한 객체를 보내므로 정상 사용
경로에서는 재현되지 않는다.

**Suspected cause**: `(await request.json()) as RequestBody`가 타입 단언일
뿐 런타임 검증이 아니어서, 파싱 결과가 객체가 아닌 값(`null`, 배열, 문자열
등)이어도 그대로 통과된다.

**What was tried**: 스펙의 수용 기준과 무관하고 정상 사용 경로에서 발생하지
않는 엣지케이스라 이번 범위에서는 고치지 않았다.

**Proposed next step**: `latitude`/`longitude`를 구조분해하기 전에
`typeof body === "object" && body !== null` 가드를 추가하거나, 검증 로직을
`body` 자체의 null/타입 체크까지 포함하도록 넓힌다.
