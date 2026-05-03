import { supabase } from "./supabase";
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";

export class StorageService {
  async pickImage(
    userId: string,
  ): Promise<{ logoUrl: string | null; error: string | null }> {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      return { logoUrl: null, error: "Permissão negada para acessar fotos" };
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (result.canceled || !result.assets[0]) {
      return { logoUrl: null, error: null };
    }

    try {
      const image = result.assets[0];

      if (!image.base64) {
        return { logoUrl: null, error: "Não foi possível ler a imagem" };
      }

      const arrayBuffer = decode(image.base64);

      // ✅ Nome do arquivo sem pasta, sem barra
      const fileName = `logo_${userId}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(fileName, arrayBuffer, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // ✅ Pega a URL e loga para conferir
      const { data } = supabase.storage.from("logos").getPublicUrl(fileName);

      const finalUrl = `${data.publicUrl}?t=${Date.now()}`;

      return { logoUrl: finalUrl, error: null };
    } catch (err: any) {
      console.error("Erro ao fazer upload:", err);
      return {
        logoUrl: null,
        error: err.message || "Não foi possível enviar a imagem",
      };
    }
  }
}
