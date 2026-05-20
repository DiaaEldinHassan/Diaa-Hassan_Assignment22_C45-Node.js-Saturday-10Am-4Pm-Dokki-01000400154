import { OAuth2Client } from 'google-auth-library';
import { env } from '../../config';

const client = new OAuth2Client(env.google_client_id);

export const verifyGoogleToken = async (
  token: string,
): Promise<{
  email: string;
  username: string;
  profilePicture?: string;
} | null> => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: env.google_client_id,
    });
    const payload = ticket.getPayload();
    if (!payload) return null;
    return {
      email: payload.email!,
      username: payload.name || payload.email!.split('@')[0],
      profilePicture: payload.picture,
    };
  } catch {
    return null;
  }
};
