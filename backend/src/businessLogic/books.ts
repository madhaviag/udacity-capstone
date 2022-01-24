import 'source-map-support/register'

import * as uuid from 'uuid'

import { BooksAccess } from '../dataLayer/BooksAccess'
import { BookItem } from '../models/BookItem'
import { CreateBookRequest } from '../requests/CreateBookRequest'
import { UpdateBookRequest } from '../requests/UpdateBookRequest'
import { createLogger } from '../utils/logger'


const logger = createLogger('books')

const booksAccess = new BooksAccess()


export async function getBooks(userId: string): Promise<BookItem[]> {
  logger.info(`Retrieving all books for user ${userId}`, { userId })

  return await booksAccess.getBookItems(userId)
}

export async function createBook(userId: string, createBookRequest: CreateBookRequest): Promise<BookItem> {
  const bookId = uuid.v4()

  const newItem: BookItem = {
    userId,
    bookId,
    createdAt: new Date().toISOString(),
    title: "1",
    read: false,
    attachmentUrl: null,
    ...createBookRequest
  }

  logger.info(`Creating book ${bookId} for user ${userId}`, { userId, bookId, bookItem: newItem })

  await booksAccess.createBookItem(newItem)

  return newItem
}

export async function updateBook(
  userId: string,
  bookId: string,
  updatedBook: UpdateBookRequest
): Promise<Boolean> {
  return booksAccess.updateBook(userId, bookId, updatedBook)
}

export async function deleteBook(userId: string, bookId: string): Promise<Boolean> {
  logger.info(`Deleting book ${bookId} for user `, { userId })

  return booksAccess.deleteBook(userId, bookId)
}

export async function generateUploadUrl(bookId: string, userId: string): Promise<string> {
  logger.info(`INSIDE books.ts `)
  return await booksAccess.generateUploadUrl(bookId, userId)
}
