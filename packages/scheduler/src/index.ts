import { Instance } from 'cs_script/point_script'

interface TaskBase {
  callback: Function
  atSeconds: number
}

interface TaskRepeated extends TaskBase {
  repeated: false
}
interface TaskSingle extends TaskBase {
  everyNSeconds: number
  repeated: true
}

type Task = TaskRepeated | TaskSingle

const tasks: Task[] = []

export function setTimeout(callback: Function, ms: number): void {
  tasks.push({
    repeated: false,
    atSeconds: Instance.GetGameTime() + ms / 1000,
    callback,
  })
}

export function setInterval(callback: Function, ms: number): void {
  tasks.push({
    repeated: true,
    everyNSeconds: ms / 1000,
    atSeconds: Instance.GetGameTime() + ms / 1000,
    callback,
  })
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function runSchedulerTick() {
  for (let i = tasks.length - 1; i >= 0; i--) {
    const task = tasks[i]

    if (Instance.GetGameTime() < task.atSeconds) continue
    if (!task.repeated) tasks.splice(i, 1)
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
