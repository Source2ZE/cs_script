import { Instance } from 'cs_script/point_script'

let idPool = 0

interface Task {
  id: number
  callback: Function
  atSeconds: number
  everyNSeconds?: number
}

let tasks: Task[] = []

export function setTimeout(callback: Function, ms: number): number {
  const id = idPool++

  tasks.unshift({
    id,
    atSeconds: Instance.GetGameTime() + ms / 1000,
    callback,
  })

  return id
}

export function setInterval(callback: Function, ms: number): number {
  const id = idPool++

  tasks.unshift({
    id,
    everyNSeconds: ms / 1000,
    atSeconds: Instance.GetGameTime() + ms / 1000,
    callback,
  })

  return id
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function clearTimeout(id: number): void {
  tasks = tasks.filter((task) => task.id !== id)
}

export const clearInterval = clearTimeout

export function clearTasks()
{
  tasks = [];
}

export function runSchedulerTick() {
  for (let i = tasks.length - 1; i >= 0; i--) {
    const task = tasks[i]

    if (Instance.GetGameTime() < task.atSeconds) continue
    if (task.everyNSeconds === undefined) tasks.splice(i, 1)
    else task.atSeconds = Instance.GetGameTime() + task.everyNSeconds

    try {
      task.callback()
    } catch (err) {
      Instance.Msg('An error occurred inside a scheduler task')
      if (err instanceof Error) {
        Instance.Msg(err.message)
        Instance.Msg(err.stack ?? '<no stack>')
      }
    }
  }
}
