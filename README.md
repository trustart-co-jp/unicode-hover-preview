# Unicode Hover Preview

VSCode拡張機能：Unicode文字列にマウスオーバーすると、指定したフォントで対応する文字を表示します。

## 機能

- Unicode文字列（`u\abcd`, `\uabcd`, `\xab`, `0xabcd`形式）の検出
- マウスオーバー時にUnicode文字を表示
- カスタムフォントの指定
- フォントサイズの調整
- 文字情報（Unicode値、10進数値、文字分類）の表示

## 使用方法

1. コードエディタでUnicode文字列にマウスオーバー
2. ホバーポップアップで文字が表示される
3. `Ctrl+Shift+P` → "Set Unicode Preview Font" でフォントを変更

## 対応形式

- `u\1234` - バックスラッシュ付きu記法
- `\u1234` - 標準Unicode記法
- `\x41` - 16進数記法
- `0x1234` - 16進数プレフィックス記法

## 設定

- `unicodeHoverPreview.fontFamily`: プレビューフォント（デフォルト: Arial Unicode MS）
- `unicodeHoverPreview.fontSize`: フォントサイズ（デフォルト: 24）
- `unicodeHoverPreview.enabled`: 機能の有効/無効（デフォルト: true）

## 開発・ビルド

```bash
pnpm i
pnpm run compile
```

## インストール

1. プロジェクトをビルド
2. F5キーでデバッグ実行
3. またはVSCEでパッケージング
   1. パッケージングは `npx vsce package` で行えます

## 例

コードに `u\3042` と書くと、ホバー時に「あ」が表示されます。
