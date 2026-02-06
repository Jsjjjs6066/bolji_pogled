import * as vscode from 'vscode';

function max(a: number, b: number): number {
    if (a > b) {
        return a;
    }
    return b;
}

const MINIMUM_FONT_SIZE = 20;

function setupDebugFont(context: vscode.ExtensionContext) {
    let font: number | undefined = vscode.workspace.getConfiguration("debug").get("console.fontSize");
    if (font === undefined) {
        font = 0;
    }
    vscode.workspace.getConfiguration("debug").update("console.fontSize", max(font, MINIMUM_FONT_SIZE));
}

function setupTerminalFont(context: vscode.ExtensionContext) {
    let font: number | undefined = vscode.workspace.getConfiguration("terminal").get("integrated.fontSize");
    if (font === undefined) {
        font = 0;
    }
    vscode.workspace.getConfiguration("terminal").update("integrated.fontSize", max(font, MINIMUM_FONT_SIZE));
}

export function activate(context: vscode.ExtensionContext) {
    setupDebugFont(context);
    setupTerminalFont(context);
}