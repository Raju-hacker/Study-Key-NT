import express from "express";
import path from "path";
import fs from "fs";
import https from "https";
import http from "http";
import { createServer as createViteServer } from "vite";

interface Batch {
  id: string;
  title: string;
  description: string;
  image: string;
  price: string; // "FREE" or "Paid"
  targetClass?: string;
  subjects?: string[];
}

interface Lecture {
  id: string;
  batchId: string;
  title: string;
  videoUrl: string;
  order: number;
  subject?: string;
  notesUrl?: string;
}

interface Analytics {
  totalUsers: number;
  batchClicks: Record<string, number>;
  activeUsers: { name: string; timestamp: string }[];
  watchHistory: {
    userName: string;
    batchTitle: string;
    lectureTitle: string;
    progress: number; // percentage
    timestamp: string;
  }[];
}

interface Database {
  batches: Batch[];
  lectures: Lecture[];
  analytics: Analytics;
  admins?: string[];
}

const DB_PATH = path.join(process.cwd(), "db.json");

// Preseed initial data
const initialDatabase: Database = {
  batches: [
    {
      id: "batch_summer_camp",
      title: "Summer camp",
      description: "Unlock high-quality classes covering AI Learning, English Speaking, Graphic Designing, and Entrepreneurship for Class 6th to 8th students.",
      image: "/src/assets/images/summer_camp_thumb_1781793281839.jpg",
      price: "FREE",
      targetClass: "Active Camp"
    },
    {
      id: "batch_aarambh_10th",
      title: "AARAMBH 10th BATCH 26-27",
      description: "Ultimate comprehensive program for Class 10th board preparation. Full syllabus coverage of Science, Mathematics, English, and Social Sciences with live lectures and premium mock tests to secure perfect grades.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=600&auto=format&fit=crop",
      price: "FREE",
      targetClass: "Class 10th"
    },
    {
      id: "batch_aarambh_plus",
      title: "AARAMBH PLUS 9th BATCH 26-27",
      description: "Advanced learning foundation course for Class 9 students. Complete syllabus covering Science, Mathematics, English, and Social Studies with interactive live lectures.",
      image: "/src/assets/images/aarambh_plus_thumb_1781793294866.jpg",
      price: "FREE",
      targetClass: "Class 9th"
    },
    {
      id: "batch_aarambh_9th",
      title: "AARAMBH 9th BATCH 26-27",
      description: "Comprehensive class 9 curriculum mapped to standard academic schedules with standard study material, practice sheets, and mock tests.",
      image: "/src/assets/images/aarambh_9th_thumb_1781793307881.jpg",
      price: "FREE",
      targetClass: "Class 9th"
    },
    {
      id: "batch_nirmaan_8th",
      title: "NIRMAAN BATCH Class 8th",
      description: "Strong foundation builder for Class 8. Tailored lectures to build basic concepts of Physics, Chemistry, Biology, and advanced Mathematics for future olympiads.",
      image: "/src/assets/images/nirmaan_8th_thumb_1781793323373.jpg",
      price: "FREE",
      targetClass: "Class 8th"
    }
  ],
  lectures: [
    // Lectures for Summer Camp
    {
      id: "lec_sc_1",
      batchId: "batch_summer_camp",
      title: "Lecture 1: Introduction to AI & Mind-Blowing Prompt Engineering Rules",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      order: 1
    },
    {
      id: "lec_sc_2",
      batchId: "batch_summer_camp",
      title: "Lecture 2: Public Speaking & Fluent English Grammar Rules",
      videoUrl: "https://www.w3schools.com/html/movie.mp4",
      order: 2
    },
    {
      id: "lec_sc_3",
      batchId: "batch_summer_camp",
      title: "Lecture 3: Graphic Designing Masterclass with Figma & Canva",
      videoUrl: "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",
      order: 3
    },
    {
      id: "lec_sc_4",
      batchId: "batch_summer_camp",
      title: "Lecture 4: Future Entrepreneurship & Launching your First App",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      order: 4
    },
    // Lectures for AARAMBH 10th
    {
      id: "lec_a10_1",
      batchId: "batch_aarambh_10th",
      title: "Lecture 1: Science - Chemical Reactions & Balancing Equations",
      videoUrl: "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",
      order: 1
    },
    {
      id: "lec_a10_2",
      batchId: "batch_aarambh_10th",
      title: "Lecture 2: Mathematics - Real Numbers & Fundamental Theorem of Arithmetic",
      videoUrl: "https://www.w3schools.com/html/movie.mp4",
      order: 2
    },
    // Lectures for Aarambh Plus
    {
      id: "lec_ap_1",
      batchId: "batch_aarambh_plus",
      title: "Lecture 1: Science - Motion in a Straight Line & Velocity Vectors",
      videoUrl: "https://www.w3schools.com/html/movie.mp4",
      order: 1
    },
    {
      id: "lec_ap_2",
      batchId: "batch_aarambh_plus",
      title: "Lecture 2: Mathematics - Number Systems & Rationalization Tricks",
      videoUrl: "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",
      order: 2
    },
    {
      id: "lec_ap_3",
      batchId: "batch_aarambh_plus",
      title: "Lecture 3: English - Active and Passive Voices with Conversational English",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      order: 3
    },
    // Lectures for Aarambh 9th
    {
      id: "lec_a9_1",
      batchId: "batch_aarambh_9th",
      title: "Lecture 1: Gravitation & Laws of Universal Gravitational Forces",
      videoUrl: "https://www.w3schools.com/html/movie.mp4",
      order: 1
    },
    {
      id: "lec_a9_2",
      batchId: "batch_aarambh_9th",
      title: "Lecture 2: Quadratic Equations & Polynomial Identities",
      videoUrl: "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",
      order: 2
    },
    // Lectures for Nirmaan Class 8th
    {
      id: "lec_n8_1",
      batchId: "batch_nirmaan_8th",
      title: "Lecture 1: Force and Pressure Basics & Fluid Mechanics Diagrams",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      order: 1
    },
    {
      id: "lec_n8_2",
      batchId: "batch_nirmaan_8th",
      title: "Lecture 2: Cell Structure & Biological Functions of Cell Organelles",
      videoUrl: "https://www.w3schools.com/html/movie.mp4",
      order: 2
    }
  ],
  analytics: {
    totalUsers: 4,
    batchClicks: {
      "batch_summer_camp": 42,
      "batch_aarambh_10th": 36,
      "batch_aarambh_plus": 28,
      "batch_aarambh_9th": 19,
      "batch_nirmaan_8th": 15
    },
    activeUsers: [],
    watchHistory: []
  },
  admins: ["@you_yuvraj_"]
};

let dbInstance: Database | null = null;

// Helper to access / update DB
function readDb(): Database {
  if (dbInstance) {
    return dbInstance;
  }
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(initialDatabase, null, 2));
      dbInstance = initialDatabase;
      return initialDatabase;
    }
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    dbInstance = JSON.parse(raw);
    
    // Auto-migrate: Ensure "AARAMBH 10th BATCH 26-27" exists in the active db.json database
    let databaseModified = false;
    if (!dbInstance!.batches.some(b => b.id === "batch_aarambh_10th")) {
      const b10 = initialDatabase.batches.find(b => b.id === "batch_aarambh_10th");
      if (b10) {
        dbInstance!.batches.push(b10);
        databaseModified = true;
      }
    }
    
    // Auto-migrate: Ensure preseeded lectures for this batch exist
    const b10Lecs = initialDatabase.lectures.filter(l => l.batchId === "batch_aarambh_10th");
    b10Lecs.forEach(l => {
      if (!dbInstance!.lectures.some(dl => dl.id === l.id)) {
        dbInstance!.lectures.push(l);
        databaseModified = true;
      }
    });
    
    // Ensure key is in batchClicks
    if (dbInstance!.analytics && dbInstance!.analytics.batchClicks && !dbInstance!.analytics.batchClicks["batch_aarambh_10th"]) {
      dbInstance!.analytics.batchClicks["batch_aarambh_10th"] = 36;
      databaseModified = true;
    }

    // Ensure all batches have preseeded common subjects
    dbInstance!.batches.forEach(b => {
      if (!b.subjects || b.subjects.length === 0) {
        b.subjects = ["Science", "Maths", "Social Science", "Hindi", "English"];
        databaseModified = true;
      }
    });

    // Ensure all lectures have a subject
    dbInstance!.lectures.forEach(l => {
      if (!l.subject) {
        const titleLower = l.title.toLowerCase();
        if (titleLower.includes("science")) {
          l.subject = "Science";
        } else if (titleLower.includes("math")) {
          l.subject = "Maths";
        } else if (titleLower.includes("hindi")) {
          l.subject = "Hindi";
        } else if (titleLower.includes("english")) {
          l.subject = "English";
        } else if (titleLower.includes("social") || titleLower.includes("history") || titleLower.includes("geography")) {
          l.subject = "Social Science";
        } else {
          l.subject = "Science";
        }
        databaseModified = true;
      }
    });
    
    // Ensure admins list exists with preseeded admin
    if (!dbInstance!.admins) {
      dbInstance!.admins = ["@you_yuvraj_"];
      databaseModified = true;
    }

    if (databaseModified) {
      // Persist the changes permanently
      fs.writeFileSync(DB_PATH, JSON.stringify(dbInstance, null, 2));
    }

    return dbInstance!;
  } catch (error) {
    console.error("Error reading database file", error);
    dbInstance = initialDatabase;
    return initialDatabase;
  }
}

function writeDb(db: Database) {
  dbInstance = db;
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error("Error writing database file", error);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "70mb" }));

  // Serve static images directory if they exist
  app.use("/src/assets/images", express.static(path.join(process.cwd(), "src/assets/images")));

  // API - Get all batches
  app.get("/api/batches", (req, res) => {
    const db = readDb();
    res.json(db.batches);
  });

  // API - Create/Update batch
  app.post("/api/batches", (req, res) => {
    const db = readDb();
    const { id, title, description, image, price, targetClass, subjects } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required" });
    }

    if (id) {
      // Edit mode
      const idx = db.batches.findIndex(b => b.id === id);
      if (idx !== -1) {
        db.batches[idx] = {
          ...db.batches[idx],
          title,
          description,
          image: image || db.batches[idx].image || "/src/assets/images/summer_camp_thumb_1781793281839.jpg",
          price: price || "FREE",
          targetClass: targetClass || db.batches[idx].targetClass || "",
          subjects: Array.isArray(subjects) ? subjects : (db.batches[idx].subjects || ["Science", "Maths", "Social Science", "Hindi", "English"])
        };
        writeDb(db);
        return res.json(db.batches[idx]);
      } else {
        return res.status(404).json({ error: "Batch not found" });
      }
    } else {
      // Create mode
      const newId = "batch_" + Math.random().toString(36).substring(2, 9);
      const newBatch: Batch = {
        id: newId,
        title,
        description,
        image: image || "/src/assets/images/summer_camp_thumb_1781793281839.jpg",
        price: price || "FREE",
        targetClass: targetClass || "",
        subjects: Array.isArray(subjects) && subjects.length > 0 ? subjects : ["Science", "Maths", "Social Science", "Hindi", "English"]
      };
      db.batches.push(newBatch);
      
      // Seed default lectures for the new batch
      const initialLecture: Lecture = {
        id: "lec_" + Math.random().toString(36).substring(2, 9),
        batchId: newId,
        title: "Lecture 1: Getting Started and Overview",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        order: 1,
        subject: "Science"
      };
      db.lectures.push(initialLecture);

      writeDb(db);
      res.json(newBatch);
    }
  });

  // API - Delete batch
  app.delete("/api/batches/:id", (req, res) => {
    const db = readDb();
    const { id } = req.params;
    db.batches = db.batches.filter(b => b.id !== id);
    // Cascadely delete lectures
    db.lectures = db.lectures.filter(l => l.batchId !== id);
    writeDb(db);
    res.json({ success: true, message: "Batch and associated lectures deleted successfully" });
  });

  // API - Get lectures for batch
  app.get("/api/lectures/:batchId", (req, res) => {
    const db = readDb();
    const { batchId } = req.params;
    const batchLectures = db.lectures
      .filter(l => l.batchId === batchId)
      .sort((a, b) => a.order - b.order);
    res.json(batchLectures);
  });

  // API - Create/Update lecture
  app.post("/api/lectures", (req, res) => {
    const db = readDb();
    const { id, batchId, title, videoUrl, order, subject, notesUrl } = req.body;

    if (!batchId || !title || !videoUrl) {
      return res.status(400).json({ error: "Batch ID, title, and video URL are required" });
    }

    if (id) {
      // Edit
      const idx = db.lectures.findIndex(l => l.id === id);
      if (idx !== -1) {
        db.lectures[idx] = {
          ...db.lectures[idx],
          title,
          videoUrl,
          order: order !== undefined ? Number(order) : db.lectures[idx].order,
          subject: subject || db.lectures[idx].subject || "Science",
          notesUrl: notesUrl !== undefined ? notesUrl : db.lectures[idx].notesUrl
        };
        writeDb(db);
        return res.json(db.lectures[idx]);
      } else {
        return res.status(404).json({ error: "Lecture not found" });
      }
    } else {
      // Create
      const newLec: Lecture = {
        id: "lec_" + Math.random().toString(36).substring(2, 9),
        batchId,
        title,
        videoUrl,
        order: order !== undefined ? Number(order) : (db.lectures.filter(l => l.batchId === batchId).length + 1),
        subject: subject || "Science",
        notesUrl: notesUrl || ""
      };
      db.lectures.push(newLec);
      writeDb(db);
      res.json(newLec);
    }
  });

  // API - Delete lecture
  app.delete("/api/lectures/:id", (req, res) => {
    const db = readDb();
    const { id } = req.params;
    db.lectures = db.lectures.filter(l => l.id !== id);
    writeDb(db);
    res.json({ success: true });
  });

  // Track name entry and update analytics
  app.post("/api/users/enter", (req, res) => {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ error: "Name is required" });

      const db = readDb();
      if (!db.analytics) {
        db.analytics = {
          totalUsers: 0,
          batchClicks: {},
          activeUsers: [],
          watchHistory: []
        };
      }
      db.analytics.totalUsers = (db.analytics.totalUsers || 0) + 1;
      
      // Add to active users log
      if (!db.analytics.activeUsers) {
        db.analytics.activeUsers = [];
      }

      const idx = db.analytics.activeUsers.findIndex(u => u && u.name === name);
      if (idx !== -1) {
        db.analytics.activeUsers.splice(idx, 1);
      }

      db.analytics.activeUsers.unshift({
        name,
        timestamp: new Date().toISOString()
      });

      // Keep last 200 active users so all names are saved
      if (db.analytics.activeUsers.length > 200) {
        db.analytics.activeUsers = db.analytics.activeUsers.slice(0, 200);
      }

      writeDb(db);
      const isAdmin = name === "@you_yuvraj_" || (db.admins && db.admins.includes(name));
      res.json({ success: true, user: { name, role: isAdmin ? "admin" : "user" } });
    } catch (err: any) {
      console.error("Error in /api/users/enter: ", err);
      res.status(500).json({ error: err.message || "Internal server error", stack: err.stack });
    }
  });

  // Periodic ping to keep user active and update last seen
  app.post("/api/users/ping", (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const db = readDb();
    if (!db.analytics.activeUsers) {
      db.analytics.activeUsers = [];
    }

    const idx = db.analytics.activeUsers.findIndex(u => u.name === name);
    if (idx !== -1) {
      db.analytics.activeUsers.splice(idx, 1);
    }

    db.analytics.activeUsers.unshift({
      name,
      timestamp: new Date().toISOString()
    });

    if (db.analytics.activeUsers.length > 200) {
      db.analytics.activeUsers = db.analytics.activeUsers.slice(0, 200);
    }

    writeDb(db);
    res.json({ success: true });
  });

  // Track batch clicks "Let's Study"
  app.post("/api/batches/click", (req, res) => {
    const { batchId } = req.body;
    if (!batchId) return res.status(400).json({ error: "batchId is required" });

    const db = readDb();
    if (!db.analytics.batchClicks) {
      db.analytics.batchClicks = {};
    }
    db.analytics.batchClicks[batchId] = (db.analytics.batchClicks[batchId] || 0) + 1;
    writeDb(db);
    res.json({ success: true, count: db.analytics.batchClicks[batchId] });
  });

  // Track watch progress
  app.post("/api/lectures/progress", (req, res) => {
    const { userName, batchId, lectureId, progress } = req.body;
    if (!userName || !lectureId) return res.status(400).json({ error: "userName, lectureId are required" });

    const db = readDb();
    const lecture = db.lectures.find(l => l.id === lectureId);
    const batch = db.batches.find(b => b.id === (batchId || (lecture?.batchId)));

    if (lecture && batch) {
      // Add or update entry in watchHistory
      const existingIdx = db.analytics.watchHistory.findIndex(
        w => w.userName === userName && w.lectureTitle === lecture.title
      );

      const entry = {
        userName,
        batchTitle: batch.title,
        lectureTitle: lecture.title,
        progress: Number(progress) || 1,
        timestamp: new Date().toISOString()
      };

      if (existingIdx !== -1) {
        db.analytics.watchHistory[existingIdx] = entry;
      } else {
        db.analytics.watchHistory.unshift(entry);
      }

      // Limit history
      if (db.analytics.watchHistory.length > 80) {
        db.analytics.watchHistory = db.analytics.watchHistory.slice(0, 80);
      }

      writeDb(db);
    }
    res.json({ success: true });
  });

  // API - Get admin analytics
  app.get("/api/admin/analytics", (req, res) => {
    const db = readDb();
    res.json({
      ...db.analytics,
      totalLecturesCount: db.lectures ? db.lectures.length : 0
    });
  });

  // API - Get admin list
  app.get("/api/admin/list", (req, res) => {
    const db = readDb();
    res.json({ admins: db.admins || ["@you_yuvraj_"] });
  });

  // API - Add admin
  app.post("/api/admin/add", (req, res) => {
    const requestor = req.headers["x-admin-requestor"];
    if (requestor !== "@you_yuvraj_") {
      return res.status(403).json({ error: "Access Denied: Only the primary super-admin (@you_yuvraj_) can add administrative privileges." });
    }

    const db = readDb();
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Admin name is required" });
    }
    const cleanName = name.trim();
    if (!db.admins) {
      db.admins = ["@you_yuvraj_"];
    }
    if (!db.admins.includes(cleanName)) {
      db.admins.push(cleanName);
      writeDb(db);
    }
    res.json({ success: true, admins: db.admins });
  });

  // API - Remove admin
  app.post("/api/admin/remove", (req, res) => {
    const requestor = req.headers["x-admin-requestor"];
    if (requestor !== "@you_yuvraj_") {
      return res.status(403).json({ error: "Access Denied: Only the primary super-admin (@you_yuvraj_) can revoke administrative privileges." });
    }

    const db = readDb();
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Admin name is required" });
    }
    const cleanName = name.trim();
    if (cleanName === "@you_yuvraj_") {
      return res.status(400).json({ error: "Cannot remove primary super-admin" });
    }
    if (!db.admins) {
      db.admins = ["@you_yuvraj_"];
    }
    db.admins = db.admins.filter(a => a !== cleanName);
    writeDb(db);
    res.json({ success: true, admins: db.admins });
  });

  // 🎬 CORE SECURITY FEATURE: Dynamic Video Streaming Proxy
  // Hides raw video URL from user inspect or client network calls.
  // Serves stream segments directly or relays data with support for range headers.
  app.options("/api/video-stream/:lectureId*", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Max-Age", "86400");
    res.sendStatus(200);
  });

  const streamHandler = (req: any, res: any) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "*");

    const db = readDb();
    const { lectureId } = req.params;
    const lecture = db.lectures.find(l => l.id === lectureId);

    if (!lecture) {
      return res.status(404).send("Lecture not found");
    }

    const videoUrl = lecture.videoUrl;

    if (!videoUrl) {
      return res.status(400).send("No video URL configured for this lecture");
    }

    let targetUrl = videoUrl;

    // Resolve subpath relative to parent directory of videoUrl
    const subpath = req.params.subpath || "";
    const wildcard = req.params[0] || "";
    const fullSubpath = (subpath + wildcard).trim();

    if (fullSubpath && !fullSubpath.startsWith("index.m3u8") && !fullSubpath.startsWith("video.mp4")) {
      try {
        const parentUrl = new URL(videoUrl);
        const lastSlashIdx = parentUrl.pathname.lastIndexOf("/");
        if (lastSlashIdx !== -1) {
          parentUrl.pathname = parentUrl.pathname.substring(0, lastSlashIdx + 1) + fullSubpath;
        } else {
          parentUrl.pathname = "/" + fullSubpath;
        }
        targetUrl = parentUrl.toString();
      } catch (e) {
        console.error("Error building absolute segment URL", e);
      }
    }

    // Attempt to pipe video request from upstream
    const headers: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    };

    if (req.headers.range) {
      headers["Range"] = req.headers.range;
    }

    function pipeStream(urlStr: string, redirectCount = 0) {
      if (redirectCount > 10) {
        return res.status(500).send("Too many redirects in streaming proxy");
      }

      try {
        const parsedUrl = new URL(urlStr);
        const protocol = parsedUrl.protocol === "https:" ? https : http;

        const upstreamReq = protocol.get(urlStr, { headers }, (upstreamRes) => {
          const statusCode = upstreamRes.statusCode || 200;

          // Support 301, 302, 303, 307, 308 redirection statuses
          if (statusCode >= 300 && statusCode < 400 && upstreamRes.headers.location) {
            let redirectUrl = upstreamRes.headers.location;
            if (!redirectUrl.startsWith("http://") && !redirectUrl.startsWith("https://")) {
              redirectUrl = new URL(redirectUrl, urlStr).toString();
            }
            upstreamRes.resume(); // discard remaining response body to release memory
            pipeStream(redirectUrl, redirectCount + 1);
            return;
          }

          res.statusCode = statusCode;

          const headersToForward = [
            "content-type",
            "content-length",
            "content-range",
            "accept-ranges",
            "cache-control",
          ];

          for (const header of headersToForward) {
            if (upstreamRes.headers[header]) {
              res.setHeader(header, upstreamRes.headers[header] as string);
            }
          }

          // Ensure correct content-type is supplied
          if (!res.getHeader("content-type")) {
            const lowerUrl = urlStr.toLowerCase();
            if (lowerUrl.includes(".m3u8")) {
              res.setHeader("content-type", "application/x-mpegURL");
            } else if (lowerUrl.includes(".ts")) {
              res.setHeader("content-type", "video/mp2t");
            } else {
              res.setHeader("content-type", "video/mp4");
            }
          }

          // Pipe upstream stream directly to express client response
          upstreamRes.pipe(res);
        });

        upstreamReq.on("error", (err) => {
          console.error("Upstream proxy error: ", err);
          if (!res.headersSent) {
            res.status(500).send("Streaming error");
          }
        });

        // Close upstream connection if client cancels/closes
        req.on("close", () => {
          upstreamReq.destroy();
        });
      } catch (err) {
        console.error("Invalid URL in proxy stream: ", urlStr, err);
        if (!res.headersSent) {
          res.status(400).send("Invalid video URL configured");
        }
      }
    }

    pipeStream(targetUrl);
  };

  app.get("/api/video-stream/:lectureId", streamHandler);
  app.get("/api/video-stream/:lectureId/:subpath*", streamHandler);

  // Vite Integration for development / production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Study Key server actively listening on http://localhost:${PORT}`);
  });
}

startServer();
