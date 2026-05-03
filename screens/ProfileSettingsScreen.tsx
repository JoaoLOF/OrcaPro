import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  Settings,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import * as ImagePicker from "expo-image-picker";
import { useAuthStore } from "../stores/authStores";
import { UserService } from "../services/userService";
import UpdateProfileData from "../types/profile";
import { SettingsData } from "../types/settings";
import {
  UserIcon,
  PhoneIcon,
  ImageIcon,
  PaletteIcon,
  InfoIcon,
  BackIcon,
  CheckIcon,
} from "../components/Icons";
import { AlertModal, useModal } from "../components/Componentes";
import { StorageService } from "../services/storageServices";

const userService = new UserService();
const storageServices = new StorageService();

export default function ProfileSettingsScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estados do formulário
  const [userName, setUserName] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [logoUrl, setlogoUrl] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#3b83f6b9");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [taxId, setTaxId] = useState("");
  const [documentFooter, setDocumentFooter] = useState("");

  const { showModal, modalProps } = useModal();

  const colorPalette = [
    "#3b83f6b9", // Azul
    "#10b981c5", // Verde
    "#f59f0bb9", // Amarelo
    "#ef4444b6", // Vermelho
    "#8a5cf6b9", // Roxo
    "#ec489ab7", // Rosa
    "#06b5d4bd", // Ciano
    "#f97416b4", // Laranja
  ];

  useEffect(() => {
    loadProfile();
    loadSetting();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await userService.fetchUserProfile(user.id);

      if (response.profile) {
        setUserName(response.profile.name || "");
        setTelefone(response.profile.phone || "");
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSetting = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await userService.fetchUserSettings(user.id);
      console.log("🖼️ logo_url do banco:", response.setting?.logo_url);

      if (response.setting) {
        setEmpresa(response.setting.company_name || "");
        setPrimaryColor(response.setting.color_primary || "#3b83f6b9");

        // ✅ Adiciona timestamp para evitar cache
        const savedUrl = response.setting.logo_url;
        if (savedUrl) {
          // Remove timestamp antigo se houver e adiciona novo
          const cleanUrl = savedUrl.split("?")[0];
          setlogoUrl(`${cleanUrl}?t=${Date.now()}`);
        } else {
          setlogoUrl(null);
        }

        setDocumentFooter(response.setting.document_footer || "");
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    } finally {
      setLoading(false);
    }
  };

  const pickDocumentFooter = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      showModal({
        title: "Permissão necessária",
        message: "Precisamos de permissão para acessar suas fotos",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 1],
      quality: 0.8,
    });
  };

  const handleSave = async () => {
    if (!user) return;

    if (!userName.trim()) {
      showModal({
        title: "Atenção",
        message: "Por favor, informe seu nome",
      });

      return;
    }

    if (!empresa.trim()) {
      showModal({
        title: "Atenção",
        message: "Por favor, informe o nome da empresa",
      });

      return;
    }

    setSaving(true);

    try {
      const profilesData = {
        id: user.id,
        name: userName.trim(),
        phone: telefone,
      };

      const settingsData = {
        user_id: user.id,
        company_name: empresa.trim(),
        color_primary: primaryColor,
        logo_url: logoUrl ? logoUrl.split("?")[0] : null,
        document_footer: documentFooter.trim(),
      };

      const response = await userService.updateUserProfile(
        profilesData,
        settingsData,
      );

      if (response.error) {
        showModal({
          title: "Erro",
          message: response.error,
        });

        return;
      }
      showModal({
        title: "Sucesso",
        message: "Configurações salvas com sucesso!",
        onConfirm: async () => {
          navigation.goBack();
        },
      });
    } catch (error) {
      console.error("Erro ao salvar:", error);
      showModal({
        title: "Erro",
        message: "Erro ao salvar configurações. Tente novamente.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePickImage = async () => {
    if (!user) return;

    const { logoUrl: newUrl, error } = await storageServices.pickImage(user.id);

    if (error) {
      showModal({ title: "Erro", message: error });
      return;
    }

    if (newUrl) {
      setlogoUrl(newUrl);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={["#0A0E27", "#1A1F3A", "#0F172A"]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Carregando configurações...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0A0E27", "#1A1F3A", "#0F172A"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.orb1} />
      <View style={styles.orb2} />

      {/* Header */}
      <BlurView intensity={20} tint="dark" style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <BackIcon size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Configurações de Perfil</Text>
          <View style={styles.backButton} />
        </View>
      </BlurView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Seção: Dados Pessoais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Dados Pessoais</Text>
          <Text style={styles.sectionDescription}>
            Suas informações de usuário
          </Text>

          <BlurView intensity={15} tint="dark" style={styles.card}>
            <View style={styles.cardInner}>
              {/* Nome do Usuário */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <UserIcon size={16} color="#94A3B8" />
                  <Text style={styles.label}>SEU NOME *</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Digite seu nome completo"
                  placeholderTextColor="#64748B"
                  value={userName}
                  onChangeText={setUserName}
                  editable={!saving}
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <PhoneIcon size={16} color="#94A3B8" />
                  <Text style={styles.label}>SEU TELEFONE</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Digite seu telefone"
                  placeholderTextColor="#64748B"
                  value={telefone}
                  onChangeText={setTelefone}
                  editable={!saving}
                />
              </View>
            </View>
          </BlurView>
        </View>

        {/* Seção: Identidade Visual */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Identidade Visual</Text>
          <Text style={styles.sectionDescription}>
            Personalize como seus orçamentos serão exibidos
          </Text>

          <BlurView intensity={15} tint="dark" style={styles.card}>
            <View style={styles.cardInner}>
              {/* Nome da Empresa */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <UserIcon size={16} color="#94A3B8" />
                  <Text style={styles.label}>NOME DA EMPRESA *</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Digite o nome da sua empresa"
                  placeholderTextColor="#64748B"
                  value={empresa}
                  onChangeText={setEmpresa}
                  editable={!saving}
                />
              </View>
              {/* avatar */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <ImageIcon size={16} color="#94A3B8" />
                  <Text style={styles.label}>AVATAR DA EMPRESA</Text>
                </View>
                <TouchableOpacity
                  style={styles.avatarButton}
                  onPress={handlePickImage}
                  activeOpacity={0.7}
                  disabled={saving}
                >
                  {logoUrl ? (
                    <Image
                      source={{ uri: logoUrl }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <ImageIcon size={32} color="#64748B" />
                      <Text style={styles.avatarPlaceholderText}>
                        Adicionar avatar
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                <Text style={styles.hint}>
                  Recomendado: Imagem quadrada (PNG com fundo transparente)
                </Text>
              </View>
              {/* Rodapé do Documento */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <ImageIcon size={16} color="#94A3B8" />
                  <Text style={styles.label}>RODAPÉ DO DOCUMENTO</Text>
                </View>

                <TextInput
                  style={[styles.input, styles.textArea, { marginTop: 10 }]}
                  placeholder="Escreva um texto de rodapé (ex: obrigado pela preferência!)"
                  placeholderTextColor="#64748B"
                  value={documentFooter}
                  onChangeText={setDocumentFooter}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  editable={!saving}
                />
                <Text style={styles.hint}>
                  Recomendado: Imagem horizontal (ex: banner 600x120px)
                </Text>
              </View>
              {/* Cor Principal */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <PaletteIcon size={16} color="#94A3B8" />
                  <Text style={styles.label}>COR PRINCIPAL</Text>
                </View>
                <View style={styles.colorPalette}>
                  {colorPalette.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        primaryColor === color && styles.colorOptionSelected,
                      ]}
                      onPress={() => setPrimaryColor(color)}
                      activeOpacity={0.7}
                      disabled={saving}
                    >
                      {primaryColor === color && (
                        <CheckIcon size={16} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.colorPreview}>
                  <View
                    style={[
                      styles.colorPreviewBox,
                      { backgroundColor: primaryColor },
                    ]}
                  />
                  <Text style={styles.colorPreviewText}>{primaryColor}</Text>
                </View>
              </View>
            </View>
          </BlurView>
        </View>

        {/* Preview Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pré-visualização</Text>
          <BlurView intensity={15} tint="dark" style={styles.card}>
            <View style={styles.previewCard}>
              <LinearGradient
                colors={[primaryColor, primaryColor]}
                style={styles.previewHeader}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {/* ✅ Wrapper circular com overflow hidden */}
                <View style={styles.previewAvatarWrapper}>
                  {logoUrl ? (
                    <Image
                      source={{ uri: logoUrl, cache: "reload" }}
                      style={styles.previewAvatar}
                    />
                  ) : (
                    <View style={styles.previewAvatarPlaceholder}>
                      <ImageIcon size={24} color="#FFFFFF" />
                    </View>
                  )}
                </View>

                <Text style={styles.previewempresa}>
                  {empresa || "Nome da Empresa"}
                </Text>
              </LinearGradient>

              <View style={styles.previewBody}>
                <Text style={styles.previewLabel}>Assim seus PDFs ficarão</Text>
              </View>
            </View>
          </BlurView>
        </View>
      </ScrollView>

      {/* Footer - Botão Salvar */}
      <BlurView intensity={20} tint="dark" style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.saveButtonWrapper,
            saving && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#3B82F6", "#2563EB"]}
            style={styles.saveButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <CheckIcon size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Salvar Configurações</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </BlurView>
      <AlertModal {...modalProps} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0E27",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  orb1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    top: -100,
    right: -100,
    opacity: 0.6,
  },
  orb2: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    bottom: -80,
    left: -80,
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: "#94A3B8",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#94A3B8",
    marginBottom: 16,
    lineHeight: 20,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  cardInner: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginLeft: 8,
  },
  input: {
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#E2E8F0",
    marginBottom: 5,
  },
  textArea: {
    minHeight: 40,
    paddingTop: 14,
    textAlignVertical: "top",
  },
  hint: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 8,
    fontStyle: "italic",
  },
  avatarButton: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(148, 163, 184, 0.3)",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  avatarPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.4)",
  },
  avatarPlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: "#94A3B8",
  },
  footerButton: {
    width: "100%",
    height: 90,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(148, 163, 184, 0.3)",
    overflow: "hidden",
  },
  footerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  footerPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
  },
  footerPlaceholderText: {
    fontSize: 14,
    color: "#94A3B8",
  },
  removeFooterButton: {
    marginTop: 8,
    alignSelf: "flex-end",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  removeFooterText: {
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "600",
  },
  colorPalette: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorOptionSelected: {
    borderColor: "#FFFFFF",
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  colorPreview: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    padding: 12,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    borderRadius: 8,
  },
  colorPreviewBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginRight: 12,
  },
  colorPreviewText: {
    fontSize: 14,
    color: "#E2E8F0",
    fontWeight: "600",
  },
  previewCard: {
    overflow: "hidden",
  },
  previewHeader: {
    padding: 24,
    alignItems: "center", // ✅ centraliza tudo
    justifyContent: "center",
    gap: 12,
  },
  previewAvatarWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36, // ✅ círculo perfeito
    overflow: "hidden", // ✅ corta a imagem no círculo
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.4)",
  },
  previewAvatar: {
    width: "100%",
    height: "100%",
    resizeMode: "cover", // ✅ preenche sem distorcer
  },
  previewAvatarPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  previewempresa: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center", // ✅ centraliza o texto
  },
  previewBody: {
    padding: 20,
    alignItems: "center",
  },
  previewLabel: {
    fontSize: 13,
    color: "#94A3B8",
    fontStyle: "italic",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
  },
  saveButtonWrapper: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
