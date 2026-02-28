/**
 * 图片压缩脚本
 * 使用 sharp 库来压缩图片
 *
 * 使用方法：
 * 1. 安装 sharp: npm install -D sharp
 * 2. 运行脚本: node scripts/compress-images.mjs
 */

import { readdir, mkdir, stat } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 配置
const CONFIG = {
  inputDirs: ["src/assets/cpn", "src/assets/lf", "src/assets"],
  quality: 80, // 质量设置 (1-100)
  maxWidth: 1920, // 最大宽度
  maxHeight: 1080, // 最大高度
  formats: [".png", ".jpg", ".jpeg"], // 需要压缩的格式
  skipFiles: ["logo.svg"], // 跳过的文件
};

async function compressImages() {
  let sharp;

  try {
    sharp = (await import("sharp")).default;
  } catch (error) {
    console.error("❌ Sharp 未安装！");
    console.log("请运行: npm install -D sharp");
    console.log("或者: yarn add -D sharp");
    return;
  }

  console.log("🚀 开始压缩图片...\n");

  let totalOriginalSize = 0;
  let totalCompressedSize = 0;
  let fileCount = 0;

  for (const dir of CONFIG.inputDirs) {
    const inputPath = join(process.cwd(), dir);
    const outputPath = join(process.cwd(), dir, "compressed");

    if (!existsSync(inputPath)) {
      console.log(`⚠️  目录不存在: ${dir}`);
      continue;
    }

    // 创建压缩输出目录
    if (!existsSync(outputPath)) {
      await mkdir(outputPath, { recursive: true });
    }

    const files = await readdir(inputPath);

    for (const file of files) {
      // 跳过不支持的文件和目录
      const ext = file.toLowerCase().slice(file.lastIndexOf("."));
      if (!CONFIG.formats.includes(ext) || CONFIG.skipFiles.includes(file)) {
        continue;
      }

      const inputFile = join(inputPath, file);
      const outputFile = join(outputPath, file);

      try {
        // 获取原始文件大小
        const inputStats = await stat(inputFile);
        const originalSize = inputStats.size;

        // 压缩图片
        await sharp(inputFile)
          .resize({
            width: CONFIG.maxWidth,
            height: CONFIG.maxHeight,
            fit: "inside",
            withoutEnlargement: true,
          })
          .jpeg({ quality: CONFIG.quality, progressive: true })
          .png({ quality: CONFIG.quality, compressionLevel: 9 })
          .webp({ quality: CONFIG.quality })
          .toFile(outputFile);

        // 获取压缩后文件大小
        const outputStats = await stat(outputFile);
        const compressedSize = outputStats.size;

        const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(
          2,
        );

        console.log(`✅ ${file}`);
        console.log(`   原始: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   压缩: ${(compressedSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   减少: ${reduction}%\n`);

        totalOriginalSize += originalSize;
        totalCompressedSize += compressedSize;
        fileCount++;
      } catch (error) {
        console.error(`❌ 处理失败: ${file}`, error.message);
      }
    }
  }

  if (fileCount > 0) {
    const totalReduction = (
      (1 - totalCompressedSize / totalOriginalSize) *
      100
    ).toFixed(2);
    console.log("\n📊 压缩统计：");
    console.log(`   处理文件数: ${fileCount}`);
    console.log(
      `   原始总大小: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`,
    );
    console.log(
      `   压缩总大小: ${(totalCompressedSize / 1024 / 1024).toFixed(2)} MB`,
    );
    console.log(`   总共减少: ${totalReduction}%`);
    console.log('\n💡 压缩后的图片在各目录的 "compressed" 文件夹中');
    console.log("   请检查质量后，手动替换原图片");
  } else {
    console.log("⚠️  没有找到需要压缩的图片");
  }
}

// 运行压缩
compressImages().catch(console.error);
