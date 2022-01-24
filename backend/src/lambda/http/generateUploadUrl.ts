import 'source-map-support/register'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { createLogger } from '../../utils/logger'
import { generateUploadUrl } from '../../businessLogic/books'
import { getUserId } from '../utils'

const logger = createLogger('generateUploadUrl')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const bookId = event.pathParameters.bookId
    const userId: string = getUserId(event)

    logger.info( `INSIDE generateUploadUrl`);
    // check for missing book id
    if (!bookId) {
      return {
        statusCode: 400,
        body: JSON.stringify({error: 'bookId was not provided'})
      }
    }

    const signedUrl = await generateUploadUrl(bookId, userId)

    logger.info(`Generated signed url for a Book`, {
      url: signedUrl,
      bookId: bookId
    })

    return {
      statusCode: 201,
      body: JSON.stringify({
        uploadUrl: signedUrl
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)