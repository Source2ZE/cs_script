declare module 'cs_script/point_script' {
  interface EntityClassMap {
    player: CSPlayerPawn
    observer: CSObserverPawn
    cs_player_controller: CSPlayerController
    [key: `weapon_${string}`]: CSWeaponBase
  }

  interface Domain {
    FindEntityByClass<T extends keyof EntityClassMap>(
      className: T
    ): EntityClassMap[T] | undefined
    FindEntitiesByClass<T extends keyof EntityClassMap>(
      className: T
    ): EntityClassMap[T][] | undefined

    FindEntityByClass<T extends Entity>(className: string): T | undefined
    FindEntitiesByClass<T extends Entity>(className: string): T[] | undefined

    FindEntityByName<T extends Entity>(className: string): T | undefined
    FindEntitiesByName<T extends Entity>(className: string): T[] | undefined
  }
}
