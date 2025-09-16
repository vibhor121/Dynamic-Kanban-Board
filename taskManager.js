
const TaskManager = {
    taskCounter: 0,
    
    onTaskCreated: null,
    onTaskUpdated: null,
    onTaskDeleted: null,

    init(onTaskCreated = null, onTaskUpdated = null, onTaskDeleted = null) {
        this.onTaskCreated = onTaskCreated;
        this.onTaskUpdated = onTaskUpdated;
        this.onTaskDeleted = onTaskDeleted;
        
        this.setupEventListeners();
        this.loadTasksFromStorage();
        
        console.log('Task manager initialized');
    },

    setupEventListeners() {
        const addTaskBtn = Utils.getElementById('addTaskBtn');
        if (addTaskBtn) {
            Utils.addEventListener(addTaskBtn, 'click', (e) => {
                e.preventDefault();
                this.handleAddTask();
            });
        }

        const taskForm = document.querySelector('.task-form');
        if (taskForm) {
            Utils.addEventListener(taskForm, 'submit', (e) => {
                e.preventDefault();
                this.handleAddTask();
            });
        }

        const taskTitle = Utils.getElementById('taskTitle');
        const taskDescription = Utils.getElementById('taskDescription');
        
        if (taskTitle) {
            Utils.addEventListener(taskTitle, 'keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleAddTask();
                }
            });
        }

        if (taskDescription) {
            Utils.addEventListener(taskDescription, 'keypress', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault();
                    this.handleAddTask();
                }
            });
        }
    },

    handleAddTask() {
        const titleInput = Utils.getElementById('taskTitle');
        const descriptionInput = Utils.getElementById('taskDescription');
        
        if (!titleInput || !descriptionInput) {
            console.error('Form inputs not found');
            return;
        }

        const taskData = {
            title: titleInput.value.trim(),
            description: descriptionInput.value.trim()
        };

        const validation = Utils.validateTask(taskData);
        if (!validation.isValid) {
            Utils.showMessage(validation.errors.join(', '), 'error');
            return;
        }

        const task = this.createTask(taskData);
        
        if (task) {
            titleInput.value = '';
            descriptionInput.value = '';
            titleInput.focus();
            
            Utils.showMessage('Task created successfully!', 'success');
            
            if (this.onTaskCreated) {
                this.onTaskCreated(task);
            }
        }
    },

    createTask(taskData) {
        const task = {
            id: Utils.generateId(),
            title: Utils.sanitizeHTML(taskData.title),
            description: Utils.sanitizeHTML(taskData.description),
            column: 'todo',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            completed: false
        };

        const success = Storage.addTask(task);
        if (!success) {
            Utils.showMessage('Failed to save task', 'error');
            return null;
        }

        this.renderTask(task);
        
        return task;
    },

    renderTask(task) {
        const columnList = Utils.getElementById(`${task.column}-list`);
        if (!columnList) {
            console.error(`Column list not found: ${task.column}`);
            return;
        }

        const taskElement = this.createTaskElement(task);
        columnList.appendChild(taskElement);
        
        Utils.addClass(taskElement, 'new-task');
        setTimeout(() => {
            Utils.removeClass(taskElement, 'new-task');
        }, 300);
    },

    createTaskElement(task) {
        const taskCard = Utils.createElement('div', {
            className: 'task-card',
            'data-task-id': task.id,
            'data-column': task.column,
            draggable: 'true'
        });

        const title = Utils.createElement('div', {
            className: 'task-title'
        }, task.title);

        const description = Utils.createElement('div', {
            className: 'task-description'
        }, task.description);

        const meta = Utils.createElement('div', {
            className: 'task-meta'
        });

        const taskId = Utils.createElement('span', {
            className: 'task-id'
        }, `#${task.id.split('_')[1]}`);

        const deleteBtn = Utils.createElement('button', {
            className: 'delete-btn',
            type: 'button'
        }, '×');

        Utils.addEventListener(deleteBtn, 'click', (e) => {
            e.stopPropagation();
            this.deleteTask(task.id);
        });

        meta.appendChild(taskId);
        meta.appendChild(deleteBtn);
        
        taskCard.appendChild(title);
        taskCard.appendChild(description);
        taskCard.appendChild(meta);

        DragDrop.enableDragForTask(taskCard);

        return taskCard;
    },

    deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }

        const success = Storage.deleteTask(taskId);
        if (!success) {
            Utils.showMessage('Failed to delete task', 'error');
            return;
        }

        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskElement) {
            taskElement.remove();
        }

        Utils.showMessage('Task deleted successfully', 'success');
        
        if (this.onTaskDeleted) {
            this.onTaskDeleted(taskId);
        }
    },

    updateTask(taskId, updates) {
        const success = Storage.updateTask(taskId, updates);
        if (!success) {
            Utils.showMessage('Failed to update task', 'error');
            return false;
        }

        this.refreshTaskInDOM(taskId);
        
        if (this.onTaskUpdated) {
            this.onTaskUpdated(taskId, updates);
        }

        return true;
    },

    refreshTaskInDOM(taskId) {
        const task = Storage.getTask(taskId);
        if (!task) return;

        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        if (!taskElement) return;

        const titleElement = taskElement.querySelector('.task-title');
        if (titleElement) {
            titleElement.textContent = task.title;
        }

        const descriptionElement = taskElement.querySelector('.task-description');
        if (descriptionElement) {
            descriptionElement.textContent = task.description;
        }

        if (taskElement.dataset.column !== task.column) {
            const targetList = Utils.getElementById(`${task.column}-list`);
            if (targetList) {
                targetList.appendChild(taskElement);
                taskElement.dataset.column = task.column;
            }
        }
    },

    loadTasksFromStorage() {
        const tasks = Storage.getTasks();
        console.log(`Loading ${tasks.length} tasks from storage`);

        this.clearAllTasks();

        tasks.forEach(task => {
            this.renderTask(task);
        });

        this.updateEmptyStates();
    },

    clearAllTasks() {
        const columns = ['todo', 'inprogress', 'done'];
        columns.forEach(column => {
            const list = Utils.getElementById(`${column}-list`);
            if (list) {
                Utils.clearContainer(list);
            }
        });
    },

    updateEmptyStates() {
        const columns = ['todo', 'inprogress', 'done'];
        
        columns.forEach(column => {
            const list = Utils.getElementById(`${column}-list`);
            if (!list) return;

            const hasTasks = list.children.length > 0;
            let emptyState = list.querySelector('.empty-state');
            
            if (!hasTasks && !emptyState) {
                emptyState = Utils.createElement('div', {
                    className: 'empty-state'
                }, `No tasks in ${this.getColumnDisplayName(column)}`);
                
                list.appendChild(emptyState);
            } else if (hasTasks && emptyState) {
                emptyState.remove();
            }
        });
    },

    getColumnDisplayName(column) {
        const names = {
            'todo': 'To Do',
            'inprogress': 'In Progress',
            'done': 'Done'
        };
        return names[column] || column;
    },

    getStats() {
        const stats = Storage.getStats();
        return {
            ...stats,
            completionRate: stats.totalTasks > 0 ? 
                (stats.tasksByColumn.done / stats.totalTasks * 100).toFixed(1) : 0
        };
    },

    searchTasks(query) {
        const tasks = Storage.getTasks();
        const searchTerm = query.toLowerCase().trim();
        
        if (!searchTerm) return tasks;
        
        return tasks.filter(task => 
            task.title.toLowerCase().includes(searchTerm) ||
            task.description.toLowerCase().includes(searchTerm)
        );
    },

    exportTasks() {
        return Storage.exportData();
    },

    importTasks(jsonString) {
        const success = Storage.importData(jsonString);
        if (success) {
            this.loadTasksFromStorage();
            Utils.showMessage('Tasks imported successfully', 'success');
        } else {
            Utils.showMessage('Failed to import tasks', 'error');
        }
        return success;
    }
};

window.TaskManager = TaskManager;
