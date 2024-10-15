declare global {
    namespace NodeJS {
      interface ProcessEnv {
        DB_PASS: string;
      }
    }
  }
  
  export {};
  