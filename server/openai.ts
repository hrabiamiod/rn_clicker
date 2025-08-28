import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ModerationResult {
  approved: boolean;
  confidence: number;
  reasons: string[];
  category: string;
}

export async function moderateListing(
  title: string,
  description: string,
  category: string,
  price?: number
): Promise<ModerationResult> {
  try {
    const prompt = `
You are a content moderation AI for a classified ads platform. Analyze the following listing and determine if it should be approved or flagged for manual review.

Title: ${title}
Description: ${description}
Category: ${category}
Price: ${price ? `${price} PLN` : 'Not specified'}

Check for:
1. Inappropriate or offensive content
2. Spam or duplicate content indicators
3. Scam indicators (unrealistic prices, urgent language, poor grammar)
4. Prohibited items (weapons, drugs, adult content, etc.)
5. Misleading information
6. Category mismatch

Respond with JSON in this format:
{
  "approved": boolean,
  "confidence": number (0-1),
  "reasons": ["reason1", "reason2"],
  "category": "content_quality" | "spam" | "scam" | "prohibited" | "appropriate"
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert content moderator for a classified ads platform. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      approved: Boolean(result.approved),
      confidence: Math.max(0, Math.min(1, Number(result.confidence || 0))),
      reasons: Array.isArray(result.reasons) ? result.reasons : [],
      category: result.category || 'unknown',
    };
  } catch (error) {
    console.error("Failed to moderate listing:", error);
    // In case of API failure, err on the side of caution and require manual review
    return {
      approved: false,
      confidence: 0,
      reasons: ["API error - requires manual review"],
      category: "error",
    };
  }
}

export async function moderateImages(base64Images: string[]): Promise<ModerationResult> {
  try {
    if (base64Images.length === 0) {
      return {
        approved: true,
        confidence: 1,
        reasons: [],
        category: "appropriate",
      };
    }

    // Take the first image for moderation (can be extended to check all images)
    const imageToCheck = base64Images[0];

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an image moderation AI for a classified ads platform. Check if the image is appropriate for a general audience marketplace.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image for a classified ads platform. Check for inappropriate content, adult material, violence, or any content that would be unsuitable for a general marketplace. Respond with JSON: {\"approved\": boolean, \"confidence\": number, \"reasons\": [\"reason1\"], \"category\": \"appropriate|inappropriate\"}"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageToCheck}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      approved: Boolean(result.approved),
      confidence: Math.max(0, Math.min(1, Number(result.confidence || 0))),
      reasons: Array.isArray(result.reasons) ? result.reasons : [],
      category: result.category || 'unknown',
    };
  } catch (error) {
    console.error("Failed to moderate images:", error);
    return {
      approved: false,
      confidence: 0,
      reasons: ["Image moderation API error - requires manual review"],
      category: "error",
    };
  }
}
