CartNova

Product Inventory and Shopping Cart Website

CartNova is an online shopping website developed using React as part of my CEC practical assignment. It allows customers to browse products, manage their shopping cart, place orders, and track their order history. It also includes an admin dashboard for managing customers, orders, inventory, and delivery status.

This project runs locally on your computer and does not currently have a publicly hosted website.

Features

Customer Features:-
* Browse products with images, prices, and categories.
* Search for products and filter them by category.
* View detailed information about individual products.
* Add products to the shopping cart.
* Increase or decrease product quantities.
* Remove products from the cart.
* Calculate the total price automatically.
* Create an account, log in, and log out.
* Place orders and update product stock.
* View previous orders through the My Orders page.
* View order dates, totals, status, and product summaries.
* Expand orders to view all products, quantities, prices, and line totals.
* View shipping information, delivery details, tracking numbers, and delivery progress.

Admin Dashboard:-
* View customer statistics, orders, revenue, and recent activity.
* View recorded login activity and timestamps.
* Review customer orders and order details.
* View delivery information and update delivery stages.
* View customer information and spending totals.
* Increase, decrease, reset, or manually edit product stock.
* Delete available demonstration records.

Technologies Used:-
* React
* JavaScript ES6
* JSX
* React Router
* Vite
* CSS
* Browser storage for demonstration data persistence


How to Run the Project:-

Prerequisites:-
Install Node.js on your computer. npm is included with Node.js.

Step 1:- Clone the Repository
Open a terminal and run the following command.
bash
command:- _git clone YOUR_GITHUB_REPOSITORY_URL_

==> Replace YOUR_GITHUB_REPOSITORY_URL with your actual GitHub repository URL.

Step 2:- Open the Project Folder
bash
command:- cd product-store

If your repository uses a different folder name, enter that name instead.

Step 3:- Install Dependencies
bash
command:- npm install

Step 4:- Start the Development Server
bash
command:- npm run dev

Step 5:- Open the Website
Open the local address displayed in your terminal. The default Vite address is usually:
http://localhost:5173

Keep the terminal open while using the website. Press Ctrl and C together in the terminal to stop the development server.

On Windows, avoid using special characters such as the ampersand in the project folder name because they may cause terminal issues.

How to Use CartNova as a Customer:-
1. Open the website in your browser.
2. Browse products without logging in.
3. Use the search bar or category filter to find products.
4. Select View Details to inspect a product.
5. Select Add to Cart. Create an account or log in if prompted.
6. Open the cart and use the plus and minus controls to adjust quantities.
7. Remove unwanted products and review the updated total.
8. Enter the required order information and select Place Order.
9. Open My Orders from the navigation bar to view your order history.
10. Select View Details and Tracking to inspect delivery information and order progress.
11. Use Show All Products to expand an order and view its complete product list.
12. Log out when finished.

How to Use CartNova as the Admin
Open the admin login page.
http://localhost:5173/admin-login

Use the demonstration credentials configured for the project.
Email: [admin@store.com](mailto:admin@store.com)
Password: admin123
After logging in, use the dashboard sections to manage the application.


Overview:- View summary statistics and recent activity.
Login Activity:- View recorded logins and timestamps.
Orders:- Review customer orders and open their tracking details.
Customers:- View customer records and spending totals.
Inventory:- Manage product stock and reset the demonstration inventory.

In the order tracking window, the admin can move an order through its delivery stages using the available controls. Customers can view their own order details and tracking progress without accessing the admin status controls.

==> The credentials are for demonstration purposes only and are not secure enough for a publicly deployed application.

Testing Customer and Admin Features Together:-
You can test the customer and admin workflows simultaneously.

1. Open http://localhost:5173 in one browser tab.
2. Open http://localhost:5173/admin-login in another tab of the same browser.
3. Place an order from the customer tab.
4. Check the Orders section in the admin dashboard.
5. Update the delivery stage from the admin tab.
6. Return to My Orders and check the customer's tracking information.

This is a convenient way to demonstrate the order management workflow. Updates and synchronization depend on the application's browser storage implementation.

CEC Assignment Concepts Covered:-
This project demonstrates several React and frontend development concepts.

* React ES6 and JSX
* Functional and class components where implemented
* Reusable components and component composition
* Props and event handling
* Lists and conditional rendering
* Forms and controlled inputs
* React Router and page navigation
* State management using React hooks
* Memoized calculations and filtering using useMemo where implemented
* Product listing, searching, category filtering, and product details
* Shopping cart operations and automatic total calculation
* Order creation, inventory updates, and delivery tracking
* Browser storage and client side data persistence

Important Limitations:-
CartNova is a frontend demonstration project and is not a production ready ecommerce platform.

* There is no backend server. Application data is stored in the browser rather than a central database.
* Customer records, orders, and inventory may not be shared across different browsers or computers.
* Client side authentication and demonstration credentials are not secure enough for production.
* No payment gateway is integrated.
* Shipping information and delivery stages are simulated.
* Stored data may be lost if browser storage is cleared. Private browsing and browser settings may also affect persistence.

Because this version does not use a central backend, it should not be treated as a real multi user online store.


Built With:- React, JavaScript, JSX, React Router, Vite, and CSS.

Repository: Add your GitHub repository URL here.
