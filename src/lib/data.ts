// ============================================================
// 影展地图网站 - 数据配置
// 在此文件中添加新的国家、省份和景区数据
// ============================================================

import { Country, Province, ScenicSpot, GlobeMarker } from './types';

// --- 国家数据 ---
export const countries: Record<string, Country> = {
  china: {
    id: 'china',
    name: '中国',
    nameEn: 'China',
    coordinates: { lat: 35.86, lng: 104.19 },
    provinces: ['anhui'],
  },
};

// --- 省份数据 ---
export const provinces: Record<string, Province> = {
  anhui: {
    id: 'anhui',
    name: '安徽省',
    countryId: 'china',
    coordinates: { lat: 31.82, lng: 117.22 },
    scenicSpots: ['huangshan'],
  },
};

// --- 景区数据（核心） ---
export const scenicSpots: Record<string, ScenicSpot> = {
  huangshan: {
    id: 'huangshan',
    name: '黄山',
    nameEn: 'Mount Huangshan',
    country: '中国',
    countryId: 'china',
    province: '安徽省',
    provinceId: 'anhui',
    coordinates: { lat: 30.133, lng: 118.175 },
    description:
      '黄山，中华十大名山之一，被誉为"天下第一奇山"。以奇松、怪石、云海、温泉、冬雪"五绝"著称于世，素有"五岳归来不看山，黄山归来不看岳"之美誉。',
    culture:
      '黄山文化源远流长，自古便是文人墨客的灵感源泉。唐代诗人李白曾写下"黄山四千仞，三十二莲峰"的千古名句。\n\n' +
      '徐霞客两游黄山，赞叹"薄海内外之名山，无如徽之黄山。登黄山，天下无山，观止矣！"\n\n' +
      '黄山孕育了独特的徽州文化，徽派建筑、徽商、徽菜、徽剧等构成了丰富多彩的地域文化体系。\n\n' +
      '2004年，黄山被联合国教科文组织列为世界文化与自然双重遗产，是中国第一个同时获得文化和自然双遗产的风景名胜区。',
    history:
      '黄山古称"黟山"，因山石黝黑而得名。唐天宝六年（公元747年），唐玄宗根据轩辕黄帝在此炼丹成仙的传说，改名为"黄山"。\n\n' +
      '道教文化在黄山有着深厚根基，历代道士在此修炼，留下了众多道观遗迹。\n\n' +
      '明代以后，黄山逐渐成为旅游胜地。历代文人墨客在此留下了两万多篇（首）诗文和大量摩崖石刻。\n\n' +
      '1982年，黄山被列入第一批国家级风景名胜区。1990年，被联合国教科文组织列入《世界遗产名录》。',
    featuredImage: '/images/huangshan/hero.jpg',
    images: [
      '/images/huangshan/photo1.jpg',
      '/images/huangshan/photo2.jpg',
      '/images/huangshan/photo3.jpg',
      '/images/huangshan/photo4.jpg',
      '/images/huangshan/photo5.jpg',
      '/images/huangshan/photo6.jpg',
    ],
    tags: ['世界遗产', '天下第一奇山', '摄影圣地', '云海日出'],
    createdAt: '2026-01-01',
  },
};

// --- 地球上的标记点（用于3D地球上的可点击区域） ---
export const globeMarkers: GlobeMarker[] = [
  {
    id: 'china',
    label: '中国',
    coordinates: { lat: 35.86, lng: 104.19 },
    targetUrl: '/explore/china',
  },
];

// --- 辅助函数 ---
export function getScenicSpot(id: string): ScenicSpot | undefined {
  return scenicSpots[id];
}

export function getProvince(id: string): Province | undefined {
  return provinces[id];
}

export function getCountry(id: string): Country | undefined {
  return countries[id];
}

export function getProvincesByCountry(countryId: string): Province[] {
  const country = countries[countryId];
  if (!country) return [];
  return country.provinces.map((pid) => provinces[pid]).filter(Boolean);
}

export function getSpotsByProvince(provinceId: string): ScenicSpot[] {
  const province = provinces[provinceId];
  if (!province) return [];
  return province.scenicSpots.map((sid) => scenicSpots[sid]).filter(Boolean);
}

export function getAllScenicSpots(): ScenicSpot[] {
  return Object.values(scenicSpots);
}
