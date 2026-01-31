declare module "badwords-ko" {
  export default class Filter {
    isProfane(text: string): boolean;
    clean(text: string): string;
  }
}
