
import { computed} from 'vue';
import { useCodeMatches } from '@/composables/utils';
import type { JudgementResult, Article24UserInput } from '@/types';

export function useArticle24Logic(userInput: Article24UserInput) {
  const regulationResult = computed((): JudgementResult => {
    const {
      buildingUse,
      totalCapacity,
      groundFloors,
      basementFloors,
      floors,
    } = userInput;

    const use = buildingUse.value;
    const capacity = totalCapacity.value ?? 0;

    if (!use) {
      return { required: false, message: '建物の用途を選択してください。', basis: '-' };
    }

    const EXEMPTION_MESSAGE_1 = 'ただし、自動火災報知設備又は非常警報設備が設置されている場合は免除されます。';
    const EXEMPTION_MESSAGE_2 = 'ただし、自動火災報知設備が設置されている場合は免除されます。';

    // --- 第3項のチェック（最も厳しい要件から） ---
    const para3_item1_uses = ['item16_2', 'item16_3'];
    const para3_item4_groupA = ['item01', 'item02', 'item03', 'item04', 'item05_i', 'item06', 'item09_i'];
    const para3_item4_groupB = ['item05_ro', 'item07', 'item08'];

    if (useCodeMatches(use, para3_item1_uses)) {
      return {
        required: true,
        message: '用途（(16の2)項または(16の3)項）に該当するため、非常ベル及び放送設備、又は自動式サイレン及び放送設備の設置が必要です。',
        basis: '令第24条第3項第1号',
      };
    }
    if (groundFloors.value >= 11 || basementFloors.value >= 3) {
      return {
        required: true,
        message: `地階を除く階数が11以上、又は地階の階数が3以上であるため、非常ベル及び放送設備、又は自動式サイレン及び放送設備の設置が必要です。`,
        basis: '令第24条第3項第2号',
      };
    }
    if (useCodeMatches(use, ['item16_i']) && capacity >= 500) {
      return {
        required: true,
        message: '用途が(16)項イで収容人員が500人以上のため、非常ベル及び放送設備、又は自動式サイレン及び放送設備の設置が必要です。',
        basis: '令第24条第3項第3号',
      };
    }
    if (useCodeMatches(use, para3_item4_groupA) && capacity >= 300) {
        return {
            required: true,
            message: `特定用途（${use}）で収容人員が300人以上のため、非常ベル及び放送設備、又は自動式サイレン及び放送設備の設置が必要です。`,
            basis: '令第24条第3項第4号',
        };
    }
    if (useCodeMatches(use, para3_item4_groupB) && capacity >= 800) {
        return {
            required: true,
            message: `特定用途（${use}）で収容人員が800人以上のため、非常ベル及び放送設備、又は自動式サイレン及び放送設備の設置が必要です。`,
            basis: '令第24条第3項第4号',
        };
    }

    // --- 第2項のチェック ---
    const para2_item1_uses = ['item05_i', 'item06_i', 'item09_i'];
    const basementOrWindowlessCapacity = floors.value
        .filter(f => f.type === 'basement' || f.isWindowless)
        .reduce((sum, f) => sum + (f.capacity ?? 0), 0);

    if (useCodeMatches(use, para2_item1_uses) && capacity >= 20) {
        return {
            required: true,
            message: `特定用途（${use}）で収容人員が20人以上のため、非常ベル、自動式サイレン又は放送設備の設置が必要です。${EXEMPTION_MESSAGE_2}`,
            basis: '令第24条第2項第1号',
        };
    }

    const para2_item2_uses = ['item01', 'item02', 'item03', 'item04', 'item05', 'item06', 'item07', 'item08', 'item09', 'item10', 'item11', 'item12', 'item13', 'item14', 'item15', 'item16', 'item17'];
    if (useCodeMatches(use, para2_item2_uses) && !useCodeMatches(use, para2_item1_uses)) {
        if (capacity >= 50 || basementOrWindowlessCapacity >= 20) {
            return {
                required: true,
                message: `収容人員が50人以上、又は地階・無窓階の収容人員が20人以上のため、非常ベル、自動式サイレン又は放送設備の設置が必要です。${EXEMPTION_MESSAGE_2}`,
                basis: '令第24条第2項第2号',
            };
        }
    }

    // --- 第1項のチェック ---
    const para1_uses = ['item04', 'item06_ro', 'item06_ha', 'item06_ni', 'item09_ro', 'item12'];
    if (useCodeMatches(use, para1_uses) && capacity >= 20 && capacity < 50) {
        return {
            required: true,
            message: `特定用途で収容人員が20人以上50人未満のため、非常警報器具の設置が必要です。${EXEMPTION_MESSAGE_1}`,
            basis: '令第24条第1項',
        };
    }

    return { required: false, message: '非常警報器具・設備の設置義務はありません。', basis: '-' };
  });

  return {
    regulationResult,
  };
}
