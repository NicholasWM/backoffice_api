import { extname } from 'path';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as fs from 'fs';
import { DiskStorageOptions } from 'multer';

// Allow only images
export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(
      new HttpException(
        'Only image files are allowed!',
        HttpStatus.BAD_REQUEST,
      ),
      false,
    );
  }
  callback(null, true);
};

const editFileNameDefaultFunction = (req:any, file:any, callback:any, categoryName:string):any => {
  const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  const randomName = ()=> Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 10).toString(10))
    .join('');
  callback(null, `${categoryName}-${name}${randomName()}${randomName()}${fileExtName}`);  
};

export const editFileName = {
  'user': (req, file, callback):DiskStorageOptions => editFileNameDefaultFunction(req, file, callback, 'user'),
  'client': (req, file, callback):DiskStorageOptions => editFileNameDefaultFunction(req, file, callback, 'client'),
  'frete': (req, file, callback):DiskStorageOptions => editFileNameDefaultFunction(req, file, callback, 'frete'),
  'upload': (req, file, callback):DiskStorageOptions => editFileNameDefaultFunction(req, file, callback, 'upload'),
}

export const uploadImage = async (imageData: string, categoryName: string) => {
  const path = process.cwd()
  const imageName = `${categoryName}-${new Date().toISOString()}.jpg`
  const base64Data = imageData.replace(/^data:image\/jpeg;base64,/, "").replace(/^data:image\/png;base64,/, "")
      fs.writeFile(path + `/uploads/${categoryName}/${imageName}.jpg`, base64Data, 'base64', (err)=>{
      if(err) return null //this.logger.error(err)
      else {
          return true
      }
  })
}