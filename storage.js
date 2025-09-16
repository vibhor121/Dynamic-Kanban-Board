
const Storage = {
    STORAGE_KEY: 'kanban_board_tasks',
    
    DEFAULT_DATA: {
        tasks: [],
        lastUpdated: null
    },

    isAvailable() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('localStorage is not available:', e.message);
            return false;
        }
    },

    getAllData() {
        if (!this.isAvailable()) {
            return { ...this.DEFAULT_DATA };
        }

        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (!stored) {
                return { ...this.DEFAULT_DATA };
            }

            const data = JSON.parse(stored);
            
            if (!data.tasks || !Array.isArray(data.tasks)) {
                console.warn('Invalid data structure in localStorage, resetting to default');
                return { ...this.DEFAULT_DATA };
            }

            return data;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return { ...this.DEFAULT_DATA };
        }
    },

    saveAllData(data) {
        if (!this.isAvailable()) {
            console.warn('localStorage not available, data not saved');
            return false;
        }

        try {
            const dataToSave = {
                ...data,
                lastUpdated: new Date().toISOString()
            };

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataToSave));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    },

    getTasks() {
        const data = this.getAllData();
        return data.tasks || [];
    },

    saveTasks(tasks) {
        if (!Array.isArray(tasks)) {
            console.error('Tasks must be an array');
            return false;
        }

        const data = this.getAllData();
        data.tasks = tasks;
        return this.saveAllData(data);
    },

    getTask(taskId) {
        const tasks = this.getTasks();
        return tasks.find(task => task.id === taskId) || null;
    },

    addTask(task) {
        if (!task || !task.id) {
            console.error('Task must have an ID');
            return false;
        }

        const tasks = this.getTasks();
        
        if (tasks.find(t => t.id === task.id)) {
            console.warn('Task with ID already exists:', task.id);
            return false;
        }

        tasks.push(task);
        return this.saveTasks(tasks);
    },

    updateTask(taskId, updates) {
        const tasks = this.getTasks();
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex === -1) {
            console.warn('Task not found:', taskId);
            return false;
        }

        tasks[taskIndex] = {
            ...tasks[taskIndex],
            ...updates,
            id: taskId, // Ensure ID doesn't change
            updatedAt: new Date().toISOString()
        };

        return this.saveTasks(tasks);
    },

    deleteTask(taskId) {
        const tasks = this.getTasks();
        const filteredTasks = tasks.filter(task => task.id !== taskId);
        
        if (filteredTasks.length === tasks.length) {
            console.warn('Task not found for deletion:', taskId);
            return false;
        }

        return this.saveTasks(filteredTasks);
    },

    moveTask(taskId, newColumn) {
        const validColumns = ['todo', 'inprogress', 'done'];
        
        if (!validColumns.includes(newColumn)) {
            console.error('Invalid column:', newColumn);
            return false;
        }

        return this.updateTask(taskId, {
            column: newColumn,
            movedAt: new Date().toISOString()
        });
    },

    getTasksByColumn(column) {
        const tasks = this.getTasks();
        return tasks.filter(task => task.column === column);
    },

    clearAllData() {
        if (!this.isAvailable()) {
            return false;
        }

        try {
            localStorage.removeItem(this.STORAGE_KEY);
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    },

    getStats() {
        const data = this.getAllData();
        const tasks = data.tasks || [];
        
        return {
            totalTasks: tasks.length,
            tasksByColumn: {
                todo: tasks.filter(t => t.column === 'todo').length,
                inprogress: tasks.filter(t => t.column === 'inprogress').length,
                done: tasks.filter(t => t.column === 'done').length
            },
            lastUpdated: data.lastUpdated,
            storageSize: this.isAvailable() ? 
                (localStorage.getItem(this.STORAGE_KEY) || '').length : 0
        };
    },

    exportData() {
        return JSON.stringify(this.getAllData(), null, 2);
    },

    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            if (!data.tasks || !Array.isArray(data.tasks)) {
                throw new Error('Invalid data structure');
            }

            return this.saveAllData(data);
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
};

window.Storage = Storage;
