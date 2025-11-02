import { ElevenLabsClient } from "elevenlabs";

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

/**
 * Generate speech from text using ElevenLabs
 * @param text The text to convert to speech
 * @param voiceId The ElevenLabs voice ID (default: professional male voice)
 * @returns Audio buffer
 */
export async function generateSpeech(
  text: string,
  voiceId: string = "pNInz6obpgDQGcFmaJgB" // Adam - professional male voice
): Promise<Buffer> {
  try {
    console.log(`🎤 Generating speech for text: "${text.substring(0, 50)}..."`);

    const audio = await elevenlabs.generate({
      voice: voiceId,
      text: text,
      model_id: "eleven_monolingual_v1",
    });

    // Convert audio stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);

    console.log(`✅ Speech generated successfully (${audioBuffer.length} bytes)`);
    return audioBuffer;
  } catch (error) {
    console.error("❌ Error generating speech:", error);
    throw new Error(`Speech generation failed: ${error}`);
  }
}

/**
 * Get available ElevenLabs voices
 */
export async function getAvailableVoices() {
  try {
    const voices = await elevenlabs.voices.getAll();
    return voices.voices;
  } catch (error) {
    console.error("❌ Error fetching voices:", error);
    throw new Error(`Failed to fetch voices: ${error}`);
  }
}

/**
 * Voice profiles for different agent types
 */
export const AGENT_VOICES = {
  CTO: "pNInz6obpgDQGcFmaJgB", // Adam - professional, authoritative
  PM: "EXAVITQu4vr4xnSDxMaL", // Bella - clear, professional female
  CEO: "VR6AewLTigWG4xSOukaG", // Arnold - commanding, executive
  CFO: "ErXwobaYiN019PkySvjV", // Antoni - analytical, precise
  GENERAL_COUNSEL: "MF3mGyEYCl7XYWbV9V6O", // Elli - professional, articulate
};
