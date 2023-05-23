
import * as vscode from 'vscode';

export async function getProjects(basePath: string){
    
    const baseDirectoryFiles = await vscode.workspace.fs.readDirectory(
        vscode.Uri.file(basePath)
    );
    
    return baseDirectoryFiles
        
        // filter out files that are not directories
        .filter(([name, type]) => type === vscode.FileType.Directory)
        
        // the format should match that of the items needed for the QuickPick
        .map(([name, type]) => {
            return {
                label: name,
            }
        });
    
}
