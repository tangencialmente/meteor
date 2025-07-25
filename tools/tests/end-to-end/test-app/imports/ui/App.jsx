import React, { useState, Fragment } from 'react';
import { useTracker, useSubscribe } from "meteor/react-meteor-data";
import { TasksCollection } from "/imports/api/TasksCollection";
import { Task } from "./Task";
import { TaskForm } from "./TaskForm";
import { LoginForm } from './LoginForm';
import { Meteor } from "meteor/meteor";

export const App = () => {
  const user = useTracker(() => Meteor.user());
  const logout = () => Meteor.logout();
  const [hideCompleted, setHideCompleted] = useState(false);
  const [filterText, setFilterText] = useState("");
  const hideCompletedFilter = { isChecked: { $ne: true } };
  const handleToggleChecked = ({ _id, isChecked }) =>
    Meteor.callAsync("tasks.toggleChecked", { _id, isChecked });
  const isLoading = useSubscribe("tasks");
  const tasks = useTracker(() => {
    const query = {
      ...(hideCompleted ? hideCompletedFilter : {}),
      ...(filterText
        ? { text: { $regex: filterText, $options: "i" } }
        : {}),
    };
    return TasksCollection.find(query, {
      sort: { createdAt: -1 },
    }).fetch();
  });
  const handleDelete = ({ _id }) =>
    Meteor.callAsync("tasks.delete", { _id });
  const pendingTasksCount = useTracker(() =>
    TasksCollection.find(hideCompletedFilter).count()
  );
  const pendingTasksTitle = `${pendingTasksCount ? ` (${pendingTasksCount})` : ''
    }`;
  const handleEditTask = (_id, newText) =>
    Meteor.callAsync("tasks.updateText", { _id, newText });

  const filteredTasks = tasks.filter(task =>
    task.text.toLowerCase().includes(filterText.toLowerCase())
  );

  if (isLoading()) {
    return <div>Loading...</div>;
  }
  return (
    <div className="app">
      <header>
        <div className="app-bar">
          <div className="app-header">
            <h1>Meteor with testRigor {pendingTasksTitle}</h1>
          </div>
        </div>
      </header>
      <div className="main">
        {user ? (
          <Fragment>
            <div className="user" onClick={logout}>
              {user.username} 🚪
            </div>
            <TaskForm />
            { }
            <div className="filter-bar">
              <input
                type="text"
                placeholder="Filter tasks by name"
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
              />
            </div>

            <div className="filter">
              <button onClick={() => setHideCompleted(!hideCompleted)}>
                {hideCompleted ? 'Show All' : 'Hide Completed'}
              </button>
            </div>

            <ul className="tasks">
              {tasks.map(task => (
                <Task
                  key={task._id}
                  task={task}
                  onCheckboxClick={handleToggleChecked}
                  onDeleteClick={handleDelete}
                  onEdit={handleEditTask}
                />
              ))}
            </ul>
          </Fragment>
        ) : (
          <LoginForm />
        )}
      </div>
    </div>
  );
};