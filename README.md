# Grab Your Mobile – Smartphone Shopping App

A front-end e-commerce web app for buying smartphones, built with **HTML, CSS, JavaScript and Bootstrap 5**. No backend or frameworks: cart, wishlist and orders are saved in the browser with `localStorage`.

## Features

- **Home / shop page** – hero carousel, offer cards, shop-by-brand tiles and a product grid of 30 phones from 10 brands
- **Search** – by phone name, brand, colour or storage
- **Filters** – brand, price range, storage and bank offer, with removable filter chips
- **Sorting** – popularity, price (low to high / high to low), discount, rating
- **Product page** – price, MRP and discount, offers, quantity selector, pincode delivery check, highlights, similar products
- **Cart** – change quantity, remove, save for later, coupon codes (`GRAB10`, `NEW500`), price breakdown
- **Buy Now** – checks out a single product without changing the cart
- **Checkout** – address form with validation (10-digit mobile, 6-digit pincode, email, state), UPI or Cash on Delivery
- **Orders** – order confirmation, order history, delivery tracker, cancel order and buy again
- **Wishlist** – save phones with the heart button
- **Responsive** – works on mobile, tablet and desktop

## Pages

| File | Page |
|------|------|
| `index.html` | Home and shop |
| `product.html?id=…` | Product details |
| `cart.html` | Cart |
| `checkout.html` | Checkout |
| `orders.html` | My orders |
| `wishlist.html` | Wishlist |

## Code structure

```
css/style.css      Custom styles on top of Bootstrap
js/data.js         Product catalogue, brands and coupons
js/app.js          Shared code: navbar, footer, cart, wishlist, toasts
js/home.js         Search, filters and sorting
js/product.js      Product details page
js/cart.js         Cart page
js/checkout.js     Checkout form and placing orders
js/orders.js       Orders page
```

## How to run

Open `index.html` in a browser (Chrome recommended). An internet connection is needed to load Bootstrap from its CDN.

To add a phone, add an entry to `PRODUCTS` in `js/data.js`.

## Note

This is a demo project. No real payments are processed.
