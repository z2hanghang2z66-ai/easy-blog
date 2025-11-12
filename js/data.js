// 博客数据存储和管理
class BlogData {
    constructor() {
        this.storageKey = 'blog_data';
        this.articlesKey = 'blog_articles';
        this.authKey = 'blog_auth';
        this.init();
    }

    init() {
        // 初始化默认数据
        if (!this.getArticles().length) {
            this.saveArticles([
                {
                    id: this.generateId(),
                    title: '深入理解现代前端框架设计',
                    category: '技术',
                    content: '<p>探索React、Vue和Angular等现代前端框架的核心设计理念，了解它们如何解决复杂应用开发中的常见问题。</p>',
                    excerpt: '探索React、Vue和Angular等现代前端框架的核心设计理念，了解它们如何解决复杂应用开发中的常见问题。',
                    date: '2024-01-15',
                    published: true
                },
                {
                    id: this.generateId(),
                    title: 'iOS设计语言的发展与演变',
                    category: '设计',
                    content: '<p>从拟物化到扁平化，再到新拟态，iOS设计语言如何不断进化以适应时代需求和技术发展。</p>',
                    excerpt: '从拟物化到扁平化，再到新拟态，iOS设计语言如何不断进化以适应时代需求和技术发展。',
                    date: '2024-01-12',
                    published: true
                },
                {
                    id: this.generateId(),
                    title: '构建高性能Web应用的最佳实践',
                    category: '性能优化',
                    content: '<p>分享在实际项目中提升Web应用性能的有效策略和工具，包括代码分割、懒加载和缓存策略。</p>',
                    excerpt: '分享在实际项目中提升Web应用性能的有效策略和工具，包括代码分割、懒加载和缓存策略。',
                    date: '2024-01-10',
                    published: true
                }
            ]);
        }

        // 初始化默认管理员账户
        if (!this.getAuthData()) {
            this.saveAuthData({
                username: 'admin',
                password: this.hashPassword('admin123'), // 默认密码
                loggedIn: false
            });
        }
    }

    // 生成唯一ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // 密码哈希（简单实现）
    hashPassword(password) {
        return btoa(password); // 实际项目中应该使用更安全的哈希方法
    }

    // 验证密码
    verifyPassword(inputPassword, storedHash) {
        return this.hashPassword(inputPassword) === storedHash;
    }

    // 文章数据操作
    getArticles() {
        const data = localStorage.getItem(this.articlesKey);
        return data ? JSON.parse(data) : [];
    }

    saveArticles(articles) {
        localStorage.setItem(this.articlesKey, JSON.stringify(articles));
    }

    getArticle(id) {
        const articles = this.getArticles();
        return articles.find(article => article.id === id);
    }

    addArticle(articleData) {
        const articles = this.getArticles();
        const newArticle = {
            id: this.generateId(),
            title: articleData.title,
            category: articleData.category,
            content: articleData.content,
            excerpt: articleData.excerpt,
            date: new Date().toISOString().split('T')[0],
            published: true
        };
        articles.unshift(newArticle);
        this.saveArticles(articles);
        return newArticle;
    }

    updateArticle(id, articleData) {
        const articles = this.getArticles();
        const index = articles.findIndex(article => article.id === id);
        if (index !== -1) {
            articles[index] = { ...articles[index], ...articleData };
            this.saveArticles(articles);
            return articles[index];
        }
        return null;
    }

    deleteArticle(id) {
        const articles = this.getArticles();
        const filteredArticles = articles.filter(article => article.id !== id);
        this.saveArticles(filteredArticles);
        return filteredArticles.length !== articles.length;
    }

    getPublishedArticles() {
        return this.getArticles().filter(article => article.published);
    }

    // 认证数据操作
    getAuthData() {
        const data = localStorage.getItem(this.authKey);
        return data ? JSON.parse(data) : null;
    }

    saveAuthData(authData) {
        localStorage.setItem(this.authKey, JSON.stringify(authData));
    }

    login(username, password) {
        const authData = this.getAuthData();
        if (authData && authData.username === username && 
            this.verifyPassword(password, authData.password)) {
            authData.loggedIn = true;
            this.saveAuthData(authData);
            return true;
        }
        return false;
    }

    logout() {
        const authData = this.getAuthData();
        if (authData) {
            authData.loggedIn = false;
            this.saveAuthData(authData);
        }
    }

    isLoggedIn() {
        const authData = this.getAuthData();
        return authData ? authData.loggedIn : false;
    }

    changePassword(newPassword) {
        const authData = this.getAuthData();
        if (authData) {
            authData.password = this.hashPassword(newPassword);
            this.saveAuthData(authData);
            return true;
        }
        return false;
    }

    // 数据导出和导入
    exportData() {
        return {
            articles: this.getArticles(),
            auth: this.getAuthData()
        };
    }

    importData(data) {
        if (data.articles) {
            this.saveArticles(data.articles);
        }
        if (data.auth) {
            this.saveAuthData(data.auth);
        }
    }

    // 数据备份
    backupData() {
        const data = this.exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { 
            type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `blog_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// 创建全局数据实例
const blogData = new BlogData();