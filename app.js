const App = {
    isInitialized: false,
    
    modules: {
        utils: null,
        storage: null,
        dragDrop: null,
        taskManager: null
    },

    init() {
        console.log('Initializing Kanban Board Application...');
        
        if (this.isInitialized) {
            console.warn('App already initialized');
            return;
        }

        if (!this.checkCompatibility()) {
            this.showCompatibilityError();
            return;
        }

        this.initializeModules();
        this.setupAppEventListeners();
        this.loadInitialData();
        this.isInitialized = true;
        
        console.log('Kanban Board Application initialized successfully');
        this.showWelcomeMessage();
    },

    checkCompatibility() {
        const requiredFeatures = [
            'localStorage' in window,
            'JSON' in window,
            'addEventListener' in document,
            'querySelector' in document
        ];

        return requiredFeatures.every(feature => feature);
    },

    showCompatibilityError() {
        const errorMessage = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #e74c3c;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: Arial, sans-serif;
                z-index: 10000;
                text-align: center;
                padding: 20px;
            ">
                <div>
                    <h1>Browser Not Supported</h1>
                    <p>This application requires a modern browser with support for:</p>
                    <ul style="text-align: left; display: inline-block;">
                        <li>localStorage</li>
                        <li>JSON</li>
                        <li>Modern DOM APIs</li>
                    </ul>
                    <p>Please update your browser or try a different one.</p>
                </div>
            </div>
        `;
        
        document.body.innerHTML = errorMessage;
    },

    initializeModules() {
        try {
            this.modules.utils = window.Utils;
            if (!this.modules.utils) {
                throw new Error('Utils module not found');
            }

            this.modules.storage = window.Storage;
            if (!this.modules.storage) {
                throw new Error('Storage module not found');
            }

            this.modules.dragDrop = window.DragDrop;
            if (!this.modules.dragDrop) {
                throw new Error('DragDrop module not found');
            }

            this.modules.taskManager = window.TaskManager;
            if (!this.modules.taskManager) {
                throw new Error('TaskManager module not found');
            }

            this.modules.taskManager.init(
                this.onTaskCreated.bind(this),
                this.onTaskUpdated.bind(this),
                this.onTaskDeleted.bind(this)
            );

            this.modules.dragDrop.init(
                this.onTaskMoved.bind(this),
                this.onTaskDropped.bind(this)
            );

            console.log('All modules initialized successfully');

        } catch (error) {
            console.error('Failed to initialize modules:', error);
            this.showErrorMessage('Failed to initialize application. Please refresh the page.');
        }
    },

    setupAppEventListeners() {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.onPageVisible();
            }
        });

        window.addEventListener('beforeunload', () => {
            this.onBeforeUnload();
        });

        window.addEventListener('resize', Utils.debounce(() => {
            this.onWindowResize();
        }, 250));

        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        window.addEventListener('error', (e) => {
            console.error('Application error:', e.error);
            this.handleError(e.error);
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            this.handleError(e.reason);
        });
    },

    loadInitialData() {
        try {
            this.modules.taskManager.loadTasksFromStorage();
            const stats = this.modules.storage.getStats();
            console.log('Storage statistics:', stats);
            
        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.showErrorMessage('Failed to load saved data. Starting with empty board.');
        }
    },

    showWelcomeMessage() {
        const stats = this.modules.taskManager.getStats();
        
        if (stats.totalTasks === 0) {
            Utils.showMessage('Welcome! Create your first task to get started.', 'info', 5000);
        } else {
            Utils.showMessage(`Welcome back! You have ${stats.totalTasks} tasks.`, 'info', 3000);
        }
    },

    onTaskCreated(task) {
        console.log('Task created:', task);
        this.modules.taskManager.updateEmptyStates();
        const stats = this.modules.taskManager.getStats();
        console.log('Updated stats:', stats);
    },

    onTaskUpdated(taskId, updates) {
        console.log('Task updated:', taskId, updates);
    },

    onTaskDeleted(taskId) {
        console.log('Task deleted:', taskId);
        this.modules.taskManager.updateEmptyStates();
    },

    onTaskMoved(taskId, fromColumn, toColumn) {
        console.log(`Task ${taskId} moved from ${fromColumn} to ${toColumn}`);
        this.modules.taskManager.updateEmptyStates();
    },

    onTaskDropped(taskId, column) {
        console.log(`Task ${taskId} dropped in ${column}`);
    },

    onPageVisible() {
        console.log('Page became visible, refreshing data...');
        this.modules.taskManager.loadTasksFromStorage();
    },

    onBeforeUnload() {
        console.log('Page unloading, ensuring data is saved...');
    },

    onWindowResize() {
        console.log('Window resized, updating layout...');
    },

    handleKeyboardShortcuts(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            const titleInput = Utils.getElementById('taskTitle');
            if (titleInput) {
                titleInput.focus();
            }
        }
        
        if (e.key === 'Escape') {
            const titleInput = Utils.getElementById('taskTitle');
            const descriptionInput = Utils.getElementById('taskDescription');
            
            if (titleInput) titleInput.value = '';
            if (descriptionInput) descriptionInput.value = '';
        }
    },

    handleError(error) {
        console.error('Application error:', error);
        
        Utils.showMessage(
            'An unexpected error occurred. Please refresh the page if the problem persists.',
            'error',
            5000
        );
    },

    showErrorMessage(message) {
        Utils.showMessage(message, 'error', 5000);
    },

    getStats() {
        return {
            isInitialized: this.isInitialized,
            modules: Object.keys(this.modules).filter(key => this.modules[key] !== null),
            taskStats: this.modules.taskManager.getStats(),
            dragDropSupported: this.modules.dragDrop.isSupported(),
            storageAvailable: this.modules.storage.isAvailable()
        };
    },

    reset() {
        if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
            this.modules.storage.clearAllData();
            this.modules.taskManager.loadTasksFromStorage();
            Utils.showMessage('Application data reset successfully', 'success');
        }
    },

    exportData() {
        return this.modules.taskManager.exportTasks();
    },

    importData(jsonString) {
        return this.modules.taskManager.importTasks(jsonString);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

window.App = App;
