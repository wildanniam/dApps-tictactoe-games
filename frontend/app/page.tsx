import { GamesList } from "@/components/game-list";
import { getAllGames } from "@/lib/contract";
import { unstable_cache } from "next/cache";

// Revalidate the page (and cached data below) at most once every 30s
export const revalidate = 30;

const getAllGamesCached = unstable_cache(
  async () => {
    return getAllGames();
  },
  ["all-games"],
  { revalidate: 30 }
);

export default async function Home() {
  const games = await getAllGamesCached();

  return (
    <section className="flex flex-col items-center py-20">
      <div className="text-center mb-20">
        <h1 className="text-4xl font-bold">Tic Tac Toe 🎲</h1>
        <span className="text-sm text-gray-500">
          Play 1v1 Tic Tac Toe on the Stacks blockchain
        </span>
      </div>

      <GamesList games={games} />
    </section>
  );
}