const fs = require('fs');
const path = require('path');

// 递归读取文件夹下的所有文件
function readFilesRecursively(dir) {
    let files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files = files.concat(readFilesRecursively(fullPath));
        } else {
            files.push(fullPath);
        }
    }
    return files;
}

// 检测大于指定 MB 的文件
function findLargeFiles(folderPath, sizeInMB) {
    const files = readFilesRecursively(folderPath);
    const largeFiles = [];
    const sizeInBytes = sizeInMB * 1024 * 1024;

    for (const file of files) {
        try {
            const stats = fs.statSync(file);
            if (stats.size > sizeInBytes) {
                largeFiles.push(file);
            }
        } catch (error) {
            console.error(`Error getting file size for ${file}:`, error);
        }
    }

    return largeFiles;
}

// 创建 largeFiles 文件夹并移动大文件
function moveLargeFiles(largeFiles) {
    const largeFilesDir = path.join(__dirname, 'largeFiles');
    if (!fs.existsSync(largeFilesDir)) {
        fs.mkdirSync(largeFilesDir);
    }

    for (const file of largeFiles) {
        const fileName = path.basename(file);
        const destPath = path.join(largeFilesDir, fileName);
        try {
            fs.renameSync(file, destPath);
            console.log(`已将 ${file} 移动到 ${destPath}`);
        } catch (error) {
            console.error(`移动文件 ${file} 时出错:`, error);
        }
    }
}

// 主函数
function main() {
    const folderPath = 'G:\搜同'; // 替换为你要检测的文件夹路径
    const sizeInMB = 10; // 替换为你指定的大小（MB）

    const largeFiles = findLargeFiles(folderPath, sizeInMB);
    if (largeFiles.length === 0) {
        console.log(`未找到大于 ${sizeInMB} MB 的文件。`);
    } else {
        console.log(`找到以下大于 ${sizeInMB} MB 的文件：`);
        largeFiles.forEach((file) => {
            console.log(file);
        });
        moveLargeFiles(largeFiles);
    }
}

main();
