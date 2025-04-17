import { tool } from "ai";
import { z } from "zod";
import * as cheerio from "cheerio";
import axios from "axios";
import yahooFinance from 'yahoo-finance2';
import puppeteer from "puppeteer";


export const weatherTool = tool({
  description: "Get the weather in a location",
  parameters: z.object({
    location: z.string().describe("The location to get the weather for"),
  }),
  execute: async ({ location }) => ({
    location,
    temperature: 72 + Math.floor(Math.random() * 21) - 10,
  }),
});

export const fetchStockPriceTool = tool({
  description: "Fetch the current price of a stock from Yahoo Finance",
  parameters: z.object({
    symbol: z.string().describe("The stock symbol to get the price for"),
  }),
  execute: async ({ symbol }) => {
    try {
      const quote = await yahooFinance.quote(symbol);
      const price = quote.regularMarketPrice;

      // Return the result in pirate finance expert style
      return {
        location: symbol,
        content: `Arr! The current price of ${symbol} be $${price}! A fine treasure, indeed!`,
      };
    } catch (error) {
      // Handle errors (e.g., if the page doesn't load or elements are not found)
      return { location: symbol, content: "Arrr! Couldn’t fetch the stock price, matey!" };
    }
  },
});


/*export const ticinoRentTool = tool({
  description: "Scrape real estate listings from Homegate in the Canton of Ticino",
  parameters: z.object({
    maxListings: z.number().min(1).max(10).default(3).describe("Max number of listings to return"),
  }),
  execute: async ({ maxListings }) => {
    const url = "https://www.homegate.ch/rent/real-estate/canton-ticino/matching-list";

    let listings;

    return {
      listings,
    };
  },
});*/