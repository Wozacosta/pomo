'use client';

import { useState } from 'react';
import { useTimerStore, Task } from '@/store/timer-store';

export default function TasksList() {
  const { tasks, currentTaskId, setCurrentTask, addTask, updateTask, deleteTask } = useTimerStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAddTask = () => {
    if (newTaskName.trim()) {
      addTask(newTaskName.trim());
      setNewTaskName('');
      setIsAdding(false);
    }
  };

  const handleStartEdit = (task: Task) => {
    setEditingId(task.id);
    setEditName(task.name);
  };

  const handleSaveEdit = (taskId: string) => {
    if (editName.trim()) {
      updateTask(taskId, { name: editName.trim() });
      setEditingId(null);
      setEditName('');
    }
  };

  const handleDelete = (taskId: string) => {
    if (confirm('Delete this task?')) {
      deleteTask(taskId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Tasks</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
        >
          <svg className="w-5 h-5 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {isAdding && (
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
          <input
            type="text"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddTask();
              if (e.key === 'Escape') setIsAdding(false);
            }}
            placeholder="Task name..."
            className="w-full px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleAddTask}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Add
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-3 py-1 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 rounded text-sm hover:bg-zinc-300 dark:hover:bg-zinc-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg ${
              currentTaskId === task.id ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={currentTaskId === task.id}
                onChange={() => setCurrentTask(currentTaskId === task.id ? undefined : task.id, task.name)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              {editingId === task.id ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit(task.id);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  className="flex-1 px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              ) : (
                <span
                  className={`flex-1 text-sm ${
                    currentTaskId === task.id
                      ? 'font-medium text-zinc-900 dark:text-zinc-50'
                      : 'text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {task.name}
                </span>
              )}
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                {task.completedPomodoros} / {task.targetPomodoros}
              </div>
              <button
                onClick={() => editingId === task.id ? handleSaveEdit(task.id) : handleStartEdit(task)}
                className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
              >
                <svg className="w-4 h-4 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingId === task.id ? "M5 13l4 4L19 7" : "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"} />
                </svg>
              </button>
              <button
                onClick={() => handleDelete(task.id)}
                className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
              >
                <svg className="w-4 h-4 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
        {tasks.length === 0 && !isAdding && (
          <div className="p-3 text-sm text-zinc-600 dark:text-zinc-400 text-center">
            No tasks yet. Click + to add one.
          </div>
        )}
      </div>
    </div>
  );
}
