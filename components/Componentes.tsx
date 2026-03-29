import React, { useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export const showModal: AlertModalProps = ({
  title,
  message,
  onConfirm,
}: {
  title: string;
  message: string;
  onConfirm?: () => void;
}) => {
  setModal({
    visible: true,
    title,
    message,
    onConfirm:
      onConfirm || (() => setModal((prev) => ({ ...prev, visible: false }))),
  });
};

export function AlertModal({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
}: AlertModalProps) {
  useEffect(() => {
    console.log("Alert modal: ", visible, title, message, onConfirm, onCancel);
  }, []);
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <BlurView intensity={20} tint="dark" style={styles.card}>
          <View style={styles.cardInner}>
            <Text style={styles.title}>{title}</Text>

            <Text style={styles.message}>{message}</Text>

            <View style={styles.buttons}>
              {onCancel && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onCancel}
                >
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.confirmContainer}
                onPress={onConfirm}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#3B82F6", "#2563EB"]}
                  style={styles.confirmButton}
                >
                  <Text style={styles.confirmText}>Confirmar</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  card: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "rgba(15, 31, 65, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.3)",
  },

  cardInner: {
    padding: 28,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 10,
  },

  message: {
    fontSize: 15,
    color: "#94A3B8",
    marginBottom: 24,
  },

  buttons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },

  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 12,
  },

  cancelText: {
    color: "#94A3B8",
    fontWeight: "600",
    fontSize: 14,
  },

  confirmContainer: {
    borderRadius: 10,
    overflow: "hidden",
  },

  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  confirmText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
});
