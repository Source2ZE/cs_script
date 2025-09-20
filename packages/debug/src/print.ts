import { Instance } from 'cs_script/point_script'

type PrintArgument = string | object | any[]

function lineMap(value: PrintArgument) {
  return typeof value === 'object' ? JSON.stringify(value, null, 2) : value
}

export function print(...args: PrintArgument[]) {
  Instance.Msg(args.map(lineMap).join(' '))
}
