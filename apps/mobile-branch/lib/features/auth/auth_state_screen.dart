import 'package:flutter/material.dart';

import '../../core/navigation/app_routes.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import 'auth_widgets.dart';

enum AuthStateKind {
  invalidPassword,
  noInternet,
  sessionExpired,
  unauthorized,
  offlineLoginBlocked,
}

class AuthStateScreen extends StatelessWidget {
  const AuthStateScreen({
    super.key,
    required this.kind,
  });

  final AuthStateKind kind;

  @override
  Widget build(BuildContext context) {
    final content = _contentFor(kind);
    return AuthShell(
      showHero: false,
      centerContent: true,
      children: [
        AuthCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(
                width: 74,
                height: 74,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: content.color.withValues(alpha: 0.10),
                  shape: BoxShape.circle,
                ),
                child: Icon(content.icon, color: content.color, size: 38),
              ),
              const SizedBox(height: 18),
              Text(
                content.title,
                textAlign: TextAlign.center,
                style: AppTextStyles.title,
              ),
              const SizedBox(height: 10),
              Text(
                content.description,
                textAlign: TextAlign.center,
                style: AppTextStyles.muted.copyWith(fontSize: 14),
              ),
              const SizedBox(height: 22),
              AuthPrimaryButton(
                label: content.primaryLabel,
                icon: content.primaryIcon,
                onPressed: () => _handlePrimary(context, kind),
              ),
              if (content.secondaryLabel != null) ...[
                const SizedBox(height: 10),
                AuthSecondaryButton(
                  label: content.secondaryLabel!,
                  icon: Icons.arrow_back,
                  onPressed: () {
                    Navigator.pushNamedAndRemoveUntil(
                      context,
                      AppRoutes.login,
                      (_) => false,
                    );
                  },
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }

  void _handlePrimary(BuildContext context, AuthStateKind kind) {
    switch (kind) {
      case AuthStateKind.invalidPassword:
        Navigator.pop(context);
        return;
      case AuthStateKind.noInternet:
      case AuthStateKind.offlineLoginBlocked:
      case AuthStateKind.sessionExpired:
        Navigator.pushNamedAndRemoveUntil(
            context, AppRoutes.login, (_) => false);
        return;
      case AuthStateKind.unauthorized:
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content:
                Text('Teknik destek talebi bayi yöneticisine iletilmelidir.'),
          ),
        );
        return;
    }
  }

  _AuthStateContent _contentFor(AuthStateKind kind) {
    switch (kind) {
      case AuthStateKind.invalidPassword:
        return const _AuthStateContent(
          icon: Icons.lock_person_outlined,
          color: AppColors.brandRed,
          title: 'Hatalı Şifre',
          description:
              'Girdiğiniz şifre hatalı. Lütfen tekrar deneyin veya şifre sıfırlama adımına geçin.',
          primaryLabel: 'Tekrar Dene',
          primaryIcon: Icons.refresh,
          secondaryLabel: 'Giriş ekranına dön',
        );
      case AuthStateKind.noInternet:
        return const _AuthStateContent(
          icon: Icons.wifi_off_outlined,
          color: AppColors.warning,
          title: 'İnternet Bağlantısı Yok',
          description:
              'Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.',
          primaryLabel: 'Tekrar Dene',
          primaryIcon: Icons.refresh,
          secondaryLabel: 'Giriş ekranına dön',
        );
      case AuthStateKind.sessionExpired:
        return const _AuthStateContent(
          icon: Icons.timer_off_outlined,
          color: AppColors.info,
          title: 'Oturum Süresi Doldu',
          description:
              'Güvenliğiniz için oturumunuz sonlandırıldı. Lütfen tekrar giriş yapın.',
          primaryLabel: 'Tekrar Giriş Yap',
          primaryIcon: Icons.login,
        );
      case AuthStateKind.unauthorized:
        return const _AuthStateContent(
          icon: Icons.admin_panel_settings_outlined,
          color: AppColors.brandRed,
          title: 'Erişim Yetkiniz Bulunmuyor',
          description:
              'Bu hesaba erişim yetkiniz bulunmamaktadır. Lütfen bayi yöneticiniz ile iletişime geçin.',
          primaryLabel: 'Teknik Destek',
          primaryIcon: Icons.support_agent_outlined,
          secondaryLabel: 'Giriş ekranına dön',
        );
      case AuthStateKind.offlineLoginBlocked:
        return const _AuthStateContent(
          icon: Icons.cloud_off_outlined,
          color: AppColors.graphite,
          title: 'Offline Giriş Mümkün Değil',
          description:
              'Güvenlik gereği uygulamayı kullanmak için internet bağlantısı gereklidir.',
          primaryLabel: 'Tekrar Dene',
          primaryIcon: Icons.refresh,
          secondaryLabel: 'Giriş ekranına dön',
        );
    }
  }
}

class _AuthStateContent {
  const _AuthStateContent({
    required this.icon,
    required this.color,
    required this.title,
    required this.description,
    required this.primaryLabel,
    required this.primaryIcon,
    this.secondaryLabel,
  });

  final IconData icon;
  final Color color;
  final String title;
  final String description;
  final String primaryLabel;
  final IconData primaryIcon;
  final String? secondaryLabel;
}
