// Placeholder for ThinkStack JS logic
document.querySelectorAll('.action-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    alert('Feature coming soon!');
  });
});

// Initialize data from localStorage
let notes = JSON.parse(localStorage.getItem('notes')) || [];
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let recentActivity = JSON.parse(localStorage.getItem('recentActivity')) || [];
let theme = localStorage.getItem('theme') || 'light';

// DOM Elements
const noteModal = document.getElementById('noteModal');
const taskModal = document.getElementById('taskModal');
const newNoteBtn = document.getElementById('newNoteBtn');
const newTaskBtn = document.getElementById('newTaskBtn');
const noteForm = document.getElementById('noteForm');
const taskForm = document.getElementById('taskForm');
const pinnedNoteContent = document.getElementById('pinnedNoteContent');
const upcomingTaskContent = document.getElementById('upcomingTaskContent');
const recentActivityContent = document.getElementById('recentActivityContent');
const totalNotesCount = document.getElementById('totalNotesCount');
const activeTasksCount = document.getElementById('activeTasksCount');
const completedTodayCount = document.getElementById('completedTodayCount');
const themeSelect = document.getElementById('themeSelect');

// Navbar functionality
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href').substring(1);
    
    // Update active state
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    
    // Show target section
    document.querySelectorAll('.section').forEach(section => {
      section.classList.remove('active');
    });
    document.getElementById(targetId).classList.add('active');
  });
});

// Theme functionality
themeSelect.value = theme;
document.body.classList.toggle('dark-theme', theme === 'dark');

themeSelect.addEventListener('change', (e) => {
  theme = e.target.value;
  localStorage.setItem('theme', theme);
  document.body.classList.toggle('dark-theme', theme === 'dark');
});

// Modal open/close functionality
function openModal(modal) {
  modal.style.display = 'block';
}

function closeModal(modal) {
  modal.style.display = 'none';
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
  if (e.target === noteModal) {
    closeModal(noteModal);
  }
  if (e.target === taskModal) {
    closeModal(taskModal);
  }
});

// Event Listeners
newNoteBtn.addEventListener('click', () => openModal(noteModal));
newTaskBtn.addEventListener('click', () => openModal(taskModal));

// Close buttons functionality
document.querySelectorAll('.close').forEach(closeBtn => {
  closeBtn.addEventListener('click', () => {
    closeModal(noteModal);
    closeModal(taskModal);
  });
});

// Cancel buttons functionality
document.querySelectorAll('.cancel-btn').forEach(cancelBtn => {
  cancelBtn.addEventListener('click', () => {
    const modal = cancelBtn.closest('.modal');
    closeModal(modal);
  });
});

// Note Form Submission
noteForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('noteTitle').value;
  const content = document.getElementById('noteContent').value;
  
  // Check for duplicate note
  const isDuplicate = notes.some(note => 
    note.title.toLowerCase() === title.toLowerCase() && 
    note.content.toLowerCase() === content.toLowerCase()
  );
  
  if (isDuplicate) {
    return; // Don't add duplicate note
  }
  
  const newNote = {
    id: Date.now(),
    title,
    content,
    createdAt: new Date().toISOString(),
    isPinned: false
  };
  
  notes.push(newNote);
  saveToLocalStorage();
  updateUI();
  closeModal(noteModal);
  noteForm.reset();
  
  // Add to recent activity
  addActivity('Created a new note: ' + title);
});

// Task Form Submission
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('taskTitle').value;
  const description = document.getElementById('taskDescription').value;
  const dueDate = document.getElementById('taskDueDate').value;
  
  // Check for duplicate task
  const isDuplicate = tasks.some(task => 
    task.title.toLowerCase() === title.toLowerCase() && 
    task.description.toLowerCase() === description.toLowerCase() &&
    task.dueDate === dueDate
  );
  
  if (isDuplicate) {
    return; // Don't add duplicate task
  }
  
  const newTask = {
    id: Date.now(),
    title,
    description,
    dueDate,
    createdAt: new Date().toISOString(),
    isCompleted: false
  };
  
  tasks.push(newTask);
  saveToLocalStorage();
  updateUI();
  closeModal(taskModal);
  taskForm.reset();
  
  // Add to recent activity
  addActivity('Created a new task: ' + title);
});

// Local Storage Functions
function saveToLocalStorage() {
  localStorage.setItem('notes', JSON.stringify(notes));
  localStorage.setItem('tasks', JSON.stringify(tasks));
  localStorage.setItem('recentActivity', JSON.stringify(recentActivity));
}

// Activity Tracking
function addActivity(description) {
  // Check for duplicate activity
  const isDuplicate = recentActivity.some(activity => 
    activity.description === description &&
    new Date(activity.timestamp).toDateString() === new Date().toDateString()
  );
  
  if (isDuplicate) {
    return; // Don't add duplicate activity
  }
  
  recentActivity.unshift({
    description,
    timestamp: new Date().toISOString()
  });
  
  // Keep only the last 5 activities
  if (recentActivity.length > 5) {
    recentActivity = recentActivity.slice(0, 5);
  }
  
  saveToLocalStorage();
  updateUI();
}

// UI Update Functions
function updateUI() {
  // Update stats
  totalNotesCount.textContent = notes.length;
  activeTasksCount.textContent = tasks.filter(task => !task.isCompleted).length;
  completedTodayCount.textContent = tasks.filter(task => {
    const today = new Date().toISOString().split('T')[0];
    return task.isCompleted && task.completedAt?.startsWith(today);
  }).length;
  
  // Update pinned note
  const pinnedNote = notes.find(note => note.isPinned) || notes[0];
  if (pinnedNote) {
    pinnedNoteContent.textContent = pinnedNote.title;
  } else {
    pinnedNoteContent.textContent = 'No pinned note yet.';
  }
  
  // Update upcoming task
  const upcomingTask = tasks
    .filter(task => !task.isCompleted)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];
  
  if (upcomingTask) {
    upcomingTaskContent.textContent = `${upcomingTask.title} (Due: ${new Date(upcomingTask.dueDate).toLocaleDateString()})`;
  } else {
    upcomingTaskContent.textContent = 'No upcoming tasks.';
  }
  
  // Update recent activity
  if (recentActivity.length > 0) {
    recentActivityContent.textContent = recentActivity[0].description;
  } else {
    recentActivityContent.textContent = 'No recent activity.';
  }
  
  // Update notes list
  const notesList = document.getElementById('notesList');
  notesList.innerHTML = notes.map(note => `
    <div class="note-item">
      <h3>${note.title}</h3>
      <p>${note.content}</p>
      <button class="edit-btn" onclick="editNote(${note.id})">Edit</button>
      <button class="delete-btn" onclick="deleteNote(${note.id})">Delete</button>
    </div>
  `).join('');
  
  // Update tasks list
  const tasksList = document.getElementById('tasksList');
  tasksList.innerHTML = tasks.map(task => `
    <div class="task-item">
      <h3>${task.title}</h3>
      <p>${task.description}</p>
      <p>Due: ${new Date(task.dueDate).toLocaleDateString()}</p>
      <button class="edit-btn" onclick="editTask(${task.id})">Edit</button>
      <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
    </div>
  `).join('');
}

// Edit and Delete Functions
function editNote(id) {
  const note = notes.find(n => n.id === id);
  if (note) {
    document.getElementById('noteTitle').value = note.title;
    document.getElementById('noteContent').value = note.content;
    openModal(noteModal);
  }
}

function deleteNote(id) {
  notes = notes.filter(n => n.id !== id);
  saveToLocalStorage();
  updateUI();
  addActivity('Deleted a note');
}

function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description;
    document.getElementById('taskDueDate').value = task.dueDate;
    openModal(taskModal);
  }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveToLocalStorage();
  updateUI();
  addActivity('Deleted a task');
}

// Initialize UI
updateUI();
