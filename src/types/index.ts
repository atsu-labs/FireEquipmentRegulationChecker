import type { Ref } from "vue";

// Article10UserInput
export interface Article10UserInput {
  buildingUse: Ref<string | null>;
  totalFloorAreaInput: Ref<number | null>;
  floors: Ref<Floor[]>;
  usesFireEquipment: Ref<boolean>;
  storesMinorHazardousMaterials: Ref<boolean>;
  storesDesignatedCombustibles: Ref<boolean>;
}
// Article11UserInput
export interface Article11UserInput {
  buildingUse: Ref<string | null>;
  totalArea: Ref<number | null>;
  floors: Ref<Floor[]>;
  hasBasement: Ref<boolean>;
  basementArea: Ref<number>;
  hasNoWindowFloor: Ref<boolean>;
  noWindowFloorArea: Ref<number>;
  hasUpperFloors: Ref<boolean>;
  upperFloorsArea: Ref<number>;
  storesFlammableItems: Ref<boolean>;
  storesDesignatedCombustiblesOver750x: Ref<boolean>;
  structureType: Ref<"A" | "B" | "C" | null>;
  finishType: Ref<"flammable" | "other" | null>;
}

// Article12UserInput
export interface Article12UserInput {
  buildingUse: Ref<string | null>;
  groundFloors: Ref<number>;
  totalArea: Ref<number | null>;
  floors: Ref<Floor[]>;
  isCareDependentOccupancy: Ref<boolean>;
  hasStageArea: Ref<boolean>;
  stageFloorLevel: Ref<string | null>; // 'basement_windowless_4th_or_higher' | 'other'
  stageArea: Ref<number | null>;
  isRackWarehouse: Ref<boolean>;
  ceilingHeight: Ref<number | null>;
  storesDesignatedCombustiblesOver1000x: Ref<boolean>;
  hasFireSuppressingStructure: Ref<boolean>;
}

// Article13UserInput
export interface Article13UserInput {
  buildingUse: Ref<string | null>;
  storesDesignatedCombustiblesOver1000x: Ref<boolean>;
  // 共有パーキング情報に移行
  parking: Ref<Parking>;
  hasCarRepairArea: Ref<boolean>;
  carRepairAreaBasementOrUpper: Ref<number | null>;
  carRepairAreaFirstFloor: Ref<number | null>;
  hasHelicopterLandingZone: Ref<boolean>;
  hasHighFireUsageAreaOver200sqm: Ref<boolean>;
  hasElectricalEquipmentOver200sqm: Ref<boolean>;
  // 通信機器室は面積基準(500㎡以上)で判定するため、共通プロパティを使用
  hasTelecomRoomOver500sqm: Ref<boolean>;
  hasRoadPart: Ref<boolean>;
  roadPartRooftopArea: Ref<number | null>;
  roadPartOtherArea: Ref<number | null>;
}

// Article19UserInput
export interface Article19UserInput {
  buildingUse: Ref<string | null>;
  groundFloors: Ref<number>;
  floors: Ref<Floor[]>;
  buildingStructure: Ref<
    "fire-resistant" | "quasi-fire-resistant" | "other" | null
  >;
  hasMultipleBuildingsOnSite: Ref<boolean>;
}

// Article21UserInput
export interface Article21UserInput {
  buildingUse: Ref<string | null>;
  totalArea: Ref<number | null>;
  hasLodging: Ref<boolean>;
  floors: Ref<Floor[]>;
  isSpecifiedOneStaircase: Ref<boolean>;
  storesDesignatedCombustiblesOver500x: Ref<boolean>;
  hasRoadPart: Ref<boolean>;
  roadPartRooftopArea: Ref<number | null>;
  roadPartOtherArea: Ref<number | null>;
  // 共有パーキング情報を使用
  parking: Ref<Parking>;
  hasTelecomRoomOver500sqm: Ref<boolean>;
}

// Article21_2UserInput
export interface Article21_2UserInput {
  buildingUse: Ref<string | null>;
  totalArea: Ref<number | null>;
  floors: Ref<Floor[]>;
  hasHotSpringFacility: Ref<boolean>;
  isHotSpringFacilityConfirmed: Ref<boolean>;
}

// Article22UserInput
export interface Article22UserInput {
  buildingUse: Ref<string | null>;
  totalArea: Ref<number | null>;
  floors: Ref<Floor[]>;
  hasSpecialCombustibleStructure: Ref<boolean>;
  contractedCurrentCapacity: Ref<number | null>;
}

// Article23UserInput
export interface Article23UserInput {
  buildingUse: Ref<string | null>;
  totalArea: Ref<number | null>;
  floors: Ref<Floor[]>;
}

// Article24UserInput
export interface Article24UserInput {
  buildingUse: Ref<string | null>;
  totalCapacity: Ref<number | null>;
  groundFloors: Ref<number>;
  basementFloors: Ref<number>;
  floors: Ref<Floor[]>;
}

// Article25UserInput
export interface Article25UserInput {
  buildingUse: Ref<string | null>;
  floors: Ref<Floor[]>;
}

// Article26UserInput
export interface Article26UserInput {
  buildingUse: Ref<string | null>;
  groundFloors: Ref<number>;
  floors: Ref<Floor[]>;
}

// Article27UserInput
export interface Article27UserInput {
  buildingUse: Ref<string | null>;
  siteArea: Ref<number | null>;
  buildingHeight: Ref<number | null>;
  totalArea: Ref<number | null>;
  groundFloors: Ref<number>;
  floors: Ref<Floor[]>;
  buildingStructure: Ref<
    "fire-resistant" | "quasi-fire-resistant" | "other" | null
  >;
}

// Article28UserInput
export interface Article28UserInput {
  buildingUse: Ref<string | null>;
  totalArea: Ref<number | null>;
  hasStageArea: Ref<boolean>;
  stageArea: Ref<number | null>;
  floors: Ref<Floor[]>;
}

// Article28_2UserInput
export interface Article28_2UserInput {
  buildingUse: Ref<string | null>;
  totalFloorAreaInput: Ref<number | null>;
  floors: Ref<Floor[]>;
}

// Article29UserInput
export interface Article29UserInput {
  buildingUse: Ref<string | null>;
  totalFloorAreaInput: Ref<number | null>;
  floors: Ref<Floor[]>;
  hasRoadPart: Ref<boolean>;
}

// Article29_2UserInput
export interface Article29_2UserInput {
  buildingUse: Ref<string | null>;
  totalFloorAreaInput: Ref<number | null>;
  floors: Ref<Floor[]>;
}

// Article29_3UserInput
export interface Article29_3UserInput {
  buildingUse: Ref<string | null>;
  totalFloorAreaInput: Ref<number | null>;
}

// その他型定義

export interface Floor {
  level: number;
  type: "ground" | "basement";
  floorArea: number | null;
  capacity: number | null;
  isWindowless: boolean;
  componentUses: ComponentUse[]; // 16項用: 各階の構成用途
}

export interface JudgementResult {
  required: boolean | "warning" | "info";
  message: string;
  basis: string;
}

// 共通パーキング情報（中期移行用）
export interface Parking {
  exists: boolean;
  // New split areas to represent parking parts by location
  // 屋上部分
  rooftopArea: number | null;
  // 地階又は二階以上の階にある駐車部分の床面積合計
  basementOrUpperArea: number | null;
  // 一階の駐車部分の床面積
  firstFloorArea: number | null;
  canAllVehiclesExitSimultaneously: boolean;
  mechanical: {
    present: boolean;
    capacity: number | null;
  };
}

export interface Article26Result {
  exitGuideLight: JudgementResult;
  corridorGuideLight: JudgementResult;
  auditoriumGuideLight: JudgementResult;
  guideSign: JudgementResult;
}

// 16項 構成用途
export interface ComponentUse {
  useCode: string;
  floorArea: number | null;
  capacity: number | null; // 収容人員
}
