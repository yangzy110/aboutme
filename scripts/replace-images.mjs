/**
 * 替换原图脚本
 * 将压缩后的图片替换原图
 *
 * 使用方法: node scripts/replace-images.mjs
 */

import { readdir, copyFile, unlink, rm } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const DIRS = ["src/assets/cpn", "src/assets/lf", "src/assets"];

async function replaceImages() {
  console.log("🔄 开始替换图片...\n");

  let replacedCount = 0;

  for (const dir of DIRS) {
    const sourcePath = join(process.cwd(), dir);
    const compressedPath = join(sourcePath, "compressed");

    if (!existsSync(compressedPath)) {
      console.log(`⚠️  压缩目录不存在: ${dir}/compressed`);
      continue;
    }

    const files = await readdir(compressedPath);

    for (const file of files) {
      const compressedFile = join(compressedPath, file);
      const originalFile = join(sourcePath, file);

      try {
        // 备份原文件（添加 .bak 后缀）
        if (existsSync(originalFile)) {
          const backupFile = `${originalFile}.bak`;
          await copyFile(originalFile, backupFile);
          console.log(`💾 备份: ${file} → ${file}.bak`);
        }

        // 替换原文件
        await copyFile(compressedFile, originalFile);
        console.log(`✅ 替换: ${file}`);
        replacedCount++;
      } catch (error) {
        console.error(`❌ 替换失败: ${file}`, error.message);
      }
    }

    // 清理压缩目录
    try {
      await rm(compressedPath, { recursive: true, force: true });
      console.log(`🗑️  清理: ${dir}/compressed\n`);
    } catch (error) {
      console.error(`⚠️  清理失败: ${dir}/compressed`);
    }
  }

  console.log(`\n📊 替换统计：`);
  console.log(`   替换文件数: ${replacedCount}`);
  console.log(`\n💡 注意：`);
  console.log(`   - 原文件已备份为 .bak 后缀`);
  console.log(`   - 如需恢复，删除压缩后的文件，将 .bak 文件重命名`);
  console.log(`   - 确认无问题后，可手动删除所有 .bak 备份文件`);
}

// 运行替换
replaceImages().catch(console.error);
