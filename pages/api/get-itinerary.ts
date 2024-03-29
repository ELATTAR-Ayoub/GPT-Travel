// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  message: string,
  pointsOfInterestPrompt: any,
  itinerary: any,
}

type Error = {
  message: string,
}

// const OPENAI_API_KEY = process.env.OPENAI_API_KEY


export default async function handler( req: NextApiRequest, res: NextApiResponse<Data | string> ) {
  let days = 4, city = 'Marrakech'
  let apiKey = '';
  
  if (req.body) {
    let body = JSON.parse(req.body)
    days = body.days
    city = body.city
    apiKey = body.apiKey
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey || process.env.OPENAI_API_KEY}`
  }

  const parts = city.split(' ')

  if (parts.length > 5) {
    throw new Error('please reduce size of request')
  }
  
  if (days > 10) {
    days = 10
  }

  let basePrompt = `what is an ideal itinerary for ${days} days in ${city}?`
  try {
    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'text-davinci-003',
        prompt: basePrompt,
        temperature: 0,
        max_tokens: 550,
      }),
      timeout: 20000
    } as any)
    /* console.log('basePrompt', basePrompt);
    console.log('response', response.text()); */
    
    const itineraryResponse = await response.text();
    const itinerary = JSON.parse(itineraryResponse.trim());
    const pointsOfInterestPrompt = 'Extract the points of interest out of this text, with no additional words, separated by commas: ' + itinerary.choices[0].text

    res.status(200).json({
      message: 'success',
      pointsOfInterestPrompt,
      itinerary: itinerary.choices[0].text
    })

  } catch (error) {
    const errorAsError = error as Error;
    res.status(404).json(errorAsError.message);
  }
}