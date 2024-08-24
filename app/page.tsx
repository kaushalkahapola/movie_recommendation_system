import MoviePoster from "@/_components/MoviePoster";
import db from "@/db";
import { Movie } from "@/types";
import { GoogleGenerativeAI, EmbedContentResponse } from "@google/generative-ai";

// refresh cache every 24 hours
export const revalidate = 60 * 60 * 24;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export default async function Home() {
  const movies = db.collection("movies");

  const allMovies = (await movies
    .find(
      {},
      {
        // this is how you exclude out the vector fields from the results
        // projection: { $vector: 0 },
      }
    )
    .toArray()) as Movie[];

  return (
    <div className="flex items-center justify-center pb-24 pt-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        {allMovies.map((movie) => (
          <MoviePoster key={movie._id} movie={movie} />
        ))}
      </div>
    </div>
  );
}

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
    return embedding;
  } catch (error) {
    return ["Error generating embedding:", error];
  }
}
