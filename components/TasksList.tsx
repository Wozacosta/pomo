'use client';

import { useId, useState } from 'react';
import { useTimerStore, Task } from '@/store/timer-store';

const DEFAULT_GOAL = 20;
const MIN_GOAL = 1;
const MAX_GOAL = 999;

const clampGoal = (value: number) =>
  Math.min(MAX_GOAL, Math.max(MIN_GOAL, Math.round(value) || MIN_GOAL));

interface GoalInputProps {
  value: number;
  onChange: (value: number) => void;
  onEnter?: () => void;
  onEscape?: () => void;
}

function GoalInput({ value, onChange, onEnter, onEscape }: GoalInputProps) {
  const inputId = useId();
  // Raw text so the field can be cleared while typing; clamped on blur
  const [draft, setDraft] = useState(String(value));

  const step = (delta: number) => {
    const next = clampGoal(value + delta);
    onChange(next);
    setDraft(String(next));
  };

  const stepButton =
    'w-8 h-8 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50 disabled:opacity-40 disabled:pointer-events-none transition-colors';

  return (
    <div className="flex items-center justify-between gap-3">
      <label
        htmlFor={inputId}
        className="text-xs font-medium text-zinc-600 dark:text-zinc-400"
      >
        Goal (pomodoros)
      </label>
      <div className="flex items-center bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
        <button
          type="button"
          aria-label="Decrease goal"
          onClick={() => step(-1)}
          disabled={value <= MIN_GOAL}
          className={stepButton}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
          </svg>
        </button>
        <input
          id={inputId}
          type="number"
          inputMode="numeric"
          min={MIN_GOAL}
          max={MAX_GOAL}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (e.target.value !== '') onChange(clampGoal(Number(e.target.value)));
          }}
          onBlur={() => setDraft(String(value))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onEnter?.();
            if (e.key === 'Escape') onEscape?.();
          }}
          className="w-12 h-8 text-center text-sm font-semibold tabular-nums bg-transparent text-zinc-900 dark:text-zinc-50 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          aria-label="Increase goal"
          onClick={() => step(1)}
          disabled={value >= MAX_GOAL}
          className={stepButton}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
}

const textInputClass =
  'w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all';
const primaryButtonClass =
  'px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm active:scale-95';
const secondaryButtonClass =
  'px-4 py-1.5 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-95';

export default function TasksList() {
  const { tasks, currentTaskId, setCurrentTask, addTask, updateTask, deleteTask } = useTimerStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskGoal, setNewTaskGoal] = useState(DEFAULT_GOAL);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editGoal, setEditGoal] = useState(DEFAULT_GOAL);

  const closeAddForm = () => {
    setIsAdding(false);
    setNewTaskName('');
    setNewTaskGoal(DEFAULT_GOAL);
  };

  const handleAddTask = () => {
    if (newTaskName.trim()) {
      addTask(newTaskName.trim(), newTaskGoal);
      closeAddForm();
    }
  };

  const handleStartEdit = (task: Task) => {
    setEditingId(task.id);
    setEditName(task.name);
    setEditGoal(task.targetPomodoros);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleSaveEdit = (taskId: string) => {
    if (editName.trim()) {
      updateTask(taskId, { name: editName.trim(), targetPomodoros: editGoal });
      // Keep the timer's current task label in sync with a rename
      if (currentTaskId === taskId) setCurrentTask(taskId, editName.trim());
      handleCancelEdit();
    }
  };

  const handleDelete = (taskId: string) => {
    if (confirm('Delete this task?')) {
      deleteTask(taskId);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Tasks
          {tasks.length > 0 && (
            <span className="ml-1.5 tabular-nums text-zinc-400 dark:text-zinc-500">
              {tasks.length}
            </span>
          )}
        </h3>
        <button
          onClick={() => (isAdding ? closeAddForm() : setIsAdding(true))}
          aria-label={isAdding ? 'Close new task form' : 'Add task'}
          aria-expanded={isAdding}
          className="-my-1 p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors group"
        >
          <svg
            className={`w-5 h-5 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-transform ${isAdding ? 'rotate-45' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {isAdding && (
        <div className="p-3 space-y-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
          <input
            type="text"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddTask();
              if (e.key === 'Escape') closeAddForm();
            }}
            placeholder="Task name..."
            aria-label="Task name"
            className={textInputClass}
            autoFocus
          />
          <GoalInput
            value={newTaskGoal}
            onChange={setNewTaskGoal}
            onEnter={handleAddTask}
            onEscape={closeAddForm}
          />
          <div className="flex justify-end gap-2">
            <button onClick={closeAddForm} className={secondaryButtonClass}>
              Cancel
            </button>
            <button
              onClick={handleAddTask}
              disabled={!newTaskName.trim()}
              className={primaryButtonClass}
            >
              Add
            </button>
          </div>
        </div>
      )}

      <ul className="space-y-2">
        {tasks.map((task) => {
          const isCurrent = currentTaskId === task.id;
          const isEditing = editingId === task.id;
          const isDone = task.completedPomodoros >= task.targetPomodoros;
          const progress = Math.min(
            100,
            (task.completedPomodoros / Math.max(task.targetPomodoros, 1)) * 100,
          );

          if (isEditing) {
            return (
              <li
                key={task.id}
                data-testid="task-item"
                className="p-3 space-y-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-blue-300 dark:border-blue-700"
              >
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit(task.id);
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                  aria-label="Task name"
                  className={textInputClass}
                  autoFocus
                />
                <GoalInput
                  value={editGoal}
                  onChange={setEditGoal}
                  onEnter={() => handleSaveEdit(task.id)}
                  onEscape={handleCancelEdit}
                />
                <div className="flex justify-end gap-2">
                  <button onClick={handleCancelEdit} className={secondaryButtonClass}>
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveEdit(task.id)}
                    disabled={!editName.trim()}
                    className={primaryButtonClass}
                  >
                    Save
                  </button>
                </div>
              </li>
            );
          }

          return (
            <li
              key={task.id}
              data-testid="task-item"
              data-current={isCurrent}
              className={`group p-3 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 ring-2 ring-blue-500 shadow-sm'
                  : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isCurrent}
                  onChange={() => setCurrentTask(isCurrent ? undefined : task.id, task.name)}
                  aria-label={isCurrent ? `Stop focusing on ${task.name}` : `Focus on ${task.name}`}
                  className="w-4 h-4 shrink-0 accent-blue-600 rounded cursor-pointer"
                />
                <span
                  className={`flex-1 min-w-0 truncate text-sm ${
                    isCurrent
                      ? 'font-semibold text-zinc-900 dark:text-zinc-50'
                      : 'font-medium text-zinc-700 dark:text-zinc-300'
                  } ${isDone ? 'line-through decoration-zinc-400 dark:decoration-zinc-500' : ''}`}
                  title={task.name}
                >
                  {task.name}
                </span>
                <div className="flex items-center gap-0.5 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleStartEdit(task)}
                    aria-label={`Edit ${task.name}`}
                    title="Edit name & goal"
                    className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    aria-label={`Delete ${task.name}`}
                    title="Delete"
                    className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="mt-2.5 flex items-center gap-3 pl-7">
                <div
                  role="progressbar"
                  aria-label={`${task.name} progress`}
                  aria-valuemin={0}
                  aria-valuemax={task.targetPomodoros}
                  aria-valuenow={task.completedPomodoros}
                  className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden"
                >
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isDone ? 'bg-green-500' : 'bg-blue-600 dark:bg-blue-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <button
                  onClick={() => handleStartEdit(task)}
                  aria-label={`Edit goal for ${task.name}`}
                  title="Edit goal"
                  className={`shrink-0 text-xs font-medium tabular-nums px-1.5 py-0.5 rounded-md transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700 ${
                    isDone
                      ? 'text-green-700 dark:text-green-400'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {task.completedPomodoros} / {task.targetPomodoros}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {tasks.length === 0 && !isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full p-4 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl text-sm text-zinc-600 dark:text-zinc-400 hover:border-blue-600 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all"
        >
          No tasks yet. Click + to add one.
        </button>
      )}
    </div>
  );
}
