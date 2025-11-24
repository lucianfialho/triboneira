/**
 * HLTV Type Definitions
 * These types match the HLTV library responses
 */

export interface HLTVEvent {
  id: number;
  name: string;
  dateStart: number;
  dateEnd?: number;
  prizePool?: string;
  teams?: HLTVTeam[];
  location?: {
    name: string;
    code?: string;
  };
  format?: string;
  numberOfTeams?: number;
  relatedEvents?: Array<{ id: number; name: string }>;
}

export interface HLTVTeam {
  id: number;
  name: string;
  rank?: number;
  logo?: string;
  country?: {
    name: string;
    code: string;
  };
  location?: {
    name: string;
    code?: string;
  };
}

export interface HLTVPlayer {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  country?: {
    name: string;
    code: string;
  };
  image?: string;
  team?: {
    id: number;
    name: string;
  };
}

export interface HLTVMatch {
  id: number;
  team1?: HLTVTeam;
  team2?: HLTVTeam;
  result?: {
    team1: number;
    team2: number;
    winnerId?: number;
  };
  event?: {
    id: number;
    name: string;
  };
  format?: string;
  date?: number;
  stats?: HLTVMatchStats;
  live?: boolean;
}

export interface HLTVMatchStats {
  team1?: HLTVTeamMatchStats;
  team2?: HLTVTeamMatchStats;
}

export interface HLTVTeamMatchStats {
  players: HLTVPlayerMatchStats[];
}

export interface HLTVPlayerMatchStats {
  id: number;
  name: string;
  kills: number;
  deaths: number;
  assists: number;
  adr?: number;
  rating?: number;
  kast?: number;
  hsPercent?: number;
}

export interface HLTVNews {
  id: number;
  title: string;
  description?: string;
  link: string;
  date: number;
  country?: {
    name: string;
    code: string;
  };
}

export interface HLTVMap {
  name: string;
  result?: {
    team1TotalRounds: number;
    team2TotalRounds: number;
  };
}
