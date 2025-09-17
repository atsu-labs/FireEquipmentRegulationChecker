# 指示

## 手順
- 構造化された法令が".Agents/json/article*.json"にあります。
- これをロジックにして"src/composables/article*Logic.ts"を作成します。
- 入力値は"App.vue"から受け取ります。
- 入力項目は"components/BuildingInputStepper.vue"に、判定結果は"components/ResultsPanel.ts"で処理します。
- 現在の入力で判断できないことは、入力項目を追加するか、判断できないことを返します。
- "composables/"にはすでに１０条、１１条、１２条、２１条のロジックとテストがあります。
- これらに倣ってロジックとテストを作成してください。
