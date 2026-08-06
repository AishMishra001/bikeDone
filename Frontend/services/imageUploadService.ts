import { Platform } from "react-native";
import { vmsApi } from "./api";

export interface ImageAsset {
  uri: string;
  fileName?: string;
  mimeType?: string;
}

/**
 * Upload image files to Cloudinary via the backend.
 * Returns a list of secure Cloudinary URLs.
 *
 * On React Native: uses the { uri, name, type } object that RN's fetch understands.
 * On Web: fetches the data URL as a Blob so the browser's FormData works correctly.
 */
export async function uploadServiceImages(images: ImageAsset[]): Promise<string[]> {
  const formData = new FormData();

  for (const image of images) {
    const fileName = image.fileName || `photo_${Date.now()}.jpg`;
    const mimeType = image.mimeType || "image/jpeg";

    if (Platform.OS === "web") {
      // On web, convert the data URI / object URL to a real Blob
      const response = await fetch(image.uri);
      const blob = await response.blob();
      const file = new File([blob], fileName, { type: mimeType });
      formData.append("files", file);
    } else {
      // React Native: pass the { uri, name, type } shape
      formData.append("files", {
        uri: image.uri,
        name: fileName,
        type: mimeType,
      } as any);
    }
  }

  return vmsApi.upload<string[]>("/service-requests/upload-images", formData);
}
