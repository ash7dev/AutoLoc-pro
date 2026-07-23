import 'package:dio/dio.dart';

import '../dto/auth_user_dto.dart';

/// Auth Remote DataSource
///
/// Gère les appels API pour l'authentification.
abstract class AuthRemoteDataSource {
  Future<bool> checkAvailability({
    String? email,
    String? phone,
  });

  Future<AuthUserDto> getProfile();

  Future<bool> logout();

  Future<AuthUserDto> loginWithSupabase({
    required String accessToken,
  });

  Future<AuthUserDto> refreshToken({
    required String refreshToken,
  });

  Future<AuthUserDto> completeProfile({
    required String prenom,
    required String nom,
    DateTime? dateNaissance,
    String? telephone,
  });

  Future<AuthUserDto> switchRole({
    required String role,
  });

  Future<int> sendPhoneOtp();

  Future<AuthUserDto> updatePhone({
    required String telephone,
  });

  Future<AuthUserDto> verifyPhoneOtp({
    required String code,
  });

  Future<int> sendPhoneLoginOtp({
    required String phone,
  });

  Future<AuthUserDto> verifyPhoneLoginOtp({
    required String phone,
    required String code,
  });
}

/// Implémentation de AuthRemoteDataSource
class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final Dio _dio;

  AuthRemoteDataSourceImpl(this._dio);

  @override
  Future<bool> checkAvailability({
    String? email,
    String? phone,
  }) async {
    final queryParams = <String, dynamic>{
      if (email != null) 'email': email,
      if (phone != null) 'phone': phone,
    };

    final response = await _dio.get(
      '/auth/check-availability',
      queryParameters: queryParams,
    );

    return response.data['available'] ?? false;
  }

  @override
  Future<AuthUserDto> getProfile() async {
    final response = await _dio.get('/auth/me');
    return AuthUserDto.fromJson(response.data);
  }

  @override
  Future<bool> logout() async {
    await _dio.post('/auth/logout');
    return true;
  }

  @override
  Future<AuthUserDto> loginWithSupabase({
    required String accessToken,
  }) async {
    final response = await _dio.post(
      '/auth/login',
      data: {'accessToken': accessToken},
    );
    final profileData = response.data['profile'] as Map<String, dynamic>;
    profileData['accessToken'] = response.data['accessToken'];
    profileData['refreshToken'] = response.data['refreshToken'];
    return AuthUserDto.fromJson(profileData);
  }

  @override
  Future<AuthUserDto> refreshToken({
    required String refreshToken,
  }) async {
    final response = await _dio.post(
      '/auth/refresh',
      data: {'refreshToken': refreshToken},
    );
    final profileData = response.data['profile'] as Map<String, dynamic>;
    profileData['accessToken'] = response.data['accessToken'];
    profileData['refreshToken'] = response.data['refreshToken'];
    return AuthUserDto.fromJson(profileData);
  }

  @override
  Future<AuthUserDto> completeProfile({
    required String prenom,
    required String nom,
    DateTime? dateNaissance,
    String? telephone,
  }) async {
    final response = await _dio.post(
      '/auth/complete-profile',
      data: {
        'prenom': prenom,
        'nom': nom,
        if (dateNaissance != null) 'dateNaissance': dateNaissance.toIso8601String(),
        if (telephone != null) 'telephone': telephone,
      },
    );
    return AuthUserDto.fromJson(response.data);
  }

  @override
  Future<AuthUserDto> switchRole({
    required String role,
  }) async {
    final response = await _dio.patch(
      '/auth/switch-role',
      data: {'role': role},
    );
    final profileData = response.data['profile'] as Map<String, dynamic>;
    profileData['accessToken'] = response.data['accessToken'];
    profileData['refreshToken'] = response.data['refreshToken'];
    return AuthUserDto.fromJson(profileData);
  }

  @override
  Future<int> sendPhoneOtp() async {
    final response = await _dio.post('/auth/phone/send-otp');
    return response.data['expiresIn'] ?? 300;
  }

  @override
  Future<AuthUserDto> updatePhone({
    required String telephone,
  }) async {
    final response = await _dio.post(
      '/auth/phone/update',
      data: {'telephone': telephone},
    );
    return AuthUserDto.fromJson(response.data);
  }

  @override
  Future<AuthUserDto> verifyPhoneOtp({
    required String code,
  }) async {
    final response = await _dio.post(
      '/auth/phone/verify-otp',
      data: {'code': code},
    );
    return AuthUserDto.fromJson(response.data);
  }

  @override
  Future<int> sendPhoneLoginOtp({
    required String phone,
  }) async {
    final response = await _dio.post(
      '/auth/phone-login/send-otp',
      data: {'phone': phone},
    );
    return response.data['expiresIn'] ?? 300;
  }

  @override
  Future<AuthUserDto> verifyPhoneLoginOtp({
    required String phone,
    required String code,
  }) async {
    final response = await _dio.post(
      '/auth/phone-login/verify-otp',
      data: {'phone': phone, 'code': code},
    );
    // Le backend retourne { accessToken, refreshToken, activeRole, profile }
    // On injecte les tokens dans le profile DTO
    final profileData = response.data['profile'] as Map<String, dynamic>;
    profileData['accessToken'] = response.data['accessToken'];
    profileData['refreshToken'] = response.data['refreshToken'];
    return AuthUserDto.fromJson(profileData);
  }
}
