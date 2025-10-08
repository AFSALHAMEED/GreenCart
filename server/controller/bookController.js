import Booking from "../model/Booking.js";
import Customer from "../model/Customer.js";

export const addBooking = async (req, res) => {
  try {
    const {
      firstName,
      email,
      phone,
      resortName,
      numberOfRooms,
      numberOfGuests,
      checkInDate,
      checkOutDate,
    } = req.body;
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    if (checkOut <= checkIn) {
      return res.status(400).json({
        success: false,
        message: "Check-out date must be after check-in date",
      });
    }
    console.log({ email });

    let customer = await Customer.findOne({ email });
    console.log("customer: ", customer);
    if (!customer) {
      return res.status(400).json({
        success: false,
        message: "Please login and book again",
      });
    }
    const booking = new Booking({
      customerId: customer._id,
      customerName: firstName,
      email,
      phone,
      resortName,
      numberOfRooms,
      numberOfGuests,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      totalPrice: 0,
    });
    customer.totalBookings += 1;
    await customer.save();

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
    await booking.save();
  } catch (error) {
    console.log("error: ", error.message);
    res.json({ success: false, message: error.message });
  }
};

export const getMyBooking = async (req, res) => {
  try {
    const { email } = req.query;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }
    const filter = { email: email.toLowerCase() };
    const allBookings = await Booking.find(filter);
    console.log({ allBookings });

    res.status(200).json({
      success: true,

      data: {
        bookingInfo: allBookings,
        count: allBookings.length,
      },
    });
  } catch (error) {
    console.log("error: ", error.message);
    res.json({ success: false, message: error.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { resortName: { $regex: search, $options: "i" } },
      ];
    }

    console.log("Filter:", JSON.stringify(filter));

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid pagination parameters. Page must be >= 1 and limit between 1-100",
      });
    }

    const bookings = await Booking.find(filter)

      .skip(skip)
      .limit(limitNum)
      .populate("customerId", "name email phone");

    const totalBookings = await Booking.countDocuments(filter);
    const totalPages = Math.ceil(totalBookings / limitNum);

    console.log(
      `Found ${bookings.length} bookings out of ${totalBookings} total`
    );

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalBookings,
        bookingsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching admin bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};
