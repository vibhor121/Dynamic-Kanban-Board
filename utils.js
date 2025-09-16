
const Utils = {
    generateId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        Object.keys(attributes).forEach(key => {
            if (key === 'className') {
                element.className = attributes[key];
            } else if (key === 'innerHTML') {
                element.innerHTML = attributes[key];
            } else {
                element.setAttribute(key, attributes[key]);
            }
        });
        
        if (content) {
            element.textContent = content;
        }
        
        return element;
    },

    getElementById(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Element with id '${id}' not found`);
        }
        return element;
    },

    addEventListener(element, event, handler, options = {}) {
        if (!element) {
            console.warn('Cannot add event listener to null element');
            return;
        }
        
        element.addEventListener(event, handler, options);
    },

    removeEventListener(element, event, handler) {
        if (!element) return;
        element.removeEventListener(event, handler);
    },

    addClass(element, className) {
        if (element && className) {
            element.classList.add(className);
        }
    },

    removeClass(element, className) {
        if (element && className) {
            element.classList.remove(className);
        }
    },

    toggleClass(element, className) {
        if (element && className) {
            element.classList.toggle(className);
        }
    },

    hasClass(element, className) {
        return element && element.classList.contains(className);
    },

    clearContainer(container) {
        if (container) {
            container.innerHTML = '';
        }
    },

    showMessage(message, type = 'info', duration = 3000) {
        const messageEl = this.createElement('div', {
            className: `message message-${type}`,
            style: `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
                max-width: 300px;
                word-wrap: break-word;
            `
        }, message);

        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            info: '#3498db',
            warning: '#f39c12'
        };
        messageEl.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(messageEl);

        setTimeout(() => {
            messageEl.style.opacity = '1';
            messageEl.style.transform = 'translateX(0)';
        }, 10);

        setTimeout(() => {
            messageEl.style.opacity = '0';
            messageEl.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, duration);
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    validateTask(taskData) {
        const errors = [];
        
        if (!taskData.title || taskData.title.trim().length === 0) {
            errors.push('Task title is required');
        }
        
        if (taskData.title && taskData.title.trim().length > 100) {
            errors.push('Task title must be less than 100 characters');
        }
        
        if (taskData.description && taskData.description.length > 500) {
            errors.push('Task description must be less than 500 characters');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },

    formatDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
};

window.Utils = Utils;
