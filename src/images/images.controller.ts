import { Controller, Get, HttpStatus, Param, Post, Res, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ImagesService } from './images.service';
import {diskStorage} from 'multer'
import { editFileName, imageFileFilter } from 'src/utils/file-upload';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('images')
@Controller('images')
export class ImagesController {
  constructor(
    private imageService:ImagesService,
  ){}
 
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async uploadedFile(@UploadedFile() file) {
    const response = {
      originalname: file.originalname,
      filename: file.filename,
    };
    return {
      status: HttpStatus.OK,
      message: 'Image uploaded successfully!',
      data: response,
    };
  }

  @Post('uploadMultipleFiles')
  @UseInterceptors(
    FilesInterceptor('image', 10, {
      storage: diskStorage({
        destination: './uploads/user',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async uploadMultipleFiles(@UploadedFiles() files) {
    const response = [];
    files.forEach(file => {
      const fileReponse = {
        originalname: file.originalname,
        filename: file.filename,
      };
      response.push(fileReponse);
    });
    return {
      status: HttpStatus.OK,
      message: 'Images uploaded successfully!',
      data: response,
    };
  }

  @Get(':category/:imagename')
  async getImage(@Param('imagename') image, @Param('category') category, @Res() res) {
    const categoriesList = ['store', 'product', 'user']
    if(categoriesList.includes(category) && await this.imageService.imageExists(category, image)){
      const responseImage = res.sendFile(image, { root: `./uploads/${category}` });
      console.log('NoContent')
      return {
        status: HttpStatus.OK,
        data: responseImage
      }
    }
    console.log('NoContent')
    return res.status(204).send()
  }
}