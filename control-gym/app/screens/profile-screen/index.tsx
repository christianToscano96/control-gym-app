import Avatar from "@/components/ui/Avatar";
import ButtonCustom from "@/components/ui/ButtonCustom";
import HeaderTopScrenn from "@/components/ui/HeaderTopScrenn";
import TextField from "@/components/ui/TextField";
import { useTheme } from "@/context/ThemeContext";
import { useUserStore } from "@/stores/store";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { updateProfile, getProfile } from "@/api/user";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/ui/Toast";

export default function EditProfile() {
  const { primaryColor } = useTheme();
  const { user, setUser } = useUserStore();
  const { toast, showSuccess, showError, hideToast } = useToast();

  const [fullName, setFullName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState(user?.role || "");
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const loadUserProfile = useCallback(async () => {
    if (!user?.token) {
      setLoadingProfile(false);
      return;
    }

    try {
      const profile = await getProfile(user.token);
      setFullName(profile.name || "");
      setPhone(profile.phone || "");
      setJobTitle(profile.role || "");
    } catch (error) {
      console.error("Error al cargar perfil:", error);
    } finally {
      setLoadingProfile(false);
    }
  }, [user?.token]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const handleSaveChanges = async () => {
    if (!fullName.trim()) {
      showError("El nombre completo es requerido");
      return;
    }

    if (!user?.token) {
      showError("No hay sesión activa");
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await updateProfile(user.token, {
        name: fullName,
        phone: phone || undefined,
      });

      // Actualizar el estado global del usuario
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
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error: any) {
      showError(error.message || "No se pudo actualizar el perfil");
    } finally {
      setLoading(false);
    }
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
      { text: "Tomar foto", onPress: () => console.log("Take photo") },
      {
        text: "Elegir de galería",
        onPress: () => console.log("Pick from gallery"),
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-5">
      <View className="bg-white">
        <HeaderTopScrenn title="Editar Perfil" isBackButton />
      </View>

      {loadingProfile ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Cargando perfil...</Text>
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
                <View className="w-32 h-32 rounded-full bg-white border-4 border-white overflow-hidden shadow-lg">
                  <Avatar size="lg" name={fullName} className="w-full h-full" />
                </View>
                <TouchableOpacity
                  className="absolute bottom-0 right-0 w-10 h-10 rounded-full items-center justify-center border-4 border-white shadow-md active:opacity-80"
                  style={{ backgroundColor: primaryColor }}
                  onPress={handleChangePhoto}
                >
                  <MaterialIcons
                    name="photo-camera"
                    size={20}
                    color="#0d1c3d"
                  />
                </TouchableOpacity>
              </View>
              <Text className="mt-3 text-xs font-medium text-gray-500">
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
              <Text className="text-gray-500 font-semibold text-sm">
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
