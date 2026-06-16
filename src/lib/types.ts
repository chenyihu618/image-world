 // ============================================================
 // 影展地图网站 - 类型定义
 // 修改此处后，可以按需扩展数据类型
 // ============================================================
 
 export interface Coordinates {
   lat: number;
   lng: number;
 }
 
 export interface Country {
   id: string;
   name: string;
   nameEn: string;
   coordinates: Coordinates;
   provinces: string[];
 }
 
 export interface Province {
   id: string;
   name: string;
   countryId: string;
   coordinates: Coordinates;
   scenicSpots: string[];
 }
 
 export interface ScenicSpot {
   id: string;
   name: string;
   nameEn: string;
   country: string;
   countryId: string;
   province: string;
   provinceId: string;
   coordinates: Coordinates;
   description: string;
   culture: string;
   history: string;
   featuredImage: string;
   images: string[];
   tags: string[];
   createdAt: string;
 }
 
 export interface TravelNote {
   id: string;
   spotId: string;
   author: string;
   title: string;
   content: string;
   createdAt: string;
 }
 
 export interface GlobeMarker {
   id: string;
   label: string;
   coordinates: Coordinates;
   targetUrl: string;
 }
