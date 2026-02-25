import { useMemo } from "react";
import type React from "react";

/**
 * Hook personalizado para simplificar el uso de skeleton loaders
 * 
 * @example
 * ```tsx
 * // Uso simple
 * const Content = useSkeletonState(loading, SkeletonCard, SummaryCard);
 * <Content {...props} />
 * 
 * // Con props diferentes para skeleton
 * const Content = useSkeletonState(
 *   loading, 
 *   () => <SkeletonCard count={5} />,
 *   (data) => <SummaryCard {...data} />
 * );
 * <Content data={myData} />
 * ```
 */
export function useSkeletonState<T = any>(
  isLoading: boolean,
  SkeletonComponent: React.ComponentType<T> | (() => React.ReactElement),
  DataComponent: React.ComponentType<T> | ((props: T) => React.ReactElement)
) {
  return useMemo(() => {
    return isLoading ? SkeletonComponent : DataComponent;
  }, [isLoading, SkeletonComponent, DataComponent]);
}

/**
 * Hook para determinar si se debe mostrar skeleton basado en estado de carga
 * 
 * @example
 * ```tsx
 * const showSkeleton = useShowSkeleton(loading, data);
 * 
 * {showSkeleton ? <SkeletonList /> : <DataList data={data} />}
 * ```
 */
export function useShowSkeleton(isLoading: boolean, data?: any) {
  return useMemo(() => {
    return isLoading || !data;
  }, [isLoading, data]);
}

/**
 * Hook para manejar múltiples estados de carga
 * 
 * @example
 * ```tsx
 * const { isAnyLoading, allLoaded } = useMultipleLoadingStates([
 *   loadingClients,
 *   loadingStats,
 *   loadingProfile
 * ]);
 * 
 * {isAnyLoading && <SkeletonLoader />}
 * ```
 */
export function useMultipleLoadingStates(loadingStates: boolean[]) {
  return useMemo(() => {
    return {
      isAnyLoading: loadingStates.some((state) => state),
      allLoaded: loadingStates.every((state) => !state),
      loadingCount: loadingStates.filter((state) => state).length,
    };
  }, [loadingStates]);
}
