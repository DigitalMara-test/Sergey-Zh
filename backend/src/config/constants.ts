export const PORT = process.env.PORT || 3000;

export function getRandomPostUrl(): string {
  const randomId = Math.floor(Math.random() * 100) + 1;
  return `https://jsonplaceholder.typicode.com/posts/${randomId}`;
}
