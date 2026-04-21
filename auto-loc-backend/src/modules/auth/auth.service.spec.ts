import { BadRequestException, ForbiddenException } from '@nestjs/common';
jest.mock('file-type', () => ({
  fileTypeFromBuffer: jest.fn(),
}), { virtual: true });
jest.mock('../../infrastructure/jwt/jwks.service', () => ({
  JwksService: jest.fn(),
}));

import { AuthService } from './auth.service';

describe('AuthService', () => {
  const createService = () => {
    const prisma: any = {
      utilisateur: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      profile: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(async (callback: (tx: any) => unknown) => callback(prisma)),
    };

    const jwksService = { verify: jest.fn() };
    const jwtService = { signAsync: jest.fn(), verifyAsync: jest.fn() };
    const configService = { get: jest.fn() };
    const redisService = {
      get: jest.fn(),
      set: jest.fn(),
      setNX: jest.fn(),
      del: jest.fn(),
    };
    const cloudinary = {
      uploadKycDocument: jest.fn(),
      getUploadSignature: jest.fn(),
      deleteByPublicId: jest.fn(),
      uploadPermisDocument: jest.fn(),
    };
    const notification = { send: jest.fn().mockResolvedValue(undefined) };
    const telegram = { sendAdminAlert: jest.fn().mockResolvedValue(undefined) };

    const service = new AuthService(
      prisma as any,
      jwksService as any,
      jwtService as any,
      configService as any,
      redisService as any,
      cloudinary as any,
      notification as any,
      telegram as any,
    );

    return {
      service,
      prisma,
      redisService,
    };
  };

  it('marks email as unavailable when it already exists in profile projection', async () => {
    const { service, prisma } = createService();
    prisma.utilisateur.findFirst.mockResolvedValueOnce(null);
    prisma.profile.findFirst.mockResolvedValueOnce({ id: 'profile-1' });

    const result = await service.checkAvailability('Tester@AutoLoc.sn');

    expect(result).toEqual({
      available: false,
      message: 'Cet email est déjà associé à un compte',
    });
  });

  it('rejects phone verification when no OTP is stored', async () => {
    const { service, prisma, redisService } = createService();
    prisma.utilisateur.findUnique.mockResolvedValueOnce({ id: 'user-1' });
    redisService.get.mockResolvedValueOnce(null);

    await expect(
      service.verifyPhoneOtp({ sub: 'auth-user-1' }, '123456'),
    ).rejects.toThrow(new BadRequestException('Code expiré ou introuvable'));
  });

  it('blocks access when the business account is suspended', async () => {
    const { service, prisma } = createService();
    prisma.profile.findUnique.mockResolvedValueOnce({
      id: 'profile-1',
      userId: 'auth-user-1',
      email: 'tester@autoloc.sn',
      phone: '+221770000000',
      role: 'LOCATAIRE',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    prisma.utilisateur.findUnique.mockResolvedValueOnce({
      id: 'util-1',
      actif: false,
      phoneVerified: false,
      statutKyc: 'NON_VERIFIE',
      permisUrl: null,
      dateNaissance: null,
      bloqueJusqua: null,
      _count: { vehicules: 0 },
    });

    await expect(
      service.getOrCreateProfile({ sub: 'auth-user-1', email: 'tester@autoloc.sn' }),
    ).rejects.toThrow(new ForbiddenException('Votre compte est suspendu'));
  });
});
