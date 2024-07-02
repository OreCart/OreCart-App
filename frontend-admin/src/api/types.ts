export interface Van {
  id: number;
  routeId: number;
}

export interface Route {
  id: number;
  name: string;
  color: string;
  description: string;
}

export interface Stop {
  id: number;
  name: string;
}

export interface VanStatus {
  guid: string;
  alive: boolean;
  started: number;
  updated: number;
}
