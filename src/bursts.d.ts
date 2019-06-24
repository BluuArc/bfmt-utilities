export declare function getLevelEntryForBurst(burst: Bfmt.Utilities.Datamine.BraveBurst, level: number | undefined): Bfmt.Utilities.Datamine.BurstLevelEntry;
export declare function getBurstEffects(burst: Bfmt.Utilities.Datamine.BraveBurst, level: number | undefined): Array<Bfmt.Utilities.Datamine.ProcEffect | Bfmt.Utilities.Datamine.UnknownProcEffect>;
export declare function getBcDcInfo(burst: Bfmt.Utilities.Datamine.BraveBurst, level: number | undefined): {
    cost: number;
    hits: number;
    dropchecks: number;
};
