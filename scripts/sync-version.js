/**
 * 版本同步脚本
 * 将 src/version.ts 中的版本号同步到整个项目
 * 
 * 使用方法: node scripts/sync-version.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取版本信息
const versionFile = path.join(__dirname, '../src/version.ts');
const versionContent = fs.readFileSync(versionFile, 'utf-8');

// 解析版本号
const versionMatch = versionContent.match(/VERSION\s*=\s*"([^"]+)"/);
if (!versionMatch) {
  console.error('无法从 src/version.ts 中读取版本号');
  process.exit(1);
}

const VERSION = versionMatch[1];
console.log(`当前版本: ${VERSION}`);

// 需要更新的文件列表
const filesToUpdate = [
  {
    path: 'package.json',
    update: (content) => {
      const json = JSON.parse(content);
      json.version = VERSION;
      return JSON.stringify(json, null, 2) + '\n';
    }
  },
  {
    path: 'src-tauri/tauri.conf.json',
    update: (content) => {
      const json = JSON.parse(content);
      json.version = VERSION;
      return JSON.stringify(json, null, 2) + '\n';
    }
  },
  {
    path: 'src-tauri/Cargo.toml',
    update: (content) => {
      return content.replace(
        /^version\s*=\s*"[^"]+"/m,
        `version = "${VERSION}"`
      );
    }
  },
  {
    path: 'src/i18n/index.ts',
    update: (content) => {
      // 更新所有语言的版本号显示
      return content
        .replace(/"about\.version":\s*"[^"]+"/g, `"about.version": "版本 ${VERSION}"`)
        .replace(/"statusBar\.version":\s*"Xmarkdown v[^"]+"/g, `"statusBar.version": "Xmarkdown v${VERSION}"`);
    }
  },
  {
    path: 'README.md',
    update: (content) => {
      // 更新 README 中的版本徽章或版本号
      return content
        .replace(/version-[0-9]+\.[0-9]+\.[0-9]+/g, `version-${VERSION}`)
        .replace(/v[0-9]+\.[0-9]+\.[0-9]+/g, `v${VERSION}`);
    }
  }
];

// 执行更新
let updatedCount = 0;

filesToUpdate.forEach(({ path: filePath, update }) => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`跳过: ${filePath} (文件不存在)`);
    return;
  }
  
  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const newContent = update(content);
    
    if (content !== newContent) {
      fs.writeFileSync(fullPath, newContent, 'utf-8');
      console.log(`已更新: ${filePath}`);
      updatedCount++;
    } else {
      console.log(`无变化: ${filePath}`);
    }
  } catch (error) {
    console.error(`更新失败: ${filePath}`, error.message);
  }
});

console.log(`\n完成! 已更新 ${updatedCount} 个文件`);
