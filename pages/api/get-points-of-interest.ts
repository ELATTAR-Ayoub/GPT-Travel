// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  pointsOfInterest: any,
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${OPENAI_API_KEY}`
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | string>
) {

  try {
    const { pointsOfInterestPrompt } = JSON.parse(req.body)
    const response2 = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'text-davinci-003',
        prompt: pointsOfInterestPrompt,
        temperature: 0,
        max_tokens: 300
      }),
      timeout: 15000
    } as any)

    let pointsOfInterest = await response2.json()

    pointsOfInterest = pointsOfInterest.choices[0].text.split('\n')
    pointsOfInterest = pointsOfInterest[pointsOfInterest.length - 1]
    pointsOfInterest = pointsOfInterest.split(',')
    const pointsOfInterestArray = pointsOfInterest.map((i:any) => i.trim())

    res.status(200).json({
      pointsOfInterest: JSON.stringify(pointsOfInterestArray)
    })
    
  } catch (error) {
    const errorAsError = error as Error;
    res.status(404).json(errorAsError.message);
  }
  
  
}