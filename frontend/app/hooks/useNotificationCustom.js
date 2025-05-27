'use client'
import { notification } from 'antd';
import { useCallback } from 'react';

export default function useNotificationCustom(){
  const [api, contextHolder] = notification.useNotification();
  
  // Use useCallback to prevent recreation on each render
  const openNotificationWithIcon = useCallback((type, message, description, duration) => {
    // This will safely call the notification API
    api[type]({
      message: message,
      description: description,
      duration: duration || null,
    });
  }, [api]);
  
  return {
    contextHolder,
    openNotificationWithIcon,
  }
}


