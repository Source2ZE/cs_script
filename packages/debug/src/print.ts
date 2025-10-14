import { Entity, Instance } from 'cs_script/point_script';

type PrintArgument =
  | string
  | object
  | any[]
  | null
  | undefined
  | boolean
  | number
  | bigint
  | symbol;

function lineMap(value: PrintArgument) {
  if (value === null) return '<null>';

  if (value === undefined) return '<undefined>';

  if (value instanceof Entity) {
    if (!value.IsValid()) return `<Invalid entity handle>`;

    const name = value.GetEntityName();
    return `<${value.GetClassName()}>${name ? ` (${name})` : ''}: ${JSON.stringify(value, null, 2)}`;
  }

  return typeof value === 'object' ? JSON.stringify(value, null, 2) : value;
}

export function print(...args: PrintArgument[]) {
  Instance.Msg(args.map(lineMap).join(' '));
}
