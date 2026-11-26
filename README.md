# MusicTheory

小さな作曲スケッチ環境。Bass / Drums / Pad の3トラックを編集し、MIDIでローカルDAWへ渡します。

## 起動

Node.js 22以降を使用します。

```bash
npm start
```

`http://127.0.0.1:8000` を開きます。

AIアレンジを使う場合は、OpenAI APIキーを環境変数に設定してから起動します。

macOS / Linux:

```bash
export OPENAI_API_KEY="your-api-key"
npm start
```

Windows PowerShell:

```powershell
$env:OPENAI_API_KEY="your-api-key"
npm start
```

既定モデルは `gpt-5.6-luna` です。変更する場合は `OPENAI_MODEL` を設定してください。API利用料はChatGPTの月額プランとは別です。キーはブラウザやGitHubへ置かず、ローカルサーバーの環境変数にだけ設定してください。

## 操作

- KEY / SCALE / BPM / 拍子 / 小節数 / 度数を設定
- 「MIDIを作成」で3トラックの草案を生成
- ノートをクリックで追加、ドラッグで移動
- 空白をドラッグして範囲選択、Shift+クリックで削除
- 再生して確認し、MIDIを書き出す
- 「アレンジ指示」で変更対象を「コード」または「リズム」に分けて依頼
- AI生成後は候補1を自動反映。候補を切り替えたり、元に戻したりできます

リズム変更では音程・音数・ベロシティを保持します。コード変更ではDrumsを保持し、PadとBassを編集対象にします。

## 制約

- 最大16小節
- 3トラック固定: Bass（単音）、Drums（Kick / Snare / Hi-hat）、Pad（コード）
- ブラウザ内の簡易音源は確認用
- AI連携はローカルNodeサーバー経由。GitHub Pagesは静的サイトのため、AI自動生成は使えません。Pagesでは手動プロンプト／JSON入出力を利用します。
- ブラウザのMIDI処理には `@tonejs/midi` をesm.shから読み込みます。

## データベース

1. Progression Library
2. Harmony Technique Library
3. Style & Mood Library
4. Arrangement Library
5. Composition Rules

出典のある理論、学術研究、プロジェクト独自の仮説を区別します。`review_status: pending` のレコードは画面に表示しますが、AIの参照対象から除外します。情報の追加手順は [INGESTION_WORKFLOW.md](docs/INGESTION_WORKFLOW.md) を参照してください。

## テスト

```bash
npm test
```

## GitHub Pages

[公開アプリ](https://sachitama2001.github.io/MusicTheory/) は静的版です。公開設定は [DEPLOYMENT.md](docs/DEPLOYMENT.md) を参照してください。

## 主な仕様

- [PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md)
- [LLM_WORKFLOW.md](docs/LLM_WORKFLOW.md)
- [DATA_MODEL.md](docs/DATA_MODEL.md)
- [SOURCES.md](docs/SOURCES.md)

## License

まだライセンスは設定していません。再配布する前に追加してください。
