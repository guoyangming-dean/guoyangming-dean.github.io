# Yangming Guo的个人博客网站

这是一个基于Jekyll和Minimal Mistakes主题的个人博客网站项目。该项目使用GitHub Pages进行部署，可以轻松地在GitHub上托管静态博客。

## 项目概述

- **技术栈**: Jekyll (静态网站生成器), Minimal Mistakes主题, GitHub Pages
- **作者**: Yangming Guo
- **联系方式**: yangmingnjau@163.com
- **项目结构**: Jekyll标准的静态网站结构

## 快速开始

### 前提条件

1. **Ruby**: 确保系统中安装了Ruby (2.7.2或更高版本)
2. **Bundler**: 确保安装了Bundler (`gem install bundler`)
3. **Git**: 确保已安装Git

### 安装依赖

```bash
# 进入项目目录
cd docs

# 安装Gem依赖
bundle install
```

### 运行开发服务器

```bash
# 在docs目录下运行Jekyll开发服务器
cd docs
bundle exec jekyll serve --livereload
```

服务器启动后，访问以下地址：
- **网站**: http://127.0.0.1:4000
- **LiveReload**: http://127.0.0.1:35729

## 项目结构

```
dean-98543.github.io/
├── README.md           # 项目说明文档 (本文件)
├── .gitignore          # Git忽略文件配置
└── docs/               # Jekyll网站主目录
    ├── _config.yml     # Jekyll配置文件
    ├── Gemfile         # Ruby依赖文件
    ├── Gemfile.lock    # 锁定的依赖版本
    ├── index.html      # 首页模板
    ├── _data/          # 数据文件
    │   └── navigation.yml  # 导航菜单配置
    ├── _pages/         # 静态页面
    │   ├── about.md    # 关于页面
    │   ├── 404.md      # 404错误页面
    │   └── ...         # 其他页面
    ├── _posts/         # 博客文章
    │   ├── 2019-04-18-welcome-to-jekyll.md
    │   └── ...         # 其他文章
    ├── assets/         # 静态资源
    │   └── images/     # 图片资源
    │       └── avatar.jpg  # 作者头像
    └── _site/          # 生成的静态网站 (在.gitignore中)
```

## 自定义配置

### 1. 编辑配置文件
修改 `docs/_config.yml` 文件来配置网站的基本信息：

```yaml
# 基本信息
title: "Yangming Guo"
email: "yangmingnjau@163.com"
description: "您的网站描述"

# 社交媒体链接
twitter_username: "username"  # 替换为实际的Twitter用户名
github_username: "username"   # 替换为实际的GitHub用户名

# 作者信息
author:
  name: "Yangming Guo"
  avatar: "/assets/images/avatar.jpg"
  bio: "个人简介..."
```

### 2. 添加新文章
在 `docs/_posts/` 目录下创建新的Markdown文件，文件名格式为 `YYYY-MM-DD-文章标题.md`：

```markdown
---
title: "文章标题"
date: 2024-01-01T12:00:00-05:00
categories:
  - 分类名称
tags:
  - 标签1
  - 标签2
---

文章内容...
```

### 3. 修改关于页面
编辑 `docs/_pages/about.md` 文件来更新关于页面的内容。

### 4. 更换头像
替换 `docs/assets/images/avatar.jpg` 文件为您自己的头像图片。

## 部署到GitHub Pages

### 方法1：直接推送到GitHub
1. 将项目推送到GitHub仓库
2. 在GitHub仓库设置中启用GitHub Pages
3. 选择 `docs` 文件夹作为源

### 方法2：使用GitHub Actions
项目已配置为使用GitHub Pages，只需推送到 `main` 分支即可自动构建和部署。

## 常见问题

### 1. 依赖安装失败
如果 `bundle install` 失败，尝试：
```bash
# 更新RubyGems
gem update --system

# 清理旧的依赖
bundle clean --force

# 重新安装
bundle install
```

### 2. Jekyll服务启动失败
确保在 `docs` 目录下运行命令，并检查Ruby版本兼容性。

### 3. 页面不更新
清除Jekyll缓存：
```bash
rm -rf docs/_site
rm -rf .jekyll-cache
```

## 开发命令参考

```bash
# 本地开发
bundle exec jekyll serve          # 启动开发服务器
bundle exec jekyll serve --livereload  # 启动带LiveReload的服务器

# 构建网站
bundle exec jekyll build          # 构建到_site目录
bundle exec jekyll build --watch  # 构建并监视文件变化

# 其他有用命令
bundle update                     # 更新Gem依赖
bundle exec jekyll doctor         # 检查Jekyll配置
```

## 主题文档

本项目使用 [Minimal Mistakes](https://mmistakes.github.io/minimal-mistakes/) 主题。如需更多主题定制选项，请参考：
- [Minimal Mistakes文档](https://mmistakes.github.io/minimal-mistakes/docs/quick-start-guide/)
- [Jekyll官方文档](https://jekyllrb.com/docs/)

## 许可证

本项目基于Jekyll和Minimal Mistakes主题构建。具体许可证信息请参考相关项目文档。

---

**提示**: 首次运行后，网站应可在 http://127.0.0.1:4000 访问。如有问题，请检查控制台输出。