import "dotenv/config";

const envConfig = {
  PORT: process.env.PORT || 3000,

  DATABASE_URL: process.env.DATABASE_URL,

  REFRESH_TOKEN: process.env.REFRESH_TOKEN || "your_refresh_token_secret",
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",

  ACCESS_TOKEN: process.env.ACCESS_TOKEN || "your_access_token_secret",
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
};

export default envConfig;
