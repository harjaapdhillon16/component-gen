import type { NextApiRequest, NextApiResponse } from "next"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: "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",
})

type ResponseData = {
  message: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const { input } = req.body
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content:
          "Act as a single page code generator in react (generate functional components only), only return the code that is generated and nothing else, return finished code only and don't return the code that user would need to modify in order to run, don't give any additional comments, also use tailwind css for styling, the default exported component should always be named App",
      },
      {
        role: "user",
        content: input,
      },
    ],
    temperature: 0,
    max_tokens: 6500,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  })
  res
    .status(200)
    .json({ message: `${response?.choices?.[0]?.message.content}` })
}
