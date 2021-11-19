import * as faker from "faker";
import { createObjectCsvWriter } from "csv-writer";
import { PRODUCTS } from "./products";

faker.setLocale("de");

interface User {
  id: number;
  first_name: string;
  last_name: string;
  city: string;
  age: number;
  gender: string;
}

interface Order {
  id: number;
  user_id: number;
  status: string;
  created_at: string;
  solved_at: string | null;
}

interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
}

interface Product {
  id: number;
  name: string;
  type: string;
  price: number;
  cost: number;
}

const COUNT_OF_USERS = 1000;
/**
 * Should be at least 1000 and should be round to 1000
 */
const COUNT_OF_ORDERS = 6000;
const COUNT_OF_PRODUCTS = 10;

const generateUsersData = (): User[] => {
  const userIds = Array.from((Array(COUNT_OF_USERS).keys()));
  const users: User[] = [];

  userIds.forEach((id, index) => {
    const gender = faker.datatype.number({ min: 0, max: 1 });
    users[index] = {
      id,
      first_name: faker.name.firstName(gender),
      last_name: faker.name.lastName(gender),
      city: faker.address.state(),
      age: faker.datatype.number({ min: 20, max: 55 }),
      gender: gender ? "Woman" : "Man",
    };
  });

  return users;
};

const generateOrdersData = (): [Order[], OrderItem[]] => {
  const orderIds = Array.from((Array(COUNT_OF_ORDERS).keys()));
  const orders: Order[] = [];
  const orderItems: OrderItem[] = [];
  const maxMonth = COUNT_OF_ORDERS / 1000;
  /**
   * This whole is because it ensures that the *last month* in data is *this* month...
   * For example, if you run this script in may, the last month in data will be may...
   */
  const date = new Date();
  const currentMonth = date.getMonth();
  let month = currentMonth - maxMonth;

  orderIds.forEach((id, index) => {
    const statusAccepted = index % 5 === 0;
    const statusInProgress = index % 3 === 0;
    const createdAtDateStart = new Date();
    const createdAtDateEnd = new Date();

    if (index % 1000 === 0) {
      month = month + 1;
    }

    createdAtDateStart.setMonth(month - 1);
    createdAtDateEnd.setMonth(month);

    const createdAt = faker.date.between(createdAtDateStart, createdAtDateEnd);
    const date = createdAt.getDate();
    const solvedAtStart = new Date(createdAt.getTime());
    const solvedAtEnd = new Date(createdAt.getTime());
    solvedAtEnd.setDate(faker.datatype.number({ min: date, max: date + 3 }));
    const solvedAt = faker.date.between(solvedAtStart, solvedAtEnd);

    let status = "sent";

    if (statusAccepted && (month === currentMonth)) {
      status = "accepted";
    }

    if (statusInProgress && (month === currentMonth)) {
      status = "in_progress";
    }

    orders[index] = {
      id,
      user_id: faker.datatype.number({ min: 0, max: COUNT_OF_USERS - 1 }),
      status,
      created_at: createdAt.toLocaleDateString(),
      solved_at: status === "sent" ? solvedAt.toLocaleDateString() : null,
    };

    orderItems[index] = {
      id,
      order_id: id,
      product_id: faker.datatype.number({ min: 0, max: COUNT_OF_PRODUCTS - 1 }),
      quantity: faker.datatype.number({ min: 1, max: 10 }),
    };
  });

  return [orders, orderItems];
};

const generateProductsData = (): Product[] => {
  const products: Product[] = [];

  PRODUCTS.forEach((product, index) => {
    products[index] = {
      id: product.id,
      name: product.name,
      type: product.type,
      price: product.price,
      cost: product.cost,
    };
  });

  return products;
};

function main() {
  const users = generateUsersData();
  const [orders, orderItems] = generateOrdersData();
  const products = generateProductsData();

  const csvWriterUsers = createObjectCsvWriter({
    path: "./data/users.csv",
    header: [
      { id: "id", title: "id" },
      { id: "first_name", title: "first_name" },
      { id: "last_name", title: "last_name" },
      { id: "city", title: "city" },
      { id: "age", title: "age" },
      { id: "gender", title: "gender" },
    ],
  });
  csvWriterUsers.writeRecords(users);

  const csvWriterOrders = createObjectCsvWriter({
    path: "./data/orders.csv",
    header: [
      { id: "id", title: "id" },
      { id: "user_id", title: "user_id" },
      { id: "status", title: "status" },
      { id: "created_at", title: "created_at" },
      { id: "solved_at", title: "solved_at" },
    ],
  });
  csvWriterOrders.writeRecords(orders);

  const csvWriterOrderItems = createObjectCsvWriter({
    path: "./data/order_items.csv",
    header: [
      { id: "id", title: "id" },
      { id: "order_id", title: "order_id" },
      { id: "product_id", title: "product_id" },
      { id: "quantity", title: "quantity" },
    ],
  });
  csvWriterOrderItems.writeRecords(orderItems);

  const csvWriterProducts = createObjectCsvWriter({
    path: "./data/products.csv",
    header: [
      { id: "id", title: "id" },
      { id: "name", title: "name" },
      { id: "type", title: "type" },
      { id: "price", title: "price" },
      { id: "cost", title: "cost" },
    ],
  });
  csvWriterProducts.writeRecords(products);
}

main();
