// 用户认证系统
class BlogAuth {
    constructor() {
        this.loginModal = document.getElementById('login-modal');
        this.adminModal = document.getElementById('admin-modal');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkLoginStatus();
    }

    setupEventListeners() {
        // 登录链接点击事件
        const loginLink = document.getElementById('admin-login-link');
        if (loginLink) {
            loginLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginModal();
            });
        }

        // 登录表单提交事件
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // 模态框关闭事件
        const closeButtons = document.querySelectorAll('.close');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.closeModals();
            });
        });

        // 点击模态框外部关闭
        window.addEventListener('click', (e) => {
            if (e.target === this.loginModal) {
                this.closeModals();
            }
            if (e.target === this.adminModal) {
                this.closeModals();
            }
        });

        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModals();
            }
        });
    }

    checkLoginStatus() {
        if (blogData.isLoggedIn()) {
            this.updateLoginUI(true);
        }
    }

    showLoginModal() {
        if (blogData.isLoggedIn()) {
            this.showAdminModal();
        } else {
            this.loginModal.style.display = 'block';
            // 清空表单
            document.getElementById('login-form').reset();
            // 聚焦用户名输入框
            setTimeout(() => {
                document.getElementById('username').focus();
            }, 100);
        }
    }

    showAdminModal() {
        if (!blogData.isLoggedIn()) {
            this.showLoginModal();
            return;
        }

        this.adminModal.style.display = 'block';
        // 加载文章列表
        this.loadArticleList();
        // 重置新建文章表单
        this.resetArticleForm();
    }

    closeModals() {
        if (this.loginModal) this.loginModal.style.display = 'none';
        if (this.adminModal) this.adminModal.style.display = 'none';
    }

    async handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (!username || !password) {
            this.showMessage('请输入用户名和密码', 'error');
            return;
        }

        // 显示加载状态
        const submitBtn = document.querySelector('#login-form .btn-primary');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<span class="loading"></span> 登录中...';
        submitBtn.disabled = true;

        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (blogData.login(username, password)) {
            this.showMessage('登录成功！', 'success');
            this.closeModals();
            this.updateLoginUI(true);
            this.showAdminModal();
        } else {
            this.showMessage('用户名或密码错误', 'error');
        }

        // 恢复按钮状态
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }

    logout() {
        blogData.logout();
        this.updateLoginUI(false);
        this.closeModals();
        this.showMessage('已退出登录', 'info');
    }

    updateLoginUI(isLoggedIn) {
        const loginLink = document.getElementById('admin-login-link');
        if (!loginLink) return;

        if (isLoggedIn) {
            loginLink.textContent = '管理后台';
            loginLink.style.color = 'var(--success-color)';
            loginLink.style.fontWeight = '600';
        } else {
            loginLink.textContent = '管理后台';
            loginLink.style.color = '';
            loginLink.style.fontWeight = '';
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
                </div>
                <div class="article-actions">
                    <button class="btn-edit" onclick="blogAuth.editArticle('${article.id}')">编辑</button>
                    <button class="btn-delete" onclick="blogAuth.deleteArticle('${article.id}')">删除</button>
                </div>
            </div>
        `).join('');
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
            const form = document.getElementById('article-form');
            if (form.dataset.editId === articleId) {
                this.resetArticleForm();
            }
        } else {
            this.showMessage('删除失败', 'error');
        }
    }

    resetArticleForm() {
        const form = document.getElementById('article-form');
        form.reset();
        delete form.dataset.editId;
        blogEditor.clear();
        
        const submitBtn = form.querySelector('.btn-primary');
        submitBtn.textContent = '发布文章';
    }

    switchTab(tabName) {
        // 切换标签页
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');

        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));

        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        const activePane = document.getElementById(tabName);

        if (activeBtn) activeBtn.classList.add('active');
        if (activePane) activePane.classList.add('active');
    }

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

        // 插入到页面顶部
        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(messageEl, container.firstChild);
        }

        // 3秒后自动消失
        setTimeout(() => {
            if (messageEl.parentElement) {
                messageEl.remove();
            }
        }, 3000);
    }

    // 导出数据
    exportData() {
        blogData.backupData();
        this.showMessage('数据备份已开始下载', 'success');
    }

    // 导入数据
    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

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
}

// 创建全局认证实例
const blogAuth = new BlogAuth();