const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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
    console.log("all files:", files);
    console.log("--------------------------------------------------");
    return files;
}

// 按文件大小分组
function groupFilesBySize(files) {
    const sizeMap = new Map();
    for (const file of files) {
        try {
            const stats = fs.statSync(file);
            const size = stats.size;
            if (!sizeMap.has(size)) {
                sizeMap.set(size, []);
            }
            sizeMap.get(size).push(file);
        } catch (error) {
            console.error(`Error getting file size for ${file}:`, error);
        }
    }
    const groups = [];
    for (const [, fileList] of sizeMap) {
        if (fileList.length > 1) {
            groups.push(fileList);
        }
    }
    console.log("grouped files for duplicates:", groups);
    console.log("--------------------------------------------------");
    return groups;
}

// 计算文件的哈希值
function calculateHash(filePath) {
    const hash = crypto.createHash('sha256');
    const data = fs.readFileSync(filePath);
    hash.update(data);
    return hash.digest('hex');
}

// 找出重复的文件
function findDuplicateFiles(fileGroups) {
    const duplicates = [];
    for (const fileList of fileGroups) {
        const hashMap = new Map();
        for (const file of fileList) {
            try {
                const hash = calculateHash(file);
                if (!hashMap.has(hash)) {
                    hashMap.set(hash, []);
                }
                hashMap.get(hash).push(file);
            } catch (error) {
                console.error(`Error calculating hash for ${file}:`, error);
            }
        }
        for (const [, filesWithSameHash] of hashMap) {
            if (filesWithSameHash.length > 1) {
                duplicates.push(filesWithSameHash.slice(1));
            }
        }
    }
    console.log("duplicates files to be deleted:", duplicates);
    console.log("--------------------------------------------------");
    return duplicates;
}

// 删除重复的文件
function deleteDuplicateFiles(duplicates) {
    for (const fileList of duplicates) {
        for (const file of fileList) {
            try {
                fs.unlinkSync(file);
                console.log(`Deleted duplicate file: ${file}`);
            } catch (error) {
                console.error(`Error deleting file ${file}:`, error);
            }
        }
    }
}

// 主函数
function main(folderPath) {
    const files = readFilesRecursively(folderPath);
    const fileGroups = groupFilesBySize(files);
    const duplicates = findDuplicateFiles(fileGroups);
    deleteDuplicateFiles(duplicates);
}

// 使用示例
const folderPath = 'G:\推特'; // 替换为你要处理的文件夹路径
main(folderPath);
