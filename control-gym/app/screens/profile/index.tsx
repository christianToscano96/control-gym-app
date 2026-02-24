import Avatar from "@/components/ui/Avatar";
import ButtonCustom from "@/components/ui/ButtonCustom";
import HeaderTopScrenn from "@/components/ui/HeaderTopScrenn";
import TextField from "@/components/ui/TextField";
import Toast from "@/components/ui/Toast";
import { API_BASE_URL } from "@/constants/api";
import { useTheme } from "@/context/ThemeContext";
import {
  useProfileQuery,
  useUpdateProfile,
  useUploadAvatar,
} from "@/hooks/queries/useProfile";
import { useToast } from "@/hooks/useToast";
import { useUserStore } from "@/stores/store";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditProfile() {
  const { primaryColor, colors } = useTheme();
  const { user, setUser } = useUserStore();
  const { toast, showSuccess, showError, hideToast } = useToast();

  const [fullName, setFullName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState(user?.role || "");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // ─── TanStack Query ──────────────────────────────────────────
  const { data: profile, isLoading: loadingProfile } = useProfileQuery();
  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();

  const loading = updateProfileMutation.isPending || uploadAvatarMutation.isPending;

  // Sync profile data to local state when query resolves
  useEffect(() => {
    if (profile) {
      setFullName(profile.name || "");
      setPhone(profile.phone || "");
      setJobTitle(profile.role || "");
      if (profile.avatar) {
        setAvatarUri(`${API_BASE_URL}${profile.avatar}`);
      }
    }
  }, [profile]);

  const handleSaveChanges = () => {
    if (!fullName.trim()) {
      showError("El nombre completo es requerido");
      return;
    }
    if (!user?.token) {
      showError("No hay sesión activa");
      return;
    }

    updateProfileMutation.mutate(
      { name: fullName, phone: phone || undefined },
      {
        onSuccess: (updatedUser: any) => {
          setUser(
            {
              id: updatedUser._id,
              name: updatedUser.name,
              role: updatedUser.role,
              token: user.token,
            },
            user.token,
          );
          showSuccess("Perfil actualizado correctamente");
          setTimeout(() => router.back(), 1500);
        },
        onError: (err: any) => {
          showError(err.message || "No se pudo actualizar el perfil");
        },
      },
    );
  };

  const handleDiscardChanges = () => {
    Alert.alert(
      "Descartar cambios",
      "¿Estás seguro de que deseas descartar los cambios?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Descartar",
          style: "destructive",
          onPress: () => router.back(),
        },
      ],
    );
  };

  const handleChangePhoto = () => {
    Alert.alert("Cambiar foto", "Selecciona una opción", [
      { text: "Cancelar", style: "cancel" },
      { text: "Tomar foto", onPress: handleTakePhoto },
      {
        text: "Elegir de galería",
        onPress: handlePickImage,
      },
    ]);
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        showError("Se necesitan permisos de cámara");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        handleUploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error al tomar foto:", error);
      showError("Error al tomar foto");
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showError("Se necesitan permisos de galería");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        handleUploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error al seleccionar imagen:", error);
      showError("Error al seleccionar imagen");
    }
  };

  const handleUploadAvatar = (imageUri: string) => {
    if (!user?.token) {
      showError("No hay sesión activa");
      return;
    }

    uploadAvatarMutation.mutate(imageUri, {
      onSuccess: (result: any) => {
        const avatarUrl = `${API_BASE_URL}${result.avatar}`;
        setAvatarUri(avatarUrl);
        setUser({ ...user, avatar: avatarUrl }, user.token);
        showSuccess("Foto actualizada correctamente");
      },
      onError: (err: any) => {
        showError(err.message || "Error al subir foto");
      },
    });
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      className="flex-1 px-5"
    >
      <View style={{ backgroundColor: colors.background }}>
        <HeaderTopScrenn title="Editar Perfil" isBackButton />
      </View>

      {loadingProfile ? (
        <View className="flex-1 items-center justify-center">
          <Text style={{ color: colors.textSecondary }}>
            Cargando perfil...
          </Text>
        </View>
      ) : (
        <>
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Avatar Section */}
            <View className="items-center justify-center py-8">
              <View className="relative">
                <View
                  style={{
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  }}
                  className="w-32 h-32 rounded-full border-4 overflow-hidden shadow-lg"
                >
                  <Avatar
                    size="lg"
                    name={fullName}
                    uri={avatarUri || undefined}
                    className="w-full h-full"
                  />
                </View>
                <TouchableOpacity
                  className="absolute bottom-0 right-0 w-10 h-10 rounded-full items-center justify-center border-4 shadow-md active:opacity-80"
                  style={{
                    backgroundColor: primaryColor,
                    borderColor: colors.border,
                  }}
                  onPress={handleChangePhoto}
                >
                  <MaterialIcons
                    name="photo-camera"
                    size={20}
                    color="#0d1c3d"
                  />
                </TouchableOpacity>
              </View>
              <Text
                style={{ color: colors.textSecondary }}
                className="mt-3 text-xs font-medium"
              >
                Cambiar Foto de Perfil
              </Text>
            </View>

            {/* Form Section */}
            <View className="px-4 pb-6">
              <TextField
                label="Nombre Completo"
                placeholder="Ingresa tu nombre completo"
                value={fullName}
                onChangeText={setFullName}
                leftIcon={
                  <MaterialIcons name="person" size={20} color="#9CA3AF" />
                }
              />

              <TextField
                label="Número de Teléfono"
                placeholder="Ingresa tu teléfono"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                leftIcon={
                  <MaterialIcons name="phone" size={20} color="#9CA3AF" />
                }
              />

              <TextField
                label="Cargo"
                placeholder="Ingresa tu cargo"
                value={jobTitle}
                onChangeText={setJobTitle}
                leftIcon={
                  <MaterialIcons name="badge" size={20} color="#9CA3AF" />
                }
              />
            </View>
          </ScrollView>
          {/* Action Buttons */}
          <View className="pt-8 pb-4">
            <ButtonCustom
              title={loading ? "Guardando..." : "Guardar Cambios"}
              onPress={handleSaveChanges}
              disabled={loading}
            />

            <TouchableOpacity
              className="w-full mt-4 h-12 items-center justify-center"
              onPress={handleDiscardChanges}
              disabled={loading}
            >
              <Text
                style={{ color: colors.textSecondary }}
                className="font-semibold text-sm"
              >
                Descartar Cambios
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </SafeAreaView>
  );
}
