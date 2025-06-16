export module JsonUtil {
  export function safeParse<T>(data: string): T | null {
    try {
      return JSON.parse(data) as T;
    } catch (error) {
      return null;
    }
  }
}
