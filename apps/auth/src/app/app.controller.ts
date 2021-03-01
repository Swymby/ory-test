import { Controller, Get, Res, Query, Req, Post, Body } from '@nestjs/common'
import { AdminApi } from '@ory/hydra-client'

import { AppService } from './app.service'
import { Response, Request } from 'express'

@Controller()
export class AppController {
    private hydraAdmin = new AdminApi(undefined, 'http://localhost:4445')

    constructor(private readonly appService: AppService) { }

    @Get('/login')
    async tryLogin(@Query() { login_challenge }: { login_challenge: string }, @Req() req: Request, @Res() res: Response) {
        const challenge = login_challenge

        const { data } = await this.hydraAdmin.getLoginRequest(challenge)
        if (data.skip) {
            const loginSkipResp = await this.hydraAdmin.acceptLoginRequest(challenge, { subject: data.subject })
            return res.redirect(loginSkipResp.data.redirect_to)
        }

        return res.render('index', { challenge, csrfToken: req.csrfToken(), message: 'Hello world!' })
    }

    @Post('/login')
    async login(@Body() { challenge, email, password, remember }: { challenge: string, email: string, password: string, remember: string },
                    @Req() req: Request, @Res() res: Response) {
        if (!(email === 'admin@admin.com' && password === 'admin')) {
            return res.render('index', { csrfToken: req.csrfToken(), challenge, error: 'The username / password combination is not correct' })
        }

        const { data } = await this.hydraAdmin.acceptLoginRequest(challenge, { subject: email, remember: !!remember, remember_for: 3600 })
        return res.redirect(data.redirect_to)
    }

    @Get('/consent')
    async acceptConsent(@Query() { consent_challenge }: { consent_challenge: string }, @Res() res: Response) {
        const { data } = await this.hydraAdmin.getConsentRequest(consent_challenge)
        const acceptResp = await this.hydraAdmin.acceptConsentRequest(consent_challenge, {
            grant_scope: data.requested_scope,
            grant_access_token_audience: data.requested_access_token_audience,
            session: {
                id_token: {
                    email: 'admin@admin.com'
                }
            }
        })

        return res.redirect(acceptResp.data.redirect_to)
    }
}
