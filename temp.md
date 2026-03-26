# E-commerce Platform with ReactJS and TypeScript

## 1. Project Overview

### 1.1 Purpose
The purpose of this application is to provide a web-based e-commerce platform that allows users to browse products, search and filter items, view product details, and bookmark products.

The system provides a simple online shopping interface with authentication, product catalog browsing, and product interaction features.

The application is implemented using ReactJS, TypeScript, Redux, and TailwindCSS.

## 2. Objectives
The main objectives of the project are:
* Provide a responsive product catalog interface.
* Enable users to login and manage sessions.
* Allow users to search and filter products.
* Provide product details with ratings and images.
* Enable bookmarking of favorite products.
* Maintain application state using Redux.

## 3. Scope of the System

### In Scope
* User authentication
* Product listing
* Product filtering and sorting
* Product detail view
* Bookmarking products

### Out of Scope
* Payment processing
* Order placement
* Inventory management
* Admin product management

## 4. System Architecture

### 4.1 Technology Stack
| Component | Technology |
| :--- | :--- |
| **Frontend** | ReactJS |
| **Language** | TypeScript |
| **State Management** | Redux |
| **Routing** | React Router v6 |
| **UI Framework** | TailwindCSS |
| **Component Library** | HeadlessUI |
| **API** | FakeStore API |
| **Code Quality** | ESLint, Prettier |

The project uses FakeStoreAPI for product data and authentication. (https://fakestoreapi.com/users)

## 5. User Roles
* **User**: Can login, view products, search, filter, bookmark

This project currently supports only a standard user role.

## 6. Functional Requirements

### 6.1 User Authentication
**Description**
Users must login before accessing the product catalog.

**Functional Flow**
1. User navigates to login page
2. User enters credentials
3. System authenticates using FakeStore API
4. User session is created
5. User redirected to product listing

**Sample Credentials**
* `username`: mor_2314
* `password`: 83r5^_

### 6.2 User Login
**Inputs**
* Username
* Password

**Output**
* Successful login
* Redirect to product catalog

**Validation**
* Required fields
* Valid credentials

### 6.3 User Logout
**Description**
Users can logout from the system.

**Flow**
1. Click logout button
2. Session is cleared
3. Redirect to login page

## 7. Product Catalog

### 7.1 Product Listing
**Description**
Display a list of products with essential details.

**Product Information**
* **Product Title**: Name of product
* **Price**: Product price
* **Rating**: Customer rating
* **Image**: Product image

Users can view all products available in the system. (GitHub)

### 7.2 Search Products
**Description**
Users can search products by name.

**Functional Logic**
1. User enters keyword
2. System filters products locally
3. Display matching results

*Note: Search is implemented in the frontend because FakeStore API does not support it directly. (GitHub)*

### 7.3 Sort Products
**Sorting Options**
* **Rating**: Highest to lowest
* **Price (ASC)**: Low to high
* **Price (DESC)**: High to low

### 7.4 Filter Products
**Filter Type**
Category based filtering. Example categories:
* Electronics
* Clothing
* Accessories

Users can filter products based on category selection.

## 8. Product Details Page
**Description**
Displays detailed information about a selected product.

**Fields**
* **Title**: Product name
* **Description**: Product information
* **Price**: Cost
* **Rating**: Customer rating
* **Category**: Product category
* **Image**: Product image

## 9. Bookmark Product
**Description**
Users can bookmark products for future reference.

**Functional Flow**
1. User clicks bookmark icon
2. Product saved in bookmarked list
3. User can remove bookmark

## 10. Non-Functional Requirements

### 10.1 Performance
* Page load time < 3 seconds
* API response handling using async calls

### 10.2 Security
* Authentication required for product access
* Session handling

### 10.3 Usability
* Responsive UI
* Clean layout using TailwindCSS

### 10.4 Maintainability
* Type safety using TypeScript
* Code formatting using Prettier
* Code linting using ESLint

## 11. UI Components
Key UI Components include:
* Login Page
* Header Navigation
* Product Grid
* Search Bar
* Filter Panel
* Product Details Page
* Bookmark Button

## 12. Data Flow
`User → Login Page → Authentication API ↓ Product Page ↓ Product API ↓ Search / Filter / Sort (Client Side) ↓ Display Products`

## 13. Installation & Setup

**Step 1**
```bash
git clone repository-url
```

**Step 2**
```bash
npm install
```

**Step 3**
```bash
npm start
```

Application runs on: `http://localhost:3000`

## 14. Future Enhancements
Possible improvements include:
* Shopping cart
* Checkout and payment gateway
* Order management
* Admin dashboard
* Product reviews
* Wishlist
* Recommendation engine
