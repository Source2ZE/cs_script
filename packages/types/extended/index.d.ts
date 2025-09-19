declare module 'cs_script/point_script' {
  interface GameEventDefs {
    server_spawn: {
      hostname: string
      address: string
      port: number
      game: string
      mapname: string
      addonname: string
      maxplayers: number
      os: string
      dedicated: boolean
      password: boolean
    }
    server_pre_shutdown: { reason: string }
    server_shutdown: { reason: string }
    server_message: { text: string }
    server_cvar: { cvarname: string; cvarvalue: string }

    player_activate: { userid: number }
    player_connect_full: { userid: number }
    player_full_update: { userid: number; count: number }
    player_info: { name: string; userid: number; steamid: string; bot: boolean }
    player_spawn: { userid: number; userid_pawn: number }
    player_team: {
      userid: number
      team: number
      oldteam: number
      disconnect: boolean
      silent: boolean
      isbot: boolean
      userid_pawn: number
    }
    local_player_team: {}
    local_player_controller_team: {}
    player_changename: { userid: number; oldname: string; newname: string }
    player_hurt: {
      userid: number
      attacker: number
      health: number
      armor: number
      weapon: string
      dmg_health: number
      dmg_armor: number
      hitgroup: number
      userid_pawn: number
      attacker_pawn: number
    }
    player_chat: { teamonly: boolean; userid: number; text: string }
    local_player_pawn_changed: {}
    player_stats_updated: { forceupload: boolean }
    player_footstep: { userid: number; userid_pawn: number }
    player_hintmessage: { hintmessage: string }
    player_spawned: { userid: number; inrestart: boolean; userid_pawn: number }
    player_jump: { userid: number }
    player_blind: {
      userid: number
      attacker: number
      entityid: number
      blind_duration: number
    }
    player_falldamage: { userid: number; damage: number; userid_pawn: number }
    player_score: {
      userid: number
      kills: number
      deaths: number
      score: number
    }
    player_shoot: {
      userid: number
      weapon: number
      mode: number
      userid_pawn: number
    }
    player_radio: {
      splitscreenplayer: number
      userid: number
      slot: number
      userid_pawn: number
    }
    player_avenged_teammate: { avenger_id: number; avenged_player_id: number }
    player_reset_vote: { userid: number; vote: boolean }
    player_given_c4: { userid: number }
    player_ping: {
      splitscreenplayer: number
      userid: number
      entityid: number
      x: number
      y: number
      z: number
      urgent: boolean
      userid_pawn: number
    }
    player_ping_stop: { entityid: number }
    player_sound: {
      userid: number
      radius: number
      duration: number
      step: boolean
      userid_pawn: number
    }

    teamplay_broadcast_audio: { team: number; sound: string }
    team_info: { teamid: number; teamname: string }
    team_score: { teamid: number; score: number }
    teamplay_round_start: { full_reset: boolean }
    team_intro_start: {}
    team_intro_end: {}
    round_start_pre_entity: {}
    round_start_post_nav: {}
    round_freeze_end: {}
    round_prestart: {}
    round_poststart: {}
    round_announce_match_point: {}
    round_announce_final: {}
    round_announce_last_round_half: {}
    round_announce_match_start: {}
    round_announce_warmup: {}
    round_end_upload_stats: {}
    round_officially_ended: {}
    round_time_warning: {}
    round_mvp: {
      userid: number
      reason: number
      value: number
      musickitmvps: number
      nomusic: number
      musickitid: number
    }

    game_init: {}
    game_start: {
      roundslimit: number
      timelimit: number
      fraglimit: number
      objective: string
    }
    game_end: { winner: number }
    game_message: { target: number; text: string }
    game_newmap: { mapname: string }
    game_phase_changed: { new_phase: number }

    hltv_cameraman: { userid: number }
    hltv_chase: {
      target1: number
      target2: number
      distance: number
      theta: number
      phi: number
      inertia: number
      ineye: number
    }
    hltv_rank_camera: { index: number; rank: number; target: number }
    hltv_rank_entity: { userid: number; rank: number; target: number }
    hltv_fixed: {
      posx: number
      posy: number
      posz: number
      theta: number
      phi: number
      offset: number
      fov: number
      target: number
    }
    hltv_message: { text: string }
    hltv_status: {
      clients: number
      slots: number
      proxies: number
      master: string
    }
    hltv_title: { text: string }
    hltv_chat: { text: string; steamID: string }
    hltv_versioninfo: { version: number }
    hltv_replay: { delay: number; reason: number }
    hltv_changed_mode: { oldmode: number; newmode: number; obs_target: number }
    hltv_replay_status: { reason: number }

    demo_start: {}
    demo_stop: {}
    demo_skip: { playback_tick: number; skipto_tick: number }

    map_shutdown: {}
    map_transition: {}
    hostname_changed: { hostname: string }
    difficulty_changed: {
      newDifficulty: number
      oldDifficulty: number
      strDifficulty: string
    }

    weapon_fire: {
      userid: number
      weapon: string
      silenced: boolean
      userid_pawn: number
    }
    weapon_fire_on_empty: {
      userid: number
      weapon: string
      userid_pawn: number
    }
    weapon_outofammo: { userid: number; userid_pawn: number }
    weapon_reload: { userid: number; userid_pawn: number }
    weapon_zoom: { userid: number; userid_pawn: number }
    weapon_zoom_rifle: { userid: number; userid_pawn: number }

    grenade_thrown: { userid: number; weapon: string; userid_pawn: number }
    grenade_bounce: { userid: number; userid_pawn: number }
    hegrenade_detonate: {
      userid: number
      entityid: number
      x: number
      y: number
      z: number
      userid_pawn: number
    }
    flashbang_detonate: {
      userid: number
      entityid: number
      x: number
      y: number
      z: number
      userid_pawn: number
    }
    smokegrenade_detonate: {
      userid: number
      entityid: number
      x: number
      y: number
      z: number
      userid_pawn: number
    }
    smokegrenade_expired: {
      userid: number
      entityid: number
      x: number
      y: number
      z: number
      userid_pawn: number
    }
    molotov_detonate: {
      userid: number
      x: number
      y: number
      z: number
      userid_pawn: number
    }
    decoy_detonate: {
      userid: number
      entityid: number
      x: number
      y: number
      z: number
      userid_pawn: number
    }
    decoy_started: {
      userid: number
      entityid: number
      x: number
      y: number
      z: number
      userid_pawn: number
    }
    decoy_firing: {
      userid: number
      entityid: number
      x: number
      y: number
      z: number
      userid_pawn: number
    }
    tagrenade_detonate: {
      userid: number
      entityid: number
      x: number
      y: number
      z: number
    }

    inferno_startburn: { entityid: number; x: number; y: number; z: number }
    inferno_expire: { entityid: number; x: number; y: number; z: number }
    inferno_extinguish: { entityid: number; x: number; y: number; z: number }

    bomb_beginplant: { userid: number; site: number; userid_pawn: number }
    bomb_abortplant: { userid: number; site: number; userid_pawn: number }
    bomb_begindefuse: { userid: number; haskit: boolean; userid_pawn: number }
    bomb_abortdefuse: { userid: number; userid_pawn: number }
    bomb_exploded: { userid: number; site: number; userid_pawn: number }
    bomb_dropped: { userid: number; entindex: number; userid_pawn: number }
    bomb_pickup: { userid: number; userid_pawn: number }
    bomb_beep: { entindex: number }

    defuser_dropped: { entityid: number }
    defuser_pickup: { entityid: number; userid: number; userid_pawn: number }

    hostage_follows: { userid: number; hostage: number; userid_pawn: number }
    hostage_hurt: { userid: number; hostage: number; userid_pawn: number }
    hostage_killed: { userid: number; hostage: number; userid_pawn: number }
    hostage_rescued: {
      userid: number
      hostage: number
      site: number
      userid_pawn: number
    }
    hostage_stops_following: {
      userid: number
      hostage: number
      userid_pawn: number
    }
    hostage_rescued_all: {}
    hostage_call_for_help: { hostage: number }

    vip_escaped: { userid: number }
    vip_killed: { userid: number; attacker: number }

    item_purchase: {
      userid: number
      team: number
      loadout: number
      weapon: string
    }
    item_pickup: {
      userid: number
      item: string
      silent: boolean
      defindex: number
    }
    item_pickup_slerp: { userid: number; index: number; behavior: number }
    item_pickup_failed: {
      userid: number
      item: string
      reason: number
      limit: number
    }
    item_remove: { userid: number; item: string; defindex: number }
    item_equip: {
      userid: number
      item: string
      defindex: number
      canzoom: boolean
      hassilencer: boolean
      issilenced: boolean
      hastracers: boolean
      weptype: number
      ispainted: boolean
    }
    item_schema_initialized: {}

    ammo_pickup: { userid: number; item: string; index: number }
    ammo_refill: { userid: number; success: boolean }

    enter_buyzone: { userid: number; canbuy: boolean }
    exit_buyzone: { userid: number; canbuy: boolean }
    enter_bombzone: { userid: number; hasbomb: boolean; isplanted: boolean }
    exit_bombzone: { userid: number; hasbomb: boolean; isplanted: boolean }
    enter_rescue_zone: { userid: number }
    exit_rescue_zone: { userid: number }
    buytime_ended: {}

    silencer_off: { userid: number }
    silencer_on: { userid: number }
    silencer_detach: { userid: number; userid_pawn: number }

    buymenu_open: { userid: number }
    buymenu_close: { userid: number }

    inspect_weapon: { userid: number; userid_pawn: number }

    other_death: {
      otherid: number
      othertype: string
      attacker: number
      weapon: string
      weapon_itemid: string
      weapon_fauxitemid: string
      weapon_originalowner_xuid: string
      headshot: boolean
      penetrated: number
      noscope: boolean
      thrusmoke: boolean
      attackerblind: boolean
    }
    bullet_impact: {
      userid: number
      x: number
      y: number
      z: number
      userid_pawn: number
    }
    bullet_flight_resolution: {
      userid: number
      userid_pawn: number
      pos_x: number
      pos_y: number
      pos_z: number
      ang_x: number
      ang_y: number
      ang_z: number
      start_x: number
      start_y: number
      start_z: number
    }

    door_close: { userid: number; checkpoint: boolean; userid_pawn: number }
    door_moving: { userid: number; entindex: number; userid_pawn: number }
    door_break: { entindex: number; dmgstate: number }
    door_closed: { userid_pawn: number; entindex: number }
    door_open: { userid_pawn: number; entindex: number }

    break_breakable: {
      entindex: number
      userid: number
      material: number
      userid_pawn: number
    }
    break_prop: { entindex: number; userid: number; userid_pawn: number }
    broken_breakable: {
      entindex: number
      userid: number
      material: number
      userid_pawn: number
    }

    entity_killed: {
      entindex_killed: number
      entindex_attacker: number
      entindex_inflictor: number
      damagebits: number
    }
    entity_visible: {
      userid: number
      subject: number
      classname: string
      entityname: string
    }

    vote_started: {
      issue: string
      param1: string
      team: number
      initiator: number
    }
    vote_failed: { team: number }
    vote_passed: { details: string; param1: string; team: number }
    vote_changed: {
      vote_option1: number
      vote_option2: number
      vote_option3: number
      vote_option4: number
      vote_option5: number
      potentialVotes: number
    }
    vote_cast_yes: { team: number; entityid: number }
    vote_cast_no: { team: number; entityid: number }
    vote_cast: { vote_option: number; team: number; userid: number }
    vote_ended: {}
    vote_options: {
      count: number
      option1: string
      option2: string
      option3: string
      option4: string
      option5: string
    }
    start_vote: { userid: number; type: number; vote_parameter: number }
    enable_restart_voting: { enable: boolean }

    achievement_event: {
      achievement_name: string
      cur_val: number
      max_val: number
    }
    achievement_earned: { player: number; achievement: number }
    achievement_earned_local: { achievement: number; splitscreenplayer: number }
    achievement_write_failed: {}
    achievement_info_loaded: {}

    bonus_updated: {
      numadvanced: number
      numbronze: number
      numsilver: number
      numgold: number
    }

    spec_target_updated: { userid: number; target: number; userid_pawn: number }
    spec_mode_updated: { userid: number }

    gameinstructor_draw: {}
    gameinstructor_nodraw: {}
    instructor_start_lesson: {
      userid: number
      hint_name: string
      hint_target: number
      vr_movement_type: number
      vr_single_controller: boolean
      vr_controller_type: number
    }
    instructor_close_lesson: { userid: number; hint_name: string }
    instructor_server_hint_create: {
      userid: number
      hint_name: string
      hint_replace_key: string
      hint_target: number
      hint_activator_userid: number
      hint_timeout: number
      hint_icon_onscreen: string
      hint_icon_offscreen: string
      hint_caption: string
      hint_activator_caption: string
      hint_color: string
      hint_icon_offset: number
      hint_range: number
      hint_flags: number
      hint_binding: string
      hint_gamepad_binding: string
      hint_allow_nodraw_target: boolean
      hint_nooffscreen: boolean
      hint_forcecaption: boolean
      hint_local_player_only: boolean
    }
    instructor_server_hint_stop: { hint_name: string }
    clientside_lesson_closed: { lesson_name: string }
    set_instructor_group_enabled: { group: string; enabled: number }

    physgun_pickup: { target: number }
    flare_ignite_npc: { entindex: number }
    helicopter_grenade_punt_miss: {}

    finale_start: { rushes: number }

    user_data_downloaded: {}
    read_game_titledata: { controllerId: number }
    write_game_titledata: { controllerId: number }
    reset_game_titledata: { controllerId: number }
    write_profile_data: {}

    ragdoll_dissolved: { entindex: number }

    inventory_updated: {}
    cart_updated: {}
    store_pricesheet_updated: {}
    drop_rate_modified: {}
    event_ticket_modified: {}

    gc_connected: {}

    dynamic_shadow_light_changed: {}

    gameui_hidden: {}

    items_gifted: {
      player: number
      itemdef: number
      numgifts: number
      giftidx: number
      accountid: number
    }

    warmup_end: {}

    announce_phase_end: {}
    cs_intermission: {}
    cs_game_disconnected: {}
    cs_round_final_beep: {}
    cs_round_start_beep: {}
    cs_win_panel_round: {
      show_timer_defend: boolean
      show_timer_attack: boolean
      timer_time: number
      final_event: number
      funfact_token: string
      funfact_player: number
      funfact_data1: number
      funfact_data2: number
      funfact_data3: number
    }
    cs_win_panel_match: {}
    cs_match_end_restart: {}
    cs_pre_restart: {}
    cs_prev_next_spectator: { next: boolean }

    show_deathpanel: {
      victim: number
      killer: number
      killer_controller: number
      hits_taken: number
      damage_taken: number
      hits_given: number
      damage_given: number
      victim_pawn: number
    }
    hide_deathpanel: {}

    ugc_map_info_received: { published_file_id: string }
    ugc_map_unsubscribed: { published_file_id: string }
    ugc_map_download_error: { published_file_id: string; error_code: number }
    ugc_file_download_finished: { hcontent: string }
    ugc_file_download_start: { hcontent: string; published_file_id: string }

    begin_new_match: {}
    match_end_conditions: {
      frags: number
      max_rounds: number
      win_rounds: number
      time: number
    }
    endmatch_mapvote_selecting_map: {
      count: number
      slot1: number
      slot2: number
      slot3: number
      slot4: number
      slot5: number
      slot6: number
      slot7: number
      slot8: number
      slot9: number
      slot10: number
    }
    endmatch_cmm_start_reveal_items: {}
    nextlevel_changed: {
      nextlevel: string
      mapgroup: string
      skirmishmode: string
    }

    dm_bonus_weapon_start: { time: number; Pos: number }

    gg_killed_enemy: {
      victimid: number
      attackerid: number
      dominated: number
      revenge: number
      bonus: boolean
    }

    switch_team: {
      numPlayers: number
      numSpectators: number
      avg_rank: number
      numTSlotsFree: number
      numCTSlotsFree: number
    }

    trial_time_expired: { userid: number }

    update_matchmaking_stats: {}

    client_disconnect: {}
    client_loadout_changed: {}

    add_player_sonar_icon: {
      userid: number
      pos_x: number
      pos_y: number
      pos_z: number
    }
    add_bullet_hit_marker: {
      userid: number
      bone: number
      pos_x: number
      pos_y: number
      pos_z: number
      ang_x: number
      ang_y: number
      ang_z: number
      start_x: number
      start_y: number
      start_z: number
      hit: boolean
    }

    sfuievent: { action: string; data: string; slot: number }

    weaponhud_selection: {
      userid: number
      mode: number
      entindex: number
      userid_pawn: number
    }

    tr_player_flashbanged: { userid: number }
    tr_mark_complete: { complete: number }
    tr_mark_best_time: { time: number }
    tr_exit_hint_trigger: {}
    tr_show_finish_msgbox: {}
    tr_show_exit_msgbox: {}

    bot_takeover: { userid: number; botid: number; userid_pawn: number }

    jointeam_failed: { userid: number; reason: number }
    teamchange_pending: { userid: number; toteam: number }

    material_default_complete: {}

    seasoncoin_levelup: { userid: number; category: number; rank: number }
    tournament_reward: {
      defindex: number
      totalrewards: number
      accountid: number
    }
    start_halftime: {}

    player_decal: { userid: number; userid_pawn: number }

    survival_announce_phase: { phase: number }
    parachute_pickup: { userid: number }
    parachute_deploy: { userid: number }
    dronegun_attack: { userid: number }
    drone_dispatched: {
      userid: number
      priority: number
      drone_dispatched: number
    }
    loot_crate_visible: { userid: number; subject: number; type: string }
    loot_crate_opened: { userid: number; type: string }
    open_crate_instr: { userid: number; subject: number; type: string }
    smoke_beacon_paradrop: { userid: number; paradrop: number }
    survival_paradrop_spawn: { entityid: number }
    survival_paradrop_break: { entityid: number }
    drone_cargo_detached: { userid: number; cargo: number; delivered: boolean }
    drone_above_roof: { userid: number; cargo: number }
    choppers_incoming_warning: { global: boolean }
    firstbombs_incoming_warning: { global: boolean }
    dz_item_interaction: { userid: number; subject: number; type: string }
    survival_teammate_respawn: { userid: number }
    survival_no_respawns_warning: { userid: number }
    survival_no_respawns_final: { userid: number }
    show_survival_respawn_status: {
      loc_token: string
      duration: number
      userid: number
      userid_pawn: number
    }

    guardian_wave_restart: {}

    nav_blocked: { area: number; blocked: boolean }
    nav_generate: {}

    repost_xbox_achievements: { splitscreenplayer: number }
    mb_input_lock_success: {}
    mb_input_lock_cancel: {}
  }
}
