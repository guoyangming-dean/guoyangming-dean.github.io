# 网站修改指南

本文档详细说明如何修改网站的各项配置和样式。所有网站文件位于 `docs/` 目录下。

## 目录结构

```
docs/
├── _config.yml              # 网站主要配置文件
├── index.md                 # 首页内容
├── _pages/about.md          # 关于页面
├── _includes/gallery.html   # 图片轮播组件
├── assets/
│   ├── images/
│   │   ├── avatar.jpg      # 头像图片
│   │   └── gallery/        # 轮播图片目录
│   └── files/
│       └── CV_Yangming Guo.pdf  # 个人简历
└── MODIFICATION_GUIDE.md   # 本文档
```

## 1. 基本配置修改

### 1.1 网站基本信息
**文件**: `_config.yml`

```yaml
# 网站标题
title: Yangming Guo

# 联系邮箱（显示在页脚和关于页面）
email: yangmingbit@gmail.com

# 网站描述（用于SEO）
description: >-
  Personal blog and portfolio of Yangming Guo - Master's in Control Science and Engineering, Senior Algorithm Engineer specializing in AI, ML, and robotics.
```

### 1.2 作者信息
**文件**: `_config.yml` (第59-75行)

```yaml
author:
  name   : "Yangming Guo"                    # 姓名
  avatar : "/assets/images/avatar.jpg"       # 头像路径
  bio    : ""                                # 个人简介（设为空不在头像下显示）
  links:                                     # 社交链接
    - label: "Email"
      icon: "fas fa-fw fa-envelope"
      url: "mailto:yangmingbit@gmail.com"
    # 其他社交链接...
```

### 1.3 页脚链接
**文件**: `_config.yml` (第77-90行)

```yaml
footer:
  links:
    - label: "Email"
      icon: "fas fa-fw fa-envelope"
      url: "mailto:yangmingbit@gmail.com"
    # 其他链接...
```

## 2. 内容修改

### 2.1 首页内容
**文件**: `index.md`

- **学术论文**: 修改第12-34行的论文列表
- **图片轮播**: 自动加载 `assets/images/gallery/` 目录下的图片
- **添加新部分**: 在 `{% include gallery.html %}` 前添加新的markdown内容

### 2.2 关于页面
**文件**: `_pages/about.md`

包含个人简介、工作经历、教育背景、技术技能等信息。按需修改各部分内容。

### 2.3 添加博客文章
1. 在 `_posts/` 目录下创建新的markdown文件
2. 文件名格式: `YYYY-MM-DD-title.md`
3. 文件头部添加front matter:
   ```yaml
   ---
   title: "文章标题"
   date: YYYY-MM-DD
   categories: [分类]
   tags: [标签1, 标签2]
   ---
   ```

## 3. 样式修改

### 3.1 修改字体
由于使用Minimal Mistakes主题，字体修改需要在 `_config.yml` 中添加主题变量：

```yaml
# 添加以下配置
minimal_mistakes_skin: "default"  # 可改为: default, air, aqua, contrast, dark, dirt, neon, mint, plum, sunrise

# 自定义CSS (可选)
# 在 assets/css/ 目录下创建 main.scss 文件来自定义样式
```

### 3.2 修改颜色主题
Minimal Mistakes主题支持多种皮肤。在 `_config.yml` 中修改：

```yaml
minimal_mistakes_skin: "dark"  # 改为其他皮肤名称
```

可用皮肤: `default`, `air`, `aqua`, `contrast`, `dark`, `dirt`, `neon`, `mint`, `plum`, `sunrise`

### 3.3 自定义CSS
1. 创建文件 `assets/css/main.scss`
2. 添加自定义样式，例如：
   ```scss
   /* 修改标题字体 */
   h1, h2, h3 {
     font-family: 'Helvetica Neue', Arial, sans-serif;
   }

   /* 修改链接颜色 */
   a {
     color: #0077cc;
     &:hover {
       color: #005599;
     }
   }
   ```

## 4. 图片轮播功能

### 4.1 添加/删除图片
1. **添加图片**: 将图片文件复制到 `assets/images/gallery/` 目录
2. **删除图片**: 从 `assets/images/gallery/` 目录删除文件
3. **支持格式**: JPG, JPEG, PNG, GIF, WebP

### 4.2 修改轮播样式
**文件**: `_includes/gallery.html`

- **图片尺寸**: 修改第41-44行的 `width` 和 `height`
- **间距**: 修改第29行的 `gap` 值
- **圆角**: 修改第45行的 `border-radius`
- **阴影**: 修改第47行的 `box-shadow`

### 4.3 修改轮播行为
**文件**: `_includes/gallery.html` (JavaScript部分)

- **滚动速度**: 修改 `behavior: 'smooth'` 为 `behavior: 'auto'` 取消平滑滚动
- **每次滚动数量**: 修改第167行的 `scrollAmount` 计算方式
- **循环逻辑**: 第180-197行的点击事件处理函数

## 5. 导航菜单修改

### 5.1 导航链接
**文件**: `_data/navigation.yml`

```yaml
main:
  - title: "Posts"        # 显示文本
    url: /posts/          # 链接地址
  - title: "Categories"
    url: /categories/
  - title: "Tags"
    url: /tags/
  - title: "About"
    url: /about/
```

### 5.2 添加新页面
1. 在 `_pages/` 目录下创建新的 `.md` 文件
2. 添加front matter:
   ```yaml
   ---
   permalink: /new-page/
   title: "新页面标题"
   ---
   ```
3. 在 `navigation.yml` 中添加导航链接

## 6. 部署和更新

### 6.1 本地测试
```bash
cd docs
bundle exec jekyll serve
# 访问 http://localhost:4000
```

### 6.2 更新GitHub Pages
1. 提交更改到Git仓库
2. 推送到GitHub:
   ```bash
   git add .
   git commit -m "更新说明"
   git push
   ```
3. GitHub会自动构建并部署

### 6.3 清除缓存
如果更改未立即生效，可能需要清除浏览器缓存或GitHub Pages缓存。

## 7. 常见问题

### 7.1 图片不显示
- 检查图片路径是否正确
- 确认图片已放入 `assets/images/gallery/` 目录
- 检查图片文件权限

### 7.2 样式未更新
- 运行 `bundle exec jekyll serve` 重新构建
- 清除浏览器缓存
- 检查CSS文件路径

### 7.3 导航菜单不更新
- 检查 `_data/navigation.yml` 格式
- 确认页面permalink与导航链接匹配

### 7.4 轮播功能异常
- 检查浏览器JavaScript控制台是否有错误
- 确认 `_includes/gallery.html` 文件完整
- 检查图片数量是否足够（至少2张才能显示箭头）

## 8. 高级自定义

### 8.1 使用自定义布局
1. 复制主题布局文件到项目:
   ```bash
   cp -r $(bundle show minimal-mistakes-jekyll)/_layouts/ _layouts/
   ```
2. 修改复制的布局文件

### 8.2 添加Google Analytics
在 `_config.yml` 中添加:
```yaml
analytics:
  provider: "google"
  google:
    tracking_id: "UA-XXXXX-X"
```

### 8.3 添加评论系统
Minimal Mistakes支持多种评论系统。在 `_config.yml` 中配置:
```yaml
comments:
  provider: "disqus"  # 或 "facebook", "staticman", "utterances"
  disqus:
    shortname: "your-disqus-shortname"
```

---

**最后更新**: 2026-02-16

如果遇到问题，请检查：
1. 文件路径和名称是否正确
2. YAML格式是否正确（缩进、冒号后的空格）
3. 是否重新构建了网站（`bundle exec jekyll build`）
4. 浏览器缓存是否已清除