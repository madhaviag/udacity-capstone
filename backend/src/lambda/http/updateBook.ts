import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { updateBook } from '../../businessLogic/books'
import { UpdateBookRequest } from '../../requests/UpdateBookRequest'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

const logger = createLogger('updateBook')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing updateBook event', { event })

  const userId = getUserId(event)
  const bookId = event.pathParameters.bookId
  const updatedBook: UpdateBookRequest = JSON.parse(event.body)

  const success = await updateBook(userId, bookId, updatedBook)
  if(!success){
    return{
      statusCode: 500,
      body: "Error occured while updating Book."
    }
  }

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true  
    },
    body: JSON.stringify({ msg: "Book has been updated", updated: updatedBook })
  }
}
