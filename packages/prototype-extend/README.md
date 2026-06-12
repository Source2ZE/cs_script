# @s2ze/prototype-extend

Prototype extensions for the `cs_script` API. Importing this package patches the
built-in `Entity` prototype with a `Transform` accessor, giving every entity a
Unity-style transform for reading and writing position, rotation, scale and
velocity, plus the usual point/direction space conversions.

## Install

```sh
npm install @s2ze/prototype-extend
```

This package has a peer dependency on [`@s2ze/math`](https://www.npmjs.com/package/@s2ze/math),
so make sure it's installed too:

```sh
npm install @s2ze/math
```

## Usage

Import the package once, at the top of your main file. It has no exports, the
import is there for its side effect of extending `Entity.prototype`.

```ts
import '@s2ze/prototype-extend';
import { Instance } from 'cs_script/point_script';
import { Vec3 } from '@s2ze/math';

const ent = Instance.FindEntityByName('my_prop');
if (!ent) return;

// read
Instance.Msg(ent.Transform.origin.toString());

// write
ent.Transform.origin = new Vec3(0, 0, 128);
ent.Transform.lookAt(new Vec3(512, 0, 0));
```

Every `Entity` now has a `Transform`. It's created lazily on first access and
cached, so `ent.Transform === ent.Transform`.

## API

### Properties

All vector/angle properties are readable and writable. Writing teleports the
entity. Reads return fresh copies, so mutating the returned value won't affect
the entity until you assign it back.

| Property               | Type        | Notes                                           |
| ---------------------- | ----------- | ----------------------------------------------- |
| `origin`               | `Vec3`      | World position.                                 |
| `angles`               | `Euler`     | Eye angles for players, abs angles otherwise.   |
| `matrix`               | `Matrix3x4` | Combined position + rotation.                   |
| `scale`                | `number`    | Model scale. No-op on entities without a model. |
| `velocity`             | `Vec3`      | World-space velocity.                           |
| `localVelocity`        | `Vec3`      | Velocity relative to the parent.                |
| `angularVelocity`      | `Vec3`      | World-space angular velocity.                   |
| `localAngularVelocity` | `Vec3`      | Angular velocity relative to the parent.        |
| `eyePosition`          | `Vec3`      | Read-only.                                      |
| `eyeAngles`            | `Euler`     | Read-only.                                      |
| `forward`              | `Vec3`      | Read/write. Vector pointing forward.            |
| `backward`             | `Vec3`      | Read/write. Vector pointing backward.           |
| `left`                 | `Vec3`      | Read/write. Vector pointing left.               |
| `right`                | `Vec3`      | Read/write. Vector pointing right.              |
| `up`                   | `Vec3`      | Read/write. Vector pointing up.                 |
| `down`                 | `Vec3`      | Read/write. Vector pointing down.               |

### Methods

```ts
localToWorldPoint(localPoint: Vec3): Vec3
worldToLocalPoint(worldPoint: Vec3): Vec3
localToWorldDirection(localDir: Vec3): Vec3
worldToLocalDirection(worldDir: Vec3): Vec3

lookAt(worldPoint: Vec3): void      // point forward at a world position
translateLocal(delta: Vec3): void   // move along local axes
translateWorld(delta: Vec3): void   // move along world axes

distanceTo(other: Entity): number
directionTo(other: Entity): Vec3
```

## License

MIT
