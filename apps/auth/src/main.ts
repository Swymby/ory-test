/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'

import { AppModule } from './app/app.module'

import * as cookieParser from 'cookie-parser'
import * as csurf from 'csurf'
import * as bodyParser from 'body-parser'

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule)
    const globalPrefix = ''
    app.setGlobalPrefix(globalPrefix)

    app.useStaticAssets(join(__dirname, 'assets', 'public'))
    app.setBaseViewsDir(join(__dirname, 'assets', 'views'))
    app.setViewEngine('hbs')

    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(cookieParser())
    app.use(csurf({ cookie: true }))

    const port = process.env.PORT || 3300
    await app.listen(port, () => {
        Logger.log('Listening at http://localhost:' + port + '/' + globalPrefix)
    })
}

bootstrap()
