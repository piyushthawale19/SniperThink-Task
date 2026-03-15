const fs = require("fs/promises");
const pdfParse = require("pdf-parse");

const STOP_WORDS = new Set([
  "about",
  "after",
  "again",
  "against",
  "being",
  "below",
  "between",
  "could",
  "every",
  "first",
  "from",
  "have",
  "into",
  "just",
  "more",
  "most",
  "other",
  "over",
  "same",
  "such",
  "than",
  "that",
  "their",
  "there",
  "these",
  "they",
  "this",
  "very",
  "what",
  "when",
  "where",
  "which",
  "while",
  "with",
  "would",
  "your",
]);

const extractText = async (filePath, mimetype) => {
  if (mimetype === "application/pdf") {
    const buffer = await fs.readFile(filePath);
    const parsed = await pdfParse(buffer);
    return parsed.text || "";
  }

  if (mimetype === "text/plain") {
    return fs.readFile(filePath, "utf8");
  }

  throw new Error(`Unsupported file type: ${mimetype}`);
};

const analyzeText = (text) => {
  const normalizedText = text.replace(/\r\n/g, "\n").trim();
  const words = normalizedText.toLowerCase().match(/[a-z0-9']+/g) || [];
  const paragraphs = normalizedText
    ? normalizedText.split(/\n\s*\n/).filter((paragraph) => paragraph.trim())
    : [];

  const keywordFrequency = new Map();
  for (const word of words) {
    if (word.length < 4 || STOP_WORDS.has(word)) {
      continue;
    }

    keywordFrequency.set(word, (keywordFrequency.get(word) || 0) + 1);
  }

  const topKeywords = [...keywordFrequency.entries()]
    .sort((left, right) => {
      if (right[1] !== left[1]) {
        return right[1] - left[1];
      }

      return left[0].localeCompare(right[0]);
    })
    .slice(0, 10)
    .map(([keyword]) => keyword);

  return {
    wordCount: words.length,
    paragraphCount: paragraphs.length,
    topKeywords,
  };
};

module.exports = {
  analyzeText,
  extractText,
};
