const db = require("../db");

// Get all notifications for a user
exports.getNotifications = (req, res) => {
  const email = req.params.email;
  db.query(
    "SELECT * FROM Notification WHERE user_email = ? ORDER BY created_at DESC",
    [email],
    (err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "DB error", error: err.message });
      }
      res.json({ success: true, notifications: results });
    }
  );
};

// Mark a notification as read
exports.markAsRead = (req, res) => {
  const { id } = req.params;
  db.query(
    "UPDATE Notification SET is_read = TRUE WHERE id = ?",
    [id],
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "DB error", error: err.message });
      }
      res.json({ success: true, message: "Notification marked as read" });
    }
  );
};

// Create a new notification
exports.createNotification = (req, res) => {
  const { user_email, title, content, type } = req.body;
  const allowedTypes = ["accepted", "refused", "scheduled", "other"];
  const safeType = allowedTypes.includes(type) ? type : "other";
  db.query(
    "INSERT INTO Notification (user_email, title, content, type) VALUES (?, ?, ?, ?)",
    [user_email, title, content, safeType],
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "DB error", error: err.message });
      }
      res.json({
        success: true,
        message: "Notification created",
        id: result.insertId,
      });
    }
  );
};
