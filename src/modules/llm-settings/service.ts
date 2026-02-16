import { prisma } from "@/lib/db";
import { encrypt, decrypt, maskApiKey } from "@/lib/encryption";
import type { UpdateLlmSettingsInput } from "./schema";

const SETTINGS_ID = "default";

export async function getLlmSettings() {
  const settings = await prisma.llmSettings.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (!settings) {
    return null;
  }

  // Decrypt API key before returning
  return {
    ...settings,
    apiKey: decrypt(settings.apiKey),
  };
}

export async function getLlmSettingsForDisplay() {
  const settings = await prisma.llmSettings.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (!settings) {
    return null;
  }

  // Return masked API key for display
  const decrypted = decrypt(settings.apiKey);
  return {
    ...settings,
    apiKey: maskApiKey(decrypted),
  };
}

export async function updateLlmSettings(
  input: UpdateLlmSettingsInput,
  adminUserId: string
) {
  // Encrypt API key before storing
  const encryptedApiKey = encrypt(input.apiKey);

  return prisma.llmSettings.upsert({
    where: { id: SETTINGS_ID },
    create: {
      id: SETTINGS_ID,
      ...input,
      apiKey: encryptedApiKey,
      updatedBy: adminUserId,
    },
    update: {
      ...input,
      apiKey: encryptedApiKey,
      updatedBy: adminUserId,
    },
  });
}

export async function deleteLlmSettings() {
  return prisma.llmSettings.deleteMany({});
}
