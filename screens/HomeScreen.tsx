// src/screens/HomeScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { useAuthStore } from "../stores/authStores";
import { UserService } from "../services/userService";
import { Budget, BudgetStatus } from "../types/budget";
import { BudgetService } from "../services/budgetServices";
import {
  PlusIcon,
  LogoutIcon,
  DocumentIcon,
  ChevronRightIcon,
  SettingsIcon,
} from "../components/Icons";
import { AlertModal } from "../components/Componentes";

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  CreateBudget: undefined;
  BudgetDetails: { budgetId: string };
};

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Home"
>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const userService = new UserService();
const budgetService = new BudgetService();

export default function HomeScreen({ navigation }: Props) {
  const { user, logout: logoutStore } = useAuthStore();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState();
  const [loadProfile, setLoadProfile] = useState();

  const [modalTitle, setModalTitle] = useState<string>("");
  const [modalMessage, setModalMessage] = useState<string>("");
  const [modalConfirm, setModalConfirm] = useState<() => void>(() => {});
  const [modalCancel, setModalCancel] = useState<() => void>(() => {});
  const [alertVisible, setAlertVisible] = useState(false);

  const loadBudgets = async (isRefreshing = false) => {
    if (!user) return;

    if (!isRefreshing) setLoading(true);

    try {
      const response = await budgetService.fetchUserBudgetsWithItems(user.id);

      if (response.error) {
        setModalTitle("Erro");
        setModalMessage(response.error);
        setModalConfirm(() => () => setAlertVisible(false));
        setAlertVisible(true);
      } else {
        setBudgets(response.budgets);
      }
    } catch (error) {
      setModalTitle("Erro");
      setModalMessage("Erro ao carregar orçamentos");
      setModalConfirm(() => () => setAlertVisible(false));
      setAlertVisible(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await userService.fetchUserProfile(user.id);
        setProfile(data);
        console.log("Profile: ", data);
      } catch (error) {
        console.log("Erro ao buscar profile: ", error);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    loadBudgets();
  }, [user]);

  useEffect(() => {
    setLoadProfile(userService.fetchUserProfile(user.id));
    console.log(loadProfile);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBudgets();
    }, [user]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadBudgets(true);
  };

  const handleCreateBudget = () => {
    console.log("🚀 Navegando para CreateBudget...");
    navigation.navigate("CreateBudget");
  };

  const handleBudgetPress = (budgetId: string) => {
    console.log("📄 Navegando para BudgetDetails:", budgetId);
    navigation.navigate("BudgetDetails", { budgetId });
  };

  const handleSettings = () => {
    console.log("⚙️ Navegando para ProfileSettings...");
    navigation.navigate("ProfileSettings");
  };

  const handleLogout = async () => {
    setModalTitle("Sair");
    setModalMessage("Tem certeza que deseja sair?");
    setModalConfirm(() => async () => {
      await userService.logout();
      logoutStore();
    });
    setModalCancel(() => () => setAlertVisible(false));
    setAlertVisible(true);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status: BudgetStatus): string => {
    switch (status) {
      case BudgetStatus.PENDING:
        return "#F59E0B";
      case BudgetStatus.APPROVED:
        return "#10B981";
      case BudgetStatus.REJECTED:
        return "#EF4444";
      case BudgetStatus.COMPLETED:
        return "#3B82F6";
      default:
        return "#64748B";
    }
  };

  const getStatusText = (status: BudgetStatus): string => {
    switch (status) {
      case BudgetStatus.PENDING:
        return "Pendente";
      case BudgetStatus.APPROVED:
        return "Aprovado";
      case BudgetStatus.REJECTED:
        return "Rejeitado";
      case BudgetStatus.COMPLETED:
        return "Concluído";
      default:
        return status;
    }
  };

  const renderBudgetItem = ({ item }: { item: Budget }) => (
    <TouchableOpacity
      onPress={() => handleBudgetPress(item.id)}
      activeOpacity={0.7}
      style={styles.budgetCardWrapper}
    >
      <BlurView intensity={15} tint="dark" style={styles.budgetCard}>
        <View style={styles.budgetCardInner}>
          <View style={styles.budgetHeader}>
            <View style={styles.budgetInfo}>
              <Text style={styles.budgetTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.budgetClient} numberOfLines={1}>
                {item.client_name}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {getStatusText(item.status)}
              </Text>
            </View>
          </View>

          <View style={styles.budgetFooter}>
            <View style={styles.budgetValue}>
              <Text style={styles.valueLabel}>Valor</Text>
              <Text style={styles.valueText}>
                {formatCurrency(item.total_value)}
              </Text>
            </View>
            <View style={styles.budgetDate}>
              <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
              <ChevronRightIcon size={18} color="#64748B" />
            </View>
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <DocumentIcon size={80} color="#60A5FA" />
      <Text style={styles.emptyTitle}>Nenhum orçamento ainda</Text>
      <Text style={styles.emptyText}>
        Comece criando seu primeiro orçamento para gerenciar seus projetos
      </Text>
      <TouchableOpacity
        style={styles.emptyButtonWrapper}
        onPress={handleCreateBudget}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={["#3B82F6", "#2563EB"]}
          style={styles.emptyButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <PlusIcon size={20} color="#FFFFFF" />
          <Text style={styles.emptyButtonText}>Criar Orçamento</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

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
          <Text style={styles.loadingText}>Carregando orçamentos...</Text>
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
          <View>
            <Text style={styles.greeting}>Olá, {loadProfile.name}</Text>
            <Text style={styles.subtitle}>Gerencie seus orçamentos</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={handleSettings}
              activeOpacity={0.7}
            >
              <SettingsIcon size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <LogoutIcon size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>

      {/* Content */}
      <FlatList
        data={budgets}
        keyExtractor={(item) => item.id}
        renderItem={renderBudgetItem}
        contentContainerStyle={[
          styles.listContent,
          budgets.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
            colors={["#3B82F6"]}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      {budgets.length > 0 && (
        <TouchableOpacity
          style={styles.fabWrapper}
          onPress={handleCreateBudget}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#3B82F6", "#2563EB"]}
            style={styles.fab}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <PlusIcon size={28} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      )}
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
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textTransform: "capitalize",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#94A3B8",
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 24,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  budgetCardWrapper: {
    marginBottom: 16,
  },
  budgetCard: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  budgetCardInner: {
    padding: 20,
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  budgetInfo: {
    flex: 1,
    marginRight: 12,
  },
  budgetTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  budgetClient: {
    fontSize: 14,
    color: "#94A3B8",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  budgetFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  budgetValue: {
    flex: 1,
  },
  valueLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  valueText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#10B981",
  },
  budgetDate: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 13,
    color: "#94A3B8",
    marginRight: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 24,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 15,
    color: "#94A3B8",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  emptyButtonWrapper: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  fabWrapper: {
    position: "absolute",
    right: 24,
    bottom: 24,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },

  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
});
