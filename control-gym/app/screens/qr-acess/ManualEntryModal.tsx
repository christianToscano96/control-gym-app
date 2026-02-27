import React from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import ButtonCustom from "@/components/ui/ButtonCustom";

interface ManualEntryModalProps {
  visible: boolean;
  searchQuery: string;
  filteredClients: any[];
  selectedClient: any;
  backgroundColor: string;
  cardColor: string;
  textColor: string;
  textSecondaryColor: string;
  primaryColor: string;
  loading?: boolean;
  onClose: () => void;
  onSearchChange: (text: string) => void;
  onSelectClient: (client: any) => void;
  onConfirm: () => void;
  onDeny: () => void;
}

export const ManualEntryModal: React.FC<ManualEntryModalProps> = ({
  visible,
  searchQuery,
  filteredClients,
  selectedClient,
  backgroundColor,
  cardColor,
  textColor,
  textSecondaryColor,
  primaryColor,
  loading = false,
  onClose,
  onSearchChange,
  onSelectClient,
  onConfirm,
  onDeny,
}) => {
  console.log(selectedClient);
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: backgroundColor }]}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={{ color: textColor }} className="text-2xl font-bold">
                Ingreso Manual
              </Text>
              <TouchableOpacity onPress={onClose}>
                <MaterialIcons name="close" size={28} color={textColor} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View className="px-6 mb-4">
              <View
                style={[styles.searchContainer, { backgroundColor: cardColor }]}
              >
                <MaterialIcons
                  name="search"
                  size={24}
                  color={textSecondaryColor}
                  style={{ marginRight: 12 }}
                />
                <TextInput
                  style={[styles.searchInput, { color: textColor }]}
                  placeholder="Buscar cliente..."
                  placeholderTextColor={textSecondaryColor}
                  value={searchQuery}
                  onChangeText={onSearchChange}
                  autoFocus
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => onSearchChange("")}>
                    <MaterialIcons
                      name="cancel"
                      size={20}
                      color={textSecondaryColor}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Client Info */}
            <View style={styles.clientInfo} className="px-6 flex-1">
              {loading ? (
                <View className="items-center justify-center py-12">
                  <ActivityIndicator size="large" color={primaryColor} />
                  <Text
                    style={{ color: textSecondaryColor }}
                    className="text-base mt-4 text-center"
                  >
                    Buscando cliente...
                  </Text>
                </View>
              ) : selectedClient ? (
                <View className="items-center justify-center py-8">
                  <View
                    style={[styles.clientCard, { backgroundColor: cardColor }]}
                    className="w-full p-6 rounded-3xl"
                  >
                    <View className="items-center mb-6">
                      <View
                        style={[
                          styles.avatarPlaceholder,
                          { backgroundColor: `${primaryColor}20` },
                        ]}
                        className="w-24 h-24 rounded-full items-center justify-center mb-4"
                      >
                        <MaterialIcons
                          name="person"
                          size={48}
                          color={primaryColor}
                        />
                      </View>
                      <Text
                        style={{ color: textColor }}
                        className="text-2xl font-bold text-center mb-2"
                      >
                        {selectedClient.firstName} {selectedClient.lastName}
                      </Text>
                    </View>

                    <View className="space-y-3">
                      <View className="flex-row items-center justify-between py-3">
                        <Text
                          style={{ color: textSecondaryColor }}
                          className="text-base"
                        >
                          Estado
                        </Text>
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor: selectedClient.isActive
                                ? "#10b98120"
                                : "#ef444420",
                            },
                          ]}
                        >
                          <Text
                            style={{
                              color: selectedClient.isActive
                                ? "#10b981"
                                : "#ef4444",
                            }}
                            className="text-sm font-semibold"
                          >
                            {selectedClient.isActive ? "Activo" : "Inactivo"}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {!selectedClient.isActive && (
                      <View
                        style={{ backgroundColor: "#fef2f2" }}
                        className="mt-4 p-3 rounded-xl flex-row items-start"
                      >
                        <MaterialIcons
                          name="warning"
                          size={20}
                          color="#ef4444"
                          style={{ marginRight: 8, marginTop: 2 }}
                        />
                        <Text
                          style={{ color: "#ef4444" }}
                          className="text-sm flex-1"
                        >
                          Este cliente tiene membresía inactiva
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ) : (
                <View className="items-center justify-center py-12">
                  <MaterialIcons
                    name="search"
                    size={64}
                    color={textSecondaryColor}
                  />
                  <Text
                    style={{ color: textSecondaryColor }}
                    className="text-base mt-4 text-center"
                  >
                    {searchQuery
                      ? "No se encontró el cliente"
                      : "Ingresa el nombre del cliente"}
                  </Text>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View className="px-6 pb-6 gap-3">
              <ButtonCustom
                title="Registrar Acceso"
                onPress={onConfirm}
                disabled={!selectedClient || !selectedClient.isActive}
                tertiary={!selectedClient || !selectedClient.isActive}
              />
              <ButtonCustom
                title="Denegar Acceso"
                onPress={onDeny}
                disabled={!selectedClient}
                secondary
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "95%",
    minHeight: "90%",
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  clientInfo: {
    flex: 1,
    minHeight: 400,
  },
  clientCard: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarPlaceholder: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  membershipBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
});
