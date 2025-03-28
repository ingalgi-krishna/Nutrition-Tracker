// src/lib/clientCookies.ts
export const TOKEN_NAME = 'nutritrack_auth_token';

export function getClientAuthToken(): string | null {
    if (typeof document === 'undefined') return null;

    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith(`${TOKEN_NAME}=`));

    if (tokenCookie) {
        return tokenCookie.split('=')[1];
    }
    return null;
}