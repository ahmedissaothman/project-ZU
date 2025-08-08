 
const ROLES = {
  ADMIN: 'Admin',
  MANAGER: 'Manager', 
  TECHNICIAN: 'Technician Pharmacist',
  CASHIER: 'Cashier',
  DELIVERY: 'Delivery Person'
};

const MOVEMENT_TYPES = {
  IN: 'IN',
  OUT: 'OUT',
  DAMAGE: 'DAMAGE'
};

const ORDER_STATUS = {
  PENDING: 'PENDING',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
};

const PAYMENT_STATUS = {
  PAID: 'PAID',
  UNPAID: 'UNPAID',
  PARTIAL: 'PARTIAL'
};

const DELIVERY_STATUS = {
  PENDING: 'PENDING',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED'
};

module.exports = {
  ROLES,
  MOVEMENT_TYPES,
  ORDER_STATUS,
  PAYMENT_STATUS,
  DELIVERY_STATUS
};