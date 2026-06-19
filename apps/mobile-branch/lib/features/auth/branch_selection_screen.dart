import 'package:flutter/material.dart';

import '../../core/navigation/app_routes.dart';
import '../../core/theme/app_colors.dart';
import 'auth_widgets.dart';

class BranchSelectionScreen extends StatefulWidget {
  const BranchSelectionScreen({super.key});

  @override
  State<BranchSelectionScreen> createState() => _BranchSelectionScreenState();
}

class _BranchSelectionScreenState extends State<BranchSelectionScreen> {
  int _selectedIndex = 0;
  bool _setDefault = true;

  static const _branches = [
    ('Bursa Küçük Sanayi', 'Nilüfer operasyon şubesi'),
    ('İstanbul Avrupa Yakası', 'Yetkili ekspertiz noktası'),
    ('İzmir Şube', 'Bornova servis kabul alanı'),
    ('Ankara Şube', 'Ostim operasyon merkezi'),
  ];

  @override
  Widget build(BuildContext context) {
    return AuthShell(
      showHero: false,
      title: 'Çalışacağınız Şubeyi Seçin',
      subtitle: 'Lütfen çalışmak istediğiniz şubeyi seçiniz.',
      children: [
        AuthCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              for (var index = 0; index < _branches.length; index++) ...[
                BranchCard(
                  title: _branches[index].$1,
                  subtitle: _branches[index].$2,
                  selected: _selectedIndex == index,
                  onTap: () => setState(() => _selectedIndex = index),
                ),
                if (index != _branches.length - 1) const SizedBox(height: 10),
              ],
              const SizedBox(height: 14),
              Material(
                color: Colors.transparent,
                child: SwitchListTile.adaptive(
                  value: _setDefault,
                  activeThumbColor: AppColors.brandRed,
                  contentPadding: EdgeInsets.zero,
                  title: const Text(
                    'Varsayılan şube seç',
                    style: TextStyle(
                      color: AppColors.darkText,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  subtitle:
                      const Text('Sonraki girişlerde bu şube öne alınır.'),
                  onChanged: (value) => setState(() => _setDefault = value),
                ),
              ),
              const SizedBox(height: 14),
              AuthPrimaryButton(
                tapKey: const ValueKey('auth-branch-continue'),
                label: 'Devam Et',
                onPressed: () {
                  Navigator.pushReplacementNamed(context, AppRoutes.dashboard);
                },
              ),
            ],
          ),
        ),
      ],
    );
  }
}
