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
  Modal,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Svg, { Path, Circle } from "react-native-svg";
import { BudgetService } from "../services/budgetServices";
import { Budget, BudgetStatus } from "../types/budget";
import { supabase } from "../services/supabase";
import {
  BackIcon,
  EditIcon,
  TrashIcon,
  SaveIcon,
  PlusIcon,
  CheckIcon,
  CloseIcon,
  PhoneIcon,
  MailIcon,
} from "../components/Icons";
import { AlertModal, useModal } from "../components/Componentes";

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
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<BudgetStatus>(BudgetStatus.DRAFT);
  const [budgetItems, setBudgetItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);

  // Item editing states
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [itemUnitPrice, setItemUnitPrice] = useState("");
  const [savingItem, setSavingItem] = useState(false);

  const { showModal, modalProps } = useModal();

  const recalculateBudgetTotalValue = async (budgetId: string) => {
    try {
      const { data: items, error: itemsError } = await supabase
        .from("budget_items")
        .select("total")
        .eq("budget_id", budgetId);

      if (itemsError) throw itemsError;

      const totalValue = (items ?? []).reduce(
        (sum, item) => sum + (item.total ?? 0),
        0,
      );

      const { error: updateError } = await supabase
        .from("budgets")
        .update({ total_value: totalValue })
        .eq("id", budgetId);

      if (updateError) throw updateError;

      return { totalValue, error: null };
    } catch (err: any) {
      return { totalValue: null, error: err.message };
    }
  };

  useEffect(() => {
    loadBudget();
  }, []);

  useEffect(() => {
    async function loadItems() {
      try {
        setLoadingItems(true);

        const items = await budgetService.fetchBudgetItemsByBudgetId(budget.id);

        setBudgetItems(items ?? []);
      } catch (error) {
        console.error("Erro ao carregar itens:", error);
      } finally {
        setLoadingItems(false);
      }
    }

    if (budget?.id) {
      loadItems();
    }
  }, [budget?.id]);

  const loadBudget = async () => {
    setLoading(true);
    try {
      const response = await budgetService.fetchBudgetById(budgetId);
      console.log("📦 Budget retornado:", response);

      if (response.error) {
        showModal({ title: "Erro", message: response.error });

        setLoading(false);
        return;
      }

      if (response.budget) {
        setBudget(response.budget);
        setTitle(response.budget.title || "");
        setClientName(response.budget.client_name);
        setClientPhone(response.budget.client_phone);
        setClientEmail(response.budget.client_email || "");
        setDescription(response.budget.description || "");
        setStatus(response.budget.status);
      }
    } catch (error) {
      showModal({ title: "Erro", message: "Erro ao carregar orçamento" });

      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!budget) return;
    if (!title.trim()) {
      showModal({ title: "Atenção", message: "Por favor, informe um título" });

      return;
    }
    setSaving(true);
    const budgetUpdate = {
      title: title.trim(),
      description: description.trim() || null,
    };
    try {
      const response = await budgetService.updateBudget(
        budget.id,
        budgetUpdate,
      );
      if (response.error) {
        showModal({ title: "Erro", message: response.error });

        return;
      }

      showModal({ title: "Sucesso", message: "Orçamento salvo com sucesso." });

      setEditing(false);
      loadBudget();
    } catch (error) {
      showModal({ title: "Erro", message: "Erro ao salvar orçamento" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    showModal({
      title: "Excluir Orçamento",
      message:
        "Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita.",
      onCancel: () => {},
      onConfirm: async () => {
        try {
          const response = await budgetService.deleteBudget(budgetId);

          if (response.error) {
            showModal({
              title: "Erro",
              message: response.error,
            });
            return;
          }

          showModal({
            title: "Sucesso",
            message: "Orçamento excluído com sucesso!",
            onConfirm: () => navigation.goBack(),
          });
        } catch (error) {
          showModal({
            title: "Erro",
            message: "Erro ao excluir orçamento",
          });
        }
      },
    });
  };

  const handleStatusChange = async (newStatus: BudgetStatus) => {
    if (!budget) return;

    try {
      const response = await budgetService.updateBudgetStatus(
        budget.id,
        newStatus,
      );

      if (response.error) {
        showModal({ title: "Erro", message: response.error });

        return;
      }

      setStatus(newStatus);
      showModal({
        title: "Sucesso",
        message: "Status atualizado com sucesso!",
      });
    } catch (error) {
      showModal({ title: "Erro", message: "Erro ao atualizar status" });
    }
  };

  const openAddItem = () => {
    setEditingItemId(null);
    setItemName("");
    setItemQuantity("");
    setItemUnitPrice("");
    setShowAddItem(true);
  };

  const openEditItem = (item: any) => {
    setEditingItemId(item.id);
    setItemName(item.name);
    setItemQuantity(String(item.quantity));
    setItemUnitPrice(String(item.unit_price));
    setShowAddItem(true);
  };

  const closeItemForm = () => {
    setShowAddItem(false);
    setEditingItemId(null);
    setItemName("");
    setItemQuantity("");
    setItemUnitPrice("");
  };

  const handleSaveItem = async () => {
    if (!budget) return;

    if (!itemName.trim()) {
      showModal({ title: "Atenção", message: "Informe o nome do item" });

      return;
    }
    const qty = parseFloat(itemQuantity);
    const price = parseFloat(itemUnitPrice.replace(",", "."));
    if (isNaN(qty) || qty <= 0) {
      showModal({ title: "Atenção", message: "Informe uma quantidade válida" });

      return;
    }
    if (isNaN(price) || price < 0) {
      showModal({ title: "Atenção", message: "Informe um preço válido" });

      return;
    }

    const total = qty * price;
    setSavingItem(true);

    try {
      if (editingItemId) {
        // Update existing item
        const { error } = await supabase
          .from("budget_items")
          .update({
            name: itemName.trim(),
            quantity: qty,
            unit_price: price,
            total,
          })
          .eq("id", editingItemId);
        if (error) throw error;
      } else {
        // Insert new item
        const { error } = await supabase.from("budget_items").insert([
          {
            budget_id: budget.id,
            name: itemName.trim(),
            quantity: qty,
            unit_price: price,
            total,
          },
        ]);
        if (error) throw error;
      }

      // Reload items
      const items = await budgetService.fetchBudgetItemsByBudgetId(budget.id);
      setBudgetItems(items ?? []);

      await recalculateBudgetTotalValue(budget.id);

      closeItemForm();
    } catch (err: any) {
      showModal({
        title: "Erro",
        message: err.message || "Erro ao salvar item",
      });
    } finally {
      setSavingItem(false);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    showModal({
      title: "Excluir Item",
      message: "Deseja remover este item do orçamento?",
      onCancel: () => {},
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from("budget_items")
            .delete()
            .eq("id", itemId);
          if (error) throw error;
          setBudgetItems((prev: any[]) => prev.filter((i) => i.id !== itemId));

          await recalculateBudgetTotalValue(budget.id);
        } catch (err: any) {
          showModal({
            title: "Erro",
            message: err.message || "Erro ao salvar item",
          });
        }
      },
    });
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
      case BudgetStatus.APPROVED:
        return "#10B981";
      case BudgetStatus.REJECTED:
        return "#EF4444";
      default:
        return "#64748B";
    }
  };

  const getStatusText = (status: BudgetStatus): string => {
    switch (status) {
      case BudgetStatus.APPROVED:
        return "Aprovado";
      case BudgetStatus.REJECTED:
        return "Rejeitado";
      case BudgetStatus.DRAFT:
        return "Pendente";
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
                  closeItemForm();
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
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    editable={!saving}
                  />
                ) : (
                  <Text style={styles.value}>
                    {description || "Sem observações"}
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

        {/* Items Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📦 Itens do Orçamento</Text>
            {editing && (
              <TouchableOpacity
                style={styles.addItemButton}
                onPress={openAddItem}
                activeOpacity={0.7}
              >
                <PlusIcon size={18} color="#FFFFFF" />
                <Text style={styles.addItemButtonText}>Adicionar</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Add/Edit Item Form */}
          {editing && showAddItem && (
            <BlurView
              intensity={15}
              tint="dark"
              style={[styles.card, { marginBottom: 12 }]}
            >
              <View style={styles.cardInner}>
                <Text style={styles.label}>
                  {editingItemId ? "EDITAR ITEM" : "NOVO ITEM"}
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>NOME DO ITEM</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Mão de obra, Material..."
                    placeholderTextColor="#64748B"
                    value={itemName}
                    onChangeText={setItemName}
                    editable={!savingItem}
                  />
                </View>

                <View style={styles.itemFormRow}>
                  <View
                    style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}
                  >
                    <Text style={styles.label}>Quantidade</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      placeholderTextColor="#64748B"
                      value={itemQuantity}
                      onChangeText={setItemQuantity}
                      keyboardType="numeric"
                      editable={!savingItem}
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 2 }]}>
                    <Text style={styles.label}>PREÇO UNIT. (R$)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0,00"
                      placeholderTextColor="#64748B"
                      value={itemUnitPrice}
                      onChangeText={setItemUnitPrice}
                      keyboardType="decimal-pad"
                      editable={!savingItem}
                    />
                  </View>
                </View>

                {itemQuantity && itemUnitPrice ? (
                  <Text style={styles.itemPreviewTotal}>
                    Total:{" "}
                    {formatCurrency(
                      (parseFloat(itemQuantity) || 0) *
                        (parseFloat(itemUnitPrice.replace(",", ".")) || 0),
                    )}
                  </Text>
                ) : null}

                <View style={styles.itemFormActions}>
                  <TouchableOpacity
                    style={styles.cancelItemButton}
                    onPress={closeItemForm}
                    activeOpacity={0.7}
                  >
                    <CloseIcon size={16} color="#94A3B8" />
                    <Text style={styles.cancelItemText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveItemButton}
                    onPress={handleSaveItem}
                    disabled={savingItem}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={["#10B981", "#059669"]}
                      style={styles.saveItemGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      {savingItem ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <>
                          <CheckIcon size={16} color="#FFFFFF" />
                          <Text style={styles.saveItemText}>
                            {editingItemId ? "Atualizar" : "Adicionar"}
                          </Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          )}

          <BlurView intensity={15} tint="dark" style={styles.card}>
            <View style={styles.cardInner}>
              {loadingItems ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : budgetItems.length > 0 ? (
                <>
                  {budgetItems.map((item: any) => (
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

                      {editing && (
                        <View style={styles.itemActions}>
                          <TouchableOpacity
                            style={styles.itemEditBtn}
                            onPress={() => openEditItem(item)}
                            activeOpacity={0.7}
                          >
                            <EditIcon size={15} color="#3B82F6" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.itemDeleteBtn}
                            onPress={() => handleDeleteItem(item.id)}
                            activeOpacity={0.7}
                          >
                            <TrashIcon size={15} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  ))}
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>TOTAL</Text>
                    <Text style={styles.totalValue}>
                      {formatCurrency(
                        budgetItems.reduce(
                          (acc: number, item: any) => acc + item.total,
                          0,
                        ),
                      )}
                    </Text>
                  </View>
                </>
              ) : (
                <Text style={styles.emptyItems}>
                  Nenhum item cadastrado. Toque em "Adicionar" para incluir.
                </Text>
              )}
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addItemButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.4)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addItemButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3B82F6",
  },
  itemFormRow: {
    flexDirection: "row",
  },
  itemPreviewTotal: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
    marginBottom: 16,
    textAlign: "right",
  },
  itemFormActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  cancelItemButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "rgba(148, 163, 184, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.2)",
  },
  cancelItemText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94A3B8",
  },
  saveItemButton: {
    flex: 2,
    borderRadius: 10,
    overflow: "hidden",
  },
  saveItemGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  saveItemText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  itemActions: {
    flexDirection: "row",
    gap: 6,
    marginLeft: 8,
  },
  itemEditBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  itemDeleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    justifyContent: "center",
    alignItems: "center",
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
