export interface BuildingUse {
  value: string;
  title: string;
}

export const buildingUses: BuildingUse[] = [
  { value: 'residential', title: '一般住宅' },
  { value: 'commercial', title: '商業施設' },
  { value: 'industrial', title: '工業施設' },
  { value: 'office', title: '事務所' },
  { value: 'school', title: '学校' },
];
