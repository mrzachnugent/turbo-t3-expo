import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from 'api';

const examples = async (req: NextApiRequest, res: NextApiResponse) => {
  const examples = await prisma.example.findMany();
  res.status(200).json(examples);
};

export default examples;
