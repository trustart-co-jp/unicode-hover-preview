import * as vscode from "vscode"

/**
 * 拡張機能をアクティベートします
 * @param context - 拡張機能のコンテキスト
 */
export function activate(context: vscode.ExtensionContext) {
  const provider = new UnicodeHoverProvider()

  // 全ての言語に対してホバープロバイダーを登録
  const hoverDisposable = vscode.languages.registerHoverProvider({ scheme: "file" }, provider)

  // フォント設定用のコマンドを登録
  const commandDisposable = vscode.commands.registerCommand("unicodeHoverPreview.setFont", () => {
    provider.showFontPicker()
  })

  context.subscriptions.push(hoverDisposable, commandDisposable)
}

/**
 * 拡張機能を非アクティベートします
 */
export function deactivate() {}

/**
 * Unicode文字のホバープレビューを提供するプロバイダークラス
 */
class UnicodeHoverProvider implements vscode.HoverProvider {
  /**
   * ホバー情報を提供します
   * @param document - テキストドキュメント
   * @param position - カーソル位置
   * @param token - キャンセルトークン
   * @returns ホバー情報
   */
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    _: vscode.CancellationToken,
  ): vscode.ProviderResult<vscode.Hover> {
    const config = vscode.workspace.getConfiguration("unicodeHoverPreview")
    if (!config.get("enabled", true)) {
      return
    }

    const wordRange = document.getWordRangeAtPosition(
      position,
      /u\\[0-9a-fA-F]{4,6}|\\u[0-9a-fA-F]{4}|\\x[0-9a-fA-F]{2}|0x[0-9a-fA-F]+/,
    )
    if (!wordRange) {
      return
    }

    const word = document.getText(wordRange)
    const unicodeValue = this.parseUnicodeString(word)

    if (unicodeValue === null) {
      return
    }

    return this.createHover(unicodeValue, wordRange)
  }

  /**
   * Unicode文字列を解析してコードポイントを取得します
   * @param text - 解析対象のテキスト
   * @returns Unicodeコードポイント、解析失敗時はnull
   */
  private parseUnicodeString(text: string): number | null {
    // 様々なUnicode形式を処理
    if (text.startsWith("u\\")) {
      // u\abcd format
      const hex = text.substring(2)
      return parseInt(hex, 16)
    } else if (text.startsWith("\\u")) {
      // \uabcd format
      const hex = text.substring(2)
      return parseInt(hex, 16)
    } else if (text.startsWith("\\x")) {
      // \xab format
      const hex = text.substring(2)
      return parseInt(hex, 16)
    } else if (text.startsWith("0x")) {
      // 0xabcd format
      const hex = text.substring(2)
      return parseInt(hex, 16)
    }

    return null
  }

  /**
   * ホバー表示を作成します
   * @param unicodeValue - Unicodeコードポイント
   * @param range - 表示範囲
   * @returns ホバーオブジェクト
   */
  private createHover(unicodeValue: number, range: vscode.Range): vscode.Hover {
    const config = vscode.workspace.getConfiguration("unicodeHoverPreview")
    const fontFamily = config.get("fontFamily", "Arial Unicode MS")
    const fontSize = config.get("fontSize", 24)

    try {
      const character = String.fromCodePoint(unicodeValue)
      const charName = this.getUnicodeCharacterName(unicodeValue)

      // カスタムフォントスタイリングでHTMLを作成
      const html = `<div style="font-family: '${fontFamily}', sans-serif; font-size: ${fontSize}px; text-align: center; padding: 10px;">
                    <div style="font-size: ${fontSize * 2}px; margin-bottom: 10px;">${character}</div>
                    <div style="font-size: 12px; color: #888;">
                        <strong>Unicode:</strong> U+${unicodeValue.toString(16).toUpperCase().padStart(4, "0")}<br />
                        <strong>Decimal:</strong> ${unicodeValue}<br />
                        <strong>Character:</strong> ${charName}<br />
                        <strong>See:</strong><a href="https://symbl.cc/en/${unicodeValue.toString(16).toUpperCase().padStart(4, "0")}/" target="_blank"> symbl.cc</a>
                    </div>
                </div>`

      const markdown = new vscode.MarkdownString(html)
      markdown.supportHtml = true
      markdown.isTrusted = true

      return new vscode.Hover(markdown, range)
    } catch (_) {
      // 無効なUnicodeコードポイント
      const markdown = new vscode.MarkdownString()
      markdown.appendMarkdown(`**Invalid Unicode:** U+$unicodeValue.toString(16).toUpperCase()`)
      return new vscode.Hover(markdown, range)
    }
  }

  /**
   * Unicodeコードポイントから文字の名前を取得します
   * @param codePoint - Unicodeコードポイント
   * @returns 文字ブロックの名前
   */
  private getUnicodeCharacterName(codePoint: number): string {
    // Basic character name mapping for common ranges
    if (codePoint >= 0x0020 && codePoint <= 0x007f) {
      return "ASCII Character"
    } else if (codePoint >= 0x00a0 && codePoint <= 0x00ff) {
      return "Latin-1 Supplement"
    } else if (codePoint >= 0x0100 && codePoint <= 0x017f) {
      return "Latin Extended-A"
    } else if (codePoint >= 0x0180 && codePoint <= 0x024f) {
      return "Latin Extended-B"
    } else if (codePoint >= 0x2000 && codePoint <= 0x206f) {
      return "General Punctuation"
    } else if (codePoint >= 0x2190 && codePoint <= 0x21ff) {
      return "Arrows"
    } else if (codePoint >= 0x2200 && codePoint <= 0x22ff) {
      return "Mathematical Operators"
    } else if (codePoint >= 0x1f600 && codePoint <= 0x1f64f) {
      return "Emoticons"
    } else if (codePoint >= 0x1f300 && codePoint <= 0x1f5ff) {
      return "Miscellaneous Symbols"
    } else {
      return `Unicode Block (U+${codePoint.toString(16).toUpperCase()})`
    }
  }

  /**
   * フォント選択ダイアログを表示します
   */
  async showFontPicker() {
    const currentFont = vscode.workspace
      .getConfiguration("unicodeHoverPreview")
      .get("fontFamily", "Arial Unicode MS")

    const fonts = [
      "Arial Unicode MS",
      "Segoe UI Symbol",
      "Segoe UI Emoji",
      "Apple Color Emoji",
      "Noto Color Emoji",
      "SF Pro Display",
      "Helvetica Neue",
      "Arial",
      "Times New Roman",
      "Courier New",
    ]

    const selectedFont = await vscode.window.showQuickPick(fonts, {
      placeHolder: `Current font: $currentFont`,
      title: "Select Unicode Preview Font",
    })

    if (selectedFont) {
      await vscode.workspace
        .getConfiguration("unicodeHoverPreview")
        .update("fontFamily", selectedFont, vscode.ConfigurationTarget.Global)
      vscode.window.showInformationMessage(`Unicode preview font set to: $selectedFont`)
    }
  }
}
