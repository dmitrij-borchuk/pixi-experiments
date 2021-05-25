export type BaseTask = {
  name: string
  id: string
  assignee: string | null
  isSuspended?: boolean
}

export interface TaskMove extends BaseTask {
  type: 'walk'
  details: {
    x: number
    y: number
  }
}

export interface TaskBuild extends BaseTask {
  type: 'build'
  details: {
    x: number
    y: number
  }
}

export type Task = TaskMove | TaskBuild
