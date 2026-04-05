// src/screens/RegisterScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { UserService } from "../services/userService";
import { useAuthStore } from "../stores/authStore";
import {
  ShieldIcon,
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  UserIcon,
} from "../components/Icons";
import { AlertModal, useModal } from "../components/Componentes";

const userService = new UserService();

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { showModal, modalProps } = useModal();

  const validateFields = (): boolean => {
    if (!name.trim()) {
      showModal({ title: "Atenção", message: "Por favor, informe seu nome" });

      return false;
    }

    if (name.trim().length < 3) {
      showModal({
        title: "Atenção",
        message: "O nome deve ter no mínimo 3 caracteres",
      });

      return false;
    }

    if (!email.trim()) {
      showModal({ title: "Atenção", message: "Por favor, informe seu e-mail" });

      return false;
    }

    if (!companyName.trim()) {
      showModal({
        title: "Atenção",
        message: "Por favor, informe o nome da empresa",
      });

      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showModal({
        title: "Atenção",
        message: "Por favor, informe um e-mail válido",
      });

      return false;
    }

    if (!password.trim()) {
      showModal({ title: "Atenção", message: "Por favor, informe sua senha" });

      return false;
    }

    if (password.length < 6) {
      showModal({
        title: "Atenção",
        message: "A senha deve ter no mínimo 6 caracteres",
      });

      return false;
    }

    if (!confirmPassword.trim()) {
      showModal({ title: "Atenção", message: "Por favor, confirme sua senha" });

      return false;
    }

    if (password !== confirmPassword) {
      showModal({ title: "Atenção", message: "As senhas não coincidem" });

      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateFields()) return;

    setLoading(true);

    try {
      const response = await userService.registerWithEmail({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        company_name: companyName.trim(),
        password,
      });

      if (response.error) {
        if (
          response.error.includes("already registered") ||
          response.error.includes("já está cadastrado")
        ) {
          showModal({
            title: "E-mail já cadastrado",
            message: "Este e-mail já está em uso. Tente outro e-mail.",
          });
        } else {
          showModal({ title: "Erro ao criar conta", message: response.error });
        }
      } else if (response.user) {
        showModal({
          title: "Conta criada com sucesso!",
          message:
            "Sua conta foi criada com sucesso. Faça login para continuar.",
          onConfirm: () => {
            navigation.goBack();
          },
        });
      }
    } catch (err) {
      showModal({
        title: "Erro",
        message: "Erro inesperado. Tente novamente.",
      });
    } finally {
      setLoading(false);
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

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <BlurView intensity={20} tint="dark" style={styles.card}>
            <View style={styles.cardInner}>
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={["#3B82F6", "#2563EB"]}
                  style={styles.iconCircle}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <ShieldIcon size={32} color="#FFFFFF" />
                </LinearGradient>
              </View>

              <Text style={styles.title}>Criar Conta</Text>
              <Text style={styles.subtitle}>
                Preencha os dados para começar
              </Text>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>NOME COMPLETO</Text>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIconContainer}>
                      <UserIcon size={20} color="#64748B" />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Digite seu nome"
                      placeholderTextColor="#64748B"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                      editable={!loading}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>EMAIL</Text>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIconContainer}>
                      <MailIcon size={20} color="#64748B" />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="seu@email.com"
                      placeholderTextColor="#64748B"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoComplete="email"
                      editable={!loading}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>EMPRESA</Text>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIconContainer}>
                      <MailIcon size={20} color="#64748B" />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Digite o nome da emrpesa"
                      placeholderTextColor="#64748B"
                      value={companyName}
                      onChangeText={setCompanyName}
                      autoCapitalize="words"
                      editable={!loading}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>SENHA</Text>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIconContainer}>
                      <LockIcon size={20} color="#64748B" />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Mínimo 6 caracteres"
                      placeholderTextColor="#64748B"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoComplete="password-new"
                      editable={!loading}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                      activeOpacity={0.7}
                    >
                      {showPassword ? (
                        <EyeIcon size={20} color="#64748B" />
                      ) : (
                        <EyeOffIcon size={20} color="#64748B" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>CONFIRMAR SENHA</Text>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIconContainer}>
                      <LockIcon size={20} color="#64748B" />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Digite a senha novamente"
                      placeholderTextColor="#64748B"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoComplete="password-new"
                      editable={!loading}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      activeOpacity={0.7}
                    >
                      {showConfirmPassword ? (
                        <EyeIcon size={20} color="#64748B" />
                      ) : (
                        <EyeOffIcon size={20} color="#64748B" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.buttonContainer,
                    loading && styles.buttonDisabled,
                  ]}
                  onPress={handleRegister}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#3B82F6", "#2563EB"]}
                    style={styles.button}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <View style={styles.buttonContent}>
                        <Text style={styles.buttonText}>Criar Conta</Text>
                        <Text style={styles.arrow}>→</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.footer}>
                  <Text style={styles.footerText}>Já tem uma conta? </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("Login")}
                    disabled={loading}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.footerLink}>Fazer Login</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </BlurView>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.5,
    shadowRadius: 50,
    elevation: 20,
  },
  cardInner: {
    padding: 40,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#94A3B8",
    textAlign: "center",
    marginBottom: 32,
  },
  form: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.5,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.2)",
    paddingHorizontal: 18,
    height: 54,
  },
  inputIconContainer: {
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#E2E8F0",
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    marginTop: 12,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0.2,
  },
  button: {
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginRight: 8,
  },
  arrow: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: "#94A3B8",
  },
  footerLink: {
    fontSize: 14,
    color: "#60A5FA",
    fontWeight: "600",
  },
});
