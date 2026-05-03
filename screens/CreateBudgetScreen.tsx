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
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { useAuthStore } from "../stores/authStores";
import { BudgetService } from "../services/budgetServices";
import { ClientService } from "../services/clientServices";
import { BudgetStatus, Budget, BudgetItem } from "../types/budget";
import { Client } from "../types/client";
import { unmountComponentAtNodeAndRemoveContainer } from "react-native/types_generated/Libraries/ReactNative/RendererImplementation";
import {
  FileIcon,
  BackIcon,
  UserIcon,
  PhoneIcon,
  MailIcon,
  PlusIcon,
  TrashIcon,
  SaveIcon,
  SearchIcon,
  UsersIcon,
} from "../components/Icons";
import { AlertModal, useModal } from "../components/Componentes";

const budgetService = new BudgetService();
const clientService = new ClientService();

export default function CreateBudgetScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Estados do formulário
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [budgetTitle, setBudgetTitle] = useState("");
  const [observations, setObservations] = useState("");
  const [items, setItems] = useState<any[]>([]);

  const { showModal, modalProps } = useModal();

  const currentDate = new Date().toLocaleDateString("pt-BR");

  // Carregar clientes ao abrir o modal
  useEffect(() => {
    if (showClientModal && user) {
      loadClients();
    }
  }, [showClientModal, user]);

  const loadClients = async () => {
    if (!user) return;

    setLoadingClients(true);
    try {
      console.log("🔍 user.id sendo usado:", user.id);
      const response = await clientService.fetchUserClients(user.id);
      console.log("📦 response completo:", JSON.stringify(response));
      if (response.error) {
        showModal({ title: "Erro", message: response.error });
      } else {
        setClients(response.clients);
      }
    } catch (error) {
      showModal({ title: "Erro", message: "Erro ao carregar clientes" });
    } finally {
      setLoadingClients(false);
    }
  };

  const selectClient = (client: Client) => {
    setClientName(client.nome);
    setClientPhone(client.telefone || "");
    setClientEmail(client.email || "");
    setShowClientModal(false);
    setSearchQuery("");
  };

  const filteredClients = clients.filter(
    (client) =>
      client.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.email &&
        client.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (client.telefone && client.telefone.includes(searchQuery)),
  );

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        name: "",
        quantity: "",
        unit_price: "",
        total: 0,
      },
    ]);
  };

  const removeItem = (id: string) => {
    showModal({
      title: "Remover Item",
      message: "Deseja realmente remover este item?",
      onConfirm: () => {
        setItems(items.filter((item) => item.id !== id));
      },
      onCancel: () => {},
    });
  };

  const updateItem = (id: string, field: string, value: string) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id !== id) return item;

        // mantém os valores como string para o input
        const updatedItem = {
          ...item,
          [field]: value,
        };

        // converte SOMENTE para cálculo
        const quantity = Number(updatedItem.quantity);
        const unit_price = Number(updatedItem.unit_price);

        return {
          ...updatedItem,
          total: quantity > 0 && unit_price > 0 ? quantity * unit_price : 0,
        };
      }),
    );
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const formatPhone = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length <= 11) {
      let formatted = cleaned;
      formatted = formatted.replace(/^(\d{2})(\d)/g, "($1) $2");
      formatted = formatted.replace(/(\d)(\d{4})$/, "$1-$2");
      return formatted;
    }
    return clientPhone;
  };

  const handleSave = async (isDraft: boolean) => {
    if (!user) {
      showModal({ title: "Erro", message: "Usuário não autenticado" });

      return;
    }

    if (!clientName || !clientPhone) {
      showModal({
        title: "Atenção!",
        message: "Por favor, preencha nome e telefone do cliente",
      });

      return;
    }

    if (!isDraft && items.length === 0) {
      showModal({
        title: "Atenção!",
        message: "Adicione pelo menos um item ao orçamento",
      });

      return;
    }

    setSaving(true);

    try {
      const budgetData: Budget = {
        user_id: user.id,
        title: budgetTitle || undefined,
        description: observations || undefined,
        discount: 0,
        total_value: calculateTotal(),
        status: isDraft ? BudgetStatus.DRAFT : BudgetStatus.PENDING,
        created_by: user.id,
        created_at: user.created_at,
        updated_at: user.created_at,
      };

      const response = await budgetService.createBudgetWithItems(
        budgetData,
        items,
      );

      if (response.error) {
        showModal({
          title: "Erro",
          message: response.error,
        });

        return;
      }
      navigation.navigate("Home");
    } catch (error: any) {
      showModal({
        title: "Erro",
        message: error?.message || "Erro ao salvar orçamento. Tente novamente.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <AlertModal {...modalProps} />
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
          <Text style={styles.headerTitle}>Novo Orçamento</Text>
          <View style={styles.backButton} />
        </View>
      </BlurView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Seção: Dados do Cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Dados do Cliente</Text>

          <BlurView intensity={15} tint="dark" style={styles.card}>
            <View style={styles.cardInner}>
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <UserIcon size={16} color="#94A3B8" />
                  <Text style={styles.label}>NOME COMPLETO *</Text>
                </View>
                <View style={styles.clientInputRow}>
                  <TextInput
                    style={[styles.input, styles.clientInput]}
                    placeholder="Ex: João da Silva"
                    placeholderTextColor="#64748B"
                    value={clientName}
                    onChangeText={setClientName}
                    editable={!saving}
                  />
                  <TouchableOpacity
                    style={styles.searchClientButton}
                    onPress={() => setShowClientModal(true)}
                    activeOpacity={0.7}
                  >
                    <UsersIcon size={20} color="#3B82F6" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate("CreateClient")}
                  activeOpacity={0.7}
                  style={styles.addClientHint}
                >
                  <Text style={styles.addClientText}>
                    + Cadastrar novo cliente
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <PhoneIcon size={16} color="#94A3B8" />
                  <Text style={styles.label}>TELEFONE *</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="(00) 00000-0000"
                  placeholderTextColor="#64748B"
                  value={clientPhone}
                  onChangeText={(text) => setClientPhone(formatPhone(text))}
                  keyboardType="phone-pad"
                  maxLength={15}
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
                  value={clientEmail}
                  onChangeText={setClientEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!saving}
                />
              </View>
            </View>
          </BlurView>
        </View>

        {/* Seção: Informações do Orçamento */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Informações</Text>

          <BlurView intensity={15} tint="dark" style={styles.card}>
            <View style={styles.cardInner}>
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <FileIcon size={16} color="#94A3B8" />
                  <Text style={styles.label}>TÍTULO DO ORÇAMENTO</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Serviço de pintura residencial"
                  placeholderTextColor="#64748B"
                  value={budgetTitle}
                  onChangeText={setBudgetTitle}
                  editable={!saving}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>DATA</Text>
                <View style={styles.dateField}>
                  <Text style={styles.dateText}>{currentDate}</Text>
                </View>
              </View>
            </View>
          </BlurView>
        </View>

        {/* Seção: Itens */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Itens do Orçamento</Text>

          {items.map((item, index) => (
            <BlurView
              key={item.id}
              intensity={15}
              tint="dark"
              style={styles.itemCard}
            >
              <View style={styles.itemCardInner}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemNumber}>Item #{index + 1}</Text>
                  <TouchableOpacity
                    onPress={() => removeItem(item.id)}
                    activeOpacity={0.7}
                  >
                    <TrashIcon size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={[styles.input, styles.itemInput]}
                  placeholder="Nome do serviço/produto"
                  placeholderTextColor="#64748B"
                  value={item.nome}
                  onChangeText={(value) => updateItem(item.id, "nome", value)}
                  editable={!saving}
                />

                <View style={styles.itemRow}>
                  <View style={styles.itemInputWrapper}>
                    <Text style={styles.itemLabel}>Quantidade</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      placeholderTextColor="#64748B"
                      value={item.quantity}
                      onChangeText={(value) =>
                        updateItem(item.id, "quantity", value)
                      }
                      keyboardType="numeric"
                      editable={!saving}
                    />
                  </View>

                  <View style={styles.itemInputWrapper}>
                    <Text style={styles.itemLabel}>Preço Unit.</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="R$ 0,00"
                      placeholderTextColor="#64748B"
                      value={item.unit_price}
                      onChangeText={(value) =>
                        updateItem(item.id, "unit_price", value)
                      }
                      keyboardType="numeric"
                      editable={!saving}
                    />
                  </View>
                </View>

                <View style={styles.itemTotal}>
                  <Text style={styles.itemTotalLabel}>Total</Text>
                  <Text style={styles.itemTotalValue}>
                    R$ {item.total.toFixed(2)}
                  </Text>
                </View>
              </View>
            </BlurView>
          ))}

          <TouchableOpacity
            style={styles.addButtonWrapper}
            onPress={addItem}
            activeOpacity={0.8}
            disabled={saving}
          >
            <LinearGradient
              colors={["#3B82F6", "#2563EB"]}
              style={styles.addButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <PlusIcon size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Adicionar Item</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Total */}
        {items.length > 0 && (
          <View style={styles.section}>
            <LinearGradient
              colors={["#10B981", "#059669"]}
              style={styles.totalCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.totalLabel}>Valor Total</Text>
              <Text style={styles.totalValue}>
                R$ {calculateTotal().toFixed(2)}
              </Text>
            </LinearGradient>
          </View>
        )}

        {/* Observações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💬 Observações</Text>

          <BlurView intensity={15} tint="dark" style={styles.card}>
            <View style={styles.cardInner}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Condições de pagamento, prazo de validade, etc."
                placeholderTextColor="#64748B"
                value={observations}
                onChangeText={setObservations}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                editable={!saving}
              />
            </View>
          </BlurView>
        </View>
      </ScrollView>

      {/* Footer */}
      <BlurView intensity={20} tint="dark" style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryButtonWrapper, saving && styles.buttonDisabled]}
          onPress={() => handleSave(true)}
          disabled={saving}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#3B82F6", "#2563EB"]}
            style={styles.primaryButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <SaveIcon size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Criar Orçamento</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </BlurView>

      {/* Modal de Seleção de Cliente */}
      <Modal
        visible={showClientModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowClientModal(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={10} tint="dark" style={styles.modalBlur}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Selecionar Cliente</Text>
                <TouchableOpacity
                  onPress={() => setShowClientModal(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Busca */}
              <View style={styles.searchContainer}>
                <SearchIcon size={20} color="#64748B" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar cliente..."
                  placeholderTextColor="#64748B"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              {/* Lista de Clientes */}
              {loadingClients ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#3B82F6" />
                </View>
              ) : filteredClients.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {searchQuery
                      ? "Nenhum cliente encontrado"
                      : "Nenhum cliente cadastrado"}
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={() => {
                      setShowClientModal(false);
                      navigation.navigate("CreateClient");
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.emptyButtonText}>
                      + Cadastrar Cliente
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <FlatList
                  data={filteredClients}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.clientItem}
                      onPress={() => selectClient(item)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.clientItemContent}>
                        <Text style={styles.clientItemName}>{item.nome}</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>
          </BlurView>
        </View>
      </Modal>
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
    paddingBottom: 180,
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
  dateField: {
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateText: {
    fontSize: 15,
    color: "#E2E8F0",
  },
  itemCard: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    marginBottom: 12,
  },
  itemCardInner: {
    padding: 16,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  itemNumber: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  itemInput: {
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  itemInputWrapper: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    marginBottom: 8,
  },
  itemTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(148, 163, 184, 0.2)",
  },
  itemTotalLabel: {
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "600",
  },
  itemTotalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#10B981",
  },
  addButtonWrapper: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
    marginTop: 4,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  totalCard: {
    borderRadius: 16,
    padding: 24,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
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
  primaryButtonWrapper: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 12,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  secondaryButton: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#60A5FA",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  clientInputRow: {
    flexDirection: "row",
    gap: 8,
  },
  clientInput: {
    flex: 1,
  },
  searchClientButton: {
    width: 50,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  addClientHint: {
    marginTop: 8,
  },
  addClientText: {
    fontSize: 13,
    color: "#60A5FA",
    fontWeight: "600",
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, .5)",
    justifyContent: "center",
    padding: 24,
  },
  modalBlur: {
    borderRadius: 16,
    overflow: "hidden",
  },
  modalContent: {
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  modalClose: {
    fontSize: 24,
    color: "#94A3B8",
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.2)",
    paddingHorizontal: 16,
    margin: 20,
    marginTop: 16,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 12,
    fontSize: 15,
    color: "#E2E8F0",
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    color: "#94A3B8",
    textAlign: "center",
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#60A5FA",
  },

  clientItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1 )",
  },
  clientItemContent: {
    gap: 4,
  },
  clientItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  clientItemDetail: {
    fontSize: 13,
    color: "#94A3B8",
  },
});
