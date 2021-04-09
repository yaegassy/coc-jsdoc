import { Range, TextDocument, Uri, window, workspace, ExtensionContext, OutputChannel } from 'coc.nvim';

import cp from 'child_process';
import fs from 'fs';
import path from 'path';
import tmp from 'tmp';

export async function doFormat(
  context: ExtensionContext,
  outputChannel: OutputChannel,
  document: TextDocument,
  range?: Range,
  isMethod?: boolean
): Promise<string> {
  if (
    document.languageId !== 'javascript' &&
    document.languageId !== 'javascriptreact' &&
    document.languageId !== 'javascript.jsx' &&
    document.languageId !== 'typescript' &&
    document.languageId !== 'typescript.tsx' &&
    document.languageId !== 'typescript.jsx' &&
    document.languageId !== 'typescriptreact'
  ) {
    throw 'lehre cannot run, not a support filetype';
  }

  const fileName = Uri.parse(document.uri).fsPath;
  let text = document.getText(range);

  let indentSpaceString: string;
  if (isMethod) {
    const curDocLength = text.split('\n')[0].length;
    const trimStartCurDocLength = text.split('\n')[0].trimStart().length;
    const indentLength = curDocLength - trimStartCurDocLength;
    indentSpaceString = ' '.repeat(indentLength);
    text = indentSpaceString + 'class ForJsDocDummyClass { ' + text;
  }

  const extensionConfig = workspace.getConfiguration('jsdoc');
  const formatterOption = extensionConfig.get('formatter', 'jsdoc');

  let binPath = extensionConfig.get('lehrePath', '');
  if (!binPath) {
    if (fs.existsSync(context.asAbsolutePath('node_modules/lehre/bin/lehre'))) {
      binPath = context.asAbsolutePath('node_modules/lehre/bin/lehre');
    } else {
      window.showErrorMessage('Unable to find the lehre.');
      return text;
    }
  } else {
    if (!fs.existsSync(binPath)) {
      window.showErrorMessage('Unable to find the lehre (user setting).');
      return text;
    }
  }

  const args: string[] = [];
  const opts = { cwd: path.dirname(fileName) };

  args.push('--write');
  args.push('--formatter', formatterOption);

  const tmpFile = tmp.fileSync();
  // MEMO: file extension is required
  tmpFile.name = tmpFile.name + path.basename(fileName);
  fs.writeFileSync(tmpFile.name, text);

  // ---- Output the command to be executed to channel log. ----
  outputChannel.appendLine(`${'#'.repeat(10)} jsdoc exec\n`);
  outputChannel.appendLine(`Run: ${binPath} ${args.join(' ')} -t ${tmpFile.name}`);
  outputChannel.appendLine(`binPath: ${binPath}`);
  outputChannel.appendLine(`args: ${args.join(' ')}`);
  outputChannel.appendLine(`tmpFile: ${tmpFile.name}`);

  return new Promise(function (resolve) {
    cp.execFile(binPath, [...args, '-t', tmpFile.name], opts, function (err) {
      if (err) {
        tmpFile.removeCallback();

        if (err.code === 'ENOENT') {
          window.showErrorMessage('Unable to find the lehre tool.');
          throw err;
        }

        window.showErrorMessage('There was an error while running lehre.');
        throw err;
      }

      const text = fs.readFileSync(tmpFile.name, 'utf-8');

      tmpFile.removeCallback();

      if (isMethod) {
        const wellFormedText = removeDummyClassRelatedText(text, indentSpaceString);
        resolve(wellFormedText);
      }

      resolve(text);
    });
  });
}

export function fullDocumentRange(document: TextDocument): Range {
  const lastLineId = document.lineCount - 1;
  const doc = workspace.getDocument(document.uri);

  return Range.create({ character: 0, line: 0 }, { character: doc.getline(lastLineId).length, line: lastLineId });
}

function removeDummyClassRelatedText(text: string, indentSpaceString: string): string {
  text = text.replace(/\s*\/\*\*\n\s*\*\s*ForJsDocDummyClass.\n\s*\*\/\n/, '');
  text = text.replace(indentSpaceString + 'class ForJsDocDummyClass { ', '');
  return text;
}
