import { GameEventDefs, Instance } from 'cs_script/point_script'

let errors = []
function printError(e: Error) {
  Instance.Msg(
    `\n================== ERROR ==================\n${e.message}\n\n${e.stack}\n===========================================\n`
  )
  const offset = errors.findIndex((t) => t < Date.now() - 2000)

  if (errors.length > 100) return

  if (offset !== -1) {
    errors.splice(offset, 1, Date.now())
  } else {
    errors.push(Date.now())
  }
  Instance.DebugScreenText(
    `Error: ${e.message}`,
    10,
    250 + (offset === -1 ? errors.length : offset) * 15,
    2,
    { r: 255, g: 0, b: 0, a: 255 }
  )
}

function errorWrapper(fn: Function, ...args: any[]) {
  try {
    const result = fn(...args)
    if (result instanceof Promise) {
      result.catch((e: Error) => {
        printError(e)
      })
    }
  } catch (e: any) {
    Instance.Msg('Caught error: ' + e.message)
  }
}

export function initializeErrorWrappers() {
  const originalOnGameEvent = Instance.OnGameEvent
  Instance.OnGameEvent = function <E extends keyof GameEventDefs>(
    eventName: E,
    callback: (args: GameEventDefs[E]) => void
  ): void {
    originalOnGameEvent.call(Instance, eventName, (...args: any[]) => {
      errorWrapper(callback, ...args)
    })
  }

  const originalOnActivate = Instance.OnActivate
  Instance.OnActivate = function (callback: () => void): void {
    originalOnActivate.call(Instance, () => {
      errorWrapper(callback)
    })
  }

  const originalSetThink = Instance.SetThink
  Instance.SetThink = function (callback: () => void): void {
    originalSetThink.call(Instance, () => {
      errorWrapper(callback)
    })
  }

  const originalOnScriptInput = Instance.OnScriptInput
  Instance.OnScriptInput = function (
    name: string,
    callback: (context: any) => void
  ): void {
    originalOnScriptInput.call(Instance, name, (context: any) => {
      errorWrapper(callback, context)
    })
  }

  const originalOnReload = Instance.OnReload
  Instance.OnReload = function (callback: (memory: any) => void): void {
    originalOnReload.call(Instance, (memory: any) => {
      errorWrapper(callback, memory)
    })
  }

  const originalOnBeforeReload = Instance.OnBeforeReload
  Instance.OnBeforeReload = function (callback: () => any): void {
    originalOnBeforeReload.call(Instance, () => {
      errorWrapper(callback)
    })
  }

  const originalConnectOutput = Instance.ConnectOutput
  Instance.ConnectOutput = function (
    target: any,
    output: string,
    callback: (arg: any, context: any) => any
  ): number | undefined {
    return originalConnectOutput.call(
      Instance,
      target,
      output,
      (arg: any, context: any) => {
        errorWrapper(callback, arg, context)
      }
    )
  }
}
