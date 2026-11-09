export const LOW_STOCK = 5;

export const initialStock = {
  1: 24,
  2: 3,
  3: 12,
  4: 5,
  5: 18,
  6: 2,
  7: 9,
  8: 14,
  9: 7,
  10: 4,
  11: 20,
  12: 11,
};

export const weeklySales = [
  { day: "Mon", amount: 12400 },
  { day: "Tue", amount: 18900 },
  { day: "Wed", amount: 9500 },
  { day: "Thu", amount: 22300 },
  { day: "Fri", amount: 15800 },
  { day: "Sat", amount: 28700 },
  { day: "Sun", amount: 20100 },
];

export const adminOrders = [
  { id: "#LM1006", customer: "Nimali Perera", date: "2026-10-20", total: 21300, payment: "Stripe", status: "Pending" },
  { id: "#LM1005", customer: "Shanika Silva", date: "2026-10-19", total: 12400, payment: "Cash on delivery", status: "Pending" },
  { id: "#LM1004", customer: "Madheeha", date: "2026-10-18", total: 17900, payment: "Stripe", status: "Shipped" },
  { id: "#LM1003", customer: "Ayesha Fernando", date: "2026-10-16", total: 8900, payment: "Cash on delivery", status: "Delivered" },
  { id: "#LM1002", customer: "Dilini Jayawardena", date: "2026-10-12", total: 26400, payment: "Stripe", status: "Delivered" },
  { id: "#LM1001", customer: "Rizna Mohamed", date: "2026-10-08", total: 9500, payment: "Cash on delivery", status: "Cancelled" },
];

export const adminUsers = [
  { id: 1, name: "Admin", email: "admin@lumiere.lk", role: "admin", joined: "2026-09-01" },
  { id: 2, name: "Madheeha", email: "customer@lumiere.lk", role: "customer", joined: "2026-09-02" },
  { id: 3, name: "Nimali Perera", email: "nimali@example.com", role: "customer", joined: "2026-09-14" },
  { id: 4, name: "Shanika Silva", email: "shanika@example.com", role: "customer", joined: "2026-09-27" },
  { id: 5, name: "Ayesha Fernando", email: "ayesha@example.com", role: "customer", joined: "2026-10-03" },
];