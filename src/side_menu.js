class SideMenu {
  constructor() {
    this.projectListElement = document.getElementById('project-list');
    this.newProjectInput = document.getElementById('new-project-input');
    this.addProjectButton = document.getElementById('add-project-btn');
    
    // Load projects from localStorage
    this.projects = this.loadProjects();
    
    // Bind event listeners
    this.addProjectButton.addEventListener('click', () => this.addProject());
    this.newProjectInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.addProject();
      }
    });
    
    // Listen for task added/removed events to update task counts
    document.addEventListener('tasksUpdated', () => {
      this.render();
    });
    
    // Render the projects
    this.render();
  }
  
  loadProjects() {
    const projects = localStorage.getItem('projects');
    return projects ? JSON.parse(projects) : [];
  }
  
  saveProjects() {
    localStorage.setItem('projects', JSON.stringify(this.projects));
  }
  
  addProject() {
    const projectName = this.newProjectInput.value.trim();
    if (projectName) {
      // Check if project already exists
      if (!this.projects.includes(projectName)) {
        this.projects.push(projectName);
        this.saveProjects();
        this.render();
      }
      this.newProjectInput.value = '';
    }
  }
  
  removeProject(projectName) {
    this.projects = this.projects.filter(project => project !== projectName);
    this.saveProjects();
    this.render();
    
    // Emit event to notify that tasks might need updating
    const event = new CustomEvent('tasksUpdated');
    document.dispatchEvent(event);
  }
  
  getTaskCountForProject(projectName) {
    // Since we're using project names as IDs, we'll need to get tasks from localStorage
    const tasks = localStorage.getItem('tasks');
    if (tasks) {
      try {
        const parsedTasks = JSON.parse(tasks);
        return parsedTasks.filter(task => task.projectId === projectName).length;
      } catch (e) {
        console.error('Error parsing tasks from localStorage:', e);
        return 0;
      }
    }
    return 0;
  }
  
  selectProject(projectName) {
    // Remove active class from all project items
    document.querySelectorAll('.project-item').forEach(item => {
      item.classList.remove('active');
    });
    
    // Add active class to selected project
    event.target.closest('.project-item').classList.add('active');
    
    // Emit event to notify that a project was selected
    const projectSelectedEvent = new CustomEvent('projectSelected', {
      detail: { projectId: projectName }
    });
    document.dispatchEvent(projectSelectedEvent);
  }
  
  render() {
    // Clear the project list
    this.projectListElement.innerHTML = '';
    
    // Add each project to the list
    this.projects.forEach(project => {
      const projectElement = this.createProjectElement(project);
      this.projectListElement.appendChild(projectElement);
    });
  }
  
  createProjectElement(projectName) {
    const taskCount = this.getTaskCountForProject(projectName);
    
    const li = document.createElement('li');
    li.className = 'project-item';
    li.innerHTML = `
      <span class="project-name">${projectName}</span>
      <span class="task-count">${taskCount}</span>
      <button class="delete-project" style="display: none;">×</button>
    `;
    
    // Add click event to select project
    li.addEventListener('click', (e) => {
      // Don't trigger if clicking on the delete button
      if (!e.target.classList.contains('delete-project')) {
        this.selectProject(projectName);
      }
    });
    
    // Add hover events to show/hide delete button
    const deleteButton = li.querySelector('.delete-project');
    li.addEventListener('mouseenter', () => {
      deleteButton.style.display = 'block';
    });
    
    li.addEventListener('mouseleave', () => {
      deleteButton.style.display = 'none';
    });
    
    // Add click event to remove project
    deleteButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.removeProject(projectName);
    });
    
    return li;
  }
}

// Initialize the side menu when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SideMenu();
});

export default SideMenu;