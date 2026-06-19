import 'package:supabase_flutter/supabase_flutter.dart';

enum PasswordRecoveryChannel { phone, email }

class PasswordRecoveryRequest {
  const PasswordRecoveryRequest({
    required this.channel,
    required this.contact,
    required this.isLive,
  });

  final PasswordRecoveryChannel channel;
  final String contact;
  final bool isLive;
}

abstract class PasswordRecoveryService {
  Future<PasswordRecoveryRequest> sendCode({
    required PasswordRecoveryChannel channel,
    required String contact,
  });

  Future<void> verifyCode({
    required PasswordRecoveryRequest request,
    required String code,
  });

  Future<void> updatePassword({
    required PasswordRecoveryRequest request,
    required String password,
  });
}

class SupabasePasswordRecoveryService implements PasswordRecoveryService {
  const SupabasePasswordRecoveryService();

  @override
  Future<PasswordRecoveryRequest> sendCode({
    required PasswordRecoveryChannel channel,
    required String contact,
  }) async {
    final normalized = _normalizeContact(channel, contact);
    final client = _tryClient();
    if (client == null) {
      return PasswordRecoveryRequest(
        channel: channel,
        contact: normalized,
        isLive: false,
      );
    }

    if (channel == PasswordRecoveryChannel.phone) {
      await client.auth.signInWithOtp(
        phone: normalized,
        shouldCreateUser: false,
      );
    } else {
      await client.auth.resetPasswordForEmail(normalized);
    }

    return PasswordRecoveryRequest(
      channel: channel,
      contact: normalized,
      isLive: true,
    );
  }

  @override
  Future<void> verifyCode({
    required PasswordRecoveryRequest request,
    required String code,
  }) async {
    final token = code.trim();
    if (token.length != 6) {
      throw const PasswordRecoveryException('6 haneli kodu girin.');
    }
    if (!request.isLive) {
      return;
    }

    final client = _requireClient();
    if (request.channel == PasswordRecoveryChannel.phone) {
      await client.auth.verifyOTP(
        phone: request.contact,
        token: token,
        type: OtpType.sms,
      );
    } else {
      await client.auth.verifyOTP(
        email: request.contact,
        token: token,
        type: OtpType.recovery,
      );
    }
  }

  @override
  Future<void> updatePassword({
    required PasswordRecoveryRequest request,
    required String password,
  }) async {
    if (!request.isLive) {
      return;
    }
    await _requireClient().auth.updateUser(
          UserAttributes(password: password),
        );
  }

  SupabaseClient? _tryClient() {
    try {
      return Supabase.instance.client;
    } catch (_) {
      return null;
    }
  }

  SupabaseClient _requireClient() {
    final client = _tryClient();
    if (client == null) {
      throw const PasswordRecoveryException(
        'Canli dogrulama baglantisi hazir degil.',
      );
    }
    return client;
  }

  String _normalizeContact(PasswordRecoveryChannel channel, String contact) {
    final trimmed = contact.trim();
    if (channel == PasswordRecoveryChannel.email) {
      return trimmed.toLowerCase();
    }

    final digits = trimmed.replaceAll(RegExp(r'[^0-9+]'), '');
    if (digits.startsWith('+')) {
      return digits;
    }
    if (digits.startsWith('90')) {
      return '+$digits';
    }
    if (digits.startsWith('0')) {
      return '+90${digits.substring(1)}';
    }
    return '+90$digits';
  }
}

class PasswordRecoveryException implements Exception {
  const PasswordRecoveryException(this.message);

  final String message;

  @override
  String toString() => message;
}
