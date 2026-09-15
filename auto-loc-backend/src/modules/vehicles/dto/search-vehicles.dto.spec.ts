import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { SearchVehiclesDto } from './search-vehicles.dto';
import { TypeVehicule, Carburant, Transmission } from '@prisma/client';

describe('SearchVehiclesDto validation & transformation', () => {
  it('should pass with empty query object', async () => {
    const dto = plainToInstance(SearchVehiclesDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should handle empty string inputs cleanly without 400 validation errors', async () => {
    const raw = {
      ville: '',
      dateDebut: '',
      dateFin: '',
      type: '',
      carburant: '',
      transmission: '',
      q: '',
    };
    const dto = plainToInstance(SearchVehiclesDto, raw);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should transform single string equipements to array', async () => {
    const raw = { equipements: 'GPS' };
    const dto = plainToInstance(SearchVehiclesDto, raw);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.equipements).toEqual(['GPS']);
  });

  it('should transform comma-separated equipements to array', async () => {
    const raw = { equipements: 'GPS, CLIMATISATION' };
    const dto = plainToInstance(SearchVehiclesDto, raw);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.equipements).toEqual(['GPS', 'CLIMATISATION']);
  });

  it('should transform enum strings case-insensitively and handle aliases', async () => {
    const raw = {
      type: 'suv',
      carburant: 'essence',
      transmission: 'automatique',
    };
    const dto = plainToInstance(SearchVehiclesDto, raw);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.type).toBe(TypeVehicule.SUV);
    expect(dto.carburant).toBe(Carburant.ESSENCE);
    expect(dto.transmission).toBe(Transmission.AUTOMATIQUE);
  });

  it('should handle non-whitelisted alias query params cleanly', async () => {
    const raw = {
      zone: 'Dakar',
      debut: '2026-03-20',
      fin: '2026-03-25',
      fuel: 'DIESEL',
      budgetMin: '10000',
      budgetMax: '50000',
    };
    const dto = plainToInstance(SearchVehiclesDto, raw);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
