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
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { useAuthStore } from "../stores/authStores";
import { UserService } from "../services/userService";
import {
  LockIcon,
  MailIcon,
  EyeIcon,
  EyeOffIcon,
  ShieldIcon,
} from "../components/Icons";
import { AlertModal, useModal } from "../components/Componentes";

const userService = new UserService();

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { setUser } = useAuthStore();

  const { showModal, modalProps } = useModal();

  const validateFields = (): boolean => {
    if (!email.trim()) {
      showModal({ title: "Atenção", message: "Por favor, informe seu e-mail" });

      return false;
    }

    if (!password.trim()) {
      showModal({ title: "Atenção", message: "Por favor, informe seu senha" });

      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showModal({
        title: "Atenção",
        message: "Por favor, informe um email válido",
      });

      return false;
    }

    if (password.length < 6) {
      showModal({
        title: "Atenção",
        message: "A senha deve ter no mínimo 6 caracteres",
      });

      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateFields()) return;

    setLoading(true);

    try {
      const response = await userService.loginWithEmail({
        email: email.trim().toLowerCase(),
        password,
      });

      if (response.error) {
        console.error("❌ Erro no login:", response.error);
        showModal({
          title: "Erro ao fazer login",
          message: response.error,
        });
      } else if (response.user) {
        // Atualiza o estado global do usuário
        setUser(response.user);
      } else {
        console.warn("⚠️ Resposta sem user e sem error");
        showModal({
          title: "Erro",
          message: "Resposta inesperada do servidor",
        });
      }
    } catch (error: any) {
      console.error("💥 Erro fatal no login:", error);
      showModal({
        title: "Erro",
        message: error?.message || "Erro inesperado. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToRegister = () => {
    navigation.navigate("Register");
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

              <Text style={styles.title}>Bem-vindo de volta</Text>
              <Text style={styles.subtitle}>
                Acesse sua conta para continuar
              </Text>

              <View style={styles.form}>
                {/* Email Input */}
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

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Text style={styles.label}>SENHA</Text>
                    <TouchableOpacity activeOpacity={0.7}>
                      <Text style={styles.forgotLink}>Esqueceu?</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIconContainer}>
                      <LockIcon size={20} color="#64748B" />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor="#64748B"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoComplete="password"
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

                {/* Login Button */}
                <TouchableOpacity
                  style={[
                    styles.buttonContainer,
                    loading && styles.buttonDisabled,
                  ]}
                  onPress={handleLogin}
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
                        <Text style={styles.buttonText}>Entrar</Text>
                        <Text style={styles.arrow}>→</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Register Link */}
                <View style={styles.footer}>
                  <Text style={styles.footerText}>Não tem conta? </Text>
                  <TouchableOpacity
                    onPress={handleNavigateToRegister}
                    disabled={loading}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.footerLink}>Criar agora</Text>
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
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  forgotLink: {
    fontSize: 13,
    color: "#60A5FA",
    fontWeight: "600",
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
