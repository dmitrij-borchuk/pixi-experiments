import { nanoid } from 'nanoid'
import { Task } from './task'

export interface TaskManagerState {
  tasks: Task[]
}
export class TaskManager {
  public taskList: Task[] = []

  constructor(state: TaskManagerState) {
    this.taskList = state.tasks
  }

  public getUnassignedTask() {
    return this.taskList.find((t) => t.assignee === null && t.isSuspended !== true)
  }

  public addTask(task: Omit<Task, 'id'>): Task {
    const newTask = {
      ...task,
      id: nanoid(),
    }
    this.taskList.push(newTask)

    return newTask
  }

  public removeTask(id: string) {
    const index = this.taskList.findIndex((t) => t.id === id)
    if (index >= 0) {
      this.taskList.splice(index, 1)
    }
  }

  public getState() {
    return { tasks: this.taskList }
  }
}
