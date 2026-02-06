import * as vscode from 'vscode';
import * as colorsModule from './colors';
import { loadColorsFromConfig } from './test/colors';

// Show colored decorations for diagnostics and update them when configuration changes
export function activate(context: vscode.ExtensionContext) {
    const transparency = 0.2;
    const transparencyBorder = 0.6;

    let errorDecorationType: vscode.TextEditorDecorationType | undefined;
    let warningDecorationType: vscode.TextEditorDecorationType | undefined;

    function rgbaFromColor(c: vscode.Color | undefined, alpha: number) {
        if (!c) return 'rgba(0, 0, 0, 0)';
        const r = Math.round(clamp01(c.red) * 255);
        const g = Math.round(clamp01(c.green) * 255);
        const b = Math.round(clamp01(c.blue) * 255);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function createDecorationTypes() {
        // Dispose old ones
        if (errorDecorationType) {
            errorDecorationType.dispose();
        }
        if (warningDecorationType) {
            warningDecorationType.dispose();
        }

        // Get current color values dynamically
        const currentErrorColor = colorsModule.errorColor;
        const currentWarningColor = colorsModule.warningColor;
        console.log('[no_lines] creating decorations with colors:', {
            errorColor: currentErrorColor,
            warningColor: currentWarningColor
        });

        errorDecorationType = vscode.window.createTextEditorDecorationType({
            border: `0.5px solid ${rgbaFromColor(currentErrorColor, transparencyBorder)}`,
            borderRadius: '5px',
            overviewRulerLane: vscode.OverviewRulerLane.Full,
            backgroundColor: rgbaFromColor(currentErrorColor, transparency),
            fontWeight: 'bold',
        });

        warningDecorationType = vscode.window.createTextEditorDecorationType({
            border: `0.5px solid ${rgbaFromColor(currentWarningColor, transparencyBorder)}`,
            borderRadius: '5px',
            overviewRulerLane: vscode.OverviewRulerLane.Full,
            backgroundColor: rgbaFromColor(currentWarningColor, transparency),
            textDecoration: 'none',
            fontWeight: 'bold',
        });
    }

    // Funkcija koja ažurira pravokutnike
    function updateDecorations() {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            return;
        }

        const diagnostics = vscode.languages.getDiagnostics(activeEditor.document.uri);

        const errorRanges: vscode.Range[] = [];
        const warningRanges: vscode.Range[] = [];

        diagnostics.forEach(diagnostic => {
            if (diagnostic.severity === vscode.DiagnosticSeverity.Error) {
                errorRanges.push(diagnostic.range);
            } else if (diagnostic.severity === vscode.DiagnosticSeverity.Warning) {
                warningRanges.push(diagnostic.range);
            }
        });

        if (errorDecorationType) {
            activeEditor.setDecorations(errorDecorationType, errorRanges);
        }
        if (warningDecorationType) {
            activeEditor.setDecorations(warningDecorationType, warningRanges);
        }
    }

    // Initialize
    createDecorationTypes();
    updateDecorations();

    // Update on relevant events
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(() => updateDecorations()));
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(() => updateDecorations()));
    context.subscriptions.push(vscode.languages.onDidChangeDiagnostics(() => updateDecorations()));

    // Recreate decoration types when color config changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(async (e) => {
            if (
                e.affectsConfiguration('bolji-pogled.errorColor') ||
                e.affectsConfiguration('bolji-pogled.warningColor')
            ) {
                console.log('[no_lines] configuration changed, reloading colors');
                // Ensure latest values from config are loaded
                try {
                    await loadColorsFromConfig();
                } catch (err) {
                    console.error('[no_lines] error loading colors:', err);
                }
                createDecorationTypes();
                updateDecorations();
            }
        })
    );
}

function clamp01(n: number): number {
    if (Number.isNaN(n)) return 0;
    return Math.min(1, Math.max(0, n));
}