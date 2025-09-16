
const DragDrop = {
    draggedElement: null,
    
    dragData: null,
    
    onTaskMove: null,
    onTaskDrop: null,

    init(onTaskMove = null, onTaskDrop = null) {
        this.onTaskMove = onTaskMove;
        this.onTaskDrop = onTaskDrop;
        
        this.setupDragListeners();
        this.setupDropListeners();
        
        console.log('Drag and drop initialized');
    },

    setupDragListeners() {
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('task-card')) {
                this.handleDragStart(e);
            }
        });

        document.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('task-card')) {
                this.handleDragEnd(e);
            }
        });

        document.addEventListener('drag', (e) => {
            if (e.target.classList.contains('task-card')) {
                this.handleDrag(e);
            }
        });
    },

    setupDropListeners() {
        const columns = document.querySelectorAll('.column');
        
        columns.forEach(column => {
            column.addEventListener('dragover', (e) => {
                this.handleDragOver(e);
            });

            column.addEventListener('drop', (e) => {
                this.handleDrop(e);
            });

            column.addEventListener('dragenter', (e) => {
                this.handleDragEnter(e);
            });

            column.addEventListener('dragleave', (e) => {
                this.handleDragLeave(e);
            });
        });
    },

    handleDragStart(e) {
        this.draggedElement = e.target;
        this.dragData = {
            taskId: e.target.dataset.taskId,
            sourceColumn: e.target.dataset.column,
            element: e.target
        };

        Utils.addClass(e.target, 'dragging');
        
        e.dataTransfer.effectAllowed = 'move';
        
        e.dataTransfer.setData('text/plain', this.dragData.taskId);
        
        this.createDragImage(e.target);
        
        console.log('Drag started:', this.dragData);
    },

    handleDragEnd(e) {
        Utils.removeClass(e.target, 'dragging');
        
        this.draggedElement = null;
        this.dragData = null;
        
        document.querySelectorAll('.drag-over').forEach(el => {
            Utils.removeClass(el, 'drag-over');
        });
        
        console.log('Drag ended');
    },

    handleDrag(e) {
    },

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    },

    handleDragEnter(e) {
        e.preventDefault();
        
        const column = e.target.closest('.column');
        if (column && this.dragData) {
            Utils.addClass(column, 'drag-over');
            Utils.addClass(column.querySelector('.task-list'), 'drag-over');
        }
    },

    handleDragLeave(e) {
        const column = e.target.closest('.column');
        if (column && !column.contains(e.relatedTarget)) {
            Utils.removeClass(column, 'drag-over');
            Utils.removeClass(column.querySelector('.task-list'), 'drag-over');
        }
    },

    handleDrop(e) {
        e.preventDefault();
        
        const column = e.target.closest('.column');
        if (!column || !this.dragData) {
            return;
        }

        const targetColumn = column.dataset.column;
        const sourceColumn = this.dragData.sourceColumn;
        
        Utils.removeClass(column, 'drag-over');
        Utils.removeClass(column.querySelector('.task-list'), 'drag-over');
        
        if (targetColumn !== sourceColumn) {
            this.moveTaskToColumn(this.dragData.taskId, targetColumn);
            
            if (this.onTaskMove) {
                this.onTaskMove(this.dragData.taskId, sourceColumn, targetColumn);
            }
        }
        
        if (this.onTaskDrop) {
            this.onTaskDrop(this.dragData.taskId, targetColumn);
        }
        
        console.log(`Task ${this.dragData.taskId} dropped in ${targetColumn}`);
    },

    moveTaskToColumn(taskId, targetColumn) {
        const success = Storage.moveTask(taskId, targetColumn);
        
        if (success) {
            this.updateTaskInDOM(taskId, targetColumn);
            Utils.showMessage(`Task moved to ${this.getColumnDisplayName(targetColumn)}`, 'success');
        } else {
            Utils.showMessage('Failed to move task', 'error');
        }
    },

    updateTaskInDOM(taskId, targetColumn) {
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        if (!taskElement) return;

        taskElement.dataset.column = targetColumn;
        
        const targetList = document.querySelector(`#${targetColumn}-list`);
        if (targetList) {
            targetList.appendChild(taskElement);
            
            Utils.addClass(taskElement, 'new-task');
            setTimeout(() => {
                Utils.removeClass(taskElement, 'new-task');
            }, 300);
        }
    },

    createDragImage(element) {
        const dragImage = element.cloneNode(true);
        dragImage.style.transform = 'rotate(5deg)';
        dragImage.style.opacity = '0.8';
        dragImage.style.width = element.offsetWidth + 'px';
        
        document.body.appendChild(dragImage);
        
        const rect = element.getBoundingClientRect();
        const offsetX = rect.width / 2;
        const offsetY = rect.height / 2;
        
        try {
            if (window.DataTransfer && window.DataTransfer.prototype.setDragImage) {
            }
        } catch (error) {
            console.log('Custom drag image not supported');
        }
        
        setTimeout(() => {
            if (dragImage.parentNode) {
                dragImage.parentNode.removeChild(dragImage);
            }
        }, 0);
    },

    getColumnDisplayName(column) {
        const names = {
            'todo': 'To Do',
            'inprogress': 'In Progress',
            'done': 'Done'
        };
        return names[column] || column;
    },

    enableDragForTask(taskElement) {
        taskElement.draggable = true;
        taskElement.setAttribute('draggable', 'true');
    },

    disableDragForTask(taskElement) {
        taskElement.draggable = false;
        taskElement.removeAttribute('draggable');
    },

    isSupported() {
        const div = document.createElement('div');
        return (
            'draggable' in div ||
            ('ondragstart' in div && 'ondrop' in div)
        );
    },

    getDragState() {
        return {
            isDragging: !!this.draggedElement,
            draggedElement: this.draggedElement,
            dragData: this.dragData
        };
    }
};

window.DragDrop = DragDrop;
