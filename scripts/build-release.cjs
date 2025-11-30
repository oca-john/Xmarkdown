#!/usr/bin/env node
/**
 * 跨平台打包脚本
 * Windows: 生成 NSIS 安装包 + 绿色版 EXE（均带版本号）
 * Linux: 生成 deb, rpm, tar.gz（含部署脚本）
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

// 读取版本号
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf-8")
);
const VERSION = packageJson.version;
const APP_NAME = "Xmarkdown";
const APP_NAME_LOWER = "xmarkdown";

const ROOT_DIR = path.join(__dirname, "..");
const TAURI_DIR = path.join(ROOT_DIR, "src-tauri");
const RELEASE_DIR = path.join(TAURI_DIR, "target", "release");
const BUNDLE_DIR = path.join(RELEASE_DIR, "bundle");
const OUTPUT_DIR = path.join(ROOT_DIR, "release");

const isWindows = os.platform() === "win32";
const isLinux = os.platform() === "linux";

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyFile(src, dest) {
  fs.copyFileSync(src, dest);
  console.log(`  复制: ${path.basename(dest)}`);
}

function run(cmd, cwd = ROOT_DIR) {
  console.log(`\n执行: ${cmd}\n`);
  execSync(cmd, { stdio: "inherit", cwd });
}

function buildWindows() {
  console.log("\n========== Windows 打包 ==========\n");

  // 1. 构建 NSIS 安装包
  console.log(">>> 构建 NSIS 安装包...");
  run("npx tauri build --bundles nsis");

  const windowsOutputDir = path.join(OUTPUT_DIR, "windows");
  ensureDir(windowsOutputDir);

  // 2. 复制安装包（已带版本号）
  const nsisDir = path.join(BUNDLE_DIR, "nsis");
  if (fs.existsSync(nsisDir)) {
    const installers = fs.readdirSync(nsisDir).filter((f) => f.endsWith(".exe"));
    for (const installer of installers) {
      copyFile(
        path.join(nsisDir, installer),
        path.join(windowsOutputDir, installer)
      );
    }
  }

  // 3. 创建绿色版（便携版）
  console.log("\n>>> 创建绿色版...");
  const exePath = path.join(RELEASE_DIR, `${APP_NAME_LOWER}.exe`);
  const portableName = `${APP_NAME}_${VERSION}_x64_portable.exe`;
  
  if (fs.existsSync(exePath)) {
    copyFile(exePath, path.join(windowsOutputDir, portableName));
  } else {
    console.error(`  错误: 未找到 ${exePath}`);
  }

  console.log(`\n✅ Windows 打包完成！输出目录: ${windowsOutputDir}`);
}

function buildLinux() {
  console.log("\n========== Linux 打包 ==========\n");

  // 1. 构建 deb 和 rpm
  console.log(">>> 构建 deb 和 rpm...");
  run("npx tauri build --bundles deb,rpm");

  const linuxOutputDir = path.join(OUTPUT_DIR, "linux");
  ensureDir(linuxOutputDir);

  // 2. 复制 deb 包
  const debDir = path.join(BUNDLE_DIR, "deb");
  if (fs.existsSync(debDir)) {
    const debs = fs.readdirSync(debDir).filter((f) => f.endsWith(".deb"));
    for (const deb of debs) {
      copyFile(path.join(debDir, deb), path.join(linuxOutputDir, deb));
    }
  }

  // 3. 复制 rpm 包
  const rpmDir = path.join(BUNDLE_DIR, "rpm");
  if (fs.existsSync(rpmDir)) {
    const rpms = fs.readdirSync(rpmDir).filter((f) => f.endsWith(".rpm"));
    for (const rpm of rpms) {
      copyFile(path.join(rpmDir, rpm), path.join(linuxOutputDir, rpm));
    }
  }

  // 4. 创建 tar.gz 包（含部署脚本）
  console.log("\n>>> 创建 tar.gz 包...");
  createLinuxTarGz();

  console.log(`\n✅ Linux 打包完成！输出目录: ${linuxOutputDir}`);
}

function createLinuxTarGz() {
  const linuxOutputDir = path.join(OUTPUT_DIR, "linux");
  const tarName = `${APP_NAME_LOWER}-${VERSION}-linux-x86_64`;
  const tarDir = path.join(linuxOutputDir, tarName);
  const binDir = path.join(tarDir, "bin");
  const assetsDir = path.join(tarDir, "assets");

  // 清理并创建目录
  if (fs.existsSync(tarDir)) {
    fs.rmSync(tarDir, { recursive: true });
  }
  ensureDir(binDir);
  ensureDir(assetsDir);

  // 复制可执行文件
  const exePath = path.join(RELEASE_DIR, APP_NAME_LOWER);
  if (fs.existsSync(exePath)) {
    copyFile(exePath, path.join(binDir, APP_NAME_LOWER));
    fs.chmodSync(path.join(binDir, APP_NAME_LOWER), 0o755);
  }

  // 复制图标
  const iconSrc = path.join(TAURI_DIR, "icons", "128x128.png");
  if (fs.existsSync(iconSrc)) {
    copyFile(iconSrc, path.join(assetsDir, `${APP_NAME_LOWER}.png`));
  }

  // 创建 .desktop 文件
  const desktopContent = `[Desktop Entry]
Name=${APP_NAME}
Comment=A simple Markdown editor
Exec=${APP_NAME_LOWER} %F
Icon=${APP_NAME_LOWER}
Terminal=false
Type=Application
Categories=Office;TextEditor;Utility;
MimeType=text/markdown;text/x-markdown;
StartupWMClass=${APP_NAME_LOWER}
`;
  fs.writeFileSync(path.join(assetsDir, `${APP_NAME_LOWER}.desktop`), desktopContent);

  // 创建 install.sh
  const installScript = `#!/bin/bash
# ${APP_NAME} 安装脚本
# 用法: ./install.sh

set -e

APP_NAME="${APP_NAME_LOWER}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BIN_DIR="$HOME/bin"
DESKTOP_DIR="$HOME/.local/share/applications"
ICON_DIR="$HOME/.local/share/icons/hicolor/128x128/apps"

echo "正在安装 ${APP_NAME}..."

# 创建目录
mkdir -p "$BIN_DIR"
mkdir -p "$DESKTOP_DIR"
mkdir -p "$ICON_DIR"

# 复制可执行文件
cp "$SCRIPT_DIR/bin/$APP_NAME" "$BIN_DIR/"
chmod +x "$BIN_DIR/$APP_NAME"
echo "  ✓ 可执行文件已安装到 $BIN_DIR/$APP_NAME"

# 复制图标
cp "$SCRIPT_DIR/assets/$APP_NAME.png" "$ICON_DIR/"
echo "  ✓ 图标已安装到 $ICON_DIR/$APP_NAME.png"

# 创建桌面快捷方式（更新路径）
cat > "$DESKTOP_DIR/$APP_NAME.desktop" << EOF
[Desktop Entry]
Name=${APP_NAME}
Comment=A simple Markdown editor
Exec=$BIN_DIR/$APP_NAME %F
Icon=$ICON_DIR/$APP_NAME.png
Terminal=false
Type=Application
Categories=Office;TextEditor;Utility;
MimeType=text/markdown;text/x-markdown;
StartupWMClass=$APP_NAME
EOF
chmod +x "$DESKTOP_DIR/$APP_NAME.desktop"
echo "  ✓ 快捷方式已创建到 $DESKTOP_DIR/$APP_NAME.desktop"

# 更新桌面数据库
if command -v update-desktop-database &> /dev/null; then
  update-desktop-database "$DESKTOP_DIR" 2>/dev/null || true
fi

echo ""
echo "✅ ${APP_NAME} 安装完成！"
echo ""
echo "提示: 请确保 $BIN_DIR 已添加到 PATH 环境变量中。"
echo "如果尚未添加，请执行: echo 'export PATH=\\"\\$HOME/bin:\\$PATH\\"' >> ~/.bashrc && source ~/.bashrc"
`;
  fs.writeFileSync(path.join(tarDir, "install.sh"), installScript);
  fs.chmodSync(path.join(tarDir, "install.sh"), 0o755);

  // 创建 uninstall.sh
  const uninstallScript = `#!/bin/bash
# ${APP_NAME} 卸载脚本
# 用法: ./uninstall.sh

set -e

APP_NAME="${APP_NAME_LOWER}"
BIN_DIR="$HOME/bin"
DESKTOP_DIR="$HOME/.local/share/applications"
ICON_DIR="$HOME/.local/share/icons/hicolor/128x128/apps"

echo "正在卸载 ${APP_NAME}..."

# 删除可执行文件
if [ -f "$BIN_DIR/$APP_NAME" ]; then
  rm "$BIN_DIR/$APP_NAME"
  echo "  ✓ 已删除 $BIN_DIR/$APP_NAME"
fi

# 删除图标
if [ -f "$ICON_DIR/$APP_NAME.png" ]; then
  rm "$ICON_DIR/$APP_NAME.png"
  echo "  ✓ 已删除 $ICON_DIR/$APP_NAME.png"
fi

# 删除桌面快捷方式
if [ -f "$DESKTOP_DIR/$APP_NAME.desktop" ]; then
  rm "$DESKTOP_DIR/$APP_NAME.desktop"
  echo "  ✓ 已删除 $DESKTOP_DIR/$APP_NAME.desktop"
fi

# 更新桌面数据库
if command -v update-desktop-database &> /dev/null; then
  update-desktop-database "$DESKTOP_DIR" 2>/dev/null || true
fi

echo ""
echo "✅ ${APP_NAME} 已卸载！"
`;
  fs.writeFileSync(path.join(tarDir, "uninstall.sh"), uninstallScript);
  fs.chmodSync(path.join(tarDir, "uninstall.sh"), 0o755);

  // 创建 README
  const readme = `# ${APP_NAME} v${VERSION}

## 安装

\`\`\`bash
./install.sh
\`\`\`

安装后，可执行文件将复制到 ~/bin，快捷方式将创建到 ~/.local/share/applications。

## 卸载

\`\`\`bash
./uninstall.sh
\`\`\`

## 注意事项

- 请确保 ~/bin 已添加到 PATH 环境变量中
- 如果未添加，请执行: \`echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc && source ~/.bashrc\`
`;
  fs.writeFileSync(path.join(tarDir, "README.md"), readme);

  // 打包 tar.gz
  const tarGzName = `${tarName}.tar.gz`;
  run(`tar -czvf "${tarGzName}" "${tarName}"`, linuxOutputDir);

  // 清理临时目录
  fs.rmSync(tarDir, { recursive: true });

  console.log(`  创建: ${tarGzName}`);
}

// 主函数
function main() {
  console.log(`\n🚀 ${APP_NAME} v${VERSION} 打包开始...\n`);
  console.log(`平台: ${os.platform()}`);

  // 同步版本号
  run("node scripts/sync-version.js");

  ensureDir(OUTPUT_DIR);

  if (isWindows) {
    buildWindows();
  } else if (isLinux) {
    buildLinux();
  } else {
    console.log("当前平台暂不支持自动打包，请手动构建。");
    process.exit(1);
  }

  console.log("\n🎉 所有打包任务完成！\n");
}

main();
