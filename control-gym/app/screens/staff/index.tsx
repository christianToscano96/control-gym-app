import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "@/context/ThemeContext";
import { createStaff } from "@/api/staff";
import { useUserStore } from "@/stores/store";

export default function AddStaffScreen() {
  const router = useRouter();
  const { colors, isDark, primaryColor } = useTheme();
  const user = useUserStore((s) => s.user);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "",
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const roles = [
    // TODO: Implementar entrenador en el futuro
    // { value: "entrenador", label: "Trainer" },
    { value: "empleado", label: "Staff" },
  ];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      Alert.alert("Error", "El nombre es obligatorio");
      return false;
    }

    if (!formData.email.trim()) {
      Alert.alert("Error", "El email es obligatorio");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert("Error", "El email no es válido");
      return false;
    }

    if (!formData.password) {
      Alert.alert("Error", "La contraseña es obligatoria");
      return false;
    }

    if (formData.password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return false;
    }

    if (!formData.role) {
      Alert.alert("Error", "Debe seleccionar un rol");
      return false;
    }

    return true;
  };

  const handleCreateUser = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Crear FormData para enviar datos con imagen
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.fullName);
      formDataToSend.append("email", formData.email.toLowerCase());
      formDataToSend.append("password", formData.password);
      formDataToSend.append("role", formData.role);

      if (formData.phone) {
        formDataToSend.append("phone", formData.phone);
      }

      // Agregar imagen si existe
      if (profileImage) {
        const uriParts = profileImage.split(".");
        const fileType = uriParts[uriParts.length - 1];

        formDataToSend.append("avatar", {
          uri: profileImage,
          name: `avatar.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }

      // Enviar al backend
      await createStaff(formDataToSend);

      Alert.alert("Éxito", "Staff creado exitosamente", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error("Error al crear staff:", error);
      Alert.alert(
        "Error",
        error.message || "Hubo un error al crear el staff. Inténtalo de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Add New Staff
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Profile Photo Section */}
          <View style={styles.photoSection}>
            <TouchableOpacity onPress={pickImage} style={styles.photoContainer}>
              <View
                style={[
                  styles.photoCircle,
                  {
                    backgroundColor: isDark ? "#1a2e21" : "#f1f5f9",
                    borderColor: colors.border,
                  },
                ]}
              >
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
                    style={styles.profileImage}
                  />
                ) : (
                  <Ionicons
                    name="camera-outline"
                    size={40}
                    color={colors.textSecondary}
                  />
                )}
              </View>
              <View
                style={[
                  styles.editBadge,
                  {
                    backgroundColor: primaryColor,
                    borderColor: colors.card,
                  },
                ]}
              >
                <Ionicons name="create-outline" size={16} color="#ffffff" />
              </View>
            </TouchableOpacity>
            <Text style={[styles.photoLabel, { color: colors.textSecondary }]}>
              Profile Photo
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Full Name */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Full Name
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? "#1a2e21" : "#f8fafc",
                      color: colors.text,
                    },
                  ]}
                  placeholder="e.g. John Doe"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.fullName}
                  onChangeText={(text) =>
                    setFormData({ ...formData, fullName: text })
                  }
                />
              </View>
            </View>

            {/* Email Address */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Email Address
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? "#1a2e21" : "#f8fafc",
                      color: colors.text,
                    },
                  ]}
                  placeholder="john@example.com"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(text) =>
                    setFormData({ ...formData, email: text })
                  }
                />
              </View>
            </View>

            {/* Phone Number */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Phone Number
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="call-outline"
                  size={20}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? "#1a2e21" : "#f8fafc",
                      color: colors.text,
                    },
                  ]}
                  placeholder="+1 (555) 000-0000"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="phone-pad"
                  value={formData.phone}
                  onChangeText={(text) =>
                    setFormData({ ...formData, phone: text })
                  }
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Password *
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? "#1a2e21" : "#f8fafc",
                      color: colors.text,
                      paddingRight: 48,
                    },
                  ]}
                  placeholder="Minimum 6 characters"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!showPassword}
                  value={formData.password}
                  onChangeText={(text) =>
                    setFormData({ ...formData, password: text })
                  }
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Assign Role */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Assign Role *
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="ribbon-outline"
                  size={20}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TouchableOpacity
                  onPress={() => setShowRoleDropdown(!showRoleDropdown)}
                  style={[
                    styles.select,
                    {
                      backgroundColor: isDark ? "#1a2e21" : "#f8fafc",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.selectText,
                      {
                        color: formData.role
                          ? colors.text
                          : colors.textSecondary,
                      },
                    ]}
                  >
                    {formData.role
                      ? roles.find((r) => r.value === formData.role)?.label
                      : "Select a role"}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={colors.textSecondary}
                    style={styles.selectIcon}
                  />
                </TouchableOpacity>
                {showRoleDropdown && (
                  <View
                    style={[
                      styles.dropdown,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    {roles.map((role, index) => (
                      <TouchableOpacity
                        key={role.value}
                        onPress={() => {
                          setFormData({ ...formData, role: role.value });
                          setShowRoleDropdown(false);
                        }}
                        style={[
                          styles.dropdownItem,
                          {
                            borderBottomWidth: index < roles.length - 1 ? 1 : 0,
                            borderBottomColor: colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[styles.dropdownText, { color: colors.text }]}
                        >
                          {role.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Spacer for footer */}
        <View style={{ height: 96 }} />
      </ScrollView>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={handleCreateUser}
          style={[
            styles.button,
            {
              backgroundColor: loading ? colors.textSecondary : primaryColor,
              shadowColor: primaryColor,
            },
          ]}
          activeOpacity={0.9}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Create User</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    gap: 32,
  },
  photoSection: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  photoContainer: {
    position: "relative",
  },
  photoCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 2,
    borderStyle: "dashed",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    padding: 8,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 4,
  },
  photoLabel: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  form: {
    flexDirection: "column",
    gap: 20,
  },
  fieldContainer: {
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    marginLeft: 4,
  },
  inputWrapper: {
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: 16,
    top: "50%",
    transform: [{ translateY: -10 }],
    zIndex: 10,
  },
  passwordToggle: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  input: {
    width: "100%",
    height: 56,
    paddingLeft: 48,
    paddingRight: 16,
    borderRadius: 12,
    fontSize: 16,
  },
  select: {
    width: "100%",
    height: 56,
    paddingLeft: 48,
    paddingRight: 40,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  selectText: {
    flex: 1,
    fontSize: 16,
  },
  selectIcon: {
    position: "absolute",
    right: 16,
  },
  dropdown: {
    position: "absolute",
    top: 64,
    left: 0,
    right: 0,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    zIndex: 50,
  },
  dropdownItem: {
    padding: 16,
  },
  dropdownText: {
    fontSize: 16,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    borderTopWidth: 1,
  },
  button: {
    width: "100%",
    height: 56,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 18,
  },
});
