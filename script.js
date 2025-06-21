document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selectors ---
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskModal = document.getElementById('task-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    const searchInput = document.getElementById('search-input');
    const filterCategory = document.getElementById('filter-category');
    const sortTasks = document.getElementById('sort-tasks');
    const themeToggle = document.getElementById('theme-toggle');

    // --- State Management ---
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // --- Theme Management ---
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.checked = true;
    }

    themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    });

    // --- Modal Handling ---
    const openModal = () => taskModal.style.display = 'flex';
    const closeModal = () => {
        taskModal.style.display = 'none';
        taskForm.reset();
        document.getElementById('task-id').value = '';
        document.getElementById('modal-title').textContent = 'Add New Task';
        document.getElementById('form-submit-btn').textContent = 'Save Task';
    };

    addTaskBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === taskModal) {
            closeModal();
        }
    });

    // --- Task Rendering ---
    const renderTasks = () => {
        taskList.innerHTML = '';
        
        let filteredTasks = [...tasks];

        // 1. Filter by search term
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            filteredTasks = filteredTasks.filter(task => 
                task.title.toLowerCase().includes(searchTerm) || 
                task.description.toLowerCase().includes(searchTerm)
            );
        }

        // 2. Filter by category
        const category = filterCategory.value;
        if (category !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.category === category);
        }

        // 3. Sort tasks
        const sortBy = sortTasks.value;
        if (sortBy === 'due-date') {
            filteredTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        } else if (sortBy === 'status') {
            filteredTasks.sort((a, b) => a.completed - b.completed);
        }

        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<p style="text-align:center; width:100%; color: #888;">No tasks found. Try adding one!</p>';
            return;
        }

        filteredTasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskElement.dataset.id = task.id;

            taskElement.innerHTML = `
                <div class="task-details">
                    <h3 class="task-title">
                        <input type="checkbox" class="complete-checkbox" ${task.completed ? 'checked' : ''}>
                        <span>${task.title}</span>
                    </h3>
                    <p class="task-description">${task.description || 'No description.'}</p>
                </div>
                <div class="task-meta">
                    <span class="category-tag" data-category="${task.category}">${task.category}</span>
                    <span class="due-date">${task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : 'No due date'}</span>
                </div>
                <div class="task-actions">
                    <button class="edit-btn"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn"><i class="fas fa-trash"></i></button>
                </div>
            `;
            taskList.appendChild(taskElement);
        });
    };

    // --- Task Operations ---
    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    };

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const id = document.getElementById('task-id').value;
        const title = document.getElementById('task-title').value.trim();
        const description = document.getElementById('task-description').value.trim();
        const dueDate = document.getElementById('task-due-date').value;
        const category = document.getElementById('task-category').value;

        if (id) {
            // Editing existing task
            const taskIndex = tasks.findIndex(task => task.id == id);
            tasks[taskIndex] = { ...tasks[taskIndex], title, description, dueDate, category };
        } else {
            // Adding new task
            const newTask = {
                id: Date.now(),
                title,
                description,
                dueDate,
                category,
                completed: false
            };
            tasks.push(newTask);
        }

        saveTasks();
        closeModal();
    });

    // --- Event Delegation for Task Actions (Edit, Delete, Complete) ---
    taskList.addEventListener('click', (e) => {
        const target = e.target;
        const taskItem = target.closest('.task-item');
        if (!taskItem) return;
        const taskId = taskItem.dataset.id;

        // Delete Task
        if (target.closest('.delete-btn')) {
            tasks = tasks.filter(task => task.id != taskId);
            saveTasks();
        }

        // Edit Task
        if (target.closest('.edit-btn')) {
            const task = tasks.find(task => task.id == taskId);
            document.getElementById('task-id').value = task.id;
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-description').value = task.description;
            document.getElementById('task-due-date').value = task.dueDate;
            document.getElementById('task-category').value = task.category;
            
            document.getElementById('modal-title').textContent = 'Edit Task';
            document.getElementById('form-submit-btn').textContent = 'Update Task';
            openModal();
        }

        // Complete Task
        if (target.classList.contains('complete-checkbox')) {
            const task = tasks.find(task => task.id == taskId);
            task.completed = target.checked;
            saveTasks();
        }
    });

    // --- Filter and Sort Event Listeners ---
    searchInput.addEventListener('input', renderTasks);
    filterCategory.addEventListener('change', renderTasks);
    sortTasks.addEventListener('change', renderTasks);

    // --- Initial Render ---
    renderTasks();
});