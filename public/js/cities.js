// Countries, cities and what appears in each city. Pure data: no drawing code here.
// geo = [latitude, longitude] of the real city; pin = where its picture sits on the map, relative to that point.
// thumb = optional picture-only model for the city card (otherwise the hero landmark is shown).
// far / deep = what fills the land beyond the roadside (near band / distant band).
// Prop names → three/props.js, landmark ids → three/landmarks/*, ambient kinds → three/ambient.js.

export const COUNTRIES = [
  { id: 'kr', name: '한국', flag: '🇰🇷' },
  { id: 'jp', name: '일본', flag: '🇯🇵' },
  { id: 'us', name: '미국', flag: '🇺🇸' },
];

const AT = [0.2, 0.4, 0.6, 0.85];   // where landmarks stand (0..1 of the course) unless an entry gives its own `at`
// landmark beside the road: side -1 = left, 1 = right, offset = distance from the road edge, h = height on screen
const beside = (id, name, side, offset, h, features, extra = {}) => ({ id, name, side, offset, h, through: false, span: 0, features, ...extra });
// landmark the road passes through / over
const through = (id, name, span, features, extra = {}) => ({ id, name, side: 0, offset: 0, h: 0, through: true, span, features, ...extra });
// small things scattered along every road so the ground never looks bare; chosen by the kind of ground
const FILL = { land: ['grass', 'grass', 'flowers', 'pebbles'], snow: ['snowpile', 'snowpile', 'pebbles'], sand: ['pebbles', 'shell', 'grass'], water: ['pebbles', 'grass'] };
// the land beyond the roadside: `far` fills 24–75 units out, `deep` (cheap, bigger shapes) 75–190 units out
const HILL = { land: 'hill', sand: 'hill', snow: 'snowhill' };
// zones: [{ to, far, deep }] = different land along parts of the course (0 = start, 1 = finish); after the last one c.far / c.deep
const scenery = (c, side) => {
  const kind = c.sides[side < 0 ? 'left' : 'right'];
  if (kind === 'water') return [];
  const parts = [];
  let from = -9;
  for (const z of [...(c.zones || []), { to: 99, far: c.far, deep: c.deep }]) {
    const span = z.to === 99 && from === -9 ? {} : { from, to: z.to };
    parts.push(
      { n: z.far, p: 0.5, min: 24, max: 75, r: 6, side, ...span },
      { n: [...z.deep, HILL[kind]], p: 0.55, min: 75, max: 190, r: 9, scale: 1.5, side, ...span },
    );
    from = z.to;
  }
  return parts;
};
const city = (c) => ({
  lanes: 0, ...c,
  roadside: [...c.roadside, ...[-1, 1].map((side) => ({ n: FILL[c.sides[side < 0 ? 'left' : 'right']], p: 0.3, min: 1.0, max: 15, side })), ...scenery(c, -1), ...scenery(c, 1)],
  landmarks: c.landmarks.map((l, i) => ({ ...l, at: l.at ?? AT[i] })),
});

const WIND = { type: 'wind' }, CROWD = { type: 'crowd' };
const birds = (kind) => ({ type: 'birds', kind });
const mover = (kind, lateral, speed, period, extra = {}) => ({ type: 'mover', kind, lateral, speed, period, ...extra });
const particles = (kind) => ({ type: 'particles', kind });
const floater = (kind, extra = {}) => ({ type: 'floater', kind, ...extra });
const BUTTERFLIES = { type: 'butterflies' };

export const CITIES = [
  // ------------------------------------------------------------------ 한국
  city({
    id: 'seoul', geo: [37.57, 126.98], pin: [-25, -26], country: 'kr', name: '서울', tune: 0, hero: 'seoul_ntower',
    sky: ['#58b8ff', '#d8f1ff'], fog: '#d8f1ff', ground: ['#93d36a', '#89cb60'], road: ['#b9bcc6', '#b0b3be'], edge: ['#ffffff', '#ffd23f'],
    sides: { left: 'land', right: 'land' },
    landmarks: [
      through('seoul_gwanghwamun', '광화문', 6, ['흰 화강암 육축에 무지개문 3개(가운데가 큼)', '그 위 2층 기와 문루', '붉은 기둥과 녹색 단청', '양옆 낮은 돌담']),
      beside('seoul_geunjeongjeon', '경복궁', -1, 22, 20, ['2단 돌 월대와 난간', '2층 팔작 기와지붕, 처마 끝이 올라감', '붉은 기둥', '녹색 단청 띠']),
      beside('seoul_ntower', '남산 서울타워', 1, 34, 44, ['녹색 산 위', '흰 콘크리트 기둥', '위쪽 여러 단 원통 전망대', '붉은·흰 줄무늬 안테나']),
      through('seoul_hangangbridge', '한강 다리', 80, ['길 양옆으로 이어지는 아치 트러스', '회색 교각', '아래 파란 강물'], { bridge: true }),
    ],
    backdrop: [{ id: 'bg_namsan', bearing: 35, dist: 520 }, { id: 'bg_lottetower', bearing: -40, dist: 560 }],
    far: ['office', 'apt', 'woods_ginkgo', 'woods', 'office', 'hanok'], deep: ['block', 'block', 'woods', 'block', 'woods_ginkgo'],
    roadside: [
      { n: ['ginkgo', 'ginkgo', 'tree'], p: 0.14, min: 2.2, max: 9 },
      { n: ['hanok', 'wall_kr'], p: 0.05, min: 9, max: 20 },
      { n: ['office', 'apt', 'office'], p: 0.06, min: 20, max: 60 },
      { n: ['lamp'], p: 0.04, min: 1.4, max: 1.8 },
      { n: ['bush', 'flowers'], p: 0.1, min: 1.5, max: 7 },
    ],
    ambient: [WIND, CROWD, birds('pigeon'), BUTTERFLIES, mover('subway', -36, 26, 14, { elevated: true }), mover('cruise', 30, 6, 30, { onlyThrough: 'seoul_hangangbridge' }), particles('leaf')],
  }),
  city({
    id: 'busan', geo: [35.18, 129.08], pin: [14, 32], country: 'kr', name: '부산', tune: 1, hero: 'busan_gwanganbridge', thumb: 'thumb_gwangalli',
    sky: ['#3fb2ff', '#dff6ff'], fog: '#dff6ff', ground: ['#ffe6a8', '#fbdd98'], road: ['#c9c2b4', '#c0b9ab'], edge: ['#ffffff', '#59c3ff'],
    sides: { left: 'water', right: 'sand' },
    landmarks: [
      beside('busan_haeundae', '해운대', 1, 30, 40, ['모래사장 뒤 유리 고층 건물 무리', '가장 높은 3동은 곡면', '파란 유리와 흰 테두리']),
      beside('busan_gamcheon', '감천문화마을', 1, 26, 20, ['언덕에 계단식으로 붙은 상자 집', '알록달록 파스텔 벽', '납작한 지붕', '좁은 계단길']),
      beside('busan_tower', '부산타워', 1, 24, 40, ['흰 원기둥', '위쪽 팔각 정자 모양 전망대', '꼭대기 뾰족한 침', '아래 공원 언덕']),
      through('busan_gwanganbridge', '광안대교', 80, ['2층 트러스 상판', '주탑 2개', '늘어진 현수 케이블', '아래 바다'], { bridge: true }),
    ],
    backdrop: [{ id: 'bg_seahorizon', bearing: -70, dist: 500 }, { id: 'bg_hills', bearing: 60, dist: 520 }],
    far: ['house_color', 'house_color', 'apt', 'woods', 'office'], deep: ['block', 'woods', 'woods', 'house_color'],
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
    id: 'suwon', geo: [37.26, 127.03], pin: [-30, 2], country: 'kr', name: '수원', tune: 3, hero: 'suwon_janganmun',
    sky: ['#62c0ff', '#e2f5ff'], fog: '#e2f5ff', ground: ['#8fd067', '#86c85e'], road: ['#d8c9a8', '#cfc09e'], edge: ['#f6efe0', '#a8703f'],
    sides: { left: 'land', right: 'land' },
    landmarks: [
      through('suwon_janganmun', '장안문', 22, ['돌 육축에 무지개문 1개', '2층 기와 문루', '앞쪽 반원 옹성', '성벽 위 여장']),
      beside('suwon_gongsimdon', '서북공심돈', -1, 16, 22, ['성곽 위 3층 벽돌 망루', '벽에 뚫린 총안 구멍', '기와지붕', '양옆으로 이어지는 성곽과 여장']),
      beside('suwon_hwahongmun', '화홍문', 1, 32, 14, ['무지개 수문 7개', '그 위 기와 누각', '아래로 흐르는 개울']),
      beside('suwon_haenggung', '화성행궁', -1, 25, 14, ['낮고 넓은 기와 전각', '붉은 정문(신풍루) 2층 누각', '돌담', '앞마당 느티나무']),
    ],
    backdrop: [{ id: 'bg_paldalsan', bearing: -30, dist: 480 }],
    far: ['woods_pine', 'woods', 'hanok', 'woods', 'wall_kr'], deep: ['woods', 'woods_pine', 'woods'],
    roadside: [
      { n: ['pine', 'pine', 'tree'], p: 0.14, min: 2.4, max: 22 },
      { n: ['banner'], p: 0.07, min: 1.4, max: 2 },
      { n: ['hanok', 'wall_kr'], p: 0.05, min: 8, max: 20 },
      { n: ['grass', 'flowers'], p: 0.12, min: 1.2, max: 9 },
    ],
    ambient: [WIND, CROWD, birds('magpie'), BUTTERFLIES, floater('balloon', { lateral: 40, y: 45 }), particles('petal')],
  }),
  city({
    id: 'ulsan', geo: [35.54, 129.31], pin: [34, 6], country: 'kr', name: '울산', tune: 1, hero: 'ulsan_daewangam',
    sky: ['#49b6ff', '#e0f7ff'], fog: '#e0f7ff', ground: ['#9bd66f', '#92ce66'], road: ['#c6c2ba', '#bdb9b1'], edge: ['#ffffff', '#3aa0e8'],
    sides: { left: 'land', right: 'water' },
    landmarks: [
      beside('ulsan_bamboo', '태화강 십리대숲', -1, 19, 16, ['빽빽한 대나무 숲', '마디 있는 녹색 줄기', '숲 사이 흙길', '낮은 대나무 울타리']),
      beside('ulsan_bridge', '울산대교', 1, 50, 36, ['흰 주탑 2개', '주탑 사이를 한 번에 건너는 현수교', '가는 케이블', '아래 바다'], { wet: true }),
      beside('ulsan_daewangam', '대왕암', 1, 26, 12, ['누런 바위섬 무리', '바위를 잇는 출렁다리', '바위 위 소나무'], { wet: true }),
      beside('ulsan_ganjeolgot', '간절곶 등대', 1, 19, 22, ['흰 등대', '기와지붕 모양 전망부', '옆에 큰 소망 우체통', '바닷가 언덕'], { wet: true }),
    ],
    backdrop: [{ id: 'bg_shipyard', bearing: 55, dist: 520 }, { id: 'bg_seahorizon', bearing: 80, dist: 500 }],
    far: ['woods', 'woods_pine', 'woods', 'woods', 'apt'], deep: ['woods', 'woods_pine', 'block'],
    roadside: [
      { n: ['bamboo', 'bamboo', 'tree'], p: 0.2, min: 2.2, max: 24, side: -1 },
      { n: ['rock', 'pine'], p: 0.1, min: 2, max: 5.5, side: 1 },
      { n: ['grass', 'flowers'], p: 0.1, min: 1.2, max: 5 },
      { n: ['lamp'], p: 0.03, min: 1.4, max: 1.8 },
    ],
    ambient: [WIND, CROWD, birds('gull'), floater('whale', { lateral: 38 }), mover('boat', 60, 5, 20), mover('ferry', 90, 4, 45), floater('waves')],
  }),
  city({
    id: 'gyeongju', geo: [35.86, 129.22], pin: [22, -22], country: 'kr', name: '경주', tune: 0, hero: 'gyeongju_cheomseongdae',
    sky: ['#6cc4ff', '#e6f6ff'], fog: '#e6f6ff', ground: ['#a2d86c', '#99d063'], road: ['#e3d2ac', '#dac9a2'], edge: ['#f8f0dc', '#b98a4e'],
    sides: { left: 'land', right: 'land' },
    landmarks: [
      beside('gyeongju_daereungwon', '대릉원', -1, 46, 16, ['둥글고 큰 잔디 고분 여러 개', '두 봉우리가 붙은 쌍분', '고분 사이 소나무']),
      beside('gyeongju_cheomseongdae', '첨성대', 1, 12, 16, ['병 모양으로 휘어진 돌탑', '가운데 네모 창', '꼭대기 井자 돌', '네모난 기단']),
      beside('gyeongju_wolji', '동궁과 월지', -1, 38, 12, ['연못가 기와 누각 3채', '돌 축대', '잔잔한 연못', '연못 속 작은 섬']),
      beside('gyeongju_bulguksa', '불국사', 1, 22, 18, ['높은 돌 축대', '청운교·백운교 돌계단', '모양이 다른 두 탑(다보탑·석가탑)', '기와 문루']),
    ],
    backdrop: [{ id: 'bg_hills', bearing: -45, dist: 480 }, { id: 'bg_hills', bearing: 50, dist: 520 }],
    far: ['mound', 'woods_pine', 'woods', 'hanok', 'woods'], deep: ['mound', 'woods', 'woods_pine'],
    roadside: [
      { n: ['canola', 'canola', 'flowers'], p: 0.22, min: 1.2, max: 14 },
      { n: ['pine', 'tree'], p: 0.08, min: 3, max: 26 },
      { n: ['wall_kr', 'hanok'], p: 0.05, min: 8, max: 20 },
      { n: ['mound'], p: 0.02, min: 22, max: 50 },
    ],
    ambient: [WIND, CROWD, BUTTERFLIES, birds('magpie'), particles('petal'), floater('kiteflyer', { lateral: -14 })],
  }),

  // 화성: the family's home town, split into two neighbourhoods
  city({
    id: 'bongdam', geo: [37.231, 126.946], pin: [-29, 33], country: 'kr', name: '화성 봉담', tune: 0, hero: 'bongdam_yunggeonneung', thumb: 'thumb_yunggeon',
    sky: ['#5fbcff', '#e0f4ff'], fog: '#e0f4ff', ground: ['#8fd067', '#86c85e'], road: ['#b9bcc6', '#b0b3be'], edge: ['#ffffff', '#ffd23f'],
    sides: { left: 'land', right: 'land' }, lanes: 1,
    // the real way from home to 융건릉 (OpenStreetMap / OSRM, 6 km squeezed into the course):
    // start at 중흥S클래스 에듀파크 on 상리2길 (봉담2지구), right onto 수영로 heading east, right onto 효행로 heading south-east
    route: [[0.04, -0.35], [0.09, 0.3], [0.13, -0.9], [0.26, 0.35], [0.31, -0.9], [0.39, -0.7], [0.48, 0.35], [0.66, 0.2], [0.74, -0.3], [0.86, 0.25]],
    landmarks: [
      beside('bongdam_edupark', '중흥S클래스 에듀파크', 1, 14, 30, ['25층 아파트 여러 동', '단지 정문과 놀이터', '정문 앞 버스정류장', '단지 앞 가로수길'], { at: 0.05 }),
      through('bongdam_yunggeonneung', '융건릉', 10, ['붉은 나무 기둥 2개와 가로대', '위쪽에 촘촘한 붉은 살', '가운데 태극 문양', '숲길 입구 양옆 소나무'], { at: 0.56 }),
      beside('bongdam_yungneung', '융릉', -1, 22, 16, ['언덕 위 둥근 봉분', '봉분 둘레 병풍석과 난간석', '문인석·무인석과 석마', '아래 정자각과 홍살문'], { at: 0.68, clearing: 28 }),
      beside('bongdam_geonneung', '건릉', 1, 22, 16, ['언덕 위 둥근 봉분(병풍석 없음)', '봉분 둘레 난간석', '석양·석호와 문인석·무인석', '뒤를 감싸는 곡장 담', '아래 정자각'], { at: 0.8, clearing: 28 }),
      beside('bongdam_yongjusa', '용주사', -1, 20, 16, ['2층 누각 천보루', '대웅보전 기와 전각', '앞마당 5층 석탑', '돌담과 솔숲'], { at: 0.92 }),
    ],
    backdrop: [{ id: 'bg_aptline', bearing: 40, dist: 540 }, { id: 'bg_hills', bearing: -50, dist: 520 }],
    // 융건릉 숲길: past the red gate the road turns into a dirt path between tall pines, passes 융릉 and 건릉, then back out to 효행로
    paths: [{ from: 0.555, to: 0.87, road: ['#c9a676', '#c19e6d'], edge: ['#b08d5f'], curb: '#a8b86e' }],
    zones: [{ to: 0.3, far: ['apt', 'apt', 'office', 'apt', 'woods'], deep: ['block', 'apt', 'woods'] }, { to: 0.55, far: ['woods_pine', 'woods', 'hanok', 'woods_pine'], deep: ['woods_pine', 'woods'] }, { to: 0.87, far: ['woods_pine', 'woods_pine', 'woods_pine'], deep: ['woods_pine', 'woods_pine', 'woods'] }],
    far: ['woods_pine', 'woods_pine', 'woods', 'woods_pine', 'hanok'], deep: ['woods_pine', 'woods', 'woods_pine'],
    roadside: [
      // 봉담2지구 (상리2길, 수영로): apartments and street trees
      { n: ['apt', 'apt'], p: 0.1, min: 12, max: 30, from: -9, to: 0.3 },
      { n: ['ginkgo', 'tree'], p: 0.22, min: 1.8, max: 3, from: -9, to: 0.3 },
      { n: ['lamp'], p: 0.06, min: 1.4, max: 1.8, from: -9, to: 0.3 },
      // 효행로: trees along the road
      { n: ['pine', 'pine', 'tree'], p: 0.2, min: 2.4, max: 22, from: 0.3, to: 0.555 },
      { n: ['pine', 'pine', 'tree'], p: 0.2, min: 2.4, max: 22, from: 0.87, to: 99 },
      { n: ['wall_kr'], p: 0.03, min: 9, max: 18, from: 0.87, to: 99 },
      { n: ['lamp'], p: 0.025, min: 1.4, max: 1.8, from: 0.3, to: 0.54 },
      { n: ['lamp'], p: 0.025, min: 1.4, max: 1.8, from: 0.87, to: 99 },
      // 융건릉 숲길: tall pines close on both sides
      { n: ['pine_tall'], p: 0.65, min: 1.6, max: 9, from: 0.555, to: 0.87 },
      { n: ['pine_tall', 'pine_tall', 'pine'], p: 0.45, min: 9, max: 24, from: 0.555, to: 0.87 },
      { n: ['bush', 'flowers', 'grass'], p: 0.12, min: 1.5, max: 9 },
    ],
    ambient: [WIND, CROWD, birds('magpie'), BUTTERFLIES, floater('kiteflyer', { lateral: -16 }), particles('leaf')],
  }),
  city({
    id: 'dongtan', geo: [37.2, 127.07], pin: [27, -22], country: 'kr', name: '화성 동탄', tune: 3, hero: 'dongtan_lakepark', thumb: 'thumb_dongtan',
    sky: ['#55b6ff', '#dcf2ff'], fog: '#dcf2ff', ground: ['#92d36b', '#88cb61'], road: ['#b9bcc6', '#b0b3be'], edge: ['#ffffff', '#59c3ff'],
    sides: { left: 'land', right: 'land' }, lanes: 1,
    landmarks: [
      beside('dongtan_centralpark', '동탄 센트럴파크', -1, 18, 14, ['넓은 잔디밭', '둥근 광장과 바닥분수', '나무 그늘 산책길', '뒤로 낮은 반석산']),
      beside('dongtan_metapolis', '메타폴리스', 1, 26, 48, ['유리 초고층 4동', '꼭대기 비스듬한 왕관 지붕', '아래 낮은 쇼핑몰', '파란·은색 유리']),
      beside('dongtan_station', '동탄역', -1, 22, 16, ['길고 낮은 유리 지붕 역 입구', '역 이름 간판', '앞 광장과 버스', '뒤 고층 빌딩']),
      through('dongtan_lakepark', '동탄호수공원', 70, ['호수를 가로지르는 데크 다리', '물 위로 솟는 음악분수', '둥근 루나 조형물', '호숫가 산책길과 오리배'], { bridge: true }),
    ],
    backdrop: [{ id: 'bg_aptline', bearing: 35, dist: 540 }, { id: 'bg_aptline', bearing: -45, dist: 580 }],
    far: ['apt', 'apt', 'office', 'woods', 'apt', 'skyscraper'], deep: ['block', 'apt', 'block', 'woods'],
    roadside: [
      { n: ['ginkgo', 'tree', 'tree'], p: 0.18, min: 1.8, max: 3 },
      { n: ['apt', 'apt', 'office'], p: 0.07, min: 14, max: 40 },
      { n: ['lamp'], p: 0.05, min: 1.4, max: 1.8 },
      { n: ['bush', 'flowers'], p: 0.12, min: 1.5, max: 8 },
    ],
    ambient: [WIND, CROWD, birds('pigeon'), BUTTERFLIES, mover('srt', -34, 30, 14), mover('duckboat', 26, 3, 24, { onlyThrough: 'dongtan_lakepark' }), floater('fountain')],
  }),

  // ------------------------------------------------------------------ 일본
  city({
    id: 'tokyo', geo: [35.68, 139.69], pin: [24, 2], country: 'jp', name: '도쿄', tune: 3, hero: 'tokyo_tower',
    sky: ['#5fbcff', '#e4f4ff'], fog: '#e4f4ff', ground: ['#b9d9a0', '#b0d197'], road: ['#aeb2bd', '#a5a9b5'], edge: ['#ffffff', '#ff8fb1'],
    sides: { left: 'land', right: 'land' }, lanes: 1,
    landmarks: [
      through('tokyo_kaminarimon', '가미나리몬', 6, ['붉은 기둥의 문', '가운데 매달린 큰 붉은 등', '회색 기와지붕', '양옆 칸막이 방']),
      beside('tokyo_tower', '도쿄타워', -1, 26, 46, ['붉은색·흰색 띠', '아래로 벌어진 4다리 격자', '2단 전망대', '꼭대기 안테나']),
      beside('tokyo_rainbowbridge', '레인보우브리지', -1, 52, 30, ['흰 주탑 2개', '2층 상판 현수교', '늘어진 케이블', '아래 바다']),
      beside('tokyo_skytree', '도쿄 스카이트리', -1, 36, 60, ['가늘고 긴 은백색 격자 탑', '위쪽 전망대 2단', '밑은 삼각, 위는 원', '꼭대기 안테나']),
    ],
    backdrop: [{ id: 'bg_skyline', bearing: 30, dist: 520 }, { id: 'bg_skyline', bearing: -50, dist: 560 }],
    far: ['office', 'apt', 'shop_jp', 'woods_cherry', 'office', 'skyscraper'], deep: ['block', 'block', 'block', 'woods_cherry'],
    roadside: [
      { n: ['cherry', 'cherry', 'tree'], p: 0.14, min: 2.2, max: 9 },
      { n: ['shop_jp', 'machiya'], p: 0.08, min: 8, max: 18 },
      { n: ['office', 'office', 'apt'], p: 0.08, min: 20, max: 60 },
      { n: ['lamp'], p: 0.04, min: 1.4, max: 1.8 },
    ],
    ambient: [WIND, CROWD, birds('pigeon'), particles('petal'), mover('shinkansen', 18, 45, 12, { elevated: true }), mover('taxi', -8.5, 9, 8)],
  }),
  city({
    id: 'kyoto', geo: [35.01, 135.77], pin: [-16, -24], country: 'jp', name: '교토', tune: 0, hero: 'kyoto_kinkakuji',
    sky: ['#70c2ff', '#ffeeda'], fog: '#ffeeda', ground: ['#a8cf78', '#9fc76f'], road: ['#d9cdb6', '#d0c4ac'], edge: ['#f4ead6', '#c0392b'],
    sides: { left: 'land', right: 'land' },
    landmarks: [
      through('kyoto_fushimiinari', '후시미 이나리 신사', 40, ['촘촘히 이어진 주홍 도리이', '검은 밑동', '위쪽 검은 가로대', '터널처럼 길을 덮음']),
      beside('kyoto_yasaka', '야사카의 탑', -1, 14, 30, ['5층 목탑', '층마다 넓은 처마', '어두운 나무색', '꼭대기 금속 상륜']),
      beside('kyoto_kiyomizu', '기요미즈데라', 1, 24, 22, ['절벽 위 나무 기둥 격자 무대', '크고 완만한 히와다 지붕', '붉은 3층탑이 옆에', '아래 단풍 숲']),
      beside('kyoto_kinkakuji', '금각사', -1, 29, 16, ['연못 위 3층 누각', '위 2층이 금색', '지붕 꼭대기 금 봉황', '1층은 흰 벽과 나무']),
    ],
    backdrop: [{ id: 'bg_maplehills', bearing: -40, dist: 460 }, { id: 'bg_maplehills', bearing: 45, dist: 500 }],
    far: ['woods_maple', 'woods_pine', 'machiya', 'woods_maple', 'woods'], deep: ['woods_maple', 'woods_pine', 'woods'],
    roadside: [
      { n: ['maple', 'maple', 'bamboo', 'pine'], p: 0.2, min: 2.2, max: 24 },
      { n: ['stonelantern'], p: 0.06, min: 1.4, max: 2.4 },
      { n: ['machiya'], p: 0.07, min: 8, max: 18 },
      { n: ['bush', 'grass'], p: 0.1, min: 1.4, max: 7 },
    ],
    ambient: [WIND, CROWD, BUTTERFLIES, birds('magpie'), particles('leaf'), floater('koi', { lateral: -9 })],
  }),
  city({
    id: 'osaka', geo: [34.69, 135.5], pin: [-22, 22], country: 'jp', name: '오사카', tune: 3, hero: 'osaka_castle',
    sky: ['#55b9ff', '#e2f4ff'], fog: '#e2f4ff', ground: ['#a9d68a', '#a0ce81'], road: ['#b3b6c0', '#aaadb8'], edge: ['#ffffff', '#ffa24d'],
    sides: { left: 'land', right: 'land' }, lanes: 1,
    landmarks: [
      beside('osaka_castle', '오사카성', -1, 26, 34, ['높은 돌 축대', '흰 벽과 청록 지붕의 5층 천수', '금색 장식', '층마다 삼각 박공']),
      beside('osaka_tsutenkaku', '쓰텐카쿠', 1, 18, 36, ['철골 탑', '위쪽 네모난 전망대 2단', '다리 사이로 길이 지나는 밑동', '색 판 장식(글자 없음)']),
      beside('osaka_dotonbori', '도톤보리', -1, 18, 18, ['운하 양옆 건물 벽', '알록달록 큰 색 간판(글자·로고 없음)', '운하를 건너는 다리', '운하 위 배']),
      beside('osaka_ferriswheel', '덴포잔 대관람차', 1, 30, 40, ['아주 큰 원형 바퀴', '색색 곤돌라', '흰 바큇살', '삼각 받침 다리']),
    ],
    backdrop: [{ id: 'bg_skyline', bearing: 40, dist: 540 }],
    far: ['office', 'apt', 'shop_jp', 'woods', 'skyscraper'], deep: ['block', 'block', 'block', 'woods'],
    roadside: [
      { n: ['shop_jp', 'shop_jp', 'machiya'], p: 0.1, min: 8, max: 18 },
      { n: ['office', 'apt'], p: 0.07, min: 20, max: 60 },
      { n: ['tree', 'cherry'], p: 0.12, min: 2.2, max: 8 },
      { n: ['lamp'], p: 0.04, min: 1.4, max: 1.8 },
    ],
    ambient: [WIND, CROWD, birds('pigeon'), mover('subway', -62, 24, 13, { elevated: true }), mover('taxi', -8.5, 9, 9), particles('petal')],
  }),
  city({
    id: 'sapporo', geo: [43.06, 141.35], pin: [-26, -2], country: 'jp', name: '삿포로', tune: 2, hero: 'sapporo_clocktower',
    sky: ['#86c8f5', '#f2f9ff'], fog: '#f2f9ff', ground: ['#f6fbff', '#eaf3fb'], road: ['#c4cbd6', '#bbc2ce'], edge: ['#ffffff', '#7fb8e8'],
    sides: { left: 'snow', right: 'snow' },
    landmarks: [
      beside('sapporo_clocktower', '삿포로 시계탑', -1, 12, 16, ['흰 판자벽 목조 건물', '붉은 지붕', '네모난 시계탑과 큰 시계', '꼭대기 붉은 별']),
      beside('sapporo_tvtower', '삿포로 TV타워', 1, 22, 40, ['붉은 철골 탑', '중간의 큰 전광 시계 자리', '녹색 전망대', '아래 공원과 분수']),
      beside('sapporo_redbrick', '홋카이도청 구 본청사', -1, 22, 20, ['붉은 벽돌 좌우대칭 건물', '가운데 녹색 팔각 돔', '흰 창틀이 줄지음', '슬레이트 지붕']),
      beside('sapporo_skijump', '오쿠라야마 스키점프대', 1, 40, 36, ['산비탈의 길고 흰 점프대', '아래 넓은 착지 경사', '꼭대기 출발 탑', '양옆 침엽수']),
    ],
    backdrop: [{ id: 'bg_snowmountain', bearing: 35, dist: 480 }, { id: 'bg_snowmountain', bearing: -50, dist: 520 }],
    far: ['woods_snow', 'woods_snow', 'house_snow', 'woods_snow', 'woods_snow'], deep: ['woods_snow', 'woods_snow', 'snowhill'],
    roadside: [
      { n: ['birch', 'pine_snow', 'pine_snow'], p: 0.18, min: 2.4, max: 26 },
      { n: ['snowman'], p: 0.05, min: 1.6, max: 5 },
      { n: ['house_snow'], p: 0.06, min: 9, max: 22 },
      { n: ['lamp'], p: 0.04, min: 1.4, max: 1.8 },
    ],
    ambient: [WIND, CROWD, birds('magpie'), particles('snow'), mover('tram', -8.5, 8, 12), floater('skijumper')],
  }),
  city({
    id: 'shizuoka', geo: [34.98, 138.38], pin: [12, 26], country: 'jp', name: '시즈오카', tune: 1, hero: 'shizuoka_teafield',
    sky: ['#52b7ff', '#e6f7ff'], fog: '#e6f7ff', ground: ['#8fcf63', '#86c75a'], road: ['#cfc8b8', '#c6bfae'], edge: ['#ffffff', '#3d9b4f'],
    sides: { left: 'land', right: 'water' },
    landmarks: [
      beside('shizuoka_teafield', '녹차밭', -1, 23, 12, ['둥근 이랑이 줄지은 차밭', '완만한 언덕', '짙은 녹색 줄무늬', '바람개비 달린 기둥']),
      beside('shizuoka_miho', '미호노마쓰바라', 1, 24, 12, ['검은 모래 해변', '구불구불 굽은 소나무 숲', '바다 물결'], { wet: true }),
      beside('shizuoka_sunpu', '슨푸성', -1, 25, 16, ['해자와 돌 축대', '흰 벽의 2층 망루', '회색 기와', '나무 다리와 문']),
      through('shizuoka_shinkansen', '신칸센 고가', 6, ['길 위를 가로지르는 콘크리트 고가', '굵은 교각', '위로 지나가는 흰·파란 신칸센']),
    ],
    backdrop: [{ id: 'bg_fuji', bearing: -12, dist: 520 }],
    far: ['tearow', 'woods', 'woods_pine', 'machiya', 'tearow'], deep: ['woods', 'woods_pine', 'woods'],
    roadside: [
      { n: ['tearow', 'tearow', 'tree'], p: 0.2, min: 2.4, max: 26, side: -1 },
      { n: ['pine', 'rock'], p: 0.12, min: 2.2, max: 5.5, side: 1 },
      { n: ['machiya'], p: 0.03, min: 10, max: 24, side: -1 },
      { n: ['grass', 'flowers'], p: 0.1, min: 1.2, max: 5 },
    ],
    ambient: [WIND, CROWD, birds('kite'), BUTTERFLIES, mover('shinkansen', -72, 48, 11, { elevated: true }), mover('boat', 50, 5, 22), floater('waves')],
  }),

  // ------------------------------------------------------------------ 미국
  city({
    id: 'newyork', geo: [40.71, -74.0], pin: [12, 10], country: 'us', name: '뉴욕', tune: 3, hero: 'newyork_liberty',
    sky: ['#57b6ff', '#e0f2ff'], fog: '#e0f2ff', ground: ['#9fcf82', '#96c779'], road: ['#9fa3ad', '#969aa5'], edge: ['#ffffff', '#ffd23f'],
    sides: { left: 'land', right: 'land' }, lanes: 1,
    landmarks: [
      beside('newyork_liberty', '자유의 여신상', 1, 40, 40, ['청록색 여신', '별 모양 기단 위 돌 받침대', '뿔 7개 왕관', '치켜든 금색 횃불과 왼팔의 판']),
      through('newyork_brooklynbridge', '브루클린 브리지', 80, ['돌 주탑 2개', '주탑마다 뾰족 아치 2개', '부채꼴로 퍼진 케이블', '아래 강물'], { bridge: true }),
      beside('newyork_empirestate', '엠파이어 스테이트 빌딩', -1, 26, 56, ['단계적으로 좁아지는 석조 탑', '세로 줄 창', '꼭대기 둥근 첨탑과 안테나']),
      beside('newyork_timessquare', '타임스스퀘어', 1, 16, 26, ['색 전광판이 붙은 건물들(글자·로고 없음)', '모서리가 뾰족한 삼각 건물', '붉은 계단', '앞쪽 가로수']),
    ],
    backdrop: [{ id: 'bg_manhattan', bearing: -35, dist: 540 }, { id: 'bg_manhattan', bearing: 45, dist: 580 }],
    far: ['skyscraper', 'office', 'brownstone', 'skyscraper', 'woods'], deep: ['block', 'block', 'block', 'woods'],
    roadside: [
      { n: ['brownstone', 'brownstone'], p: 0.09, min: 8, max: 16 },
      { n: ['skyscraper', 'office'], p: 0.08, min: 20, max: 60 },
      { n: ['tree'], p: 0.12, min: 2.2, max: 7 },
      { n: ['hydrant', 'lamp'], p: 0.05, min: 1.4, max: 1.8 },
    ],
    ambient: [WIND, CROWD, birds('pigeon'), mover('taxi', -8.5, 10, 6), mover('ferry', 34, 5, 30, { onlyThrough: 'newyork_brooklynbridge' }), particles('leaf')],
  }),
  city({
    id: 'sanfrancisco', geo: [37.77, -122.42], pin: [-10, 6], country: 'us', name: '샌프란시스코', tune: 1, hero: 'sanfrancisco_goldengate',
    sky: ['#4db3ff', '#e9f6ff'], fog: '#e9f6ff', ground: ['#a8d47a', '#9fcc71'], road: ['#aaadb6', '#a1a4ae'], edge: ['#ffffff', '#f05a28'],
    sides: { left: 'land', right: 'water' },
    landmarks: [
      beside('sanfrancisco_paintedladies', '페인티드 레이디스', -1, 14, 14, ['나란한 빅토리아풍 집 6채', '집마다 다른 파스텔 색', '뾰족 박공지붕과 돌출창', '앞 계단']),
      beside('sanfrancisco_lombard', '롬바드 스트리트', -1, 20, 18, ['언덕을 내려오는 지그재그 길', '붉은 벽돌 포장', '굽이마다 꽃밭', '양옆 집']),
      beside('sanfrancisco_transamerica', '트랜스아메리카 피라미드', -1, 28, 52, ['흰색의 뾰족한 피라미드 빌딩', '위쪽 양옆 날개', '줄지은 창', '꼭대기 뾰족탑']),
      through('sanfrancisco_goldengate', '금문교', 80, ['인터내셔널 오렌지색', '주탑 2개에 가로대 4단', '늘어진 주 케이블과 세로 줄', '아래 바다'], { bridge: true }),
    ],
    backdrop: [{ id: 'bg_alcatraz', bearing: 50, dist: 420 }, { id: 'bg_hills', bearing: -50, dist: 520 }],
    far: ['victorian', 'woods', 'cypress', 'house_color', 'office'], deep: ['woods', 'block', 'woods_pine', 'house_color'],
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
