import { useState, useEffect } from 'react';
import './App.css';
import './DialogBox.css';

function DialogBox({ taskId, isOpen, onClose, onSubmit, action, defaultName }) {

  const [inputValue, setInputValue] = useState('');
  useEffect(() => {
    if (defaultName) {
      setInputValue(defaultName);
    }
  }, [defaultName]);
  
  const handleValueChange = (e) => {
    setInputValue(e.target.value);
  };
  const handleSubmit = () => {
    onSubmit(taskId, inputValue);
    setInputValue('');
  };
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-box">
        <h3>Enter {action === 'Replace' ? 'New Name' : 'Task Name'}</h3>
        <input
          type="text"
          value={inputValue}
          onChange={handleValueChange}
          placeholder="Type here..."
        />
        <div className="dialog-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSubmit}>{action}</button>
        </div>
      </div>
    </div>
  );
}

function Tasks() {
  const [tasks, setTasks] = useState([]);
  useEffect(()=>{
    fetch('http://localhost:5000/tasks')
    .then((response)=>response.json())
    .then((data)=>setTasks(data.tasks));
  },[]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReplaceDialogOpen, setIsReplaceDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [UpdateTaskId, setUpdateTaskId] = useState(null);
  const [updateTaskname, setUpdateTaskName] = useState(null);

  const handleCreateDialogOpen = () => setIsDialogOpen(true);
  const handleCreateDialogClose = () => setIsDialogOpen(false);

  const handleReplaceDialogOpen = (taskId) => {
    setSelectedTaskId(taskId); // Set task ID for replacement
    setIsReplaceDialogOpen(true);
  };

  const handleReplaceDialogClose = () => {
    setIsReplaceDialogOpen(false);
    setSelectedTaskId(null);
  };

  const handleUpdateDialogOpen = (taskId, taskName) => {
    setUpdateTaskId(taskId);
    setUpdateTaskName(taskName);
    setIsUpdateDialogOpen(true);
  }

  const handleUpdateDialogClose = () => {
    setIsUpdateDialogOpen(false);
    setUpdateTaskId(null);
    setUpdateTaskName(null);
  }

  const handleUpdateSubmit = async (taskId, inputValue) => {
    const newTasks = tasks.map((task)=>
      task.id === taskId ? { ...task, name: inputValue} : task
    );
    try {
    await fetch(`http://localhost:5000/tasks/${taskId}`, {
      'method':'PATCH',
      'headers':{'Content-Type':'appslication/json'},
      'body':JSON.stringify({"name":inputValue})
    });
    setTasks(newTasks);
    setIsUpdateDialogOpen(false);
    setUpdateTaskId(null);
    setUpdateTaskName(null);
  }catch{
    console.log("Error sending requests");
  }
  }
  const handleCreateSubmit = (taskId, inputValue) => {
    const newTasks = [...tasks, { id: tasks.length + 1, name: inputValue }];
    const data = { id: tasks.length + 1, name: inputValue }
    setTasks(newTasks);
    setIsDialogOpen(false);
    fetch('http://localhost:5000/task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((data) => {})
        .catch((error) => {
          console.error('Error:', error);
          
        });
    }
  

  const handleReplaceSubmit = async (taskId, inputValue) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, name: inputValue } : task
    );
    try{
    await fetch(`http://localhost:5000/tasks/${taskId}`, {
      'method':'PUT',
      'headers':{'Content-Type':'application/json'},
      'body':JSON.stringify({id:taskId,name:inputValue})
    });
    setTasks(updatedTasks);
    setIsReplaceDialogOpen(false);
    setSelectedTaskId(null);}catch{
      console.log("Error sending requests");
    }
  };

  const deleteTask = async (id) => {
    const newTasks = tasks.filter((task) => task.id !== id);
    try{
      const response = await fetch(`http://localhost:5000/tasks/${id}`, {'method':'DELETE','headers':{'Content-Type':'application/json'}});
      setTasks(newTasks);
      console.log(response);
    }
    catch{
      console.log("Error sending request");
    }
  };

  return (
    <>
      <div className="tasks-container">
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              <span>{task.name}</span>
              <div>
                <button
                  style={{ background: 'white', color: 'red' }}
                  onClick={() => deleteTask(task.id)}
                >
                  Delete
                </button>
                <button onClick={() => handleReplaceDialogOpen(task.id)}>
                  Replace
                </button>
                <button onClick={() => handleUpdateDialogOpen(task.id, task.name)}>Update</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {/* Create Task Dialog */}
      <CreateTask
        isDialogOpen={isDialogOpen}
        handleDialogOpen={handleCreateDialogOpen}
        handleDialogClose={handleCreateDialogClose}
        handleDialogSubmit={handleCreateSubmit}
      />
      {/* Replace Task Dialog */}
      <DialogBox
        taskId={selectedTaskId}
        isOpen={isReplaceDialogOpen}
        onClose={handleReplaceDialogClose}
        onSubmit={handleReplaceSubmit}
        action="Replace"
      />

      {/* Update Task Dialog */ }
      <DialogBox
        taskId = {UpdateTaskId}
        isOpen={isUpdateDialogOpen}
        onClose={handleUpdateDialogClose}
        onSubmit={handleUpdateSubmit}
        action="Update"
        defaultName={updateTaskname}
      />
    </>
  )};


function CreateTask({ isDialogOpen, handleDialogOpen, handleDialogClose, handleDialogSubmit }) {
  return (
    <>
      <button className="create-btn" onClick={handleDialogOpen}>
        Create
      </button>
      <DialogBox
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
        action="Create"
      />
    </>
  );
}

function App() {
  return (
    <>
      <h1>Tasks List</h1>
      <Tasks />
    </>
  );
}

export default App;
