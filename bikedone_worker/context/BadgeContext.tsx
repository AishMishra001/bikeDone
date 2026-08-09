import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { socketService } from '../services/socketService';
import { api, tokenStorage } from '../services/api';
import { dispatchService } from '../services/dispatchService';

interface BadgeContextType {
  unreadCount: number;
  incrementUnread: () => void;
  clearUnread: () => void;
  setActiveChat: (jobId: string | null) => void;
}

const BadgeContext = createContext<BadgeContextType | undefined>(undefined);

export function BadgeProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [mechanicId, setMechanicId] = useState<string | null>(null);
  const activeChatRef = useRef<string | null>(null);

  useEffect(() => {
    const initBadge = async () => {
      try {
        const mechanic = await tokenStorage.getMechanic();
        const targetId = (mechanic as any)?.id || (mechanic as any)?.mechanicId || '4043b9cd-bb8d-495d-af42-6305d72133c6';
        
        if (!targetId) return; // Silent return if not logged in
        setMechanicId(targetId);

        // Load saved unread count
        const { storage } = require('../services/api');
        const savedCount = await storage.get(`UNREAD_COUNT_${targetId}`);
        if (savedCount) {
          setUnreadCount(parseInt(savedCount, 10));
        }
      } catch (e) {
        console.error("Failed to load initial badge state", e);
      }
    };
    initBadge();
  }, []);

  useEffect(() => {
    // Fetch active jobs (assigned, accepted, in_progress, etc.)
    const fetchJobs = async () => {
      if (!mechanicId) return;
      try {
        const activeJob = await dispatchService.getActiveJob(mechanicId);
        if (activeJob && activeJob.id) {
          setActiveJobs([activeJob]);
        } else {
          setActiveJobs([]);
        }
      } catch (e) {
        console.error("Failed to fetch jobs for badges", e);
      }
    };
    if (mechanicId) {
       fetchJobs();
       // Poll every 30s to find new assigned jobs just in case
       const interval = setInterval(fetchJobs, 30000);
       return () => clearInterval(interval);
    }
  }, [mechanicId]);

  useEffect(() => {
    if (activeJobs.length === 0 || !mechanicId) return;

    const unsubscribes: any[] = [];
    
    activeJobs.forEach(job => {
      const unsub = socketService.listenForMessages(job.id, (msg: any) => {
        if (msg.senderId !== mechanicId) { 
            // If the user is currently looking at this chat, don't increment the badge!
            if (activeChatRef.current === job.id) {
                return; 
            }
            setUnreadCount(prev => {
                const newCount = prev + 1;
                const { storage } = require('../services/api');
                storage.set(`UNREAD_COUNT_${mechanicId}`, newCount.toString());
                return newCount;
            });
        }
      });
      unsubscribes.push(unsub);
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [activeJobs, mechanicId]);

  const incrementUnread = () => {
    setUnreadCount(prev => {
        const newCount = prev + 1;
        if (mechanicId) {
           const { storage } = require('../services/api');
           storage.set(`UNREAD_COUNT_${mechanicId}`, newCount.toString());
        }
        return newCount;
    });
  };

  const clearUnread = () => {
    setUnreadCount(0);
    if (mechanicId) {
        const { storage } = require('../services/api');
        storage.set(`UNREAD_COUNT_${mechanicId}`, "0");
    }
  };

  const setActiveChat = (jobId: string | null) => {
    activeChatRef.current = jobId;
    if (jobId) {
       clearUnread(); // clear badge when entering chat
    }
  };

  return (
    <BadgeContext.Provider value={{ unreadCount, incrementUnread, clearUnread, setActiveChat }}>
      {children}
    </BadgeContext.Provider>
  );
}

export function useBadge() {
  const context = useContext(BadgeContext);
  if (context === undefined) {
    throw new Error('useBadge must be used within a BadgeProvider');
  }
  return context;
}
