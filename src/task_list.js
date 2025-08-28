import Task from './task.js';

class TaskList {
  constructor() {
    this.tasks = this.loadTasks();
    this.currentProjectId = null;
    
    // DOM elements
    this.taskListElement = document.querySelector('.task-list');
    
    // Listen for project selection events
    document.addEventListener('projectSelected', (e) => {
      this.currentProjectId = e.detail.projectId;
      this.render();
    });
    
    // Listen for task updates
    document.addEventListener('taskAdded', () => {
      this.tasks = this.loadTasks();
      this.render();
      this.emitTasksUpdatedEvent();
    });
    
    // Listen for task toggle complete event
    document.addEventListener('toggleTaskComplete', (e) => {
      this.toggleTaskComplete(e.detail.taskId);
    });
    
    // Listen for task delete event
    document.addEventListener('deleteTask', (e) => {
      this.removeTask(e.detail.taskId);
    });
  }
  
  loadTasks() {
    const tasks = localStorage.getItem('tasks');
    if (tasks) {
      try {
        const parsedTasks = JSON.parse(tasks);
        return parsedTasks.map(task => Task.fromJSON(task));
      } catch (e) {
        console.error('Error parsing tasks from localStorage:', e);
        return [];
      }
    }
    return [];
  }
  
  saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks.map(task => task.toJSON())));
  }
  
  getTasksForProject(projectId) {
    return this.tasks.filter(task => task.projectId === projectId);
  }
  
  addTask(title, description, dueDate, projectId) {
    const task = new Task(title, description, dueDate, projectId);
    this.tasks.push(task);
    this.saveTasks();
    if (this.currentProjectId === projectId) {
      this.render();
    }
    this.emitTasksUpdatedEvent();
    return task;
  }
  
  removeTask(taskId) {
    this.tasks = this.tasks.filter(task => task.id !== taskId);
    this.saveTasks();
    if (this.currentProjectId) {
      this.render();
    }
    this.emitTasksUpdatedEvent();
  }
  
  toggleTaskComplete(taskId) {
    const task = this.tasks.find(task => task.id === taskId);
    if (task) {
      task.toggleComplete();
      this.saveTasks();
      if (this.currentProjectId === task.projectId) {
        this.render();
      }
      this.emitTasksUpdatedEvent();
    }
  }
  
  // Sort tasks by due date (closest first), with completed tasks at the end
  sortTasks(tasks) {
    return [...tasks].sort((a, b) => {
      // Completed tasks go to the end
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      
      // If both are completed or both are not completed, sort by due date
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      
      // Tasks with due dates come before tasks without due dates
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      
      // If both have no due date, maintain original order
      return 0;
    });
  }
  
  emitTasksUpdatedEvent() {
    const event = new CustomEvent('tasksUpdated');
    document.dispatchEvent(event);
  }
  
  showAddTaskForm() {
    // Create form elements
    const formContainer = document.createElement('div');
    formContainer.className = 'add-task-form';
    
    formContainer.innerHTML = `
      <h3>Add New Task</h3>
      <input type="text" id="new-task-title" placeholder="Task title" required>
      <textarea id="new-task-description" placeholder="Task description"></textarea>
      <input type="date" id="new-task-due-date">
      <div class="form-buttons">
        <button id="cancel-add-task">Cancel</button>
        <button id="save-add-task">Add Task</button>
      </div>
    `;
    
    // Clear the task list and show the form
    this.taskListElement.innerHTML = '';
    this.taskListElement.appendChild(formContainer);
    
    // Add event listeners
    document.getElementById('cancel-add-task').addEventListener('click', () => {
      this.render();
    });
    
    document.getElementById('save-add-task').addEventListener('click', () => {
      const title = document.getElementById('new-task-title').value.trim();
      const description = document.getElementById('new-task-description').value.trim();
      const dueDate = document.getElementById('new-task-due-date').value;
      
      if (title && this.currentProjectId) {
        this.addTask(title, description, dueDate, this.currentProjectId);
      }
    });
    
    // Also allow saving with Enter key in the title field
    document.getElementById('new-task-title').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('save-add-task').click();
      }
    });
  }
  
  render() {
    if (!this.taskListElement) return;
    
    if (!this.currentProjectId) {
      this.taskListElement.innerHTML = '<p>Select a project to view tasks</p>';
      return;
    }
    
    const projectTasks = this.getTasksForProject(this.currentProjectId);
    const sortedTasks = this.sortTasks(projectTasks);
    
    this.taskListElement.innerHTML = '';
    
    const heading = document.createElement('h2');
    heading.textContent = 'Tasks';
    this.taskListElement.appendChild(heading);
    
    // Add "Add Task" button
    const addTaskButton = document.createElement('button');
    addTaskButton.textContent = '+ Add Task';
    addTaskButton.className = 'add-task-button';
    addTaskButton.addEventListener('click', () => this.showAddTaskForm());
    this.taskListElement.appendChild(addTaskButton);
    
    if (sortedTasks.length === 0) {
      const noTasksMessage = document.createElement('p');
      noTasksMessage.textContent = 'No tasks for this project';
      noTasksMessage.className = 'no-tasks-message';
      this.taskListElement.appendChild(noTasksMessage);
      return;
    }
    
    sortedTasks.forEach(task => {
      const taskElement = this.createTaskElement(task);
      this.taskListElement.appendChild(taskElement);
    });
  }
  
  createTaskElement(task) {
    const div = document.createElement('div');
    div.className = `task-item ${task.completed ? 'completed' : ''} ${task.isOverdue() ? 'overdue' : ''}`;
    div.dataset.taskId = task.id;
    
    div.innerHTML = `
      <input type="checkbox" ${task.completed ? 'checked' : ''}>
      <div class="task-title">${task.title}</div>
      <div class="task-due">${task.dueDate ? task.getFormattedDueDate() : ''}</div>
    `;
    
    const checkbox = div.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', () => {
      this.toggleTaskComplete(task.id);
    });
    
    // Add click event to select task
    div.addEventListener('click', (e) => {
      // Don't trigger if clicking on the checkbox
      if (e.target !== checkbox) {
        const event = new CustomEvent('taskSelected', {
          detail: { taskId: task.id }
        });
        document.dispatchEvent(event);
      }
    });
    
    return div;
  }
}

// Initialize the task list when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.taskList = new TaskList();
});

export default TaskList;