// 管理后台功能
class BlogAdmin {
    constructor() {
        this.currentEditingId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTabSwitching();
    }

    setupEventListeners() {
        // 文章表单提交事件
        const articleForm = document.getElementById('article-form');
        if (articleForm) {
            articleForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleArticleSubmit();
            });
        }

        // 标签页切换事件
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // 编辑器内容变化事件
        document.addEventListener('editorContentChange', (e) => {
            this.updateExcerptPreview();
        });

        // 标题输入变化事件
        const titleInput = document.getElementById('article-title');
        if (titleInput) {
            titleInput.addEventListener('input', () => {
                this.updateExcerptPreview();
            });
        }
    }

    setupTabSwitching() {
        // 初始化标签页状态
        this.switchTab('articles');
    }

    switchTab(tabName) {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');

        // 更新按钮状态
        tabButtons.forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        // 更新面板状态
        tabPanes.forEach(pane => pane.classList.remove('active'));
        const activePane = document.getElementById(tabName);
        if (activePane) activePane.classList.add('active');

        // 标签页特定逻辑
        if (tabName === 'articles') {
            this.loadArticleList();
        } else if (tabName === 'new-article') {
            this.prepareNewArticle();
        }
    }

    loadArticleList() {
        const articleList = document.getElementById('article-list');
        if (!articleList) return;

        const articles = blogData.getArticles();
        
        if (articles.length === 0) {
            articleList.innerHTML = `
                <div class="empty-state">
                    <h3>暂无文章</h3>
                    <p>点击"新建文章"开始创作吧！</p>
                </div>
            `;
            return;
        }

        articleList.innerHTML = articles.map(article => `
            <div class="article-item" data-id="${article.id}">
                <div class="article-info">
                    <h4>${this.escapeHtml(article.title)}</h4>
                    <div class="article-meta">
                        <span>${article.date}</span> • 
                        <span>${this.escapeHtml(article.category)}</span> • 
                        <span>${article.published ? '已发布' : '草稿'}</span>
                    </div>
                    <p class="article-excerpt-preview">${this.escapeHtml(article.excerpt)}</p>
                </div>
                <div class="article-actions">
                    <button class="btn-edit" onclick="blogAdmin.editArticle('${article.id}')">编辑</button>
                    <button class="btn-delete" onclick="blogAdmin.deleteArticle('${article.id}')">删除</button>
                    <button class="btn-view" onclick="blogAdmin.viewArticle('${article.id}')" style="background: var(--primary-color); color: white; padding: 0.5rem 1rem; border: none; border-radius: var(--border-radius); cursor: pointer;">查看</button>
                </div>
            </div>
        `).join('');
    }

    prepareNewArticle() {
        this.currentEditingId = null;
        const form = document.getElementById('article-form');
        form.reset();
        blogEditor.clear();
        
        const submitBtn = form.querySelector('.btn-primary');
        submitBtn.textContent = '发布文章';
        
        delete form.dataset.editId;
    }

    async handleArticleSubmit() {
        const form = document.getElementById('article-form');
        const title = document.getElementById('article-title').value.trim();
        const category = document.getElementById('article-category').value.trim();
        const excerpt = document.getElementById('article-excerpt').value.trim();
        const content = blogEditor.getContent();

        // 验证输入
        if (!title) {
            this.showMessage('请输入文章标题', 'error');
            return;
        }

        if (!category) {
            this.showMessage('请输入文章分类', 'error');
            return;
        }

        if (!content || content === '<p>开始编写你的文章内容...</p>') {
            this.showMessage('请输入文章内容', 'error');
            return;
        }

        // 自动生成摘要（如果为空）
        const finalExcerpt = excerpt || blogEditor.generateExcerpt();

        // 显示加载状态
        const submitBtn = form.querySelector('.btn-primary');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<span class="loading"></span> 保存中...';
        submitBtn.disabled = true;

        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            let result;
            const isEditing = form.dataset.editId;

            if (isEditing) {
                // 更新现有文章
                result = blogData.updateArticle(isEditing, {
                    title,
                    category,
                    content,
                    excerpt: finalExcerpt,
                    date: new Date().toISOString().split('T')[0]
                });
                
                if (result) {
                    this.showMessage('文章更新成功！', 'success');
                }
            } else {
                // 创建新文章
                result = blogData.addArticle({
                    title,
                    category,
                    content,
                    excerpt: finalExcerpt
                });
                
                if (result) {
                    this.showMessage('文章发布成功！', 'success');
                    // 清空表单
                    this.prepareNewArticle();
                }
            }

            // 重新加载文章列表
            this.loadArticleList();

        } catch (error) {
            this.showMessage('保存失败: ' + error.message, 'error');
        } finally {
            // 恢复按钮状态
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    editArticle(articleId) {
        const article = blogData.getArticle(articleId);
        if (!article) {
            this.showMessage('文章不存在', 'error');
            return;
        }

        // 切换到新建文章标签页
        this.switchTab('new-article');

        // 填充表单
        document.getElementById('article-title').value = article.title;
        document.getElementById('article-category').value = article.category;
        document.getElementById('article-excerpt').value = article.excerpt;
        blogEditor.setContent(article.content);

        // 更新表单为编辑模式
        const form = document.getElementById('article-form');
        form.dataset.editId = articleId;
        
        const submitBtn = form.querySelector('.btn-primary');
        submitBtn.textContent = '更新文章';

        this.currentEditingId = articleId;
        this.showMessage('正在编辑文章: ' + article.title, 'info');
    }

    deleteArticle(articleId) {
        if (!confirm('确定要删除这篇文章吗？此操作不可撤销。')) {
            return;
        }

        if (blogData.deleteArticle(articleId)) {
            this.loadArticleList();
            this.showMessage('文章删除成功', 'success');
            
            // 如果删除的是当前正在编辑的文章，重置表单
            if (this.currentEditingId === articleId) {
                this.prepareNewArticle();
            }
        } else {
            this.showMessage('删除失败', 'error');
        }
    }

    viewArticle(articleId) {
        const article = blogData.getArticle(articleId);
        if (!article) {
            this.showMessage('文章不存在', 'error');
            return;
        }

        // 在新窗口中查看文章
        const articleWindow = window.open('', '_blank');
        articleWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${this.escapeHtml(article.title)}</title>
                <style>
                    body { 
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                        max-width: 800px; 
                        margin: 0 auto; 
                        padding: 2rem; 
                        line-height: 1.6; 
                    }
                    h1 { color: #1D1D1F; margin-bottom: 1rem; }
                    .meta { color: #8E8E93; margin-bottom: 2rem; }
                    .content { line-height: 1.8; }
                </style>
            </head>
            <body>
                <h1>${this.escapeHtml(article.title)}</h1>
                <div class="meta">
                    ${article.date} • ${this.escapeHtml(article.category)}
                </div>
                <div class="content">${article.content}</div>
            </body>
            </html>
        `);
    }

    updateExcerptPreview() {
        const excerptInput = document.getElementById('article-excerpt');
        if (!excerptInput) return;

        // 如果摘要为空，自动生成预览
        if (!excerptInput.value.trim()) {
            const preview = blogEditor.generateExcerpt(100);
            // 只是预览，不实际设置值
        }
    }

    // 数据管理功能
    exportData() {
        blogData.backupData();
        this.showMessage('数据备份已开始下载', 'success');
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!confirm('导入数据将覆盖现有数据，确定要继续吗？')) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                blogData.importData(data);
                this.showMessage('数据导入成功', 'success');
                this.loadArticleList();
            } catch (error) {
                this.showMessage('数据导入失败: 文件格式错误', 'error');
            }
        };
        reader.readAsText(file);
    }

    // 工具函数
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showMessage(message, type = 'info') {
        // 创建消息元素
        const messageEl = document.createElement('div');
        messageEl.className = `status-message status-${type}`;
        messageEl.textContent = message;

        // 插入到管理界面
        const adminContent = document.querySelector('.admin-content');
        if (adminContent) {
            adminContent.insertBefore(messageEl, adminContent.firstChild);
        }

        // 3秒后自动消失
        setTimeout(() => {
            if (messageEl.parentElement) {
                messageEl.remove();
            }
        }, 3000);
    }

    // 搜索功能
    searchArticles(query) {
        const articles = blogData.getArticles();
        const filtered = articles.filter(article => 
            article.title.toLowerCase().includes(query.toLowerCase()) ||
            article.content.toLowerCase().includes(query.toLowerCase()) ||
            article.category.toLowerCase().includes(query.toLowerCase())
        );

        return filtered;
    }
}

// 创建全局管理实例
const blogAdmin = new BlogAdmin();