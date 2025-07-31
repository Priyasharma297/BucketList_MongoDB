// const { GoogleGenerativeAI } = require("@google/generative-ai");
// require("dotenv").config();

// const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// const generateItinerary = async (source, destination, days, budget) => {
//   const prompt = `Create a ${days}-day travel itinerary from ${source} to ${destination} within a budget of ₹${budget}. 
// Include daily plans with travel, food, and sightseeing. Present each day clearly in bullet points or as "Day 1: ..."`; 

//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

//     const result = await model.generateContent({
//       contents: [{ role: "user", parts: [{ text: prompt }] }],
//     });

//     const text = result.response.text();
//     return formatItinerary(text);
//   } catch (error) {
//     console.error("AI generation error:", error);
//     throw new Error("Itinerary generation failed.");
//   }
// };

// // Format raw Gemini response to array of objects
// // Function to format AI-generated text into a structured array
// const formatItinerary = (itineraryText) => {
//   const lines = itineraryText
//     .split("\n")
//     .map((line) => line.trim())
//     .filter((line) => line.length > 0);

//   let formatted = [];
//   let generalTips = [];
//   let currentDay = null;
//   let isTipSection = false;

//   lines.forEach((line) => {
//     const dayMatch = line.match(/^(\*\*?)?Day (\d+)(\*\*?)?:?/i);
//     const tipsHeaderMatch = line.toLowerCase().includes("tips for");

//     // Clean a line from markdown asterisks
//     const cleanLine = line.replace(/^\*+/, "").replace(/\*\*/g, "").trim();

//     if (dayMatch) {
//       currentDay = {
//         dayNumber: dayMatch[2],
//         activities: [],
//       };
//       formatted.push(currentDay);
//       isTipSection = false;
//     } else if (tipsHeaderMatch) {
//       isTipSection = true;
//       generalTips.push(cleanLine);
//     } else if (isTipSection) {
//       generalTips.push(cleanLine);
//     } else if (currentDay) {
//       currentDay.activities.push(cleanLine);
//     }
//   });

//   return { itinerary: formatted, generalTips };
// };



// // Controller for handling POST
// const getItinerary = async (req, res) => {
//   const { source, destination, days, budget } = req.body;

//   if (!source || !destination || !days || !budget) {
//     return res.status(400).render("itinerary", {
//       error: "All fields are required.",
//     });
//   }

//   try {
//     const { itinerary, generalTips } = await generateItinerary(source, destination, days, budget);
// res.render("itinerary", { itinerary, generalTips, source, destination, days, budget });

//   } catch (error) {
//     res.status(500).render("itinerary", {
//       error: "Failed to generate itinerary. Please try again later.",
//     });
//   }
// };

// module.exports = { getItinerary };

const axios = require("axios");
require("dotenv").config();

const generateItinerary = async (source, destination, days, budget) => {
  const prompt = `Create a ${days}-day travel itinerary from ${source} to ${destination} within a budget of ₹${budget}.
Include daily plans with travel , food, and sightseeing. Present each day clearly in bullet points or as "Day 1: ..."`;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 400,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const text = response.data.choices[0].message.content;
    return formatItinerary(text);
  } catch (error) {
    console.error("OpenRouter API error:", error.response?.data || error.message);
    throw new Error("Itinerary generation failed.");
  }
};

const formatItinerary = (text) => {
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);

  let formatted = [], generalTips = [], currentDay = null, isTipSection = false;

  lines.forEach((line) => {
    const dayMatch = line.match(/^(\*\*?)?Day (\d+)(\*\*?)?:?/i);
    const tipsHeaderMatch = line.toLowerCase().includes("tips for");

    const cleanLine = line.replace(/^\*+/, "").replace(/\*\*/g, "").trim();

    if (dayMatch) {
      currentDay = { dayNumber: dayMatch[2], activities: [] };
      formatted.push(currentDay);
      isTipSection = false;
    } else if (tipsHeaderMatch) {
      isTipSection = true;
      generalTips.push(cleanLine);
    } else if (isTipSection) {
      generalTips.push(cleanLine);
    } else if (currentDay) {
      currentDay.activities.push(cleanLine);
    }
  });

  return { itinerary: formatted, generalTips };
};

const getItinerary = async (req, res) => {
  const { source, destination, days, budget } = req.body;

  if (!source || !destination || !days || !budget) {
    return res.status(400).render("itinerary", {
      error: "All fields are required.",
    });
  }

  try {
    const { itinerary, generalTips } = await generateItinerary(source, destination, days, budget);
    res.render("itinerary", {
      itinerary,
      generalTips,
      source,
      destination,
      days,
      budget,
    });
  } catch (error) {
    res.status(500).render("itinerary", {
      error: "Failed to generate itinerary. Please try again later.",
    });
  }
};

module.exports = { getItinerary };
