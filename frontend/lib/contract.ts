import { STACKS_TESTNET } from "@stacks/network";
import {
  BooleanCV,
  cvToValue,
  fetchCallReadOnlyFunction,
  ListCV,
  OptionalCV,
  PrincipalCV,
  TupleCV,
  uintCV,
  UIntCV,
} from "@stacks/transactions";

const CONTRACT_ADDRESS = "ST2HYQ0YP5YK1DF7HF859G5HDQ4JKRRFFBT48SM0M";
const CONTRACT_NAME = "tic-tac-toe";


type GameCV = {
  "player-one": PrincipalCV;
  "player-two": OptionalCV<PrincipalCV>;
  "is-player-one-turn": BooleanCV;
  "bet-amount": UIntCV;
  board: ListCV<UIntCV>;
  winner: OptionalCV<PrincipalCV>;
};


// Prefer the public stacks node (less strict rate-limits than Hiro platform API)
const CORE_API_URL = "https://stacks-node-api.testnet.stacks.co";

// Small helper to delay retries
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Wrapper to call read-only with retry/backoff and custom core API
async function callReadOnlyWithRetry(
  opts: Parameters<typeof fetchCallReadOnlyFunction>[0],
  { retries = 3, baseDelayMs = 400 }: { retries?: number; baseDelayMs?: number } = {}
) {
  let attempt = 0;
  for (;;) {
    try {
      return await fetchCallReadOnlyFunction({
        ...opts,
        // Force using the public stacks node core API
        network: { ...(STACKS_TESTNET as unknown as object), coreApiUrl: CORE_API_URL } as any,
      });
    } catch (e: any) {
      const msg = String(e?.message || e);
      const shouldRetry =
        msg.includes("429") ||
        msg.toLowerCase().includes("too many requests") ||
        msg.toLowerCase().includes("rate limit");
      if (!shouldRetry || attempt >= retries) throw e;
      await sleep(baseDelayMs * Math.pow(2, attempt));
      attempt += 1;
    }
  }
}

// Simple cache for games
let gamesCache: Game[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

// Cache for individual games
const gameCache: { [id: number]: Game | null } = {};
const gameCacheTime: { [id: number]: number } = {};
const GAME_CACHE_DURATION = 30000; // 30 seconds

export type Game = {
  id: number;
  "player-one": string;
  "player-two": string | null;
  "is-player-one-turn": boolean;
  "bet-amount": number;
  board: number[];
  winner: string | null;
};

export enum Move {
  EMPTY = 0,
  X = 1,
  O = 2,
}

export const EMPTY_BOARD = [
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
];

export async function getAllGames() {
  const now = Date.now();
  if (gamesCache && now - lastFetchTime < CACHE_DURATION) {
    return gamesCache;
  }

  // Fetch the latest-game-id from the contract
  const latestGameIdCV = (await callReadOnlyWithRetry({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "get-latest-game-id",
    functionArgs: [],
    senderAddress: CONTRACT_ADDRESS,
  })) as UIntCV;

  // Convert the uintCV to a JS/TS number type
  const latestGameId = parseInt(latestGameIdCV.value.toString());

  // Only fetch the 3 most recent games to avoid rate limit
  const games: Game[] = [];
  const start = Math.max(0, latestGameId - 3);
  for (let i = start; i < latestGameId; i++) {
    const game = await getGame(i);
    if (game) games.push(game);
  }
  gamesCache = games;
  lastFetchTime = now;
  return games;
}

export async function getGame(gameId: number) {
  const now = Date.now();
  if (gameCache[gameId] && now - gameCacheTime[gameId] < GAME_CACHE_DURATION) {
    return gameCache[gameId];
  }
  // Use the get-game read only function to fetch the game details for the given gameId
  const gameDetails = await callReadOnlyWithRetry({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "get-game",
    functionArgs: [uintCV(gameId)],
    senderAddress: CONTRACT_ADDRESS,
  });

  const responseCV = gameDetails as OptionalCV<TupleCV<GameCV>>;
  // If we get back a none, then the game does not exist and we return null
  if (responseCV.type === "none") {
    gameCache[gameId] = null;
    gameCacheTime[gameId] = now;
    return null;
  }
  // If we get back a value that is not a tuple, something went wrong and we return null
  if (responseCV.value.type !== "tuple") {
    gameCache[gameId] = null;
    gameCacheTime[gameId] = now;
    return null;
  }

  // If we got back a GameCV tuple, we can convert it to a Game object
  const gameCV = responseCV.value.value;

  const game: Game = {
    id: gameId,
    "player-one": gameCV["player-one"].value,
    "player-two":
      gameCV["player-two"].type === "some"
        ? gameCV["player-two"].value.value
        : null,
    "is-player-one-turn": cvToValue(gameCV["is-player-one-turn"]),
    "bet-amount": parseInt(gameCV["bet-amount"].value.toString()),
    board: gameCV["board"].value.map((cell) => parseInt(cell.value.toString())),
    winner:
      gameCV["winner"].type === "some" ? gameCV["winner"].value.value : null,
  };
  gameCache[gameId] = game;
  gameCacheTime[gameId] = now;
  return game;
}

export async function createNewGame(
  betAmount: number,
  moveIndex: number,
  move: Move
) {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "create-game",
    functionArgs: [uintCV(betAmount), uintCV(moveIndex), uintCV(move)],
  };

  return txOptions;
}

export async function joinGame(gameId: number, moveIndex: number, move: Move) {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "join-game",
    functionArgs: [uintCV(gameId), uintCV(moveIndex), uintCV(move)],
  };

  return txOptions;
}

export async function play(gameId: number, moveIndex: number, move: Move) {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "play",
    functionArgs: [uintCV(gameId), uintCV(moveIndex), uintCV(move)],
  };

  return txOptions;
}