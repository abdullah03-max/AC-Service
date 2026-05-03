const Service = require('../models/Service');

// @desc Get all services
// @route GET /api/services
exports.getServices = async (req, res, next) => {
  try {
    const { category, active } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (active !== undefined) filter.isActive = active === 'true';

    const services = await Service.find(filter).populate('inventoryRequired.item', 'name unit').sort('-bookingCount');
    res.json({ success: true, count: services.length, data: services });
  } catch (err) { next(err); }
};

// @desc Get single service
// @route GET /api/services/:id
exports.getService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id).populate('inventoryRequired.item');
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, data: service });
  } catch (err) { next(err); }
};

// @desc Create service (admin)
// @route POST /api/services
exports.createService = async (req, res, next) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json({ success: true, data: service });
  } catch (err) { next(err); }
};

// @desc Update service (admin)
// @route PUT /api/services/:id
exports.updateService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, data: service });
  } catch (err) { next(err); }
};

// @desc Delete service (admin)
// @route DELETE /api/services/:id
exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, message: 'Service deleted' });
  } catch (err) { next(err); }
};
