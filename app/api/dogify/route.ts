import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function buildPrompt(breed: string, hybridLevel: string) {
  const hybridInstructions: Record<string, string> = {
    barely:
      `Keep the person fully human and clearly recognizable. Do not add any dog ears, muzzle, snout, fur patches, or facial structure changes. ` +
      `Do not overlay or superimpose a dog face or dog head onto the person. ` +
      `Only adjust the skin tone, undertones, and subtle warmth/saturation of the human subject so the color palette gently blends toward the natural coat colors of a ${breed}. ` +
      `Preserve the exact human facial structure, eyes, nose, jawline, hairstyle, expression, clothing, pose, background, and lighting. ` +
      `The result should look like the original human portrait with only a barely noticeable breed-inspired color harmonization.`,

    very_mild:
      `Keep the person strongly human and clearly recognizable. Do not add full dog ears or replace the face with a dog face. ` +
      `Preserve the human facial structure, eyes, nose placement, jawline, hairstyle, body proportions, clothing, pose, background, and lighting. ` +
      `First, subtly adjust skin tone and undertones so the portrait gently blends toward the natural color palette of a ${breed}. ` +
      `Then introduce only a very slight muzzle influence: a soft shaping around the nose and mouth area, very gentle contour changes, and faint canine character in the face. ` +
      `The result should still read primarily as a human portrait with very mild dog-inspired influence.`,

    mild:
      `Keep the person mostly human and clearly recognizable. Do not replace the head with a dog's head and do not create a pasted-on dog face effect. ` +
      `Preserve the human face structure, eyes, hairstyle, body proportions, clothing, pose, background, and lighting. ` +
      `First, adjust skin tone and undertones to blend with the natural color palette of a ${breed}. ` +
      `Second, add a mild muzzle influence with more noticeable but still natural shaping around the nose and mouth area. ` +
      `Third, begin making the ears slightly more dog-like in a subtle and believable way, inspired by a ${breed}, while still keeping them largely human and not exaggerated. ` +
      `The result should remain a mostly human portrait with mild breed-inspired facial evolution.`,

    balanced:
      `Create a balanced human-and-${breed} hybrid. Keep the person recognizable and preserve their expression, pose, clothing, and general facial identity. ` +
      `Blend visible dog traits into the human face and styling, including fur texture, ears, and muzzle shaping, but avoid making it a full dog head pasted onto a human body.`,

    strong:
      `Create a strong ${breed}-inspired human hybrid. The person should still be somewhat recognizable, but with prominent canine facial shaping, fur, ears, and breed-specific traits. ` +
      `Keep pose, clothing, and overall composition realistic and coherent.`,

    severe:
      `Create a severe ${breed}-inspired transformation. Push the dog traits much further, with major canine facial features, fur, and structure, while preserving a few identity cues such as expression, clothing, or pose.`,

    extreme:
  `Create an extreme transformation into a mostly ${breed}-like being. The subject should appear largely dog-like, with strong canine facial structure, fur, ears, and breed-specific traits. ` +
  `Extend the transformation beyond the face: add realistic fur texture across the neck and upper chest area, blending naturally into the clothing and body. ` +
  `The fur should follow natural growth direction and lighting, and feel physically integrated into the subject rather than pasted on. ` +
  `Preserve only minimal traces of the original person's identity through pose, expression, or overall composition.`,
  };

  const levelText =
    hybridInstructions[hybridLevel] || hybridInstructions.balanced;

  return (
    `Edit this uploaded portrait. Transform the subject with ${breed}-inspired characteristics. ` +
    `Preserve the original photo composition, pose, framing, clothing, background, and lighting. ` +
    `${levelText} ` +
    `Use clear visual traits associated with a ${breed}. ` +
    `Make the result photorealistic, high quality, believable, detailed, and anatomically coherent.`
  );
}
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image");
    const breed = String(formData.get("breed") || "golden retriever");
    const hybridLevel = String(formData.get("hybridLevel") || "balanced");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No image uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const inputFile = new File([bytes], "input.png", { type: file.type });

    const prompt = buildPrompt(breed, hybridLevel);

    const result = await openai.images.edit({
      model: "gpt-image-1",
      image: inputFile,
      prompt,
      size: "1024x1024",
    });

    const imageBase64 = result.data?.[0]?.b64_json;

    if (!imageBase64) {
      return NextResponse.json(
        { error: "No image was returned" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      image: `data:image/png;base64,${imageBase64}`,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}