// src/screens/HomeScreen.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Pressable,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Svg, { Path, Circle, Rect, G } from "react-native-svg";
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
import { AlertModal, useModal } from "../components/Componentes";

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  CreateBudget: undefined;
  BudgetDetails: { budgetId: string };
  ProfileSettings: undefined;
  CreateClient: undefined;
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

// ---- Ícones inline para o menu ----
const GearIcon = ({ size = 22, color = "#FFFFFF" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const UserIcon = ({ size = 20, color = "#94A3B8" }) => (
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

const ClientIcon = ({ size = 20, color = "#94A3B8" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth="2" />
    <Path
      d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ExitIcon = ({ size = 20, color = "#EF4444" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ---- Componente do Menu Dropdown ----
interface DropdownMenuProps {
  visible: boolean;
  onClose: () => void;
  anchorPosition: { top: number; right: number };
  onProfileSettings: () => void;
  onCreateClient: () => void;
  onLogout: () => void;
}

function DropdownMenu({
  visible,
  onClose,
  anchorPosition,
  onProfileSettings,
  onCreateClient,
  onLogout,
}: DropdownMenuProps) {
  if (!visible) return null;

  const menuItems = [
    {
      label: "Perfil & Configurações",
      icon: <UserIcon size={18} color="#94A3B8" />,
      onPress: onProfileSettings,
      danger: false,
    },
    {
      label: "Criar Cliente",
      icon: <ClientIcon size={18} color="#94A3B8" />,
      onPress: onCreateClient,
      danger: false,
    },
    {
      label: "Sair",
      icon: <ExitIcon size={18} color="#EF4444" />,
      onPress: onLogout,
      danger: true,
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.menuOverlay} onPress={onClose}>
        {/* Seta apontando para o botão */}
        <View
          style={[
            styles.menuArrow,
            { top: anchorPosition.top - 6, right: anchorPosition.right + 11 },
          ]}
        />
        <Pressable
          style={[
            styles.menuContainer,
            { top: anchorPosition.top, right: anchorPosition.right },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <BlurView intensity={40} tint="dark" style={styles.menuBlur}>
            {menuItems.map((item, index) => (
              <React.Fragment key={item.label}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    onClose();
                    setTimeout(item.onPress, 150);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemIcon}>{item.icon}</View>
                  <Text
                    style={[
                      styles.menuItemText,
                      item.danger && styles.menuItemTextDanger,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
                {index < menuItems.length - 1 && (
                  <View style={styles.menuDivider} />
                )}
              </React.Fragment>
            ))}
          </BlurView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ---- Tela Principal ----
export default function HomeScreen({ navigation }: Props) {
  const { user, logout: logoutStore } = useAuthStore();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<{ name: string } | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({ top: 0, right: 0 });

  const gearButtonRef = useRef<View>(null);
  const { showModal, modalProps } = useModal();

  // Recalcula a posição absoluta do botão toda vez que o layout mudar
  const updateMenuAnchor = () => {
    gearButtonRef.current?.measureInWindow((x, y, width, height) => {
      setMenuAnchor({
        top: y + height + 8,
        right: 24,
      });
    });
  };

  const loadBudgets = async (isRefreshing = false) => {
    if (!user) return;

    if (!isRefreshing) setLoading(true);

    try {
      const response = await budgetService.fetchUserBudgetsWithItems(user.id);

      if (response.error) {
        showModal({ title: "Erro", message: response.error });
      } else {
        setBudgets(response.budgets);
      }
    } catch (error) {
      showModal({ title: "Erro", message: "Erro ao carregar orçamentos" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadBudgets();

      const loadUser = async () => {
        try {
          const data = await userService.fetchUserProfile(user.id);
          console.log("Profile:", data.profile);
          setProfile(data.profile);
        } catch (error) {
          console.log("Erro ao buscar profile: ", error);
        }
      };

      loadUser();
    }, [user]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadBudgets(true);
  };

  const handleCreateBudget = () => {
    navigation.navigate("CreateBudget");
  };

  const handleBudgetPress = (budgetId: string) => {
    navigation.navigate("BudgetDetails", { budgetId });
  };

  const handleSettings = () => {
    navigation.navigate("ProfileSettings");
  };

  const handleCreateClient = () => {
    navigation.navigate("CreateClient");
  };

  const handleLogout = async () => {
    showModal({
      title: "Sair",
      message: "Tem certeza que deseja sair?",
      onConfirm: async () => {
        await userService.logout();
        logoutStore();
      },
      onCancel: () => {},
    });
  };

  const handleGearPress = () => {
    updateMenuAnchor();
    setMenuVisible(true);
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
            <Text style={styles.greeting}>Olá, {profile?.name}</Text>
            <Text style={styles.subtitle}>Gerencie seus orçamentos</Text>
          </View>

          {/* Botão engrenagem único */}
          <View ref={gearButtonRef} onLayout={updateMenuAnchor}>
            <TouchableOpacity
              style={[
                styles.gearButton,
                menuVisible && styles.gearButtonActive,
              ]}
              onPress={handleGearPress}
              activeOpacity={0.7}
            >
              <GearIcon size={22} color="#FFFFFF" />
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

      {/* Dropdown Menu */}
      <DropdownMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        anchorPosition={menuAnchor}
        onProfileSettings={handleSettings}
        onCreateClient={handleCreateClient}
        onLogout={handleLogout}
      />

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
  // Botão de engrenagem
  gearButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  gearButtonActive: {
    backgroundColor: "rgba(59, 130, 246, 0.45)",
    borderColor: "rgba(59, 130, 246, 0.8)",
  },
  // Menu Dropdown
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  menuArrow: {
    position: "absolute",
    width: 12,
    height: 12,
    backgroundColor: "rgba(22, 30, 58, 0.97)",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    transform: [{ rotate: "45deg" }],
    zIndex: 10,
  },
  menuContainer: {
    position: "absolute",
    width: 220,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  menuBlur: {
    paddingVertical: 6,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemIcon: {
    width: 28,
    alignItems: "center",
    marginRight: 10,
  },
  menuItemText: {
    fontSize: 15,
    color: "#E2E8F0",
    fontWeight: "500",
  },
  menuItemTextDanger: {
    color: "#EF4444",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginHorizontal: 12,
  },
  // Listas
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
