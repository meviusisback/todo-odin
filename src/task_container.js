import Task from './task.js';

class TaskContainer {
  constructor() {
    this.taskContainerElement = document.querySelector('.task-container');
    this.currentTask = null;
    
    // Listen for task selection events
    document.addEventListener('taskSelected', (e) => {
      this.displayTask(e.detail.taskId);
    });
    
    // Listen for task updates
    document.addEventListener('tasksUpdated', () => {
      if (this.currentTask) {
        this.displayTask(this.currentTask.id);
      }
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
  
  findTaskById(taskId) {
    const tasks = this.loadTasks();
    return tasks.find(task => task.id === taskId) || null;
  }
  
  displayTask(taskId) {
    if (!this.taskContainerElement) return;
    
    const task = this.findTaskById(taskId);
    if (!task) {
      this.taskContainerElement.innerHTML = '<p>Select a task to view details</p>';
      return;
    }
    
    this.currentTask = task;
    
    this.taskContainerElement.innerHTML = `
      <h2 class="task-title">${task.title}</h2>
      <p class="task-due-date">${task.dueDate ? `Due: ${task.getFormattedDueDate()}` : 'No due date'}</p>
      <p class="task-description">${task.description || 'No description provided'}</p>
      <div class="task-actions">
        <button id="toggle-complete" class="${task.completed ? 'completed' : ''}">
          ${task.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
        </button>
        <button id="delete-task" class="delete">Delete Task</button>
      </div>
    `;
    
    // Add event listeners for actions
    document.getElementById('toggle-complete').addEventListener('click', () => {
      this.toggleTaskComplete(taskId);
    });
    
    document.getElementById('delete-task').addEventListener('click', () => {
      this.deleteTask(taskId);
    });
  }
  
  toggleTaskComplete(taskId) {
    // Emit event to toggle task completion
    const event = new CustomEvent('toggleTaskComplete', {
      detail: { taskId: taskId }
    });
    document.dispatchEvent(event);
  }
  
  deleteTask(taskId) {
    // Emit event to delete task
    const event = new CustomEvent('deleteTask', {
      detail: { taskId: taskId }
    });
    document.dispatchEvent(event);
    
    // Clear the task container
    this.taskContainerElement.innerHTML = '<p>Select a task to view details</p>';
    this.currentTask = null;
  }
}

// Initialize the task container when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.taskContainer = new TaskContainer();
});

export default TaskContainer;