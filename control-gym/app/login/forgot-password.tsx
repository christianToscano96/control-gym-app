import { useTheme } from "@/context/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput as RNTextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PrimaryButton from "../../components/ui/ButtonCustom";
import TextField from "../../components/ui/TextField";
import { requestPasswordReset, resetPassword } from "../../api/password";

export const options = { headerShown: false };

type Step = "email" | "code" | "password";

export default function ForgotPasswordScreen() {
  const { primaryColor, colors, isDark } = useTheme();
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(0);

  const codeRefs = useRef<(RNTextInput | null)[]>([]);
  const passwordRef = useRef<RNTextInput>(null);
  const confirmRef = useRef<RNTextInput>(null);

  // Countdown timer para reenvío de código
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const validateEmail = () => {
    if (!email.trim()) return "El email es obligatorio";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email no válido";
    return "";
  };

  // ─── Paso 1: Solicitar código ────────────────────────────────────
  const handleRequestCode = async () => {
    const emailError = validateEmail();
    if (emailError) {
      setError(emailError);
      return;
    }

    setError("");
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setStep("code");
      setCountdown(60);
      setTimeout(() => codeRefs.current[0]?.focus(), 300);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al enviar el código",
      );
    } finally {
      setLoading(false);
    }
  };

  // ─── Reenviar código ─────────────────────────────────────────────
  const handleResendCode = async () => {
    if (countdown > 0) return;
    setError("");
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setCode(["", "", "", "", "", ""]);
      setCountdown(60);
      codeRefs.current[0]?.focus();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al reenviar el código",
      );
    } finally {
      setLoading(false);
    }
  };

  // ─── Manejo de inputs del código OTP ─────────────────────────────
  const handleCodeChange = (text: string, index: number) => {
    // Solo permitir números
    const digit = text.replace(/[^0-9]/g, "");
    if (digit.length > 1) {
      // Pegar código completo
      const digits = digit.slice(0, 6).split("");
      const newCode = [...code];
      digits.forEach((d, i) => {
        if (index + i < 6) newCode[index + i] = d;
      });
      setCode(newCode);
      const nextIndex = Math.min(index + digits.length, 5);
      codeRefs.current[nextIndex]?.focus();
      return;
    }

    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    setError("");

    if (digit && index < 5) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !code[index] && index > 0) {
      const newCode = [...code];
      newCode[index - 1] = "";
      setCode(newCode);
      codeRefs.current[index - 1]?.focus();
    }
  };

  // ─── Paso 2: Verificar código y avanzar ──────────────────────────
  const handleVerifyCode = () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Ingresá el código completo de 6 dígitos");
      return;
    }
    setError("");
    setStep("password");
    setTimeout(() => passwordRef.current?.focus(), 300);
  };

  // ─── Paso 3: Cambiar contraseña ──────────────────────────────────
  const handleResetPassword = async () => {
    if (!newPassword) {
      setError("La contraseña es obligatoria");
      return;
    }
    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await resetPassword(email, code.join(""), newPassword);
      setSuccess("Contraseña cambiada correctamente");
      setTimeout(() => router.replace("/login"), 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cambiar la contraseña",
      );
    } finally {
      setLoading(false);
    }
  };

  // ─── Header con botón volver ─────────────────────────────────────
  const renderHeader = () => (
    <View className="flex-row items-center mb-8">
      <TouchableOpacity
        onPress={() => {
          if (step === "email") {
            router.back();
          } else if (step === "code") {
            setStep("email");
            setCode(["", "", "", "", "", ""]);
            setError("");
          } else {
            setStep("code");
            setError("");
          }
        }}
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: colors.card }}
      >
        <MaterialIcons name="arrow-back" size={22} color={colors.text} />
      </TouchableOpacity>
    </View>
  );

  // ─── Indicador de pasos ──────────────────────────────────────────
  const renderStepIndicator = () => {
    const steps: Step[] = ["email", "code", "password"];
    const currentIndex = steps.indexOf(step);
    return (
      <View className="flex-row items-center justify-center mb-8">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor:
                  i <= currentIndex ? primaryColor : colors.border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {i < currentIndex ? (
                <MaterialIcons name="check" size={16} color="#fff" />
              ) : (
                <Text
                  style={{
                    color: i <= currentIndex ? "#fff" : colors.textSecondary,
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                >
                  {i + 1}
                </Text>
              )}
            </View>
            {i < steps.length - 1 && (
              <View
                style={{
                  width: 40,
                  height: 2,
                  backgroundColor:
                    i < currentIndex ? primaryColor : colors.border,
                  marginHorizontal: 4,
                }}
              />
            )}
          </React.Fragment>
        ))}
      </View>
    );
  };

  // ─── Error banner ────────────────────────────────────────────────
  const renderError = () =>
    error ? (
      <View
        style={{ backgroundColor: "#fef2f2", borderColor: "#fca5a5" }}
        className="flex-row items-center rounded-2xl px-4 py-3 mb-4 border"
      >
        <MaterialIcons name="error-outline" size={20} color="#dc2626" />
        <Text className="text-red-600 text-sm font-medium ml-2 flex-1">
          {error}
        </Text>
      </View>
    ) : null;

  // ─── Success banner ──────────────────────────────────────────────
  const renderSuccess = () =>
    success ? (
      <View
        style={{ backgroundColor: "#f0fdf4", borderColor: "#86efac" }}
        className="flex-row items-center rounded-2xl px-4 py-3 mb-4 border"
      >
        <MaterialIcons name="check-circle" size={20} color="#16a34a" />
        <Text className="text-green-700 text-sm font-medium ml-2 flex-1">
          {success}
        </Text>
      </View>
    ) : null;

  // ─── Paso 1: Email ───────────────────────────────────────────────
  const renderEmailStep = () => (
    <View>
      <View className="items-center mb-6">
        <View
          style={{ backgroundColor: `${primaryColor}20` }}
          className="w-16 h-16 rounded-full items-center justify-center mb-4"
        >
          <MaterialIcons name="lock-reset" size={32} color={primaryColor} />
        </View>
        <Text style={{ color: colors.text }} className="text-2xl font-bold mb-2">
          Recuperar contraseña
        </Text>
        <Text
          style={{ color: colors.textSecondary }}
          className="text-sm text-center px-4"
        >
          Ingresá tu email y te enviaremos un código de 6 dígitos para
          restablecer tu contraseña
        </Text>
      </View>

      {renderError()}

      <View>
        <Text
          style={{ color: colors.text }}
          className="text-sm font-semibold pb-2 px-1"
        >
          Email
        </Text>
        <View className="relative">
          <View className="absolute left-4 top-8 -translate-y-1/2 z-10">
            <MaterialIcons
              name="alternate-email"
              size={20}
              color={error ? "#ef4444" : colors.textSecondary}
            />
          </View>
          <TextField
            placeholder="admin@gym.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) setError("");
            }}
            className={`w-full rounded-2xl h-14 pl-12 pr-4 text-base font-normal border-0 ${error ? "border-2 border-red-500" : ""}`}
            style={{ backgroundColor: colors.card, color: colors.text }}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="done"
            onSubmitEditing={handleRequestCode}
          />
        </View>
      </View>

      <View className="mt-6">
        <PrimaryButton
          title={loading ? "" : "Enviar código"}
          onPress={handleRequestCode}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#1F2937" />
          ) : null}
        </PrimaryButton>
      </View>
    </View>
  );

  // ─── Paso 2: Código OTP ──────────────────────────────────────────
  const renderCodeStep = () => (
    <View>
      <View className="items-center mb-6">
        <View
          style={{ backgroundColor: `${primaryColor}20` }}
          className="w-16 h-16 rounded-full items-center justify-center mb-4"
        >
          <MaterialIcons name="pin" size={32} color={primaryColor} />
        </View>
        <Text style={{ color: colors.text }} className="text-2xl font-bold mb-2">
          Ingresá el código
        </Text>
        <Text
          style={{ color: colors.textSecondary }}
          className="text-sm text-center px-4"
        >
          Enviamos un código de 6 dígitos a{" "}
          <Text style={{ color: colors.text }} className="font-semibold">
            {email}
          </Text>
        </Text>
      </View>

      {renderError()}

      {/* Inputs del código OTP */}
      <View className="flex-row justify-center mb-6" style={{ gap: 8 }}>
        {code.map((digit, index) => (
          <RNTextInput
            key={index}
            ref={(ref) => {
              codeRefs.current[index] = ref;
            }}
            value={digit}
            onChangeText={(text) => handleCodeChange(text, index)}
            onKeyPress={({ nativeEvent }) =>
              handleCodeKeyPress(nativeEvent.key, index)
            }
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            style={{
              width: 48,
              height: 56,
              borderRadius: 12,
              backgroundColor: colors.card,
              borderWidth: 2,
              borderColor: digit
                ? primaryColor
                : error
                  ? "#ef4444"
                  : colors.border,
              textAlign: "center",
              fontSize: 24,
              fontWeight: "bold",
              color: colors.text,
            }}
          />
        ))}
      </View>

      {/* Reenviar código */}
      <View className="items-center mb-6">
        {countdown > 0 ? (
          <Text style={{ color: colors.textSecondary }} className="text-sm">
            Reenviar código en{" "}
            <Text className="font-bold">{countdown}s</Text>
          </Text>
        ) : (
          <TouchableOpacity onPress={handleResendCode} disabled={loading}>
            <Text style={{ color: primaryColor }} className="text-sm font-bold">
              Reenviar código
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <PrimaryButton
        title={loading ? "" : "Verificar código"}
        onPress={handleVerifyCode}
        disabled={loading || code.join("").length !== 6}
      >
        {loading ? <ActivityIndicator size="small" color="#1F2937" /> : null}
      </PrimaryButton>
    </View>
  );

  // ─── Paso 3: Nueva contraseña ────────────────────────────────────
  const renderPasswordStep = () => (
    <View>
      <View className="items-center mb-6">
        <View
          style={{ backgroundColor: `${primaryColor}20` }}
          className="w-16 h-16 rounded-full items-center justify-center mb-4"
        >
          <MaterialIcons name="vpn-key" size={32} color={primaryColor} />
        </View>
        <Text style={{ color: colors.text }} className="text-2xl font-bold mb-2">
          Nueva contraseña
        </Text>
        <Text
          style={{ color: colors.textSecondary }}
          className="text-sm text-center px-4"
        >
          Elegí una contraseña segura de al menos 6 caracteres
        </Text>
      </View>

      {renderError()}
      {renderSuccess()}

      {/* Nueva contraseña */}
      <View className="mb-2">
        <Text
          style={{ color: colors.text }}
          className="text-sm font-semibold pb-2 px-1"
        >
          Nueva contraseña
        </Text>
        <View className="relative">
          <View className="absolute left-4 top-8 -translate-y-1/2 z-10">
            <MaterialIcons
              name="lock"
              size={20}
              color={error ? "#ef4444" : colors.textSecondary}
            />
          </View>
          <TextField
            ref={passwordRef}
            placeholder="••••••••"
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              if (error) setError("");
            }}
            secureTextEntry={!showPassword}
            rightIcon={
              <MaterialIcons
                name={showPassword ? "visibility-off" : "visibility"}
                size={20}
                color={colors.textSecondary}
              />
            }
            onRightIconPress={() => setShowPassword(!showPassword)}
            className={`w-full rounded-2xl h-14 pl-12 pr-12 text-base font-normal border-0 ${error ? "border-2 border-red-500" : ""}`}
            style={{ backgroundColor: colors.card, color: colors.text }}
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => confirmRef.current?.focus()}
          />
        </View>
      </View>

      {/* Confirmar contraseña */}
      <View className="mb-2">
        <Text
          style={{ color: colors.text }}
          className="text-sm font-semibold pb-2 px-1"
        >
          Confirmar contraseña
        </Text>
        <View className="relative">
          <View className="absolute left-4 top-8 -translate-y-1/2 z-10">
            <MaterialIcons
              name="lock-outline"
              size={20}
              color={error ? "#ef4444" : colors.textSecondary}
            />
          </View>
          <TextField
            ref={confirmRef}
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (error) setError("");
            }}
            secureTextEntry={!showConfirmPassword}
            rightIcon={
              <MaterialIcons
                name={showConfirmPassword ? "visibility-off" : "visibility"}
                size={20}
                color={colors.textSecondary}
              />
            }
            onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
            className={`w-full rounded-2xl h-14 pl-12 pr-12 text-base font-normal border-0 ${error ? "border-2 border-red-500" : ""}`}
            style={{ backgroundColor: colors.card, color: colors.text }}
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={handleResetPassword}
          />
        </View>
      </View>

      <View className="mt-4">
        <PrimaryButton
          title={loading ? "" : "Cambiar contraseña"}
          onPress={handleResetPassword}
          disabled={loading || !!success}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#1F2937" />
          ) : null}
        </PrimaryButton>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      className="flex-1"
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={{ backgroundColor: colors.background }}
            className="flex-1 max-w-[430px] w-full mx-auto"
          >
            <View className="flex-1 px-8 pt-12 pb-10">
              {renderHeader()}
              {renderStepIndicator()}

              {step === "email" && renderEmailStep()}
              {step === "code" && renderCodeStep()}
              {step === "password" && renderPasswordStep()}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
