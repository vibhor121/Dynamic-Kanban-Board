#Deployed link :- 
dynamic-kanban-board-red.vercel.app

# Dynamic Kanban Board

A lightweight, vanilla JavaScript Kanban board with three columns (To Do, In Progress, Done). Add tasks, drag them between columns, delete them, and have everything saved in your browser via localStorage. No frameworks required.

### Demo
- Open `index.html` directly in your browser (Chrome/Edge/Firefox). No server needed.

### Features
- Add tasks with title and description
- Drag-and-drop between columns
- Delete tasks with confirmation
- Auto-save to browser `localStorage`
- Responsive layout (desktop and mobile)
- Toast notifications for success/error/info

### Project Structure
```
Kanban-Board/
  index.html      # Page layout and script loading
  styles.css      # Visual styles and animations
  utils.js        # Helper functions (DOM, messages, validation)
  storage.js      # Persistent data layer using localStorage
  dragDrop.js     # Drag & drop behavior between columns
  taskManager.js  # Create/render/update/delete tasks in the UI
  app.js          # App bootstrapper and orchestrator
  README.md       # This file
  ABOUT.md        # Overview, motivation, credits
```

### How It Works (High-Level)
- `index.html` defines inputs and the three columns, then loads scripts.
- `app.js` initializes modules, wires global events, loads saved tasks, and shows a welcome message.
- `taskManager.js` manages creating tasks, rendering task cards, deleting tasks, and keeping columns in sync.
- `dragDrop.js` handles the browser drag-and-drop lifecycle and moves tasks between columns in both storage and the DOM.
- `storage.js` persists tasks as JSON in `localStorage` and provides CRUD helpers and stats.
- `utils.js` provides small helpers: DOM creation, class toggling, toasts, validation, debounce/throttle, and sanitization.

### Getting Started
1) Clone/download the repo.
2) Double-click `index.html` to open it in your browser.
3) Open live Server
4) Start adding tasks.

