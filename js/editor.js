// 富文本编辑器功能
class BlogEditor {
    constructor() {
        this.editor = null;
        this.isLinkMode = false;
        this.init();
    }

    init() {
        this.setupEditor();
        this.setupToolbar();
    }

    setupEditor() {
        this.editor = document.getElementById('article-content');
        if (!this.editor) return;

        // 设置编辑器默认内容
        this.editor.innerHTML = '<p>开始编写你的文章内容...</p>';

        // 编辑器事件监听
        this.editor.addEventListener('input', () => this.onContentChange());
        this.editor.addEventListener('paste', (e) => this.handlePaste(e));
        this.editor.addEventListener('keydown', (e) => this.handleKeydown(e));

        // 点击外部关闭链接输入框
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#editor-toolbar') && !e.target.closest('.link-input-container')) {
                this.closeLinkInput();
            }
        });
    }

    setupToolbar() {
        const toolbar = document.getElementById('editor-toolbar');
        if (!toolbar) return;

        // 工具栏按钮事件
        toolbar.addEventListener('click', (e) => {
            const button = e.target.closest('.editor-btn');
            if (!button) return;

            const command = button.dataset.command;
            this.executeCommand(command);
        });
    }

    executeCommand(command) {
        if (!this.editor) return;

        this.editor.focus();

        switch (command) {
            case 'bold':
            case 'italic':
            case 'underline':
                document.execCommand(command, false, null);
                break;
            case 'insertUnorderedList':
            case 'insertOrderedList':
                document.execCommand(command, false, null);
                break;
            case 'createLink':
                this.createLink();
                break;
        }

        this.onContentChange();
    }

    createLink() {
        const selection = window.getSelection();
        if (!selection.toString().trim()) {
            this.showMessage('请先选择要添加链接的文本', 'warning');
            return;
        }

        this.isLinkMode = true;
        this.showLinkInput();
    }

    showLinkInput() {
        // 移除现有的链接输入框
        this.closeLinkInput();

        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        const linkInputContainer = document.createElement('div');
        linkInputContainer.className = 'link-input-container';
        linkInputContainer.style.top = `${rect.bottom + window.scrollY + 5}px`;
        linkInputContainer.style.left = `${rect.left + window.scrollX}px`;

        linkInputContainer.innerHTML = `
            <div class="link-input">
                <input type="text" placeholder="输入链接地址" class="link-url">
                <button type="button" class="btn-primary" onclick="blogEditor.insertLink()">确定</button>
                <button type="button" class="editor-btn" onclick="blogEditor.closeLinkInput()">取消</button>
            </div>
        `;

        document.body.appendChild(linkInputContainer);

        // 自动聚焦输入框
        setTimeout(() => {
            const input = linkInputContainer.querySelector('.link-url');
            if (input) input.focus();
        }, 100);
    }

    insertLink() {
        const linkInput = document.querySelector('.link-input-container');
        if (!linkInput) return;

        const urlInput = linkInput.querySelector('.link-url');
        const url = urlInput.value.trim();

        if (!url) {
            this.showMessage('请输入链接地址', 'warning');
            return;
        }

        // 确保URL有协议
        const fullUrl = url.startsWith('http') ? url : `https://${url}`;

        document.execCommand('createLink', false, fullUrl);
        this.closeLinkInput();
        this.onContentChange();
    }

    closeLinkInput() {
        const linkInput = document.querySelector('.link-input-container');
        if (linkInput) {
            linkInput.remove();
        }
        this.isLinkMode = false;
    }

    handlePaste(e) {
        e.preventDefault();
        
        // 获取粘贴的纯文本
        const text = (e.clipboardData || window.clipboardData).getData('text/plain');
        
        // 插入纯文本
        document.execCommand('insertText', false, text);
        
        this.onContentChange();
    }

    handleKeydown(e) {
        // 处理Tab键缩进
        if (e.key === 'Tab') {
            e.preventDefault();
            document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
        }

        // 处理Enter键创建新段落
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            document.execCommand('insertHTML', false, '<p><br></p>');
        }
    }

    onContentChange() {
        // 编辑器内容变化时的回调
        // 可以在这里添加实时预览等功能
        const event = new CustomEvent('editorContentChange', {
            detail: { content: this.getContent() }
        });
        document.dispatchEvent(event);
    }

    // 获取编辑器内容
    getContent() {
        return this.editor ? this.editor.innerHTML : '';
    }

    // 设置编辑器内容
    setContent(content) {
        if (this.editor) {
            this.editor.innerHTML = content || '<p>开始编写你的文章内容...</p>';
        }
    }

    // 清空编辑器
    clear() {
        this.setContent('');
    }

    // 获取纯文本内容
    getPlainText() {
        if (!this.editor) return '';
        return this.editor.textContent || this.editor.innerText || '';
    }

    // 生成摘要（前150个字符）
    generateExcerpt(maxLength = 150) {
        const text = this.getPlainText();
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    // 显示消息
    showMessage(message, type = 'info') {
        // 移除现有的消息
        const existingMessage = document.querySelector('.status-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // 创建新消息
        const messageEl = document.createElement('div');
        messageEl.className = `status-message status-${type}`;
        messageEl.textContent = message;

        // 插入到编辑器上方
        const editorContainer = this.editor.parentElement;
        editorContainer.insertBefore(messageEl, this.editor);

        // 3秒后自动消失
        setTimeout(() => {
            if (messageEl.parentElement) {
                messageEl.remove();
            }
        }, 3000);
    }

    // 格式化工具
    formatSelection(tagName) {
        if (!this.editor) return;
        
        this.editor.focus();
        document.execCommand('formatBlock', false, tagName);
        this.onContentChange();
    }

    // 插入图片（基础实现）
    insertImage(url, altText = '') {
        if (!this.editor) return;
        
        this.editor.focus();
        const imgHtml = `<img src="${url}" alt="${altText}" style="max-width: 100%; height: auto;">`;
        document.execCommand('insertHTML', false, imgHtml);
        this.onContentChange();
    }

    // 撤销/重做功能
    undo() {
        if (!this.editor) return;
        this.editor.focus();
        document.execCommand('undo');
        this.onContentChange();
    }

    redo() {
        if (!this.editor) return;
        this.editor.focus();
        document.execCommand('redo');
        this.onContentChange();
    }
}

// 创建全局编辑器实例
const blogEditor = new BlogEditor();