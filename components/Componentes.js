// =============================================
// COMPONENTES REUTILIZÁVEIS
// Separe estes componentes em arquivos individuais
// para melhor organização do projeto
// =============================================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// =============================================
// BOTÃO PRIMÁRIO COM GRADIENTE
// =============================================
export const BotaoPrimario = ({ onPress, texto, icone, style }) => {
  return (
    <TouchableOpacity
      style={[styles.btnPrimary, style]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['#0048ff', '#0099ff']}
        style={styles.btnPrimaryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {icone && <Text style={styles.btnPrimaryIcon}>{icone}</Text>}
        <Text style={styles.btnPrimaryText}>{texto}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// =============================================
// BOTÃO SECUNDÁRIO
// =============================================
export const BotaoSecundario = ({ onPress, texto, style }) => {
  return (
    <TouchableOpacity
      style={[styles.btnSecondary, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.btnSecondaryText}>{texto}</Text>
    </TouchableOpacity>
  );
};

// =============================================
// CARD GLASSMORPHISM
// =============================================
export const CardGlass = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

// =============================================
// INPUT PREMIUM
// =============================================
export const InputPremium = ({
  label,
  placeholder,
  value,
  onChangeText,
  multiline,
  disabled,
  keyboardType,
  numberOfLines,
  style,
}) => {
  return (
    <View style={styles.inputGroup}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          multiline && styles.textArea,
          disabled && styles.inputDisabled,
          style,
        ]}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={numberOfLines}
        editable={!disabled}
        keyboardType={keyboardType}
      />
    </View>
  );
};

// =============================================
// AVATAR COM INICIAIS
// =============================================
export const AvatarIniciais = ({ nome, tamanho = 48 }) => {
  const getIniciais = (nomeCompleto) => {
    return nomeCompleto
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <View
      style={[
        styles.avatar,
        { width: tamanho, height: tamanho, borderRadius: tamanho / 2 },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: tamanho * 0.375 }]}>
        {getIniciais(nome)}
      </Text>
    </View>
  );
};

// =============================================
// BADGE/ETIQUETA
// =============================================
export const Badge = ({ texto, cor = '#0048ff', style }) => {
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: `${cor}1A` },
        style,
      ]}
    >
      <Text style={[styles.badgeText, { color: cor }]}>{texto}</Text>
    </View>
  );
};

// =============================================
// HEADER COM GRADIENTE
// =============================================
export const HeaderGradiente = ({ titulo, subtitulo, onVoltar }) => {
  return (
    <LinearGradient
      colors={['#0048ff', '#0099ff']}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      {onVoltar && (
        <TouchableOpacity style={styles.btnBack} onPress={onVoltar}>
          <Text style={styles.btnBackText}>←</Text>
        </TouchableOpacity>
      )}
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>{titulo}</Text>
        {subtitulo && <Text style={styles.headerSubtitle}>{subtitulo}</Text>}
      </View>
    </LinearGradient>
  );
};

// =============================================
// MODAL BASE
// =============================================
export const ModalBase = ({
  visible,
  onClose,
  titulo,
  children,
  footerContent,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={styles.modal}
        >
          <View style={styles.modalHeader}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{titulo}</Text>
            <TouchableOpacity style={styles.btnClose} onPress={onClose}>
              <Text style={styles.btnCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>

          {footerContent && (
            <View style={styles.modalFooter}>{footerContent}</View>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// =============================================
// ITEM DE LISTA CLICÁVEL
// =============================================
export const ItemLista = ({ icone, titulo, subtitulo, onPress }) => {
  return (
    <TouchableOpacity style={styles.itemLista} onPress={onPress}>
      {icone}
      <View style={styles.itemListaInfo}>
        <Text style={styles.itemListaTitulo}>{titulo}</Text>
        {subtitulo && <Text style={styles.itemListaSubtitulo}>{subtitulo}</Text>}
      </View>
      <Text style={styles.itemListaSeta}>›</Text>
    </TouchableOpacity>
  );
};

// =============================================
// FORMATADORES DE DADOS
// =============================================
export const Formatadores = {
  moeda: (valor) => {
    return `R$ ${parseFloat(valor).toFixed(2).replace('.', ',')}`;
  },

  telefone: (numero) => {
    const cleaned = numero.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return numero;
  },

  data: (data) => {
    const opcoes = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(data).toLocaleDateString('pt-BR', opcoes);
  },
};

// =============================================
// ESTILOS
// =============================================
const styles = StyleSheet.create({
  // BOTÕES
  btnPrimary: {
    height: 56,
    borderRadius: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0048ff',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  btnPrimaryGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnPrimaryIcon: {
    fontSize: 18,
  },
  btnPrimaryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  btnSecondary: {
    height: 56,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'rgba(0, 72, 255, 0.2)',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: '#0048ff',
    fontSize: 15,
    fontWeight: '600',
  },

  // CARD
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 72, 255, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: '#0048ff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  // INPUT
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  input: {
    height: 56,
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 72, 255, 0.1)',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1E293B',
  },
  inputDisabled: {
    backgroundColor: 'rgba(0, 72, 255, 0.03)',
    color: '#64748B',
  },
  textArea: {
    height: 120,
    paddingTop: 16,
    paddingBottom: 16,
    textAlignVertical: 'top',
  },

  // AVATAR
  avatar: {
    backgroundColor: '#0048ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontWeight: '700',
  },

  // BADGE
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // HEADER
  header: {
    height: 200,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#0048ff',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 32,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  btnBack: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnBackText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 15,
  },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '80%',
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 72, 255, 0.08)',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  btnClose: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 72, 255, 0.1)',
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnCloseText: {
    color: '#0048ff',
    fontSize: 18,
  },
  modalBody: {
    padding: 20,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 72, 255, 0.08)',
  },

  // ITEM LISTA
  itemLista: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0, 72, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(0, 72, 255, 0.08)',
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  itemListaInfo: {
    flex: 1,
  },
  itemListaTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  itemListaSubtitulo: {
    fontSize: 13,
    color: '#64748B',
  },
  itemListaSeta: {
    fontSize: 24,
    color: '#64748B',
  },
});

// =============================================
// EXEMPLO DE USO
// =============================================

/*

import {
  BotaoPrimario,
  BotaoSecundario,
  CardGlass,
  InputPremium,
  AvatarIniciais,
  Badge,
  HeaderGradiente,
  ModalBase,
  ItemLista,
  Formatadores,
} from './Componentes';

// USO NO SEU COMPONENTE:

<HeaderGradiente
  titulo="Novo Orçamento"
  subtitulo="Preencha os dados abaixo"
  onVoltar={() => navigation.goBack()}
/>

<CardGlass>
  <InputPremium
    label="Nome do Cliente"
    placeholder="Digite o nome"
    value={nome}
    onChangeText={setNome}
  />
</CardGlass>

<AvatarIniciais nome="João Silva" tamanho={48} />

<Badge texto="3 itens" cor="#0048ff" />

<BotaoPrimario
  texto="Salvar"
  icone="✓"
  onPress={handleSalvar}
/>

<BotaoSecundario
  texto="Cancelar"
  onPress={handleCancelar}
/>

<Text>{Formatadores.moeda(1250.50)}</Text>
<Text>{Formatadores.telefone('11987654321')}</Text>
<Text>{Formatadores.data(new Date())}</Text>

<ItemLista
  icone={<AvatarIniciais nome="Maria Silva" tamanho={40} />}
  titulo="Maria Silva"
  subtitulo="(11) 98765-4321"
  onPress={() => selecionarCliente(cliente)}
/>

<ModalBase
  visible={modalVisible}
  onClose={() => setModalVisible(false)}
  titulo="Selecionar Cliente"
  footerContent={
    <BotaoPrimario texto="Confirmar" onPress={handleConfirmar} />
  }
>
  <Text>Conteúdo do modal aqui</Text>
</ModalBase>

*/
