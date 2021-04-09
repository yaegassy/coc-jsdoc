import { TextDocument, CodeAction, CodeActionContext, CodeActionProvider, Range, workspace, Document } from 'coc.nvim';

export class JsdocCodeActionProvider implements CodeActionProvider {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async provideCodeActions(document: TextDocument, range: Range, context: CodeActionContext) {
    const extensionConfig = workspace.getConfiguration('jsdoc');
    const isEnableFileAction = extensionConfig.get('enableFileAction', false);

    let isMethod: boolean;

    const doc = workspace.getDocument(document.uri);

    const codeActions: CodeAction[] = [];

    /** Line */
    // TODO: Only add actions if the "range.start.line" can be handled by "lehre"
    if (range.start.line === range.end.line && range.start.character === 0) {
      const fullTextLine = doc.getLines().length;
      let endBlockLine = range.end.line;

      isMethod = this.checkMethodStatement(doc, range);

      for (let i = range.start.line; i < fullTextLine; i++) {
        if (doc.getline(i).match(/\).*{$/) || doc.getline(i).match(/.*{.*}$/)) {
          endBlockLine = i + 1;
          break;
        }
      }

      const resolveRange = Range.create(
        { character: range.start.character, line: range.start.line },
        { character: range.end.character, line: endBlockLine }
      );

      const title = `Add document block for "Line" by jsdoc`;
      const command = {
        title: '',
        command: 'jsdoc.runAction',
        arguments: [document, resolveRange, isMethod],
      };

      const action: CodeAction = {
        title,
        command,
      };

      codeActions.push(action);
    }

    /** Range */
    // TODO: Only add actions if the "range.start.line" can be handled by "lehre"
    if (range.start.line < range.end.line && !this.wholeRange(doc, range)) {
      const fullTextLine = doc.getLines().length;
      let endBlockLine = range.end.line;

      isMethod = this.checkMethodStatement(doc, range);

      for (let i = range.start.line; i < fullTextLine; i++) {
        if (doc.getline(i).match(/\).*{$/) || doc.getline(i).match(/.*{.*}$/)) {
          endBlockLine = i + 1;
          break;
        }
      }

      const resolveRange = Range.create(
        { character: range.start.character, line: range.start.line },
        { character: range.end.character, line: endBlockLine }
      );

      const title = `Add document block for "Range" by jsdoc`;
      const command = {
        title: '',
        command: 'jsdoc.runAction',
        arguments: [document, resolveRange, isMethod],
      };

      const action: CodeAction = {
        title,
        command,
      };

      codeActions.push(action);
    }

    /** Whole (File) */
    if (this.wholeRange(doc, range) && isEnableFileAction) {
      const title = `Add document block for "File" by jsdoc`;
      const command = {
        title: '',
        command: 'jsdoc.runAction',
        arguments: [document, range],
      };

      const action: CodeAction = {
        title,
        command,
      };

      codeActions.push(action);
    }

    return codeActions;
  }

  private wholeRange(doc: Document, range: Range): boolean {
    const whole = Range.create(0, 0, doc.lineCount, 0);
    return (
      whole.start.line === range.start.line &&
      whole.start.character === range.start.character &&
      whole.end.line === range.end.line &&
      whole.end.character === whole.end.character
    );
  }

  // TODO: This is currently a temporary decision process. Will be enhanced in the future.
  private checkMethodStatement(doc: Document, range: Range): boolean {
    // main symbol
    if (doc.getline(range.start.line).match(/^.*\s*(function|class|type|interface)\s*.*$/)) {
      return false;
    }

    // es6 function
    if (doc.getline(range.start.line).match(/^.*\s*=\s*\(.*\).*{$/)) {
      return false;
    }

    // methods
    if (doc.getline(range.start.line).match(/^.*\s*[a-zA-Z0-9_$]+\(.*\).*$/)) {
      return true;
    }

    return false;
  }
}

export default JsdocCodeActionProvider;
