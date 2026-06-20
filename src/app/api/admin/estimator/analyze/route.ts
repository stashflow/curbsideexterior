import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth";
import { buildQuote, type QuoteInput } from "@/lib/pricing";

export const runtime = "nodejs";

type EstimatorForm = {
  address?: string;
  zip?: string;
  drivewaySqft?: number;
  walkwaySqft?: number;
  patioSqft?: number;
  houseSqft?: number;
  fenceLinearFeet?: number;
  binsCount?: number;
  heavyStainLevel?: QuoteInput["heavyStainLevel"];
  photoUrls?: string[];
};

type StainLevel = "light" | "moderate" | "heavy";

type AiEstimatorResult = {
  drivewaySqft: number;
  walkwaySqft: number;
  patioSqft: number;
  houseSqft: number;
  fenceLinearFeet: number;
  binsCount: number;
  heavyStainLevel: StainLevel;
  estimatedMinutes: number;
  confidence: number;
  observations: string[];
  suggestedAddOns: string[];
  summary: string;
};

const estimatorSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "drivewaySqft",
    "walkwaySqft",
    "patioSqft",
    "houseSqft",
    "fenceLinearFeet",
    "binsCount",
    "heavyStainLevel",
    "estimatedMinutes",
    "confidence",
    "observations",
    "suggestedAddOns",
    "summary",
  ],
  properties: {
    drivewaySqft: { type: "number", minimum: 0, maximum: 2500 },
    walkwaySqft: { type: "number", minimum: 0, maximum: 1000 },
    patioSqft: { type: "number", minimum: 0, maximum: 1500 },
    houseSqft: { type: "number", minimum: 0, maximum: 4000 },
    fenceLinearFeet: { type: "number", minimum: 0, maximum: 500 },
    binsCount: { type: "number", minimum: 0, maximum: 8 },
    heavyStainLevel: { type: "string", enum: ["light", "moderate", "heavy"] },
    estimatedMinutes: { type: "number", minimum: 15, maximum: 600 },
    confidence: { type: "number", minimum: 50, maximum: 98 },
    observations: {
      type: "array",
      minItems: 1,
      maxItems: 6,
      items: { type: "string", maxLength: 120 },
    },
    suggestedAddOns: {
      type: "array",
      minItems: 0,
      maxItems: 4,
      items: { type: "string", maxLength: 80 },
    },
    summary: { type: "string", maxLength: 180 },
  },
};

function cleanNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(0, Math.round(number));
}

function cleanZip(value: unknown) {
  const zip = String(value ?? "").replace(/\D/g, "").slice(0, 5);
  return zip || "30067";
}

function cleanStain(value: unknown): StainLevel {
  return value === "heavy" || value === "moderate" || value === "light" ? value : "light";
}

function cleanPhotos(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item))
    .filter((url) => /^https:\/\/.+\.(jpg|jpeg|png|webp|heic|heif)(\?.*)?$/i.test(url) || url.includes("vercel-storage.com"))
    .slice(0, 8);
}

function buildQuoteInput(form: Required<EstimatorForm>): QuoteInput {
  const hasPressureSurface =
    form.drivewaySqft > 0 ||
    form.walkwaySqft > 0 ||
    form.patioSqft > 0 ||
    form.houseSqft > 0 ||
    form.fenceLinearFeet > 0;
  const selectedServices: QuoteInput["selectedServices"] = [];

  if (hasPressureSurface) selectedServices.push("pressure_washing");
  if (form.binsCount > 0) selectedServices.push("trash_can_cleaning");

  return {
    selectedServices,
    frequency: "one_time",
    propertyType: "single_family",
    zip: form.zip,
    drivewaySqft: form.drivewaySqft,
    walkwaySqft: form.walkwaySqft,
    patioSqft: form.patioSqft,
    houseSqft: form.houseSqft,
    fenceLinearFeet: form.fenceLinearFeet,
    binsCount: form.binsCount,
    heavyStainLevel: form.heavyStainLevel,
  };
}

function normalizeForm(body: EstimatorForm): Required<EstimatorForm> {
  return {
    address: String(body.address ?? "Field estimate").slice(0, 120),
    zip: cleanZip(body.zip),
    drivewaySqft: cleanNumber(body.drivewaySqft),
    walkwaySqft: cleanNumber(body.walkwaySqft),
    patioSqft: cleanNumber(body.patioSqft),
    houseSqft: cleanNumber(body.houseSqft),
    fenceLinearFeet: cleanNumber(body.fenceLinearFeet),
    binsCount: Math.min(8, cleanNumber(body.binsCount)),
    heavyStainLevel: cleanStain(body.heavyStainLevel),
    photoUrls: cleanPhotos(body.photoUrls),
  };
}

function fallbackAnalysis(form: Required<EstimatorForm>, note?: string) {
  const quote = buildQuote(buildQuoteInput(form));
  const observations = [
    form.drivewaySqft > 0 ? "Driveway surface included in estimate." : "",
    form.walkwaySqft > 0 ? "Walkway or sidewalk surface included." : "",
    form.patioSqft > 0 ? "Patio surface included." : "",
    form.houseSqft > 0 ? "House wash area included." : "",
    form.fenceLinearFeet > 0 ? "Fence footage included." : "",
    form.heavyStainLevel !== "light" ? `${form.heavyStainLevel === "heavy" ? "Heavy" : "Moderate"} buildup treatment included.` : "",
    quote.serviceArea.allowed ? quote.serviceArea.message : "Manual review needed for service area.",
  ].filter(Boolean);

  return {
    form,
    quote,
    analysis: {
      estimatedMinutes: estimateMinutes(form),
      confidence: form.photoUrls.length > 0 ? 82 : 74,
      observations: note ? [note, ...observations].slice(0, 6) : observations.slice(0, 6),
      suggestedAddOns: ["Sidewalk Cleaning", "Trash Can Cleaning"],
      summary: quote.summary,
    },
    source: "pricing" as const,
  };
}

function estimateMinutes(form: Required<EstimatorForm>) {
  const minutes =
    28 +
    form.drivewaySqft * 0.055 +
    form.walkwaySqft * 0.075 +
    form.patioSqft * 0.07 +
    form.houseSqft * 0.025 +
    form.fenceLinearFeet * 0.55 +
    form.binsCount * 8;

  const multiplier = form.heavyStainLevel === "heavy" ? 1.2 : form.heavyStainLevel === "moderate" ? 1.1 : 1;
  return Math.max(30, Math.round((minutes * multiplier) / 15) * 15);
}

function parseOutputText(payload: unknown) {
  if (payload && typeof payload === "object" && "output_text" in payload) {
    const text = (payload as { output_text?: unknown }).output_text;
    if (typeof text === "string") return text;
  }

  const output = payload && typeof payload === "object" && "output" in payload ? (payload as { output?: unknown }).output : null;
  if (!Array.isArray(output)) return "";

  return output
    .flatMap((item) => {
      if (!item || typeof item !== "object" || !("content" in item)) return [];
      const content = (item as { content?: unknown }).content;
      if (!Array.isArray(content)) return [];
      return content.map((part) => {
        if (!part || typeof part !== "object") return "";
        if ("text" in part && typeof (part as { text?: unknown }).text === "string") return (part as { text: string }).text;
        return "";
      });
    })
    .join("\n");
}

function applyAiResult(form: Required<EstimatorForm>, ai: AiEstimatorResult): Required<EstimatorForm> {
  return {
    ...form,
    drivewaySqft: cleanNumber(ai.drivewaySqft, form.drivewaySqft),
    walkwaySqft: cleanNumber(ai.walkwaySqft, form.walkwaySqft),
    patioSqft: cleanNumber(ai.patioSqft, form.patioSqft),
    houseSqft: cleanNumber(ai.houseSqft, form.houseSqft),
    fenceLinearFeet: cleanNumber(ai.fenceLinearFeet, form.fenceLinearFeet),
    binsCount: Math.min(8, cleanNumber(ai.binsCount, form.binsCount)),
    heavyStainLevel: cleanStain(ai.heavyStainLevel),
  };
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as EstimatorForm;
  const form = normalizeForm(body);

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      fallbackAnalysis(form, "OpenAI is not configured yet, so this estimate uses manual pricing inputs."),
    );
  }

  if (form.photoUrls.length === 0) {
    return NextResponse.json(fallbackAnalysis(form, "Add photos for AI surface detection. Current estimate uses manual inputs."));
  }

  const prompt = [
    "You are estimating exterior cleaning jobs for CURBSIDE EXTERIOR CO. in the Marietta, Georgia area.",
    "Analyze the photos and recommend only measurements/condition fields. Do not invent prices.",
    "Use conservative field-estimate defaults: driveway 300/600/900/1200 sqft, walkway 80/150/250 sqft, patio 150/300/500 sqft, house wash 400/500/800/1800 sqft, fence 60/100/160 linear feet.",
    "Return 0 for surfaces that are not visible or not requested.",
    `Address: ${form.address}. ZIP: ${form.zip}. Current owner inputs: driveway ${form.drivewaySqft} sqft, walkway ${form.walkwaySqft} sqft, patio ${form.patioSqft} sqft, house ${form.houseSqft} sqft, fence ${form.fenceLinearFeet} linear feet, trash cans ${form.binsCount}, buildup ${form.heavyStainLevel}.`,
  ].join("\n");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_ESTIMATOR_MODEL ?? "gpt-5.5",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            ...form.photoUrls.map((url) => ({ type: "input_image", image_url: url })),
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "curbside_estimator_analysis",
          strict: true,
          schema: estimatorSchema,
        },
      },
      max_output_tokens: 1200,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Estimator AI request failed", errorText);
    return NextResponse.json(fallbackAnalysis(form, "AI analysis failed, so this estimate uses manual pricing inputs."));
  }

  try {
    const payload = await response.json();
    const outputText = parseOutputText(payload);
    const ai = JSON.parse(outputText) as AiEstimatorResult;
    const analyzedForm = applyAiResult(form, ai);
    const quote = buildQuote(buildQuoteInput(analyzedForm));

    return NextResponse.json({
      form: analyzedForm,
      quote,
      analysis: {
        estimatedMinutes: Math.max(30, Math.round(ai.estimatedMinutes / 15) * 15),
        confidence: Math.max(50, Math.min(98, Math.round(ai.confidence))),
        observations: ai.observations.slice(0, 6),
        suggestedAddOns: ai.suggestedAddOns.slice(0, 4),
        summary: ai.summary || quote.summary,
      },
      source: "openai" as const,
    });
  } catch (error) {
    console.error("Estimator AI response parse failed", error);
    return NextResponse.json(fallbackAnalysis(form, "AI response could not be parsed, so this estimate uses manual pricing inputs."));
  }
}
