#To-Do List Web App
A responsive and feature-rich To-Do List web application with tasks, subtasks, deadlines, and a modern UI.
## Features
Create, edit, and delete tasks easily.

Add subtasks under each task for better organization.

Mark tasks or subtasks as completed, with a strike-through effect for clarity.

Show creation date and optional deadline for every task.

Responsive grid layout with up to 3 tasks per row for a clean and organized view.

Prevent duplicate titles for tasks and subtasks (case-insensitive).

Enforce mandatory titles — blank or space-only inputs are not allowed.

Allow optional descriptions, with extra spaces automatically trimmed.

Prevent deadlines from being set in the past.

Require deadlines to be at least 1 hour later than the creation time.

Automatically mark overdue tasks with a ❌ expired badge for visibility.

Ensure completed tasks are never marked as expired, even after the deadline passes.

Save all tasks and subtasks in localStorage for persistence across sessions, with instant updates on changes.
## Technologies Used
- HTML
- CSS
- JavaScript 

##  Project Structure
to-do-list/
├── index.html
├── style.css
└── README.md

##  Clone this repository:
git clone https://github.com/khadeeja-batool/to-do-list.git
