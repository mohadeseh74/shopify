# General idea about the project

In this project I tried to implement an inhanced product filter for Shopify theme.

This filter should be able to filter the products in catalog page. It should have the ability to filter based on different parameters simultaneously, and have good UI with some animation.

To access the project you see the live demo here:
https://mohadese-test-store.myshopify.com/collections/all?view=test

Also you can see the added files to Shopify theme here:

- [collection-filters.liquid](https://github.com/mohadeseh74/shopify/blob/master/sections/collection-filters.liquid)
- [collection-filters.js](https://github.com/mohadeseh74/shopify/blob/master/assets/collection-filters.js)
- [collection-filters.scss](https://github.com/mohadeseh74/shopify/blob/master/assets/collection-filters.scss)
- [collection.test.json](https://github.com/mohadeseh74/shopify/blob/master/templates/collection.test.json)

# Explain chosen approach to implement

For implementing this task I could use client-side rendring with pure JS or one frameworks like react embeded in catalog page, but beside the smooth interaction this approach is not efficient for website SEO.

Also, another approach would be using GraphQL Storefront api and Hydrogen. But for this project the goal was to extend the project add functionality, and with this solution the whole store needs to be implemented.

Rendring the page in the server-side has its own downside. Like blank page between each request, and poor use interaction.

So, I decided to go with a PJAX-like approach. Where at first page will be rendered on server-side and then after each change on filter or sort value page will be fetched asynchronously by JS and replaced with current DOM.

# More about the implementation

I tried to add comment on different part of the code. But in general I started with cloning the catalog page and create a new filter section for it. In this section I've tried to make the page accessible. So user can interact with keyboard with the form. Also, Dawn theme supports lazy loading for products which is enable to improve the loadig speed.

For styling I used scss and [BEM](https://getbem.com/naming/) naming approach.

In JS code the `FilterHandler` class listening to the page events and load data with `fetch` and replace those data with current elements. Also, to improve the performance each request will be cached in a `Map` to have less request to the backend side.
