#!/bin/bash
set -e

# 1. AppImage
APPDIR="src-tauri/target/release/bundle/appimage/Xmarkdown.AppDir"
OUTPUT_DIR="src-tauri/target/release/bundle/appimage"

if [ -d "$APPDIR" ]; then
    # Check if AppImage was already built (Tauri might have built it but with specific name)
    # But ls showed only AppDir.
    echo "Building AppImage..."
    # Download appimagetool if not present
    if [ ! -f "appimagetool" ]; then
        echo "Downloading appimagetool..."
        curl -L -o appimagetool https://github.com/AppImage/appimagetool/releases/download/continuous/appimagetool-x86_64.AppImage
        chmod +x appimagetool
    fi
    
    # Run appimagetool
    export ARCH=x86_64
    # output to bundle/appimage/
    ./appimagetool "$APPDIR" "$OUTPUT_DIR/Xmarkdown-x86_64.AppImage"
else
    echo "AppDir not found at $APPDIR"
fi

# 2. Tar.gz
echo "Creating tar.gz..."
BINARY="src-tauri/target/release/xmarkdown"
# Get version from tauri.conf.json
VERSION=$(grep '"version":' src-tauri/tauri.conf.json | head -1 | awk -F '"' '{print $4}')
TAR_DIR="src-tauri/target/release/bundle/tar"
mkdir -p "$TAR_DIR"
TARBALL="$TAR_DIR/xmarkdown-${VERSION}-x86_64.tar.gz"

if [ -f "$BINARY" ]; then
    tar -czvf "$TARBALL" -C src-tauri/target/release xmarkdown
    echo "Created $TARBALL"
else
    echo "Binary not found at $BINARY"
fi

# List all artifacts
echo "Build Artifacts:"
find src-tauri/target/release/bundle -name "*.rpm"
find src-tauri/target/release/bundle -name "*.deb"
find src-tauri/target/release/bundle -name "*.AppImage"
find src-tauri/target/release/bundle -name "*.tar.gz"
