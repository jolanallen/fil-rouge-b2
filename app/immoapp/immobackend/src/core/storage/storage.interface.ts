export const STORAGE_SERVICE = 'STORAGE_SERVICE'

export interface UploadedFile {
  buffer: Buffer
  originalname: string
  mimetype: string
  size: number
}

export interface IStorageService {
  upload(file: UploadedFile, subPath: string): Promise<string>
  delete(path: string): Promise<void>
}
