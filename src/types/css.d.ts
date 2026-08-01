// CSS ファイルの副作用インポートを TypeScript に認識させる
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}
