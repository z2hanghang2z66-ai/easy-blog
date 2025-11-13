# Personal Blog Management System

A blog system designed for personal use with complete article management features and built-in editor.

## Features

- ✅ **Single-user login system** - Supports administrator login only
- ✅ **Built-in rich text editor** - Supports text formatting, link insertion, etc.
- ✅ **Article management** - Publish, edit, delete, and view articles
- ✅ **Data persistence** - Uses localStorage for data storage
- ✅ **Data backup** - Supports import/export functionality
- ✅ **Responsive design** - Adapts to different screen sizes
- ✅ **iOS-style interface** - Modern design style

## Quick Start

### Default Account
- **Username**: `admin`
- **Password**: `admin123`

### Usage

1. **Access the blog**: Open the `index.html` file
2. **Login to admin panel**: Click the "Admin Panel" button in the top right corner
3. **Publish articles**: Switch to the "New Article" tab in the admin panel
4. **Manage articles**: Edit or delete existing articles in the "Article List" tab

## Preview

![Blog System Preview](屏幕截图%202025-11-13%20131349.png)

*Blog system interface with iOS-style design*

## File Structure

```
blog/
├── index.html          # Main page
├── css/
│   ├── style.css       # Main stylesheet
│   └── admin.css       # Admin panel styles
├── js/
│   ├── app.js          # Main application
│   ├── admin.js        # Admin panel functionality
│   ├── auth.js         # Authentication system
│   ├── data.js         # Data storage management
│   └── editor.js       # Rich text editor
└── README.md          # Documentation
```

## Editor Features

The built-in editor supports the following features:
- **Text formatting**: Bold, italic, underline, strikethrough
- **Paragraph formatting**: Headings, quotes, code blocks
- **Lists**: Ordered lists, unordered lists
- **Links**: Insert and edit hyperlinks
- **Keyboard shortcuts**: Supports common shortcut operations

## Data Management

### Data Storage
- All data is stored in browser's localStorage
- Article data is automatically saved, no manual saving required

### Data Backup
- **Export data**: Click the "Export Data" button in the admin panel
- **Import data**: Click the "Import Data" button in the admin panel and select backup file

## Custom Configuration

### Modify Default Account
Edit the default account information in the `js/data.js` file:

```javascript
// Modify default administrator account
this.users = [{
    username: 'your-username',
    password: 'your-password'
}];
```

### Customize Styles
Edit `css/style.css` and `css/admin.css` files to customize the interface styles.

## Notes

- Data is stored locally in the browser, clearing browser data will result in article loss
- Regular use of export function for data backup is recommended
- System supports single-user use only, suitable for personal blogs
- Compatible with modern browsers (Chrome, Firefox, Safari, Edge)

## Technical Support

If you encounter any issues or have suggestions, please check the browser console for error messages.

---

# 个人博客管理系统

这是一个专为个人使用设计的博客系统，具有完整的文章管理功能和内置编辑器。

## 功能特性

- ✅ **单用户登录系统** - 仅支持管理员登录
- ✅ **内置富文本编辑器** - 支持文本格式化、链接插入等功能
- ✅ **文章管理** - 发布、编辑、删除、查看文章
- ✅ **数据持久化** - 使用localStorage存储数据
- ✅ **数据备份** - 支持导入导出功能
- ✅ **响应式设计** - 适配不同屏幕尺寸
- ✅ **iOS风格界面** - 现代化的设计风格

## 快速开始

### 默认账户
- **用户名**: `admin`
- **密码**: `admin123`

### 使用方法

1. **访问博客**: 打开 `index.html` 文件
2. **登录管理后台**: 点击页面右上角的"管理后台"按钮
3. **发布文章**: 在管理后台中切换到"新建文章"标签页
4. **管理文章**: 在"文章列表"标签页中编辑或删除现有文章

## 页面预览

![博客系统预览](屏幕截图%202025-11-13%20131349.png)

*采用iOS风格设计的博客系统界面*

## 文件结构

```
blog/
├── index.html          # 主页面
├── css/
│   ├── style.css       # 主样式文件
│   └── admin.css       # 管理后台样式
├── js/
│   ├── app.js          # 主应用程序
│   ├── admin.js        # 管理后台功能
│   ├── auth.js         # 认证系统
│   ├── data.js         # 数据存储管理
│   └── editor.js       # 富文本编辑器
└── README.md          # 说明文档
```

## 编辑器功能

内置编辑器支持以下功能：
- **文本格式化**: 粗体、斜体、下划线、删除线
- **段落格式**: 标题、引用、代码块
- **列表**: 有序列表、无序列表
- **链接**: 插入和编辑超链接
- **快捷键**: 支持常用快捷键操作

## 数据管理

### 数据存储
- 所有数据存储在浏览器的localStorage中
- 文章数据自动保存，无需手动保存

### 数据备份
- **导出数据**: 在管理后台点击"导出数据"按钮
- **导入数据**: 在管理后台点击"导入数据"按钮并选择备份文件

## 自定义配置

### 修改默认账户
编辑 `js/data.js` 文件中的默认账户信息：

```javascript
// 修改默认管理员账户
this.users = [{
    username: 'your-username',
    password: 'your-password'
}];
```

### 自定义样式
编辑 `css/style.css` 和 `css/admin.css` 文件来自定义界面样式。

## 注意事项

- 数据存储在浏览器本地，清除浏览器数据会导致文章丢失
- 建议定期使用导出功能备份数据
- 系统仅支持单用户使用，适合个人博客
- 兼容现代浏览器（Chrome、Firefox、Safari、Edge）

## 技术支持

如有问题或建议，请检查浏览器控制台是否有错误信息。