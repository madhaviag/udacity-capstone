/**
 * Fields in a request to update a single Book item.
 */
export interface UpdateBookRequest {
  title: string
  dueDate: string
  read: boolean
}