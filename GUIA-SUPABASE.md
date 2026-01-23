# 🚀 GUIA DE CONFIGURAÇÃO - SUPABASE

## 📋 ÍNDICE
1. [Configuração Inicial](#configuração-inicial)
2. [Instalação de Dependências](#instalação-de-dependências)
3. [Configuração do Cliente Supabase](#configuração-do-cliente-supabase)
4. [Autenticação](#autenticação)
5. [Operações CRUD](#operações-crud)
6. [Storage (Anexos)](#storage-anexos)
7. [Realtime](#realtime)
8. [Edge Functions](#edge-functions)

---

## 🔧 CONFIGURAÇÃO INICIAL

### **1. Criar Projeto no Supabase**

1. Acesse [https://supabase.com](https://supabase.com)
2. Crie uma conta ou faça login
3. Clique em "New Project"
4. Preencha:
   - Nome do projeto
   - Database Password (guarde bem!)
   - Região (escolha a mais próxima do Brasil)
5. Aguarde a criação (2-3 minutos)

### **2. Executar o Schema SQL**

1. No painel do Supabase, vá em **SQL Editor**
2. Clique em "New Query"
3. Copie e cole todo o conteúdo do arquivo `supabase-schema.sql`
4. Clique em "Run" (ou pressione Ctrl/Cmd + Enter)
5. Aguarde a execução (pode demorar 10-20 segundos)

### **3. Configurar Storage para Anexos**

1. No painel, vá em **Storage**
2. Clique em "Create a new bucket"
3. Nome: `anexos`
4. Public: **Não** (manteremos privado com RLS)
5. Clique em "Create bucket"

6. Configure as políticas de storage:

```sql
-- Política para upload de anexos
CREATE POLICY "Usuários podem fazer upload de anexos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'anexos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para visualizar anexos
CREATE POLICY "Usuários podem ver seus anexos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'anexos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para deletar anexos
CREATE POLICY "Usuários podem deletar seus anexos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'anexos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### **4. Obter as Chaves da API**

1. No painel, vá em **Settings** → **API**
2. Copie:
   - **Project URL** (ex: https://xyzcompany.supabase.co)
   - **anon/public key** (chave pública)
   - **service_role key** (NÃO use no frontend!)

---

## 📦 INSTALAÇÃO DE DEPENDÊNCIAS

```bash
# Instalar Supabase JS Client
npm install @supabase/supabase-js

# Instalar AsyncStorage (para persistir sessão)
npm install @react-native-async-storage/async-storage

# Instalar URL polyfill (necessário para React Native)
npm install react-native-url-polyfill
```

---

## ⚙️ CONFIGURAÇÃO DO CLIENTE SUPABASE

### **src/config/supabase.js**

```javascript
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://SEU_PROJETO.supabase.co';
const supabaseAnonKey = 'SUA_CHAVE_ANON_AQUI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### **.env**

```env
SUPABASE_URL=https://SEU_PROJETO.supabase.co
SUPABASE_ANON_KEY=SUA_CHAVE_ANON_AQUI
```

### **src/config/supabase.js (com .env)**

```javascript
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

---

## 🔐 AUTENTICAÇÃO

### **Hook de Autenticação**

```javascript
// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

export const useAuth = () => {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [sessao, setSessao] = useState(null);

  useEffect(() => {
    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessao(session);
      setUsuario(session?.user ?? null);
      setCarregando(false);
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSessao(session);
        setUsuario(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const cadastrar = async (email, senha, nomeCompleto) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: {
            nome_completo: nomeCompleto,
          },
        },
      });

      if (error) throw error;

      // Criar registro na tabela usuarios
      if (data.user) {
        const { error: profileError } = await supabase
          .from('usuarios')
          .insert([
            {
              id: data.user.id,
              nome_completo: nomeCompleto,
              email: email,
            },
          ]);

        if (profileError) throw profileError;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const login = async (email, senha) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const redefinirSenha = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  return {
    usuario,
    sessao,
    carregando,
    cadastrar,
    login,
    logout,
    redefinirSenha,
  };
};
```

---

## 💾 OPERAÇÕES CRUD

### **Serviço de Clientes**

```javascript
// src/services/clienteService.js
import { supabase } from '../config/supabase';

export const ClienteService = {
  // Listar todos os clientes
  async listar() {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('ativo', true)
        .order('nome', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Buscar cliente por ID
  async buscarPorId(id) {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Buscar clientes por nome
  async buscar(termo) {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .ilike('nome', `%${termo}%`)
        .eq('ativo', true)
        .order('nome', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Criar cliente
  async criar(dadosCliente) {
    try {
      const { data: usuario } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('clientes')
        .insert([
          {
            ...dadosCliente,
            usuario_id: usuario.user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Atualizar cliente
  async atualizar(id, dadosCliente) {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .update(dadosCliente)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Desativar cliente (soft delete)
  async desativar(id) {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .update({ ativo: false })
        .eq('id', id);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Deletar cliente permanentemente
  async deletar(id) {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  },
};
```

### **Serviço de Orçamentos**

```javascript
// src/services/orcamentoService.js
import { supabase } from '../config/supabase';

export const OrcamentoService = {
  // Listar orçamentos
  async listar(filtros = {}) {
    try {
      let query = supabase
        .from('orcamentos')
        .select(`
          *,
          cliente:clientes(id, nome, email, telefone),
          itens:itens_orcamento(*)
        `)
        .order('criado_em', { ascending: false });

      // Aplicar filtros
      if (filtros.status) {
        query = query.eq('status', filtros.status);
      }

      if (filtros.clienteId) {
        query = query.eq('cliente_id', filtros.clienteId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Buscar orçamento por ID
  async buscarPorId(id) {
    try {
      const { data, error } = await supabase
        .from('orcamentos')
        .select(`
          *,
          cliente:clientes(*),
          itens:itens_orcamento(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Criar orçamento
  async criar(dadosOrcamento) {
    try {
      const { data: usuario } = await supabase.auth.getUser();

      // Gerar número do orçamento
      const { data: numeroData } = await supabase.rpc(
        'gerar_numero_orcamento',
        { p_usuario_id: usuario.user.id }
      );

      // Criar orçamento
      const { data: orcamento, error: orcamentoError } = await supabase
        .from('orcamentos')
        .insert([
          {
            usuario_id: usuario.user.id,
            numero: numeroData,
            ...dadosOrcamento,
          },
        ])
        .select()
        .single();

      if (orcamentoError) throw orcamentoError;

      // Inserir itens
      if (dadosOrcamento.itens && dadosOrcamento.itens.length > 0) {
        const itensComOrcamentoId = dadosOrcamento.itens.map((item, index) => ({
          ...item,
          orcamento_id: orcamento.id,
          ordem: index,
        }));

        const { error: itensError } = await supabase
          .from('itens_orcamento')
          .insert(itensComOrcamentoId);

        if (itensError) throw itensError;
      }

      return { data: orcamento, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Atualizar orçamento
  async atualizar(id, dadosOrcamento) {
    try {
      const { data, error } = await supabase
        .from('orcamentos')
        .update(dadosOrcamento)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Atualizar status
  async atualizarStatus(id, novoStatus) {
    try {
      const camposStatus = {
        status: novoStatus,
      };

      // Adicionar timestamp conforme status
      if (novoStatus === 'enviado') {
        camposStatus.enviado_em = new Date().toISOString();
      } else if (novoStatus === 'aprovado') {
        camposStatus.aprovado_em = new Date().toISOString();
      } else if (novoStatus === 'recusado') {
        camposStatus.recusado_em = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('orcamentos')
        .update(camposStatus)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Deletar orçamento
  async deletar(id) {
    try {
      const { error } = await supabase
        .from('orcamentos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  // Estatísticas
  async obterEstatisticas() {
    try {
      const { data, error } = await supabase
        .from('vw_estatisticas_usuario')
        .select('*')
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};
```

### **Serviço de Itens**

```javascript
// src/services/itemService.js
import { supabase } from '../config/supabase';

export const ItemService = {
  // Adicionar item ao orçamento
  async adicionar(orcamentoId, dadosItem) {
    try {
      // Buscar próximo número de ordem
      const { data: itensExistentes } = await supabase
        .from('itens_orcamento')
        .select('ordem')
        .eq('orcamento_id', orcamentoId)
        .order('ordem', { ascending: false })
        .limit(1);

      const proximaOrdem = itensExistentes?.[0]?.ordem 
        ? itensExistentes[0].ordem + 1 
        : 0;

      const { data, error } = await supabase
        .from('itens_orcamento')
        .insert([
          {
            ...dadosItem,
            orcamento_id: orcamentoId,
            ordem: proximaOrdem,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Atualizar item
  async atualizar(id, dadosItem) {
    try {
      const { data, error } = await supabase
        .from('itens_orcamento')
        .update(dadosItem)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Deletar item
  async deletar(id) {
    try {
      const { error } = await supabase
        .from('itens_orcamento')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  // Reordenar itens
  async reordenar(itens) {
    try {
      const promises = itens.map((item, index) =>
        supabase
          .from('itens_orcamento')
          .update({ ordem: index })
          .eq('id', item.id)
      );

      await Promise.all(promises);
      return { error: null };
    } catch (error) {
      return { error };
    }
  },
};
```

---

## 📁 STORAGE (ANEXOS)

```javascript
// src/services/storageService.js
import { supabase } from '../config/supabase';
import * as FileSystem from 'expo-file-system';

export const StorageService = {
  // Upload de arquivo
  async uploadAnexo(file, orcamentoId) {
    try {
      const { data: usuario } = await supabase.auth.getUser();
      const userId = usuario.user.id;

      // Criar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${orcamentoId}/${fileName}`;

      // Upload do arquivo
      const { data, error } = await supabase.storage
        .from('anexos')
        .upload(filePath, file);

      if (error) throw error;

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('anexos')
        .getPublicUrl(filePath);

      // Salvar registro no banco
      const { data: anexo, error: anexoError } = await supabase
        .from('anexos')
        .insert([
          {
            orcamento_id: orcamentoId,
            usuario_id: userId,
            nome: file.name,
            tipo: file.type,
            tamanho: file.size,
            url: urlData.publicUrl,
          },
        ])
        .select()
        .single();

      if (anexoError) throw anexoError;

      return { data: anexo, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Listar anexos
  async listarAnexos(orcamentoId) {
    try {
      const { data, error } = await supabase
        .from('anexos')
        .select('*')
        .eq('orcamento_id', orcamentoId)
        .order('criado_em', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Deletar anexo
  async deletarAnexo(anexoId) {
    try {
      // Buscar dados do anexo
      const { data: anexo } = await supabase
        .from('anexos')
        .select('url')
        .eq('id', anexoId)
        .single();

      if (anexo) {
        // Extrair caminho do arquivo da URL
        const url = new URL(anexo.url);
        const filePath = url.pathname.split('/storage/v1/object/public/anexos/')[1];

        // Deletar arquivo do storage
        await supabase.storage.from('anexos').remove([filePath]);
      }

      // Deletar registro do banco
      const { error } = await supabase
        .from('anexos')
        .delete()
        .eq('id', anexoId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  },
};
```

---

## ⚡ REALTIME

```javascript
// src/hooks/useRealtimeOrcamentos.js
import { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';

export const useRealtimeOrcamentos = () => {
  const [orcamentos, setOrcamentos] = useState([]);

  useEffect(() => {
    // Carregar orçamentos iniciais
    const carregarOrcamentos = async () => {
      const { data } = await supabase
        .from('orcamentos')
        .select('*')
        .order('criado_em', { ascending: false });

      if (data) setOrcamentos(data);
    };

    carregarOrcamentos();

    // Inscrever para mudanças em tempo real
    const subscription = supabase
      .channel('orcamentos_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orcamentos',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setOrcamentos((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setOrcamentos((prev) =>
              prev.map((o) => (o.id === payload.new.id ? payload.new : o))
            );
          } else if (payload.eventType === 'DELETE') {
            setOrcamentos((prev) => prev.filter((o) => o.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return orcamentos;
};
```

---

## 🔍 EXEMPLO DE USO COMPLETO

```javascript
// src/screens/Orcamento/CriarOrcamentoScreen.js
import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { OrcamentoService } from '../../services/orcamentoService';
import { ClienteService } from '../../services/clienteService';

const CriarOrcamentoScreen = ({ navigation }) => {
  const [dadosOrcamento, setDadosOrcamento] = useState({
    cliente_id: null,
    titulo: '',
    descricao: '',
    itens: [],
    observacoes: '',
  });

  const handleSalvar = async () => {
    try {
      const { data, error } = await OrcamentoService.criar(dadosOrcamento);

      if (error) throw error;

      Alert.alert('Sucesso', 'Orçamento criado com sucesso!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <View>
      {/* Seu JSX aqui */}
    </View>
  );
};
```

---

Pronto! Agora você tem uma estrutura completa de banco de dados e integração com Supabase! 🎉
