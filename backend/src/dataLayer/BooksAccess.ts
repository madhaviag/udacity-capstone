import 'source-map-support/register'

import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { BookItem } from '../models/BookItem'
import { BookUpdate } from '../models/BookUpdate'
import { createLogger } from '../utils/logger'

const logger = createLogger('booksAccess')
const AWSXRay = require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS)

export class BooksAccess {

  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly S3 = new XAWS.S3({signatureVersion: 'v4'}),
    private readonly booksTable = process.env.BOOKS_TABLE,
    private readonly booksByUserIndex = process.env.BOOKS_BY_USER_INDEX,
    private readonly bucket = process.env.ATTACHMENTS_S3_BUCKET
    
  ) { }

  async bookItemExists(bookId: string): Promise<boolean> {
    const item = await this.getBookItem(bookId)
    return !!item
  }

  async getBookItems(userId: string): Promise<BookItem[]> {
    logger.info(`Getting all books for user ${userId} from ${this.booksTable}`)

    const result = await this.docClient.query({
      TableName: this.booksTable,
      IndexName: this.booksByUserIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()

    const items = result.Items

    logger.info(`Found ${items.length} books for user ${userId} in ${this.booksTable}`)

    return items as BookItem[]
  }

  async getBookItem(bookId: string): Promise<BookItem> {
    logger.info(`Getting book ${bookId} from ${this.booksTable}`)

    const result = await this.docClient.get({
      TableName: this.booksTable,
      Key: {
        bookId
      }
    }).promise()

    const item = result.Item

    return item as BookItem
  }

  async createBookItem(bookItem: BookItem) {
    logger.info(`Putting book ${bookItem.bookId} into ${this.booksTable}`)

    await this.docClient.put({
      TableName: this.booksTable,
      Item: bookItem,
    }).promise()
  }


  async updateBook(userId: string, bookId: string, bookUpdate: BookUpdate): Promise<Boolean> {
    let isSuccess = false
    logger.info(`Updating book item ${bookId} in ${this.booksTable}`)
    try {
      await this.docClient.update({
        TableName: this.booksTable,
        Key: {
          userId,
          bookId
        },
        UpdateExpression: 'set #title = :title, #dueDate = :dueDate, #read = :read',
        ExpressionAttributeNames: {
          "#title": "title",
          "#dueDate": "dueDate",
          "#read": "read"

        },
        ExpressionAttributeValues: {
          ":title": bookUpdate.title,
          ":dueDate": bookUpdate.dueDate,
          ":read": bookUpdate.read
        }
      }).promise()
      isSuccess = true
    } catch (e) {
      logger.error('Error occurred while updating Book.', {
        error: e,
        data: {
          userId,
          bookId,
          bookUpdate
        }
      })
    }
    return isSuccess

  }

  async deleteBook(userId: string, bookId: string): Promise<Boolean> {
    let success = false
    logger.info(`Deleting book item ${bookId} from ${this.booksTable}`)
    try {
      await this.docClient.delete({
        TableName: this.booksTable,
        Key: {
          userId,
          bookId
        }
      }).promise()
      success = true
    } catch (e) {
      logger.info('Error occurred while deleting book from database', { error: e })

    }
    return success
  }

  async generateUploadUrl(bookId: string, userId: string): Promise<string> {
    let attachmentUrl: string = 'https://' + process.env.ATTACHMENTS_S3_BUCKET + '.s3.amazonaws.com/' + bookId
    logger.info('INSIDE URL is:' , attachmentUrl);
    const uploadUrl = this.S3.getSignedUrl("putObject", {
      Bucket: this.bucket,
      Key: bookId,
      Expires: 300
  });
    await this.docClient.update({
      TableName: this.booksTable,
      Key: {
        userId,
        bookId
      },
      UpdateExpression: 'set attachmentUrl = :URL',
      ExpressionAttributeValues: {
        ":URL": uploadUrl.split("?")[0]
      },
      ReturnValues: "UPDATED_NEW"
    }).promise()
    return uploadUrl;
  }

}
