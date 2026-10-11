CARTNOVA

Product Inventory and Shopping Cart website built with React

CartNova is a small online shopping website that I built with React for my CEC practical assignment. You can browse products, add them to a cart and place an order. There is also an admin dashboard where the owner can see customers, orders and stock.

This project runs on localhost, which means it runs on your own computer. There is no live website link. Follow the steps below to run it.

HOW TO RUN IT ON YOUR COMPUTER

You need Node.js installed on your computer. Open a terminal and type these commands one by one.

git clone paste-your-repo-link-here

cd project-folder-name

npm install

npm run dev

When the terminal shows a Local address, open http://localhost:5173 in your browser. Keep the terminal open while you use the website. Press Ctrl and C in the terminal to stop it.

Tip: do not keep symbols like the and-sign in the folder name. It can break the terminal on Windows.

HOW TO USE IT AS A CUSTOMER

Open the website and look around. You can browse products without logging in.
Use the search box or the category dropdown to find products.
Click View Details on any product to see more about it.
Click Add to Cart. The website will ask you to sign up first. Fill in your name, email and password. The eye button lets you see your password.
Add more products. Then open your Cart from the top right corner. Use plus and minus to change how many you want. Use Remove to take an item out. The total price updates by itself.
Type your name and press Place Order. Your order is saved and the stock goes down.
Press Logout when you finish. Your cart will still be there the next time you log in.

HOW TO USE IT AS THE ADMIN

Click Admin in the top menu, or open http://localhost:5173/admin-login
Log in with this email and password.

Email: admin@store.com

Password: admin123

You will see the dashboard with five tabs.

Overview: see total customers, logins, orders and money earned, plus a live activity list.

Login activity: see who logged in and at what time.

Orders: see who bought what and when. Click Track to open the delivery window. It shows the shipping address, the delivery address, the tracking number and the delivery progress. Press Next stage to move the order forward.

Customers: see all customers and how much each one spent.

Inventory: see the stock of every product. Use minus, plus, plus 10 or type a number to change the stock.

Every tab has Delete buttons if you want to remove data. In Inventory, Reset stock brings back the original numbers.

EASY WAY TO TRY BOTH TOGETHER

Open http://localhost:5173 in one browser tab as a customer, and open http://localhost:5173/admin-login in another tab of the same browser as the admin. Place an order as the customer and you will see it show up in the admin tab within a few seconds.

Please use two tabs of the same browser and not two different browsers, because the data is saved inside the browser.

WHAT THIS PROJECT COVERS FROM THE CEC ASSIGNMENT

React ES6 and JSX in every file.

Functional and class components. Footer is the class component.

Reusable components: ProductCard, SearchBar and CategoryFilter.

Props, events, lists, forms and conditional rendering.

React Router to move between pages.

useMemo for the filtered product list and the cart total.

Product details: ID, name, category, price, quantity and image.

All the functions asked in the assignment: show products, search, filter by category, add to cart, increase and decrease quantity, remove items, calculate the total, and move between pages.

GOOD TO KNOW

This is a demo website with no backend. All the data, such as customers, orders and stock, is saved in your own browser, so it will not appear on someone else’s computer. If you open the site in a new browser, you start fresh.

The admin password and the shipping and delivery addresses are dummy examples.

A customer and the admin can be logged in at the same time if they use different tabs of the same browser.

If you close a tab, you are logged out of that tab.

BUILT WITH

React, React Router, Vite and plain CSS.
