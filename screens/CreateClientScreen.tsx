// src/screens/CreateClientScreen.tsx
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
import { useAuthStore } from "../stores/authStores";
import { ClientService } from "../services/clientServices";
import {
  BackIcon,
  UserIcon,
  PhoneIcon,
  MailIcon,
  CheckIcon,
} from "../components/Icons";
import { AlertModal, useModal } from "../components/Componentes";

// Ícone para CNPJ/CPF (documento)
import Svg, { Path, Rect } from "react-native-svg";
const DocIcon = ({ size = 16, color = "#94A3B8" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="4"
      y="2"
      width="16"
      height="20"
      rx="2"
      stroke={color}
      strokeWidth="2"
    />
    <Path
      d="M8 7H16M8 11H16M8 15H12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const clientService = new ClientService();

const formatPhone = (text: string): string => {
  const digits = text.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const formatTaxId = (text: string): string => {
  const digits = text.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 11) {
    // CPF: 000.000.000-00
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9)
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }
  // CNPJ: 00.000.000/0000-00
  if (digits.length <= 12)
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
};

export default function CreateClientScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [saving, setSaving] = useState(false);

  const [nome, setNome] = useState("");
  const [taxId, setTaxId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const { showModal, modalProps } = useModal();

  const handleSave = async () => {
    if (!user) {
      showModal({ title: "Erro", message: "Usuário não autenticado" });

      return;
    }

    if (!nome.trim()) {
      showModal({
        title: "Atenção",
        message: "Por favor, informe o nome do cliente",
      });
      return;
    }

    setSaving(true);
    try {
      const clientData = {
        nome: nome.trim(),
        cpf_cnpj: taxId.trim() || null,
        email: email.trim() || null,
        telefone: phone.trim() || null,
        user_id: user.id,
      };

      const response = await clientService.createClient(clientData);

      if (response.error) {
        showModal({ title: "Erro", message: response.error });
        return;
      }

      showModal({
        title: "Sucesso",
        message: "Cliente cadastrado com sucesso!",
        onConfirm: () => {
          navigation.goBack();
        },
      });
    } catch {
      showModal({
        title: "Erro",
        message: "Erro ao cadastrar cliente. Tente novamente.",
      });
    } finally {
      setSaving(false);
    }
  };

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
          <Text style={styles.headerTitle}>Novo Cliente</Text>
          <View style={styles.backButton} />
        </View>
      </BlurView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Seção: Dados Básicos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Dados do Cliente</Text>
          <Text style={styles.sectionDescription}>
            Preencha as informações do novo cliente
          </Text>

          <BlurView intensity={15} tint="dark" style={styles.card}>
            <View style={styles.cardInner}>
              {/* Nome */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <UserIcon size={16} color="#94A3B8" />
                  <Text style={styles.label}>NOME DO CLIENTE</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: João da Silva"
                  placeholderTextColor="#64748B"
                  value={nome}
                  onChangeText={setNome}
                  autoCapitalize="words"
                  editable={!saving}
                />
              </View>

              {/* CNPJ / CPF */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <DocIcon size={16} color="#94A3B8" />
                  <Text style={styles.label}>CPF / CNPJ</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="00.000.000/0000-00"
                  placeholderTextColor="#64748B"
                  value={taxId}
                  onChangeText={(t) => setTaxId(formatTaxId(t))}
                  keyboardType="numeric"
                  maxLength={18}
                  editable={!saving}
                />
              </View>

              {/* E-mail */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <MailIcon size={16} color="#94A3B8" />
                  <Text style={styles.label}>E-MAIL (OPCIONAL)</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="email@exemplo.com"
                  placeholderTextColor="#64748B"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!saving}
                />
              </View>

              {/* Telefone */}
              <View style={[styles.inputGroup, { marginBottom: 0 }]}>
                <View style={styles.labelRow}>
                  <PhoneIcon size={16} color="#94A3B8" />
                  <Text style={styles.label}>TELEFONE (OPCIONAL)</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="(00) 00000-0000"
                  placeholderTextColor="#64748B"
                  value={phone}
                  onChangeText={(t) => setPhone(formatPhone(t))}
                  keyboardType="phone-pad"
                  maxLength={15}
                  editable={!saving}
                />
              </View>
            </View>
          </BlurView>
        </View>
      </ScrollView>

      {/* Footer */}
      <BlurView intensity={20} tint="dark" style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButtonWrapper, saving && styles.buttonDisabled]}
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
                <Text style={styles.saveButtonText}>Cadastrar Cliente</Text>
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
  container: { flex: 1, backgroundColor: "#0A0E27" },
  gradient: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
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
  scrollView: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 120 },
  section: { marginBottom: 24 },
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
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  saveButtonText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  buttonDisabled: { opacity: 0.5 },
});
