export interface Batch {
  id: string;
  title: string;
  description: string;
  image: string;
  price: string; // "FREE" or "Paid"
  targetClass?: string;
  subjects?: string[];
}

export interface Lecture {
  id: string;
  batchId: string;
  title: string;
  videoUrl: string;
  order: number;
  subject?: string;
  notesUrl?: string;
}

export interface User {
  name: string;
  role: "admin" | "user";
}

export interface ActiveUserLog {
  name: string;
  timestamp: string;
}

export interface WatchHistoryLog {
  userName: string;
  batchTitle: string;
  lectureTitle: string;
  progress: number;
  timestamp: string;
}

export interface Analytics {
  totalUsers: number;
  batchClicks: Record<string, number>;
  activeUsers: ActiveUserLog[];
  watchHistory: WatchHistoryLog[];
  totalLecturesCount: number;
}
