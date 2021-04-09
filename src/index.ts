import { commands, ExtensionContext, window, workspace, languages, TextEdit, Range, TextDocument } from 'coc.nvim';

import { doFormat, fullDocumentRange } from './lehreEngine';
import JsdocCodeActionProvider from './action';

export async function activate(context: ExtensionContext): Promise<void> {
  const extensionConfig = workspace.getConfiguration('jsdoc');
  const isEnable = extensionConfig.get<boolean>('enable', true);
  if (!isEnable) return;

  const outputChannel = window.createOutputChannel('jsdoc');

  let binPath = extensionConfig.get('lehrePath', '');
  if (!binPath) {
    binPath = context.asAbsolutePath('node_modules/lehre/bin/lehre');
  }

  context.subscriptions.push(
    commands.registerCommand('jsdoc.runFile', async () => {
      const doc = await workspace.document;

      const code = await doFormat(context, outputChannel, doc.textDocument, undefined);
      const edits = [TextEdit.replace(fullDocumentRange(doc.textDocument), code)];
      if (edits) {
        await doc.applyEdits(edits);
      }
    })
  );

  context.subscriptions.push(
    commands.registerCommand(
      'jsdoc.runAction',
      async (document: TextDocument, range?: Range, isMethod?: boolean) => {
        const doc = workspace.getDocument(document.uri);

        let edits: TextEdit[];

        const code = await doFormat(context, outputChannel, document, range, isMethod);
        if (!range) {
          range = fullDocumentRange(document);
          edits = [TextEdit.replace(range, code)];
          if (edits) {
            return await doc.applyEdits(edits);
          }
        }

        // If there are no changes to the text, early return
        if (document.getText() === code) {
          return;
        }

        edits = [TextEdit.replace(range, code)];
        if (edits) {
          return await doc.applyEdits(edits);
        }
      },
      null,
      true
    )
  );

  const languageSelector = [
    { language: 'javascript', scheme: 'file' },
    { language: 'javascriptreact', scheme: 'file' },
    { language: 'javascript.jsx', scheme: 'file' },
    { language: 'typescript', scheme: 'file' },
    { language: 'typescript.tsx', scheme: 'file' },
    { language: 'typescript.jsx', scheme: 'file' },
    { language: 'typescriptreact', scheme: 'file' },
  ];

  const actionProvider = new JsdocCodeActionProvider();
  context.subscriptions.push(languages.registerCodeActionProvider(languageSelector, actionProvider, 'jsdoc'));
}
