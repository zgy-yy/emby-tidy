#!/usr/bin/env node

/**
 * 构建后处理脚本：为所有相对路径导入添加 .js 扩展名
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = join(__dirname, '..', 'dist');

/**
 * 修复单个文件中的导入路径
 */
function fixImports(content, filePath) {
    // 匹配相对路径导入：from "./xxx" 或 from "../xxx"
    // 但不匹配已经有扩展名的（.js, .json 等）
    const importRegex = /from\s+['"](\.\.?\/[^'"]*?)(?<!\.js)(?<!\.json)(?<!\.mjs)(?<!\.cjs)['"]/g;
    
    return content.replace(importRegex, (match, importPath) => {
        // 如果路径已经有扩展名，跳过
        if (importPath.match(/\.(js|json|mjs|cjs|ts)$/)) {
            return match;
        }
        // 添加 .js 扩展名
        return match.replace(importPath, importPath + '.js');
    });
}

/**
 * 递归处理目录中的所有 .js 文件
 */
async function processDirectory(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        
        if (entry.isDirectory()) {
            await processDirectory(fullPath);
        } else if (entry.name.endsWith('.js')) {
            const content = await readFile(fullPath, 'utf-8');
            const fixed = fixImports(content, fullPath);
            
            if (content !== fixed) {
                await writeFile(fullPath, fixed, 'utf-8');
                console.log(`Fixed imports in: ${fullPath}`);
            }
        }
    }
}

// 执行修复
processDirectory(distDir)
    .then(() => {
        console.log('✅ All imports fixed!');
    })
    .catch((error) => {
        console.error('❌ Error fixing imports:', error);
        process.exit(1);
    });
