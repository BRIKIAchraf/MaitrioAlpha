import { db, storage } from "./storage";
import * as schema from "@shared/schema";

const artisansData = [
  {
    username: "marc.dupont",
    password: "artisan123",
    firstName: "Marc",
    lastName: "Dupont",
    email: "marc.dupont@email.fr",
    phone: "+33612345678",
    role: "artisan",
    specialties: ["plomberie", "climatisation"],
    bio: "Plombier certifie depuis 15 ans, specialise en depannage urgent et installation de systemes de chauffage.",
    website: "https://dupont-plomberie.fr",
    googlePlaceId: "ChIJLU7jZClu5kcR4PcOOO6p3I0",
    certifications: ["RGE QualiSol", "Qualibat 5412"],
    zone: "Paris 11e",
    latitude: 48.8590,
    longitude: 2.3790,
    kycStatus: "verified",
    portfolioItems: [
      { title: "Renovation salle de bain complete", description: "Refection totale plomberie + carrelage", category: "plomberie" },
      { title: "Installation chaudiere condensation", description: "Pose chaudiere Viessmann avec raccordements", category: "climatisation" },
    ],
  },
  {
    username: "sophie.martin",
    password: "artisan123",
    firstName: "Sophie",
    lastName: "Martin",
    email: "sophie.martin@email.fr",
    phone: "+33623456789",
    role: "artisan",
    specialties: ["electricite", "domotique"],
    bio: "Electricienne qualifiee, experte en domotique et installations electriques aux normes NF C 15-100.",
    website: "https://martin-elec.fr",
    googlePlaceId: "ChIJYbBb5rJx5kcRkFIslYgieds",
    certifications: ["Qualifelec E2", "Habilitation BR"],
    zone: "Boulogne-Billancourt",
    latitude: 48.8396,
    longitude: 2.2399,
    kycStatus: "verified",
    portfolioItems: [
      { title: "Mise aux normes electriques appartement", description: "Remplacement tableau + circuits 3 pieces", category: "electricite" },
      { title: "Installation domotique maison", description: "Systeme KNX complet avec controle eclairage", category: "electricite" },
    ],
  },
  {
    username: "karim.benali",
    password: "artisan123",
    firstName: "Karim",
    lastName: "Benali",
    email: "karim.benali@email.fr",
    phone: "+33634567890",
    role: "artisan",
    specialties: ["serrurier", "menuiserie"],
    bio: "Serrurier-metallier, intervention rapide 7j/7. Ouverture de portes, changement de serrures, blindage.",
    website: null,
    googlePlaceId: "ChIJPV3oRKZu5kcREwsFsCFPCXQ",
    certifications: ["A2P Service", "Qualibat 4412"],
    zone: "Paris 20e",
    latitude: 48.8638,
    longitude: 2.3985,
    kycStatus: "verified",
    portfolioItems: [
      { title: "Blindage porte d'entree", description: "Installation porte blindee A2P BP3", category: "serrurier" },
      { title: "Renovation menuiserie bois", description: "Restauration fenetres bois anciennes", category: "menuiserie" },
    ],
  },
  {
    username: "claire.rousseau",
    password: "artisan123",
    firstName: "Claire",
    lastName: "Rousseau",
    email: "claire.rousseau@email.fr",
    phone: "+33645678901",
    role: "artisan",
    specialties: ["peinture", "decoration"],
    bio: "Peintre decoratrice, finitions haut de gamme. Peinture, enduits decoratifs, papier peint et ravalement.",
    website: "https://rousseau-deco.fr",
    googlePlaceId: "ChIJQ8RjW_Fx5kcR5HBNwe2fUuM",
    certifications: ["Qualibat 6111", "Label Artisan d'Art"],
    zone: "Vincennes",
    latitude: 48.8476,
    longitude: 2.4386,
    kycStatus: "verified",
    portfolioItems: [
      { title: "Peinture appartement haussmannien", description: "5 pieces, enduit lisse + peinture mate premium", category: "peinture" },
      { title: "Fresque murale bureau", description: "Decoration artistique espace coworking", category: "peinture" },
    ],
  },
  {
    username: "thomas.lefevre",
    password: "artisan123",
    firstName: "Thomas",
    lastName: "Lefevre",
    email: "thomas.lefevre@email.fr",
    phone: "+33656789012",
    role: "artisan",
    specialties: ["maconnerie", "carrelage"],
    bio: "Macon specialise en renovation et construction. Travaux de gros oeuvre, carrelage et amenagement exterieur.",
    website: "https://lefevre-maconnerie.fr",
    googlePlaceId: null,
    certifications: ["Qualibat 2112", "RGE Eco Artisan"],
    zone: "Saint-Denis",
    latitude: 48.9362,
    longitude: 2.3574,
    kycStatus: "verified",
    portfolioItems: [
      { title: "Extension maison 30m2", description: "Construction extension en parpaings + toiture", category: "maconnerie" },
      { title: "Terrasse beton desactive", description: "Coulage terrasse 50m2 finition desactivee", category: "maconnerie" },
    ],
  },
  {
    username: "nadia.cherif",
    password: "artisan123",
    firstName: "Nadia",
    lastName: "Cherif",
    email: "nadia.cherif@email.fr",
    phone: "+33667890123",
    role: "artisan",
    specialties: ["nettoyage", "debarras"],
    bio: "Entreprise de nettoyage professionnel. Menage, remise en etat apres travaux, debarras complet.",
    website: null,
    googlePlaceId: "ChIJkbeSa_Bx5kcRnLa0MtPldFg",
    certifications: ["Qualipropre"],
    zone: "Montreuil",
    latitude: 48.8638,
    longitude: 2.4433,
    kycStatus: "verified",
    portfolioItems: [
      { title: "Nettoyage fin de chantier", description: "Remise en etat complet appartement 4 pieces", category: "nettoyage" },
      { title: "Debarras cave 40m2", description: "Evacuation + tri + nettoyage complet", category: "debarras" },
    ],
  },
  {
    username: "pierre.garnier",
    password: "artisan123",
    firstName: "Pierre",
    lastName: "Garnier",
    email: "pierre.garnier@email.fr",
    phone: "+33678901234",
    role: "artisan",
    specialties: ["frigoriste", "climatisation"],
    bio: "Frigoriste certifie, installation et maintenance de climatisations, pompes a chaleur et chambres froides.",
    website: "https://garnier-froid.fr",
    googlePlaceId: null,
    certifications: ["Attestation Capacite Fluides", "Qualipac"],
    zone: "Creteil",
    latitude: 48.7905,
    longitude: 2.4559,
    kycStatus: "verified",
    portfolioItems: [
      { title: "Installation PAC air/eau", description: "Pompe a chaleur Daikin 14kW + plancher chauffant", category: "climatisation" },
      { title: "Climatisation bureau open-space", description: "4 unites murales gainables Mitsubishi", category: "frigoriste" },
    ],
  },
  {
    username: "julie.petit",
    password: "artisan123",
    firstName: "Julie",
    lastName: "Petit",
    email: "julie.petit@email.fr",
    phone: "+33689012345",
    role: "artisan",
    specialties: ["jardinage", "amenagement"],
    bio: "Paysagiste diplome, creation et entretien de jardins. Taille, plantation, amenagement terrasse et cloture.",
    website: "https://petit-jardins.fr",
    googlePlaceId: "ChIJOab0ARBy5kcRiL2bNGkXz8k",
    certifications: ["Certiphyto", "Label Vert"],
    zone: "Neuilly-sur-Seine",
    latitude: 48.8848,
    longitude: 2.2687,
    kycStatus: "verified",
    portfolioItems: [
      { title: "Amenagement jardin 200m2", description: "Plantation, gazon, allee en pas japonais", category: "jardinage" },
      { title: "Terrasse bois sur plots", description: "Pose terrasse IPE 35m2 avec jardiniere", category: "jardinage" },
    ],
  },
  {
    username: "hassan.diallo",
    password: "artisan123",
    firstName: "Hassan",
    lastName: "Diallo",
    email: "hassan.diallo@email.fr",
    phone: "+33690123456",
    role: "artisan",
    specialties: ["plomberie", "chauffage"],
    bio: "Plombier-chauffagiste certifie RGE. Installation, depannage et entretien de chaudieres et planchers chauffants.",
    website: null,
    googlePlaceId: "ChIJ6-fYvYJy5kcRExUPboBzgr8",
    certifications: ["RGE PG", "Qualibat 5311"],
    zone: "Argenteuil",
    latitude: 48.9472,
    longitude: 2.2467,
    kycStatus: "verified",
    portfolioItems: [
      { title: "Remplacement chaudiere fioul", description: "Passage chaudiere fioul vers gaz condensation", category: "plomberie" },
      { title: "Installation plancher chauffant", description: "Plancher chauffant hydraulique 80m2", category: "plomberie" },
    ],
  },
  {
    username: "emma.bernard",
    password: "artisan123",
    firstName: "Emma",
    lastName: "Bernard",
    email: "emma.bernard@email.fr",
    phone: "+33601234567",
    role: "artisan",
    specialties: ["electricite", "plomberie"],
    bio: "Artisan multi-competences, electricite et plomberie. Interventions rapides pour particuliers et professionnels.",
    website: "https://bernard-services.fr",
    googlePlaceId: null,
    certifications: ["Qualifelec E1", "Qualibat 5111"],
    zone: "Versailles",
    latitude: 48.8014,
    longitude: 2.1301,
    kycStatus: "verified",
    portfolioItems: [
      { title: "Renovation electrique maison", description: "Mise aux normes complete maison 120m2", category: "electricite" },
      { title: "Creation salle d'eau", description: "Plomberie + electrique salle d'eau sous combles", category: "plomberie" },
    ],
  },
];

const clientsData = [
  { username: "jean.client", password: "client123", firstName: "Jean", lastName: "Lambert", email: "jean.lambert@email.fr", phone: "+33611111111", role: "client" },
  { username: "marie.client", password: "client123", firstName: "Marie", lastName: "Duval", email: "marie.duval@email.fr", phone: "+33622222222", role: "client" },
  { username: "paul.client", password: "client123", firstName: "Paul", lastName: "Moreau", email: "paul.moreau@email.fr", phone: "+33633333333", role: "client" },
];

export async function seedDatabase() {
  console.log("Seeding database...");

  const existingUsers = await db.select().from(schema.users);
  if (existingUsers.length > 0) {
    console.log(`Database already has ${existingUsers.length} users, skipping seed.`);
    return;
  }

  const clients = [];
  for (const c of clientsData) {
    const user = await storage.createUser(c);
    await storage.createWallet({ userId: user.id, balance: 500, currency: "EUR" });
    clients.push(user);
    console.log(`  Created client: ${c.firstName} ${c.lastName}`);
  }

  const artisanUsers = [];
  for (const a of artisansData) {
    const user = await storage.createUser({
      username: a.username,
      password: a.password,
      firstName: a.firstName,
      lastName: a.lastName,
      email: a.email,
      phone: a.phone,
      role: a.role,
    });

    const profile = await storage.createArtisanProfile({
      userId: user.id,
      specialties: JSON.stringify(a.specialties),
      bio: a.bio,
      website: a.website,
      googlePlaceId: a.googlePlaceId,
      certifications: JSON.stringify(a.certifications),
      zone: a.zone,
      latitude: a.latitude,
      longitude: a.longitude,
      kycStatus: a.kycStatus,
      availability: true,
    });

    await storage.createWallet({ userId: user.id, balance: 0, currency: "EUR" });

    for (const item of a.portfolioItems) {
      await storage.createPortfolioItem({
        artisanId: profile.id,
        title: item.title,
        description: item.description,
        category: item.category,
        imageUrl: null,
        completedAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
      });
    }

    artisanUsers.push({ user, profile });
    console.log(`  Created artisan: ${a.firstName} ${a.lastName} (${a.zone})`);
  }

  const missionTemplates = [
    { title: "Fuite robinet cuisine", category: "plomberie", description: "Fuite importante sous l'evier de la cuisine, intervention urgente.", urgency: "urgent", price: 120 },
    { title: "Panne tableau electrique", category: "electricite", description: "Disjoncteur saute regulierement, besoin diagnostic complet.", urgency: "normal", price: 180 },
    { title: "Serrure bloquee porte entree", category: "serrurier", description: "Impossible d'ouvrir la porte d'entree, serrure 3 points.", urgency: "urgent", price: 150 },
    { title: "Peinture chambre 15m2", category: "peinture", description: "Remise en peinture complete chambre, 2 couches, blanc mat.", urgency: "normal", price: 350 },
    { title: "Debouchage canalisation", category: "plomberie", description: "Evacuation bouchee dans la salle de bain.", urgency: "urgent", price: 95 },
    { title: "Installation climatisation", category: "climatisation", description: "Installation split mural dans le salon, environ 30m2.", urgency: "normal", price: 1200 },
  ];

  const statuses = ["completed", "completed", "completed", "validated", "in_progress", "pending"];

  for (let i = 0; i < missionTemplates.length; i++) {
    const tmpl = missionTemplates[i];
    const client = clients[i % clients.length];
    const artisan = artisanUsers[i % artisanUsers.length];
    const status = statuses[i];

    const mission = await storage.createMission({
      clientId: client.id,
      artisanId: status !== "pending" ? artisan.user.id : undefined,
      title: tmpl.title,
      description: tmpl.description,
      category: tmpl.category,
      status,
      address: `${10 + i} Rue de la Paix, 75001 Paris`,
      latitude: 48.8566 + (Math.random() - 0.5) * 0.05,
      longitude: 2.3522 + (Math.random() - 0.5) * 0.05,
      estimatedPrice: tmpl.price,
      finalPrice: status === "completed" || status === "validated" ? tmpl.price : undefined,
      urgency: tmpl.urgency,
    });

    if (status === "completed" || status === "validated") {
      await storage.createReview({
        missionId: mission.id,
        fromUserId: client.id,
        toUserId: artisan.user.id,
        rating: 4 + Math.round(Math.random()),
        comment: "Excellent travail, tres professionnel et ponctuel.",
      });

      await storage.updateArtisanProfile(artisan.profile.id, {
        completedMissions: (artisan.profile.completedMissions || 0) + 1,
      });
    }

    console.log(`  Created mission: ${tmpl.title} (${status})`);
  }

  console.log("Seed complete!");
}
