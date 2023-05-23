
import * as vscode from 'vscode';

export async function getBasePath(){
    return await vscode.workspace
        .getConfiguration()
        .get('projectlauncher.basePath');
}

export async function setBasePath(path: string){
    return await vscode.workspace
        .getConfiguration()
        .update('projectlauncher.basePath', path, true);
}
