class Task {
  constructor(title, description, dueDate, projectId, completed = false) {
    this.id = this.generateId();
    this.title = title;
    this.description = description;
    this.dueDate = dueDate; // Should be a Date object or ISO string
    this.projectId = projectId;
    this.completed = completed;
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  toggleComplete() {
    this.completed = !this.completed;
  }

  isOverdue() {
    if (this.completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(this.dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  }

  // Format the due date for display
  getFormattedDueDate() {
    if (!this.dueDate) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(this.dueDate).toLocaleDateString(undefined, options);
  }

  // Get days until due (negative if overdue)
  getDaysUntilDue() {
    if (!this.dueDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(this.dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      dueDate: this.dueDate,
      projectId: this.projectId,
      completed: this.completed
    };
  }

  static fromJSON(json) {
    const task = new Task(
      json.title,
      json.description,
      json.dueDate,
      json.projectId,
      json.completed
    );
    task.id = json.id;
    return task;
  }
}

export default Task;