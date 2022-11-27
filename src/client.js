import axios from "axios";

export async function sendWinner(endpoint, winner) {
  const requestUrl = `${endpoint}/${winner}`;
  await axios.post(requestUrl);
}
