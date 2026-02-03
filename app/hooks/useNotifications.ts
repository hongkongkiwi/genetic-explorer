import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';

export type NotificationType = 
  | 'research_update' 
  | 'sharing_invite' 
  | 'genome_complete' 
  | 'system' 
  | 'security';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
  unreadCount: number;
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export function useNotifications() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { 
    data, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: async (): Promise<NotificationsResponse> => {
      const response = await fetch('/api/notifications');
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      return response.json();
    },
    enabled: isAuthenticated,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });

  // Mark as read mutation
  const markAsRead = useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      if (!response.ok) {
        throw new Error('Failed to mark as read');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mark all as read mutation
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      if (!response.ok) {
        throw new Error('Failed to mark all as read');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Delete notification mutation
  const deleteNotification = useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await fetch(`/api/notifications?ids=${ids.join(',')}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    notifications: data?.notifications || [],
    unreadCount: data?.unreadCount || 0,
    isLoading,
    error,
    refetch,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    deleteNotification: deleteNotification.mutate,
    isMarkingAsRead: markAsRead.isPending,
    isMarkingAllAsRead: markAllAsRead.isPending,
    isDeleting: deleteNotification.isPending,
  };
}

// Hook for creating notifications (admin/internal use)
export function useCreateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notification: {
      type: NotificationType;
      title: string;
      message: string;
      data?: Record<string, any>;
      userId?: string;
    }) => {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification),
      });
      if (!response.ok) {
        throw new Error('Failed to create notification');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
