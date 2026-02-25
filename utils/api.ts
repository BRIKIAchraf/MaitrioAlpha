import { apiRequest as baseApiRequest } from "@/lib/query-client";

/**
 * Standardized API request utility to match the signature used in many components:
 * apiRequest(route, { method, body })
 */
export async function apiRequest(
    route: string,
    options: { method?: string; body?: any } = {}
): Promise<Response> {
    const { method = "GET", body } = options;
    return baseApiRequest(method, route, body);
}
