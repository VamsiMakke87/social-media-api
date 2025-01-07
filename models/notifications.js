const mongoose = require("mongoose");

const notificationsSchema = mongoose.Schema(
  {
    fromUserId: {
      type: String,
      max: 50,
      required: true,
    },
    toUserId: {
      type: String,
      max: 50,
      required: true,
    },
    notificationType: {
      type: Number,
      required: true
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notifications", notificationsSchema);
