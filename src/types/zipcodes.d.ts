declare module "zipcodes" {
  export interface ZipCodeDetails {
    zip: string;
    latitude: number;
    longitude: number;
    city: string;
    state: string;
    country: string;
  }

  export function lookup(zip: string): ZipCodeDetails | undefined;
  export function distance(zipA: string, zipB: string): number;
}
