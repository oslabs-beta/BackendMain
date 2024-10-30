declare global {
    namespace NodeJS {
      interface ProcessEnv {
        DB_PASS: string;
        SECRET: string;
      }
    }
  }
  
  export {};
  