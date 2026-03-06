import React from "react";
import { View, Text, RefreshControl, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import ExpiringMembershipsAlert from "@/components/ui/ExpiringMembershipsAlert";
import GymSubscriptionAlert from "@/components/ui/GymSubscriptionAlert";
import InactiveClientsAlert from "@/components/ui/InactiveClientsAlert";
import FAB from "@/components/ui/FAB";
import Header from "@/components/ui/Header";
import QuickActionsMenu from "@/components/ui/QuickActionsMenu";
import RecentCheckIns from "@/components/ui/RecentCheckIns";
import { useDashboard } from "./admin/hooks/useDashboard";
import { SummarySection } from "./admin/components/SummarySection";
import { DeniedCard } from "./admin/components/DeniedCard";
import { CashClosureCard } from "./admin/components/CashClosureCard";
import { CashClosureHistoryCard } from "./admin/components/CashClosureHistoryCard";
import { CashClosureModal } from "./admin/components/CashClosureModal";
import { TrendsSection } from "./admin/components/TrendsSection";

export default function DashboardScreen() {
  const router = useRouter();
  const { colors, primaryColor } = useTheme();
  const d = useDashboard();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      className="flex-1"
    >
      <View className="px-4 mt-4">
        <Header username={d.user?.name} avatarUrl={d.user?.avatar} />
        <ScrollView
          className="my-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={d.refreshing}
              onRefresh={d.onRefresh}
              tintColor={primaryColor}
              colors={[primaryColor]}
            />
          }
        >
          {/* Alerta de suscripción por vencer */}
          {!d.isStaff &&
            d.subscriptionDaysLeft !== null &&
            d.subscriptionDaysLeft <= 7 &&
            d.gymSubscription && (
              <GymSubscriptionAlert
                daysLeft={d.subscriptionDaysLeft}
                endDate={d.gymSubscription.endDate}
                plan={d.gymSubscription.plan}
                onPress={() => router.push("/membership" as any)}
              />
            )}

          {/* ─── Admin View ─── */}
          {!d.isStaff && (
            <>
              <SummarySection stats={d.stats} loading={d.loadingStats} />
              <DeniedCard count={d.stats?.todayDenied ?? 0} />

              <View
                style={{
                  flexDirection: "row",
                  gap: 10,
                  marginHorizontal: 6,
                  marginTop: 8,
                }}
              >
                <ExpiringMembershipsAlert
                  count={d.expiringData?.count ?? 0}
                  expiringData={d.expiringData}
                  compact
                />
                <InactiveClientsAlert clients={d.clients} compact />
              </View>

              <CashClosureCard
                cashSummary={d.cashSummary}
                fetchingCashSummary={d.fetchingCashSummary}
                isMutationPending={d.closeCashMutation.isPending}
                onOpenModal={d.openCashClosureModal}
                variant="admin"
              />

              <CashClosureHistoryCard
                cashHistory={d.cashHistory}
                closureDeltaVsPrevious={d.closureDeltaVsPrevious}
                lastClosed={d.lastClosed}
                previousClosed={d.previousClosed}
              />

              <TrendsSection
                weeklyData={d.weeklyData}
                peakHours={d.stats?.peakHours || []}
                activityData={d.activityData}
              />
            </>
          )}

          {/* ─── Staff View ─── */}
          {d.isStaff && (
            <CashClosureCard
              cashSummary={d.cashSummary}
              fetchingCashSummary={d.fetchingCashSummary}
              isMutationPending={d.closeCashMutation.isPending}
              onOpenModal={d.openCashClosureModal}
              variant="staff"
            />
          )}

          {/* ─── Actividad ─── */}
          <Text
            style={{ color: colors.textSecondary }}
            className="text-xs font-bold uppercase tracking-wider px-2 mt-4 mb-1"
          >
            Actividad
          </Text>
          <RecentCheckIns />
        </ScrollView>

        <QuickActionsMenu
          visible={d.isMenuOpen}
          onClose={() => d.setIsMenuOpen(false)}
          onActionPress={d.handleActionPress}
        />
      </View>

      <CashClosureModal
        visible={d.isCashModalOpen}
        expectedCash={d.cashSummary?.expectedCash ?? 0}
        countedCashInput={d.countedCashInput}
        onChangeCountedCash={d.setCountedCashInput}
        cashNotes={d.cashNotes}
        onChangeCashNotes={d.setCashNotes}
        isPending={d.closeCashMutation.isPending}
        onConfirm={d.handleConfirmCashClosure}
        onClose={d.closeCashModal}
      />

      <FAB
        isOpen={d.isMenuOpen}
        onPress={() => d.setIsMenuOpen(!d.isMenuOpen)}
      />
    </SafeAreaView>
  );
}
