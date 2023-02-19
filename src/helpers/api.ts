export const getPlayers = async () =>
  (await (
    await fetch("http://localhost:3000/api/nbt/storage/commandmc/players")
  ).json()) as Player[];

export const getPlayerByName = async (name: string) =>
  (await (
    await fetch(
      `http://localhost:3000/api/nbt/storage/commandmc/players/name/${name}`
    )
  ).json()) as Player;

export const getPlayerById = async (id: number) =>
  (await (
    await fetch(`http://localhost:3000/api/nbt/storage/commandmc/players/${id}`)
  ).json()) as Player;

export interface Player {
  name: string;
  id: number;
  friend: {
    list: { id: number; name: string }[];
  };
  rank: {
    id: number;
    specialist: {
      lifeTime: number;
      remaining: number;
    };
    champion: {
      lifeTime: number;
      remaining: number;
    };
  };
  uuid: number[];
  lastOnline: number;
  display: {
    white: `{\"color\":\"white\",\"text\":\"${string}\"}`;
    rank: `{\"color\":\"${string}\",\"text\":\"${string}\"}`;
  };
  statistics: {
    comboduel: {
      plays: number;
      wins: number;
      max: number;
    };
    bedwars: {
      wins: number;
      plays: number;
      deaths: number;
      kills: number;
      beds: number;
    };
    cookies: {
      deaths: number;
      kills: number;
      wins: number;
      plays: number;
      cookies: number;
      picks: number;
    };
    smash: {
      deaths: number;
      kills: number;
      wins: number;
      plays: number;
    };
    gungame: {
      kills: number;
      deaths: number;
    };
    cuberunner: {
      average: number;
      plays: number;
      max: number;
      time: number;
    };
    safewalk: {
      deaths: number;
      kills: number;
      wins: number;
      plays: number;
    };
    bestbase: {
      plays: number;
      wins: number;
      places: number;
      breaks: number;
    };
  };
  settings: {
    color: number;
    jumpTo: number;
    allowPartyRequests: number;
    allowFriendRequests: number;
  };
}
