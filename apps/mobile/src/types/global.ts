declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GITHUB_ID: string;
      GITHUB_SECRET: string;
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      SECURE_STORE_JWT_KEY: string;
      NEXT_API_URL: string;
      IP_LOCAL_FOR_DEVICE: string;
    }
  }
}

export default {};
