import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Search,
  Lock,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  Play,
  CheckCircle,
  Eye,
  Heart,
  Sparkles,
  Users,
  MousePointerClick,
  Activity,
  ArrowLeft,
  Tv,
  Check,
  ChevronRight,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  User,
  ExternalLink,
  AlertTriangle,
  Loader2,
  Moon,
  Sun,
  Download,
  FileText,
  ShieldCheck,
  UserPlus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Batch, Lecture, Analytics, ActiveUserLog, WatchHistoryLog } from "./types";
import { StudyKeyLogo } from "./components/StudyKeyLogo";

export default function App() {
  // Session / Authentication state
  const [sessionUser, setSessionUser] = useState<{ name: string; role: "admin" | "user" } | null>(() => {
    const saved = localStorage.getItem("study_key_user");
    return saved ? JSON.parse(saved) : null;
  });

  // Theme configuration (Interactive Theme Mode Toggle)
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("study_key_theme");
    return (saved as "light" | "dark") || "dark";
  });

  useEffect(() => {
    const root = document.getElementById("app-root-container");
    if (root) {
      if (theme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
    localStorage.setItem("study_key_theme", theme);
  }, [theme]);

  // Entry process step
  const [tempName, setTempName] = useState("");
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSubmittingEntry, setIsSubmittingEntry] = useState(false);

  // Core Data state
  const [batches, setBatches] = useState<Batch[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [isLoadingLectures, setIsLoadingLectures] = useState(false);

  // Navigation states
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [userSelectedSubject, setUserSelectedSubject] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTab, setCurrentTab] = useState<"all" | "wishlisted">("all");

  // User Local Storage Preferences
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const savedUser = localStorage.getItem("study_key_user");
    const userObj = savedUser ? JSON.parse(savedUser) : null;
    if (userObj) {
      const saved = localStorage.getItem(`study_key_wishlist_${userObj.name}`);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Tracked Video Playback status (timestamp markers)
  const [playbackHistory, setPlaybackHistory] = useState<Record<string, number>>(() => {
    const savedUser = localStorage.getItem("study_key_user");
    const userObj = savedUser ? JSON.parse(savedUser) : null;
    if (userObj) {
      const saved = localStorage.getItem(`study_key_playback_history_${userObj.name}`);
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  // Tracked Video Playback status (progress percentage)
  const [lectureProgressPercent, setLectureProgressPercent] = useState<Record<string, number>>(() => {
    const savedUser = localStorage.getItem("study_key_user");
    const userObj = savedUser ? JSON.parse(savedUser) : null;
    if (userObj) {
      const saved = localStorage.getItem(`study_key_lecture_progress_percent_${userObj.name}`);
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  // Admin CRUD states
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [batchFormTitle, setBatchFormTitle] = useState("");
  const [batchFormDesc, setBatchFormDesc] = useState("");
  const [batchFormClass, setBatchFormClass] = useState("Class 10th");
  const [batchFormImg, setBatchFormImg] = useState("");
  const [batchFormPrice, setBatchFormPrice] = useState("FREE");
  const [batchFormSubjects, setBatchFormSubjects] = useState<string[]>(["Science", "Maths", "Social Science", "Hindi", "English"]);
  const [newSubjectInput, setNewSubjectInput] = useState("");
  const [isSavingBatch, setIsSavingBatch] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // Custom dialog state for safe iframe operation
  const [batchToDelete, setBatchToDelete] = useState<string | null>(null);
  const [lectureToDelete, setLectureToDelete] = useState<string | null>(null);

  const [showLectureForm, setShowLectureForm] = useState(false);
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);
  const [lectureFormTitle, setLectureFormTitle] = useState("");
  const [lectureFormVideo, setLectureFormVideo] = useState("");
  const [lectureFormNotes, setLectureFormNotes] = useState("");
  const [lectureFormOrder, setLectureFormOrder] = useState(1);
  const [lectureFormSubject, setLectureFormSubject] = useState("Science");
  const [isSavingLecture, setIsSavingLecture] = useState(false);

  // Admin List Management states
  const [adminsList, setAdminsList] = useState<string[]>(["@you_yuvraj_"]);
  const [newAdminName, setNewAdminName] = useState("");
  const [isSavingAdmin, setIsSavingAdmin] = useState(false);

  // Inline Notification feedback helper
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // References
  const videoPlayerRef = useRef<HTMLVideoElement | null>(null);
  const videoIntervalRef = useRef<number | null>(null);

  // Trigger temporary floating messages
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load user-specific data when session user changes
  useEffect(() => {
    if (sessionUser) {
      if (sessionUser.role === "admin") {
        setWishlist([]);
        setPlaybackHistory({});
        setLectureProgressPercent({});
      } else {
        const savedWishlist = localStorage.getItem(`study_key_wishlist_${sessionUser.name}`);
        setWishlist(savedWishlist ? JSON.parse(savedWishlist) : []);

        const savedPlayback = localStorage.getItem(`study_key_playback_history_${sessionUser.name}`);
        setPlaybackHistory(savedPlayback ? JSON.parse(savedPlayback) : {});

        const savedProgress = localStorage.getItem(`study_key_lecture_progress_percent_${sessionUser.name}`);
        setLectureProgressPercent(savedProgress ? JSON.parse(savedProgress) : {});
      }
    } else {
      setWishlist([]);
      setPlaybackHistory({});
      setLectureProgressPercent({});
    }
  }, [sessionUser]);

  // Sync Preferences to memory
  useEffect(() => {
    if (sessionUser && sessionUser.role !== "admin") {
      localStorage.setItem(`study_key_wishlist_${sessionUser.name}`, JSON.stringify(wishlist));
    }
  }, [wishlist, sessionUser]);

  useEffect(() => {
    if (sessionUser && sessionUser.role !== "admin") {
      localStorage.setItem(`study_key_playback_history_${sessionUser.name}`, JSON.stringify(playbackHistory));
    }
  }, [playbackHistory, sessionUser]);

  useEffect(() => {
    if (sessionUser && sessionUser.role !== "admin") {
      localStorage.setItem(`study_key_lecture_progress_percent_${sessionUser.name}`, JSON.stringify(lectureProgressPercent));
    }
  }, [lectureProgressPercent, sessionUser]);

  // Read batches on load, and analytics if admin
  const fetchBatches = async () => {
    setIsLoadingBatches(true);
    try {
      const res = await fetch("/api/batches");
      if (res.ok) {
        const data = await res.json();
        setBatches(data);
      }
    } catch (e) {
      console.error("Error loading batches: ", e);
    } finally {
      setIsLoadingBatches(false);
    }
  };

  const fetchLecturesForBatch = async (batchId: string) => {
    setIsLoadingLectures(true);
    try {
      const res = await fetch(`/api/lectures/${batchId}`);
      if (res.ok) {
        const data = await res.json();
        setLectures(data);
      }
    } catch (e) {
      console.error("Error fetching lectures:", e);
    } finally {
      setIsLoadingLectures(false);
    }
  };

  const fetchAdminAnalytics = async () => {
    if (!sessionUser || sessionUser.role !== "admin") return;
    try {
      const res = await fetch("/api/admin/analytics");
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (e) {
      console.error("Error loading analytics: ", e);
    }
  };

  // Initial loads
  useEffect(() => {
    fetchBatches();
    if (sessionUser && sessionUser.role === "admin") {
      fetchAdminAnalytics();
      fetchAdmins();
    }
  }, [sessionUser]);

  // Automatically refresh admin analytics every 15 seconds while Admin is active
  useEffect(() => {
    if (sessionUser?.role === "admin") {
      const timer = setInterval(() => {
        fetchAdminAnalytics();
      }, 15000);
      return () => clearInterval(timer);
    }
  }, [sessionUser]);

  // Send active heartbeat ping to keep session online
  useEffect(() => {
    if (!sessionUser) return;
    
    const sendPing = async () => {
      try {
        await fetch("/api/users/ping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: sessionUser.name })
        });
      } catch (err) {
        console.error("Failed to ping server:", err);
      }
    };
    
    // Initial ping when logged in
    sendPing();

    const interval = setInterval(sendPing, 10000);
    return () => clearInterval(interval);
  }, [sessionUser]);

  // Video progress synchronization with server
  useEffect(() => {
    if (!selectedLecture || !sessionUser) return;

    // Reset loop
    if (videoIntervalRef.current) {
      clearInterval(videoIntervalRef.current);
    }

    // Capture state periodically to report
    videoIntervalRef.current = window.setInterval(() => {
      if (videoPlayerRef.current) {
        const duration = videoPlayerRef.current.duration || 1;
        const current = videoPlayerRef.current.currentTime || 0;
        const pct = Math.floor((current / duration) * 100);

        // Save locally
        setPlaybackHistory(prev => ({
          ...prev,
          [selectedLecture.id]: current
        }));

        if (pct > 0) {
          setLectureProgressPercent(prev => {
            const lastPct = prev[selectedLecture.id] || 0;
            if (pct > lastPct) {
              return {
                ...prev,
                [selectedLecture.id]: pct
              };
            }
            return prev;
          });
        }

        // Put forward server notification index
        if (pct > 2 && pct <= 100) {
          fetch("/api/lectures/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userName: sessionUser.name,
              batchId: selectedBatch?.id,
              lectureId: selectedLecture.id,
              progress: pct
            })
          }).catch(err => console.log("Progress telemetry error ignored: ", err));
        }
      }
    }, 7000); // 7-second intervals for stable update

    return () => {
      if (videoIntervalRef.current) {
        clearInterval(videoIntervalRef.current);
      }
    };
  }, [selectedLecture, sessionUser, selectedBatch]);

  // Robust on-demand source loading supporting both HLS (.m3u8) as well as MP4 videos
  useEffect(() => {
    const video = videoPlayerRef.current;
    if (!video || !selectedLecture) return;

    const isYt = selectedLecture.videoUrl.toLowerCase().includes("youtube.com") || 
                 selectedLecture.videoUrl.toLowerCase().includes("youtu.be");
    if (isYt) return;

    const isHls = selectedLecture.videoUrl.toLowerCase().includes(".m3u8");
    let hlsInstance: any = null;

    if (isHls) {
      const initHls = () => {
        const Hls = (window as any).Hls;
        if (Hls) {
          if (Hls.isSupported()) {
            hlsInstance = new Hls({
              xhrSetup: (xhr: any) => {
                xhr.withCredentials = false;
              }
            });
            hlsInstance.loadSource(`/api/video-stream/${selectedLecture.id}/index.m3u8`);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
              video.play().catch(() => {});
            });
            hlsInstance.on(Hls.Events.ERROR, (event: any, data: any) => {
              if (data.fatal) {
                switch (data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                    console.warn("Fatal HLS network error, attempting direct fallback...");
                    if (video && video.src !== selectedLecture.videoUrl) {
                      hlsInstance.destroy();
                      video.src = selectedLecture.videoUrl;
                      video.load();
                      video.play().catch(() => {});
                    }
                    break;
                  case Hls.ErrorTypes.MEDIA_ERROR:
                    console.warn("Fatal HLS media error, attempting recovery...");
                    hlsInstance.recoverMediaError();
                    break;
                  default:
                    hlsInstance.destroy();
                    break;
                }
              }
            });
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = `/api/video-stream/${selectedLecture.id}/index.m3u8`;
          }
        }
      };

      if (!(window as any).Hls) {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.8/dist/hls.min.js";
        script.onload = initHls;
        document.body.appendChild(script);
      } else {
        initHls();
      }
    } else {
      // Direct streaming MP4 connection
      video.src = `/api/video-stream/${selectedLecture.id}/video.mp4`;
      video.load(); // CRITICAL: Ensures browser updates the loaded source instantly
    }

    return () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
      // Release standard video src resource bindings cleanly on cleanup
      video.removeAttribute("src");
      video.load();
    };
  }, [selectedLecture]);

  // Restore playback state when video loads
  const handleVideoLoaded = () => {
    if (videoPlayerRef.current && selectedLecture) {
      const lastSeconds = playbackHistory[selectedLecture.id] || 0;
      if (lastSeconds > 5) {
        videoPlayerRef.current.currentTime = lastSeconds;
        showToast(`Resumed playback from ${Math.floor(lastSeconds / 60)}m ${Math.floor(lastSeconds % 60)}s`);
      }
    }
  };

  // Trigger next video in sequence/queue when current video finishes playing
  const handleVideoEnded = () => {
    if (!selectedLecture || lectures.length === 0) return;
    const currentIndex = lectures.findIndex((l) => l.id === selectedLecture.id);
    if (currentIndex !== -1 && currentIndex < lectures.length - 1) {
      const nextLecture = lectures[currentIndex + 1];
      setSelectedLecture(nextLecture);
      showToast(`Auto-playing next: ${nextLecture.title}`);
    } else {
      showToast("Completed the last lecture in this course!");
    }
  };

  // Gracefully handle video loading errors with fallback directly to source URL
  const handleVideoError = () => {
    const video = videoPlayerRef.current;
    if (!video || !selectedLecture) return;

    const fallbackUrl = "https://www.w3schools.com/html/mov_bbb.mp4";

    if (video.src === selectedLecture.videoUrl) {
      if (video.src === fallbackUrl) {
        console.error("Ultimate fallback source also failed loading.");
        return;
      }
      console.warn("Direct fallback source failed. Trying ultimate functional fallback stream...");
      showToast("Video stream unavailable. Playing fallback lecture clip.");
      video.src = fallbackUrl;
      video.load();
      video.play().catch((err) => {
        console.warn("Ultimate fallback autostart was blocked or failed:", err);
      });
      return;
    }

    console.warn("Proxy streaming failed. Falling back to direct URL directly for smooth play.");
    video.src = selectedLecture.videoUrl;
    video.load();
    video.play().catch((err) => {
      console.warn("Direct URL playback autostart was blocked or failed:", err);
    });
  };

  // Parse any YouTube format (watch, live, share) into embeddable format
  const getYouTubeEmbedUrl = (url: string): string => {
    if (!url) return "";
    let videoId = "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|live\/|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : url;
  };

  // Toggle user wishlist
  const toggleWishlist = (batchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (wishlist.includes(batchId)) {
      setWishlist(prev => prev.filter(id => id !== batchId));
      showToast("Removed from wishlisted courses");
    } else {
      setWishlist(prev => [...prev, batchId]);
      showToast("Added to your wishlist!");
    }
  };

  // Submit entry screen credentials
  const handleEntrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const nameText = tempName.trim();
    if (!nameText) {
      setLoginError("Please type a valid study name!");
      return;
    }

    // Admin detection check (any name starting with @ is treated as admin and requires password)
    const isNameAdmin = nameText.startsWith("@");
    if (isNameAdmin) {
      if (!isAdminMode) {
        setIsAdminMode(true);
        return;
      }

      if (adminPassword !== "a1b2c3@@@") {
        setLoginError("Invalid password. Please double check credentials or register as student.");
        return;
      }
    }

    setIsSubmittingEntry(true);
    try {
      const res = await fetch("/api/users/enter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameText })
      });

      if (res.ok) {
        const result = await res.json();
        const authedUser = result.user;
        setSessionUser(authedUser);
        localStorage.setItem("study_key_user", JSON.stringify(authedUser));
        showToast(`Welcome back, ${authedUser.name}! Welcome to Study Key.`);
      } else {
        let errorMsg = "Server rejected connection. Please try again.";
        try {
          const result = await res.json();
          if (result && result.error) {
            errorMsg = result.error;
          }
        } catch (e) {}
        setLoginError(errorMsg);
      }
    } catch (err) {
      setLoginError("Connection failed. Check local backend status.");
    } finally {
      setIsSubmittingEntry(false);
    }
  };

  // Handle study launch click
  const studyBatch = async (batch: Batch) => {
    if (batch.price && batch.price.toLowerCase() === "paid") {
      showToast("Batch Locked");
      return;
    }
    setSelectedBatch(batch);
    setUserSelectedSubject("All");
    fetchLecturesForBatch(batch.id);

    // Track analytics event
    fetch("/api/batches/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batchId: batch.id })
    }).catch(e => console.log("Click tracking error", e));
  };

  const logout = () => {
    localStorage.removeItem("study_key_user");
    setSessionUser(null);
    setWishlist([]);
    setTempName("");
    setAdminPassword("");
    setIsAdminMode(false);
    setSelectedBatch(null);
    setSelectedLecture(null);
  };

  // Admin list management calls
  const fetchAdmins = async () => {
    try {
      const res = await fetch("/api/admin/list");
      if (res.ok) {
        const data = await res.json();
        if (data.admins) {
          setAdminsList(data.admins);
        }
      }
    } catch (e) {
      console.error("Error loading admins: ", e);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionUser || sessionUser.role !== "admin") {
      showToast("Access Denied: Only administrators can add other admins.");
      return;
    }
    if (sessionUser.name !== "@you_yuvraj_") {
      showToast("Access Denied: Only the primary super-admin (@you_yuvraj_) can delegate admin privileges.");
      return;
    }
    const targetName = newAdminName.trim();
    if (!targetName) {
      showToast("Please enter a username to add as admin");
      return;
    }
    setIsSavingAdmin(true);
    try {
      const res = await fetch("/api/admin/add", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-admin-requestor": sessionUser.name
        },
        body: JSON.stringify({ name: targetName })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.admins) {
          setAdminsList(data.admins);
          setNewAdminName("");
          showToast(`Admin "${targetName}" added successfully.`);
        }
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to add admin");
      }
    } catch (e) {
      showToast("Error adding administrator");
    } finally {
      setIsSavingAdmin(false);
    }
  };

  const handleRemoveAdmin = async (name: string) => {
    if (!sessionUser || sessionUser.role !== "admin") {
      showToast("Access Denied: Only administrators can remove admins.");
      return;
    }
    if (sessionUser.name !== "@you_yuvraj_") {
      showToast("Access Denied: Only the primary super-admin (@you_yuvraj_) can revoke admin privileges.");
      return;
    }
    if (name === "@you_yuvraj_") {
      showToast("Cannot remove the primary super-admin.");
      return;
    }
    try {
      const res = await fetch("/api/admin/remove", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-admin-requestor": sessionUser.name
        },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.admins) {
          setAdminsList(data.admins);
          showToast(`Admin "${name}" removed successfully.`);
        }
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to remove admin");
      }
    } catch (e) {
      showToast("Error removing administrator");
    }
  };

  // Admin CRUD action implementations
  const handleSaveBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionUser || sessionUser.role !== "admin") {
      showToast("Access Denied: Only administrators can create or edit batches.");
      return;
    }
    if (!batchFormTitle.trim() || !batchFormDesc.trim()) {
      showToast("Title and Description are absolutely required!");
      return;
    }

    setIsSavingBatch(true);
    const payload = {
      id: editingBatch?.id || undefined,
      title: batchFormTitle.trim(),
      description: batchFormDesc.trim(),
      image: batchFormImg.trim() || "/src/assets/images/summer_camp_thumb_1781793281839.jpg",
      price: batchFormPrice,
      targetClass: batchFormClass.trim() || "Class 10th",
      subjects: batchFormSubjects
    };

    try {
      const res = await fetch("/api/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast(editingBatch ? "Batch details updated successfully!" : "New Batch created successfully!");
        await fetchBatches();
        resetBatchForm();
      } else {
        showToast("Error while saving the batch.");
      }
    } catch (err) {
      showToast("Network error during operation.");
    } finally {
      setIsSavingBatch(false);
    }
  };

  const handleEditBatch = (batch: Batch) => {
    if (!sessionUser || sessionUser.role !== "admin") {
      showToast("Access Denied: Only administrators can edit batches.");
      return;
    }
    setEditingBatch(batch);
    setBatchFormTitle(batch.title);
    setBatchFormDesc(batch.description);
    setBatchFormClass(batch.targetClass || "Class 10th");
    setBatchFormImg(batch.image);
    setBatchFormPrice(batch.price);
    setBatchFormSubjects(batch.subjects || ["Science", "Maths", "Social Science", "Hindi", "English"]);
    setShowBatchForm(true);
  };

  const handleDeleteBatch = (id: string) => {
    if (!sessionUser || sessionUser.role !== "admin") {
      showToast("Access Denied: Only administrators can delete batches.");
      return;
    }
    setBatchToDelete(id);
  };

  const executeDeleteBatch = async (id: string) => {
    if (!sessionUser || sessionUser.role !== "admin") {
      showToast("Access Denied: Only administrators can delete batches.");
      return;
    }
    try {
      const res = await fetch(`/api/batches/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Batch deleted successfully!");
        if (selectedBatch?.id === id) {
          setSelectedBatch(null);
          setSelectedLecture(null);
        }
        fetchBatches();
        fetchAdminAnalytics();
      }
    } catch (err) {
      showToast("Could not communicate with the backend database.");
    } finally {
      setBatchToDelete(null);
    }
  };

  const resetBatchForm = () => {
    setEditingBatch(null);
    setBatchFormTitle("");
    setBatchFormDesc("");
    setBatchFormClass("Class 10th");
    setBatchFormImg("");
    setBatchFormPrice("FREE");
    setBatchFormSubjects(["Science", "Maths", "Social Science", "Hindi", "English"]);
    setNewSubjectInput("");
    setShowBatchForm(false);
  };

  const handleImageFileLoad = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Only image files are permitted!");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      showToast("Please upload an image smaller than 50MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setBatchFormImg(dataUrl);
        showToast("Thumbnail uploaded successfully.");
      }
    };
    reader.onerror = () => {
      showToast("Failed to read the file.");
    };
    reader.readAsDataURL(file);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageFileLoad(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleImageFileLoad(files[0]);
    }
  };

  // Lecture CRUD action implementations
  const handleSaveLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionUser || sessionUser.role !== "admin") {
      showToast("Access Denied: Only administrators can save lectures.");
      return;
    }
    if (!selectedBatch) return;

    if (!lectureFormTitle.trim() || !lectureFormVideo.trim()) {
      showToast("Lecture Title and Video stream URL are fully required.");
      return;
    }

    setIsSavingLecture(true);
    const payload = {
      id: editingLecture?.id || undefined,
      batchId: selectedBatch.id,
      title: lectureFormTitle.trim(),
      videoUrl: lectureFormVideo.trim(),
      notesUrl: lectureFormNotes.trim(),
      order: Number(lectureFormOrder) || 1,
      subject: lectureFormSubject
    };

    try {
      const res = await fetch("/api/lectures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast(editingLecture ? "Lecture optimized and saved permanently!" : "Lecture appended and saved permanently!");
        await fetchLecturesForBatch(selectedBatch.id);
        resetLectureForm();
        fetchAdminAnalytics();
      } else {
        showToast("Invalid video record structure.");
      }
    } catch (err) {
      showToast("Error saving lecture permanently.");
    } finally {
      setIsSavingLecture(false);
    }
  };

  const handleEditLecture = (lecture: Lecture) => {
    if (!sessionUser || sessionUser.role !== "admin") {
      showToast("Access Denied: Only administrators can edit lectures.");
      return;
    }
    setEditingLecture(lecture);
    setLectureFormTitle(lecture.title);
    setLectureFormVideo(lecture.videoUrl);
    setLectureFormNotes(lecture.notesUrl || "");
    setLectureFormOrder(lecture.order);
    setLectureFormSubject(lecture.subject || (selectedBatch?.subjects?.[0] || "Science"));
    setShowLectureForm(true);
  };

  const handleDeleteLecture = (id: string) => {
    if (!sessionUser || sessionUser.role !== "admin") {
      showToast("Access Denied: Only administrators can delete lectures.");
      return;
    }
    setLectureToDelete(id);
  };

  const executeDeleteLecture = async (id: string) => {
    if (!sessionUser || sessionUser.role !== "admin") {
      showToast("Access Denied: Only administrators can delete lectures.");
      return;
    }
    try {
      const res = await fetch(`/api/lectures/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Lecture deleted successfully.");
        if (selectedLecture?.id === id) {
          setSelectedLecture(null);
        }
        if (selectedBatch) {
          fetchLecturesForBatch(selectedBatch.id);
        }
        fetchAdminAnalytics();
      }
    } catch (err) {
      showToast("Network fault during query processing.");
    } finally {
      setLectureToDelete(null);
    }
  };

  const resetLectureForm = () => {
    setEditingLecture(null);
    setLectureFormTitle("");
    setLectureFormVideo("");
    setLectureFormNotes("");
    setLectureFormOrder(lectures.length + 1);
    setLectureFormSubject(selectedBatch?.subjects?.[0] || "Science");
    setShowLectureForm(false);
  };

  // Filter batches for visitor search query
  const filteredBatches = batches.filter(b => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = b.title.toLowerCase().includes(query) || b.description.toLowerCase().includes(query);
    if (currentTab === "wishlisted") {
      return matchesSearch && wishlist.includes(b.id);
    }
    return matchesSearch;
  });

  return (
    <div id="app-root-container" className="min-h-screen bg-[#FFFDF9] text-gray-800 font-sans flex flex-col antialiased">
      
      {/* Dynamic Toast Feedback Overlay */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 right-4 z-50 bg-gray-900 text-white text-xs md:text-sm px-4 py-3 rounded-lg shadow-2xl border border-gray-700/60 flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
            <span className="font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Confirmation Modal for Batch Deletion */}
      <AnimatePresence>
        {batchToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-blue-900/40 flex flex-col space-y-4"
            >
              <div className="flex items-center space-x-3 text-red-600">
                <div className="p-2 bg-red-50 rounded-full">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Delete Batch?</h3>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Are you sure you want to permanently delete this batch? All lecture video targets inside this batch will be permanently and cascade-deleted. This action cannot be reverted.
              </p>
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBatchToDelete(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/10 hover:shadow-red-700/20 active:translate-y-0.5 transition"
                  onClick={() => executeDeleteBatch(batchToDelete)}
                >
                  Yes, Delete Batch
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Confirmation Modal for Lecture Deletion */}
      <AnimatePresence>
        {lectureToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-blue-900/40 flex flex-col space-y-4"
            >
              <div className="flex items-center space-x-3 text-red-600">
                <div className="p-2 bg-red-50 rounded-full">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Delete Lecture Video?</h3>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Are you sure you want to delete this lecture video target from current batch syllabus?
              </p>
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setLectureToDelete(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/10 hover:shadow-red-700/20 active:translate-y-0.5 transition"
                  onClick={() => executeDeleteLecture(lectureToDelete)}
                >
                  Yes, Delete Lecture
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 👤 ENTRY LEVEL SECURITY SCREEN (IF NO ACTIVE SESSION INSTALLED) */}
      {!sessionUser ? (
        <div id="auth-flow-section" className="flex-1 flex items-center justify-center py-10 px-4 bg-[#05070c] relative overflow-hidden">
          {/* Elegant Absolute Geometric Background elements */}
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-[#005CFF]/10 blur-3xl -z-10" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-[#0040D1]/5 blur-3xl -z-10" />

          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md bg-white border border-blue-900/40 rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Header Identity banner */}
            <div className="bg-gradient-to-br from-slate-900 to-[#0f172a] p-8 text-white relative text-center flex flex-col items-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-12 -translate-y-12" />
              <div className="mb-1">
                <StudyKeyLogo className="w-20 h-20" showText={true} textSize="lg" lightText={true} />
              </div>
              <p className="text-slate-300 text-xs mt-2 font-medium">
                Enter name to start real learning without signups
              </p>
            </div>

            <form onSubmit={handleEntrySubmit} className="p-8 space-y-6">
              {loginError && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-xs font-semibold flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Step 1 & 2 Checkpoints */}
              {!isAdminMode ? (
                <div className="space-y-2">
                  <label htmlFor="student-name-input" className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                    👉 Enter Your Name
                  </label>
                  <div className="relative">
                    <input
                      id="student-name-input"
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 focus:border-[#005CFF] focus:bg-white text-gray-800 rounded-xl outline-none font-medium transition duration-200"
                      placeholder="e.g., Yash Vardhan"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      required
                    />
                    <div className="absolute right-3.5 top-3.5 text-gray-400">
                      <User className="w-5 h-5" />
                    </div>
                  </div>
                  {/* Hint text removed per user request */}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-800">
                    <span className="font-semibold block mb-0.5">🔐 Admin Credentials Required</span>
                    Logged username detected: <span className="font-mono bg-amber-100 px-1 py-0.5 rounded">{tempName.trim()}</span>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="admin-password-input" className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                      👉 Enter Admin Password
                    </label>
                    <div className="relative">
                      <input
                        id="admin-password-input"
                        type="password"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 focus:border-amber-400 focus:bg-white text-gray-800 rounded-xl outline-none font-mono transition duration-200"
                        placeholder="••••••••••••••"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        required
                        autoFocus
                      />
                      <div className="absolute right-3.5 top-3.5 text-gray-400">
                        <Lock className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingEntry}
                className="w-full py-3.5 bg-gradient-to-r from-[#005CFF] to-[#0040D1] text-white rounded-xl font-bold tracking-wide text-sm hover:shadow-lg hover:shadow-blue-500/10 active:scale-95 transition duration-150 flex items-center justify-center space-x-2"
              >
                <span>{isSubmittingEntry ? "Sending..." : isAdminMode ? "Authenticate Admin" : "Let's Study"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {isAdminMode && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminMode(false);
                    setTempName("");
                    setAdminPassword("");
                    setLoginError("");
                  }}
                  className="w-full py-2.5 text-xs text-gray-500 hover:text-gray-700 font-semibold text-center border border-gray-100 rounded-xl"
                >
                  Cancel and Enter as Normal Student
                </button>
              )}
            </form>
          </motion.div>
        </div>
      ) : (
        /* 👨🎓 MAIN LAYOUT - USER & ADMIN AREA */
        <div className="flex-1 flex flex-col">
          
          {/* Navigation Brand Header Row */}
          <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-blue-900/40 px-4 md:px-8 py-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-8">
              {/* Home Logo Brand trigger */}
              <motion.div
                onClick={() => {
                  setSelectedBatch(null);
                  setSelectedLecture(null);
                }}
                className="flex items-center space-x-3 cursor-pointer group"
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <StudyKeyLogo className="w-11 h-11" showText={true} textSize="sm" />
              </motion.div>

              {/* Desktop Global Navigation links */}
              <nav className="hidden md:flex items-center space-x-1 text-sm font-semibold text-gray-600">
                <button
                  onClick={() => {
                    setSelectedBatch(null);
                    setSelectedLecture(null);
                    setCurrentTab("all");
                  }}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    !selectedBatch && currentTab === "all" ? "bg-blue-950/40 text-blue-400 border border-blue-900/30" : "hover:text-[#005CFF] hover:bg-blue-950/20"
                  }`}
                >
                  Explore Batches
                </button>
                {sessionUser?.role !== "admin" && (
                  <button
                    onClick={() => {
                      setSelectedBatch(null);
                      setSelectedLecture(null);
                      setCurrentTab("wishlisted");
                    }}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      !selectedBatch && currentTab === "wishlisted" ? "bg-blue-950/40 text-blue-400 border border-blue-900/30" : "hover:text-[#005CFF] hover:bg-blue-950/20"
                    }`}
                  >
                    My Wishlist ({wishlist.length})
                  </button>
                )}
              </nav>
            </div>

            {/* User Credentials state and actions */}
            <div className="flex items-center space-x-3">

              {sessionUser.role === "admin" && (
                <div className="hidden lg:flex items-center space-x-1.5 bg-blue-950/40 border border-blue-900/60 px-3 py-1.5 rounded-xl text-blue-300 text-xs font-semibold">
                  <Lock className="w-3 h-3 text-blue-400" />
                  <span>Admin Mode Active</span>
                </div>
              )}

              {/* Active user state box */}
              <div className="bg-gray-100 hover:bg-gray-200/80 px-3.5 py-1.5 rounded-xl flex items-center space-x-2 transition cursor-pointer">
                <div className="w-6 h-6 bg-blue-950 border border-blue-900/30 rounded-full flex items-center justify-center text-xs font-bold text-blue-400">
                  {sessionUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left text-xs">
                  <p className="font-bold text-gray-800 line-clamp-1 max-w-[100px] md:max-w-none">
                    {sessionUser.name}
                  </p>
                  <p className="text-[9px] text-gray-400 capitalize">{sessionUser.role} student</p>
                </div>
              </div>

              {/* Theme toggle switch */}
              <button
                onClick={() => setTheme(prev => prev === "dark" ? "light" : "dark")}
                className="p-2 py-2.5 bg-gray-50 text-gray-500 hover:text-blue-500 border border-gray-100 hover:bg-blue-50 hover:border-blue-100 rounded-xl transition flex items-center justify-center cursor-pointer select-none"
                title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 text-amber-500" />
                ) : (
                  <Moon className="w-4 h-4 text-blue-600" />
                )}
              </button>

              {/* Signout button */}
              <button
                onClick={logout}
                className="p-2 py-2.5 bg-gray-50 text-gray-500 hover:text-red-500 border border-gray-100 hover:bg-red-50 hover:border-red-100 rounded-xl transition"
                title="Log Out Session"
              >
                <LogOut className="w-4 h-4 md:mr-1 inline-block" />
                <span className="hidden md:inline-block text-xs font-bold">Sign Out</span>
              </button>
            </div>
          </header>

          {/* 💼 ADMISTRATIVE DASHBOARD AND SUMMARY STATS WORKSPACE (IF ROLE IS ADMIN) */}
          {sessionUser.role === "admin" && !selectedBatch && (
            <section id="admin-summary-workspace" className="bg-[#05070c] border-b border-blue-905 p-4 md:p-8">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                  <div>
                    <div className="flex items-center space-x-2 text-xs font-bold text-blue-400 uppercase tracking-widest">
                      <Activity className="w-4 h-4 text-[#005CFF] animate-spin" />
                      <span>Live Management Console</span>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mt-1">LMS Administration & Analytics</h2>
                    <p className="text-gray-500 text-xs md:text-sm mt-0.5">
                      Create batches, add streaming lecture videos, and trace reader analytics in real-time.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 w-full md:w-auto">
                    <button
                      onClick={() => {
                        resetBatchForm();
                        setShowBatchForm(true);
                      }}
                      className="flex-1 md:flex-none px-4 py-2.5 bg-[#005CFF] hover:bg-[#0040D1] text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-600/20 transition flex items-center justify-center space-x-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create New Batch</span>
                    </button>
                    <button
                      onClick={fetchAdminAnalytics}
                      className="px-3.5 py-2.5 bg-blue-950/50 text-blue-400 border border-blue-900/40 font-bold text-xs rounded-xl hover:bg-blue-900/40 hover:text-white transition"
                      title="Reload real-time insights"
                    >
                      Refresh Stats
                    </button>
                  </div>
                </div>

                {/* Database Metrics Counters Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Card 1: Available Batches */}
                  <div className="bg-white p-6 rounded-2xl border border-blue-900/40 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">AVAILABLE BATCHES</span>
                      <p className="text-4xl font-extrabold text-white mt-2">{batches.length}</p>
                      <p className="text-xs text-gray-400 mt-1">Active courses managed in the system</p>
                    </div>
                    <div className="p-4 bg-blue-950/40 border border-blue-900/40 rounded-2xl">
                      <BookOpen className="w-8 h-8 text-[#005CFF]" />
                    </div>
                  </div>

                  {/* Card 2: Total Study Lectures */}
                  <div className="bg-white p-6 rounded-2xl border border-blue-900/40 shadow-sm flex items-center justify-between hover:shadow-lg hover:border-cyan-500/50 hover:shadow-cyan-500/5 transition-all duration-300">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">TOTAL LECTURES</span>
                      <p className="text-4xl font-extrabold text-white mt-2">{analytics?.totalLecturesCount ?? 0}</p>
                      <p className="text-xs text-gray-400 mt-1">Streaming video lessons distributed across all batches</p>
                    </div>
                    <div className="p-4 bg-cyan-950/40 border border-cyan-900/40 rounded-2xl transition-all duration-300 hover:scale-105">
                      <Tv className="w-8 h-8 text-cyan-400 animate-pulse" />
                    </div>
                  </div>

                  {/* Card 3: Active Classroom Users */}
                  <div className="bg-white p-6 rounded-2xl border border-blue-900/40 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">LIVE PRESENCE</span>
                      <p className="text-4xl font-extrabold text-white mt-2 flex items-baseline space-x-1.5">
                        <span>
                          {(() => {
                            const seen = new Set<string>();
                            return (analytics?.activeUsers || []).filter(u => {
                              if (!u || !u.name) return false;
                              const trimmed = u.name.trim();
                              if (seen.has(trimmed)) return false;
                              seen.add(trimmed);
                              const lastSeen = new Date(u.timestamp).getTime();
                              const now = new Date().getTime();
                              return now - lastSeen < 60000;
                            }).length;
                          })()}
                        </span>
                        <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider flex items-center space-x-1">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                          <span>online</span>
                        </span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Total {(() => {
                          const seen = new Set<string>();
                          return (analytics?.activeUsers || []).filter(u => {
                            if (!u || !u.name) return false;
                            const trimmed = u.name.trim();
                            if (seen.has(trimmed)) return false;
                            seen.add(trimmed);
                            return true;
                          }).length;
                        })()} active students registered
                      </p>
                    </div>
                    <div className="p-4 bg-emerald-950/40 border border-emerald-900/40 rounded-2xl relative">
                      <Users className="w-8 h-8 text-emerald-400" />
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Real-time Trackers Section (Enrolment Analytics) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Batch Popularity Metric Chart and Registered User Logs */}
                  <div className="bg-white p-6 rounded-2xl border border-blue-900/40 shadow-md lg:col-span-2">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-blue-950">
                      <div>
                        <h4 className="text-sm font-black uppercase text-gray-200 tracking-wider flex items-center space-x-2">
                          <BookOpen className="w-5 h-5 text-[#005CFF]" />
                          <span>Batch Classroom Engagement Counter</span>
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">Total student clicks and study session initializations tracked per batch</p>
                      </div>
                      <span className="text-[10px] px-2.5 py-1 bg-blue-950/40 border border-blue-900/40 text-blue-400 font-extrabold rounded-full uppercase tracking-wider font-mono">
                        Live clicks
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                      {batches.length === 0 ? (
                        <div className="md:col-span-2 py-12 text-center text-xs text-gray-400 font-semibold">
                          No batches created. Use the form above to add your first study batch!
                        </div>
                      ) : (() => {
                        const totalClicks = batches.reduce(
                          (sum, b) => sum + (analytics?.batchClicks?.[b.id] || 0),
                          0
                        );
                        return batches.map((b) => {
                          const count = analytics?.batchClicks?.[b.id] || 0;
                          const percent = totalClicks > 0 ? Math.round((count / totalClicks) * 100) : 0;
                          return (
                            <div key={b.id} className="p-4 bg-[#0c101a] rounded-xl border border-blue-900/40 hover:bg-[#101524] hover:border-blue-700/50 hover:shadow-sm transition-all duration-200 flex flex-col justify-between space-y-3">
                              <div className="flex justify-between items-center text-sm font-bold">
                                <span className="text-gray-200 truncate font-sans">{b.title}</span>
                                <span className="font-extrabold text-blue-400 text-xs px-2 py-0.5 bg-blue-950/40 border border-blue-900/30 rounded-md shrink-0 font-mono">
                                  {count} clicks ({percent}%)
                                </span>
                              </div>
                              
                              <div className="space-y-1">
                                <div className="w-full h-2.5 bg-gray-900 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-blue-400 to-[#005CFF] rounded-full transition-all duration-500"
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                                <div className="flex justify-between text-[9px] text-gray-400 font-mono">
                                  <span>0%</span>
                                  <span>Click share</span>
                                  <span>100%</span>
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* 🟢 Active Students & Real Users Presence Section with Heartbeat Pulse Indicators */}
                  <div className="bg-white p-6 rounded-2xl border border-blue-900/40 shadow-md lg:col-span-1 flex flex-col">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-blue-950">
                      <div>
                        <h4 className="text-sm font-black uppercase text-gray-200 tracking-wider flex items-center space-x-1.5">
                          <Users className="w-5 h-5 text-emerald-400" />
                          <span>Learner Registry</span>
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">Real-time status and activity tracking ledger</p>
                      </div>
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-[350px] space-y-2.5 pr-1 custom-scrollbar">
                      {(() => {
                        const seenNames = new Set<string>();
                        const uniqueUsers = (analytics?.activeUsers || []).filter((u) => {
                          if (!u || !u.name) return false;
                          const trimmed = u.name.trim();
                          if (seenNames.has(trimmed)) return false;
                          seenNames.add(trimmed);
                          return true;
                        });

                        if (uniqueUsers.length === 0) {
                          return (
                            <div className="py-12 text-center text-xs text-gray-400 font-semibold">
                              No registered user records on this platform.
                            </div>
                          );
                        }

                        return uniqueUsers.map((user) => {
                          const isLive = (() => {
                            if (!user.timestamp) return false;
                            const lastSeen = new Date(user.timestamp).getTime();
                            const now = new Date().getTime();
                            return now - lastSeen < 60000; // Under 1 minute is Active
                          })();

                          const lastSeenTex = (() => {
                            if (!user.timestamp) return "Never";
                            try {
                              const lastSeen = new Date(user.timestamp).getTime();
                              const now = new Date().getTime();
                              const diffMs = now - lastSeen;
                              
                              if (diffMs < 0) return "Just now";
                              
                              const diffSecs = Math.floor(diffMs / 1000);
                              if (diffSecs < 45) return "Active now";
                              if (diffSecs < 60) return "1m ago";
                              
                              const diffMins = Math.floor(diffSecs / 60);
                              if (diffMins < 60) return `${diffMins}m ago`;
                              
                              const diffHours = Math.floor(diffMins / 60);
                              if (diffHours < 24) return `${diffHours}h ago`;
                              
                              return new Date(user.timestamp).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              });
                            } catch (e) {
                              return "Recently";
                            }
                          })();

                          const isCurrentUser = sessionUser && sessionUser.name === user.name;
                          const isAdmin = user.name === "@you_yuvraj_" || (adminsList && adminsList.includes(user.name));
                          // Clean non-alpha for visual initials
                          const cleanName = user.name ? user.name.replace(/[^a-zA-Z0-9]/g, "") : "User";
                          const initials = (cleanName.length > 0 ? cleanName.substring(0, 2) : "US").toUpperCase();

                          return (
                            <div
                              key={user.name}
                              className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all duration-200 ${
                                isCurrentUser
                                  ? "bg-blue-950/20 border-blue-500/40 shadow-xs"
                                  : "bg-[#0c101a] border-blue-900/40 hover:bg-[#101524] hover:border-blue-700/50"
                              }`}
                            >
                              <div className="flex items-center space-x-3 truncate">
                                <div className="relative shrink-0">
                                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${
                                    isAdmin 
                                      ? "from-rose-500 to-indigo-600" 
                                      : isCurrentUser 
                                        ? "from-blue-500 to-[#005CFF]" 
                                        : "from-slate-700 to-slate-900"
                                  } border border-slate-700 text-xs text-white font-black flex items-center justify-center tracking-tight shadow-md`}>
                                    {initials}
                                  </div>
                                  {isLive && (
                                    <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 bg-[#05070c] rounded-full p-0.5">
                                      <span className="relative flex h-full w-full rounded-full bg-emerald-400 shadow-xs animate-pulse" />
                                    </span>
                                  )}
                                </div>

                                <div className="truncate space-y-0.5">
                                  <div className="flex items-center space-x-1.5 flex-wrap">
                                    <span className="text-xs font-bold text-gray-200 truncate">
                                      {user.name}
                                    </span>
                                    {isAdmin && (
                                      <span className="text-[8px] font-black tracking-widest bg-rose-500/20 text-rose-400 px-1 py-0.2 rounded uppercase border border-rose-500/30">
                                        Admin
                                      </span>
                                    )}
                                    {isCurrentUser && (
                                      <span className="text-[8px] font-black tracking-widest bg-blue-500/20 text-blue-400 px-1 py-0.2 rounded uppercase border border-blue-500/30">
                                        You
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-gray-400 truncate font-sans">
                                    Last seen: <span className={isLive ? "text-emerald-400 font-bold" : "font-mono font-medium text-slate-400"}>{lastSeenTex}</span>
                                  </p>
                                </div>
                              </div>

                              <div className="shrink-0 flex items-center">
                                {isLive ? (
                                  <span className="text-[9px] font-extrabold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full flex items-center space-x-1 border border-emerald-500/20 shadow-xs animate-pulse">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                                    <span>Active</span>
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-semibold uppercase tracking-widest bg-slate-950 text-slate-500 px-2 py-0.5 rounded-full border border-slate-800">
                                    Offline
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>

                {/* 🔒 ADMIN STRATEGIC SECURITY LAYER: Admin Delegation Consent (Only visible for Super Admin @you_yuvraj_) */}
                {sessionUser?.name === "@you_yuvraj_" && (
                  <div className="mt-8 bg-white dark:bg-[#070b13] p-6 rounded-2xl border border-blue-900/40 shadow-xl overflow-hidden relative">
                    {/* Subtle decorative background glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-6 border-b border-gray-100 dark:border-blue-950">
                      <div>
                        <h4 className="text-sm font-black uppercase text-gray-950 dark:text-gray-150 tracking-wider flex items-center space-x-2">
                          <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0" />
                          <span>Administrator Authorization Control</span>
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-sans">
                          Delegate full administrative rights to other users. Added administrators have comprehensive permission to create, edit, or delete any batches and lectures.
                        </p>
                      </div>
                      
                      <span className="text-[10px] self-start md:self-center px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 font-extrabold rounded-full uppercase tracking-wider font-mono">
                        Security Dashboard
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Add Admin form card */}
                      <div className="lg:col-span-1 p-5 rounded-xl border flex flex-col justify-between transition-all duration-300 bg-gray-50/40 dark:bg-[#0c101a] border-gray-100 dark:border-blue-900/30">
                        <form onSubmit={handleAddAdmin} className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center space-x-1.5 font-mono">
                              <UserPlus className="w-3.5 h-3.5 text-blue-500" />
                              <span>Authorize New Admin</span>
                            </label>
                            <input
                              type="text"
                              placeholder="Enter username (e.g. @username)"
                              value={newAdminName}
                              onChange={(e) => setNewAdminName(e.target.value)}
                              className="w-full px-3 py-2 bg-white dark:bg-[#070b13] border border-gray-200 dark:border-blue-900/40 rounded-xl text-xs font-medium text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div className="text-[10px] text-gray-450 dark:text-gray-500 leading-relaxed font-sans">
                            ⚠️ Ensure the username matches the login handle exactly. Newly delegated administrators acquire instant root accessibility.
                          </div>

                          <button
                            type="submit"
                            disabled={isSavingAdmin}
                            className="w-full px-4 py-2.5 bg-[#005CFF] hover:bg-[#0040D1] text-white font-bold text-xs rounded-xl shadow-md transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer"
                          >
                            {isSavingAdmin ? (
                              <span>Authorizing...</span>
                            ) : (
                              <>
                                <ShieldCheck className="w-4 h-4" />
                                <span>Grant Admin Rights</span>
                              </>
                            )}
                          </button>
                        </form>
                      </div>

                      {/* Authorized Administrators list */}
                      <div className="lg:col-span-2">
                        <div className="space-y-1 mb-4">
                          <h5 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider font-mono">
                            Current Authorized Administrators ({adminsList.length})
                          </h5>
                          <p className="text-[11px] text-gray-400">All users listed below share total privileges in the platform.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[170px] overflow-y-auto pr-1 custom-scrollbar">
                          {adminsList.map((admin) => {
                            const isSuperAdmin = admin === "@you_yuvraj_";
                            return (
                              <div
                                key={admin}
                                className="p-3 bg-gray-55/20 dark:bg-[#0c101a] border border-gray-100 dark:border-blue-900/30 rounded-xl flex items-center justify-between gap-3 hover:border-blue-800/40 transition-all duration-200"
                              >
                                <div className="flex items-center space-x-2.5 truncate">
                                  <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${
                                    isSuperAdmin 
                                      ? "from-rose-500 to-indigo-600" 
                                      : "from-blue-500 to-[#005CFF]"
                                  } text-[10px] text-white font-black flex items-center justify-center tracking-tight shadow-sm`}>
                                    {isSuperAdmin ? "SA" : "AD"}
                                  </div>
                                  <div className="truncate">
                                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block truncate">
                                      {admin}
                                    </span>
                                    <span className="text-[9px] text-gray-400 font-medium font-sans">
                                      {isSuperAdmin ? "Primary Super-Admin" : "Co-Administrator"}
                                    </span>
                                  </div>
                                </div>

                                {!isSuperAdmin && sessionUser?.name === "@you_yuvraj_" ? (
                                  <button
                                    onClick={() => handleRemoveAdmin(admin)}
                                    className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-gray-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                    title="Revoke Administrator role"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                ) : isSuperAdmin ? (
                                  <span className="text-[8px] font-black tracking-widest bg-rose-500/25 text-rose-500 dark:text-rose-455 px-1.5 py-0.5 rounded uppercase border border-rose-500/20">
                                    LOCKED
                                  </span>
                                ) : (
                                  <span className="text-[8px] font-medium tracking-wider bg-gray-100 dark:bg-slate-900 text-gray-400 dark:text-gray-500 px-1.5 py-0.5 rounded border border-gray-250/20 dark:border-slate-800">
                                    READ-ONLY
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Batch Form Modals / Slide overs */}
                <AnimatePresence>
                  {sessionUser?.role === "admin" && showBatchForm && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      className="mt-6 p-6 bg-gradient-to-br from-white via-white to-blue-500/5 border-2 border-blue-900/40 rounded-2xl shadow-xl shadow-blue-500/5 space-y-4 ring-1 ring-blue-900/20 hover:border-blue-700 transition-all duration-300"
                    >
                      <h3 className="text-md font-bold text-gray-950 flex items-center space-x-2">
                        <Layers className="text-[#005CFF] w-5 h-5 animate-pulse" />
                        <span>{editingBatch ? `Edit Batch: ${editingBatch.title}` : "Create a New Study Batch"}</span>
                      </h3>

                      <form onSubmit={handleSaveBatch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2 md:col-span-3">
                          <label className="text-xs font-bold text-gray-500">Batch Title</label>
                          <input
                            type="text"
                            placeholder="e.g. SUMMER CAMP Class 6th to 8th"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-[#005CFF] focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                            value={batchFormTitle}
                            onChange={(e) => setBatchFormTitle(e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500">Batch Price Tag</label>
                          <select
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-[#005CFF] focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                            value={batchFormPrice}
                            onChange={(e) => setBatchFormPrice(e.target.value)}
                          >
                            <option value="FREE">FREE</option>
                            <option value="Paid">Paid</option>
                          </select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <label className="text-xs font-bold text-gray-500 flex items-center space-x-1">
                            <span>Enter Class / Grade</span>
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <select
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-[#005CFF] focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-gray-700"
                              value={
                                ["Class 10th", "Class 9th", "Class 8th", "Class 7th", "Class 6th", "Active Camp", "Enter Class"].includes(batchFormClass)
                                  ? batchFormClass
                                  : "Custom"
                              }
                              onChange={(e) => {
                                if (e.target.value !== "Custom") {
                                  setBatchFormClass(e.target.value);
                                } else {
                                  setBatchFormClass("");
                                }
                              }}
                            >
                              <option value="Class 10th">Class 10th</option>
                              <option value="Class 9th">Class 9th</option>
                              <option value="Class 8th">Class 8th</option>
                              <option value="Class 7th">Class 7th</option>
                              <option value="Class 6th">Class 6th</option>
                              <option value="Active Camp">Active Camp</option>
                              <option value="Enter Class">Enter Class</option>
                              <option value="Custom">Custom / Enter Class...</option>
                            </select>
                            
                            <input
                              type="text"
                              placeholder="Or type custom class here..."
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-[#005CFF] focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-gray-800"
                              value={batchFormClass}
                              onChange={(e) => setBatchFormClass(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div 
                          className={`space-y-2 md:col-span-3 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center select-none ${
                            isDragging 
                              ? "border-[#005CFF] bg-blue-950/40 scale-[1.01]" 
                              : "border-blue-900/40 hover:border-blue-700 hover:bg-blue-950/10"
                          }`}
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                        >
                          <label className="text-xs font-bold text-gray-500 self-start block mb-1">Batch Thumbnail Image</label>
                          <input
                            type="file"
                            id="batch-thumbnail-file"
                            ref={fileInputRef}
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageFileChange}
                          />

                          {batchFormImg ? (
                            <div className="relative group w-full max-w-sm mx-auto aspect-video rounded-lg overflow-hidden border border-gray-200/80 shadow-sm">
                              <img
                                src={batchFormImg}
                                alt="Selected batch thumbnail preview"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white space-y-1">
                                <Plus className="w-6 h-6 text-blue-400" />
                                <span className="text-xs font-bold">Replace Thumbnail Image</span>
                                <span className="text-[10px] text-gray-300">Or drag and drop over this area</span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setBatchFormImg("");
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition shadow-md"
                                title="Remove selected image"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="py-4 space-y-3 flex flex-col items-center">
                              <div className="w-12 h-12 rounded-full bg-blue-950/40 flex items-center justify-center text-[#005CFF] border border-blue-900/40">
                                <Plus className="w-6 h-6" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-bold text-gray-800">
                                  Drag & drop thumbnail image here, or <span className="text-[#005CFF] hover:text-blue-400 underline">browse computer</span>
                                </p>
                                <p className="text-[11px] text-gray-400">
                                  Supports JPG, JPEG, PNG, WEBP files up to 50MB
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2 md:col-span-3">
                          <label className="text-xs font-bold text-gray-500">Short Description</label>
                          <textarea
                            placeholder="Introduce study schedule, target classes and olympiad details..."
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-[#005CFF] focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                            value={batchFormDesc}
                            onChange={(e) => setBatchFormDesc(e.target.value)}
                            required
                          />
                        </div>

                        {/* Option to manage subjects */}
                        <div className="space-y-3 md:col-span-3 border border-blue-900/30 bg-blue-950/20 rounded-xl p-4">
                          <div>
                            <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wide">Batch Subjects Configuration</h4>
                            <p className="text-[10px] text-gray-400 mt-0.5">Customize the interactive subjects for this batch. Lectures can be assigned to these subjects.</p>
                          </div>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {batchFormSubjects.map((sub, idx) => (
                              <span 
                                key={idx} 
                                className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-blue-900/30 text-blue-300 border border-blue-800/40 rounded-full text-[11px] font-semibold"
                              >
                                <span>{sub}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setBatchFormSubjects(batchFormSubjects.filter((_s, sIdx) => sIdx !== idx));
                                  }}
                                  className="text-blue-400 hover:text-red-400 font-bold ml-1 outline-none text-[13px] leading-none"
                                  title="Remove Subject"
                                >
                                  &times;
                                </button>
                              </span>
                            ))}
                            {batchFormSubjects.length === 0 && (
                              <p className="text-xs text-amber-400/80 italic">No subjects configured. At least one subject is recommended.</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 max-w-sm mt-2.5">
                            <input
                              type="text"
                              placeholder="e.g. Political Science"
                              className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white text-gray-800 outline-none focus:border-[#005CFF] focus:ring-2 focus:ring-blue-500/20 font-medium"
                              value={newSubjectInput}
                              onChange={(e) => setNewSubjectInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  const val = newSubjectInput.trim();
                                  if (val && !batchFormSubjects.includes(val)) {
                                    setBatchFormSubjects([...batchFormSubjects, val]);
                                    setNewSubjectInput("");
                                  }
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const val = newSubjectInput.trim();
                                if (val && !batchFormSubjects.includes(val)) {
                                  setBatchFormSubjects([...batchFormSubjects, val]);
                                  setNewSubjectInput("");
                                }
                              }}
                              className="px-3 py-1.5 bg-[#005CFF] hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-all duration-200"
                            >
                              Add Subject
                            </button>
                          </div>
                        </div>

                        <div className="md:col-span-3 flex items-center space-x-2 justify-end pt-2">
                          <button
                            type="button"
                            onClick={resetBatchForm}
                            className="px-4.5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all duration-200 active:scale-95"
                            disabled={isSavingBatch}
                          >
                            Discard
                          </button>
                          <button
                            type="submit"
                            disabled={isSavingBatch}
                            className={`px-6 py-2.5 bg-gradient-to-r from-[#005CFF] to-[#0040D1] hover:from-[#0040D1] hover:to-[#002FA7] text-white rounded-xl text-xs font-black tracking-wide shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-600/20 active:translate-y-0.5 transition-all duration-200 flex items-center space-x-1.5 ${
                              isSavingBatch ? "opacity-75 cursor-wait select-none" : ""
                            }`}
                          >
                            {isSavingBatch ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Saving Configuration...</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Save Batch Configuration</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </section>
          )}

          {/* 💻 MAIN EXPLORATION VIEW (BATCH GRID) */}
          {!selectedBatch ? (
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-10">
              
              {/* Home Decorative Title Badge & Intro */}
              <div className="text-center max-w-3xl mx-auto space-y-4 pt-4">
                <span className="inline-block bg-[#005CFF]/15 text-blue-400 border border-[#005CFF]/30 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  🔐 STUDY KEY LMS
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                  Explore <span className="text-[#005CFF]">Batches</span>
                </h2>
                <p className="text-slate-500 text-sm md:text-md font-medium leading-relaxed">
                  Unlock premium educational content, high-quality streams, and structured study material designed for class 6th to 10th. All available directly.
                </p>

                {/* Elegant Dynamic Search Bar */}
                <div className="max-w-xl mx-auto relative pt-4">
                  <div className="absolute inset-y-0 left-4 pl-0.5 flex items-center pointer-events-none text-gray-400">
                    <Search className="w-5 h-5 text-[#005CFF]" />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-blue-900/40 focus:border-[#005CFF] rounded-full shadow-md shadow-blue-900/5 outline-none transition text-sm font-medium"
                    placeholder="Search for a batch (e.g. Aarambh, NIRMAAN)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3.5 top-7 text-xs font-bold text-gray-400 hover:text-gray-600"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Grid Tab filters (All Batches vs Wishlisted Batches) */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentTab("all")}
                    className={`px-4.5 py-2 rounded-full text-xs font-bold tracking-wide transition-all border ${
                      currentTab === "all"
                        ? "bg-[#005CFF] text-white border-[#005CFF] shadow-md shadow-blue-500/15"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200/60"
                    }`}
                  >
                    All Study Batches
                  </button>
                  {sessionUser?.role !== "admin" && (
                    <button
                      onClick={() => setCurrentTab("wishlisted")}
                      className={`px-4.5 py-2 rounded-full text-xs font-bold tracking-wide transition-all border ${
                        currentTab === "wishlisted"
                          ? "bg-[#005CFF] text-white border-[#005CFF] shadow-md shadow-blue-500/15"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200/60"
                      }`}
                    >
                      My Wishlist ({wishlist.length})
                    </button>
                  )}
                </div>

                {/* Element removed per user request */}
              </div>

              {/* Batches Display Grid */}
              {isLoadingBatches ? (
                <div className="py-20 text-center space-y-3">
                  <div className="w-10 h-10 border-4 border-[#005CFF] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-gray-400 font-bold">Retrieving authorized curriculum...</p>
                </div>
              ) : filteredBatches.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-200 p-16 rounded-2xl text-center max-w-md mx-auto space-y-4 shadow-sm">
                  <span className="text-5xl block">🏝️</span>
                  <p className="font-bold text-gray-700">No classes found matching search criteria.</p>
                  <p className="text-xs text-gray-400">
                    {currentTab === "wishlisted"
                      ? "Bookmarked courses will appear here. Click the heart icon on any batch!"
                      : "Reset filters or type another search term."}
                  </p>
                  {currentTab === "wishlisted" && (
                    <button
                      onClick={() => setCurrentTab("all")}
                      className="px-4 py-2 bg-blue-950/40 text-blue-400 border border-blue-900/30 text-xs font-extrabold rounded-lg hover:bg-blue-950/80 hover:text-white transition"
                    >
                      Browse All Batches
                    </button>
                  )}
                </div>
              ) : (
                <motion.div
                  layout
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                  {filteredBatches.map((batch) => {
                    const isWishlisted = wishlist.includes(batch.id);
                    return (
                      <motion.div
                        layout
                        key={batch.id}
                        className="bg-white border border-blue-900/30 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group relative"
                      >
                        {/* Course visual cover with tag */}
                        <div className="relative aspect-video overflow-hidden bg-gray-100">
                          <img
                            src={batch.image}
                            alt={batch.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              // Fallback on visual loading error
                              (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop";
                            }}
                          />
                           <div className={`absolute top-2.5 left-2.5 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-md shadow-black/25 flex items-center space-x-1.5 border border-white/25 transition-all duration-300 ${
                            (batch.targetClass || (batch.title.toUpperCase().includes("10TH") ? "Class 10th" : batch.title.toUpperCase().includes("9TH") ? "Class 9th" : batch.title.toUpperCase().includes("8TH") ? "Class 8th" : "Active Camp")).toUpperCase().includes("10TH")
                              ? "bg-gradient-to-r from-red-650/95 to-red-500/90 hover:from-red-600 hover:to-red-550 shadow-red-500/10"
                              : (batch.targetClass || (batch.title.toUpperCase().includes("10TH") ? "Class 10th" : batch.title.toUpperCase().includes("9TH") ? "Class 9th" : batch.title.toUpperCase().includes("8TH") ? "Class 8th" : "Active Camp")).toUpperCase().includes("9TH")
                              ? "bg-gradient-to-r from-teal-650/95 to-teal-500/90 hover:from-teal-600 hover:to-teal-555 shadow-teal-500/10"
                              : (batch.targetClass || (batch.title.toUpperCase().includes("10TH") ? "Class 10th" : batch.title.toUpperCase().includes("9TH") ? "Class 9th" : batch.title.toUpperCase().includes("8TH") ? "Class 8th" : "Active Camp")).toUpperCase().includes("8TH")
                              ? "bg-gradient-to-r from-blue-650/95 to-blue-500/90 hover:from-blue-600 hover:to-blue-555 shadow-blue-500/10"
                              : "bg-gradient-to-r from-amber-650/95 to-amber-500/90 hover:from-amber-600 hover:to-amber-555 shadow-amber-500/10"
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            <span className="tracking-wide">
                              {batch.targetClass || (batch.title.toUpperCase().includes("10TH") ? "Class 10th" : batch.title.toUpperCase().includes("9TH") ? "Class 9th" : batch.title.toUpperCase().includes("8TH") ? "Class 8th" : "Active Camp")}
                            </span>
                          </div>

                          {/* Quick Wishlist bookmark toggle */}
                          {sessionUser?.role !== "admin" && (
                            <button
                              onClick={(e) => toggleWishlist(batch.id, e)}
                              className="absolute top-2.5 right-2.5 p-2 bg-white/90 backdrop-blur-md text-gray-500 hover:text-red-500 hover:scale-110 active:scale-95 rounded-full shadow transition"
                              title="Add to Wishlist"
                            >
                              <Heart className={`w-4 h-4 transition ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
                            </button>
                          )}

                          {/* Price Tag Overlay Badge */}
                          <div className="absolute bottom-2 right-2 px-2.5 py-0.5 bg-[#005CFF] text-white text-[10px] font-black rounded-lg uppercase tracking-wider">
                            {batch.price}
                          </div>
                        </div>

                        {/* Text and description block */}
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="flex-1 space-y-2">
                            <h3 className="font-extrabold text-sm md:text-md text-gray-950 tracking-tight leading-snug group-hover:text-[#005CFF] transition-colors">
                              {batch.title}
                            </h3>
                            <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                              {batch.description}
                            </p>
                          </div>

                          {/* Action Buttons workspace */}
                          <div className="pt-4 border-t border-gray-50/80 flex items-center justify-between gap-2 mt-4">
                            <button
                              onClick={() => studyBatch(batch)}
                              className="flex-1 py-2.5 bg-[#005CFF] hover:bg-[#0040D1] text-white text-xs font-black rounded-xl hover:shadow-md hover:shadow-blue-500/10 active:translate-y-0.5 transition flex items-center justify-center space-x-1"
                            >
                              <span>LET'S STUDY</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>

                            {/* Additional Actions for Admins */}
                            {sessionUser.role === "admin" && (
                              <div className="flex space-x-1">
                                <button
                                  id={`edit-btn-${batch.id}`}
                                  onClick={() => handleEditBatch(batch)}
                                  className="p-2.5 bg-slate-50 text-slate-500 hover:bg-amber-50 hover:text-amber-700 border border-slate-100/80 rounded-xl hover:scale-105 active:scale-95 transition duration-200"
                                  title="Edit Batch"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  id={`delete-btn-${batch.id}`}
                                  onClick={() => handleDeleteBatch(batch.id)}
                                  className="p-2.5 bg-red-50/55 text-red-500 hover:bg-red-600 hover:text-white border border-red-100 hover:border-red-600 rounded-xl hover:scale-[1.06] active:scale-95 transition-all duration-200 shadow-sm"
                                  title="Delete Batch"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}


            </main>
          ) : (
            /* 👨🎓 LECTURE MANAGER & CLASSROOM DETAIL VIEW (SPLIT COLUMN / ACCORDIONS) */
            <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6">
              
              {/* Back to batches navigation breadcrumb */}
              <div className="mb-4">
                <button
                  onClick={() => {
                    setSelectedBatch(null);
                    setSelectedLecture(null);
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-600 text-xs font-bold border border-gray-100 rounded-xl transition inline-flex items-center space-x-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Batches Overview</span>
                </button>
              </div>

              {/* Batch Banner Info Layout */}
              <div className="bg-gradient-to-br from-gray-900 to-slate-900 text-white p-6 md:p-8 rounded-2xl mb-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full translate-x-20 -translate-y-20 blur-2xl" />
                
                <div className="space-y-2 max-w-2xl">
                  <span className="text-[10px] bg-[#005CFF] text-white font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                    {selectedBatch.price} Course
                  </span>
                  <h3 className="text-xl md:text-3xl font-black tracking-tight">{selectedBatch.title}</h3>
                  <p className="text-gray-300 text-xs md:text-sm leading-relaxed">{selectedBatch.description}</p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {sessionUser.role === "admin" && (
                    <button
                      onClick={() => {
                        resetLectureForm();
                        setShowLectureForm(true);
                      }}
                      className="px-4 py-2.5 bg-[#005CFF] hover:bg-[#0040D1] text-white font-bold text-xs rounded-xl transition flex items-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Lecture to Batch</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Dynamic Lecture Creation Form inside the details page */}
              <AnimatePresence>
                {sessionUser?.role === "admin" && showLectureForm && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-5 bg-white border border-blue-900/40 rounded-xl mb-6 shadow-md"
                  >
                    <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-3">
                      {editingLecture ? `Edit lecture: ${editingLecture.title}` : "Append Lecture Video"}
                    </h4>
                    <form onSubmit={handleSaveLecture} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Lecture title</label>
                        <input
                          type="text"
                          placeholder="e.g. Lecture 1: Motion Concepts"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white outline-none disabled:opacity-75 disabled:cursor-not-allowed"
                          value={lectureFormTitle}
                          onChange={(e) => setLectureFormTitle(e.target.value)}
                          required
                          disabled={isSavingLecture}
                        />
                      </div>

                      <div className="space-y-1.5 md:col-span-1">
                        <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Video Link (.mp4 / streaming)</label>
                        <input
                          type="text"
                          placeholder="e.g. https://domain.com/video.mp4"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white outline-none disabled:opacity-75 disabled:cursor-not-allowed"
                          value={lectureFormVideo}
                          onChange={(e) => setLectureFormVideo(e.target.value)}
                          required
                          disabled={isSavingLecture}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Assigned Subject</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white outline-none disabled:opacity-75 disabled:cursor-not-allowed text-gray-800 font-semibold"
                          value={lectureFormSubject}
                          onChange={(e) => setLectureFormSubject(e.target.value)}
                          required
                          disabled={isSavingLecture}
                        >
                          {(selectedBatch?.subjects && selectedBatch.subjects.length > 0
                            ? selectedBatch.subjects
                            : ["Science", "Maths", "Social Science", "Hindi", "English"]
                          ).map((sub, idx) => (
                            <option key={idx} value={sub}>{sub}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Notes PDF Link (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. https://domain.com/notes_chapter1.pdf"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white outline-none disabled:opacity-75 disabled:cursor-not-allowed"
                          value={lectureFormNotes}
                          onChange={(e) => setLectureFormNotes(e.target.value)}
                          disabled={isSavingLecture}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Sorting Order Index</label>
                        <input
                          type="number"
                          placeholder="e.g. 1"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white outline-none disabled:opacity-75 disabled:cursor-not-allowed"
                          value={lectureFormOrder}
                          onChange={(e) => setLectureFormOrder(Number(e.target.value))}
                          required
                          disabled={isSavingLecture}
                        />
                      </div>

                      <div className="md:col-span-3 flex items-center justify-end space-x-2 pt-1 border-t border-gray-50/80">
                        <button
                          type="button"
                          onClick={resetLectureForm}
                          disabled={isSavingLecture}
                          className="px-4.5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Discard
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingLecture}
                          className={`px-5 py-2.5 bg-gradient-to-r from-[#005CFF] to-[#0040D1] hover:from-[#0040D1] hover:to-[#002FA7] text-white rounded-xl text-xs font-black tracking-wide shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-600/20 active:translate-y-0.5 transition-all duration-200 flex items-center space-x-1.5 ${
                            isSavingLecture ? "opacity-75 cursor-wait select-none" : ""
                          }`}
                        >
                          {isSavingLecture ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Saving Permanently...</span>
                            </>
                          ) : (
                            <span>Save Lecture Permanently</span>
                          )}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Classroom core work section: Split Screen video vs stream index */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Visual Video Stream Player Column (Left) */}
                <div className="lg:col-span-2 space-y-4">
                  {selectedLecture ? (
                    <div className="bg-slate-950 rounded-2xl overflow-hidden shadow-xl aspect-video relative group border border-slate-800">
                      
                      {/* Secure Video/Iframe Element (Pipes from localized streaming gateway endpoint to shield actual URLs) */}
                      {selectedLecture.videoUrl.toLowerCase().includes("youtube.com") || 
                      selectedLecture.videoUrl.toLowerCase().includes("youtu.be") ? (
                        <iframe
                          src={getYouTubeEmbedUrl(selectedLecture.videoUrl)}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          title={selectedLecture.title}
                        />
                      ) : (
                        <video
                          ref={videoPlayerRef}
                          key={selectedLecture.id}
                          className="w-full h-full"
                          controls
                          autoPlay
                          onLoadedMetadata={handleVideoLoaded}
                          onEnded={handleVideoEnded}
                          onError={handleVideoError}
                          controlsList="nodownload" // Protect video from standard inspection right-click downloads
                          onContextMenu={(e) => e.preventDefault()}
                        />
                      )}

                      {/* Header overlay displaying currently covered session title */}
                      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-between items-center text-white text-xs pointer-events-none">
                        <div>
                          <p className="font-extrabold">{selectedLecture.title}</p>
                          <p className="text-[10px] text-gray-300">Resumes automatically. DRM Streaming Proxy Active</p>
                        </div>
                        <span className="bg-[#005CFF]/80 px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase">
                          STUDY LIVE
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border-2 border-dashed border-blue-900/40 rounded-2xl p-16 text-center space-y-4 shadow-inner">
                      <div className="w-16 h-16 bg-blue-950/40 border border-blue-900/40 rounded-full flex items-center justify-center mx-auto text-blue-400 animate-bounce">
                        <Play className="w-8 h-8 fill-[#005CFF] text-[#005CFF]" />
                      </div>
                      <h4 className="font-black text-gray-800">Choose a Lecture from the Curriculum</h4>
                      <p className="text-xs text-gray-400 max-w-sm mx-auto">
                        Pick any video on the right. Tracked session logs save your precise timestamp so you never lose study progress.
                      </p>
                    </div>
                  )}

                   {/* Active lecture summary details & help card */}
                  {selectedLecture && (
                    <div className="bg-white p-5 rounded-2xl border border-blue-900/40 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-[#005CFF] text-[10px] font-black uppercase tracking-widest">
                          <CheckCircle className="w-4 h-4" />
                          <span>LECTURE WATCH HISTORY TRACKER</span>
                        </div>
                        <h4 className="text-lg font-extrabold text-gray-900 mt-1">{selectedLecture.title}</h4>
                        <div className="flex items-center space-x-2 mt-1.5 flex-wrap gap-1">
                          <span className="text-xs text-gray-500">
                            Playback progress:{" "}
                            <span className="font-mono font-bold text-blue-400">
                              {lectureProgressPercent[selectedLecture.id] || 0}%
                            </span>
                          </span>
                          {(lectureProgressPercent[selectedLecture.id] || 0) >= 90 && (
                            <span className="inline-flex items-center space-x-1 text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full dark:bg-emerald-950/40 border border-emerald-100/20">
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>Completed (&gt;90%)</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Manual Complete Trigger & Notes Download */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {selectedLecture.notesUrl && selectedLecture.notesUrl.trim() !== "" && (
                          <a
                            href={selectedLecture.notesUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-xs font-bold transition-all duration-200 flex items-center space-x-2 shadow-sm shadow-blue-500/10 active:scale-95 cursor-pointer decoration-none"
                            title="Download/Open Study Notes PDF in new tab"
                          >
                            <FileText className="w-4 h-4 text-blue-100 shrink-0" />
                            <span>Download Class Notes (PDF)</span>
                            <Download className="w-4 h-4 text-blue-100 shrink-0" />
                          </a>
                        )}
                        <button
                          onClick={() => {
                            const currentPercent = lectureProgressPercent[selectedLecture.id] || 0;
                            const newPercent = currentPercent >= 90 ? 0 : 100;
                            setLectureProgressPercent(prev => ({
                              ...prev,
                              [selectedLecture.id]: newPercent
                            }));

                            if (newPercent === 100 && sessionUser) {
                              fetch("/api/lectures/progress", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  userName: sessionUser.name,
                                  batchId: selectedBatch?.id,
                                  lectureId: selectedLecture.id,
                                  progress: 100
                                })
                              }).catch(err => console.log("Progress telemetry error: ", err));
                            }
                            showToast(newPercent === 100 ? "Lecture marked as Completed!" : "Progress reset!");
                          }}
                          className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all duration-200 flex items-center space-x-2 select-none ${
                            (lectureProgressPercent[selectedLecture.id] || 0) >= 90
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100/70"
                              : "bg-white border-gray-200 text-gray-700 hover:bg-blue-50/20 hover:border-blue-400"
                          }`}
                        >
                          <CheckCircle className={`w-4 h-4 ${ (lectureProgressPercent[selectedLecture.id] || 0) >= 90 ? "text-emerald-600 fill-emerald-100" : "text-gray-400" }`} />
                          <span>
                            {(lectureProgressPercent[selectedLecture.id] || 0) >= 90
                              ? "Completed"
                              : "Mark Completed"}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Lecture Navigation Panel (Right) */}
                <div className="bg-white rounded-2xl border border-blue-900/40 shadow-sm p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h4 className="font-black text-xs uppercase tracking-wider text-gray-500 flex items-center space-x-1">
                      <Layers className="w-4 h-4 text-[#005CFF]" />
                      <span>COURSE CURRICULUM</span>
                    </h4>
                    <span className="text-[10px] font-bold text-gray-400">{lectures.length} Lectures</span>
                  </div>

                  {/* Subject Filter Tabs Bar */}
                  <div className="bg-slate-50/70 border border-blue-900/10 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest font-mono">Filter by Subject</p>
                      {userSelectedSubject !== "All" && (
                        <button 
                          onClick={() => setUserSelectedSubject("All")}
                          className="text-[10px] text-[#005CFF] hover:underline font-bold"
                        >
                          Clear Filter
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {["All", ...(selectedBatch?.subjects || ["Science", "Maths", "Social Science", "Hindi", "English"])].map((subj) => {
                        const count = subj === "All"
                          ? lectures.length
                          : lectures.filter(l => l.subject === subj).length;
                        return (
                          <button
                            key={subj}
                            onClick={() => setUserSelectedSubject(subj)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 select-none active:scale-[0.98] ${
                              userSelectedSubject === subj
                                ? "bg-gradient-to-r from-[#005CFF] to-[#0040D1] text-white shadow-sm shadow-blue-500/10"
                                : "bg-white border border-gray-200 text-gray-600 hover:border-blue-400/50 hover:text-[#005CFF] hover:bg-blue-50/5"
                            }`}
                          >
                            <span>{subj}</span>
                            <span className={`text-[9px] px-1 rounded-sm leading-normal ${
                              userSelectedSubject === subj ? "bg-blue-300/30 text-white" : "bg-gray-100 text-gray-400"
                            }`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {isLoadingLectures ? (
                    <div className="py-10 text-center space-y-2">
                      <div className="w-6 h-6 border-2 border-[#005CFF] border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-[10px] text-gray-400 font-bold">Verifying lecture media...</p>
                    </div>
                  ) : lectures.length === 0 ? (
                    <div className="py-10 text-center text-xs text-gray-400 font-medium">
                      No lecture files uploaded for this batch yet.
                    </div>
                  ) : (() => {
                    const filtered = userSelectedSubject === "All"
                      ? lectures
                      : lectures.filter(l => l.subject === userSelectedSubject);

                    if (filtered.length === 0) {
                      return (
                        <div className="py-12 border border-dashed border-gray-200 bg-slate-50/50 rounded-xl text-center px-4 space-y-1">
                          <p className="text-xs font-bold text-gray-600">No session uploaded yet</p>
                          <p className="text-[10.5px] text-gray-400 leading-normal">There are no lectures categorized under "{userSelectedSubject}" available in this study batch.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                        {filtered.map((item) => {
                          const isPlaying = selectedLecture?.id === item.id;
                          const lastProgress = playbackHistory[item.id];
                          const progressPercent = lectureProgressPercent[item.id] || 0;
                          const isCompleted = progressPercent >= 90;
                          const originalIndex = lectures.findIndex(l => l.id === item.id) + 1;

                          return (
                            <div
                              key={item.id}
                              onClick={() => setSelectedLecture(item)}
                              className={`p-3 rounded-xl border transition-all duration-200 text-xs cursor-pointer text-left relative overflow-hidden group flex items-start gap-2.5 active:scale-[0.98] ${
                                isPlaying
                                  ? "bg-gradient-to-r from-blue-50/90 to-blue-5/10 border-l-4 border-l-[#005CFF] border-y-blue-200 border-r-blue-200 text-blue-950 font-bold shadow-sm shadow-blue-500/5"
                                  : isCompleted
                                    ? "bg-emerald-50/10 border-emerald-100/50 hover:bg-emerald-50/20 text-gray-700 hover:shadow-xs"
                                    : "bg-slate-50 border-slate-100 hover:border-blue-400/40 hover:bg-white text-gray-700 hover:shadow-xs"
                              }`}
                            >
                              <div className={`w-6 h-6 rounded-lg ${
                                isCompleted 
                                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25' 
                                  : isPlaying 
                                    ? 'bg-[#005CFF] text-white shadow-sm shadow-blue-500/20' 
                                    : 'bg-gray-100 text-gray-500'
                              } flex items-center justify-center shrink-0 text-[10px] font-bold group-hover:bg-[#005CFF] group-hover:text-white transition-all duration-200`}>
                                {isCompleted ? (
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                ) : (
                                  originalIndex
                                )}
                              </div>

                            <div className="flex-1 space-y-1.5">
                              <div>
                                <p className={`line-clamp-2 leading-snug flex items-center gap-1.5 ${isPlaying ? 'text-blue-950 font-extrabold' : 'text-gray-800'} ${isCompleted ? 'line-through decoration-emerald-500/40 opacity-80' : ''}`}>
                                  {item.title}
                                  {isCompleted && (
                                    <span className="inline-flex items-center justify-center bg-emerald-500 text-white rounded-full p-0.5 shadow-xs" title="Completed (>90% watched)">
                                      <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                                    </span>
                                  )}
                                </p>
                              </div>

                              {/* Progress bar info */}
                              {(lastProgress !== undefined && lastProgress > 0) || progressPercent > 0 ? (
                                <div className="flex items-center space-x-1.5 text-[10px] text-gray-400">
                                  {lastProgress !== undefined && lastProgress > 0 && (
                                    <span className="bg-gray-100 px-1 rounded text-[9px] font-mono select-none">
                                      Saved progress at {Math.floor(lastProgress / 60)}m
                                    </span>
                                  )}
                                  {progressPercent > 0 && (
                                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold font-mono select-none ${isCompleted ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-950/40 text-blue-400'}`}>
                                      {progressPercent}% watched
                                    </span>
                                  )}
                                </div>
                              ) : null}

                              {/* Interactive lecture notes PDF downloads */}
                              {item.notesUrl && item.notesUrl.trim() !== "" ? (
                                <div 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(item.notesUrl, "_blank");
                                  }}
                                  className="mt-1.5 flex items-center space-x-1.5 bg-blue-50/70 border border-blue-150 hover:bg-blue-100/80 hover:border-blue-300 text-[#005CFF] hover:text-[#0040D1] px-2.5 py-1 rounded-lg text-[9.5px] font-black max-w-fit transition duration-150 shadow-2xs cursor-pointer select-none active:scale-95"
                                  title="Download / View Chapter Notes PDF"
                                >
                                  <FileText className="w-3 h-3 text-blue-500 shrink-0" />
                                  <span>Download Notes</span>
                                  <Download className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                </div>
                              ) : null}
                            </div>

                            {/* Play Indicator status */}
                            <div className="shrink-0 pt-1">
                              {isCompleted ? (
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                              ) : isPlaying ? (
                                <span className="flex h-2 w-2 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                              ) : (
                                <Play className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#005CFF] transition" />
                              )}
                            </div>

                            {/* Admin-only controls inside syllabus tree */}
                            {sessionUser.role === "admin" && (
                              <div
                                className="absolute right-1 bottom-1 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 bg-white p-1 rounded-lg border border-gray-100"
                                onClick={(e) => e.stopPropagation()} // Stop bubbling
                              >
                                <button
                                  onClick={() => handleEditLecture(item)}
                                  className="p-1 text-amber-600 hover:bg-amber-50 rounded"
                                  title="Edit video metadata"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteLecture(item.id)}
                                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                                  title="Delete video record"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
                </div>

              </div>
            </div>
          )}

          {/* Clean footer line */}
          <footer className="bg-white border-t border-blue-900/40 py-6 px-4 md:px-8 mt-auto text-xs text-gray-400 text-center">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-col items-center md:items-start gap-1">
                <p className="font-semibold text-gray-600">© 2026 Study Key</p>
                <p id="footer-developer-credit" className="text-[11px] text-gray-400">Designed and Developed By Avinash and Yuvraj</p>
              </div>
              <div className="flex space-x-4">
                <span className="text-red-500 text-sm animate-pulse">❤️</span>
              </div>
            </div>
          </footer>

        </div>
      )}

    </div>
  );
}
