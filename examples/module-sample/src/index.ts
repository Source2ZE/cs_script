import { Instance } from "cs_script/point_script";
import { test } from "@s2ze/scheduler";
import isEven from "is-even";

Instance.Msg("Loaded")

Instance.OnGameEvent("bullet_impact" as any, async () => {
  test();
  Instance.Msg(isEven(~~(Math.random() * 10)) ? "even" : "odd");
})