# LetsRunBike — 씽씽 밸런스바이크

롤러 위에서 밸런스바이크를 타는 아이가 TV 화면을 보며 실제 도시의 명소 사이를 달리는 캐주얼 3D 실내 연습 시뮬레이션.

## 실행

```bash
npm install
npm start
```

- 이 컴퓨터: http://localhost:3000
- 친구(같은 와이파이): 실행 창에 표시되는 `http://192.168.x.x:3000` 주소
- 포트 변경: `PORT=8080 npm start`
- 테스트: `npm test`
- 인터넷 없이도 동작 (three.js 는 `node_modules` 에서 로컬 제공)

## 기능

- **나라 → 도시 선택**: 나라를 고르면 실제 지도 윤곽이 나오고, 도시가 실제 위치에 대표 명소 그림으로 표시됨
  - 한국: 서울 · 부산 · 수원 · 울산 · 경주
  - 일본: 도쿄 · 교토 · 오사카 · 삿포로 · 시즈오카
  - 미국: 뉴욕 · 샌프란시스코
- **명소**: 도시마다 실제 명소 4개가 코스를 따라 차례로 나오고(일부는 문·다리·터널로 통과), 지날 때 이름을 알려 줌. 멀리 산·스카이라인·후지산 같은 배경
- **움직이는 배경**: 바람에 흔들리는 나무, 새·나비, 기차·전차·택시·배, 응원하는 사람들, 꽃잎·눈·낙엽, 고래·관람차·열기구 등
- **동물 친구(NPC)**: 0~5마리, 빠르기 3단계. 아이 속도에 맞춰 기다려 주거나 따라옴
- **친구 참가**: 방 만들기 → 방 번호 4자리(또는 `/?room=1234` 주소)로 다른 브라우저에서 입장. 아바타·순위·진행 막대 표시, 최대 6명
- **속도 입력** (부모님 설정)
  - 자동 속도: 센서 없이 정한 속도로 주행. 주행 중 `↑` `↓` 속도 조절, `Space` 멈춤/출발
  - 눌러서 달리기: 화면 또는 `Space` 를 누르는 동안 주행
  - 바퀴 센서: 블루투스 CSC 속도 센서(뒷바퀴 허브 장착)의 실제 속도. Chrome/Edge, `localhost` 또는 HTTPS 필요
- 별 모으기, 100m 응원, 완주 결과(시간·평균/최고 속도)

## 직접 만든 센서 연결

브라우저에서 아래 함수를 주기적으로 호출하면 "바퀴 센서" 모드의 속도로 사용됨 (2.5초 동안 호출이 없으면 정지로 처리).

```js
window.setBikeSpeed(5.2); // km/h
```

## 구조

| 파일 | 역할 |
| --- | --- |
| `server.js` | 정적 파일 + three.js 로컬 제공 + WebSocket 방 중계 |
| `public/js/main.js` | 화면 전환, 나라·도시 선택, HUD, 설정, 네트워크 연결 |
| `public/js/game.js` | 트랙 생성, 주행/NPC/순위 로직 |
| `public/js/cities.js` | 나라·도시 데이터: 색, 명소, 길가 소품, 움직이는 것 |
| `public/js/path.js` | 굽은 길의 3D 중심선 계산 |
| `public/js/maps.js` | 나라 지도 윤곽과 도시 위치 계산 |
| `public/js/layout.js` | 명소·소품·응원 인파 배치 (같은 방 친구끼리 동일) |
| `public/js/render.js` | 후방 쿼터뷰 3D 렌더러, 이름표, 도시 카드 그림 |
| `public/js/three/world.js` | 도시 한 곳의 3D 장면 조립 |
| `public/js/three/kit.js` · `parts.js` | 도형·건축 부품 도우미 |
| `public/js/three/props.js` | 길가 소품 (나무, 집, 건물…) |
| `public/js/three/ambient.js` | 움직이는 것들 |
| `public/js/three/riders.js` | 자전거 탄 동물 캐릭터, 별 |
| `public/js/three/landmarks/` | 명소 (`kr.js` `kr2.js` `jp.js` `us.js`) 와 불러오기 (`index.js`) |
| `public/js/sprites.js` | 캐릭터 목록, 메뉴용 얼굴 그림 |
| `public/js/input.js` | 속도 입력(자동/누르기/블루투스 센서) |
| `public/js/audio.js` | 배경 음악·효과음 |

## 명소를 3D 모델 파일로 바꾸기

명소는 기본적으로 코드로 조립된다. 더 닮은 모델이 있으면 파일로 교체할 수 있다.

1. glTF 바이너리(`.glb`) 파일을 `public/models/<도시>/<이름>.glb` 에 넣는다. 예: `public/models/seoul/ntower.glb`
2. `public/js/cities.js` 에서 그 명소에 `model` 값을 준다. 예: `beside('seoul_ntower', …, [...], { model: 'seoul/ntower.glb' })`
3. 길 옆 명소는 높이가 `h` 값에 맞게 자동 조절된다. 파일이 없거나 5초 안에 못 읽으면 코드 조립 명소가 그대로 쓰인다.

## 확인용 주소

`/?demo=<도시 id>&at=<0~1>` : 메뉴 없이 그 도시의 해당 지점 화면을 보여 준다. 예: `/?demo=kyoto&at=0.15`
