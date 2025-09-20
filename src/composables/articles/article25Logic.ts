import { computed} from 'vue';
import { useCodeMatches } from '@/composables/utils';
import type { JudgementResult, Article25UserInput } from '@/types';

export function useArticle25Logic(userInput: Article25UserInput) {
  const regulationResult = computed((): JudgementResult => {
    const { buildingUse, floors } = userInput;

    // 避難階及び11階以上の階は判定対象外 
    // 避難階の判定は未実装
    const targetFloors = floors.value.filter(f =>  f.level < 11);

    for (const floor of targetFloors) {
      const floorIdentifier = floor.type === 'basement' ? '地階' : `${floor.level}階`;
      const capacity = floor.capacity || 0;

      // 1号: (6)項
      if (useCodeMatches(buildingUse.value, ['item06'])) {
        if (floor.level >= 2 || floor.type === 'basement') {
          if (capacity >= 20) {
            return {
              required: 'warning',
              message: `(6)項の${floorIdentifier}は、収容人員が20人以上です。下階に特定用途がない場合でも避難器具が必要です。下階の用途を確認してください。`,
              basis: '令第25条第1項第1号',
            };
          }
          if (capacity >= 10) {
            return {
              required: 'warning',
              message: `(6)項の${floorIdentifier}は、収容人員が10人以上です。下階に特定用途（(1)～(4)項など）がある場合、避難器具が必要です。下階の用途を確認してください。`,
              basis: '令第25条第1項第1号',
            };
          }
        }
      }

      // 2号: (5)項
      if (useCodeMatches(buildingUse.value, ['item05'])) {
        if (floor.level >= 2 || floor.type === 'basement') {
          if (capacity >= 30) {
            return {
              required: 'warning',
              message: `(5)項の${floorIdentifier}は、収容人員が30人以上です。下階に特定用途がない場合でも避難器具が必要です。下階の用途を確認してください。`,
              basis: '令第25条第1項第2号',
            };
          }
          if (capacity >= 10) {
            return {
              required: 'warning',
              message: `(5)項の${floorIdentifier}は、収容人員が10人以上です。下階に特定用途（(1)～(4)項など）がある場合、避難器具が必要です。下階の用途を確認してください。`,
              basis: '令第25条第1項第2号',
            };
          }
        }
      }

      // 3号: (1)~(4), (7)~(11)項
      const item3Codes = ['item01', 'item02', 'item03', 'item04', 'item07', 'item08', 'item09', 'item10', 'item11'];
      if (useCodeMatches(buildingUse.value, item3Codes)) {
        if ((floor.level >= 2 || floor.type === 'basement') && capacity >= 50) {
          return {
            required: 'warning',
            message: `(1)～(4)項、(7)～(11)項の${floorIdentifier}は、収容人員が50人以上です。2階が耐火構造でない場合、避難器具が必要です。建物の構造を確認してください。`,
            basis: '令第25条第1項第3号',
          };
        }
      }

      // 4号: (12), (15)項
      const item4Codes = ['item12', 'item15'];
      if (useCodeMatches(buildingUse.value, item4Codes)) {
        if (floor.level >= 3 || floor.type === 'basement') {
          if (capacity >= 150) {
            return {
              required: 'warning',
              message: `(12)項、(15)項の${floorIdentifier}は、収容人員が150人以上です。無窓階でない場合でも避難器具が必要です。無窓階かどうか確認してください。`,
              basis: '令第25条第1項第4号',
            };
          }
          if (capacity >= 100) {
            return {
              required: 'warning',
              message: `(12)項、(15)項の${floorIdentifier}は、収容人員が100人以上です。この階が無窓階の場合、避難器具が必要です。無窓階かどうか確認してください。`,
              basis: '令第25条第1項第4号',
            };
          }
        }
      }

      // 5号: その他すべて
      const item5SpecialCases = useCodeMatches(buildingUse.value, ['item02', 'item03']) || (buildingUse.value?.startsWith('item16_i') && false); // TODO: 16項イの下階判定
      if ((floor.level >= 3 || (item5SpecialCases && floor.level >= 2)) && capacity >= 10) {
        return {
          required: 'warning',
          message: `${floorIdentifier}は、収容人員が10人以上です。地上への直通階段が1つ以下の場合、避難器具が必要です。階段の数を確認してください。`,
          basis: '令第25条第1項第5号',
        };
      }
    }

    return {
      required: false,
      message: '避難器具の設置義務の条件に該当しません。',
      basis: '',
    };
  });

  return {
    regulationResult,
  };
}
