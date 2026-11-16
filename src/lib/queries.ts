import { queryOptions } from "@tanstack/react-query";
import { getHomeData, getModeLeaderboard, getOverallLeaderboard, getPlayerProfile, getTesters } from "./pctiers.functions";

export const homeQuery = () => queryOptions({ queryKey: ["home"], queryFn: () => getHomeData() });
export const overallQuery = () => queryOptions({ queryKey: ["overall"], queryFn: () => getOverallLeaderboard() });
export const modeQuery = (mode: string) =>
  queryOptions({ queryKey: ["mode", mode], queryFn: () => getModeLeaderboard({ data: { mode } }) });
export const playerQuery = (username: string) =>
  queryOptions({
    queryKey: ["player", username.toLowerCase()],
    queryFn: () => getPlayerProfile({ data: { username } }),
  });
export const testersQuery = () =>
  queryOptions({ queryKey: ["testers"], queryFn: () => getTesters(), refetchInterval: 60_000 });
