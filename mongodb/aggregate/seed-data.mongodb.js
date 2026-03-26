// MongoDB Aggregation Seed Data
use("aggregationDB")

// Clear existing collections
db.users.drop()
db.orders.drop()
db.products.drop()
db.sales.drop()
db.events.drop()
db.inventory.drop()

// 1. Users Collection
db.users.insertMany([
  { _id: 1, name: "Alice Johnson", firstName: "Alice", lastName: "Johnson", email: "alice@gmail.com", age: 28, phone: "123-456-7890", address: { city: "New York", state: "NY", zip: "10001" } },
  { _id: 2, name: "Bob Smith", firstName: "Bob", lastName: "Smith", email: "bob@yahoo.com", age: 35, phone: null, address: { city: "Los Angeles", state: "CA", zip: "90210" } },
  { _id: 3, name: "Carol Davis", firstName: "Carol", lastName: "Davis", email: "carol@gmail.com", age: 42, phone: "555-123-4567", address: { city: "Chicago", state: "IL", zip: "60601" } },
  { _id: 4, name: "David Wilson", firstName: "David", lastName: "Wilson", email: "david@hotmail.com", age: 19, phone: "777-888-9999", address: { city: "Miami", state: "FL", zip: "33101" } },
  { _id: 5, name: "Eve Brown", firstName: "Eve", lastName: "Brown", email: "eve@gmail.com", age: 31, phone: "999-111-2222", address: { city: "Seattle", state: "WA", zip: "98101" } }
])

// 2. Products Collection
db.products.insertMany([
  { _id: 1, name: "Wireless Bluetooth Headphones", category: "Electronics", brand: "Sony", price: 150, stock: 25, rating: 4.5, inStock: true, tags: ["wireless", "bluetooth", "premium"], description: "High-quality wireless headphones" },
  { _id: 2, name: "Gaming Laptop", category: "Electronics", brand: "Dell", price: 1200, stock: 8, rating: 4.8, inStock: true, tags: ["gaming", "laptop", "premium"], description: "Powerful gaming laptop" },
  { _id: 3, name: "Coffee Maker", category: "Appliances", brand: "Keurig", price: 80, stock: 15, rating: 4.2, inStock: true, tags: ["coffee", "kitchen"], description: "Single-serve coffee maker" },
  { _id: 4, name: "Running Shoes", category: "Sports", brand: "Nike", price: 120, stock: 0, rating: 4.6, inStock: false, tags: ["running", "sports"], description: "Comfortable running shoes" },
  { _id: 5, name: "Smartphone", category: "Electronics", brand: "Apple", price: 800, stock: 12, rating: 4.9, inStock: true, tags: ["phone", "premium"], description: "Latest smartphone model" },
  { _id: 6, name: "Desk Chair", category: "Furniture", brand: "Herman Miller", price: 300, stock: 5, rating: 4.3, inStock: true, tags: ["office", "furniture"], description: "Ergonomic office chair" },
  { _id: 7, name: "Wireless Mouse", category: "Electronics", brand: "Logitech", price: 25, stock: 50, rating: 4.1, inStock: true, tags: ["wireless", "mouse"], description: "Wireless computer mouse" }
])

// 3. Orders Collection
db.orders.insertMany([
  { _id: 1, userId: 1, status: "completed", amount: 270, year: 2024, month: 1, createdAt: new Date("2024-01-15"), items: [{ productId: 1, name: "Wireless Headphones", price: 150, qty: 1, category: "Electronics" }, { productId: 3, name: "Coffee Maker", price: 80, qty: 1, category: "Appliances" }], discount: 40 },
  { _id: 2, userId: 2, status: "completed", amount: 1200, year: 2024, month: 2, createdAt: new Date("2024-02-10"), items: [{ productId: 2, name: "Gaming Laptop", price: 1200, qty: 1, category: "Electronics" }], discount: 100 },
  { _id: 3, userId: 3, status: "pending", amount: 920, year: 2024, month: 3, createdAt: new Date("2024-03-05"), items: [{ productId: 5, name: "Smartphone", price: 800, qty: 1, category: "Electronics" }, { productId: 4, name: "Running Shoes", price: 120, qty: 1, category: "Sports" }], discount: 0 },
  { _id: 4, userId: 1, status: "completed", amount: 325, year: 2024, month: 3, createdAt: new Date("2024-03-20"), items: [{ productId: 6, name: "Desk Chair", price: 300, qty: 1, category: "Furniture" }, { productId: 7, name: "Wireless Mouse", price: 25, qty: 1, category: "Electronics" }], discount: 25 },
  { _id: 5, userId: 4, status: "cancelled", amount: 150, year: 2024, month: 4, createdAt: new Date("2024-04-01"), items: [{ productId: 1, name: "Wireless Headphones", price: 150, qty: 1, category: "Electronics" }], discount: 0 },
  { _id: 6, userId: 5, status: "completed", amount: 105, year: 2024, month: 4, createdAt: new Date("2024-04-15"), items: [{ productId: 3, name: "Coffee Maker", price: 80, qty: 1, category: "Appliances" }, { productId: 7, name: "Wireless Mouse", price: 25, qty: 1, category: "Electronics" }], discount: 0 }
])

// 4. Sales Collection
db.sales.insertMany([
  { _id: 1, region: "North", category: "Electronics", revenue: 15000, cost: 10000, salesman: "John Doe", date: new Date("2024-01-15") },
  { _id: 2, region: "South", category: "Electronics", revenue: 12000, cost: 8000, salesman: "Jane Smith", date: new Date("2024-01-20") },
  { _id: 3, region: "North", category: "Appliances", revenue: 8000, cost: 5000, salesman: "John Doe", date: new Date("2024-02-10") },
  { _id: 4, region: "East", category: "Electronics", revenue: 18000, cost: 12000, salesman: "Mike Johnson", date: new Date("2024-02-15") },
  { _id: 5, region: "West", category: "Sports", revenue: 6000, cost: 4000, salesman: "Sarah Wilson", date: new Date("2024-03-01") },
  { _id: 6, region: "North", category: "Electronics", revenue: 20000, cost: 13000, salesman: "John Doe", date: new Date("2024-03-10") },
  { _id: 7, region: "South", category: "Furniture", revenue: 9000, cost: 6000, salesman: "Jane Smith", date: new Date("2024-03-20") }
])

// 5. Events Collection (User Activity)
db.events.insertMany([
  { _id: 1, userId: 1, action: "login", timestamp: new Date("2024-04-01T10:00:00Z") },
  { _id: 2, userId: 1, action: "view_product", timestamp: new Date("2024-04-01T10:05:00Z") },
  { _id: 3, userId: 1, action: "add_to_cart", timestamp: new Date("2024-04-01T10:10:00Z") },
  { _id: 4, userId: 2, action: "login", timestamp: new Date("2024-04-01T11:00:00Z") },
  { _id: 5, userId: 2, action: "search", timestamp: new Date("2024-04-01T11:05:00Z") },
  { _id: 6, userId: 1, action: "purchase", timestamp: new Date("2024-04-01T10:15:00Z") },
  { _id: 7, userId: 3, action: "login", timestamp: new Date("2024-04-02T09:00:00Z") },
  { _id: 8, userId: 3, action: "view_product", timestamp: new Date("2024-04-02T09:05:00Z") },
  { _id: 9, userId: 1, action: "logout", timestamp: new Date("2024-04-01T10:20:00Z") },
  { _id: 10, userId: 2, action: "view_product", timestamp: new Date("2024-04-01T11:10:00Z") }
])

// 6. Inventory Collection
db.inventory.insertMany([
  { _id: 1, productId: 1, stock: 25, sold: 15, reorderLevel: 10, quantity: 40 },
  { _id: 2, productId: 2, stock: 8, sold: 12, reorderLevel: 5, quantity: 20 },
  { _id: 3, productId: 3, stock: 15, sold: 25, reorderLevel: 20, quantity: 40 },
  { _id: 4, productId: 4, stock: 0, sold: 30, reorderLevel: 15, quantity: 30 },
  { _id: 5, productId: 5, stock: 12, sold: 8, reorderLevel: 10, quantity: 20 }
])

// Create text index for product search
db.products.createIndex({ name: "text", description: "text" })

// Create indexes for performance
db.orders.createIndex({ status: 1, year: 1 })
db.orders.createIndex({ userId: 1 })
db.events.createIndex({ userId: 1, timestamp: -1 })
db.sales.createIndex({ region: 1, date: -1 })

print("✅ Seed data inserted successfully!")
print("Collections created: users, orders, products, sales, events, inventory")
print("Indexes created for optimal aggregation performance")