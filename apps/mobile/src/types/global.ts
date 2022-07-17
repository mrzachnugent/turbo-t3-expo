declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GITHUB_AUTH_TOKEN: string;
      GITHUB_ID: string;
      GITHUB_SECRET: string;
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      PORT?: string;
      BASE_URL: string;
      TEST_PATH: string;
      NEXTAUTH_SECRET: string;
    }
  }
}

export default {};
