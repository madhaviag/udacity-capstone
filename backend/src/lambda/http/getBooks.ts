import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { getBooks } from '../../businessLogic/books'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

const logger = createLogger('getBooks')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing getBooks event', { event })

  const userId = getUserId(event)

  const items = await getBooks(userId)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true  
    },
    body: JSON.stringify({
      items
    })
  }
}
