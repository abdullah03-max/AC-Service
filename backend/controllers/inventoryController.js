const Inventory = require('../models/Inventory');

exports.getInventory = async (req, res, next) => {
  try {
    const { category, lowStock } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;

    let items = await Inventory.find(filter).sort('category name');
    if (lowStock === 'true') items = items.filter(i => i.quantity <= i.minStockLevel);

    res.json({ success: true, count: items.length, data: items });
  } catch (err) { next(err); }
};

exports.getInventoryItem = async (req, res, next) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
};

exports.createInventoryItem = async (req, res, next) => {
  try {
    const item = await Inventory.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) { next(err); }
};

exports.updateInventoryItem = async (req, res, next) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
};

exports.restockItem = async (req, res, next) => {
  try {
    const { quantity, supplier, cost } = req.body;
    const item = await Inventory.findByIdAndUpdate(
      req.params.id,
      {
        $inc: { quantity },
        $push: { restockHistory: { quantity, supplier, cost, restockedAt: new Date() } },
      },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
};

exports.deleteInventoryItem = async (req, res, next) => {
  try {
    await Inventory.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Item removed from inventory' });
  } catch (err) { next(err); }
};
