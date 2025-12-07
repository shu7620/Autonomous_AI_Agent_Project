import { createAgent } from "langchain";
import { tool } from "@langchain/core/tools";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { config } from "dotenv";
import { z } from "zod";
import { MemorySaver } from "@langchain/langgraph";

config();

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
});

const checkpoint = new MemorySaver();

const weathertool = tool(
  async (query) => {
    console.log("query", query);
    return "The Weather of Tokyo is Sunny";
  },
  {
    name: "Weather",
    description: "get the weather of a given location",
    schema: z.object({
      query: z.string().describe("Location to get the weather for"),
    }),
  }
);

const multiplytool = tool(
  async (input) => {
    console.log("query", input);
    return `The result of multiplication is ${input.a * input.b}`;
  },
  {
    name: "Multiply",
    description: "Multiplication of two numbers",
    schema: z.object({
      a: z.number().describe("First Number"),
      b: z.number().describe("Second Number"),
    }),
  }
);

export const agent = createAgent({
  model: model,
  tools: [weathertool, multiplytool],
  checkpoint,
});
