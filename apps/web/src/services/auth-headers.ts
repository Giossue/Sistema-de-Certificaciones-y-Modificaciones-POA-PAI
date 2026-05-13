export function getAuthToken() {
  return localStorage.getItem("poa_token");
}

export function authHeaders() {
  const token = getAuthToken();
  return { Authorization: `Bearer ${token}` };
}
