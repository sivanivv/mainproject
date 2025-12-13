import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/app/";

export default function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);

  const getAuthHeaders = () => ({
    headers: { Authorization: `Token ${localStorage.getItem("token")}` }
  });

  const fetchUnread = async () => {
    try {
      const res = await axios.get(API_BASE + "notifications/", getAuthHeaders());
      const unread = res.data.filter(n => n.status === "unread").length;
      setUnreadCount(unread);
    } catch (err) {
      console.log("Error fetching unread notifications");
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, []);

  return { unreadCount, refreshNotifications: fetchUnread };
}
