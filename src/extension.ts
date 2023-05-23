
import * as vscode from 'vscode';
import { getProjects } from './lib/project';
import { getBasePath, setBasePath } from './lib/base-path';

export function activate(context: vscode.ExtensionContext) {
    
    context.subscriptions.push(
        vscode.commands.registerCommand('project-launcher.setBasePath', () => {
            // open the file picker
            vscode.window.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
                openLabel: 'Select Base Path'
            }).then(async uri => {
                if(!uri){
                    return;
                }
                const path = uri[0].fsPath;
                // set the base path
                await setBasePath(path);
                // re-open the project launcher
                vscode.commands.executeCommand('project-launcher.projectLauncher');
            });
            
        })
    );
    
    // open the project launcher command menu
    context.subscriptions.push(
    	vscode.commands.registerCommand('project-launcher.projectLauncher', async () => {
            
            const pick = vscode.window.createQuickPick();
            pick.title = 'Project Launcher';
            pick.canSelectMany = false;
            
            // get the base path
            const basePath = await getBasePath();
            
            if(!basePath){
                // execute the command to set the base path
                pick.items = [
                    {
                        label: 'Set the base path..',
                    }
                ]
                pick.onDidChangeSelection(selection => {
                    if (selection[0]) {
                        vscode.commands.executeCommand('project-launcher.setBasePath');
                    }
                });
                pick.onDidHide(() => pick.dispose());
                pick.show();
                return;
            }
            
            // if the base path has been set, get projects at that base path
            const projects = await getProjects(basePath.toString());
            pick.items = projects;
            
            // if a project does not match with the input, show a create project option
            
            pick.onDidChangeValue(value => {
                // check if there's an exact match, if there's not, show a create option
                const exactMatch = projects.find(project => project.label.toLowerCase() === value.toLowerCase());
                if(!exactMatch){
                    // the create item should always show at the top
                    pick.items = [
                        {
                            label: `create: ${value}`,
                        },
                        ...projects
                    ];
                }else{
                    pick.items = projects;
                }
            });
            
            pick.onDidChangeSelection(async selection => {
                if (selection[0]) {
                    if(selection[0].label.startsWith('create:')){
                        // create the project
                        const projectName = selection[0].label.replace('create: ', '');
                        const projectPath = `${basePath}/${projectName}`;
                        await vscode.workspace.fs.createDirectory(vscode.Uri.file(projectPath));
                        vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(projectPath));
                        return;
                    }else{
                        // launch the project
                        const project = selection[0].label;
                        const projectPath = `${basePath}/${project}`;
                        vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(projectPath));
                    }
                }
            });
            
            pick.onDidHide(() => pick.dispose());
            pick.show();
            
    	})
    );

}
