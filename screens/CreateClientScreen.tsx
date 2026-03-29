// src/screens/CreateClientScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Svg, { Path, Circle } from "react-native-svg";
import { useAuthStore } from "../stores/authStores";
import { ClientService } from "../services/clientServices";
import { Client } from "../types/client";
import {
  BackIcon,
  UserIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  CheckIcon,
} from "../components/Icons";
import { AlertModal } from "../components/Componentes";

const clientService = new ClientService();

export default function CreateClientScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [saving, setSaving] = useState(false);

  // Estados do formulário
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [modalTitle, setModalTitle] = useState<string>("");
  const [modalMessage, setModalMessage] = useState<string>("");
  const [modalConfirm, setModalConfirm] = useState<() => void>(() => {});
  const [modalCancel, setModalCancel] = useState<() => void>(() => {});
  const [alertVisible, setAlertVisible] = useState(false);

  const formatPhone = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length <= 11) {
      let formatted = cleaned;
      formatted = formatted.replace(/^(\d{2})(\d)/g, "($1) $2");
      formatted = formatted.replace(/(\d)(\d{4})$/, "$1-$2");
      return formatted;
    }
    return phone;
  };

  const handleSave = async () => {
    if (!user) {
      setModalTitle("Erro");
      setModalMessage("Usuário não autenticado");
      setModalConfirm(() => () => setAlertVisible(false));
      setAlertVisible(true);

      return;
    }

    if (!nome.trim()) {
      setModalTitle("Atenção");
      setModalMessage("Por favor, informe o nome do cliente");
      setModalConfirm(() => () => setAlertVisible(false));
      setAlertVisible(true);

      return;
    }

    setSaving(true);

    try {
      const clientData = {
        usuario_id: user.id,
        nome: nome,
        email: email,
        telefone: phone,
        criado_em: user.created_at,
      };

      console.log(user.id);
      const response = await clientService.createClient(clientData);

      if (response.error) {
        setModalTitle("Erro");
        setModalMessage(response.error);
        setModalConfirm(() => () => setAlertVisible(false));
        setAlertVisible(true);

        return;
      }

      setModalTitle("Sucesso");
      setModalMessage("Cliente cadastrado com sucesso!");
      setModalConfirm(() => () => {
        navigation.goBack();
        setAlertVisible(false);
      });
      setAlertVisible(true);
    } catch (error) {
      setModalTitle("Erro");
      setModalMessage("Erro ao cadastrar cliente. Tente novamente.");
      setModalConfirm(() => () => setAlertVisible(false));
      setAlertVisible(true);
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
      >
        {/* Seção: Dados Básicos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Dados Básicos</Text>

          <BlurView intensity={15} tint="dark" style={styles.card}>
            <View style={styles.cardInner}>
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <UserIcon size={16} color="#94A3B8" />
                  <Text style={styles.label}>NOME COMPLETO *</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: João da Silva"
                  placeholderTextColor="#64748B"
                  value={nome}
                  onChangeText={setNome}
                  editable={!saving}
                />
              </View>

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

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <PhoneIcon size={16} color="#94A3B8" />
                  <Text style={styles.label}>TELEFONE (OPCIONAL)</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="(00) 00000-0000"
                  placeholderTextColor="#64748B"
                  value={phone}
                  onChangeText={(text) => setPhone(formatPhone(text))}
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
      <AlertModal
        visible={alertVisible}
        title={modalTitle}
        message={modalMessage}
        onConfirm={() => {
          modalConfirm();
        }}
        onCancel={modalCancel}
      />
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
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
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  inputHalf: {
    flex: 1,
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
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
