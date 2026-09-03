declare module 'cs_script/point_script' {
  interface EntityClassMap {
    player: CSPlayerPawn;
    observer: CSObserverPawn;
    cs_player_controller: CSPlayerController;
    cs_player_camera: CSPlayerCamera;
    custom_hud_layout: CustomHudLayout;
    point_template: PointTemplate;
    [key: `weapon_${string}`]: CSWeaponBase;
  }

  interface Domain {
    FindEntityByClass<T extends keyof EntityClassMap> (
      className: T,
    ): EntityClassMap[T] | undefined;
    FindEntityByClass<T extends Entity> (className: string): T | undefined;

    FindEntitiesByClass<T extends keyof EntityClassMap> (
      className: T,
    ): EntityClassMap[T][];
    FindEntitiesByClass<T extends Entity> (className: string): T[];

    FindEntityByName<T extends Entity> (className: string): T | undefined;
    FindEntitiesByName<T extends Entity> (className: string): T[];
  }
}
