import 'package:flutter/material.dart';

import '../../core/constants/app_sizes.dart';
import '../../core/navigation/app_routes.dart';
import '../../core/theme/app_colors.dart';

class LockedSectionWarningScreen extends StatelessWidget {
  const LockedSectionWarningScreen({
    super.key,
    required this.workOrderId,
    required this.taskId,
    required this.sectionName,
    required this.lockedBy,
    required this.lockedAt,
  });

  final String workOrderId;
  final String taskId;
  final String sectionName;
  final String lockedBy;
  final String lockedAt;

  @override
  Widget build(BuildContext context) {
    final cardDate = lockedAt.isEmpty ? 'Bilinmiyor' : lockedAt;
    return Scaffold(
      backgroundColor: const Color(0xFFFAFCFF),
      body: SafeArea(
        child: Stack(
          children: [
            ListView(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
              children: [
                Align(
                  alignment: Alignment.centerRight,
                  child: IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => _goBackToTasks(context),
                  ),
                ),
                const SizedBox(height: 4),
                const Center(
                  child: Text(
                    'OTOTR',
                    style: TextStyle(
                      color: AppColors.navy,
                      fontWeight: FontWeight.w900,
                      fontSize: 18,
                    ),
                  ),
                ),
              const SizedBox(height: 22),
                _headlineCard(cardDate: cardDate),
                const SizedBox(height: 16),
                _infoCard(),
                const SizedBox(height: 16),
                _actionCard(
                  context: context,
                  title: 'Görüntüle',
                  subtitle: 'Mevcut verileri incele',
                  onTap: () => Navigator.pushNamed(
                    context,
                    AppRoutes.technicianTaskForm,
                    arguments: {
                      'workOrderId': workOrderId,
                      'taskId': taskId,
                      'readOnly': true,
                    },
                  ),
                ),
                const SizedBox(height: 10),
                _actionCard(
                  context: context,
                  title: 'Müdür Devralma Talebi Gönder',
                  subtitle: 'Bu başlığı devralmak için talep oluştur',
                  onTap: () => Navigator.pushNamed(
                    context,
                    AppRoutes.managerTaskOwnershipRequest,
                    arguments: {
                      'workOrderId': workOrderId,
                      'taskId': taskId,
                      'sectionName': sectionName,
                      'lockedBy': lockedBy,
                      'lockedAt': lockedAt,
                    },
                  ),
                ),
                const SizedBox(height: 10),
                Container(
                  decoration: BoxDecoration(
                    border: Border.all(color: AppColors.red.withOpacity(.45)),
                    borderRadius: BorderRadius.circular(16),
                    color: AppColors.white,
                  ),
                  child: ListTile(
                    onTap: () => _goBackToTasks(context),
                    title: const Text(
                      'Geri Dön',
                      style: TextStyle(fontWeight: FontWeight.w700),
                    ),
                    subtitle: const Text('Başlıklara geri dön'),
                    trailing: const Icon(Icons.chevron_right),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _headlineCard({
    required String cardDate,
  }) {
    return _surface(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Icon(
              Icons.lock_person_rounded,
              size: 64,
              color: Colors.orange.shade700,
            ),
          ),
          const SizedBox(height: 12),
          const Text(
            'Bu başlık başka bir usta tarafından sahiplenilmiş.',
            style: TextStyle(fontWeight: FontWeight.w800, fontSize: 20),
          ),
          const SizedBox(height: 8),
          const Text(
            'Şu anda bu başlığı sadece görüntüleyebilirsin. Düzenleme yetkin bulunmuyor.',
            style: TextStyle(color: AppColors.grayText),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                sectionName,
                style: const TextStyle(fontWeight: FontWeight.w800),
              ),
              _pill('Kilitli'),
            ],
          ),
          const SizedBox(height: 12),
          Text('Sahiplenen Usta: $lockedBy'),
          Text('Sahiplenme Saati: $cardDate'),
        ],
      ),
    );
  }

  Widget _infoCard() {
    return _surface(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Ne yapabilirsin?',
            style: TextStyle(fontWeight: FontWeight.w800, fontSize: 17),
          ),
          const SizedBox(height: 8),
          const Text(
            'Mevcut verileri görüntüleyebilir veya müdür devralma talebi gönderebilirsin.',
            style: TextStyle(color: AppColors.grayText),
          ),
          const SizedBox(height: 10),
          const Text(
            'Bu başlıkla ilgili bir sorun düşünüyorsan müdür devralma talebi gönderebilirsin.',
            style: TextStyle(fontSize: 13),
          ),
        ],
      ),
    );
  }

  Widget _actionCard({
    required BuildContext context,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return _surface(
      child: ListTile(
        onTap: onTap,
        title: Text(title),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.chevron_right),
      ),
    );
  }

  Widget _pill(String text) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        color: AppColors.red.withOpacity(.12),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      child: Text(
        text,
        style: const TextStyle(color: AppColors.red, fontWeight: FontWeight.w800),
      ),
    );
  }

  Widget _surface({required Widget child}) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: const [
          BoxShadow(
            color: Color(0x14000000),
            blurRadius: 10,
            offset: Offset(0, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.all(AppSizes.md),
      child: child,
    );
  }

  void _goBackToTasks(BuildContext context) {
    Navigator.pushNamedAndRemoveUntil(
      context,
      AppRoutes.technicianTasks,
      (route) => false,
      arguments: workOrderId,
    );
  }
}
