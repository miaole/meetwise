import { CanActivate, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  assertPublicPreviewControlledWriteAllowed,
  PublicPreviewWriteUnavailableError,
} from './public-preview';

/**
 * Non-preview must 404 before body validation so /answers is not a
 * production write contract. Preview=1 continues to the Zod pipe.
 */
@Injectable()
export class PublicPreviewControlledWriteGuard implements CanActivate {
  canActivate(): boolean {
    try {
      assertPublicPreviewControlledWriteAllowed();
      return true;
    } catch (error) {
      if (error instanceof PublicPreviewWriteUnavailableError) {
        throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);
      }
      throw error;
    }
  }
}
