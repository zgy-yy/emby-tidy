#!/bin/bash

echo "=========================================="
echo "修复 rclone docker volume plugin"
echo "=========================================="

# 1. 确保使用正确的路径（macOS 上 /var/lib 是符号链接）
CONFIG_DIR="/private/var/lib/docker-plugins/rclone/config"
CACHE_DIR="/private/var/lib/docker-plugins/rclone/cache"

# 2. 创建目录（如果不存在）
echo "步骤 1: 创建必要的目录..."
sudo mkdir -p "$CONFIG_DIR"
sudo mkdir -p "$CACHE_DIR"

# 3. 复制配置文件
# echo "步骤 2: 复制 rclone 配置文件..."
# if [ -f ~/.config/rclone/rclone.conf ]; then
#     sudo cp ~/.config/rclone/rclone.conf "$CONFIG_DIR/rclone.conf"
#     sudo chmod 644 "$CONFIG_DIR/rclone.conf"
#     echo "✓ 配置文件已复制"
# else
#     echo "✗ 错误: ~/.config/rclone/rclone.conf 不存在"
#     exit 1
# fi

# 4. 设置缓存目录权限
echo "步骤 3: 设置缓存目录权限..."
sudo chmod 777 "$CACHE_DIR"
echo "✓ 缓存目录权限已设置"

docker plugin install rclone/docker-volume-rclone:arm64 args="-v" --grant-all-permissions 

# 6. 设置挂载源（使用实际路径）
echo "步骤 5: 配置插件挂载源..."
docker plugin set rclone/docker-volume-rclone:arm64 \
    config.source="$CONFIG_DIR" \
    cache.source="$CACHE_DIR"

# 7. 启用插件
echo "步骤 6: 启用插件..."
docker plugin enable rclone/docker-volume-rclone:arm64

if [ $? -eq 0 ]; then
    echo "=========================================="
    echo "✓ 插件修复完成！"
    echo "=========================================="
    docker plugin ls | grep rclone
    echo ""
    echo "现在可以运行: docker-compose up -d"
else
    echo "=========================================="
    echo "✗ 插件启用失败，请检查错误信息"
    echo "=========================================="
    exit 1
fi
