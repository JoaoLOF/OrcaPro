// src/screens/BudgetDetailsScreen.tsx
import React, { useState, useEffect } from "react";
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
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Svg, { Path, Circle } from "react-native-svg";
import { BudgetService } from "../services/budgetServices";
import { Budget, BudgetStatus } from "../types/budget";
import { supabase } from "../services/supabase";

type RootStackParamList = {
  Home: undefined;
  BudgetDetails: { budgetId: string };
};

type BudgetDetailsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "BudgetDetails"
>;

type BudgetDetailsScreenRouteProp = RouteProp<
  RootStackParamList,
  "BudgetDetails"
>;

interface Props {
  navigation: BudgetDetailsScreenNavigationProp;
  route: BudgetDetailsScreenRouteProp;
}

// Ícones SVG
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

const EditIcon = ({ size = 20, color = "#FFFFFF" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 4H4C3.46957 4 3 4.46957 3 5V20C3 20.5304 3.46957 21 4 21H19C19.5304 21 20 20.5304 20 20V13"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z"
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
      d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SaveIcon = ({ size = 20, color = "#FFFFFF" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 21H5C4.46957 21 4 20.5304 4 20V4C4 3.46957 4.46957 3 5 3H16L20 7V20C20 20.5304 19.5304 21 19 21Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M17 21V13H7V21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7 3V7H15"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CloseIcon = ({ size = 20, color = "#FFFFFF" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6L18 18"
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
      d="M22 16.92V19.92C22 20.4696 21.5523 20.9167 21.0044 20.9201C18.6565 20.9557 16.3654 20.3527 14.35 19.18C12.4645 18.0781 10.8662 16.4798 9.76451 14.5943C8.58979 12.5744 7.9868 10.2785 8.02282 7.92564C8.02626 7.37855 8.47243 6.93077 9.02001 6.93077H12.02C12.5677 6.93077 13.02 7.38308 13.02 7.93077C13.02 9.02564 13.22 10.0897 13.59 11.0872C13.73 11.4897 13.59 11.9436 13.25 12.2051L11.38 13.3077C12.5104 15.3654 14.1346 16.9897 16.1923 18.1201L17.2949 16.2513C17.5564 15.9115 18.0103 15.7718 18.4128 15.9128C19.4103 16.2821 20.4744 16.4821 21.5692 16.4821C22.1169 16.4821 22.5692 16.9344 22.5692 17.4821V19.92H22Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
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

const budgetService = new BudgetService();

export default function BudgetDetailsScreen({ navigation, route }: Props) {
  const { budgetId } = route.params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [budget, setBudget] = useState<Budget | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [observations, setObservations] = useState("");
  const [status, setStatus] = useState<BudgetStatus>(BudgetStatus.PENDING);

  const {
    data: budgetItems,
    error,
  } = (async) =>
    supabase.from("budget_items").select("*").eq("budget_id", budgetId);

  useEffect(() => {
    loadBudget();
  }, [budgetId]);

  const loadBudget = async () => {
    setLoading(true);
    try {
      const response = await budgetService.fetchBudgetById(budgetId);
      console.log("📦 Budget retornado:", response);

      if (response.error) {
        Alert.alert("Erro", response.error);
        setLoading(false);
        return;
      }

      if (response.budget) {
        setBudget(response.budget);
        setTitle(response.budget.title || "");
        setClientName(response.budget.client_name);
        setClientPhone(response.budget.client_phone);
        setClientEmail(response.budget.client_email || "");
        setObservations(response.budget.observations || "");
        setStatus(response.budget.status);
      }
    } catch (error) {
      Alert.alert("Erro", "Erro ao carregar orçamento");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!budget) return;

    if (!title.trim()) {
      Alert.alert("Atenção", "Por favor, informe um título");
      return;
    }

    if (!clientName.trim()) {
      Alert.alert("Atenção", "Por favor, informe o nome do cliente");
      return;
    }

    setSaving(true);

    try {
      const response = await budgetService.updateBudget(budget.id, {
        title: title.trim(),
        client_name: clientName.trim(),
        client_phone: clientPhone.trim(),
        client_email: clientEmail.trim() || null,
        observations: observations.trim() || null,
        status,
      });

      if (response.error) {
        Alert.alert("Erro", response.error);
        return;
      }

      Alert.alert("Sucesso", "Orçamento atualizado com sucesso!");
      setEditing(false);
      loadBudget();
    } catch (error) {
      Alert.alert("Erro", "Erro ao salvar orçamento");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Excluir Orçamento",
      "Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await budgetService.deleteBudget(budgetId);

              if (response.error) {
                Alert.alert("Erro", response.error);
                return;
              }

              Alert.alert("Sucesso", "Orçamento excluído com sucesso!", [
                { text: "OK", onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              Alert.alert("Erro", "Erro ao excluir orçamento");
            }
          },
        },
      ],
    );
  };

  const handleStatusChange = async (newStatus: BudgetStatus) => {
    if (!budget) return;

    try {
      const response = await budgetService.updateBudgetStatus(
        budget.id,
        newStatus,
      );

      if (response.error) {
        Alert.alert("Erro", response.error);
        return;
      }

      setStatus(newStatus);
      Alert.alert("Sucesso", "Status atualizado com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Erro ao atualizar status");
    }
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
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
          <Text style={styles.loadingText}>Carregando orçamento...</Text>
        </View>
      </View>
    );
  }

  if (!budget) {
    return null;
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

          <Text style={styles.headerTitle}>Detalhes do Orçamento</Text>

          <View style={styles.headerActions}>
            {!editing ? (
              <>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setEditing(true)}
                  activeOpacity={0.7}
                >
                  <EditIcon size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDelete}
                  activeOpacity={0.7}
                >
                  <TrashIcon size={20} color="#EF4444" />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setEditing(false);
                  loadBudget();
                }}
                activeOpacity={0.7}
              >
                <CloseIcon size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </BlurView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Status do Orçamento</Text>
          <BlurView intensity={15} tint="dark" style={styles.card}>
            <View style={styles.cardInner}>
              <View style={styles.statusContainer}>
                {Object.values(BudgetStatus).map((statusOption) => (
                  <TouchableOpacity
                    key={statusOption}
                    style={[
                      styles.statusOption,
                      status === statusOption && {
                        backgroundColor: getStatusColor(statusOption),
                      },
                    ]}
                    onPress={() => !editing && handleStatusChange(statusOption)}
                    activeOpacity={0.7}
                    disabled={editing}
                  >
                    <Text
                      style={[
                        styles.statusOptionText,
                        status === statusOption &&
                          styles.statusOptionTextActive,
                      ]}
                    >
                      {getStatusText(statusOption)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </BlurView>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Informações Gerais</Text>
          <BlurView intensity={15} tint="dark" style={styles.card}>
            <View style={styles.cardInner}>
              {/* Título */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>TÍTULO</Text>
                {editing ? (
                  <TextInput
                    style={styles.input}
                    placeholder="Título do orçamento"
                    placeholderTextColor="#64748B"
                    value={title}
                    onChangeText={setTitle}
                    editable={!saving}
                  />
                ) : (
                  <Text style={styles.value}>{title || "Sem título"}</Text>
                )}
              </View>

              {/* Observações */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>OBSERVAÇÕES</Text>
                {editing ? (
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Observações sobre o orçamento"
                    placeholderTextColor="#64748B"
                    value={observations}
                    onChangeText={setObservations}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    editable={!saving}
                  />
                ) : (
                  <Text style={styles.value}>
                    {observations || "Sem observações"}
                  </Text>
                )}
              </View>

              {/* Data de criação */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>DATA DE CRIAÇÃO</Text>
                <Text style={styles.value}>
                  {formatDate(budget.created_at)}
                </Text>
              </View>
            </View>
          </BlurView>
        </View>

        {/* Client Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Dados do Cliente</Text>
          <BlurView intensity={15} tint="dark" style={styles.card}>
            <View style={styles.cardInner}>
              {/* Nome */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <UserIcon size={16} color="#94A3B8" />
                  <Text style={styles.label}>NOME</Text>
                </View>
                {editing ? (
                  <TextInput
                    style={styles.input}
                    placeholder="Nome do cliente"
                    placeholderTextColor="#64748B"
                    value={clientName}
                    onChangeText={setClientName}
                    editable={!saving}
                  />
                ) : (
                  <Text style={styles.value}>{clientName}</Text>
                )}
              </View>

              {/* Telefone */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <PhoneIcon size={16} color="#94A3B8" />
                  <Text style={styles.label}>TELEFONE</Text>
                </View>
                {editing ? (
                  <TextInput
                    style={styles.input}
                    placeholder="(00) 00000-0000"
                    placeholderTextColor="#64748B"
                    value={clientPhone}
                    onChangeText={setClientPhone}
                    keyboardType="phone-pad"
                    editable={!saving}
                  />
                ) : (
                  <Text style={styles.value}>{clientPhone}</Text>
                )}
              </View>

              {/* E-mail */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <MailIcon size={16} color="#94A3B8" />
                  <Text style={styles.label}>E-MAIL</Text>
                </View>
                {editing ? (
                  <TextInput
                    style={styles.input}
                    placeholder="cliente@email.com"
                    placeholderTextColor="#64748B"
                    value={clientEmail}
                    onChangeText={setClientEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!saving}
                  />
                ) : (
                  <Text style={styles.value}>
                    {clientEmail || "Não informado"}
                  </Text>
                )}
              </View>
            </View>
          </BlurView>
        </View>

        {/* Items Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Itens do Orçamento</Text>

          <BlurView intensity={15} tint="dark" style={styles.card}>
            <View style={styles.cardInner}>
              {budgetItems && budgetItems.length > 0 ? (
                budgetItems.map((item, index) => (
                  <View key={item.id} style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemDetails}>
                        {item.quantity}x {formatCurrency(item.unit_price)}
                      </Text>
                    </View>

                    <Text style={styles.itemTotal}>
                      {formatCurrency(item.total)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyItems}>Nenhum item cadastrado</Text>
              )}

              {/* Total */}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TOTAL</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(budget.total_value)}
                </Text>
              </View>
            </View>
          </BlurView>
        </View>
      </ScrollView>

      {/* Save Button */}
      {editing && (
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
              colors={["#10B981", "#059669"]}
              style={styles.saveButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <SaveIcon size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Salvar Alterações</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </BlurView>
      )}
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    flex: 1,
    textAlign: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(148, 163, 184, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.4)",
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
    marginBottom: 12,
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
  statusContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.2)",
  },
  statusOptionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94A3B8",
  },
  statusOptionTextActive: {
    color: "#FFFFFF",
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
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
    textAlignVertical: "top",
  },
  value: {
    fontSize: 15,
    color: "#E2E8F0",
    lineHeight: 22,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#E2E8F0",
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 13,
    color: "#94A3B8",
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#10B981",
    marginLeft: 12,
  },
  emptyItems: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    fontStyle: "italic",
    paddingVertical: 20,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 1,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#10B981",
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
    shadowColor: "#10B981",
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
