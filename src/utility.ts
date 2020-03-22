import * as fs from 'fs';
import * as path from 'path';

export class Utility {
    public static log(str) {
        let date = new Date();
        str = date.toString().split(' ')[4] + '    ' + str;
        fs.writeFile('log/log.txt', str + '\r\n', {flag:'a', encoding:'utf-8', mode:'0644'}, (err) => {
            if (err) {
                console.log(err);
            }
        });
        console.log(str);
    }

    public static getAllFiles(filepath) {
        let filepathList = [];
        Utility._getAllFiles(filepath, filepathList);
        return filepathList;
    }

    private static _getAllFiles(filepath, filepathList = []) {
        let files = fs.readdirSync(filepath);
        files.forEach((filename) => {
            let filedir = path.join(filepath, filename);
            let stats = fs.statSync(filedir);
            let isFile = stats.isFile();
            let isDir = stats.isDirectory();
            if (isFile) {
                filepathList.push(filedir);
            }
            if (isDir) {
                Utility._getAllFiles(filedir, filepathList);
            }
        });
    }
}