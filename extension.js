'use strict'
var vscode = require('vscode');
var $$path = require('path');
var $$fs = require('fs');

function activate(context) {
    console.log('Congratulations, your extension "savebackup" is now active!');

    var disposable = vscode.commands.registerTextEditorCommand('extension.saveBackup.backupFile', (textEditor, edit) => {
        backupFile(textEditor.document);
    });
    vscode.workspace.onWillSaveTextDocument((event ) => {
        var sFilePath = event.document.fileName;
        if (sFilePath[0] === '/') {
            sFilePath = sFilePath.slice(1);
        }
        var oConf = vscode.workspace.getConfiguration('saveBackup.conf');

        if (oConf.enable) {

            var backupDir = getParsePath(oConf.backupDir);
            var sBakPath = buildeBakPath(sFilePath, backupDir);
            var ExistFolder = false;

            if ($$fs.existsSync(backupDir))
                ExistFolder = true;
            else {
                ExistFolder = true;
                createDirRecursively(backupDir);
            }

            if (ExistFolder) {
                try {
                    var sFileName = $$path.basename(sFilePath);
                    if (new RegExp(oConf.fileNameMatch).test(sFileName)) {
                        var sFileDir = $$path.dirname(sBakPath);
                        if (!$$fs.existsSync(sFileDir)) {
                            createDirRecursively(sFileDir);
                        }
                        event.waitUntil($$fs.copyFile('/'+ sFilePath, sBakPath, (err) => {
                            if (err) return callback(err)
                            callback(null, 'OK')
                        }))

                    }
                } catch (error) {
                    vscode.window.showErrorMessage(`extension.saveBackup : ${error.message}`);
                }
            }
        }
    });
    vscode.workspace.onDidSaveTextDocument((document) => {
        // backupFile(document);
    });

    context.subscriptions.push(disposable);
}

function backupFile(document) {
    var sFileText = document.getText();
    var sFilePath = document.uri.path;
    if (sFilePath[0] === '/') {
        sFilePath = sFilePath.slice(1); 
    }
    var oConf = vscode.workspace.getConfiguration('saveBackup.conf');

    if (oConf.enable) {
        
        var backupDir = getParsePath(oConf.backupDir);
        console.log(backupDir);
        var sBakPath = buildeBakPath(sFilePath, backupDir);
        var ExistFolder = false;

        if ($$fs.existsSync(backupDir)) 
            ExistFolder = true;
        else {
            ExistFolder = true;
            createDirRecursively(backupDir);
        }

        if (ExistFolder) {
            try {
                var sFileName = $$path.basename(sFilePath);
                if (new RegExp(oConf.fileNameMatch).test(sFileName)) {
                    var sFileDir = $$path.dirname(sBakPath);
                    if (!$$fs.existsSync(sFileDir)) {
                        createDirRecursively(sFileDir);
                        // $$fs.mkdirSync(sFileDir, {
                        //     recursive: true
                        // });
                    }
                    $$fs.writeFileSync(sBakPath, sFileText); 
                }
            } catch (error) {
                vscode.window.showErrorMessage(`extension.saveBackup : ${error.message}`);
            }
        }
    }
}

function createDirRecursively(dir) {
    if (!$$fs.existsSync(dir)) {
        createDirRecursively($$path.join(dir, ".."));
        $$fs.mkdirSync(dir);
    }
}

function buildeBakPath(sFilePath, sBackupDir) {
    var sNewPath = sFilePath.replace(/[\:]/g, '');
    // var sNewPath = sNewPath1.replace(/[\.]/g, '_');
    var sR = $$path.join(sBackupDir, sNewPath);
    var sExName = $$path.extname(sFilePath);
    var oD = new Date(); 
    var sTime = `${oD.getFullYear()}${c2(oD.getMonth()+1)}${c2(oD.getDate())}`;
    sTime += `_${c2(oD.getHours())}${c2(oD.getMinutes())}${c2(oD.getSeconds())}` + '_' + (+oD).toString().slice(-3);
    sR = $$path.join(sR, sTime + sExName).replace(/\\/g, '/');

    return sR;
}
function getParsePath(sPath) {
    var sVscodeDir = $$path.join(__dirname, '../..'); 
    sPath = sPath.replace('${.vscode}', sVscodeDir);
    return sPath.replace(/\\/g, '/');
}
function c2(n) {
    return (n/100).toFixed(2).slice(-2);
}
exports.activate = activate;

function deactivate() {
}
exports.deactivate = deactivate;




