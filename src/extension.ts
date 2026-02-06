import * as vscode from 'vscode';
import { activate as activateNoLines } from './no_lines';
import { activate as activateColors } from './colors';
import { activate as activateSize } from './size';

export function activate(context: vscode.ExtensionContext) {
	activateNoLines(context);
	activateColors(context);
	activateSize(context);
}

export function deactivate() {}
