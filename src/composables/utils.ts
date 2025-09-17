import { buildingUses } from '@/data/buildingUses';

// annexedCodeから日本語の用途名を取得するヘルパー関数
export function getUseDisplayName(code: string | null): string {
  if (!code) return '不明';
  const found = buildingUses.find(u => u.annexedCode === code);
  return found ? found.annexedName : code;
}

// buildingUse(annexedCode)がrequiredCodesのいずれかに前方一致するかを確認するヘルパー関数
export const useCodeMatches = (buildingUse: string | null, requiredCodes: string[]): boolean => {
  if (!buildingUse) {
    return false;
  }
  return requiredCodes.some(code => buildingUse.startsWith(code));
};
