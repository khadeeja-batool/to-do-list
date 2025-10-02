let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

const taskTitle=document.getElementById('taskTitle');
const taskDesc=document.getElementById('taskDesc');
const taskDeadline=document.getElementById('taskDeadline');
const addTaskBtn=document.getElementById('addTaskBtn');
const taskGrid=document.getElementById('taskGrid');

addTaskBtn.addEventListener('click', addTask);

// 🔹 Save tasks in localStorage
function saveTasks(){
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// 🔹 Check duplicate title
function isDuplicateTitle(title, parentIndex=null){
  if(parentIndex === null){
    return tasks.some(t => t.title.toLowerCase() === title.toLowerCase());
  } else {
    return tasks[parentIndex].subtasks.some(st => st.title.toLowerCase() === title.toLowerCase());
  }
}

// 🔹 Add Task
function addTask(){
  if(!taskTitle.value.trim()) { alert('Please enter a task title.'); return; }

  if(isDuplicateTitle(taskTitle.value.trim())){
    alert("Task with this title already exists!");
    return;
  }

  const createdDate = new Date();

  if(taskDeadline.value){
    const deadlineDate = new Date(taskDeadline.value);

    // Past check
    if(deadlineDate.getTime() < Date.now()){
      alert("Deadline cannot be in the past!");
      return;
    }

    // At least 1 hr from creation
    if(deadlineDate.getTime() < (createdDate.getTime() + 60*60*1000)){
      alert("Deadline must be at least 1 hour later than creation time.");
      return;
    }
  }

  tasks.push({
    title:taskTitle.value.trim(),
    desc:taskDesc.value.trim() || "",   // empty spaces ignored
    created:createdDate.toISOString(),   // ISO format
    deadline:taskDeadline.value || '',
    completed:false,
    showDetails:false,
    subtasks:[],
    editing:false
  });
  saveTasks();
  taskTitle.value='';taskDesc.value='';taskDeadline.value='';
  renderTasks();
}

// 🔹 Render Tasks
function renderTasks(){
  taskGrid.innerHTML='';
  tasks.forEach((task,i)=>{
    taskGrid.append(createTaskCard(task,i));
  });
}

// Create Task Card
function createTaskCard(task,i,parentIndex=null){
  const card=document.createElement('div');
  card.className='task-card';

  const titleRow=document.createElement('div');
  titleRow.className='task-title';

  const left=document.createElement('div');
  left.style.display='flex';
  left.style.alignItems='center';

  const cb=document.createElement('input');
  cb.type='checkbox'; cb.checked=task.completed;
  cb.onchange=()=> { parentIndex===null? toggleTask(i):toggleSubtask(parentIndex,i); };

  const title=document.createElement('span');
  title.textContent=task.title;
  title.style.marginLeft='8px';
  if(task.completed) title.classList.add('completed');

  left.append(cb,title);

  const eye=document.createElement('button');
  eye.className='eye-btn';
  eye.innerHTML=task.showDetails? '👁️' : '👁️‍🗨️';
  eye.onclick=()=> parentIndex===null? toggleDetails(i):toggleSubDetails(parentIndex,i);

  titleRow.append(left,eye);

  const details=document.createElement('div');
  details.className='task-details';
  if(task.showDetails) details.style.display='block';

  // Editing Mode
  if(task.editing){
    if(parentIndex===null) {
      details.append(createEditFormForTask(i));
      card.append(titleRow,details);
      return card;
    } else {
      details.append(createEditFormForSubtask(parentIndex,i));
      card.append(titleRow,details);
      return card;
    }
  }

  // Description
  if(task.desc){
    const desc=document.createElement('div');
    desc.className='task-desc';
    desc.innerHTML=escapeHtml(task.desc).replace(/\n/g,'<br>');
    details.append(desc);
  }

  // 🔹 Info Row
  const info=document.createElement('div');
  info.className='task-info';
  let infoText = `Created: ${formatLocal(task.created) || ''}${task.deadline? ' | Deadline: '+formatLocal(task.deadline):''}`;
  
  // Expired check
  if(task.deadline && new Date(task.deadline).getTime() < Date.now() && !task.completed){
    infoText += " | ❌ Expired";
    card.classList.add("expired-task"); // optional CSS highlight
  }
  
  info.textContent = infoText;
  details.append(info);

  // Actions
  const actions=document.createElement('div');
  actions.className='task-actions';
  const edit=document.createElement('button');
  edit.textContent='Edit';
  edit.onclick=()=> parentIndex===null? startEditTask(i): startEditSubtask(parentIndex,i);
  const del=document.createElement('button');
  del.textContent='Delete';
  del.onclick=()=> parentIndex===null? deleteTask(i):deleteSubtask(parentIndex,i);
  actions.append(edit,del);
  details.append(actions);

  // Subtasks Section
  if(parentIndex===null){
    const subInputs=document.createElement('div');
    subInputs.className='subtask-inputs';

    const stTitle=document.createElement('input');
    stTitle.placeholder='Subtask Title';

    const stDesc=document.createElement('textarea');
    stDesc.placeholder='Subtask Description (type each point on a new line)';
    stDesc.rows = 3;

    const stDeadlineLabel=document.createElement('label');
    stDeadlineLabel.textContent='Deadline (local date & time)';

    const stDeadline=document.createElement('input');
    stDeadline.type='datetime-local';

    const stBtn=document.createElement('button');
    stBtn.textContent='Add Subtask';
    stBtn.onclick=()=>{
      addSubtask(i,stTitle.value,stDesc.value,stDeadline.value);
      stTitle.value=''; stDesc.value=''; stDeadline.value='';
    };

    subInputs.append(stTitle,stDesc,stDeadlineLabel,stDeadline,stBtn);

    const subList=document.createElement('div');
    subList.className='subtask-list';
    task.subtasks.forEach((st,j)=> subList.append(createTaskCard(st,j,i)));

    details.append(subInputs,subList);
  }

  card.append(titleRow,details);
  return card;
}

// Edit Task
function startEditTask(i){ tasks[i].editing = true; renderTasks(); }
function createEditFormForTask(i){
  const form=document.createElement('div');
  form.className='edit-form';

  const t= document.createElement('input');
  t.type='text'; t.value = tasks[i].title;

  const d=document.createElement('textarea');
  d.rows=3; d.value = tasks[i].desc;

  const dlLabel=document.createElement('label'); dlLabel.textContent='Deadline (local date & time)';
  const dl=document.createElement('input'); dl.type='datetime-local'; dl.value = tasks[i].deadline;

  const actionWrap=document.createElement('div'); actionWrap.className='edit-actions';
  const save=document.createElement('button'); save.className='small-btn save-btn'; save.textContent='Save';
  const cancel=document.createElement('button'); cancel.className='small-btn cancel-btn'; cancel.textContent='Cancel';

  save.onclick = ()=>{
    if(!t.value.trim()){ alert('Title cannot be empty.'); return; }
    if(isDuplicateTitle(t.value.trim()) && t.value.trim().toLowerCase() !== tasks[i].title.toLowerCase()){
      alert("Task with this title already exists!");
      return;
    }
    if(dl.value){
      const deadlineDate = new Date(dl.value);
      const createdDate = new Date(tasks[i].created);

      if(deadlineDate.getTime() < Date.now()){
        alert("Deadline cannot be in the past!");
        return;
      }
      if(deadlineDate.getTime() < (createdDate.getTime() + 60*60*1000)){
        alert('Deadline must be at least 1 hour later than creation time.');
        return;
      }
    }
    tasks[i].title = t.value.trim();
    tasks[i].desc = d.value.trim() || "";
    tasks[i].deadline = dl.value || '';
    tasks[i].editing = false;
    saveTasks();
    renderTasks();
  };
  cancel.onclick = ()=>{ tasks[i].editing = false; renderTasks(); };

  actionWrap.append(save,cancel);
  form.append(t,d,dlLabel,dl,actionWrap);
  return form;
}

// Toggle & Delete Task
function toggleDetails(i){tasks[i].showDetails=!tasks[i].showDetails;saveTasks();renderTasks();}
function toggleTask(i){tasks[i].completed=!tasks[i].completed;saveTasks();renderTasks();}
function deleteTask(i){ if(confirm('Delete this task?')){tasks.splice(i,1);saveTasks();renderTasks();} }

// Add Subtask
function addSubtask(i,title,desc,deadline){
  if(!title || !title.trim()){ alert('Subtask title required'); return; }

  if(isDuplicateTitle(title.trim(), i)){
    alert("Subtask with this title already exists!");
    return;
  }

  const createdDate = new Date();
  if(deadline){
    const deadlineDate = new Date(deadline);

    if(deadlineDate.getTime() < Date.now()){
      alert("Deadline cannot be in the past!");
      return;
    }
    if(deadlineDate.getTime() < (createdDate.getTime() + 60*60*1000)){
      alert("Subtask deadline must be at least 1 hour later than creation time.");
      return;
    }
  }

  tasks[i].subtasks.push({
    title:title.trim(),
    desc:desc.trim() || "",
    deadline:deadline || '',
    created:createdDate.toISOString(),
    completed:false,
    showDetails:false,
    editing:false
  });
  saveTasks();
  renderTasks();
}

// Edit Subtask
function startEditSubtask(parentIdx, idx){
  tasks[parentIdx].subtasks[idx].editing = true; renderTasks();
}
function createEditFormForSubtask(parentIdx, idx){
  const st = tasks[parentIdx].subtasks[idx];
  const form=document.createElement('div');
  form.className='edit-form';

  const t= document.createElement('input'); t.type='text'; t.value = st.title;
  const d=document.createElement('textarea'); d.rows=3; d.value = st.desc;
  const dlLabel=document.createElement('label'); dlLabel.textContent='Deadline (local date & time)';
  const dl=document.createElement('input'); dl.type='datetime-local'; dl.value = st.deadline;

  const actionWrap=document.createElement('div'); actionWrap.className='edit-actions';
  const save=document.createElement('button'); save.className='small-btn save-btn'; save.textContent='Save';
  const cancel=document.createElement('button'); cancel.className='small-btn cancel-btn'; cancel.textContent='Cancel';

  save.onclick = ()=>{
    if(!t.value.trim()){ alert('Title cannot be empty.'); return; }
    if(isDuplicateTitle(t.value.trim(), parentIdx) && t.value.trim().toLowerCase() !== st.title.toLowerCase()){
      alert("Subtask with this title already exists!");
      return;
    }
    if(dl.value){
      const deadlineDate = new Date(dl.value);
      const createdDate = new Date(st.created);

      if(deadlineDate.getTime() < Date.now()){
        alert("Deadline cannot be in the past!");
        return;
      }
      if(deadlineDate.getTime() < (createdDate.getTime() + 60*60*1000)){
        alert('Subtask deadline must be at least 1 hour later than creation time.');
        return;
      }
    }
    st.title = t.value.trim(); st.desc = d.value.trim() || ""; st.deadline = dl.value || '';
    st.editing = false;
    saveTasks();
    renderTasks();
  };
  cancel.onclick = ()=>{ st.editing = false; renderTasks(); };

  actionWrap.append(save,cancel);
  form.append(t,d,dlLabel,dl,actionWrap);
  return form;
}

// Toggle & Delete Subtask
function toggleSubtask(i,j){tasks[i].subtasks[j].completed=!tasks[i].subtasks[j].completed;saveTasks();renderTasks();}
function deleteSubtask(i,j){ if(confirm('Delete this subtask?')){tasks[i].subtasks.splice(j,1);saveTasks();renderTasks();} }
function toggleSubDetails(i,j){tasks[i].subtasks[j].showDetails=!tasks[i].subtasks[j].showDetails;saveTasks();renderTasks();}

// Helpers
function formatLocal(dtString){ if(!dtString) return ''; const d=new Date(dtString); return d.toLocaleString(); }
function escapeHtml(unsafe) { return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/\'/g, "&#039;"); }

// Initial render
renderTasks();

