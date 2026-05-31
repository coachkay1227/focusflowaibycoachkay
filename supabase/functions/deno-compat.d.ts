declare module "https://deno.land/*";
declare module "https://esm.sh/*";
declare module "npm:*";

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(
    handler: (req: Request) => Response | Promise<Response>
  ): void;
};
