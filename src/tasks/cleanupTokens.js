const cron = require("node-cron");
const connection = require("../db").promise(); 

cron.schedule("0 0 * * *", async () => {
    console.log("🕒 Running cleanup job...");
  try {
    const [results] = await connection.query(
      "DELETE FROM blacklisted_tokens WHERE expires_at < NOW()"
    );
    console.log("✅ Expired tokens cleaned up");
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
  }
});
