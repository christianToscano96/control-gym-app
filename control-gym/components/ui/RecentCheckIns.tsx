import React, { useCallback, useMemo } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Avatar from "./Avatar";
import { useTheme } from "@/context/ThemeContext";
import { useRecentCheckInsQuery } from "@/hooks/queries/useDashboard";
import { RecentCheckIn } from "@/api/dashboard";

const membershipLabels: Record<string, string> = {
  basico: "Básico",
  pro: "Pro",
  proplus: "Pro+",
};

const membershipColors: Record<string, { text: string; bg: string }> = {
  basico: { text: "#6366F1", bg: "#EEF2FF" },
  pro: { text: "#7C3AED", bg: "#F5F3FF" },
  proplus: { text: "#DB2777", bg: "#FDF2F8" },
};

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Justo ahora";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Hace ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `Hace ${diffDays}d`;
}

const RecentCheckIns: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { data: checkIns = [], isLoading } = useRecentCheckInsQuery();

  const { allowedCount, deniedCount } = useMemo(() => {
    let allowed = 0;
    let denied = 0;
    for (const c of checkIns) {
      if (c.status === "denied") denied++;
      else allowed++;
    }
    return { allowedCount: allowed, deniedCount: denied };
  }, [checkIns]);

  const renderItem = useCallback(
    ({ item }: { item: RecentCheckIn }) => {
      const isDenied = item.status === "denied";
      const statusColor = isDenied ? colors.error : colors.success;
      const mStyle = membershipColors[item.membershipType] || {
        text: colors.textSecondary,
        bg: isDark ? "#1e293b" : "#F3F4F6",
      };

      return (
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 14,
            padding: 12,
            marginBottom: 8,
            flexDirection: "row",
            alignItems: "center",
            borderWidth: isDark ? 1 : 0,
            borderColor: colors.border,
            shadowColor: isDark ? "transparent" : "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 1,
          }}
        >
          {/* Left accent bar */}
          <View
            style={{
              width: 3,
              height: 32,
              backgroundColor: statusColor,
              borderRadius: 2,
              marginRight: 10,
            }}
          />

          {/* Avatar with status dot */}
          <View>
            <Avatar size="sm" name={item.clientName} />
            <View
              style={{
                position: "absolute",
                bottom: -1,
                right: -1,
                width: 11,
                height: 11,
                borderRadius: 6,
                backgroundColor: statusColor,
                borderWidth: 2,
                borderColor: colors.card,
              }}
            />
          </View>

          {/* Content */}
          <View style={{ flex: 1, marginLeft: 10, marginRight: 8 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Text
                style={{
                  color: colors.text,
                  fontSize: 14,
                  fontWeight: "600",
                  flexShrink: 1,
                }}
                numberOfLines={1}
              >
                {item.clientName}
              </Text>
              <View
                style={{
                  backgroundColor: isDark
                    ? `${mStyle.text}20`
                    : mStyle.bg,
                  paddingHorizontal: 6,
                  paddingVertical: 1.5,
                  borderRadius: 5,
                }}
              >
                <Text
                  style={{
                    color: mStyle.text,
                    fontSize: 9.5,
                    fontWeight: "700",
                    letterSpacing: 0.3,
                  }}
                >
                  {membershipLabels[item.membershipType] ||
                    item.membershipType}
                </Text>
              </View>
            </View>

            {/* Status subtitle */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 2,
                gap: 3,
              }}
            >
              <MaterialIcons
                name={isDenied ? "cancel" : "check-circle"}
                size={12}
                color={statusColor}
              />
              <Text
                style={{
                  color: isDenied ? colors.error : colors.textSecondary,
                  fontSize: 11.5,
                  fontWeight: isDenied ? "600" : "400",
                }}
              >
                {isDenied
                  ? item.denyReason || "Acceso denegado"
                  : "Acceso permitido"}
              </Text>
            </View>
          </View>

          {/* Time */}
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 11,
              fontWeight: "500",
            }}
          >
            {formatTimeAgo(item.date)}
          </Text>
        </View>
      );
    },
    [colors, isDark],
  );

  const keyExtractor = useCallback((item: RecentCheckIn) => item._id, []);

  const listHeader = useMemo(
    () => (
      <View style={{ marginBottom: 12 }}>
        {/* Title */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: 20,
              fontWeight: "800",
            }}
          >
            Check-ins Recientes
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 11,
              fontWeight: "500",
            }}
          >
            Últimas 24h
          </Text>
        </View>

        {/* Mini stats row */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 4 }}>
          {/* Allowed chip */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: isDark ? "#10B98118" : "#ECFDF5",
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 8,
              gap: 5,
            }}
          >
            <MaterialIcons
              name="check-circle"
              size={14}
              color={colors.success}
            />
            <Text
              style={{
                color: colors.success,
                fontSize: 12,
                fontWeight: "700",
              }}
            >
              {allowedCount}
            </Text>
            <Text
              style={{
                color: colors.success,
                fontSize: 11,
                fontWeight: "500",
                opacity: 0.8,
              }}
            >
              permitidos
            </Text>
          </View>

          {/* Denied chip */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: isDark ? "#DC262618" : "#FEF2F2",
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 8,
              gap: 5,
            }}
          >
            <MaterialIcons name="cancel" size={14} color={colors.error} />
            <Text
              style={{
                color: colors.error,
                fontSize: 12,
                fontWeight: "700",
              }}
            >
              {deniedCount}
            </Text>
            <Text
              style={{
                color: colors.error,
                fontSize: 11,
                fontWeight: "500",
                opacity: 0.8,
              }}
            >
              rechazados
            </Text>
          </View>
        </View>
      </View>
    ),
    [colors, isDark, allowedCount, deniedCount],
  );

  const listEmpty = useMemo(
    () =>
      isLoading ? (
        <ActivityIndicator
          color={colors.textSecondary}
          style={{ paddingVertical: 32 }}
        />
      ) : (
        <View
          style={{
            alignItems: "center",
            paddingVertical: 32,
            gap: 8,
          }}
        >
          <MaterialIcons
            name="event-busy"
            size={36}
            color={colors.textSecondary}
            style={{ opacity: 0.5 }}
          />
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 14,
            }}
          >
            Sin check-ins en las últimas 24h
          </Text>
        </View>
      ),
    [isLoading, colors.textSecondary],
  );

  return (
    <View style={{ marginVertical: 20, paddingHorizontal: 1 }}>
      <FlatList
        data={checkIns}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        scrollEnabled={false}
      />
    </View>
  );
};

export default RecentCheckIns;
