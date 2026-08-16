// backend/src/modules/auth/auth.controller.ts
import {
  Controller,
  Post,
  Get,
  Res,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('guest')
  async guestLogin(@Res({ passthrough: true }) response: Response) {
    const { token, user, workspace } = await this.authService.createGuestSession();

    const isProd = this.configService.get<string>('NODE_ENV') === 'production';

    response.cookie(this.configService.get<string>('COOKIE_NAME')!, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { user, workspace };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() currentUser: JwtPayload) {
    const user = await this.authService.getCurrentUser(currentUser.sub);
    if (!user) throw new UnauthorizedException('Session user no longer exists');
    return { user };
  }

  @Post('logout')
  logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    response.clearCookie(this.configService.get<string>('COOKIE_NAME')!);
    return { success: true };
  }
}