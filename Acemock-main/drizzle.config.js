/** @type {import ('drizzle-kit').Config} */
export default {
    schema: "./utils/schema.js",
    dialect: "postgresql",
    dbCredentials: {
      url: "postgresql://neondb_owner:npg_nGPJAwm7yxq0@ep-old-shape-a8vrq4rc-pooler.eastus2.azure.neon.tech/acemock?sslmode=require",
    },
  };
  