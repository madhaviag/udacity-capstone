import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteBook } from '../../businessLogic/books'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const bookId = event.pathParameters.bookId
    const userId: string = getUserId(event)
    const success = await deleteBook(userId, bookId)

    if (!success) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Error occurred while deleting Book.'
        })
      }
    }
    return {
      statusCode: 204,
      body: JSON.stringify({
        message: "Book deleted successfully."
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )