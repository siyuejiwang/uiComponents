/**
 * ts Declaration
 */
declare module "*.module.less" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.less" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
declare module "*.png";
declare module "*.jpg";
declare module "*.gif";
declare module "*.jpeg";
declare module "*.svg";

declare const ENV: string;
declare const _doc_: boolean;
