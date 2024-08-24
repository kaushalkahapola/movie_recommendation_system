import MoviePoster from "@/_components/MoviePoster";
import db from "@/db";
import { Movie } from "@/types";
import { GoogleGenerativeAI, EmbedContentResponse } from "@google/generative-ai";

// refresh cache every 24 hours
export const revalidate = 60 * 60 * 24;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);


// if you need to create custom embeddings, here is an example of how to do it...
async function embedding(prompt: string) {
  // const response = await fetch("https://api.openai.com/v1/embeddings", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  //   },
  //   body: JSON.stringify({
  //     input: prompt,
  //     model: "text-embedding-3-large",
  //     dimensions: 512,
  //   }),
  // });

  // const result = await response.json();

  // return result.data[0].embedding;

  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

  try {
    const result: EmbedContentResponse = await model.embedContent(prompt);
    const embedding = result.embedding;

    // Convert to number[] before returning
    const embeddingArray: number[] = embedding.values || [];

    return embeddingArray;
  } catch (error) {
    return ["Error generating embedding:", error];
  }
}


async function SearchTerm({
  params: { term },
}: {
  params: {
    term: string;
  };
}) {
  const movies = db.collection("movies");
  const temp_embedding = await embedding(term)

  const similarMovies = (await movies
    .find(
      {},
      {
        sort: { $vector: temp_embedding as number[] },
        limit: 10,
        // Do not include vectors in the output.
        projection: { $vector: 0 },
      }
    )
    .toArray()) as Movie[];

  return (
    <div className="flex flex-col items-center justify-center p-20 pt-10">
      <h1 className="mb-10 text-xl text-gray-100">
        Suggested results based on your search
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        {similarMovies.map((movie, i) => (
          <div className="flex space-x-2 relative">
            <p className="absolute flex items-center justify-center left-4 top-2 text-white font-extrabold text-xl z-40 rounded-full bg-indigo-500/80 w-10 h-10">
              {i + 1}
            </p>

            <MoviePoster key={movie._id} movie={movie} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default SearchTerm;
