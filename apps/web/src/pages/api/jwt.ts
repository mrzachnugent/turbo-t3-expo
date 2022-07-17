import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;
export const handleJWT = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = await getToken({ req, secret, raw: true });
  res.send({ token });
};

export default handleJWT;
