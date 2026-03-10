import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { generateInvoicePDF } from "./pdf";
import { seedDatabase } from "./seed";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for storage
const storage_multer = multer.diskStorage({
  destination: function (_req, _file, cb) {
    const uploadPath = path.resolve(process.cwd(), "uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage_multer });

const wsClients = new Map<string, Set<WebSocket>>();

function broadcastToUser(userId: string, event: string, data: unknown) {
  const clients = wsClients.get(userId);
  if (clients) {
    const message = JSON.stringify({ event, data });
    clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }
}

async function broadcastToArea(lat: number, lng: number, radius: number, event: string, data: unknown) {
  const artisans = await storage.findArtisansInRadius(lat, lng, radius);
  artisans.forEach(artisan => {
    broadcastToUser(artisan.userId, event, data);
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  await seedDatabase();

  // File Upload Endpoint
  app.post("/api/upload", upload.single("file"), (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  });

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { username, password, email, phone, firstName, lastName, role } = req.body;
      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const user = await storage.createUser({ username, password, email, phone, firstName, lastName, role });
      await storage.createWallet({ userId: user.id, balance: 0, currency: "EUR" });

      if (role === "artisan") {
        await storage.createArtisanProfile({
          userId: user.id,
          specialties: JSON.stringify(req.body.specialties || []),
          bio: req.body.bio || null,
          website: null,
          googlePlaceId: null,
          certifications: "[]",
          zone: req.body.zone || null,
          latitude: null,
          longitude: null,
          kycStatus: "pending",
          availability: true,
        });
      }

      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const { password: _, ...safeUser } = user;

      let profile: any = null;
      if (user.role === "artisan") {
        profile = await storage.getArtisanProfile(user.id);
      }

      const wallet = await storage.getWallet(user.id);
      res.json({ ...safeUser, artisanProfile: profile, wallet });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // 2FA Endpoints
  app.post("/api/auth/2fa/setup", async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      const secret = "MVKW6Z3SMRXWO3RA"; // Placeholder for TOTP secret generation
      await storage.updateUser(userId, { twoFactorSecret: secret });
      res.json({ secret, qrCodeUrl: `otpauth://totp/Maitrio:${userId}?secret=${secret}&issuer=Maitrio` });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/auth/2fa/verify", async (req: Request, res: Response) => {
    try {
      const { userId, code } = req.body;
      const user = await storage.getUser(userId);
      if (user && code === "123456") { // Placeholder verification
        await storage.updateUser(userId, { twoFactorEnabled: true });
        res.json({ success: true });
      } else {
        res.status(400).json({ message: "Invalid code" });
      }
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // User Addresses
  app.get("/api/users/:id/addresses", async (req: Request, res: Response) => {
    try {
      const addresses = await storage.getUserAddresses((req.params.id as string));
      res.json(addresses);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/users/:id/addresses", async (req: Request, res: Response) => {
    try {
      const address = await storage.createUserAddress({
        userId: (req.params.id as string),
        ...req.body,
      });
      res.json(address);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/artisans/radius", async (req: Request, res: Response) => {
    try {
      const { lat, lng, radius, specialty } = req.query;
      if (!lat || !lng) return res.status(400).json({ message: "Lat/Lng required" });
      const artisans = await storage.findArtisansInRadius(
        parseFloat(lat as string),
        parseFloat(lng as string),
        parseFloat(radius as string || "20"),
        specialty as string
      );
      res.json(artisans);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/artisans", async (_req: Request, res: Response) => {
    try {
      const artisans = await storage.getAllArtisans();
      const flat = artisans.map(a => ({
        ...a,
        firstName: a.user.firstName,
        lastName: a.user.lastName,
        name: `${a.user.firstName} ${a.user.lastName}`,
        email: a.user.email,
        phone: a.user.phone,
        avatarUrl: a.user.avatarUrl,
      }));
      res.json(flat);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/artisans/:id", async (req: Request, res: Response) => {
    try {
      const profile = await storage.getArtisanProfileById((req.params.id as string));
      if (!profile) return res.status(404).json({ message: "Artisan not found" });
      const user = await storage.getUser(profile.userId);
      const reviews = await storage.getReviewsByUser(profile.userId);
      const portfolio = await storage.getPortfolioItems(profile.id);
      res.json({ ...profile, user, reviews, portfolio });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/artisans/:id/portfolio", async (req: Request, res: Response) => {
    try {
      const items = await storage.getPortfolioItems((req.params.id as string));
      res.json(items);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/artisans/:id/portfolio", async (req: Request, res: Response) => {
    try {
      const item = await storage.createPortfolioItem({
        artisanId: (req.params.id as string),
        ...req.body,
      });
      res.json(item);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.put("/api/artisans/:id", async (req: Request, res: Response) => {
    try {
      const updated = await storage.updateArtisanProfile((req.params.id as string), req.body);
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/artisans/:id/kyc", async (req: Request, res: Response) => {
    try {
      const updated = await storage.updateArtisanProfile((req.params.id as string), {
        kycStatus: "submitted",
        ...req.body,
      });
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/missions", async (req: Request, res: Response) => {
    try {
      const { clientId, artisanId, status } = req.query;
      let missions;
      if (clientId) {
        missions = await storage.getMissionsByClient(clientId as string);
      } else if (artisanId) {
        missions = await storage.getMissionsByArtisan(artisanId as string);
      } else if (status === "pending") {
        missions = await storage.getPendingMissions();
      } else {
        missions = await storage.getPendingMissions();
      }
      res.json(missions);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/missions/:id", async (req: Request, res: Response) => {
    try {
      const mission = await storage.getMission((req.params.id as string));
      if (!mission) return res.status(404).json({ message: "Mission not found" });
      const quotes = await storage.getQuotesByMission(mission.id);
      const signature = await storage.getSignatureByMission(mission.id);
      const invoice = await storage.getInvoiceByMission(mission.id);
      const reviews = await storage.getReviewsByMission(mission.id);
      res.json({ ...mission, quotes, signature, invoice, reviews });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/missions", async (req: Request, res: Response) => {
    try {
      const { isSos, ...missionData } = req.body;
      const mission = await storage.createMission({
        ...missionData,
        isSos: isSos || false,
        urgency: isSos ? "high" : (missionData.urgency || "normal"),
        status: "pending",
      });

      if (mission.clientId) {
        const wallet = await storage.getWallet(mission.clientId);
        const escrowAmount = mission.escrowAmount || 0;
        if (wallet && escrowAmount > 0) {
          await storage.updateWalletBalance(mission.clientId, -escrowAmount);
          await storage.updateEscrowBalance(mission.clientId, escrowAmount);
          await storage.createWalletTransaction({
            walletId: wallet.id,
            amount: escrowAmount,
            type: "escrow",
            missionId: mission.id,
            description: `Escrow bloqué pour: ${mission.title}`,
          });
        }
      }

      if (isSos) {
        // Broadcast SOS to all nearby artisans (default 20km)
        const nearbyArtisans = await storage.findArtisansInRadius(
          mission.latitude || 48.8566,
          mission.longitude || 2.3522,
          20
        );

        nearbyArtisans.forEach(artisan => {
          broadcastToUser(artisan.userId, "mission:sos", {
            ...mission,
            distance: artisan.distance
          });
          storage.createNotification({
            userId: artisan.userId,
            title: "🚨 SOS URGENT",
            message: `Une urgence ${mission.category} a été signalée à ${artisan.distance?.toFixed(1)}km.`,
            type: "sos_alert",
            missionId: mission.id,
            read: false,
          });
        });
      }

      broadcastToUser(mission.clientId, "mission:created", mission);
      res.json(mission);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.put("/api/missions/:id", async (req: Request, res: Response) => {
    try {
      const updated = await storage.updateMission((req.params.id as string), req.body);
      if (!updated) return res.status(404).json({ message: "Mission not found" });

      if (updated.artisanId) {
        broadcastToUser(updated.artisanId, "mission:updated", updated);
      }
      broadcastToUser(updated.clientId, "mission:updated", updated);

      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/missions/:id/accept", async (req: Request, res: Response) => {
    try {
      const { artisanId } = req.body;
      const updated = await storage.updateMission((req.params.id as string), {
        artisanId,
        status: "accepted",
      });
      if (!updated) return res.status(404).json({ message: "Mission not found" });

      await storage.createNotification({
        userId: updated.clientId,
        title: "Mission acceptee",
        message: `Un artisan a accepte votre mission: ${updated.title}`,
        type: "mission_accepted",
        missionId: updated.id,
        read: false,
      });

      broadcastToUser(updated.clientId, "mission:accepted", updated);
      broadcastToUser(artisanId, "mission:accepted", updated);

      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/missions/:id/complete", async (req: Request, res: Response) => {
    try {
      const mission = await storage.getMission((req.params.id as string));
      if (!mission) return res.status(404).json({ message: "Mission not found" });

      const updated = await storage.updateMission((req.params.id as string), {
        status: "completed",
        finalPrice: req.body.finalPrice || mission.estimatedPrice,
      });

      if (updated && updated.artisanId) {
        const finalAmount = updated.finalPrice || updated.estimatedPrice || 0;
        const artisanWallet = await storage.getWallet(updated.artisanId);
        if (artisanWallet) {
          await storage.updateWalletBalance(updated.artisanId, finalAmount);
          await storage.createWalletTransaction({
            walletId: artisanWallet.id,
            amount: finalAmount,
            type: "credit",
            missionId: updated.id,
            description: `Paiement pour: ${updated.title}`,
          });

          broadcastToUser(updated.artisanId, "wallet:updated", {
            balance: (artisanWallet.balance || 0) + finalAmount,
          });
        }

        const profile = await storage.getArtisanProfile(updated.artisanId);
        if (profile) {
          await storage.updateArtisanProfile(profile.id, {
            completedMissions: (profile.completedMissions || 0) + 1,
          });
        }

        const artisan = await storage.getUser(updated.artisanId);
        const client = await storage.getUser(updated.clientId);

        const invoiceNumber = `EF-${Date.now().toString(36).toUpperCase()}`;
        const pdfData = generateInvoicePDF({
          invoiceNumber,
          missionTitle: updated.title,
          missionCategory: updated.category || "autre",
          clientName: client ? `${client.firstName || ""} ${client.lastName || ""}`.trim() : "Client",
          artisanName: artisan ? `${artisan.firstName || ""} ${artisan.lastName || ""}`.trim() : "Artisan",
          amount: finalAmount,
          address: updated.address || "",
          completedDate: new Date(),
          description: updated.description || undefined,
        });

        await storage.createInvoice({
          missionId: updated.id,
          invoiceNumber,
          amount: finalAmount,
          pdfUrl: pdfData,
        });

        await storage.createNotification({
          userId: updated.artisanId,
          title: "Mission terminee",
          message: `Paiement de ${finalAmount}EUR recu pour: ${updated.title}`,
          type: "payment_received",
          missionId: updated.id,
          read: false,
        });

        // Loyalty & Eco points
        await storage.updateUserPoints(updated.clientId, 'loyalty', 10);
        await storage.updateUserPoints(updated.artisanId, 'loyalty', 5);

        broadcastToUser(updated.artisanId, "mission:completed", updated);
      }

      broadcastToUser(mission.clientId, "mission:completed", updated);
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/missions/:id/signature", async (req: Request, res: Response) => {
    try {
      const { signatureData } = req.body;
      if (!signatureData) {
        return res.status(400).json({ message: "Signature data required" });
      }

      const sig = await storage.createSignature({
        missionId: (req.params.id as string),
        signatureData,
      });

      const mission = await storage.getMission((req.params.id as string));
      if (mission) {
        broadcastToUser(mission.clientId, "signature:received", sig);
        if (mission.artisanId) {
          broadcastToUser(mission.artisanId, "signature:received", sig);
        }
      }

      res.json(sig);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/missions/:id/quote", async (req: Request, res: Response) => {
    try {
      const quote = await storage.createQuote({
        missionId: (req.params.id as string),
        ...req.body,
      });
      const mission = await storage.getMission((req.params.id as string));
      if (mission) {
        broadcastToUser(mission.clientId, "quote:received", quote);
      }
      res.json(quote);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/reviews", async (req: Request, res: Response) => {
    try {
      const { userId } = req.query;
      if (!userId) return res.status(400).json({ message: "userId required" });
      const reviews = await storage.getReviewsByUser(userId as string);
      res.json(reviews);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/reviews", async (req: Request, res: Response) => {
    try {
      const review = await storage.createReview(req.body);
      const mission = await storage.getMission(review.missionId);
      if (mission) {
        await storage.updateMission(mission.id, { status: "validated" });
      }
      res.json(review);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/wallet/:userId", async (req: Request, res: Response) => {
    try {
      const wallet = await storage.getWallet((req.params.userId as string));
      if (!wallet) return res.status(404).json({ message: "Wallet not found" });
      const transactions = await storage.getWalletTransactions(wallet.id);
      res.json({ ...wallet, transactions });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/notifications/:userId", async (req: Request, res: Response) => {
    try {
      const notifications = await storage.getNotifications((req.params.userId as string));
      res.json(notifications);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.put("/api/notifications/:id/read", async (req: Request, res: Response) => {
    try {
      await storage.markNotificationRead((req.params.id as string));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Equipment & Maintenance
  app.get("/api/users/:id/equipment", async (req: Request, res: Response) => {
    try {
      const eqp = await storage.getEquipment((req.params.id as string));
      res.json(eqp);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/users/:id/equipment", async (req: Request, res: Response) => {
    try {
      const eqp = await storage.createEquipment({
        userId: (req.params.id as string),
        ...req.body,
      });
      res.json(eqp);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/artisans/:id/inventory", async (req: Request, res: Response) => {
    try {
      const item = await storage.createInventoryItem({
        artisanId: (req.params.id as string),
        ...req.body,
      });
      res.json(item);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.put("/api/inventory/:id", async (req: Request, res: Response) => {
    try {
      const updated = await storage.updateInventoryQuantity((req.params.id as string), req.body.change || 0);
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/inventory/:id/purchase", async (req: Request, res: Response) => {
    try {
      const { buyerId, quantity } = req.body;
      const success = await storage.buyInventoryItem((req.params.id as string), buyerId, quantity || 1);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(400).json({ message: "Achat impossible: stock insuffisant ou solde epuise." });
      }
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Eco Impact
  app.post("/api/missions/:id/eco", async (req: Request, res: Response) => {
    try {
      const mission = await storage.getMission((req.params.id as string));
      if (!mission) return res.status(404).json({ message: "Mission not found" });

      const impact = await storage.updateUserPoints(mission.clientId, 'eco', req.body.points || 5);
      if (mission.artisanId) {
        await storage.updateUserPoints(mission.artisanId, 'eco', 2);
      }

      res.json({ success: true, impact });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/sos/broadcast", async (req: Request, res: Response) => {
    try {
      const { userId, lat, lng, message } = req.body;
      const nearbyArtisans = await storage.findArtisansInRadius(lat, lng, 5000); // 5km

      const broadcastData = {
        userId,
        lat,
        lng,
        message,
        type: "SOS",
        timestamp: new Date().toISOString()
      };

      for (const artisan of nearbyArtisans) {
        broadcastToUser(artisan.id, "sos:alert", broadcastData);
        // Also create a persistent notification
        await storage.createNotification({
          userId: artisan.id,
          title: "ALERTE SOS PROXIMITÉ",
          message: message,
          type: "sos"
        });
      }

      res.json({ success: true, alertedCount: nearbyArtisans.length });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Disputes
  app.post("/api/missions/:id/dispute", async (req: Request, res: Response) => {
    try {
      const mission = await storage.getMission((req.params.id as string));
      if (!mission) return res.status(404).json({ message: "Mission not found" });

      const dispute = await storage.createDispute({
        missionId: mission.id,
        userId: req.body.userId,
        reason: req.body.reason,
        evidenceUrls: JSON.stringify(req.body.evidenceUrls || []),
        status: "open",
      });

      res.json(dispute);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/disputes/:id", async (req: Request, res: Response) => {
    try {
      const dispute = await storage.getDispute((req.params.id as string));
      if (!dispute) return res.status(404).json({ message: "Dispute not found" });
      res.json(dispute);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/disputes/:id/messages", async (req: Request, res: Response) => {
    try {
      const messages = await storage.getDisputeMessages((req.params.id as string));
      res.json(messages);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/disputes/:id/messages", async (req: Request, res: Response) => {
    try {
      const msg = await storage.createDisputeMessage({
        disputeId: (req.params.id as string),
        ...req.body,
      });
      res.json(msg);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Premium & Referrals
  app.post("/api/premium/subscribe", async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      const updated = await storage.updateUser(userId, { isPremium: true });
      const profile = await storage.getArtisanProfile(userId);
      if (profile) {
        await storage.updateArtisanProfile(profile.id, { isPremium: true });
      }
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/referral/apply", async (req: Request, res: Response) => {
    try {
      const { userId, code } = req.body;
      const referrer = await storage.getUserByUsername(code); // Assuming username as referral code for simplicity
      if (!referrer) return res.status(404).json({ message: "Code parrainage invalide." });

      await storage.updateUser(userId, { referredBy: referrer.id });
      await storage.updateUserPoints(referrer.id, 'loyalty', 50); // Reward referrer
      await storage.updateUserPoints(userId, 'loyalty', 20); // Reward referred user

      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  const httpServer = createServer(app);

  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws: WebSocket, req) => {
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const userId = url.searchParams.get("userId");

    if (userId) {
      if (!wsClients.has(userId)) {
        wsClients.set(userId, new Set());
      }
      wsClients.get(userId)!.add(ws);

      ws.on("close", () => {
        wsClients.get(userId)?.delete(ws);
        if (wsClients.get(userId)?.size === 0) {
          wsClients.delete(userId);
        }
      });

      ws.on("message", (raw: any) => {
        try {
          const msg = JSON.parse(raw.toString());
          if (msg.event === "location:update" && msg.data) {
            const { missionId, latitude, longitude } = msg.data;
            if (missionId) {
              storage.getMission(missionId).then(mission => {
                if (mission) {
                  broadcastToUser(mission.clientId, "location:update", {
                    missionId, latitude, longitude, artisanId: userId,
                  });
                }
              });
            }
          }
        } catch { }
      });
    }

    ws.send(JSON.stringify({ event: "connected", data: { userId } }));
  });

  return httpServer;
}
