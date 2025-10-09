import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },

    resortName: {
      type: String,
      required: true,
      trim: true,
    },

    numberOfRooms: {
      type: Number,
      required: true,
      min: 1,
    },
    numberOfGuests: {
      type: Number,
      required: true,
      min: 1,
    },

    checkInDate: {
      type: Date,
      required: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    bookingReference: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.pre("save", function (next) {
  if (!this.bookingReference) {
    this.bookingReference =
      "BK" + Date.now() + Math.floor(Math.random() * 1000);
  }
  next();
});

const Booking =
  mongoose.models.booking || mongoose.model("booking", bookingSchema);

export default Booking;
