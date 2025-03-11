import { z } from "zod";

const MAX_AUDIO_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_IMAGE_FILE_SIZE = 20 * 1024 * 1024; // 20MB
// lac, mp3, mp4, mpeg, mpga, m4a, ogg, wav,webm
const ACCEPTED_AUDIO_FORMATS = [
  "audio/flac",
  "audio/mpeg",
  "video/mp4",
  "audio/mp4",
  "video/mpeg",
  "audio/aac",
  "audio/ogg",
  "audio/vnd.wav",
  "audio/wav",
  "video/webm",
];

const ACCEPTED_IMAGE_FORMATS = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
];

const ACCEPTED_AUDIO_EXTENSIONS = [
  "flac",
  "mp3",
  "mp4",
  "mpeg",
  "mpga",
  "m4a",
  "ogg",
  "wav",
  "webm",
];

const ACCEPTED_IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp"];

export const conversationSchema = z.object({
  prompt: z.string().min(1, { message: "1文字以上入力してください。" }),
});

export const imageGenarationSchema = z.object({
  prompt: z
    .string()
    .min(1, { message: "1文字以上入力してください。" })
    .max(1000, { message: "1000文字以内で入力してください。" }),
  amount: z.string(),
  size: z.string(),
});

export const textToSpeechSchema = z.object({
  prompt: z
    .string()
    .min(1, { message: "1文字以上入力してください。" })
    .max(4096, { message: "4096文字以内で入力してください。" }),
});

export const speechToTextSchema = z.object({
  file: z
    .instanceof(File, { message: "ファイルを選択してください" })
    .refine((file) => file.size <= MAX_AUDIO_FILE_SIZE, {
      message: "ファイルサイズが20MBを超えています。",
    })
    // ファイルの形式
    .refine(
      (file) => {
        const fileTypeValid = ACCEPTED_AUDIO_FORMATS.includes(file.type);
        const fileExtensionValid = ACCEPTED_AUDIO_EXTENSIONS.includes(
          file.name.split(".").pop()!
        );
        return fileTypeValid && fileExtensionValid;
      },
      {
        message: "対応していないファイルタイプです。",
      }
    ),
});

export const imageAnalysisSchema = z
  .object({
    prompt: z.string(),
    files: z
      .array(
        z
          .instanceof(File, { message: "ファイルを選択してください" })

          // ファイルの形式
          .refine(
            (file) => {
              const fileTypeValid = ACCEPTED_IMAGE_FORMATS.includes(file.type);
              const fileExtensionValid = ACCEPTED_IMAGE_EXTENSIONS.includes(
                file.name.split(".").pop()!
              );
              return fileTypeValid && fileExtensionValid;
            },
            {
              message: "対応していないファイルタイプです。",
            }
          )
      )
      .refine(
        (files) => {
          const totalFileSize = files.reduce((acc, file) => acc + file.size, 0);
          return totalFileSize <= MAX_IMAGE_FILE_SIZE;
        },
        {
          message: "ファイルサイズが20MBを超えています。",
        }
      )
      .optional(),
  })
  .refine((data) => data.prompt || (data.files && data.files.length > 0), {
    message: "promptまたはfilesのどちらか一方は必須です。",
    path: ["prompt", "file"],
  });
