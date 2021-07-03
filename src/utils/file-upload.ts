import { extname } from 'path';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as fs from 'fs';
import { DiskStorageOptions } from 'multer';
import path = require('path');

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

type imageCategories = 'user' | 'client'| 'frete'| 'upload' 
interface IUploadImage {
  imageData: string,
  categoryName: imageCategories,
  dirname: string,
}

interface IGetImageProperties {
  imageName: string,
  category: imageCategories,
  dirname: string,
}

export const UploadImage = async ({imageData, categoryName, dirname}:IUploadImage) => 
  new Promise(async (resolve, reject)=> {
    const imageName = `${dirname} - ${categoryName}-${new Date().toISOString().replace(/[:.-]/g,'')}.jpg`
    const base64Data = imageData.replace(/^data:image\/jpeg;base64,/, "").replace(/^data:image\/png;base64,/, "")
    const baseDirectory = `${process.cwd()}/uploads/${categoryName}`
    const fullDirectory = `${baseDirectory}/${dirname}`
    const createDirectoryIfNotExists = async () => new Promise((res, rej)=>
      {
        new Promise((r, j) => {
          if (!fs.existsSync(baseDirectory)){
            fs.mkdirSync(baseDirectory);
          }
          r(true)
        }).then(r1 => {
          if (!fs.existsSync(fullDirectory)){
            fs.mkdirSync(fullDirectory);
          }
          res(true)
      })
    }) 

    await createDirectoryIfNotExists()
    fs.writeFile(`${fullDirectory}/${imageName}`, base64Data, 'base64', (err)=>{
      if(err) {
        console.log(err)
        resolve(false)
      }
      else {resolve(imageName)}
    })
  }).then(r => r).catch(e => e)
  
// export const GetBase64ImageFromSystem = async (imageName:string, category:imageCategories)=>
export const GetBase64ImageFromSystem = async ({imageName, category, dirname}:IGetImageProperties)=>
  new Promise((resolve, reject)=>{
    const pathImage = !!dirname.length ? 
      `${process.cwd()}/uploads/${category}/${dirname}/${imageName}`: 
      `${process.cwd()}/uploads/${category}/${imageName}` 
    console.log(pathImage)
    fs.readFile(pathImage, (err, data)=>{
      console.log(data);
      //error handle
      if(err) resolve(String(err));
      if(data != undefined){
        //get image file extension name
        let extensionName = path.extname(pathImage);
        //convert image file to base64-encoded string
        let base64Image = Buffer.from(data).toString('base64');
        //combine all strings
        let imgSrcString = `data:image/${extensionName.split('.').pop()};base64,${base64Image}`;
        resolve(imgSrcString)
      }else{
        resolve("Arquivo não encontrado!")
      }
    })
  })