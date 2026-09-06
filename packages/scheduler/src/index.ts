/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { Instance } from 'cs_script/point_script';

let idPool = 0;

interface Task {
  id: number;
  callback: Function;
  atSeconds: number;
  everyNSeconds?: number;
}

const tasks: Task[] = [];

export function setTimeout(callback: Function, ms: number): number {
  const id = idPool++;

  tasks.push({
    id,
    atSeconds: Instance.GetGameTime() + ms / 1000,
    callback,
  });

  return id;
}

export function setInterval(callback: Function, ms: number): number {
  const id = idPool++;

  tasks.push({
    id,
    everyNSeconds: ms / 1000,
    atSeconds: Instance.GetGameTime() + ms / 1000,
    callback,
  });

  return id;
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function clearTimeout(id: number): void {
  const index = tasks.findIndex((task) => task.id === id);
  if (index !== -1) tasks.splice(index, 1);
}

export const clearInterval = clearTimeout;

export function clearTasks() {
  tasks.length = 0;
}

export function runSchedulerTick() {
  const now = Instance.GetGameTime();

  const due: Task[] = [];
  for (const task of tasks) {
    if (now >= task.atSeconds) due.push(task);
  }

  due.sort((a, b) => a.atSeconds - b.atSeconds);

  for (const task of due) {
    const index = tasks.indexOf(task);
    if (index === -1) continue;

    if (task.everyNSeconds === undefined) tasks.splice(index, 1);
    else task.atSeconds = now + task.everyNSeconds;

    try {
      task.callback();
    } catch (err) {
      Instance.Msg('An error occurred inside a scheduler task');
      if (err instanceof Error) {
        Instance.Msg(err.message);
        Instance.Msg(err.stack ?? '<no stack>');
      }
    }
  }
}
