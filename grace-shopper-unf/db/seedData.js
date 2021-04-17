const client = require("./client");
const { createUser, createProducts, createReview, createAdditionalReview } = require('./index')
async function dropTables() {
    try {
        await client.query(`
        DROP TABLE IF EXISTS products_reviews;
        DROP TABLE IF EXISTS user_products;
        DROP TABLE IF EXISTS reviews;
        DROP TABLE IF EXISTS products;
        DROP TABLE IF EXISTS users;
    `);
    } catch (error) {
        throw error;
    }
}
async function createTables() {
    console.log("Starting to build tables...");
    try {
        await client.query(`
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL
        );
        CREATE TABLE products (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL,
            description TEXT NOT NULL,
            "price" INTEGER NOT NULL,
            "creatorId" INTEGER REFERENCES users(id)
        );
        CREATE TABLE reviews (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            "stars" INTEGER,
            description TEXT NOT NULL,
            "productsId" INTEGER REFERENCES products(id)
        );
        CREATE TABLE user_products(
            "users_id" INTEGER REFERENCES users(id),
            "products_id" INTEGER REFERENCES products(id),
            UNIQUE("users_id", "products_id")
        );
        CREATE TABLE products_reviews(
            "reviews_id" INTEGER REFERENCES reviews(id),
            "products_id" INTEGER REFERENCES products(id),
            UNIQUE("reviews_id", "products_id")
        );
       `);
    } catch (error) {
        throw error;
    }
}
async function createInitialUsers() {
    console.log('Starting to create users...');
    try {
        const usersToCreate = [
            { username: 'albert', password: 'bertie99' },
            { username: 'sandra', password: 'sandra123' },
            { username: 'glamgal', password: 'glamgal123' },
        ]
        const users = await Promise.all(usersToCreate.map(createUser));
        console.log('Users created:');
        console.log(users);
        console.log('Finished creating users!');
    } catch (error) {
        console.error('Error creating users!');
        throw error;
    }
}
async function createInitialProducts() {
    console.log('Starting to create products...');
    try {
        const productsToCreate = [
            {
                name: 'Nike Sweatshirt',
                description: 'Red Nike Sweatshirt',
                creatorId: 1,
                price: 50,
                reviews: [{   
                    title: 'Best Sweatshirt',
                    stars: 5,
                    description: 'Dope Red Sweatshirt',
                    productId: 1,
                }, 
                {   
                    title: 'Worst Sweatshirt',
                    stars: 0,
                    description: 'terrible Red Sweatshirt',
                    productId: 1,
                }
            ],
            },
            {
                name: 'Adidas Pants',
                description: 'Blue Adidas Pants',
                creatorId: 2,
                price: 35,
                reviews: [{
                    title: 'Best Pants',
                    stars: 4,
                    description: 'Best Pants Ever',
                    productId: 2,
                }],
            },
            {
                name: 'Nike Shoes',
                description: 'Air Jordans',
                creatorId: 3,
                price: 100,
                reviews: []
            }
        ]
        const products = await Promise.all(productsToCreate.map(product => createProducts({
            name: product.name,
            description: product.description,
            creatorId: product.creatorId,
            price: product.price,
            reviews: product.reviews,
        })));
        console.log('Products created:');
        console.log(products);
        console.log('Finished creating products!');
    } catch (error) {
        throw error
    }
}

// async function createMoreReviews() {
//     const reviewToAdd = {
//         title: 'Love this product',
//         stars: 5,
//         description: 'good stuff',
//         productId: 1
//     }
//     console.log("LLL", reviewToAdd.title)
//     const addedReview = await createAdditionalReview({
//         title: reviewToAdd.title,
//         stars: reviewToAdd.stars,
//         description: reviewToAdd.description,
//         productId: reviewToAdd.productId,
//     });
//     console.log(addedReview);
// }


async function rebuildDB() {
    try {
        client.connect();
        await dropTables();
        await createTables();
        await createInitialUsers();
        await createInitialProducts();
        // await createMoreReviews();
    } catch (error) {
        console.log('Error during rebuildDB')
        throw error;
    }
}
module.exports = {
    rebuildDB
};