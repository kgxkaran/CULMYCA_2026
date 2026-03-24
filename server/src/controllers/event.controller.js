import Event from '../models/Event.js';

// ─── CREATE event (admin only) ────────────────────────────
export const createEvent = async (req, res) => {
  try {
    const {
      title, description, category, date, time,
      venue, isPaid, registrationFee, teamSizeMin,
      teamSizeMax, totalSlots, prizes, rules,
    } = req.body;

    if (!isPaid && registrationFee > 0) {
      return res.status(400).json({
        message: 'Free event cannot have registration fee',
      });
    }

    const event = await Event.create({
      title, description, category, date, time,
      venue, isPaid,
      registrationFee: isPaid ? registrationFee : 0,
      teamSizeMin, teamSizeMax, totalSlots,
      prizes, rules,
      createdBy: req.user._id, 
    });

    res.status(201).json({
      message: 'Event created successfully!',
      event,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── GET ALL events (everyone dekh sakta hai) ─────────────
export const getAllEvents = async (req, res) => {
  try {
    const { category, isPaid, search } = req.query;

    let filter = { isActive: true };

    if (category) filter.category = category;

    if (isPaid !== undefined) {
      filter.isPaid = isPaid === 'true'; 
   
    }

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const events = await Event.find(filter)
      .populate('createdBy', 'name email') 
      .sort({ date: 1 }); 

    res.json({
      count: events.length,
      events,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── GET SINGLE event ──────────────────────────────────────
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ event });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── UPDATE event (admin only) ────────────────────────────
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Event updated successfully!',
      event: updatedEvent,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── DELETE event (admin only) ────────────────────────────
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await Event.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({ message: 'Event deleted successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── GET events by category ───────────────────────────────
export const getEventsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const events = await Event.find({ 
      category, 
      isActive: true 
    }).sort({ date: 1 });

    res.json({ count: events.length, events });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};