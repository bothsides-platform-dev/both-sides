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
  const { apiKey, ...rest } = input;

  // If apiKey is provided, encrypt it for storage
  if (apiKey) {
    const encryptedApiKey = encrypt(apiKey);
    return prisma.llmSettings.upsert({
      where: { id: SETTINGS_ID },
      create: {
        id: SETTINGS_ID,
        ...rest,
        apiKey: encryptedApiKey,
        updatedBy: adminUserId,
      },
      update: {
        ...rest,
        apiKey: encryptedApiKey,
        updatedBy: adminUserId,
      },
    });
  }

  // apiKey not provided — check that settings already exist (key is required for first setup)
  const existing = await prisma.llmSettings.findUnique({
    where: { id: SETTINGS_ID },
  });

  if (!existing) {
    throw new Error("최초 설정 시 API 키는 필수입니다.");
  }

  // Update without touching the existing API key
  return prisma.llmSettings.update({
    where: { id: SETTINGS_ID },
    data: {
      ...rest,
      updatedBy: adminUserId,
    },
  });
}

export async function deleteLlmSettings() {
  return prisma.llmSettings.deleteMany({});
}
