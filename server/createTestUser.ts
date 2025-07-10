import { storage } from "./storage";
import { hashPassword } from "./localAuth";

// Script zum Erstellen eines Test-Administrators
async function createTestUser() {
  try {
    const hashedPassword = await hashPassword("test123");
    
    const testUser = await storage.upsertUser({
      id: `local_admin_${Date.now()}`,
      email: "admin@test.de",
      firstName: "Test",
      lastName: "Administrator",
      password: hashedPassword,
      role: "admin",
      privacyConsent: true,
      emailNotificationsEnabled: true,
      licenseType: "enterprise",
      paymentStatus: "paid",
    });

    console.log("Test-Benutzer erstellt:", testUser);
    console.log("Login-Daten:");
    console.log("E-Mail: admin@test.de");
    console.log("Passwort: test123");
    
    process.exit(0);
  } catch (error) {
    console.error("Fehler beim Erstellen des Test-Benutzers:", error);
    process.exit(1);
  }
}

createTestUser();