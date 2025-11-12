// 主应用程序 - 整合所有功能
class BlogApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadBlogArticles();
        this.setupSmoothScrolling();
        this.setupCardAnimations();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        // 导航链接激活状态
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // 阻止管理后台链接的默认行为
                if (this.id === 'admin-login-link' || this.textContent === '管理后台') {
                    return;
                }
                
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // 标签页切换事件（委托给父元素）
        document.addEventListener('click', (e) => {
            if (e.target.matches('.tab-btn') || e.target.closest('.tab-btn')) {
                const button = e.target.matches('.tab-btn') ? e.target : e.target.closest('.tab-btn');
                const tabName = button.dataset.tab;
                blogAdmin.switchTab(tabName);
            }
        });

        // 全局键盘快捷键
        document.addEventListener('keydown', (e) => {
            // Ctrl+S 保存文章（在编辑模式下）
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                const articleForm = document.getElementById('article-form');
                if (articleForm && articleForm.offsetParent) { // 检查表单是否可见
                    blogAdmin.handleArticleSubmit();
                }
            }

            // ESC键关闭模态框
            if (e.key === 'Escape') {
                blogAuth.closeModals();
            }
        });

        // 窗口大小变化时重新计算布局
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // 页面可见性变化（切换标签页时暂停动画）
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
    }

    loadBlogArticles() {
        const blogGrid = document.getElementById('blog-grid');
        if (!blogGrid) return;

        const articles = blogData.getPublishedArticles();
        
        if (articles.length === 0) {
            blogGrid.innerHTML = `
                <div class="empty-state">
                    <h3>暂无文章</h3>
                    <p>博主正在努力创作中...</p>
                </div>
            `;
            return;
        }

        blogGrid.innerHTML = articles.map(article => `
            <article class="blog-card">
                <h3>${this.escapeHtml(article.title)}</h3>
                <div class="date">${article.date} • ${this.escapeHtml(article.category)}</div>
                <p class="excerpt">${this.escapeHtml(article.excerpt)}</p>
                <a href="#" class="read-more" onclick="blogApp.readArticle('${article.id}')">阅读全文</a>
            </article>
        `).join('');

        // 为新增的卡片设置动画
        this.setupCardAnimations();
    }

    readArticle(articleId) {
        const article = blogData.getArticle(articleId);
        if (!article) {
            this.showMessage('文章不存在', 'error');
            return;
        }

        // 创建文章阅读模态框
        this.showArticleModal(article);
    }

    showArticleModal(article) {
        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
                <span class="close" onclick="this.parentElement.parentElement.style.display='none'">&times;</span>
                <h2 style="margin-bottom: 1rem;">${this.escapeHtml(article.title)}</h2>
                <div class="meta" style="color: var(--text-secondary); margin-bottom: 2rem;">
                    ${article.date} • ${this.escapeHtml(article.category)}
                </div>
                <div class="article-content" style="line-height: 1.8; font-size: 1.1rem;">
                    ${article.content}
                </div>
                <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--border-color);">
                    <button class="btn-primary" onclick="this.parentElement.parentElement.parentElement.style.display='none'">关闭</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 点击外部关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // ESC键关闭
        const closeHandler = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', closeHandler);
            }
        };
        document.addEventListener('keydown', closeHandler);
    }

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                // 排除管理后台链接
                if (this.id === 'admin-login-link' || this.textContent === '管理后台') {
                    return;
                }
                
                e.preventDefault();
                const href = this.getAttribute('href');
                // 检查href是否为空或只有#
                if (href && href !== '#') {
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });
    }

    setupCardAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // 为博客卡片添加初始动画状态
        document.querySelectorAll('.blog-card').forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            card.style.transitionDelay = `${index * 0.1}s`;
            observer.observe(card);
            
            // 确保悬停效果不被覆盖
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px) scale(1.02)';
                this.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = 'var(--shadow)';
            });
        });
    }

    checkAuthStatus() {
        // 页面加载时检查登录状态
        if (blogData.isLoggedIn()) {
            blogAuth.updateLoginUI(true);
        }
    }

    handleResize() {
        // 响应式布局调整
        const adminModal = document.getElementById('admin-modal');
        if (adminModal && adminModal.style.display === 'block') {
            // 重新计算模态框位置
        }
    }

    handleVisibilityChange() {
        // 页面可见性变化处理
        if (document.hidden) {
            // 页面不可见时暂停复杂动画
        } else {
            // 页面重新可见时恢复
        }
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

        // 插入到页面顶部
        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(messageEl, container.firstChild);
        } else {
            // 如果.container不存在，插入到body开头
            document.body.insertBefore(messageEl, document.body.firstChild);
        }

        // 3秒后自动消失
        setTimeout(() => {
            if (messageEl.parentElement) {
                messageEl.remove();
            }
        }, 3000);
    }

    // 搜索功能（未来扩展）
    search(query) {
        const results = blogAdmin.searchArticles(query);
        // 实现搜索结果显示
        return results;
    }

    // 数据统计（未来扩展）
    getStats() {
        const articles = blogData.getArticles();
        return {
            totalArticles: articles.length,
            publishedArticles: articles.filter(a => a.published).length,
            totalCategories: new Set(articles.map(a => a.category)).size
        };
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', function() {
    window.blogApp = new BlogApp();
    
    // 全局错误处理
    window.addEventListener('error', function(e) {
        console.error('全局错误:', e.error);
    });
    
    window.addEventListener('unhandledrejection', function(e) {
        console.error('未处理的Promise拒绝:', e.reason);
    });
});

// 提供全局访问
window.blogData = blogData;
window.blogEditor = blogEditor;
window.blogAuth = blogAuth;
window.blogAdmin = blogAdmin;