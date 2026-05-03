// src/screens/ClientDetailScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Svg, { Path, Circle } from "react-native-svg";
import { useAuthStore } from "../stores/authStores";
import { ClientService } from "../services/clientServices";
import { AlertModal, useModal } from "../components/Componentes";

const clientService = new ClientService();

// ─── Ícones SVG ──────────────────────────────────────────────────────────────

const BackIcon = ({ size = 24, color = "#FFFFFF" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M5 12L12 19M5 12L12 5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CheckIcon = ({ size = 20, color = "#FFFFFF" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6L9 17L4 12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const TrashIcon = ({ size = 20, color = "#EF4444" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 6H5H21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6L18.1395 19.1552C18.0593 20.1872 17.1998 21 16.1651 21H7.83487C6.80018 21 5.94072 20.1872 5.86047 19.1552L5 6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10 11V17M14 11V17"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const UserIcon = ({ size = 16, color = "#94A3B8" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" />
    <Path
      d="M6 21V19C6 16.7909 7.79086 15 10 15H14C16.2091 15 18 16.7909 18 19V21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const PhoneIcon = ({ size = 16, color = "#94A3B8" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6.62 10.79C8.06 13.62 10.38 15.93 13.21 17.38L15.41 15.18C15.68 14.91 16.08 14.82 16.43 14.94C17.55 15.31 18.76 15.51 20 15.51C20.55 15.51 21 15.96 21 16.51V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z"
      fill={color}
    />
  </Svg>
);

const MailIcon = ({ size = 16, color = "#94A3B8" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 6L12 13L2 6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const DocIcon = ({ size = 16, color = "#94A3B8" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14 2V8H20M16 13H8M16 17H8M10 9H8"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function ClientDetailScreen({ navigation, route }: any) {
  const { user } = useAuthStore();
  const existingClient = route.params?.client ?? null;
  const isEditing = !!existingClient;

  const { showModal, modalProps } = useModal();

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [nome, setNome] = useState(existingClient?.nome ?? "");
  const [cpfCnpj, setCpfCnpj] = useState(existingClient?.cpf_cnpj ?? "");
  const [telefone, setTelefone] = useState(existingClient?.telefone ?? "");
  const [email, setEmail] = useState(existingClient?.email ?? "");

  // ── Salvar ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!user) return;

    if (!nome.trim()) {
      showModal({
        title: "Atenção",
        message: "O nome do cliente é obrigatório.",
      });
      return;
    }

    setSaving(true);

    try {
      const clientData = {
        nome: nome.trim(),
        cpf_cnpj: cpfCnpj.trim() || null,
        telefone: telefone.trim() || null,
        email: email.trim() || null,
        user_id: user.id,
      };

      if (isEditing) {
        const { error } = await clientService.updateClient(
          existingClient.id,
          clientData,
        );
        if (error) {
          showModal({ title: "Erro", message: error });
          return;
        }
      } else {
        const { error } = await clientService.createClient(clientData);
        if (error) {
          showModal({ title: "Erro", message: error });
          return;
        }
      }

      showModal({
        title: "Sucesso",
        message: isEditing
          ? "Cliente atualizado com sucesso!"
          : "Cliente adicionado com sucesso!",
        onConfirm: () => navigation.goBack(),
      });
    } catch (err) {
      showModal({
        title: "Erro",
        message: "Ocorreu um erro inesperado. Tente novamente.",
      });
    } finally {
      setSaving(false);
    }
  };

  // ── Excluir ─────────────────────────────────────────────────────────────────

  const handleDelete = () => {
    showModal({
      title: "Excluir cliente",
      message: `Tem certeza que deseja excluir "${existingClient?.nome}"?\n\nEssa ação não pode ser desfeita.`,
      onConfirm: confirmDelete,
      onCancel: () => {},
    });
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await clientService.deleteClient(existingClient.id);
      if (error) {
        showModal({ title: "Erro", message: error });
        return;
      }
      navigation.goBack();
    } catch (err) {
      showModal({
        title: "Erro",
        message: "Não foi possível excluir o cliente.",
      });
    } finally {
      setDeleting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

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
            style={styles.headerIconBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <BackIcon size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {isEditing ? "Editar Cliente" : "Novo Cliente"}
          </Text>

          {isEditing ? (
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={handleDelete}
              activeOpacity={0.7}
              disabled={deleting || saving}
            >
              {deleting ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <TrashIcon size={22} color="#EF4444" />
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.headerIconBtn} />
          )}
        </View>
      </BlurView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Dados do cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Dados do Cliente</Text>
          <Text style={styles.sectionDescription}>
            Informações básicas e de contato
          </Text>

          <BlurView intensity={15} tint="dark" style={styles.card}>
            <View style={styles.cardInner}>
              {/* Nome */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <UserIcon size={16} color="#94A3B8" />
                  <Text style={styles.label}>NOME *</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Nome completo ou da empresa"
                  placeholderTextColor="#64748B"
                  value={nome}
                  onChangeText={setNome}
                  editable={!saving && !deleting}
                  returnKeyType="next"
                />
              </View>

              {/* CPF / CNPJ */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <DocIcon size={16} color="#94A3B8" />
                  <Text style={styles.label}>CPF / CNPJ</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  placeholderTextColor="#64748B"
                  value={cpfCnpj}
                  onChangeText={setCpfCnpj}
                  keyboardType="numeric"
                  editable={!saving && !deleting}
                />
              </View>

              {/* Telefone */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <PhoneIcon size={16} color="#94A3B8" />
                  <Text style={styles.label}>TELEFONE</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="(00) 00000-0000"
                  placeholderTextColor="#64748B"
                  value={telefone}
                  onChangeText={setTelefone}
                  keyboardType="phone-pad"
                  editable={!saving && !deleting}
                />
              </View>

              {/* E-mail */}
              <View style={[styles.inputGroup, { marginBottom: 0 }]}>
                <View style={styles.labelRow}>
                  <MailIcon size={16} color="#94A3B8" />
                  <Text style={styles.label}>E-MAIL</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="cliente@exemplo.com"
                  placeholderTextColor="#64748B"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!saving && !deleting}
                />
              </View>
            </View>
          </BlurView>
        </View>
      </ScrollView>

      {/* Footer */}
      <BlurView intensity={20} tint="dark" style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.saveButtonWrapper,
            (saving || deleting) && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={saving || deleting}
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
                <Text style={styles.saveButtonText}>
                  {isEditing ? "Salvar Alterações" : "Adicionar Cliente"}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </BlurView>

      <AlertModal {...modalProps} />
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0E27" },
  gradient: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
  orb1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(59, 130, 246, 0.12)",
    top: -80,
    right: -80,
    opacity: 0.7,
  },
  orb2: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    bottom: -60,
    left: -60,
    opacity: 0.7,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 120 },
  section: { marginBottom: 28 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  sectionDescription: {
    fontSize: 13,
    color: "#94A3B8",
    marginBottom: 14,
    lineHeight: 20,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  cardInner: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  labelRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
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
  },
  textArea: { minHeight: 100, paddingTop: 14, textAlignVertical: "top" },
  dangerCard: {
    borderColor: "rgba(239, 68, 68, 0.2)",
    backgroundColor: "rgba(239, 68, 68, 0.05)",
  },
  dangerRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  dangerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#EF4444",
    marginBottom: 4,
  },
  dangerSubtitle: { fontSize: 13, color: "#64748B", lineHeight: 18 },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  dangerButtonText: { fontSize: 14, fontWeight: "700", color: "#EF4444" },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
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
  saveButtonDisabled: { opacity: 0.6 },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  saveButtonText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
});
