// src/screens/LoginScreen.tsx - VERSÃO FUNCIONAL COMPLETA
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
import { loginWithEmail } from "../services/userService";

// Ícones SVG Minimalistas
const LockIcon = ({ size = 20, color = "#64748B" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="5"
      y="11"
      width="14"
      height="10"
      rx="2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const MailIcon = ({ size = 20, color = "#64748B" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="3"
      y="5"
      width="18"
      height="14"
      rx="2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M3 7L12 13L21 7"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const EyeIcon = ({ size = 20, color = "#64748B" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
  </Svg>
);

const EyeOffIcon = ({ size = 20, color = "#64748B" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 3L21 21" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path
      d="M10.5 10.5C10.0353 10.9647 9.75 11.6021 9.75 12.3C9.75 13.6597 10.8403 14.75 12.2 14.75C12.8979 14.75 13.5353 14.4647 14 14"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M6.5 6.5C4.5 8 3 10 2 12C3 14 5 16.5 8 18C10 19 12 19 12 19C12 19 14 19 16 18C17.5 17 18.5 16 19.5 14.5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M14 5.5C13.3 5.2 12.6 5 12 5C9 5 6.5 6.5 5 8.5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const ShieldIcon = ({ size = 32, color = "#FFFFFF" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3L4 6V12C4 16.5 7 20.5 12 21C17 20.5 20 16.5 20 12V6L12 3Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 12L11 14L15 10"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { setUser } = useAuthStore();

  const validateFields = (): boolean => {
    if (!email.trim()) {
      Alert.alert("Atenção", "Por favor, informe seu e-mail");
      return false;
    }

    if (!password.trim()) {
      Alert.alert("Atenção", "Por favor, informe sua senha");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Atenção", "Por favor, informe um e-mail válido");
      return false;
    }

    if (password.length < 6) {
      Alert.alert("Atenção", "A senha deve ter no mínimo 6 caracteres");
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateFields()) return;

    setLoading(true);

    try {
      console.log("🔐 Iniciando login...", { email });

      const response = await loginWithEmail({
        email: email.trim().toLowerCase(),
        password,
      });

      console.log("📩 Resposta do login:", {
        hasUser: !!response.user,
        hasError: !!response.error,
      });

      if (response.error) {
        console.error("❌ Erro no login:", response.error);
        Alert.alert("Erro ao fazer login", response.error);
      } else if (response.user) {
        console.log("✅ Login bem-sucedido!", response.user.email);

        // Atualiza o estado global do usuário
        setUser(response.user);

        // O Navigation detectará a mudança e redirecionará automaticamente
        console.log(
          "🚀 Usuário definido no store, navegação automática ativada"
        );
      } else {
        console.warn("⚠️ Resposta sem user e sem error");
        Alert.alert("Erro", "Resposta inesperada do servidor");
      }
    } catch (error: any) {
      console.error("💥 Erro fatal no login:", error);
      Alert.alert(
        "Erro",
        error?.message || "Erro inesperado. Tente novamente."
      );
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
