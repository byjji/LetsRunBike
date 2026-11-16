// Countries, cities and what appears in each city. Pure data: no drawing code here.
// Prop names → three/props.js, landmark ids → three/landmarks/*, ambient kinds → three/ambient.js.

export const COUNTRIES = [
  { id: 'kr', name: '한국', flag: '🇰🇷' },
  { id: 'jp', name: '일본', flag: '🇯🇵' },
  { id: 'us', name: '미국', flag: '🇺🇸' },
];

const AT = [0.2, 0.4, 0.6, 0.85];
// landmark beside the road: side -1 = left, 1 = right, offset = distance from the road edge, h = height on screen
const beside = (id, name, side, offset, h, features, extra = {}) => ({ id, name, side, offset, h, through: false, span: 0, features, ...extra });
// landmark the road passes through / over
const through = (id, name, span, features, extra = {}) => ({ id, name, side: 0, offset: 0, h: 0, through: true, span, features, ...extra });
const city = (c) => ({ lanes: 0, ...c, landmarks: c.landmarks.map((l, i) => ({ ...l, at: AT[i] })) });

const WIND = { type: 'wind' }, CROWD = { type: 'crowd' };
const birds = (kind) => ({ type: 'birds', kind });
const mover = (kind, lateral, speed, period, extra = {}) => ({ type: 'mover', kind, lateral, speed, period, ...extra });
const particles = (kind) => ({ type: 'particles', kind });
const floater = (kind, extra = {}) => ({ type: 'floater', kind, ...extra });
const BUTTERFLIES = { type: 'butterflies' };

export const CITIES = [
  // ------------------------------------------------------------------ 한국
  city({
    id: 'seoul', country: 'kr', name: '서울', tune: 0, hero: 'seoul_ntower',
    sky: ['#58b8ff', '#d8f1ff'], fog: '#d8f1ff', ground: ['#93d36a', '#89cb60'], road: ['#b9bcc6', '#b0b3be'], edge: ['#ffffff', '#ffd23f'],
    sides: { left: 'land', right: 'land' },
    landmarks: [
      through('seoul_gwanghwamun', '광화문', 6, ['흰 화강암 육축에 무지개문 3개(가운데가 큼)', '그 위 2층 기와 문루', '붉은 기둥과 녹색 단청', '양옆 낮은 돌담']),
      beside('seoul_geunjeongjeon', '경복궁', -1, 22, 20, ['2단 돌 월대와 난간', '2층 팔작 기와지붕, 처마 끝이 올라감', '붉은 기둥', '녹색 단청 띠']),
      beside('seoul_ntower', '남산 서울타워', 1, 34, 44, ['녹색 산 위', '흰 콘크리트 기둥', '위쪽 여러 단 원통 전망대', '붉은·흰 줄무늬 안테나']),
      through('seoul_hangangbridge', '한강 다리', 80, ['길 양옆으로 이어지는 아치 트러스', '회색 교각', '아래 파란 강물'], { bridge: true }),
    ],
    backdrop: [{ id: 'bg_namsan', bearing: 35, dist: 520 }, { id: 'bg_lottetower', bearing: -40, dist: 560 }],
    roadside: [
      { n: ['ginkgo', 'ginkgo', 'tree'], p: 0.14, min: 2.2, max: 9 },
      { n: ['hanok', 'wall_kr'], p: 0.05, min: 9, max: 20 },
      { n: ['office', 'apt', 'office'], p: 0.06, min: 20, max: 60 },
      { n: ['lamp'], p: 0.04, min: 1.4, max: 1.8 },
      { n: ['bush', 'flowers'], p: 0.1, min: 1.5, max: 7 },
    ],
    ambient: [WIND, CROWD, birds('pigeon'), BUTTERFLIES, mover('subway', -16, 26, 14, { elevated: true }), mover('cruise', 30, 6, 30, { onlyThrough: 'seoul_hangangbridge' }), particles('leaf')],
  }),
  city({
    id: 'busan', country: 'kr', name: '부산', tune: 1, hero: 'busan_gwanganbridge',
    sky: ['#3fb2ff', '#dff6ff'], fog: '#dff6ff', ground: ['#ffe6a8', '#fbdd98'], road: ['#c9c2b4', '#c0b9ab'], edge: ['#ffffff', '#59c3ff'],
    sides: { left: 'water', right: 'sand' },
    landmarks: [
      beside('busan_haeundae', '해운대', 1, 30, 40, ['모래사장 뒤 유리 고층 건물 무리', '가장 높은 3동은 곡면', '파란 유리와 흰 테두리']),
      beside('busan_gamcheon', '감천문화마을', 1, 26, 20, ['언덕에 계단식으로 붙은 상자 집', '알록달록 파스텔 벽', '납작한 지붕', '좁은 계단길']),
      beside('busan_tower', '부산타워', 1, 24, 40, ['흰 원기둥', '위쪽 팔각 정자 모양 전망대', '꼭대기 뾰족한 침', '아래 공원 언덕']),
      through('busan_gwanganbridge', '광안대교', 80, ['2층 트러스 상판', '주탑 2개', '늘어진 현수 케이블', '아래 바다'], { bridge: true }),
    ],
    backdrop: [{ id: 'bg_seahorizon', bearing: -70, dist: 500 }, { id: 'bg_hills', bearing: 60, dist: 520 }],
    roadside: [
      { n: ['palm'], p: 0.08, min: 2.2, max: 5, side: 1 },
      { n: ['parasol', 'parasol', 'rock'], p: 0.1, min: 2, max: 5.5, side: -1 },
      { n: ['house_color'], p: 0.07, min: 9, max: 30, side: 1 },
      { n: ['apt', 'office'], p: 0.04, min: 26, max: 60, side: 1 },
      { n: ['lamp'], p: 0.04, min: 1.4, max: 1.8 },
    ],
    ambient: [WIND, CROWD, birds('gull'), mover('boat', -40, 5, 16), mover('ferry', -70, 4, 40), mover('gondola', -22, 5, 12, { y: 14 }), floater('waves')],
  }),
  city({
    id: 'suwon', country: 'kr', name: '수원', tune: 3, hero: 'suwon_janganmun',
    sky: ['#62c0ff', '#e2f5ff'], fog: '#e2f5ff', ground: ['#8fd067', '#86c85e'], road: ['#d8c9a8', '#cfc09e'], edge: ['#f6efe0', '#a8703f'],
    sides: { left: 'land', right: 'land' },
    landmarks: [
      through('suwon_janganmun', '장안문', 6, ['돌 육축에 무지개문 1개', '2층 기와 문루', '앞쪽 반원 옹성', '성벽 위 여장']),
      beside('suwon_gongsimdon', '서북공심돈', -1, 16, 22, ['성곽 위 3층 벽돌 망루', '벽에 뚫린 총안 구멍', '기와지붕', '양옆으로 이어지는 성곽과 여장']),
      beside('suwon_hwahongmun', '화홍문', 1, 16, 14, ['무지개 수문 7개', '그 위 기와 누각', '아래로 흐르는 개울']),
      beside('suwon_haenggung', '화성행궁', -1, 20, 14, ['낮고 넓은 기와 전각', '붉은 정문(신풍루) 2층 누각', '돌담', '앞마당 느티나무']),
    ],
    backdrop: [{ id: 'bg_paldalsan', bearing: -30, dist: 480 }],
    roadside: [
      { n: ['pine', 'pine', 'tree'], p: 0.14, min: 2.4, max: 22 },
      { n: ['banner'], p: 0.07, min: 1.4, max: 2 },
      { n: ['hanok', 'wall_kr'], p: 0.05, min: 8, max: 20 },
      { n: ['grass', 'flowers'], p: 0.12, min: 1.2, max: 9 },
    ],
    ambient: [WIND, CROWD, birds('magpie'), BUTTERFLIES, floater('balloon', { lateral: 40, y: 45 }), particles('petal')],
  }),
  city({
    id: 'ulsan', country: 'kr', name: '울산', tune: 1, hero: 'ulsan_ganjeolgot',
    sky: ['#49b6ff', '#e0f7ff'], fog: '#e0f7ff', ground: ['#9bd66f', '#92ce66'], road: ['#c6c2ba', '#bdb9b1'], edge: ['#ffffff', '#3aa0e8'],
    sides: { left: 'land', right: 'water' },
    landmarks: [
      beside('ulsan_bamboo', '태화강 십리대숲', -1, 14, 16, ['빽빽한 대나무 숲', '마디 있는 녹색 줄기', '숲 사이 흙길', '낮은 대나무 울타리']),
      beside('ulsan_bridge', '울산대교', 1, 50, 36, ['흰 주탑 2개', '주탑 사이를 한 번에 건너는 현수교', '가는 케이블', '아래 바다']),
      beside('ulsan_daewangam', '대왕암', 1, 26, 12, ['누런 바위섬 무리', '바위를 잇는 출렁다리', '바위 위 소나무']),
      beside('ulsan_ganjeolgot', '간절곶 등대', 1, 14, 22, ['흰 등대', '기와지붕 모양 전망부', '옆에 큰 소망 우체통', '바닷가 언덕']),
    ],
    backdrop: [{ id: 'bg_shipyard', bearing: 55, dist: 520 }, { id: 'bg_seahorizon', bearing: 80, dist: 500 }],
    roadside: [
      { n: ['bamboo', 'bamboo', 'tree'], p: 0.2, min: 2.2, max: 24, side: -1 },
      { n: ['rock', 'pine'], p: 0.1, min: 2, max: 5.5, side: 1 },
      { n: ['grass', 'flowers'], p: 0.1, min: 1.2, max: 5 },
      { n: ['lamp'], p: 0.03, min: 1.4, max: 1.8 },
    ],
    ambient: [WIND, CROWD, birds('gull'), floater('whale', { lateral: 38 }), mover('boat', 60, 5, 20), mover('ferry', 90, 4, 45), floater('waves')],
  }),
  city({
    id: 'gyeongju', country: 'kr', name: '경주', tune: 0, hero: 'gyeongju_cheomseongdae',
    sky: ['#6cc4ff', '#e6f6ff'], fog: '#e6f6ff', ground: ['#a2d86c', '#99d063'], road: ['#e3d2ac', '#dac9a2'], edge: ['#f8f0dc', '#b98a4e'],
    sides: { left: 'land', right: 'land' },
    landmarks: [
      beside('gyeongju_daereungwon', '대릉원', -1, 26, 16, ['둥글고 큰 잔디 고분 여러 개', '두 봉우리가 붙은 쌍분', '고분 사이 소나무']),
      beside('gyeongju_cheomseongdae', '첨성대', 1, 12, 16, ['병 모양으로 휘어진 돌탑', '가운데 네모 창', '꼭대기 井자 돌', '네모난 기단']),
      beside('gyeongju_wolji', '동궁과 월지', -1, 22, 12, ['연못가 기와 누각 3채', '돌 축대', '잔잔한 연못', '연못 속 작은 섬']),
      beside('gyeongju_bulguksa', '불국사', 1, 22, 18, ['높은 돌 축대', '청운교·백운교 돌계단', '모양이 다른 두 탑(다보탑·석가탑)', '기와 문루']),
    ],
    backdrop: [{ id: 'bg_hills', bearing: -45, dist: 480 }, { id: 'bg_hills', bearing: 50, dist: 520 }],
    roadside: [
      { n: ['canola', 'canola', 'flowers'], p: 0.22, min: 1.2, max: 14 },
      { n: ['pine', 'tree'], p: 0.08, min: 3, max: 26 },
      { n: ['wall_kr', 'hanok'], p: 0.05, min: 8, max: 20 },
      { n: ['mound'], p: 0.02, min: 22, max: 50 },
    ],
    ambient: [WIND, CROWD, BUTTERFLIES, birds('magpie'), particles('petal'), floater('kiteflyer', { lateral: -14 })],
  }),

  // ------------------------------------------------------------------ 일본
  city({
    id: 'tokyo', country: 'jp', name: '도쿄', tune: 3, hero: 'tokyo_tower',
    sky: ['#5fbcff', '#e4f4ff'], fog: '#e4f4ff', ground: ['#b9d9a0', '#b0d197'], road: ['#aeb2bd', '#a5a9b5'], edge: ['#ffffff', '#ff8fb1'],
    sides: { left: 'land', right: 'land' }, lanes: 1,
    landmarks: [
      through('tokyo_kaminarimon', '가미나리몬', 6, ['붉은 기둥의 문', '가운데 매달린 큰 붉은 등', '회색 기와지붕', '양옆 칸막이 방']),
      beside('tokyo_tower', '도쿄타워', -1, 26, 46, ['붉은색·흰색 띠', '아래로 벌어진 4다리 격자', '2단 전망대', '꼭대기 안테나']),
      beside('tokyo_rainbowbridge', '레인보우브리지', 1, 60, 28, ['흰 주탑 2개', '2층 상판 현수교', '늘어진 케이블', '아래 바다']),
      beside('tokyo_skytree', '도쿄 스카이트리', -1, 36, 60, ['가늘고 긴 은백색 격자 탑', '위쪽 전망대 2단', '밑은 삼각, 위는 원', '꼭대기 안테나']),
    ],
    backdrop: [{ id: 'bg_skyline', bearing: 30, dist: 520 }, { id: 'bg_skyline', bearing: -50, dist: 560 }],
    roadside: [
      { n: ['cherry', 'cherry', 'tree'], p: 0.14, min: 2.2, max: 9 },
      { n: ['shop_jp', 'machiya'], p: 0.08, min: 8, max: 18 },
      { n: ['office', 'office', 'apt'], p: 0.08, min: 20, max: 60 },
      { n: ['lamp'], p: 0.04, min: 1.4, max: 1.8 },
    ],
    ambient: [WIND, CROWD, birds('pigeon'), particles('petal'), mover('shinkansen', 18, 45, 12, { elevated: true }), mover('subway', -15, 24, 17, { elevated: true })],
  }),
  city({
    id: 'kyoto', country: 'jp', name: '교토', tune: 0, hero: 'kyoto_kinkakuji',
    sky: ['#70c2ff', '#ffeeda'], fog: '#ffeeda', ground: ['#a8cf78', '#9fc76f'], road: ['#d9cdb6', '#d0c4ac'], edge: ['#f4ead6', '#c0392b'],
    sides: { left: 'land', right: 'land' },
    landmarks: [
      through('kyoto_fushimiinari', '후시미 이나리 신사', 40, ['촘촘히 이어진 주홍 도리이', '검은 밑동', '위쪽 검은 가로대', '터널처럼 길을 덮음']),
      beside('kyoto_yasaka', '야사카의 탑', -1, 14, 30, ['5층 목탑', '층마다 넓은 처마', '어두운 나무색', '꼭대기 금속 상륜']),
      beside('kyoto_kiyomizu', '기요미즈데라', 1, 24, 22, ['절벽 위 나무 기둥 격자 무대', '크고 완만한 히와다 지붕', '붉은 3층탑이 옆에', '아래 단풍 숲']),
      beside('kyoto_kinkakuji', '금각사', -1, 22, 16, ['연못 위 3층 누각', '위 2층이 금색', '지붕 꼭대기 금 봉황', '1층은 흰 벽과 나무']),
    ],
    backdrop: [{ id: 'bg_maplehills', bearing: -40, dist: 460 }, { id: 'bg_maplehills', bearing: 45, dist: 500 }],
    roadside: [
      { n: ['maple', 'maple', 'bamboo', 'pine'], p: 0.2, min: 2.2, max: 24 },
      { n: ['stonelantern'], p: 0.06, min: 1.4, max: 2.4 },
      { n: ['machiya'], p: 0.07, min: 8, max: 18 },
      { n: ['bush', 'grass'], p: 0.1, min: 1.4, max: 7 },
    ],
    ambient: [WIND, CROWD, BUTTERFLIES, birds('magpie'), particles('leaf'), floater('koi', { lateral: -9 })],
  }),
  city({
    id: 'osaka', country: 'jp', name: '오사카', tune: 3, hero: 'osaka_castle',
    sky: ['#55b9ff', '#e2f4ff'], fog: '#e2f4ff', ground: ['#a9d68a', '#a0ce81'], road: ['#b3b6c0', '#aaadb8'], edge: ['#ffffff', '#ffa24d'],
    sides: { left: 'land', right: 'land' }, lanes: 1,
    landmarks: [
      beside('osaka_castle', '오사카성', -1, 26, 34, ['높은 돌 축대', '흰 벽과 청록 지붕의 5층 천수', '금색 장식', '층마다 삼각 박공']),
      beside('osaka_tsutenkaku', '쓰텐카쿠', 1, 18, 36, ['철골 탑', '위쪽 네모난 전망대 2단', '다리 사이로 길이 지나는 밑동', '색 판 장식(글자 없음)']),
      beside('osaka_dotonbori', '도톤보리', -1, 18, 18, ['운하 양옆 건물 벽', '알록달록 큰 색 간판(글자·로고 없음)', '운하를 건너는 다리', '운하 위 배']),
      beside('osaka_ferriswheel', '덴포잔 대관람차', 1, 30, 40, ['아주 큰 원형 바퀴', '색색 곤돌라', '흰 바큇살', '삼각 받침 다리']),
    ],
    backdrop: [{ id: 'bg_skyline', bearing: 40, dist: 540 }],
    roadside: [
      { n: ['shop_jp', 'shop_jp', 'machiya'], p: 0.1, min: 8, max: 18 },
      { n: ['office', 'apt'], p: 0.07, min: 20, max: 60 },
      { n: ['tree', 'cherry'], p: 0.12, min: 2.2, max: 8 },
      { n: ['lamp'], p: 0.04, min: 1.4, max: 1.8 },
    ],
    ambient: [WIND, CROWD, birds('pigeon'), mover('subway', 16, 24, 13, { elevated: true }), mover('taxi', -8.5, 9, 9), particles('petal')],
  }),
  city({
    id: 'sapporo', country: 'jp', name: '삿포로', tune: 2, hero: 'sapporo_clocktower',
    sky: ['#86c8f5', '#f2f9ff'], fog: '#f2f9ff', ground: ['#f6fbff', '#eaf3fb'], road: ['#c4cbd6', '#bbc2ce'], edge: ['#ffffff', '#7fb8e8'],
    sides: { left: 'snow', right: 'snow' },
    landmarks: [
      beside('sapporo_clocktower', '삿포로 시계탑', -1, 12, 16, ['흰 판자벽 목조 건물', '붉은 지붕', '네모난 시계탑과 큰 시계', '꼭대기 붉은 별']),
      beside('sapporo_tvtower', '삿포로 TV타워', 1, 22, 40, ['붉은 철골 탑', '중간의 큰 전광 시계 자리', '녹색 전망대', '아래 공원과 분수']),
      beside('sapporo_redbrick', '홋카이도청 구 본청사', -1, 22, 20, ['붉은 벽돌 좌우대칭 건물', '가운데 녹색 팔각 돔', '흰 창틀이 줄지음', '슬레이트 지붕']),
      beside('sapporo_skijump', '오쿠라야마 스키점프대', 1, 40, 36, ['산비탈의 길고 흰 점프대', '아래 넓은 착지 경사', '꼭대기 출발 탑', '양옆 침엽수']),
    ],
    backdrop: [{ id: 'bg_snowmountain', bearing: 35, dist: 480 }, { id: 'bg_snowmountain', bearing: -50, dist: 520 }],
    roadside: [
      { n: ['birch', 'pine_snow', 'pine_snow'], p: 0.18, min: 2.4, max: 26 },
      { n: ['snowman'], p: 0.05, min: 1.6, max: 5 },
      { n: ['house_snow'], p: 0.06, min: 9, max: 22 },
      { n: ['lamp'], p: 0.04, min: 1.4, max: 1.8 },
    ],
    ambient: [WIND, CROWD, birds('magpie'), particles('snow'), mover('tram', -8.5, 8, 12), floater('skijumper')],
  }),
  city({
    id: 'shizuoka', country: 'jp', name: '시즈오카', tune: 1, hero: 'shizuoka_teafield',
    sky: ['#52b7ff', '#e6f7ff'], fog: '#e6f7ff', ground: ['#8fcf63', '#86c75a'], road: ['#cfc8b8', '#c6bfae'], edge: ['#ffffff', '#3d9b4f'],
    sides: { left: 'land', right: 'water' },
    landmarks: [
      beside('shizuoka_teafield', '녹차밭', -1, 20, 12, ['둥근 이랑이 줄지은 차밭', '완만한 언덕', '짙은 녹색 줄무늬', '바람개비 달린 기둥']),
      beside('shizuoka_miho', '미호노마쓰바라', 1, 12, 12, ['검은 모래 해변', '구불구불 굽은 소나무 숲', '바다 물결']),
      beside('shizuoka_sunpu', '슨푸성', -1, 20, 16, ['해자와 돌 축대', '흰 벽의 2층 망루', '회색 기와', '나무 다리와 문']),
      through('shizuoka_shinkansen', '신칸센 고가', 6, ['길 위를 가로지르는 콘크리트 고가', '굵은 교각', '위로 지나가는 흰·파란 신칸센']),
    ],
    backdrop: [{ id: 'bg_fuji', bearing: -12, dist: 520 }],
    roadside: [
      { n: ['tearow', 'tearow', 'tree'], p: 0.2, min: 2.4, max: 26, side: -1 },
      { n: ['pine', 'rock'], p: 0.12, min: 2.2, max: 5.5, side: 1 },
      { n: ['machiya'], p: 0.03, min: 10, max: 24, side: -1 },
      { n: ['grass', 'flowers'], p: 0.1, min: 1.2, max: 5 },
    ],
    ambient: [WIND, CROWD, birds('kite'), BUTTERFLIES, mover('shinkansen', -34, 48, 11, { elevated: true }), mover('boat', 50, 5, 22), floater('waves')],
  }),

  // ------------------------------------------------------------------ 미국
  city({
    id: 'newyork', country: 'us', name: '뉴욕', tune: 3, hero: 'newyork_liberty',
    sky: ['#57b6ff', '#e0f2ff'], fog: '#e0f2ff', ground: ['#9fcf82', '#96c779'], road: ['#9fa3ad', '#969aa5'], edge: ['#ffffff', '#ffd23f'],
    sides: { left: 'land', right: 'land' }, lanes: 1,
    landmarks: [
      beside('newyork_liberty', '자유의 여신상', 1, 30, 40, ['청록색 여신', '별 모양 기단 위 돌 받침대', '뿔 7개 왕관', '치켜든 금색 횃불과 왼팔의 판']),
      through('newyork_brooklynbridge', '브루클린 브리지', 80, ['돌 주탑 2개', '주탑마다 뾰족 아치 2개', '부채꼴로 퍼진 케이블', '아래 강물'], { bridge: true }),
      beside('newyork_empirestate', '엠파이어 스테이트 빌딩', -1, 26, 56, ['단계적으로 좁아지는 석조 탑', '세로 줄 창', '꼭대기 둥근 첨탑과 안테나']),
      beside('newyork_timessquare', '타임스스퀘어', 1, 16, 26, ['색 전광판이 붙은 건물들(글자·로고 없음)', '모서리가 뾰족한 삼각 건물', '붉은 계단', '앞쪽 가로수']),
    ],
    backdrop: [{ id: 'bg_manhattan', bearing: -35, dist: 540 }, { id: 'bg_manhattan', bearing: 45, dist: 580 }],
    roadside: [
      { n: ['brownstone', 'brownstone'], p: 0.09, min: 8, max: 16 },
      { n: ['skyscraper', 'office'], p: 0.08, min: 20, max: 60 },
      { n: ['tree'], p: 0.12, min: 2.2, max: 7 },
      { n: ['hydrant', 'lamp'], p: 0.05, min: 1.4, max: 1.8 },
    ],
    ambient: [WIND, CROWD, birds('pigeon'), mover('taxi', -8.5, 10, 6), mover('ferry', 34, 5, 30, { onlyThrough: 'newyork_brooklynbridge' }), particles('leaf')],
  }),
  city({
    id: 'sanfrancisco', country: 'us', name: '샌프란시스코', tune: 1, hero: 'sanfrancisco_goldengate',
    sky: ['#4db3ff', '#e9f6ff'], fog: '#e9f6ff', ground: ['#a8d47a', '#9fcc71'], road: ['#aaadb6', '#a1a4ae'], edge: ['#ffffff', '#f05a28'],
    sides: { left: 'land', right: 'water' },
    landmarks: [
      beside('sanfrancisco_paintedladies', '페인티드 레이디스', -1, 14, 14, ['나란한 빅토리아풍 집 6채', '집마다 다른 파스텔 색', '뾰족 박공지붕과 돌출창', '앞 계단']),
      beside('sanfrancisco_lombard', '롬바드 스트리트', -1, 20, 18, ['언덕을 내려오는 지그재그 길', '붉은 벽돌 포장', '굽이마다 꽃밭', '양옆 집']),
      beside('sanfrancisco_transamerica', '트랜스아메리카 피라미드', -1, 28, 52, ['흰색의 뾰족한 피라미드 빌딩', '위쪽 양옆 날개', '줄지은 창', '꼭대기 뾰족탑']),
      through('sanfrancisco_goldengate', '금문교', 80, ['인터내셔널 오렌지색', '주탑 2개에 가로대 4단', '늘어진 주 케이블과 세로 줄', '아래 바다'], { bridge: true }),
    ],
    backdrop: [{ id: 'bg_alcatraz', bearing: 50, dist: 420 }, { id: 'bg_hills', bearing: -50, dist: 520 }],
    roadside: [
      { n: ['victorian', 'victorian'], p: 0.08, min: 8, max: 20, side: -1 },
      { n: ['tree', 'cypress'], p: 0.14, min: 2.2, max: 24, side: -1 },
      { n: ['rock', 'grass'], p: 0.1, min: 2, max: 5.5, side: 1 },
      { n: ['lamp', 'hydrant'], p: 0.04, min: 1.4, max: 1.8 },
    ],
    ambient: [WIND, CROWD, birds('gull'), mover('cablecar', -8.5, 7, 10), floater('sealion', { lateral: 9 }), mover('boat', 60, 5, 24), floater('waves')],
  }),
];

export const cityById = (id) => CITIES.find((c) => c.id === id) || CITIES[0];
export const citiesOf = (countryId) => CITIES.filter((c) => c.country === countryId);

/** Length a through-landmark takes along the road; shortened on short courses. */
export const spanOf = (def, lengthUnits) => (def.through ? Math.max(6, Math.min(def.span, 0.14 * lengthUnits)) : 0);
