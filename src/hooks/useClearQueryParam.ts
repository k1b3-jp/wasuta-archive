import { useRouter } from "next/router";
import { useEffect } from "react";

export function useClearQueryParam(
  paramName: string,
  condition: boolean
): void {
  const router = useRouter();

  useEffect(() => {
    if (condition) {
      const currentUrl = new URL(window.location.href);
      if (currentUrl.searchParams.has(paramName)) {
        currentUrl.searchParams.delete(paramName);
        router.replace(currentUrl.toString(), undefined, { shallow: true });
      }
    }
  }, [condition, paramName, router]);
}
