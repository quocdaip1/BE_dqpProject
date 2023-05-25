const db = require("../models");
const Product = db.product;
const Invoice = db.invoice;
const InvoiceItem = db.invoiceItem;
const User = db.user;

responsePayload = (status, message, payload) => ({
  status,
  message,
  payload,
});

exports.findAll = async (req, res) => {
  try {
    let query = {};
    if (req.query.status) query.status = req.query.status;
    const order = [["totalPaid", req.query.orderBy || "ASC"]];
    const page = req.query.page ? parseInt(req.query.page) - 1 : 0;
    const limit = parseInt(req.query.limit) || 10;
    const offset = page * limit;
    const total = await Invoice.findAll({ where: query });
    const totalPage = Math.ceil(total.length / limit);
    const invoices = await Invoice.findAll({
      where: query,
      order,
      limit,
      offset,
    });
    res.json(
      responsePayload(true, "Tải danh sách hoá đơn thành công!", {
        items: invoices,
        meta: {
          currentPage: page + 1,
          limit,
          totalItems: total.length,
          totalPage,
        },
      })
    );
  } catch (err) {
    res.status(500).json(responsePayload(false, err.message, null));
  }
};

exports.findById = async (req, res) => {
  try {
    if (!req.params.id)
      return res
        .status(400)
        .json(responsePayload(false, "Đường dẫn thiêú id hoá đơn!", null));
    const invoice = await Invoice.findOne({
      where: {
        id: req.params.id,
      },
      include: [{ model: InvoiceItem, include: Product }, { model: User }],
    });
    if (!invoice)
      return res.json(responsePayload(false, "Hoá đơn không tồn tại!", null));
    res.json(
      responsePayload(true, "Tải thông tin hoá đơn thành công!", invoice)
    );
  } catch (err) {
    res.status(500).json(responsePayload(false, err.message, null));
  }
};

exports.update = async (req, res) => {
  try {
    if (!req.params.id)
      return res
        .status(400)
        .json(responsePayload(false, "Đường dẫn thiêú id hoá đơn!", null));
    const invoice = await Invoice.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!invoice)
      return res
        .status(400)
        .json(responsePayload(false, "Hoá đơn không tồn tại!", null));
    if (invoice.status === "canceled")
      return res
        .status(400)
        .json(
          responsePayload(
            false,
            "Không thể cập nhật hoá đơn này đã bị huỷ!",
            null
          )
        );
    let total = invoice.total;
    for (const removeId of req.body.removeItems) {
      const removeItem = await InvoiceItem.findOne({
        where: { id: removeId },
        include: Product,
      });
      if (!removeItem)
        return res
          .status(400)
          .json(
            responsePayload(
              false,
              `Id "${removeId}" của item trong hoá đơn không tồn tại!`,
              null
            )
          );
      const product = await Product.findOne({
        where: { code: removeItem.product.code },
      });
      if (!product)
        return res
          .status(400)
          .json(responsePayload(true, "Sản phẩm không tồn tại!", null));
      product.quantity += removeItem.quantity;
      if (product.status !== "removed") product.status = "active";
      await product.save();
      total -= removeItem.quantity * product.price;
      await removeItem.destroy();
    }
    for (const item of req.body.newItems) {
      const product = await Product.findOne({
        where: { code: item.productCode, status: "active" },
      });
      if (!product)
        return res
          .status(400)
          .json(responsePayload(true, "Sản phẩm không tồn tại hoặc đã hết hàng!", null));
      if (product.quantity < item.quantity)
        return res
          .status(400)
          .json(
            responsePayload(
              true,
              `Đơn hàng vượt quá số lượng sản phẩm của ${product.name}`,
              null
            )
          );
      const totalOfItem = item.quantity * product.price;
      total += totalOfItem;
      const newInvoiceItem = await InvoiceItem.create({
        quantity: item.quantity,
        total: totalOfItem,
      });
      const remaining = product.quantity - item.quantity;
      product.quantity = remaining;
      if (remaining === 0) product.status = "outOfStock";
      await product.save();
      await newInvoiceItem.setInvoice(invoice);
      await newInvoiceItem.setProduct(product);
    }
    let totalPaid = total + 15000;
    invoice.total = total;
    invoice.totalPaid = totalPaid;
    await invoice.save();
    const savedInvoice = await Invoice.findOne({
      where: { id: invoice.id },
      include: [{ model: InvoiceItem, include: Product }, { model: User }],
    });
    res.json(
      responsePayload(
        true,
        "Cập nhật thông tin hoá đơn thành công!",
        savedInvoice
      )
    );
  } catch (err) {
    res.status(500).json(responsePayload(false, err.message, null));
  }
};

exports.create = async (req, res) => {
  try {
    const invoice = await Invoice.create({ subTotal: 15000 });
    let total = 0;
    for (const item of req.body.items) {
      const product = await Product.findOne({
        where: { code: item.productCode, status: "active" },
      });
      if (!product)
        return res
          .status(400)
          .json(responsePayload(true, "Sản phẩm không tồn tại!", null));
      if (product.quantity < item.quantity)
        return res
          .status(400)
          .json(
            responsePayload(
              true,
              `Đơn hàng vượt quá số lượng sản phẩm của ${product.name}`,
              null
            )
          );
      const totalOfItem = item.quantity * product.price;
      total += totalOfItem;
      const newInvoiceItem = await InvoiceItem.create({
        quantity: item.quantity,
        total: totalOfItem,
      });
      const remaining = product.quantity - item.quantity;
      product.quantity = remaining;
      if (remaining === 0) product.status = "outOfStock";
      await product.save();
      await newInvoiceItem.setInvoice(invoice);
      await newInvoiceItem.setProduct(product);
    }
    let totalPaid = total + 15000;
    const user = await User.findOne({ where: { id: req.userId } });
    invoice.total = total;
    invoice.totalPaid = totalPaid;
    await invoice.save();
    await invoice.setUser(user);
    const savedInvoice = await Invoice.findOne({
      where: { id: invoice.id },
      include: [{ model: InvoiceItem, include: Product }, { model: User }],
    });
    res.json(responsePayload(true, "Tạo hoá đơn thành công!", savedInvoice));
  } catch (err) {
    res.status(500).json(responsePayload(false, err.message, null));
  }
};

exports.cancelInvoice = async (req, res) => {
  try {
    if (!req.params.id)
      return res
        .status(400)
        .json(responsePayload(false, "Đường dẫn thiêú id hoá đơn!", null));

    const invoice = await Invoice.findOne({
      where: {
        id: req.params.id,
      },
      include: [{ model: InvoiceItem, include: Product }, { model: User }],
    });
    if (!invoice)
      return res
        .status(400)
        .json(responsePayload(false, "hoá đơn không tồn tại!", null));
    if (invoice.status === "canceled")
      return res
        .status(400)
        .json(responsePayload(false, "Hoá đơn này đã bị huỷ!", invoice));
    for (const item of invoice.invoiceItems) {
      const product = await Product.findOne({
        where: { code: item.product.code },
      });
      product.quantity += item.quantity;
      product.status = "active";
      await product.save();
    }
    invoice.status = "canceled";
    await invoice.save();
    res.json(responsePayload(true, "Huỷ hoá đơn thành công!", invoice));
  } catch (err) {
    res.status(500).json(responsePayload(false, err.message, null));
  }
};

exports.acceptInvoice = async (req, res) => {
  try {
    if (!req.params.id)
      return res
        .status(400)
        .json(responsePayload(false, "Đường dẫn thiêú id hoá đơn!", null));

    const invoice = await Invoice.findOne({
      where: {
        id: req.params.id,
      },
      include: [{ model: InvoiceItem, include: Product }, { model: User }],
    });
    if (!invoice)
      return res
        .status(400)
        .json(responsePayload(false, "Hoá đơn không tồn tại!", null));
    if (invoice.status === "canceled")
      return res
        .status(400)
        .json(responsePayload(false, "Hoá đơn này đã bị huỷ!", invoice));
    invoice.status = "accepted";
    await invoice.save();
    res.json(responsePayload(true, "Xác nhận hoá đơn thành công!", invoice));
  } catch (err) {
    res.status(500).json(responsePayload(false, err.message, null));
  }
};
