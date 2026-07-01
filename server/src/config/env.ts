import dotenv from 'dotenv';

// find the .env file in the root directory of the project and load the environment variables
dotenv.config();


if(!process.env.PORT) {
  throw new Error('PORT is not defined in the environment variables');
}

// export the environment variables as a single object
export const env = {
    PORT: Number(process.env.PORT),
}